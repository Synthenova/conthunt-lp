"use client";

/**
 * ViralNowProvider: the page's data, in one place.
 *
 * It starts from niche shells with no videos, so every row shows its loading skeleton. As soon
 * as the page mounts it asks the hosted API for every live `viral-now-*` board and swaps those
 * videos into the same rows. The bundled snapshot is not shown. A failed request leaves the
 * skeletons' error state, and Try again asks for the live boards once more.
 *
 *   const { niches, board, seedStatus, ensureFull } = useViralNow();
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";
import { boardKind, type BoardState } from "@/lib/viral-now/copy";
import { PLATFORM_ORDER, type KnownPlatform } from "@/lib/viral-now/glyphs";
import { loadFullLiveNiche, loadLiveOverlay, loadLiveReplacements, metaOf } from "@/lib/viral-now/live";
import type { ViralNowInitial } from "@/lib/viral-now/load";
import { nichePlatforms, nicheSize } from "@/lib/viral-now/stats";
import type { ViralNowNiche } from "@/lib/viral-now/types";

/** Where the rest of the snapshot is: not asked for yet, on its way, here, or failed (retry is allowed). */
export type SeedStatus = "idle" | "loading" | "ready" | "error";

export interface ViralNowContextValue {
  niches: ViralNowNiche[];
  /** Which source the page shows right now, and the facts the status copy needs. */
  board: BoardState;
  generatedAt: string;
  weekOf: string | null;
  /** ISO timestamp for age and "per day" math of one niche's videos (the snapshot day for seed niches). */
  asOfFor: (niche: ViralNowNiche) => string;
  totalVideos: number;
  /** Platforms on the boards, in display order. */
  platforms: KnownPlatform[];
  /** `prefers-reduced-motion: reduce`, read once for the whole page. */
  reducedMotion: boolean;
  seedStatus: SeedStatus;
  /** Try the seed chunk again after a failure. */
  retrySeed: () => void;
  /** Make sure every video of a niche is loaded: the seed chunk for seed niches, the full board for live ones. */
  ensureFull: (slug: string) => void;
}

const ViralNowContext = createContext<ViralNowContextValue | null>(null);

export function useViralNow(): ViralNowContextValue {
  const value = useContext(ViralNowContext);
  if (!value) throw new Error("useViralNow must be used inside <ViralNowProvider>");
  return value;
}

const latest = (values: Array<string | null>): string | null =>
  values.filter((v): v is string => v !== null).sort().at(-1) ?? null;

export function ViralNowProvider({ initial, children }: { initial: ViralNowInitial; children: ReactNode }) {
  const [niches, setNiches] = useState<ViralNowNiche[]>(() => initial.niches);
  const nichesRef = useRef(niches);
  // Written during render so a row effect in the same commit sees the niche that just arrived.
  nichesRef.current = niches;
  const requested = useRef(new Set<string>());
  const [seedStatus, setSeedStatus] = useState<SeedStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [now] = useState(() => new Date().toISOString());
  const reducedMotion = usePrefersReducedMotion();

  const retrySeed = useCallback(() => {
    requested.current.clear();
    setSeedStatus("loading");
    setAttempt((current) => current + 1);
  }, []);

  // Every live board, as soon as the page is up. Skeletons stay until this resolves.
  useEffect(() => {
    const controller = new AbortController();
    const apply = (merged: ViralNowNiche[] | Map<string, ViralNowNiche> | null) => {
      if (controller.signal.aborted) return;
      if (!merged) {
        setSeedStatus("error");
        return;
      }
      if (merged instanceof Map) {
        setNiches((current) => current.map((niche) => merged.get(niche.slug) ?? niche));
      } else {
        setNiches(merged);
      }
      setSeedStatus("ready");
    };
    if (initial.niches.length === 0) {
      void loadLiveOverlay([], controller.signal).then(apply);
    } else {
      void loadLiveReplacements(initial.niches.map(metaOf), controller.signal).then(apply);
    }
    return () => controller.abort();
  }, [initial.niches, attempt]);

  const ensureFull = useCallback((slug: string) => {
    const niche = nichesRef.current.find((n) => n.slug === slug);
    if (!niche || niche.source !== "live" || niche.videos.length >= Math.min(30, niche.video_count)) return;
    if (requested.current.has(slug)) return;
    requested.current.add(slug);
    void loadFullLiveNiche(niche).then((full) => {
      if (!full || full.videos.length <= niche.videos.length) return;
      setNiches((current) => current.map((n) => (n.slug === slug ? full : n)));
    });
  }, []);

  const value = useMemo<ViralNowContextValue>(() => {
    const live = niches.filter((n) => n.source === "live");
    const arrived = niches.some((n) => n.videos.length > 0);
    const kind = arrived ? boardKind(niches.map((n) => n.source)) : "live";
    const generatedAt =
      kind === "live" || kind === "mixed" ? (latest(live.map((n) => n.updated_at)) ?? null) : kind === "trending" ? now : null;
    const weekOf = latest(niches.map((n) => n.week_of));
    const present = new Set(niches.flatMap(nichePlatforms));
    return {
      niches,
      board: { kind, weekOf, at: generatedAt, niches: niches.length, liveNiches: live.length },
      generatedAt: generatedAt ?? initial.generatedAt,
      weekOf,
      asOfFor: (niche) => (niche.source === "seed" ? initial.asOf : now),
      totalVideos: niches.reduce((total, n) => total + nicheSize(n), 0),
      platforms: PLATFORM_ORDER.filter((p) => present.has(p)),
      reducedMotion,
      seedStatus,
      retrySeed,
      ensureFull,
    };
  }, [niches, initial, now, ensureFull, retrySeed, reducedMotion, seedStatus]);

  return <ViralNowContext.Provider value={value}>{children}</ViralNowContext.Provider>;
}
