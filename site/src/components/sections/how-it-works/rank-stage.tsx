"use client";

/**
 * Step 03 visual: watch, then re-rank.
 *
 *   Watch  a wall of real posters flows up through a fixed scan line (above the
 *          line = watched, below = queued). The counter ticks 0 → N videos and the
 *          clock runs to the scenario's run time (both illustrative).
 *   Rank   four picks light up on the wall, then Flip carries them into ranked rows
 *          with score bars and matched-question chips; the rest compress into a
 *          "+N more" stack; a cited answer card closes the step.
 *   Sort   "Score / Views" re-sorts the rows with Flip. Raw views pull a high-reach,
 *          low-fit video to the top, which is the point of ranking by your rubric.
 *          Rows that drop out fade first, survivors Flip (opaque and z-ordered while
 *          they cross: risers above, sinkers dip), and rows that join fade in only
 *          once the movers have passed, so no two rows' text ever overlaps mid-flip.
 *
 * The list is a size container with a Views column left of Score at every width (the sort
 * column's header shows the arrow). Narrow stages (laptop letterbox, tablet, phone) drop the
 * Matched column into a compact meta line under the hook, so nothing is truncated. Only
 * RANK_N rows are shown (four), with roomy 52px rows.
 *
 * The wall uses 8 columns from md (about 56px posters at a 1440 letterbox) and starts
 * filled, so the first frame already reads as a running feed.
 *
 * Plays once at 40% visibility (pauses offscreen), with a Replay button. Reduced
 * motion and no-JS show the ranked frame; the sort becomes an instant swap.
 */
import { RotateCcw } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { cn } from "@/lib/cn";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { Flip } from "@/lib/gsap-flip";
import { MOTION_OK, usePrefersReducedMotion } from "@/lib/motion";
import type { RankedVideo, Scenario } from "./content";
import { PlatformGlyph } from "./glyphs";
import { useHiw } from "./hiw-context";
import { playWhenVisible } from "./playback";
import { formatClock, formatCount, POSTER_H, POSTER_W, THUMBS, thumb } from "./thumbs";
import styles from "./hiw.module.css";

type Sort = "score" | "views";

/** Inline props a Score/Views flight can leave on a ranked row. */
const ROW_PROPS = "transform,translate,zIndex,opacity,visibility,display,position,top,left,width";

/** Deterministic shuffle of the 60 posters for the wall (same on server and client). */
const WALL_BASE: number[] = (() => {
  const ns = THUMBS.map((t) => t.n);
  let seed = 7;
  for (let i = ns.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [ns[i], ns[j]] = [ns[j], ns[i]];
  }
  return ns;
})();
const WALL = [...WALL_BASE, ...WALL_BASE];

const noopSubscribe = () => () => {};
/**
 * The watch wall (121 poster tiles, about 68KB of markup) is hidden in the finished frame the
 * server renders, so it is built on the client only: false on the server and while
 * hydrating, true for a client render (Home mounts this section through <LazySection>,
 * which renders it on the client).
 */
const useClientOnly = () => useSyncExternalStore(noopSubscribe, () => true, () => false);
/** Tiles shown below md (6 columns x 4 rows), per the brief. */
const MOBILE_TILES = 24;

const pad2 = (n: number) => String(n).padStart(2, "0");
/** Row grid: compact (# · thumb · video · views · score) below 600px of list width, full table above. */
const ROW_COLS = "grid-cols-[20px_25px_minmax(0,1fr)_56px_auto] @min-[600px]:grid-cols-[20px_25px_minmax(0,1fr)_56px_112px_72px]";
/** Ranked rows shown (the rest compress into "+N more"). */
const RANK_N = 4;
/** Score bars start at 50 so the spread between 84 and 94 reads at a glance. */
const barValue = (score: number) => Math.max(0.06, Math.min(1, (score - 50) / 50));

interface Row extends RankedVideo {
  scoreRank: number;
  viewsRank: number;
}

function rankRows(scenario: Scenario): Row[] {
  const byScore = [...scenario.ranked].sort((a, b) => b.score - a.score);
  const byViews = [...scenario.ranked].sort((a, b) => thumb(b.n).views - thumb(a.n).views);
  return scenario.ranked.map((r) => ({
    ...r,
    scoreRank: byScore.findIndex((x) => x.n === r.n) + 1,
    viewsRank: byViews.findIndex((x) => x.n === r.n) + 1,
  }));
}

/* -------------------------------------------------------------- timeline */

interface RankTimelineOptions {
  rows: Row[];
  passed: number;
  runSeconds: number;
  onRanked: () => void;
  setStatus: (text: string) => void;
}

function buildRankTimeline(root: HTMLElement, opts: RankTimelineOptions) {
  const one = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s);
  const all = <T extends Element = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
  const watch = one("[data-rank-watch]");
  const list = one("[data-rank-list]");
  const viewport = one("[data-rank-viewport]");
  const wall = one("[data-rank-wall]");
  const dim = one("[data-rank-dim]");
  const counterEl = one("[data-rank-count]");
  const clockEl = one("[data-rank-clock]");
  const progress = one("[data-rank-progress]");
  const readout = one("[data-rank-readout]");
  if (!watch || !list || !viewport || !wall || !dim) return null;

  const tiles = Array.from(wall.children) as HTMLElement[];
  const visible = (el: HTMLElement) => el.offsetParent !== null;
  const half = tiles.slice(WALL_BASE.length).find(visible)?.offsetTop ?? wall.offsetHeight / 2;
  const scanY = Math.round(viewport.offsetHeight * 0.56);
  // The wall starts filled (no empty top half): the feed is already running.
  const y0 = 0;
  const y1 = scanY - half;

  // Pick RANK_N tiles that end in the watched band, spread out, and dress them as the winners.
  const winners = [...opts.rows].filter((r) => r.scoreRank <= RANK_N).sort((a, b) => a.scoreRank - b.scoreRank);
  const candidates = tiles.slice(0, WALL_BASE.length).filter(visible);
  let inBand = candidates.filter((t) => {
    const top = t.offsetTop + y1;
    return top >= 6 && top + t.offsetHeight <= scanY - 6;
  });
  // Large tiles (2560px windows: a tile is taller than the band) or an unlucky row offset
  // (820px) leave no tile wholly inside the band: take the tiles centred in it instead, so the
  // winners still light up and flip into the list.
  if (!inBand.length) {
    inBand = candidates.filter((t) => {
      const mid = t.offsetTop + y1 + t.offsetHeight / 2;
      return mid >= 0 && mid <= scanY;
    });
  }
  const picks = winners.map((_, k) => inBand[Math.round((k * (inBand.length - 1)) / Math.max(1, winners.length - 1))]).filter(Boolean);
  const restore: (() => void)[] = [];
  picks.forEach((tile, k) => {
    const w = winners[k];
    const img = tile.querySelector("img");
    const score = tile.querySelector<HTMLElement>("[data-tile-score]");
    if (!img || !score) return;
    const prevSrc = img.getAttribute("src");
    const prevScore = score.textContent;
    img.setAttribute("src", thumb(w.n).poster);
    score.textContent = String(w.score);
    tile.dataset.flipId = `rk-${w.n}`;
    tile.dataset.pick = "true";
    tile.style.zIndex = "3";
    restore.push(() => {
      gsap.killTweensOf(tile);
      gsap.set(tile, { clearProps: "opacity,visibility,transform" });
      tile.style.zIndex = "";
      if (prevSrc) img.setAttribute("src", prevSrc);
      score.textContent = prevScore;
      delete tile.dataset.flipId;
      delete tile.dataset.pick;
    });
  });
  const pickRings = picks.map((t) => t.querySelector<HTMLElement>("[data-tile-ring]")).filter((n): n is HTMLElement => !!n);
  const pickScores = picks.map((t) => t.querySelector<HTMLElement>("[data-tile-score]")).filter((n): n is HTMLElement => !!n);


  const infos = all("[data-rank-info]");
  const bars = all("[data-rank-bar]");
  const head = one("[data-rank-head]");
  const stack = one("[data-rank-stack]");
  const answer = one("[data-rank-answer]");

  const count = { v: 0, t: 0 };
  const write = () => {
    if (counterEl) counterEl.textContent = Math.round(count.v).toLocaleString("en-US");
    if (clockEl) clockEl.textContent = formatClock(count.t);
  };
  write();

  list.dataset.sort = "score";
  let flip: ReturnType<typeof Flip.from> | null = null;

  const doFlip = () => {
    if (!picks.length) {
      gsap.set(list, { autoAlpha: 1 });
      return;
    }
    const state = Flip.getState(picks);
    gsap.set(list, { autoAlpha: 1 });
    const targets = all("[data-rank-thumb]").filter((el) => visible(el) && picks.some((p) => p.dataset.flipId === el.dataset.flipId));
    flip = Flip.from(state, { targets, duration: 0.95, ease: EASE.inOut, scale: true, zIndex: 20, stagger: 0.05 });
    gsap.set(picks, { autoAlpha: 0 });
  };

  // Apply the first frame now: zero-time sets in a paused timeline only render on play,
  // and the stage is visible (below 40%) before playback starts.
  gsap.set(watch, { autoAlpha: 1 });
  gsap.set(list, { autoAlpha: 0 });
  gsap.set(dim, { autoAlpha: 0 });
  // Every tween on the picks is guarded: GSAP warns ("target not found") on an empty list.
  const pickMarks = [...pickRings, ...pickScores];
  if (pickMarks.length) gsap.set(pickMarks, { autoAlpha: 0 });
  gsap.set(wall, { y: y0 });
  if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: "0% 50%" });

  const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.out } });
  tl.set(watch, { autoAlpha: 1 }, 0)
    .set(list, { autoAlpha: 0 }, 0)
    .set([viewport, readout], { autoAlpha: 1, y: 0 }, 0)
    .set(dim, { autoAlpha: 0 }, 0)
    .set([head, stack, answer].filter(Boolean), { autoAlpha: 0 }, 0)
    .set(infos, { autoAlpha: 0, x: 8 }, 0)
    .set(bars, { scaleX: 0, transformOrigin: "0% 50%" }, 0)
    .set(wall, { willChange: "transform" }, 0)
    .fromTo(wall, { y: y0 }, { y: y1, duration: 4.4, ease: "sine.inOut" }, 0.2)
    .set(wall, { willChange: "auto" }, 4.7)
    .to(count, { v: opts.passed, duration: 4.4, ease: "sine.inOut", onUpdate: write }, 0.2)
    .to(count, { t: opts.runSeconds, duration: 4.4, ease: "none", onUpdate: write }, 0.2);
  if (progress) tl.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: 4.4, ease: "none", transformOrigin: "0% 50%" }, 0.2);

  if (pickMarks.length) tl.set(pickMarks, { autoAlpha: 0 }, 0);

  tl.call(() => opts.setStatus("Ranking by your parameters"), [], 4.7).to(dim, { autoAlpha: 1, duration: 0.45 }, 4.7);
  if (pickRings.length) tl.fromTo(pickRings, { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.08 }, 4.8);
  if (pickScores.length) tl.fromTo(pickScores, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08 }, 4.9);
  tl.call(doFlip, [], 5.7)
    .to([viewport, readout], { autoAlpha: 0, y: 10, duration: 0.5, ease: "power2.in" }, 5.75)
    .set(watch, { autoAlpha: 0 }, 6.3)
    .fromTo(head, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 6.0)
    .to(infos, { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.07 }, 6.35)
    .to(bars, { scaleX: (_: number, el: HTMLElement) => Number(el.dataset.value ?? 1), duration: 0.7, ease: "power2.out", stagger: 0.07 }, 6.45)
    .fromTo(stack, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 7.0)
    .fromTo(answer, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 7.25)
    .call(() => {
      opts.setStatus("Ranked");
      opts.onRanked();
    }, [], 7.4);

  // Restart (or a new brief) can land at any point of the flight: kill the Flip and wipe every
  // inline trace it leaves on the ranked-row thumbnails (transform, layer) and on the wall tiles.
  const cleanup = () => {
    flip?.kill();
    flip = null;
    const thumbs = all("[data-rank-thumb]");
    if (thumbs.length) {
      gsap.killTweensOf(thumbs);
      gsap.set(thumbs, { clearProps: "transform,translate,scale,rotate,zIndex,opacity,visibility" });
    }
    restore.forEach((fn) => fn());
    if (pickMarks.length) gsap.set(pickMarks, { clearProps: "opacity,visibility,transform" });
  };
  return { tl, cleanup };
}

/**
 * The wall's 121 poster tiles. Memoized: a Score/Views click re-renders the stage, and the
 * wall (which the timeline also edits imperatively) has no reason to be reconciled again.
 */
const WallTiles = memo(function WallTiles() {
  return (
    <>
      {WALL.map((n, i) => (
        <div
          key={i}
          className={cn("relative overflow-hidden rounded-[7px] bg-surface-2", i % WALL_BASE.length >= MOBILE_TILES && "max-md:hidden")}
        >
          <Image
            src={thumb(n).poster}
            alt=""
            width={POSTER_W}
            height={POSTER_H}
            unoptimized
            className="aspect-[9/16] size-full object-cover"
          />
          <span data-tile-ring className="invisible absolute inset-0 z-[3] rounded-[7px] opacity-0 ring-2 ring-inset ring-accent" />
          <span
            data-tile-score
            className="invisible absolute right-1 top-1 z-[3] rounded-[4px] bg-accent px-1 font-mono text-[10px] leading-[14px] text-paper opacity-0"
          >
            00
          </span>
        </div>
      ))}
    </>
  );
});

/* ------------------------------------------------------------- component */

export function RankStage({ className }: { className?: string }) {
  const { scenario, runKey } = useHiw();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const rowsRef = useRef<HTMLOListElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const sortTl = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const [sort, setSort] = useState<Sort>("score");
  const [ranked, setRanked] = useState(true);
  const [replay, setReplay] = useState(0);
  const wallReady = useClientOnly();

  const rows = useMemo(() => rankRows(scenario), [scenario]);
  const top3 = useMemo(() => [...rows].sort((a, b) => a.scoreRank - b.scoreRank).slice(0, 3), [rows]);
  const viewsLeader = rows.find((r) => r.viewsRank === 1);
  const viewsNote =
    viewsLeader && viewsLeader.scoreRank !== 1
      ? `By raw views, ${thumb(viewsLeader.n).creator} (${formatCount(thumb(viewsLeader.n).views)}) jumps to #1 with a score of ${viewsLeader.score}.`
      : "Raw views and your rubric agree on the leader here.";

  const setStatus = useCallback((text: string) => {
    if (statusRef.current) statusRef.current.textContent = text;
  }, []);

  /** Drop every inline trace of a Score/Views flight (transforms, forced layers, forced display). */
  const resetRows = useCallback(() => {
    sortTl.current?.kill();
    sortTl.current = null;
    const rowEls = listRef.current ? Array.from(listRef.current.querySelectorAll<HTMLElement>("[data-rank-row]")) : [];
    if (!rowEls.length) return;
    gsap.killTweensOf(rowEls);
    gsap.set(rowEls, { clearProps: ROW_PROPS });
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      // The watch timeline needs the wall's tiles (client-only, see useClientOnly).
      if (!el || !wallReady) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        setSort("score");
        setRanked(false);
        setStatus("Watching");
        const built = buildRankTimeline(el, {
          rows,
          passed: scenario.passed,
          runSeconds: scenario.runSeconds,
          onRanked: () => setRanked(true),
          setStatus,
        });
        if (!built) return;
        const pb = playWhenVisible(el, built.tl);
        return () => {
          pb.stop();
          built.cleanup();
          resetRows();
          setRanked(true);
          setStatus("Ranked");
        };
      });
    },
    { scope: root, dependencies: [scenario.id, runKey, replay, wallReady], revertOnUpdate: true },
  );

  /**
   * Score <-> Views as one interruptible FLIP on plain transforms. Rows keep their DOM order
   * (CSS `order` moves them), so the layout under the new sort is read once, each row is
   * set back to where it is on screen right now (its old slot plus any in-flight transform,
   * so a click mid-flight continues from the current position) and tweens to 0. Rows leaving
   * the top four fade in place (forced visible and absolute until done); joiners rise in once
   * the movers have almost landed. Nothing is re-measured while it plays, and a new click
   * kills the previous timeline before reading, so toggles never stack.
   */
  const onSort = (next: Sort) => {
    const list = listRef.current;
    if (!list || list.dataset.sort === next) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>("[data-rank-row]"));
    if (reduced) {
      list.dataset.sort = next;
      setSort(next);
      return;
    }
    sortTl.current?.kill();
    gsap.killTweensOf(items);

    // Read: where each row is on screen now (null when it is not displayed).
    const before = items.map((el) =>
      el.offsetParent
        ? { top: el.offsetTop + Number(gsap.getProperty(el, "y")), opacity: Number(gsap.getProperty(el, "opacity")) }
        : null,
    );
    // Forced display/position from an interrupted leaver is dropped before the new layout is read.
    gsap.set(items, { clearProps: "display,position,top,left,width,zIndex" });
    list.dataset.sort = next;
    setSort(next);
    const after = items.map((el) => (el.offsetParent ? el.offsetTop : null));

    // Write.
    // Built paused and played on the next frame: with Lenis driving the ticker (lagSmoothing 0) a
    // timeline that starts running now would also "consume" the click's React render and layout
    // time, so its first frame would land partway through the move (a visible jump).
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: EASE.inOut },
      onComplete: () => {
        gsap.set(items, { clearProps: ROW_PROPS });
        sortTl.current = null;
      },
    });
    items.forEach((el, i) => {
      const was = before[i];
      const now = after[i];
      if (was && now !== null) {
        const delta = was.top - now;
        // Layers: sinkers (1) < rows that stay put (2) < risers (3) < joiners (4).
        gsap.set(el, { y: delta, opacity: was.opacity, visibility: "inherit", zIndex: delta > 1 ? 3 : delta < -1 ? 1 : 2 });
        if (Math.abs(delta) > 0.5) tl.to(el, { y: 0, duration: 0.7 }, 0);
        else gsap.set(el, { y: 0 });
        if (delta < -1) {
          // A sinker dips so it reads as passing behind the riser.
          tl.to(el, { opacity: 0.4, duration: 0.25, ease: "power1.out" }, 0).to(el, { opacity: 1, duration: 0.3, ease: "power1.in" }, 0.45);
        } else if (was.opacity < 1) {
          tl.to(el, { opacity: 1, duration: 0.3, ease: "power1.out" }, 0);
        }
      } else if (was) {
        gsap.set(el, { display: "grid", position: "absolute", top: was.top, left: 0, width: "100%", y: 0, opacity: was.opacity, zIndex: 0 });
        tl.to(el, { opacity: 0, duration: 0.18, ease: "power1.out" }, 0);
      } else if (now !== null) {
        gsap.set(el, { zIndex: 4 });
        tl.fromTo(el, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: EASE.out }, 0.6);
      }
    });
    sortTl.current = tl;
    requestAnimationFrame(() => {
      if (sortTl.current === tl) tl.play(0);
    });
  };

  const extra = Math.max(0, scenario.passed - RANK_N);

  return (
    <figure ref={root} className={cn("relative overflow-hidden rounded-card border border-hairline bg-paper", className)}>
      <figcaption className="sr-only">
        Illustration of the ranking step: ContHunt watches {scenario.passed} videos in {formatClock(scenario.runSeconds)}, then
        ranks them. Top four by score:{" "}
        {[...rows]
          .filter((r) => r.scoreRank <= RANK_N)
          .sort((a, b) => a.scoreRank - b.scoreRank)
          .map((r) => `${thumb(r.n).creator}, score ${r.score}, ${formatCount(thumb(r.n).views)} views`)
          .join("; ")}
        . Scores are illustrative; creators and view counts are real.
      </figcaption>

      {/* Window bar */}
      <div className="flex h-11 items-center gap-2.5 border-b border-hairline pl-4 pr-2">
        <span aria-hidden="true" className="relative grid size-4 place-items-center">
          <span className={cn("size-1.5 rounded-full bg-accent", styles.pulseDot)} />
        </span>
        <span aria-hidden="true" className="text-[13px] font-semibold tracking-[-0.01em] text-ink">
          Ranked videos
        </span>
        <span aria-hidden="true" ref={statusRef} className="hidden font-mono text-[11px] text-ink/62 sm:inline">
          Ranked
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {/* Scores, counts and run time are illustrative (the figcaption says so); creators and views are real. */}
          <SegmentedToggle
            ariaLabel="Sort ranked videos"
            size="sm"
            value={sort}
            onChange={onSort}
            // The inactive label uses --muted (3.3:1 at 12px); lift it to AA here.
            // 28px visual, 44px hit area (a vertical ::after expander on each option).
            className="[&_button]:h-7 [&_button]:px-2.5 [&_button]:text-[12px] [&_button]:after:absolute [&_button]:after:inset-x-0 [&_button]:after:-inset-y-2 [&_button]:after:content-[''] [&_button[aria-checked=false]]:text-ink/62 [&_button[aria-checked=false]:hover]:text-ink"
            options={[
              { value: "score", label: "Score", disabled: !ranked },
              { value: "views", label: "Views", disabled: !ranked },
            ]}
          />
          {!reduced && (
            <button
              type="button"
              onClick={() => setReplay((n) => n + 1)}
              aria-label="Replay the ranking animation"
              title="Replay the ranking animation"
              className="relative grid size-8 place-items-center rounded-[10px] text-ink/62 transition-[background-color,color,scale] duration-200 ease-out after:absolute after:-inset-1.5 after:content-[''] hover:bg-surface hover:text-ink active:scale-[0.96]"
            >
              <RotateCcw className="size-3.5" strokeWidth={2} />
            </button>
          )}
        </span>
      </div>

      <div className="relative">
        {/* WATCH layer (hidden in the finished frame) */}
        <div data-rank-watch aria-hidden="true" className="invisible absolute inset-0 z-10 opacity-0">
          <div data-rank-viewport className="absolute inset-x-3 bottom-[76px] top-3 overflow-hidden rounded-[14px] bg-bg sm:inset-x-4 sm:top-4">
            <div data-rank-wall className="relative grid grid-cols-6 gap-1.5 px-1.5 pt-1.5 md:grid-cols-8">
              {wallReady && <WallTiles />}
              <div data-rank-dim className="invisible absolute inset-0 z-[2] bg-bg/75 opacity-0" />
            </div>
            <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 top-[56%]", styles.veil)} />
            <div className={cn("pointer-events-none absolute inset-x-0 top-[56%] h-px bg-accent", styles.scan)}>
              <span className="absolute -top-[9px] left-2 rounded-[4px] bg-accent px-1.5 font-mono text-[9.5px] uppercase leading-[18px] tracking-[0.06em] text-paper">
                watching
              </span>
            </div>
          </div>
          <div data-rank-readout className="absolute inset-x-4 bottom-4 flex h-[52px] items-end justify-between gap-4 sm:inset-x-5">
            <p className="flex items-baseline gap-2">
              <span data-rank-count className="text-[30px] font-bold leading-none tracking-[-0.03em] text-ink tabular-nums">
                {scenario.passed}
              </span>
              <span className="whitespace-nowrap text-[13px] text-ink/62">videos watched</span>
            </p>
            <div className="flex w-[36%] max-w-[200px] flex-col items-end gap-2">
              <span data-rank-clock className="font-mono text-[12px] tabular-nums text-ink/62">
                {formatClock(scenario.runSeconds)}
              </span>
              <span className="h-[3px] w-full overflow-hidden rounded-full bg-surface-2">
                <span data-rank-progress className="block h-full origin-left rounded-full bg-accent" />
              </span>
            </div>
          </div>
        </div>

        {/* RANKED layer (the finished frame, in normal flow so it sets the height) */}
        <div ref={listRef} data-rank-list data-sort={sort} className={cn("@container relative z-20 p-3 sm:p-4", styles.rows)}>
          <div
            data-rank-head
            aria-hidden="true"
            className={cn("grid items-center gap-x-2 px-2 @min-[340px]:gap-x-3 pb-2 font-mono text-[10px] uppercase tracking-[0.06em] text-ink/62", ROW_COLS)}
          >
            <span>#</span>
            <span />
            <span>Video</span>
            <span className="whitespace-nowrap text-right">
              Views<span className={cn("text-ink", styles.byViews)}> ↓</span>
            </span>
            <span className="whitespace-nowrap text-right @min-[600px]:text-left">
              Score<span className={cn("text-ink", styles.byScore)}> ↓</span>
            </span>
            <span className="hidden @min-[600px]:block">Matched</span>
          </div>
          <ol ref={rowsRef} data-rank-rows className="relative flex h-[226px] flex-col gap-1.5">
            {rows.map((r) => {
              const t = thumb(r.n);
              return (
                <li
                  key={r.n}
                  data-rank-row
                  data-in-score={r.scoreRank <= RANK_N}
                  data-in-views={r.viewsRank <= RANK_N}
                  style={{ ["--o-score" as string]: r.scoreRank, ["--o-views" as string]: r.viewsRank }}
                  className={cn(
                    "grid h-[52px] shrink-0 items-center gap-x-2 @min-[340px]:gap-x-3 rounded-[10px] bg-paper px-2",
                    ROW_COLS,
                    "transition-[background-color] duration-200 hover:bg-surface",
                    styles.row,
                  )}
                >
                  <span data-rank-info className="font-mono text-[11px] tabular-nums text-ink/62">
                    <span className={styles.byScore}>{pad2(r.scoreRank)}</span>
                    <span className={styles.byViews}>{pad2(r.viewsRank)}</span>
                  </span>
                  <span data-rank-thumb data-flip-id={`rk-${r.n}`} className="relative block h-11 w-[25px] overflow-hidden rounded-[5px] bg-surface">
                    <Image src={t.poster} alt="" width={POSTER_W} height={POSTER_H} unoptimized className="size-full object-cover" />
                  </span>
                  <span data-rank-info className="min-w-0">
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex w-fit max-w-full items-center gap-1.5 text-[13px] after:absolute after:-inset-x-1 after:-inset-y-1.5 after:content-[''] font-medium leading-[1.2] text-ink decoration-ink/30 underline-offset-2 hover:underline"
                    >
                      <span className="truncate">{t.creator}</span>
                      <PlatformGlyph platform={t.platform} titled className="text-ink/60" />
                    </a>
                    <span className="block truncate text-[12px] leading-[1.25] text-ink/62 @max-[279px]:hidden">{r.hook}</span>
                    {/* Compact meta line (narrow stages): the Matched column, inline. */}
                    {r.matched.length > 0 && (
                      <span className="block whitespace-nowrap font-mono text-[10.5px] leading-[1.25] tabular-nums text-blue-ink @min-[600px]:hidden">
                        {r.matched.join(" · ")}
                      </span>
                    )}
                  </span>
                  <span data-rank-info className="text-right font-mono text-[11.5px] tabular-nums text-ink-2">
                    <span className={styles.viewsVal}>{formatCount(t.views)}</span>
                  </span>
                  <span data-rank-info className="flex items-center justify-end gap-2 @min-[600px]:justify-start">
                    <span className="hidden h-[3px] w-10 overflow-hidden rounded-full bg-surface-2 @min-[340px]:block @min-[600px]:w-[60px]">
                      <span
                        data-rank-bar
                        data-value={barValue(r.score)}
                        className={cn("block h-full origin-left rounded-full", r.score >= 80 ? "bg-ink" : "bg-ink/30")}
                        style={{ transform: `scaleX(${barValue(r.score)})` }}
                      />
                    </span>
                    <span className={cn("w-6 text-right font-mono text-[12px] tabular-nums", r.score >= 80 ? "text-ink" : "text-ink/62")}>
                      {r.score}
                    </span>
                  </span>
                  <span data-rank-info className="hidden @min-[600px]:block">
                    {r.matched.length > 0 && (
                      <span className="inline-flex h-5 items-center rounded-[5px] bg-blue-soft px-1.5 font-mono text-[10.5px] text-blue-ink">
                        {r.matched.join(" · ")}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>

          <div data-rank-stack className="mt-2.5 flex items-center gap-3 px-2">
            <span aria-hidden="true" className="flex shrink-0 -space-x-2">
              {WALL_BASE.slice(0, 4).map((n) => (
                <span key={n} className="block h-7 w-4 overflow-hidden rounded-[4px] ring-2 ring-paper">
                  <Image src={thumb(n).poster} alt="" width={POSTER_W} height={POSTER_H} unoptimized className="size-full object-cover grayscale" />
                </span>
              ))}
            </span>
            <p className="min-w-0 text-[12.5px] leading-[1.35] text-ink/62">
              <span className={styles.byScore}>
                <span className="font-mono tabular-nums text-ink">+{extra.toLocaleString("en-US")}</span> more, ranked by the same{" "}
                {scenario.parameters.length} parameters.
              </span>
              <span className={styles.byViews}>{viewsNote}</span>
            </p>
          </div>

          <div data-rank-answer className="mx-2 mt-3 border-t border-hairline pt-3">
            {/* Header line: the answer label, then its receipts (cited videos, questions answered). */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <p className="mr-auto flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <span className="grid size-5 place-items-center rounded-[6px] bg-ink font-mono text-[10px] text-paper">A</span>
                Answer
              </p>
              <span className="font-mono text-[11px] text-ink/62">Q1–Q{scenario.questions.length} answered</span>
              <span className="inline-flex h-7 items-center gap-2 rounded-chip border border-hairline pl-1 pr-2.5 text-[12px] font-medium text-ink-2">
                <span aria-hidden="true" className="flex -space-x-1.5">
                  {top3.map((r) => (
                    <span key={r.n} className="block h-5 w-[11px] overflow-hidden rounded-[3px] ring-[1.5px] ring-paper">
                      <Image src={thumb(r.n).poster} alt="" width={POSTER_W} height={POSTER_H} unoptimized className="size-full object-cover" />
                    </span>
                  ))}
                </span>
                from {scenario.cited} videos
              </span>
            </div>
            <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-2">{scenario.answer}</p>
          </div>
        </div>
      </div>
    </figure>
  );
}
