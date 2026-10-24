"use client";

/**
 * DeepSearchSimulator: a live, interactive replica of a completed Deep Search in the ContHunt app.
 *
 * Structure follows docs/revamp/specs/simulator-spec.md exactly (sidebar, header band, tab strip,
 * stacked research rails + rubric rail, right chat panel); the skin is the light ueumE system. The
 * board's filters (sort, date, platform) sit on the right of the header band, beside the prompt
 * title (owner, docs/revamp/sections/simulator-fullsize.md F).
 * Built on a 1280 x 800 design canvas and scaled to its container with --sim-scale (pure CSS).
 * The scale never drops below 0.6 (0.8 on phones): narrower frames pan horizontally instead.
 *
 *   <DeepSearchSimulator {...placeholderSimulatorProps} />
 *   <DeepSearchSimulator {...realData} activeSearchId="ds-q4-gifting" className="max-w-[960px]" />
 *
 * Props: `DeepSearchSimulatorProps` from src/content/simulator/types.ts (+ the extras below).
 * See ../README.md for feeding real data.
 *
 * Sidebar collapse "push" (224 <-> 64) is transform-only: the sidebar never resizes. The white main
 * surface slides over it, the main column's content FLIP-translates by 160px and every element marked
 * `data-anchor="right"` counter-translates so right-aligned controls stay put. Collapse commits the
 * new layout first and animates from the old position; expand animates first and commits at the end,
 * so no frame ever shows a half-laid-out board.
 *
 * Scrolling: the page owns the wheel until the visitor clicks or tabs into the frame. Then the board,
 * transcript and drawer take it, and hand it back at either end of their range (./scroll.ts).
 *
 * Markup budget: only the rails visible at rest mount on the server. The rest mount the first time
 * the visitor hovers, clicks or tabs into the frame (always before the board can scroll), so the
 * frame looks the same at rest and Home ships a fraction of the skeleton tiles (./board.tsx).
 *
 * Stub tabs (a placeholder search that is still `skeleton` with nothing to show) are filled with a
 * finished sample run on the client (./sample-runs.ts), so every tab reads as a completed search.
 */
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal, flushSync } from "react-dom";
import { Pencil, Search } from "lucide-react";
import type { DeepSearchSimulatorProps, SimFilterState } from "@/content/simulator/types";
import { captureOnce } from "@/lib/analytics";
import { EASE, gsap } from "@/lib/gsap";
import { observeInView } from "@/lib/media";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { Board, BoardFilters, type BoardSelection } from "./board";
import { ChatHeader, ChatPanel } from "./chat";
import { VideoDrawer, type DrawerTile } from "./drawer";
import { CANVAS_W, LayerProvider, useTooltip } from "./layer";
import { finishSampleRuns } from "./sample-runs";
import { SCROLL_AREA_ATTR, scrollAreaOverflow, scrollAreaProps } from "./scroll";
import styles from "./sim.module.css";
import { Sidebar } from "./sidebar";
import { TabStrip } from "./tabs";

export type { DeepSearchSimulatorProps } from "@/content/simulator/types";

const SIDEBAR_OPEN = 224;
const SIDEBAR_RAIL = 64;
const PUSH = SIDEBAR_OPEN - SIDEBAR_RAIL;

/** Tweens an element's max-width (a plain object proxy: GSAP's CSS plugin skips max-width on this flex item). */
function widthTween(el: HTMLElement, from: number, to: number) {
  const proxy = { w: from };
  el.style.maxWidth = `${from}px`;
  return gsap.to(proxy, { w: to, duration: 0.42, ease: EASE.out, onUpdate: () => void (el.style.maxWidth = `${proxy.w}px`) });
}

/** Room the header band leaves the title in the current layout: the band minus the filters and the 16px gap. */
function titleRoom(title: HTMLElement): number {
  const band = title.parentElement;
  const filters = band?.querySelector<HTMLElement>('[data-anchor="right"]');
  return (band?.clientWidth ?? 0) - (filters ? filters.offsetWidth + 16 : 0);
}
const DEFAULT_FILTERS: SimFilterState = { sort: "default", date_filter: "all", platforms: [] };
const MOBILE_QUERY = "(max-width: 767px)";
/** Touch engagement ends after this long without a touch or scroll inside the frame. */
const TOUCH_IDLE_MS = 2500;

function subscribeMobile(cb: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}

export interface DeepSearchSimulatorExtraProps {
  /**
   * When false the canvas ignores pointer input (used while a scroll-jack is still moving it).
   * Default true.
   */
  live?: boolean;
  /** Accessible name for the frame. */
  label?: string;
  /**
   * "engage" (default): the page keeps the wheel until a click or focus inside the frame.
   * "free": the board and transcript always scroll (the Full Control dialog, which locks the page).
   */
  scrollMode?: "engage" | "free";
  /** Called when the visitor switches deep-search tabs. */
  onActiveSearchChange?: (id: string) => void;
}

export function DeepSearchSimulator({
  searches: searchesProp,
  activeSearchId,
  sidebar,
  recents,
  composer,
  filters: initialFilters,
  className,
  live = true,
  label = "Product demo: a completed Deep Search",
  scrollMode = "engage",
  onActiveSearchChange,
}: DeepSearchSimulatorProps & DeepSearchSimulatorExtraProps) {
  const idPrefix = useId().replace(/:/g, "");
  const searches = useMemo(() => finishSampleRuns(searchesProp), [searchesProp]);
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const mainBgRef = useRef<HTMLDivElement>(null);
  const mainInnerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const animating = useRef(false);

  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const [sheetLayer, setSheetLayer] = useState<HTMLDivElement | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeId, setActiveId] = useState(activeSearchId ?? searches[0]?.id ?? "");
  const [filters, setFilters] = useState<SimFilterState>(initialFilters ?? DEFAULT_FILTERS);
  // The rubric rail records its tiles before a filter change so it can animate it (./board.tsx).
  const flipCaptureRef = useRef<(() => void) | null>(null);
  const changeFilters = useCallback((next: SimFilterState) => {
    flipCaptureRef.current?.();
    setFilters(next);
  }, []);
  const [rubricNo, setRubricNo] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<string, true>>({});
  const [drawer, setDrawer] = useState<DrawerTile | null>(null);
  const [engaged, setEngaged] = useState(false);
  const engagedRef = useRef(false);
  const free = scrollMode === "free";
  const ownsWheel = free || engaged;

  // Later rails mount on first engagement and stay mounted (derived during render, React's
  // documented pattern for state that follows another value).
  const [expanded, setExpanded] = useState(free);
  if (ownsWheel && !expanded) setExpanded(true);

  useEffect(() => {
    engagedRef.current = engaged;
  }, [engaged]);

  // Phones start with the rail so the board gets the width; the user's toggle wins afterwards.
  const isMobile = useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE_QUERY).matches, () => false);
  const [layoutPref, setLayoutPref] = useState<boolean | null>(null);
  const [visualPref, setVisualPref] = useState<boolean | null>(null);
  const defaultCollapsed = sidebar.collapsed || isMobile;
  const collapsed = layoutPref ?? defaultCollapsed;
  const labelsCollapsed = visualPref ?? defaultCollapsed;

  const search = searches.find((s) => s.id === activeId) ?? searches[0];
  const activeRubric = rubricNo ?? search?.rubrics[0]?.rubric_no ?? 1;

  // ------------------------------------------------------------------------- tab switching

  const pickSearch = useCallback(
    (id: string) => {
      if (id === activeId) return;
      setActiveId(id);
      setRubricNo(null);
      setDrawer(null);
      setOpenMenu(null);
      boardRef.current?.scrollTo({ top: 0 });
      onActiveSearchChange?.(id);
    },
    [activeId, onActiveSearchChange],
  );

  // ---------------------------------------------------------------------------- selection

  const toggleSelected = useCallback(
    (rail: string, id: string) =>
      setSelected((s) => {
        const key = `${rail}|${id}`;
        const next = { ...s };
        if (next[key]) delete next[key];
        else next[key] = true;
        return next;
      }),
    [],
  );
  const setRailSelected = useCallback(
    (rail: string, ids: string[], on: boolean) =>
      setSelected((s) => {
        const next = { ...s };
        for (const id of ids) {
          const key = `${rail}|${id}`;
          if (on) next[key] = true;
          else delete next[key];
        }
        return next;
      }),
    [],
  );
  const selection = useMemo<BoardSelection>(
    () => ({
      isSelected: (rail, id) => !!selected[`${rail}|${id}`],
      count: (rail, ids) => ids.reduce((n, id) => n + (selected[`${rail}|${id}`] ? 1 : 0), 0),
      toggle: toggleSelected,
      setRail: setRailSelected,
    }),
    [selected, toggleSelected, setRailSelected],
  );

  // ----------------------------------------------------------------------- sidebar push

  const toggleSidebar = useCallback(() => {
    if (animating.current) return;
    const bg = mainBgRef.current;
    const inner = mainInnerRef.current;
    const reduced = prefersReducedMotion() || !bg || !inner;
    setOpenMenu(null);

    if (!collapsed) {
      // Collapse: commit the wide layout now, then slide in from the old position.
      flushSync(() => {
        setLayoutPref(true);
        setVisualPref(true);
      });
      if (reduced) return;
      const rights = Array.from(inner.querySelectorAll<HTMLElement>('[data-anchor="right"]'));
      // The title row slides with the column but must stay clear of the fixed filters: its width
      // follows the slide, so its right edge never moves and the ellipsis tracks the motion.
      const title = inner.querySelector<HTMLElement>("[data-title-row]");
      const titleW = title?.offsetWidth ?? 0;
      const titleNarrow = title ? Math.min(titleW, titleRoom(title) - PUSH) : 0;
      animating.current = true;
      const tl = gsap.timeline({
        defaults: { duration: 0.42, ease: EASE.out },
        onComplete: () => {
          gsap.set([inner, ...rights, ...(title ? [title] : [])], { clearProps: "transform" });
          title?.style.removeProperty("max-width");
          animating.current = false;
        },
      });
      tl.fromTo(bg, { x: PUSH }, { x: 0 }, 0)
        .fromTo(inner, { x: PUSH }, { x: 0 }, 0)
        .fromTo(rights, { x: -PUSH }, { x: 0 }, 0);
      if (title) tl.add(widthTween(title, Math.max(0, titleNarrow), titleW), 0);
      return;
    }

    // Expand: animate within the current layout, then commit the narrow layout at the end.
    setVisualPref(false);
    if (reduced) {
      setLayoutPref(false);
      return;
    }
    const rights = Array.from(inner.querySelectorAll<HTMLElement>('[data-anchor="right"]'));
    const title = inner.querySelector<HTMLElement>("[data-title-row]");
    const titleW = title?.offsetWidth ?? 0;
    const titleNarrow = title ? Math.min(titleW, titleRoom(title) - PUSH) : 0;
    animating.current = true;
    const tl = gsap.timeline({
      defaults: { duration: 0.42, ease: EASE.out },
      onComplete: () => {
        flushSync(() => setLayoutPref(false));
        gsap.set([inner, ...rights, ...(title ? [title] : [])], { clearProps: "transform" });
          title?.style.removeProperty("max-width");
        animating.current = false;
      },
    });
    tl.to(bg, { x: PUSH }, 0).to(inner, { x: PUSH }, 0).to(rights, { x: -PUSH }, 0);
    // Same rule as the collapse: the title narrows as it slides, so it never runs under the filters.
    if (title) tl.add(widthTween(title, titleW, Math.max(0, titleNarrow)), 0);
  }, [collapsed]);

  // ------------------------------------------------------------- engagement and visibility

  // A click outside the frame hands the wheel back to the page.
  useEffect(() => {
    if (!engaged) return;
    const onDown = (e: PointerEvent) => {
      if (!hostRef.current?.contains(e.target as Node)) setEngaged(false);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [engaged]);

  // Edge hand-off: at either end of a scroll area the gesture goes back to the page. The
  // attribute comes off synchronously (capture phase on the host), before Lenis reads the event
  // on window, so the very same wheel event already scrolls the page.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || free) return;
    const onWheel = (e: WheelEvent) => {
      if (!engagedRef.current || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const area = (e.target as Element | null)?.closest?.<HTMLElement>(`[${SCROLL_AREA_ATTR}]`);
      if (!area || !host.contains(area)) return;
      const max = area.scrollHeight - area.clientHeight;
      const atStart = area.scrollTop <= 1;
      const atEnd = area.scrollTop >= max - 1;
      if (max > 1 && !(e.deltaY < 0 && atStart) && !(e.deltaY > 0 && atEnd)) return;
      for (const el of host.querySelectorAll("[data-lenis-prevent-wheel]")) el.removeAttribute("data-lenis-prevent-wheel");
      engagedRef.current = false;
      setEngaged(false);
    };
    host.addEventListener("wheel", onWheel, { capture: true, passive: true });
    return () => host.removeEventListener("wheel", onWheel, { capture: true });
  }, [free]);

  // Touch engagement also ends after a short idle, so a tablet visitor is never stuck in the board
  // (mouse engagement ends when the pointer leaves the frame).
  const touchIdle = useRef<number | undefined>(undefined);
  const touchEngaged = useRef(false);
  const bumpTouchIdle = useCallback(() => {
    if (!touchEngaged.current) return;
    window.clearTimeout(touchIdle.current);
    touchIdle.current = window.setTimeout(() => {
      touchEngaged.current = false;
      setEngaged(false);
    }, TOUCH_IDLE_MS);
  }, []);
  useEffect(() => {
    if (!engaged) {
      touchEngaged.current = false;
      window.clearTimeout(touchIdle.current);
      return;
    }
    const host = hostRef.current;
    if (!host) return;
    host.addEventListener("scroll", bumpTouchIdle, { capture: true, passive: true });
    return () => host.removeEventListener("scroll", bumpTouchIdle, { capture: true });
  }, [engaged, bumpTouchIdle]);
  useEffect(() => () => window.clearTimeout(touchIdle.current), []);

  // The skeleton sweep and the spinner exist only while the frame is on screen (sim.module.css):
  // offscreen, no animation is attached at all, so no compositor layers are held.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    return observeInView(host, (entry) => (host.dataset.simPlay = entry.isIntersecting ? "running" : "idle"), {
      rootMargin: "80px 0px",
    });
  }, []);

  // Fallback for browsers without CSS trig functions: measure the scale in JS (same 0.6 floor).
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || CSS.supports("width", "calc(1px * tan(atan2(1px, 2px)))")) return;
    host.setAttribute("data-scale-fallback", "");
    const ro = new ResizeObserver(() =>
      host.style.setProperty("--sim-scale-js", String(Math.max(0.6, host.clientWidth / CANVAS_W))),
    );
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  if (!search) return null;

  const drawerNode = (
    <VideoDrawer tile={drawer} onClose={() => setDrawer(null)} ownsWheel={ownsWheel} variant={isMobile ? "sheet" : "side"} />
  );

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <div
          ref={hostRef}
          role="region"
          aria-label={label}
          tabIndex={-1}
          className={cn(styles.host, "outline-none", live ? "" : "pointer-events-none")}
          onPointerEnter={() => setExpanded(true)}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse") return;
            touchEngaged.current = true;
            bumpTouchIdle();
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") setEngaged(false);
          }}
          onFocus={() => setEngaged(true)}
          onBlur={(e) => {
            if (!hostRef.current?.contains(e.relatedTarget as Node)) setEngaged(false);
          }}
          data-engaged={engaged || undefined}
        >
          <div className={styles.scaler}>
            {/* Pan snap points: board, then chat. */}
            <span aria-hidden className={cn(styles.snapStart, "absolute left-0 top-0 h-px w-px")} />
            <span aria-hidden className={cn(styles.snapEnd, "absolute right-0 top-0 h-px w-px")} />
            <div
              ref={canvasRef}
              className={styles.canvas}
              onPointerDown={() => setEngaged(true)}
              onKeyDown={(e) => {
                if (e.key !== "Escape" || e.defaultPrevented) return;
                if (drawer) {
                  // preventDefault keeps a surrounding Full Control dialog open: Esc closed the drawer.
                  e.preventDefault();
                  setDrawer(null);
                } else if (!collapsed && !free) {
                  // The app's Escape collapses the sidebar (simulator-spec §2). In the Full Control
                  // dialog Esc is the way back to the page instead (simulator-fullsize.md B).
                  e.preventDefault();
                  toggleSidebar();
                }
              }}
            >
              <LayerProvider value={{ canvasRef, overlay, openMenu, setOpenMenu }}>
                <Sidebar
                  sidebar={sidebar}
                  recents={recents}
                  activeId={search.id}
                  onPickChat={pickSearch}
                  collapsed={labelsCollapsed}
                  onToggle={toggleSidebar}
                />

                {/* Main surface: slides over the sidebar (transform only). */}
                <div
                  ref={mainBgRef}
                  aria-hidden
                  className="absolute bottom-2 top-2 w-[900px] rounded-l-[14px] bg-paper shadow-[inset_1px_0_0_var(--hairline),inset_0_1px_0_var(--hairline),inset_0_-1px_0_var(--hairline),-1px_0_3px_-1px_rgb(15_15_15/0.05)]"
                  style={{ left: SIDEBAR_RAIL, transform: `translateX(${collapsed ? 0 : PUSH}px)` }}
                />

                <div
                  className="absolute bottom-2 right-2 top-2 flex"
                  style={{ left: collapsed ? SIDEBAR_RAIL : SIDEBAR_OPEN, "--sim-main-left": `${collapsed ? SIDEBAR_RAIL : SIDEBAR_OPEN}px` } as CSSProperties}
                >
                  {/* Main column: header rows + board. Not clipped, so it can slide under the chat. */}
                  <div className="relative min-w-0 flex-1">
                    <div ref={mainInnerRef} className="flex h-full flex-col">
                      {/* Row A: canvas title row (ChatTitle.tsx), then the board filters on the right.
                          The title truncates before it reaches them. */}
                      <div className="flex h-[52px] shrink-0 items-center border-b pl-4 pr-3">
                        <div className={cn(styles.headerBand, "flex min-w-0 flex-1 items-center gap-4")}>
                          <TitleRow key={search.id} title={search.chat_title} />
                          {search.skeleton || search.rubrics.length === 0 ? null : (
                            <BoardFilters filters={filters} onFilters={changeFilters} className="ml-auto" />
                          )}
                        </div>
                      </div>
                      {/* Row B: tab strip + the one "N videos" count (hidden while a tab is still loading). */}
                      <div className="flex h-[48px] shrink-0 items-center border-b pl-3 pr-4">
                        <TabStrip searches={searches} activeId={search.id} onChange={pickSearch} idPrefix={idPrefix} />
                        <span
                          data-anchor="right"
                          aria-hidden={search.skeleton || undefined}
                          className={cn(
                            "ml-auto pl-3 font-mono text-[12.5px] tabular-nums text-muted transition-opacity duration-200",
                            search.skeleton ? "opacity-0" : "",
                          )}
                        >
                          {search.approved_budget.videos} videos
                        </span>
                      </div>
                      {/* Board */}
                      <BoardArea
                        boardRef={boardRef}
                        idPrefix={idPrefix}
                        searchId={search.id}
                        ownsWheel={ownsWheel}
                        showHint={!free && !engaged && !search.skeleton}
                      >
                        <Board
                          search={search}
                          filters={filters}
                          flipCaptureRef={flipCaptureRef}
                          rubricNo={activeRubric}
                          onRubric={setRubricNo}
                          selection={selection}
                          onOpenTile={(tile) => {
                            captureOnce("simulator:video", "simulator_milestone", { milestone: "video_opened" });
                            setDrawer(tile);
                          }}
                          deferred={!expanded}
                        />
                      </BoardArea>
                    </div>
                  </div>

                  {/* Right chat panel (ChatSidebar). Opaque and above the main column. On phones
                      it is exactly one frame wide (--sim-chat-w) so the Agent stop is flush. */}
                  <aside
                    aria-label="Agent chat"
                    className="relative z-10 flex shrink-0 flex-col rounded-r-[14px] bg-paper shadow-[inset_1px_0_0_var(--hairline),inset_0_1px_0_var(--hairline),inset_-1px_0_0_var(--hairline),inset_0_-1px_0_var(--hairline)]"
                    style={{ width: "var(--sim-chat-w, 352px)" }}
                  >
                    <div className="h-[52px] shrink-0 border-b">
                      <ChatHeader />
                    </div>
                    <div className="min-h-0 flex-1">
                      <ChatPanel search={search} composer={composer} ownsWheel={ownsWheel} />
                    </div>
                  </aside>

                  {isMobile ? null : drawerNode}
                </div>

                <div ref={setOverlay} className="pointer-events-none absolute inset-0 z-50" />
              </LayerProvider>
            </div>
          </div>
        </div>
        {/* Phones: the drawer is a 1:1 bottom sheet over the visible pan window, never off-screen. */}
        <div ref={setSheetLayer} className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[18px] md:hidden" />
        {isMobile && sheetLayer ? createPortal(drawerNode, sheetLayer) : null}
      </div>
      <PanControl hostRef={hostRef} />
    </div>
  );
}

/** Hover dwell before the scroll hint appears, and how long it stays. */
const HINT_DELAY_MS = 450;
const HINT_SHOW_MS = 2800;

/**
 * The board scroll area plus the "Click to scroll the board" hint. The hint is taught once: it
 * appears after a short hover dwell, centred on the board's bottom fade (never over a tile's
 * metrics), leaves on its own after ~3s and never returns once the visitor has engaged the frame.
 */
function BoardArea({
  boardRef,
  idPrefix,
  searchId,
  ownsWheel,
  showHint,
  children,
}: {
  boardRef: RefObject<HTMLDivElement | null>;
  idPrefix: string;
  searchId: string;
  ownsWheel: boolean;
  showHint: boolean;
  children: ReactNode;
}) {
  const [hint, setHint] = useState<"idle" | "show" | "done">("idle");
  const timer = useRef<number | undefined>(undefined);
  if (ownsWheel && hint !== "done") setHint("done");
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onEnter = () => {
    if (hint !== "idle" || !showHint) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setHint("show");
      timer.current = window.setTimeout(() => setHint("done"), HINT_SHOW_MS);
    }, HINT_DELAY_MS);
  };
  const onLeave = () => {
    if (hint === "idle") window.clearTimeout(timer.current);
    else if (hint === "show") {
      window.clearTimeout(timer.current);
      setHint("done");
    }
  };

  return (
    <div className="relative min-h-0 flex-1" onPointerEnter={onEnter} onPointerLeave={onLeave}>
      <div
        ref={boardRef}
        id={`${idPrefix}-panel`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${searchId}`}
        className={cn(styles.noScrollbar, styles.fadeBoard, "absolute inset-0 overflow-x-hidden", scrollAreaOverflow(ownsWheel))}
        {...scrollAreaProps(ownsWheel)}
      >
        <div key={searchId} className={styles.enter}>
          {children}
        </div>
      </div>
      <p
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-3.5 left-1/2 z-[4] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-paper",
          "shadow-[0_6px_16px_-8px_rgb(15_15_15/0.5)] transition-[opacity,translate] duration-300 ease-out",
          hint === "show" && showHint ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
        )}
      >
        Click to scroll the board
      </p>
    </div>
  );
}

function TitleRow({ title }: { title: string }) {
  const tip = useTooltip("bottom");
  return (
    <div data-title-row="" className={cn(styles.enter, "group/title flex min-w-0 items-center gap-2.5")}>
      <Search aria-hidden className="size-[18px] shrink-0 text-muted" strokeWidth={1.9} />
      <p className="truncate text-[17px] font-medium tracking-[-0.012em] text-ink">{title}</p>
      <button
        type="button"
        aria-label="Rename chat"
        {...tip.bind("Rename chat")}
        className="grid size-6 shrink-0 place-items-center rounded-[6px] text-muted opacity-0 transition-[opacity,background-color] duration-150 hover:bg-surface hover:text-ink focus-visible:opacity-100 group-hover/title:opacity-100"
      >
        <Pencil aria-hidden className="size-3.5" />
      </button>
      {tip.node}
    </div>
  );
}

/**
 * Pan control, shown whenever the frame is narrower than the canvas at its legibility floor
 * (phones, and tablet letterboxes): two stops, the board and the agent chat.
 */
function PanControl({ hostRef }: { hostRef: RefObject<HTMLDivElement | null> }) {
  const [pannable, setPannable] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const measure = () => {
      const range = host.scrollWidth - host.clientWidth;
      setPannable(range > 4);
      setAtEnd(range > 4 && host.scrollLeft > range / 2);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    host.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      host.removeEventListener("scroll", measure);
    };
  }, [hostRef]);
  const go = (end: boolean) => {
    const host = hostRef.current;
    if (!host) return;
    host.scrollTo({ left: end ? host.scrollWidth : 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  if (!pannable) return null;
  return (
    <div className="mt-3 flex items-center justify-between gap-4">
      <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-ink-2/75">Pan to explore</p>
      <div className="flex rounded-[12px] bg-surface p-1 text-[14px] font-medium" role="group" aria-label="Pan the demo">
        {[
          { end: false, label: "Board" },
          { end: true, label: "Agent" },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            aria-pressed={atEnd === o.end}
            onClick={() => go(o.end)}
            className={cn(
              "h-11 min-w-[72px] rounded-[9px] px-4 outline-none transition-[background-color,color,box-shadow] duration-200",
              "focus-visible:shadow-[0_0_0_2px_var(--accent)]",
              atEnd === o.end ? "bg-paper text-ink shadow-[0_1px_2px_rgb(15_15_15/0.08)]" : "text-ink-2/75",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
