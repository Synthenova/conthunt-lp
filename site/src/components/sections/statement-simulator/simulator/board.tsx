"use client";

/**
 * Deep Search board (QuestionResearchCanvas, simulator-spec §5): published sections as stacked
 * horizontal rails, then the Rubrics dropdown, the rubric predicate and the rubric rail. The filter
 * bar (sort, date, platform) is `BoardFilters`, rendered on the right of the header band by
 * ./index.tsx (owner, simulator-fullsize.md F); filters act on the rubric rail only. Tabs whose
 * search is `skeleton` render the real loading state ("Preparing research selections…" plus 9:16
 * skeleton rails).
 *
 * Lazy rails: at rest the frame shows the first two sections only. While `deferred` is set (until
 * the visitor hovers, clicks or tabs into the frame, see ./index.tsx) later sections render their
 * title and reason over an empty rail of the same height, and the rubric block waits. The board
 * cannot scroll before that engagement, so nothing visible ever changes when the rails mount.
 *
 * Elements marked `data-anchor="right"` stay put while the sidebar push animation translates the
 * rest of the board (see the collapse logic in ./index.tsx).
 */
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { ArrowUpDown, Calendar, ChevronDown, ChevronLeft, ChevronRight, ListChecks, LoaderCircle } from "lucide-react";
import {
  SIM_DATE_LABELS,
  SIM_SORT_LABELS,
  type SimDateFilter,
  type SimDeepSearch,
  type SimFilterState,
  type SimPlatform,
  type SimResearchSection,
  type SimRubricRow,
  type SimSortOption,
} from "@/content/simulator/types";
import { gsap } from "@/lib/gsap";
import { Flip } from "@/lib/gsap-flip";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { applyRubricFilters, PLATFORM_LABEL, rubricBadge, sectionBadge } from "./format";
import { SimMenu, type MenuTriggerProps } from "./layer";
import { PlatformIcon } from "./platform-icon";
import styles from "./sim.module.css";
import { SimTile, TILE_H, TILE_W, type SimTileOpen } from "./tile";

const ALL_PLATFORMS: SimPlatform[] = ["tiktok", "instagram", "youtube"];
const GAP = 12;
/** Sections whose rails mount on the server: the ones visible at rest. */
const EAGER_SECTIONS = 2;
/** A rail's height: 4px top and bottom padding around one row of tiles. */
const RAIL_H = TILE_H + 8;

/** Same rule as SimTile's skeleton state (./tile.tsx). An "unavailable" tile is resolved content. */
function isSkeletonTile(skeleton: boolean | undefined, status: string | undefined, card: unknown): boolean {
  if (status === "unavailable") return false;
  return !!skeleton || status === "loading" || !card;
}

// ------------------------------------------------------------------------------------------ Rail

interface RailProps {
  label: string;
  children: ReactNode;
  /** Changes when the rail's contents change, to refresh the edge arrows. */
  contentKey?: string;
  /** Id of the shared keyboard hint ("Arrow keys move between videos…"). */
  describedBy?: string;
  /** Every tile is still a skeleton: draw the rail's one shimmer sweep (sim.module.css). */
  shimmer?: boolean;
}

const ROVE = "[data-rove]";

/**
 * Horizontal rail: snap, hidden scrollbar, mouse drag-to-scroll, hover arrows (spec §10.4.9).
 * Keyboard: the rail is ONE tab stop (roving tabindex over its tiles); Left/Right/Home/End move
 * between tiles and keep the focused tile in view. The arrow buttons are pointer-only.
 */
function Rail({ label, children, contentKey, describedBy, shimmer }: RailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const drag = useRef<{ x: number; left: number; moved: boolean; scale: number } | null>(null);
  const roveId = useRef<string | null>(null);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const start = el.scrollLeft <= 2;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, contentKey]);

  // Roving tabindex: exactly one tile per rail is tabbable (the last focused one, else the first).
  // Tiles never set tabIndex themselves, so React re-renders never undo this.
  useLayoutEffect(() => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>(ROVE) ?? []);
    if (!items.length) return;
    const current = items.find((el) => el.dataset.rove === roveId.current) ?? items[0];
    for (const el of items) el.tabIndex = el === current ? 0 : -1;
  });

  const reveal = (el: HTMLElement) => {
    const rail = ref.current;
    if (!rail) return;
    const item = el.closest<HTMLElement>("[role=listitem]") ?? el;
    const left = item.offsetLeft - 20;
    const right = item.offsetLeft + item.offsetWidth + 20 - rail.clientWidth;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    if (left < rail.scrollLeft) rail.scrollTo({ left, behavior });
    else if (right > rail.scrollLeft) rail.scrollTo({ left: right, behavior });
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>(ROVE) ?? []);
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    let next = -1;
    if (e.key === "ArrowRight") next = Math.min(items.length - 1, i + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, i - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    items[next].focus({ preventScroll: true });
    reveal(items[next]);
  };

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (TILE_W + GAP) * 3, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div className="group/rail relative">
      <div
        ref={ref}
        role="list"
        aria-label={label}
        aria-describedby={describedBy}
        onKeyDown={onKeyDown}
        onFocus={(e) => {
          const t = e.target as HTMLElement;
          if (!t.matches(ROVE)) return;
          roveId.current = t.dataset.rove ?? null;
          for (const el of ref.current?.querySelectorAll<HTMLElement>(ROVE) ?? []) el.tabIndex = el === t ? 0 : -1;
        }}
        onScroll={measure}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          const el = ref.current;
          if (!el) return;
          const scale = el.getBoundingClientRect().width / el.clientWidth || 1;
          drag.current = { x: e.clientX, left: el.scrollLeft, moved: false, scale };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const el = ref.current;
          if (!d || !el) return;
          const dx = (e.clientX - d.x) / d.scale;
          if (!d.moved && Math.abs(dx) > 4) {
            d.moved = true;
            el.setPointerCapture(e.pointerId);
            el.style.scrollSnapType = "none";
          }
          if (d.moved) el.scrollLeft = d.left - dx;
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          const el = ref.current;
          drag.current = null;
          if (!d?.moved || !el) return;
          el.releasePointerCapture(e.pointerId);
          el.style.scrollSnapType = "";
          // Swallow the click that follows a drag so tiles do not open.
          const swallow = (ev: MouseEvent) => {
            ev.stopPropagation();
            ev.preventDefault();
          };
          el.addEventListener("click", swallow, { capture: true, once: true });
          window.setTimeout(() => el.removeEventListener("click", swallow, { capture: true }), 0);
        }}
        className={cn(
          styles.noScrollbar,
          "flex snap-x snap-proximity overflow-x-auto overscroll-x-contain scroll-pl-5 pb-1 pl-5 pt-1",
        )}
        style={{ gap: GAP }}
      >
        {children}
        <span aria-hidden className="w-2 shrink-0" />
      </div>
      {/* One sweep over the visible rail (under the score badges, z-2), not one per tile. */}
      {shimmer ? <span aria-hidden className={styles.sweep} /> : null}
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => page(-1)}
        tabIndex={-1}
        className={cn(
          "absolute left-2 top-1/2 z-[3] grid size-7 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink-2",
          "shadow-[0_0_0_1px_rgb(15_15_15/0.08),0_4px_12px_-4px_rgb(15_15_15/0.25)] transition-[opacity,scale] duration-200 ease-out active:scale-[0.94]",
          edges.start ? "pointer-events-none opacity-0" : "opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100",
        )}
      >
        <ChevronLeft aria-hidden className="size-4" />
      </button>
      <button
        type="button"
        data-anchor="right"
        aria-label="Scroll right"
        onClick={() => page(1)}
        tabIndex={-1}
        className={cn(
          "absolute right-3 top-1/2 z-[3] grid size-7 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink-2",
          "shadow-[0_0_0_1px_rgb(15_15_15/0.08),0_4px_12px_-4px_rgb(15_15_15/0.25)] transition-[opacity,scale] duration-200 ease-out active:scale-[0.94]",
          edges.end ? "pointer-events-none opacity-0" : "opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100",
        )}
      >
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </div>
  );
}

// ------------------------------------------------------------------------------ Shared pieces

function SelectAllButton({ allSelected, onClick, label }: { allSelected: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      data-anchor="right"
      onClick={onClick}
      aria-label={`${allSelected ? "Unselect all" : "Select all"} in ${label}`}
      className="h-7 shrink-0 rounded-[8px] px-2.5 text-[13.5px] font-medium text-ink-2 transition-[background-color,color,scale] duration-150 hover:bg-surface hover:text-ink active:scale-[0.96]"
    >
      <span className="relative inline-grid">
        {/* Both labels share one grid cell so the width never jumps. */}
        <span className={cn("col-start-1 row-start-1 transition-opacity duration-150", allSelected ? "opacity-0" : "")}>Select all</span>
        <span className={cn("col-start-1 row-start-1 transition-opacity duration-150", allSelected ? "" : "opacity-0")}>Unselect all</span>
      </span>
    </button>
  );
}

function RailHeader({
  title,
  count,
  label,
  allSelected,
  onSelectAll,
}: {
  title: ReactNode;
  /** "{n} videos" or a ready-made label such as "Filtered from 500 videos". */
  count?: number | string;
  label: string;
  allSelected: boolean;
  onSelectAll: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 pl-5 pr-3">
      <h3 className="flex min-w-0 items-baseline gap-2 text-[17px] font-semibold leading-tight tracking-[-0.01em] text-ink">
        <span className="truncate">{title}</span>
        {count != null ? (
          <span className="shrink-0 font-mono text-[12.5px] font-normal tabular-nums tracking-normal text-muted">{typeof count === "number" ? `${count} videos` : count}</span>
        ) : null}
      </h3>
      <SelectAllButton allSelected={allSelected} onClick={onSelectAll} label={label} />
    </div>
  );
}

function FilterTrigger({
  trigger,
  icon,
  label,
  quiet = false,
  children,
}: {
  trigger: MenuTriggerProps;
  icon?: ReactNode;
  label?: string;
  /** Sort and date: smaller text, icon and chevron, tighter padding. Same 32px height as the platform picker. */
  quiet?: boolean;
  children: ReactNode;
}) {
  const { ref, ...rest } = trigger;
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      {...rest}
      className={cn(
        "flex h-8 items-center rounded-[8px] font-medium text-ink-2",
        quiet ? "gap-1 px-2 text-[12.5px]" : "gap-1.5 px-2.5 text-[13.5px]",
        "shadow-[inset_0_0_0_1px_var(--hairline)] transition-[background-color,box-shadow,scale] duration-150 ease-out",
        "hover:bg-surface active:scale-[0.97] data-[open=true]:bg-surface data-[open=true]:shadow-[inset_0_0_0_1px_rgb(15_15_15/0.14)]",
      )}
    >
      {icon ? <span className="grid place-items-center text-muted">{icon}</span> : null}
      {children}
      <ChevronDown
        aria-hidden
        className={cn("text-muted transition-transform duration-200", quiet ? "size-3" : "size-3.5", trigger["data-open"] ? "rotate-180" : "")}
      />
    </button>
  );
}

// ------------------------------------------------------------------------------ Filter bar

/**
 * The board's filter bar (BoardFilterBar.tsx): sort, date and platform. It sits on the right of the
 * header band, beside the prompt title (./index.tsx); menus open below it, right-aligned, through
 * the canvas overlay. Changes act on the rubric rail. Phones show the sort and date triggers as
 * icons (sim.module.css `.filterLabel`), so all three fit the board's pan stop.
 */
export function BoardFilters({
  filters,
  onFilters,
  className,
}: {
  filters: SimFilterState;
  onFilters: (next: SimFilterState) => void;
  className?: string;
}) {
  const setFilters = (patch: Partial<SimFilterState>) => onFilters({ ...filters, ...patch });

  const platformItems = ALL_PLATFORMS.map((p) => ({
    value: p,
    label: PLATFORM_LABEL[p],
    icon: <PlatformIcon platform={p} size={13} />,
    checked: filters.platforms.length === 0 || filters.platforms.includes(p),
  }));

  const sortOptions = Object.entries(SIM_SORT_LABELS) as [Exclude<SimSortOption, "average_score">, string][];
  const sortLabel = SIM_SORT_LABELS[filters.sort as Exclude<SimSortOption, "average_score">] ?? SIM_SORT_LABELS.default;

  return (
    <div data-anchor="right" className={cn("flex shrink-0 items-center gap-1.5", className)}>
      <SimMenu
        id="sort"
        align="end"
        items={sortOptions.map(([value, label]) => ({ value, label, checked: filters.sort === value }))}
        onSelect={(value) => setFilters({ sort: value as SimSortOption })}
        trigger={(p) => (
          <FilterTrigger quiet trigger={p} icon={<ArrowUpDown aria-hidden className="size-3" />} label={`Sort by: ${sortLabel}`}>
            <span className={styles.filterLabel}>{sortLabel}</span>
          </FilterTrigger>
        )}
      />
      <SimMenu
        id="date"
        align="end"
        title="Filter By Date"
        items={(Object.entries(SIM_DATE_LABELS) as [SimDateFilter, string][]).map(([value, label]) => ({
          value,
          label,
          checked: filters.date_filter === value,
        }))}
        onSelect={(value) => setFilters({ date_filter: value as SimDateFilter })}
        trigger={(p) => (
          <FilterTrigger quiet trigger={p} icon={<Calendar aria-hidden className="size-3" />} label={`Date: ${SIM_DATE_LABELS[filters.date_filter]}`}>
            <span className={styles.filterLabel}>{SIM_DATE_LABELS[filters.date_filter]}</span>
          </FilterTrigger>
        )}
      />
      <SimMenu
        id="platform"
        align="end"
        title="Filter By Platform"
        mode="checkbox"
        width={200}
        items={platformItems}
        onSelect={(value) => {
          const p = value as SimPlatform;
          const current = filters.platforms.length === 0 ? ALL_PLATFORMS : filters.platforms;
          const next = current.includes(p) ? current.filter((x) => x !== p) : [...current, p];
          if (next.length === 0) return; // keep at least one platform
          setFilters({ platforms: next.length === ALL_PLATFORMS.length ? [] : ALL_PLATFORMS.filter((x) => next.includes(x)) });
        }}
        trigger={(p) => (
          <FilterTrigger trigger={p} label="Filter by platform">
            <span className="flex items-center gap-1.5 text-ink-2">
              {ALL_PLATFORMS.map((pl) => {
                const on = filters.platforms.length === 0 || filters.platforms.includes(pl);
                return (
                  <PlatformIcon
                    key={pl}
                    platform={pl}
                    size={13}
                    className={cn("transition-opacity duration-150", on ? "opacity-100" : "opacity-25")}
                  />
                );
              })}
            </span>
          </FilterTrigger>
        )}
      />
    </div>
  );
}

// ------------------------------------------------------------------------------------ Board

export interface BoardSelection {
  isSelected: (railKey: string, id: string) => boolean;
  toggle: (railKey: string, id: string) => void;
  setRail: (railKey: string, ids: string[], on: boolean) => void;
  count: (railKey: string, ids: string[]) => number;
}

export interface BoardProps {
  search: SimDeepSearch;
  filters: SimFilterState;
  /**
   * The rubric block puts its "record the rail before a filter change" function here, so the
   * header's filters (BoardFilters) can call it first and the rail animates the change (Flip).
   */
  flipCaptureRef?: RefObject<(() => void) | null>;
  rubricNo: number;
  onRubric: (rubricNo: number) => void;
  selection: BoardSelection;
  onOpenTile: (tile: SimTileOpen) => void;
  /** Mount only the rails visible at rest (see the header). */
  deferred?: boolean;
}

/** Memoised: a sidebar toggle or chat state change never re-renders the board. */
export const Board = memo(function Board(props: BoardProps) {
  const { search } = props;
  const hintId = useId();
  if (search.skeleton) return <LoadingBoard />;
  return (
    <div className="pb-8 pt-5">
      <p id={hintId} className="sr-only">
        Arrow keys move between videos. Enter opens a video. Space selects it.
      </p>
      {search.sections.length === 0 ? (
        <p className="px-5 text-[14.5px] text-muted">No research selections published yet.</p>
      ) : (
        search.sections.map((section, i) => (
          <SectionBlock
            key={`${search.id}-s${i}`}
            railKey={`${search.id}:s${i}`}
            section={section}
            hintId={hintId}
            lazy={!!props.deferred && i >= EAGER_SECTIONS}
            {...props}
          />
        ))
      )}
      {search.rubrics.length === 0 ? null : props.deferred ? (
        // Same top rule and height as the rubric block; its controls mount with the later rails.
        <div aria-hidden className="mt-1 border-t" style={{ height: RAIL_H + 132 }} />
      ) : (
        <RubricBlock hintId={hintId} {...props} />
      )}
    </div>
  );
});

function SectionBlock({
  section,
  railKey,
  selection,
  onOpenTile,
  hintId,
  lazy,
}: BoardProps & { section: SimResearchSection; railKey: string; hintId: string; lazy: boolean }) {
  const ids = section.videos.map((v) => v.video);
  const allSelected = ids.length > 0 && selection.count(railKey, ids) === ids.length;
  return (
    <section className="mb-7" aria-label={section.title}>
      <RailHeader
        title={section.title}
        count={section.videos_total ?? section.videos.length}
        label={section.title}
        allSelected={allSelected}
        onSelectAll={() => selection.setRail(railKey, ids, !allSelected)}
      />
      <p className="mb-2.5 mt-1 max-w-[600px] pl-5 pr-5 text-[14px] leading-[1.45] text-muted">{section.why}</p>
      {lazy ? (
        <div aria-hidden style={{ height: RAIL_H }} />
      ) : (
        <Rail
          label={`${section.title} videos`}
          describedBy={hintId}
          shimmer={section.videos.length > 0 && section.videos.every((v) => isSkeletonTile(v.skeleton, v.status, v.card))}
        >
          {section.videos.map((v, i) => (
            <div key={v.video} role="listitem" className="snap-start">
              <SimTile
                railKey={railKey}
                id={v.video}
                index={i}
                card={v.card}
                badge={sectionBadge(v.score)}
                skeleton={v.skeleton}
                status={v.status}
                selected={selection.isSelected(railKey, v.video)}
                onToggleSelect={selection.toggle}
                onOpen={onOpenTile}
              />
            </div>
          ))}
        </Rail>
      )}
    </section>
  );
}

function RubricBlock({ search, filters, flipCaptureRef, rubricNo, onRubric, selection, onOpenTile, hintId }: BoardProps & { hintId: string }) {
  const rubric: SimRubricRow = search.rubrics.find((r) => r.rubric_no === rubricNo) ?? search.rubrics[0];
  const railKey = `${search.id}:r${rubric.rubric_no}`;
  const rubricLabel = rubric.parent_question ? `${rubric.parameter} · ${rubric.parent_question}` : rubric.parameter;

  // Rubric rows without a first page yet render the app's loading tiles (status "loading").
  const source = rubric.videos ?? [];
  const visible = applyRubricFilters(source, filters);
  // The sim only ships the first page of the rail, so a filtered total would be invented:
  // say the list is filtered instead of repeating the unfiltered count.
  const filtered = filters.platforms.length > 0 || filters.date_filter !== "all";
  const ids = visible.map((v) => v.content_item_id);
  const allSelected = ids.length > 0 && selection.count(railKey, ids) === ids.length;

  // Flip the rubric rail when filters or the rubric change.
  const railRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const capture = useCallback(() => {
    const tiles = railRef.current?.querySelectorAll("[data-flip]");
    if (tiles?.length && !prefersReducedMotion()) flipState.current = Flip.getState(tiles);
  }, []);
  useEffect(() => {
    if (!flipCaptureRef) return;
    flipCaptureRef.current = capture;
    return () => {
      if (flipCaptureRef.current === capture) flipCaptureRef.current = null;
    };
  }, [flipCaptureRef, capture]);
  const visibleKey = `${rubric.rubric_no}|${ids.join(",")}`;
  useLayoutEffect(() => {
    const state = flipState.current;
    flipState.current = null;
    if (!state) return;
    const tiles = railRef.current?.querySelectorAll("[data-flip]");
    if (!tiles?.length) return;
    Flip.from(state, {
      targets: tiles,
      duration: 0.42,
      ease: "ch.out",
      scale: false,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.32, ease: "ch.out", stagger: 0.03 }),
    });
  }, [visibleKey]);

  return (
    <section aria-label="Rubrics" className="mt-1 border-t pt-5">
      {/* Rubrics dropdown + predicate (QuestionResearchCanvas.tsx:316-325). */}
      <div className="pl-3.5 pr-3">
        <SimMenu
          id="rubrics"
          title="Rubrics"
          width={300}
          items={search.rubrics.map((r) => ({
            value: String(r.rubric_no),
            label: r.parent_question ? `${r.parameter} · ${r.parent_question}` : r.parameter,
            checked: r.rubric_no === rubric.rubric_no,
          }))}
          onSelect={(value) => {
            capture();
            onRubric(Number(value));
          }}
          trigger={(p) => {
            const { ref, ...rest } = p;
            return (
              <button
                ref={ref}
                type="button"
                {...rest}
                className="flex h-8 max-w-full items-center gap-1.5 rounded-[8px] px-1.5 text-[14px] font-medium text-ink-2 transition-colors duration-150 hover:bg-surface data-[open=true]:bg-surface"
              >
                <ListChecks aria-hidden className="size-4 shrink-0 text-muted" />
                <span className="truncate">
                  Rubrics <span aria-hidden className="text-faint">·</span> {rubricLabel}
                </span>
                <ChevronDown aria-hidden className="size-3.5 shrink-0 text-muted" />
              </button>
            );
          }}
        />
        <p key={rubric.rubric_no} className={cn(styles.enter, "mb-4 mt-1 max-w-[600px] pl-1.5 text-[14px] leading-[1.45] text-muted")}>
          {rubric.predicate}
        </p>
      </div>

      <RailHeader
        title={rubric.parameter}
        count={
          filtered && rubric.total != null ? `Filtered from ${rubric.total} videos` : rubric.total
        }
        label={rubric.parameter}
        allSelected={allSelected}
        onSelectAll={() => selection.setRail(railKey, ids, !allSelected)}
      />
      <div ref={railRef} className="mt-2.5">
        <Rail
          label={`${rubric.parameter} videos`}
          contentKey={visibleKey}
          describedBy={hintId}
          shimmer={source.length === 0 || (visible.length > 0 && visible.every((v) => isSkeletonTile(v.skeleton, v.status, v.card)))}
        >
          {source.length === 0
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={`loading-${rubric.rubric_no}-${i}`} role="listitem" data-flip className="snap-start">
                  <SimTile railKey="loading" id={`loading-${i}`} index={i} card={null} badge={null} status="loading" />
                </div>
              ))
            : visible.length === 0
              ? [
                  <p
                    key="empty"
                    className="grid shrink-0 place-items-center rounded-[14px] border border-dashed text-[13.5px] text-muted"
                    style={{ width: TILE_W * 2 + GAP, height: TILE_H }}
                  >
                    No videos match these filters.
                  </p>,
                ]
              : visible.map((v, i) => (
                  <div key={v.content_item_id} role="listitem" data-flip data-flip-id={v.content_item_id} className="snap-start">
                    <SimTile
                      railKey={railKey}
                      id={v.content_item_id}
                      index={i}
                      card={v.card}
                      badge={rubricBadge(v)}
                      skeleton={v.skeleton}
                      status={v.status}
                      selected={selection.isSelected(railKey, v.content_item_id)}
                      onToggleSelect={selection.toggle}
                      onOpen={onOpenTile}
                    />
                  </div>
                ))}
        </Rail>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------------------ Loading board

/** Tabs 2 and 3: the app's real loading state (QuestionResearchCanvas.tsx:31-37, :308). */
function LoadingBoard() {
  return (
    <div className="pb-8 pt-5" aria-busy="true">
      <p className="flex items-center gap-2 px-5 text-[14.5px] text-muted">
        <LoaderCircle aria-hidden className={cn(styles.spin, "size-3.5")} />
        Preparing research selections…
      </p>
      {/* Everything below the status line is skeleton: one sweep covers it. */}
      <div className="relative">
        {[0, 1].map((rail) => (
          <Fragment key={rail}>
            <div aria-hidden className="flex items-center justify-between pl-5 pr-5 pt-6">
              <span className={cn(styles.shimmer, "block h-[14px] w-[220px] rounded-[5px] bg-surface")} />
              <span data-anchor="right" className={cn(styles.shimmer, "block h-[12px] w-[56px] rounded-[5px] bg-surface")} />
            </div>
            <span aria-hidden className={cn(styles.shimmer, "mb-3 ml-5 mt-2 block h-[10px] w-[360px] rounded-[5px] bg-surface")} />
            <div className="flex gap-3 pl-5" aria-hidden inert>
              {[0, 1, 2].map((i) => (
                <SimTile key={i} railKey="loading" id={`l${rail}-${i}`} index={rail * 3 + i} card={null} badge={null} status="loading" />
              ))}
            </div>
          </Fragment>
        ))}
        <span aria-hidden className={styles.sweep} />
      </div>
    </div>
  );
}

