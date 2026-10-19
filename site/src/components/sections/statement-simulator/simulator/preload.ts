"use client";

/**
 * Poster and clip loading for the board (SIM-UI.md §3, §4).
 *
 *  - `loadPoster(url)` fetches and decodes a poster once per page (a shared cache), so a tile that
 *    mounts later paints it from memory.
 *  - `useRailReveal(urls, gated)`: a later rail shows skeleton tiles until EVERY poster has loaded
 *    or failed (or REVEAL_TIMEOUT_MS passed), then reveals whole. Posters already in the cache
 *    reveal at once, with no skeleton.
 *  - `warmClips(urls)`: low-priority prefetch of hover clips while the main thread is idle, only
 *    where a mouse can hover (`clipWarmAllowed`).
 *  - `claimPreview(stop)`: only one hover clip plays at a time across the simulator.
 */
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** A later rail reveals anyway after this long; missing posters keep the tile's neutral colour. */
export const REVEAL_TIMEOUT_MS = 4000;
/** Matches the crossfade in ./tile.module.css (`.skOut`). */
const REVEAL_FADE_MS = 260;

const posters = new Map<string, Promise<void>>();
const settled = new Set<string>();

/** Loads (and decodes) a poster once. Resolves on load or error, never rejects. */
export function loadPoster(url: string, priority: "high" | "low" | "auto" = "auto"): Promise<void> {
  let p = posters.get(url);
  if (!p) {
    p = new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.fetchPriority = priority;
      const done = () => {
        settled.add(url);
        resolve();
      };
      img.onload = () => void img.decode().then(done, done);
      img.onerror = done;
      img.src = url;
    });
    posters.set(url, p);
  }
  return p;
}

export function isPosterSettled(url: string): boolean {
  return settled.has(url);
}

/** Starts loading posters without waiting (the rest of the first two rails, other tabs). */
export function warmPosters(urls: Array<string | null | undefined>, priority: "high" | "low" | "auto" = "low"): void {
  for (const url of urls) if (url) void loadPoster(url, priority);
}

/**
 * Skeleton-until-complete for one rail. `urls` are the rail's posters (nulls are tiles without one).
 * `ready` is false while the rail should still show skeleton tiles; `revealing` is true for the one
 * crossfade right after it completes.
 */
export function useRailReveal(urls: Array<string | null | undefined>, gated: boolean): { ready: boolean; revealing: boolean } {
  const list = urls.filter((u): u is string => !!u);
  const key = list.join("|");
  const [done, setDone] = useState<string | null>(null);
  const [revealing, setRevealing] = useState<string | null>(null);
  const ready = !gated || list.length === 0 || done === key || list.every(isPosterSettled);

  useEffect(() => {
    if (ready) return;
    let live = true;
    const finish = () => {
      if (!live) return;
      live = false;
      window.clearTimeout(timer);
      setDone(key);
      setRevealing(key);
    };
    const timer = window.setTimeout(finish, REVEAL_TIMEOUT_MS);
    void Promise.all(key.split("|").map((u) => loadPoster(u))).then(finish);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [key, ready]);

  useEffect(() => {
    if (!revealing) return;
    const t = window.setTimeout(() => setRevealing(null), REVEAL_FADE_MS + 40);
    return () => window.clearTimeout(t);
  }, [revealing]);

  return { ready, revealing: ready && revealing === key };
}

// ------------------------------------------------------------------------------- hover clips

const warmed = new Set<string>();

/** Prefetches clips at the lowest priority (the HTTP cache keeps them for the hover). */
export function warmClips(urls: Array<string | null | undefined>): void {
  for (const url of urls) {
    if (!url || warmed.has(url)) continue;
    warmed.add(url);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    link.fetchPriority = "low";
    document.head.appendChild(link);
  }
}

/** Runs `cb` when the main thread is idle. Returns a cancel function. */
export function onIdle(cb: () => void, timeout = 3000): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 600);
  return () => clearTimeout(id);
}

/** No hover playback under reduced motion or Save-Data. */
export function hoverPlayAllowed(): boolean {
  if (prefersReducedMotion()) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !connection?.saveData;
}

/**
 * Clip warm-up also needs a primary pointer that hovers: touch never starts a clip, so a phone
 * would download the clips for nothing. (A tile still checks each pointer, see ./tile.tsx.)
 */
export function clipWarmAllowed(): boolean {
  return hoverPlayAllowed() && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

let stopActive: (() => void) | null = null;

/** Makes `stop`'s tile the one playing clip: the previous one stops first. */
export function claimPreview(stop: () => void): void {
  if (stopActive && stopActive !== stop) stopActive();
  stopActive = stop;
}

export function releasePreview(stop: () => void): void {
  if (stopActive === stop) stopActive = null;
}
