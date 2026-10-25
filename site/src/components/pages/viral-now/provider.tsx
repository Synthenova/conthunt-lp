"use client";

/**
 * ViralNowProvider: the page's data, in one place.
 *
 * It starts from the first-paint payload (niche shells plus a few compact videos, see
 * src/lib/viral-now/wire.ts), so the first paint never waits on the network and the HTML stays
 * small. Once the browser is idle it does two independent things:
 *
 *   1. fetches the rest of the bundled snapshot from /viral-now/seed.json (one static file),
 *   2. asks the hosted API for live `viral-now-*` boards and, when some exist, swaps those
 *      niches in.
 *
 * Both are applied to the current state niche by niche, so neither can undo the other. A
 * failing or empty live source changes nothing and shows nothing. The status line, the facts
 * row and the rows all read from this context, so they stay consistent after a swap.
 *
 *   const { niches, board, seedStatus, ensureFull } = useViralNow();
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";
import { boardKind, type BoardState } from "@/lib/viral-now/copy";
import { PLATFORM_ORDER, type KnownPlatform } from "@/lib/viral-now/glyphs";
import { loadFullLiveNiche, loadLiveOverlay, loadLiveReplacements, metaOf } from "@/lib/viral-now/live";
import type { ViralNowInitial } from "@/lib/viral-now/load";
import { fetchSeedChunk } from "@/lib/viral-now/seed-chunk";
import { nichePlatforms, nicheSize } from "@/lib/viral-now/stats";
import type { ViralNowNiche } from "@/lib/viral-now/types";
import { hydrateNiches, mergeSeedChunk, needsSeedVideos } from "@/lib/viral-now/wire";

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
  const [niches, setNiches] = useState<ViralNowNiche[]>(() => hydrateNiches(initial.niches, initial.wire));
  const nichesRef = useRef(niches);
  // Written during render so a row effect in the same commit sees the niche that just
  // replaced the snapshot. An effect would run after that row and the full-board fetch
  // would still be looking at the snapshot.
  nichesRef.current = niches;
  const requested = useRef(new Set<string>());
  const seedRef = useRef<SeedStatus>("idle");
  const [seedStatus, setSeedStatus] = useState<SeedStatus>(() => (niches.some(needsSeedVideos) ? "idle" : "ready"));
  const [now] = useState(() => new Date().toISOString());
  const reducedMotion = usePrefersReducedMotion();

  const loadSeed = useCallback(() => {
    if (seedRef.current === "loading" || seedRef.current === "ready") return;
    seedRef.current = "loading";
    setSeedStatus("loading");
    fetchSeedChunk(initial.seedVersion)
      .then((chunk) => {
        seedRef.current = "ready";
        setNiches((current) => mergeSeedChunk(current, chunk));
        setSeedStatus("ready");
      })
      .catch(() => {
        seedRef.current = "error";
        setSeedStatus("error");
      });
  }, [initial.seedVersion]);

  // The rest of the snapshot, once the browser is idle.
  useEffect(() => {
    if (!nichesRef.current.some(needsSeedVideos)) return;
    const canIdle = typeof window.requestIdleCallback === "function";
    const handle = canIdle ? window.requestIdleCallback(loadSeed, { timeout: 1500 }) : window.setTimeout(loadSeed, 600);
    return () => {
      if (canIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [loadSeed]);

  // Live boards, once the browser is idle. Applied to whatever is on screen then.
  useEffect(() => {
    const controller = new AbortController();
    const run = () => {
      if (initial.niches.length === 0) {
        void loadLiveOverlay([], controller.signal).then((merged) => {
          if (merged && !controller.signal.aborted) setNiches(merged);
        });
        return;
      }
      void loadLiveReplacements(initial.niches.map(metaOf), controller.signal).then((replacements) => {
        if (!replacements || controller.signal.aborted) return;
        setNiches((current) => current.map((niche) => replacements.get(niche.slug) ?? niche));
      });
    };
    const canIdle = typeof window.requestIdleCallback === "function";
    const handle = canIdle ? window.requestIdleCallback(run, { timeout: 2500 }) : window.setTimeout(run, 1200);
    return () => {
      controller.abort();
      if (canIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [initial.niches]);

  const ensureFull = useCallback(
    (slug: string) => {
      const niche = nichesRef.current.find((n) => n.slug === slug);
      if (!niche) return;
      if (niche.source === "seed") {
        if (needsSeedVideos(niche)) loadSeed();
        return;
      }
      if (niche.source !== "live" || niche.videos.length >= Math.min(30, niche.video_count)) return;
      if (requested.current.has(slug)) return;
      requested.current.add(slug);
      void loadFullLiveNiche(niche).then((full) => {
        if (!full || full.videos.length <= niche.videos.length) return;
        setNiches((current) => current.map((n) => (n.slug === slug ? full : n)));
      });
    },
    [loadSeed],
  );

  const value = useMemo<ViralNowContextValue>(() => {
    const kind = boardKind(niches.map((n) => n.source));
    const live = niches.filter((n) => n.source === "live");
    const generatedAt =
      kind === "live" || kind === "mixed" ? (latest(live.map((n) => n.updated_at)) ?? initial.generatedAt) : kind === "trending" ? now : initial.generatedAt;
    const weekOf = latest(niches.map((n) => n.week_of)) ?? initial.weekOf;
    const present = new Set(niches.flatMap(nichePlatforms));
    return {
      niches,
      board: { kind, weekOf, at: generatedAt, niches: niches.length, liveNiches: live.length },
      generatedAt,
      weekOf,
      asOfFor: (niche) => (niche.source === "seed" ? initial.asOf : now),
      totalVideos: niches.reduce((total, n) => total + nicheSize(n), 0),
      platforms: PLATFORM_ORDER.filter((p) => present.has(p)),
      reducedMotion,
      seedStatus,
      retrySeed: loadSeed,
      ensureFull,
    };
  }, [niches, initial, now, ensureFull, loadSeed, reducedMotion, seedStatus]);

  return <ViralNowContext.Provider value={value}>{children}</ViralNowContext.Provider>;
}
