"use client";

/**
 * NicheView: one niche, every video, as a grid (6 columns at 1440, then 5 / 3 / 2).
 *
 * The header is kept short so the grid starts high on the page: the niche name beside its
 * description, then one line with the figures on the left (views, median engagement, creator
 * count) and the sort and platform controls on the right. That line is the same width as the
 * grid. The "All" pill in the sticky selector is the way back. Sort and platform filters
 * reorder the grid with a GSAP Flip, so cards glide to their new cells instead of jumping.
 * Rank badges always show the original rank.
 *
 * A snapshot niche opened before the rest of the snapshot has streamed in (see
 * lib/viral-now/wire.ts) shows its header and a grid of placeholder cells, then the real
 * grid as soon as every video is here. A niche opened on load ships whole, so it never waits.
 */
import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { cn } from "@/lib/cn";
import { EASE, gsap } from "@/lib/gsap";
import { Flip } from "@/lib/gsap-flip";
import { prefersReducedMotion } from "@/lib/motion";
import { formatCount, formatPercent } from "@/lib/viral-now/format";
import { PLATFORM_ORDER, platformInfo, type KnownPlatform } from "@/lib/viral-now/glyphs";
import { BOARD_SIZE } from "@/lib/viral-now/ranking";
import { nicheLoaded, nicheSize, nicheStats, sortVideos, type SortKey } from "@/lib/viral-now/stats";
import type { ViralNowNiche, ViralNowVideo } from "@/lib/viral-now/types";
import { nicheHue } from "@/content/viral-now/niche-hues";
import { toneVars } from "@/lib/tones";
import { PlatformGlyph } from "./parts";
import { useViralNow } from "./provider";
import { VideoCard } from "./video-card";
import styles from "./viral-now.module.css";

export interface NicheViewProps {
  niche: ViralNowNiche;
  onOpen: (niche: ViralNowNiche, list: ViralNowVideo[], video: ViralNowVideo, trigger: HTMLElement) => void;
}

const SORTS: Array<{ value: SortKey; label: string }> = [
  { value: "rank", label: "Rank" },
  { value: "views", label: "Views" },
  { value: "newest", label: "Newest" },
  { value: "engagement", label: "Engagement" },
];

type PlatformFilter = "all" | KnownPlatform;

/**
 * Roving radio keys for the Platform filter: arrows move focus to the next or previous chip and select it,
 * Home and End jump to the first and last. Only the selected chip is a tab stop (see `PlatformChip`).
 * Selecting goes through the chip's own click, so the Flip capture and the filter run the same code path.
 */
function onRadioKeyDown(e: KeyboardEvent<HTMLElement>) {
  const { key } = e;
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(key)) return;
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
  const here = radios.findIndex((r) => r === document.activeElement);
  if (here < 0) return;
  e.preventDefault();
  const last = radios.length - 1;
  const next =
    key === "Home" ? 0 : key === "End" ? last : key === "ArrowRight" || key === "ArrowDown" ? (here === last ? 0 : here + 1) : here === 0 ? last : here - 1;
  radios[next].focus();
  radios[next].click();
}

export function NicheView({ niche, onOpen }: NicheViewProps) {
  const { seedStatus, retrySeed } = useViralNow();
  const [sort, setSort] = useState<SortKey>("rank");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const gridRef = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const stats = useMemo(() => nicheStats(niche), [niche]);
  const count = niche.videos.length;
  const size = nicheSize(niche);
  const waiting = !nicheLoaded(niche);
  const failed = waiting && seedStatus === "error";
  const visible = useMemo(() => {
    const pool = platform === "all" ? niche.videos : niche.videos.filter((v) => v.platform === platform);
    return sortVideos(pool, sort);
  }, [niche.videos, platform, sort]);

  const platformCounts = useMemo(() => {
    const counts = new Map<KnownPlatform, number>();
    for (const video of niche.videos) {
      if (video.platform === "tiktok" || video.platform === "instagram" || video.platform === "youtube") {
        counts.set(video.platform, (counts.get(video.platform) ?? 0) + 1);
      }
    }
    return counts;
  }, [niche.videos]);

  // The one chip in the tab order. It is the selected one, or "All" when the remembered platform is not in this niche.
  const platformTab: PlatformFilter = platform !== "all" && platformCounts.has(platform) ? platform : "all";

  const capture = () => {
    const items = gridRef.current?.querySelectorAll("[data-flip-id]");
    if (items && items.length > 0 && !prefersReducedMotion()) flipState.current = Flip.getState(items);
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: 0.65,
      ease: EASE.out,
      absolute: false,
      onEnter: (entering) => gsap.fromTo(entering, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.5, ease: EASE.out }),
    });
  }, [sort, platform]);

  const partial = count < BOARD_SIZE;

  return (
    <div className="relative pb-6" style={toneVars(nicheHue(niche.slug))}>
      {/* Soft hue band behind the header (COLOR_SYSTEM.md, single-niche grid). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-[var(--tone-soft)] to-transparent" />
      <div className="letterbox relative flex flex-col gap-5 pb-4 pt-6 md:pt-7">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-end lg:gap-12">
          <h2 className="display-m flex items-center gap-3">
            <span aria-hidden="true" className="size-3 shrink-0 rounded-[4px] bg-[var(--tone-mark)]" />
            {niche.name}
          </h2>
          <p className="max-w-[58ch] text-[17px] leading-[1.5] text-ink-2/75 lg:pb-1">{niche.description}</p>
        </div>

      </div>

      <div
        className={cn(styles.toolbar, "flex flex-col gap-3 border-t border-hairline pt-4 pb-5", waiting && (failed ? "hidden" : "invisible"))}
        aria-hidden={waiting || undefined}
        inert={waiting}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <dl className="flex flex-wrap items-center gap-x-7 gap-y-2.5 font-mono text-xs tabular-nums tracking-[0.02em] text-ink-2/75">
            <Stat value={formatCount(stats.totalViews)} label="views" />
            <Stat value={formatPercent(stats.medianEngagement)} label="median engagement" />
            <Stat value={String(stats.creators)} label={stats.creators === 1 ? "creator" : "creators"} />
          </dl>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <SegmentedToggle
              ariaLabel="Sort videos"
              size="sm"
              value={sort}
              options={SORTS}
              onChange={(next) => {
                capture();
                setSort(next);
              }}
            />
            {platformCounts.size > 1 && (
              <div role="radiogroup" aria-label="Platform" className="flex flex-wrap items-center gap-1.5" onKeyDown={onRadioKeyDown}>
                <PlatformChip
                  label="All"
                  count={count}
                  selected={platform === "all"}
                  tabbable={platformTab === "all"}
                  onSelect={() => {
                    capture();
                    setPlatform("all");
                  }}
                />
                {PLATFORM_ORDER.filter((p) => platformCounts.has(p)).map((p) => (
                  <PlatformChip
                    key={p}
                    label={platformInfo(p)?.label ?? p}
                    glyph={<PlatformGlyph platform={p} className="size-3" />}
                    count={platformCounts.get(p) ?? 0}
                    selected={platform === p}
                    tabbable={platformTab === p}
                    onSelect={() => {
                      capture();
                      setPlatform(p);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {partial && (
          <p className="max-w-[60ch] text-sm text-ink-2/75">
            This board holds {count} videos. Only videos that pass our filters are listed, so a niche can have fewer than {BOARD_SIZE}.
          </p>
        )}
      </div>

      {waiting ? (
        <GridPlaceholder size={size} failed={failed} onRetry={retrySeed} />
      ) : (
        <ul ref={gridRef} className={styles.grid} aria-label={`${niche.name}, ${visible.length} videos`}>
          {visible.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              variant="grid"
              eager={video.rank <= 6}
              onOpen={(v, trigger) => onOpen(niche, visible, v, trigger)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/** Placeholder cells in the grid's own columns, shown while a snapshot niche's videos are still arriving. */
function GridPlaceholder({ size, failed, onRetry }: { size: number; failed: boolean; onRetry: () => void }) {
  if (failed) {
    return (
      <div className="letterbox flex flex-col items-start gap-3 py-16">
        <p className="text-[15px] text-ink-2">These videos did not load.</p>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }
  return (
    <ul className={styles.grid} aria-hidden="true">
      {Array.from({ length: size }, (_, i) => (
        <li key={i} className={styles.gridItem}>
          <span className={cn(styles.skel, styles.skelFill)} />
        </li>
      ))}
    </ul>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  // dt then dd in the markup; row-reverse shows the figure first.
  return (
    <div className="flex flex-row-reverse items-baseline justify-end gap-1.5">
      <dt>{label}</dt>
      <dd className="font-sans text-[17px] font-semibold leading-none tracking-[-0.02em] text-ink">{value}</dd>
    </div>
  );
}

function PlatformChip({
  label,
  glyph,
  count,
  selected,
  tabbable,
  onSelect,
}: {
  label: string;
  glyph?: React.ReactNode;
  count: number;
  selected: boolean;
  /** Roving tabindex: exactly one chip in the group is a tab stop. */
  tabbable: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabbable ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-chip px-2.5 text-[13px] font-medium transition-[background-color,color,transform] duration-200 ease-out active:scale-[0.96]",
        selected ? "bg-ink text-paper" : "bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink",
      )}
    >
      {glyph}
      {label}
      <span className={cn("font-mono text-[11px] tabular-nums", selected ? "text-paper/60" : "text-ink-2/75")}>{count}</span>
    </button>
  );
}
