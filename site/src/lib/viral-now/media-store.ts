/**
 * Signed-URL renewal for live and trending media (client only).
 *
 * Seed files are local and never expire. Live posters and videos are signed R2 URLs that
 * last about an hour: on a media error (or just before playback when the URL is close to
 * expiry) one shared, rate-limited renewer asks the API for a fresh URL and every
 * component showing that asset updates through `useAssetUrl`.
 */
import { useCallback, useSyncExternalStore } from "react";
import { createMediaRenewer, isPlayable, needsRenewal } from "./api";
import type { ViralNowAsset, ViralNowVideo } from "./types";

type Kind = "poster" | "video";

const renewer = createMediaRenewer({ concurrency: 2, timeoutMs: 10_000 });
const overrides = new Map<string, ViralNowAsset>();
const attempted = new Set<string>();
const listeners = new Set<() => void>();

const keyOf = (video: ViralNowVideo, kind: Kind): string =>
  `${video.source}:${video.board_slug ?? ""}:${video[kind].asset_id ?? video.id}:${kind}`;

function emit(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** True for assets that can be renewed (signed R2 URLs). */
export const isRenewable = (asset: ViralNowAsset): boolean => asset.source === "r2" && asset.asset_id !== null;

async function renewOnce(video: ViralNowVideo, kind: Kind, force: boolean): Promise<string | null> {
  const key = keyOf(video, kind);
  const current = overrides.get(key) ?? video[kind];
  if (!isRenewable(current)) return current.url;
  if (!force && !needsRenewal(current)) return current.url;
  if (force) {
    // One forced renewal per URL: a renewal that returns the same URL must not loop.
    const stamp = `${key}|${current.url}`;
    if (attempted.has(stamp)) return current.url;
    attempted.add(stamp);
  }
  const result = await renewer.renew({ ...video, [kind]: current }, kind);
  if (result.status === "renewed") {
    overrides.set(key, result.asset);
    emit();
    return result.asset.url;
  }
  if (result.status === "revoked") {
    overrides.set(key, { ...current, url: null, expires_at: null, source: null });
    emit();
    return null;
  }
  return current.url;
}

/** The URL to render now, plus an `onError` handler that renews it once. */
export function useAssetUrl(video: ViralNowVideo, kind: Kind): { url: string | null; onError: () => void } {
  const key = keyOf(video, kind);
  const fallback = video[kind].url;
  const url = useSyncExternalStore(
    subscribe,
    () => (overrides.has(key) ? (overrides.get(key)?.url ?? null) : fallback),
    () => fallback,
  );
  const onError = useCallback(() => {
    void renewOnce(video, kind, true);
  }, [video, kind]);
  return { url, onError };
}

/**
 * After a playback error: one forced renewal per URL. Resolves to the new URL, or null when the
 * asset is not renewable, was revoked, or the API handed back the same URL (so callers stop retrying).
 */
export async function refreshVideoUrl(video: ViralNowVideo): Promise<string | null> {
  const key = keyOf(video, "video");
  const before = (overrides.get(key) ?? video.video).url;
  const after = await renewOnce(video, "video", true);
  return after && after !== before ? after : null;
}

/** A playable video URL, renewed first when it is about to expire. Null when nothing can play. */
export async function freshVideoUrl(video: ViralNowVideo): Promise<string | null> {
  const key = keyOf(video, "video");
  const asset = overrides.get(key) ?? video.video;
  if (!isPlayable(asset)) return null;
  return renewOnce(video, "video", false);
}
