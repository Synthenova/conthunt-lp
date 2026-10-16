"use client";

/**
 * Step 02 visual: the X-reference adaptation, rebuilt for a light editorial page.
 *
 *   Panel A (≈43%)  the prompt splits into Q rows (questions to answer) and P rows
 *                   (weighted parameters to score), drawn as a tree with DrawSVG.
 *   Panel B (≈57%)  Q rows fan out across the seam into keyword searches, the
 *                   searches merge into one run that splits into 3 platform lanes,
 *                   then a relevance gate sweeps a sample grid (off-topic stays gray).
 *
 * Layout: the panels sit side by side from md. Panel B is a size container: when it
 * is wide enough (≥400px of content, i.e. 1440px+ desktops) the keywords and lanes
 * form a row (horizontal merge); when narrower (1280-1366 laptops, tablet, phone) the
 * lanes drop below and the merge runs down a bus on the right, so keyword chips are
 * never truncated. Connector geometry is measured from layout (offset boxes, so
 * running transforms never skew it) and re-measured on resize.
 *
 * Interaction: hovering, tapping (touch) or focusing (keyboard: one tab stop, arrow
 * keys move, Enter pins, Escape clears) a Q row or a keyword lights its path (P rows only light themselves).
 * Playback: at 40% visibility the plan plays two passes (the locked frame holds 4.4s
 * between them), then rests on the locked frame with a Replay control (Pause while it
 * runs, WCAG 2.2.2). Once the stage has fully left the viewport it re-arms, so the
 * next visit plays again: it loops only while in view and never forever next to the
 * text. Reduced motion shows the finished frame.
 */
import { Check, MousePointer2, Pause, Play, RotateCcw } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK, usePrefersReducedMotion } from "@/lib/motion";
import { KEYWORD_BUDGET, type Scenario } from "./content";
import { PlatformGlyph } from "./glyphs";
import { useHiw } from "./hiw-context";
import { buildPlanTimeline } from "./plan-timeline";
import { playWhenVisible, type VisibilityPlayback } from "./playback";
import { formatClock, PLATFORM_LABEL, POSTER_H, POSTER_W, thumb, type Platform } from "./thumbs";
import styles from "./hiw.module.css";

/** Planning + collection time shown on the step 02 clock (an example run). */
const PLAN_CLOCK = 52;
const LANE_ORDER: Platform[] = ["tiktok", "instagram", "youtube"];

/* ------------------------------------------------------------- geometry */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Geometry {
  w: number;
  h: number;
  sideBySide: boolean;
  flowRow: boolean;
  seamX: number;
  prompt: Box;
  rows: Record<string, { x: number; y: number; r: number }>;
  chips: { x: number; r: number; y: number; b: number }[];
  lanes: { x: number; y: number; t: number }[];
}

/** The question ids among a keyword's sources: only questions are wired to keyword searches. */
function questionIds(from: string[]): string[] {
  return from.filter((id) => id.startsWith("q"));
}

function offsetBox(el: HTMLElement, ancestor: HTMLElement): Box {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

function measure(body: HTMLElement): Geometry | null {
  const q = (s: string) => body.querySelector<HTMLElement>(s);
  const prompt = q("[data-plan-prompt]");
  const left = q("[data-plan-left]");
  const right = q("[data-plan-right]");
  if (!prompt || !left || !right) return null;
  const lb = offsetBox(left, body);
  const rb = offsetBox(right, body);
  const rows: Geometry["rows"] = {};
  body.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
    const b = offsetBox(row, body);
    rows[row.dataset.row as string] = { x: b.x, y: Math.round(b.y + b.h / 2) + 0.5, r: b.x + b.w };
  });
  const chips = Array.from(body.querySelectorAll<HTMLElement>("[data-chip]")).map((chip) => {
    const b = offsetBox(chip, body);
    return { x: b.x, r: b.x + b.w, y: Math.round(b.y + b.h / 2) + 0.5, b: b.y + b.h };
  });
  const lanes = Array.from(body.querySelectorAll<HTMLElement>("[data-lane]")).map((lane) => {
    const b = offsetBox(lane, body);
    return { x: b.x, y: Math.round(b.y + 9) + 0.5, t: b.y };
  });
  return {
    w: body.offsetWidth,
    h: body.offsetHeight,
    sideBySide: rb.x > lb.x + 10 && Math.abs(rb.y - lb.y) < 4,
    flowRow: lanes.length > 0 && chips.length > 0 && lanes[0].x > chips[0].r + 24,
    seamX: lb.x + lb.w,
    prompt: offsetBox(prompt, body),
    rows,
    chips,
    lanes,
  };
}

/** Every anchor that shapes a connector, so any layout change rebuilds the paths. */
function geometryKey(g: Geometry | null): string {
  if (!g) return "none";
  const rows = Object.entries(g.rows).map(([id, r]) => `${id}${r.x},${r.y},${r.r}`);
  const chips = g.chips.map((c) => `${c.x},${c.y},${c.r}`);
  const lanes = g.lanes.map((l) => `${l.x},${l.t}`);
  return [g.w, g.h, g.seamX, g.sideBySide, g.flowRow, g.prompt.y + g.prompt.h, rows, chips, lanes].join("|");
}

interface Link {
  key: string;
  d: string;
  kind: "spine-q" | "spine-p" | "tick-q" | "tick-p" | "fan" | "merge" | "split";
  hl: string;
}

function buildLinks(g: Geometry, scenario: Scenario): { links: Link[]; node: { x: number; y: number } | null } {
  const links: Link[] = [];
  const sx = g.prompt.x + 12.5;
  const q4 = g.rows.q4;
  const p5 = g.rows.p5;
  const top = g.prompt.y + g.prompt.h;
  if (q4) links.push({ key: "spine-q", kind: "spine-q", d: `M${sx} ${top} V${q4.y}`, hl: "" });
  if (q4 && p5) links.push({ key: "spine-p", kind: "spine-p", d: `M${sx} ${q4.y} V${p5.y}`, hl: "" });
  for (const [id, row] of Object.entries(g.rows)) {
    links.push({ key: `tick-${id}`, kind: id.startsWith("q") ? "tick-q" : "tick-p", d: `M${sx} ${row.y} H${row.x + 24}`, hl: id });
  }

  // Only the questions fan out into keyword searches; the parameters have no path.
  if (g.sideBySide) {
    scenario.keywords.forEach((k, i) => {
      const chip = g.chips[i];
      if (!chip) return;
      for (const id of questionIds(k.from)) {
        const row = g.rows[id];
        if (!row) continue;
        const d = (chip.x - g.seamX) * 0.55;
        links.push({
          key: `fan-${id}-${i}`,
          kind: "fan",
          d: `M${row.r + 6} ${row.y} H${g.seamX} C${g.seamX + d} ${row.y} ${chip.x - d} ${chip.y} ${chip.x} ${chip.y}`,
          hl: `${id} k${i + 1}`,
        });
      }
    });
  }

  let node: { x: number; y: number } | null = null;
  if (g.lanes.length && g.chips.length) {
    if (g.flowRow) {
      // Keywords | lanes in a row: curves converge on a node left of the lanes.
      const laneX = g.lanes[0].x;
      const midY = (g.lanes[0].y + g.lanes[g.lanes.length - 1].y) / 2;
      const n = { x: laneX - 22, y: midY };
      node = n;
      g.chips.forEach((chip, i) => {
        const d = (n.x - chip.r) * 0.6;
        links.push({
          key: `merge-${i}`,
          kind: "merge",
          d: `M${chip.r} ${chip.y} C${chip.r + d} ${chip.y} ${n.x - d} ${n.y} ${n.x} ${n.y}`,
          hl: `k${i + 1}`,
        });
      });
      g.lanes.forEach((lane, i) => {
        links.push({
          key: `split-${i}`,
          kind: "split",
          d: `M${n.x} ${n.y} C${n.x + 12} ${n.y} ${lane.x - 12} ${lane.y} ${lane.x - 4} ${lane.y}`,
          hl: "",
        });
      });
    } else {
      // Lanes below the keywords: each keyword joins a bus on the right, the bus runs
      // down to the node, and the node branches left into the three lanes.
      const r = 5;
      const busX = Math.max(...g.chips.map((c) => c.r)) + 14.5;
      const last = g.chips[g.chips.length - 1];
      const laneTop = Math.min(...g.lanes.map((l) => l.t));
      const n = { x: busX, y: Math.round((last.b + laneTop) / 2) + 0.5 };
      node = n;
      g.chips.forEach((chip, i) => {
        links.push({
          key: `merge-${i}`,
          kind: "merge",
          d: `M${chip.r} ${chip.y} H${busX - r} Q${busX} ${chip.y} ${busX} ${chip.y + r} V${n.y}`,
          hl: `k${i + 1}`,
        });
      });
      g.lanes.forEach((lane, i) => {
        const lx = lane.x + 6.5;
        links.push({
          key: `split-${i}`,
          kind: "split",
          d: `M${n.x} ${n.y} H${lx + r} Q${lx} ${n.y} ${lx} ${n.y + r} V${lane.t - 3}`,
          hl: "",
        });
      });
    }
  }

  return { links, node };
}

/* ------------------------------------------------------------ component */

export interface PlanStageProps {
  className?: string;
  /** Short pointer hint shown in the window bar from lg ("Hover any row…"). */
  hint?: string;
  /** Touch variant of the hint (coarse pointers). */
  hintTouch?: string;
}

export function PlanStage({ className, hint, hintTouch }: PlanStageProps) {
  const { scenario, runKey } = useHiw();
  const reduced = usePrefersReducedMotion();
  const root = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const statusRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const doneRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const playback = useRef<VisibilityPlayback | null>(null);
  const sticky = useRef<string | null>(null);
  /** Run id ("scenario:runKey:replay") whose last pass reached the locked frame. */
  const restedRun = useRef<string | null>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [paused, setPaused] = useState(false);
  const [resting, setResting] = useState(false);
  /** Run counter: `manual` runs (Replay) play one pass, visit runs play two. */
  const [run, setRun] = useState({ n: 0, manual: false });
  /** The trace item that owns the single tab stop (roving tabindex). */
  const [focusId, setFocusId] = useState("q1");
  const geoKey = geometryKey(geo);
  const runId = `${scenario.id}:${runKey}:${run.n}`;

  // Measure connector anchors from layout; re-measure when the stage resizes.
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    let frame = 0;
    let last = "";
    const run = () => {
      frame = 0;
      const next = measure(el);
      const key = geometryKey(next);
      if (key !== last) {
        last = key;
        setGeo(next);
      }
    };
    const ro = new ResizeObserver(() => {
      if (!frame) frame = requestAnimationFrame(run);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const { links, node } = useMemo(
    () => (geo ? buildLinks(geo, scenario) : { links: [], node: null }),
    // geoKey captures every geometry change that matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geoKey, scenario],
  );

  const setStatus = useCallback((text: string, done = false) => {
    statusRefs.current.forEach((el) => el && (el.textContent = text));
    doneRefs.current.forEach((el) => el && (el.style.opacity = done ? "1" : "0"));
  }, []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !geo) return;
      // A layout change after the run has rested keeps the finished frame (no replay).
      if (restedRun.current === runId) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        setResting(false);
        const laneValues = LANE_ORDER.map((p) => scenario.lanes[p]);
        const tl = buildPlanTimeline(el, {
          found: scenario.found,
          passed: scenario.passed,
          lanes: laneValues,
          clockTo: PLAN_CLOCK,
          passes: run.manual ? 1 : 2,
          status: setStatus,
          onRest: () => {
            restedRun.current = runId;
            playback.current?.rest();
            setResting(true);
          },
        });
        const pb = playWhenVisible(el, tl, {
          // Fully scrolled away after resting: arm a fresh run for the next visit.
          onRearm: () => setRun((r) => ({ n: r.n + 1, manual: false })),
        });
        playback.current = pb;
        return () => {
          pb.stop();
          playback.current = null;
          writeFinished(el, scenario);
          setStatus("Plan locked", true);
          setResting(true);
        };
      });
    },
    { scope: root, dependencies: [runId, geoKey], revertOnUpdate: true },
  );

  // A new brief or a replay restarts the run, so a previous pause should not carry over.
  const [pausedFor, setPausedFor] = useState(runId);
  if (pausedFor !== runId) {
    setPausedFor(runId);
    setPaused(false);
  }

  const onControl = () => {
    if (resting) {
      setRun((r) => ({ n: r.n + 1, manual: true }));
      return;
    }
    const next = !paused;
    setPaused(next);
    playback.current?.setUserPaused(next);
  };

  // Highlight a row/keyword and everything wired to it. Touch taps pin the highlight.
  const highlight = (id: string | null) => {
    const scope = body.current;
    if (!scope) return;
    scope.querySelectorAll(".is-hl").forEach((n) => n.classList.remove("is-hl"));
    if (!id) return;
    scope.querySelectorAll(`[data-hl~="${id}"]`).forEach((n) => n.classList.add("is-hl"));
  };
  const traceIds = useMemo(
    () => [
      ...scenario.questions.map((_, i) => `q${i + 1}`),
      ...scenario.parameters.map((_, i) => `p${i + 1}`),
      ...scenario.keywords.map((_, i) => `k${i + 1}`),
    ],
    [scenario],
  );
  const togglePin = (id: string) => {
    sticky.current = sticky.current === id ? null : id;
    highlight(sticky.current ?? id);
  };
  const hoverProps = (id: string) => ({
    "data-trace": id,
    tabIndex: focusId === id ? 0 : -1,
    onPointerEnter: (e: ReactPointerEvent) => {
      if (e.pointerType !== "touch") highlight(id);
    },
    onPointerLeave: (e: ReactPointerEvent) => {
      if (e.pointerType !== "touch") highlight(sticky.current);
    },
    onPointerUp: (e: ReactPointerEvent) => {
      if (e.pointerType !== "touch") return;
      sticky.current = sticky.current === id ? null : id;
      highlight(sticky.current);
    },
    onFocus: () => {
      setFocusId(id);
      highlight(id);
    },
    onBlur: () => highlight(sticky.current),
  });
  // One tab stop for the whole trace: arrows move, Enter/Space pins, Escape clears.
  const onTraceKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const current = (e.target as HTMLElement).closest<HTMLElement>("[data-trace]")?.dataset.trace;
    if (!current) return;
    const i = traceIds.indexOf(current);
    let next: string | undefined;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = traceIds[Math.min(traceIds.length - 1, i + 1)];
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = traceIds[Math.max(0, i - 1)];
    else if (e.key === "Home") next = traceIds[0];
    else if (e.key === "End") next = traceIds[traceIds.length - 1];
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      togglePin(current);
      return;
    } else if (e.key === "Escape") {
      sticky.current = null;
      highlight(null);
      return;
    }
    if (!next) return;
    e.preventDefault();
    setFocusId(next);
    body.current?.querySelector<HTMLElement>(`[data-trace="${next}"]`)?.focus();
  };

  const rowHl = (id: string) =>
    [id, ...scenario.keywords.flatMap((k, i) => (questionIds(k.from).includes(id) ? [`k${i + 1}`] : []))].join(" ");
  const maxWeight = Math.max(...scenario.parameters.map(([, w]) => w));
  const laneMax = Math.max(...LANE_ORDER.map((p) => scenario.lanes[p]));
  const showControl = !reduced;
  const controlLabel = resting
    ? "Replay the planning animation"
    : paused
      ? "Play the planning animation"
      : "Pause the planning animation";

  const statusNode = (i: number) => (
    <>
      <span
        ref={(n) => {
          doneRefs.current[i] = n;
        }}
        className="text-growth"
      >
        <Check className="size-3.5" strokeWidth={2.25} />
      </span>
      <span
        ref={(n) => {
          statusRefs.current[i] = n;
        }}
      >
        Plan locked
      </span>
    </>
  );

  return (
    <figure ref={root} className={cn("relative overflow-hidden rounded-card border border-hairline bg-paper", className)}>
      <figcaption className="sr-only">
        Example research plan for the brief “{scenario.prompt}”: {scenario.questions.length} questions, {scenario.parameters.length}{" "}
        weighted parameters and keyword searches on TikTok, Instagram Reels and YouTube Shorts. {scenario.found} candidate videos are
        found and {scenario.passed} pass the relevance gate.
      </figcaption>
      <p id="hiw-trace-help" className="sr-only">
        Use the arrow keys to move between questions, parameters and keyword searches. Questions and keyword searches highlight what
        they are connected to. Enter pins the highlight, Escape clears it.
      </p>

      {/* Window bar (phones get a second row for the status and clock) */}
      <div className="border-b border-hairline">
        <div className="flex h-12 items-center gap-2.5 pl-4 pr-2">
          <span aria-hidden="true" className="relative grid size-4 place-items-center">
            <span className={cn("size-1.5 rounded-full bg-purple", styles.pulseDot)} />
          </span>
          <span aria-hidden="true" className="whitespace-nowrap text-[13px] font-semibold tracking-[-0.01em] text-ink">
            Research plan
          </span>
          <span aria-hidden="true" className="hidden min-w-0 items-center gap-1.5 font-mono text-[11px] text-ink/62 sm:inline-flex">
            {statusNode(0)}
          </span>
          <span className="ml-auto flex items-center gap-2">
            {hint && (
              <span className="mr-2 hidden items-center gap-1.5 whitespace-nowrap text-[12.5px] text-ink/62 lg:inline-flex">
                <MousePointer2 aria-hidden="true" className="size-3.5 shrink-0 text-purple" strokeWidth={2} />
                <span className="pointer-coarse:hidden">{hint}</span>
                <span className="hidden pointer-coarse:inline">{hintTouch ?? hint}</span>
              </span>
            )}
            <span aria-hidden="true" data-plan-clock className="hidden w-10 text-right font-mono text-[11px] tabular-nums text-ink/62 sm:block">
              {formatClock(PLAN_CLOCK)}
            </span>
            {showControl && (
              <button
                type="button"
                onClick={onControl}
                aria-pressed={resting ? undefined : paused}
                aria-label={controlLabel}
                title={controlLabel}
                className="relative grid size-8 place-items-center rounded-[10px] text-ink/62 transition-[background-color,color,scale] duration-200 ease-out after:absolute after:-inset-1.5 after:content-[''] hover:bg-surface hover:text-ink active:scale-[0.96]"
              >
                {resting ? (
                  <RotateCcw className="size-3.5" strokeWidth={2} />
                ) : paused ? (
                  <Play className="size-3.5" strokeWidth={2} />
                ) : (
                  <Pause className="size-3.5" strokeWidth={2} />
                )}
              </button>
            )}
          </span>
        </div>
        <div
          aria-hidden="true"
          className="flex h-8 items-center justify-between gap-3 border-t border-hairline px-4 font-mono text-[11px] text-ink/62 sm:hidden"
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">{statusNode(1)}</span>
          <span data-plan-clock className="tabular-nums">
            {formatClock(PLAN_CLOCK)}
          </span>
        </div>
      </div>

      {/* Stage body */}
      <div
        ref={body}
        role="group"
        aria-label="Research plan"
        aria-describedby="hiw-trace-help"
        className="relative grid md:grid-cols-[minmax(0,43fr)_minmax(0,57fr)] 2xl:grid-cols-[minmax(0,40fr)_minmax(0,60fr)]"
        onKeyDown={onTraceKey}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") highlight(sticky.current);
        }}
      >
        {geo && (
          <svg
            aria-hidden="true"
            // Fresh nodes per geometry: GSAP caches SVG transform origins on the element.
            key={geoKey}
            data-dyn
            className="pointer-events-none absolute left-0 top-0 overflow-visible"
            width={geo.w}
            height={geo.h}
            viewBox={`0 0 ${geo.w} ${geo.h}`}
            fill="none"
          >
            {links.map((l) => (
              <path
                key={l.key}
                d={l.d}
                data-draw={l.kind}
                data-hl={l.hl || undefined}
                className={cn(styles.link, (l.kind === "spine-q" || l.kind === "spine-p") && styles.linkStrong)}
              />
            ))}
            {node && (
              <g data-merge-node>
                <circle cx={node.x} cy={node.y} r={4.5} className="fill-paper stroke-ink/45" />
                <circle cx={node.x} cy={node.y} r={1.75} className="fill-purple" />
              </g>
            )}
          </svg>
        )}

        {/* Panel A: intent */}
        <div data-plan-left className="relative border-b border-hairline py-5 px-4 md:border-b-0 md:border-r md:px-5">
          <PanelLabel letter="A" text="Intent" />
          <div data-dyn className="mt-4">
            <div data-plan-prompt className="origin-left rounded-[10px] bg-surface px-3 py-2" title={scenario.prompt}>
              <p className="line-clamp-2 text-[12.5px] leading-[1.35] text-ink-2">
                <span className="text-ink/62">Your brief </span>
                {scenario.prompt}
              </p>
            </div>
          </div>

          <p className="mt-3 flex h-4 items-center pl-7 text-[12px] text-ink/62">Questions to answer</p>
          <ul data-dyn className="mt-2">
            {scenario.questions.map((text, i) => {
              const id = `q${i + 1}`;
              return (
                <li
                  key={id}
                  data-row={id}
                  data-hl={rowHl(id)}
                  {...hoverProps(id)}
                  className={cn("flex min-h-7 items-center gap-2.5 py-1 pl-7 text-[13px] leading-[1.3] text-ink-2 focus-visible:rounded-[8px] focus-visible:outline-offset-0", styles.hlRow)}
                >
                  <Tag>{`Q${i + 1}`}</Tag>
                  <span className="min-w-0 text-pretty">{text}</span>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 flex h-4 items-center pl-7 text-[12px] text-ink/62">Parameters to score</p>
          <ul data-dyn className="mt-2">
            {scenario.parameters.map(([name, weight], i) => {
              const id = `p${i + 1}`;
              const value = weight / maxWeight;
              return (
                <li
                  key={id}
                  data-row={id}
                  data-hl={rowHl(id)}
                  {...hoverProps(id)}
                  className={cn("flex min-h-7 items-center gap-2.5 py-1 pl-7 text-[13px] leading-[1.3] text-ink-2 focus-visible:rounded-[8px] focus-visible:outline-offset-0", styles.hlRow)}
                >
                  <Tag>{`P${i + 1}`}</Tag>
                  {/* Name and weight on one line; the weight bar underlines the row. */}
                  <span className="relative min-w-0 flex-1 pb-[8px]">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 text-pretty">{name}</span>
                      <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink/62">{weight}%</span>
                    </span>
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] overflow-hidden rounded-full bg-surface-2">
                      <span
                        data-p-bar
                        data-value={value}
                        className="block h-full origin-left rounded-full bg-ink"
                        style={{ transform: `scaleX(${value})` }}
                      />
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Panel B: searches and relevance gate (a size container) */}
        <div data-plan-right className="@container relative py-5 px-4 md:px-5">
          <div className="flex items-center justify-between gap-3">
            <PanelLabel letter="B" text="Keyword searches" />
            <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-ink/62">
              6 of {KEYWORD_BUDGET} shown
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-7 @min-[400px]:flex-row @min-[400px]:items-center @min-[400px]:justify-between @min-[400px]:gap-9">
            <div className="relative mr-7 md:ml-9 @min-[400px]:mr-0 @min-[400px]:min-w-0 @min-[400px]:max-w-[260px] @min-[400px]:flex-1">
              {/* Landing slots: the panel reads as "waiting" until the searches arrive. */}
              <ul aria-hidden="true" className="absolute inset-0 flex flex-col gap-2">
                {scenario.keywords.map((k) => (
                  <li key={k.text} className="h-7 rounded-chip border border-dashed border-ink/15" />
                ))}
              </ul>
              <ul data-dyn className="relative flex flex-col gap-2">
                {scenario.keywords.map((k, i) => (
                  <li
                    key={k.text}
                    data-chip
                    data-hl={`k${i + 1} ${questionIds(k.from).join(" ")}`}
                    {...hoverProps(`k${i + 1}`)}
                    className={cn(
                      "flex h-7 items-center gap-2 rounded-chip border border-hairline bg-paper px-2 text-[12px] text-ink-2 focus-visible:rounded-chip",
                      styles.hlChip,
                    )}
                  >
                    <PlatformGlyph platform={k.platform} titled className="text-ink/70" />
                    <span className="truncate">{k.text}</span>
                    <span className="sr-only">, from {questionIds(k.from).map((f) => f.toUpperCase()).join(" and ")}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              data-dyn
              className="grid grid-cols-3 gap-3 @min-[400px]:flex @min-[400px]:w-[clamp(96px,30%,150px)] @min-[400px]:shrink-0 @min-[400px]:flex-col @min-[400px]:gap-3.5"
            >
              {LANE_ORDER.map((p) => (
                <div key={p} data-lane className="min-w-0 @min-[400px]:h-11">
                  <div className="flex items-center justify-between gap-1 text-[12px]">
                    <span className="flex min-w-0 items-center gap-1.5 font-medium text-ink">
                      <PlatformGlyph platform={p} />
                      {PLATFORM_LABEL[p]}
                    </span>
                    <span data-lane-count className="font-mono text-[11px] tabular-nums text-ink/62">
                      {scenario.lanes[p]}
                    </span>
                  </div>
                  <div aria-hidden="true" className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-surface-2">
                    <div
                      data-lane-bar
                      className="h-full origin-left rounded-full bg-ink"
                      style={{ transform: `scaleX(${scenario.lanes[p] / laneMax})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between gap-3">
            <PanelLabel letter="C" text="Relevance gate" />
            <span data-dyn className="font-mono text-[11px] tabular-nums text-ink/62">
              <span data-gate-block className="inline-block">
                <span data-found>{scenario.found}</span> found · <span data-passed className="text-green-ink">{scenario.passed}</span> kept
              </span>
            </span>
          </div>
          <GateGrid scenario={scenario} />
        </div>
      </div>
    </figure>
  );
}

/** Counters are written imperatively while a run plays; restore the finished values. */
function writeFinished(el: HTMLElement, scenario: Scenario) {
  const fmt = (n: number) => n.toLocaleString("en-US");
  el.querySelectorAll("[data-found]").forEach((n) => (n.textContent = fmt(scenario.found)));
  el.querySelectorAll("[data-passed]").forEach((n) => (n.textContent = fmt(scenario.passed)));
  el.querySelectorAll("[data-plan-clock]").forEach((n) => (n.textContent = formatClock(PLAN_CLOCK)));
  el.querySelectorAll("[data-lane-count]").forEach((n, i) => {
    const p = LANE_ORDER[i];
    if (p) n.textContent = fmt(scenario.lanes[p]);
  });
}

function PanelLabel({ letter, text }: { letter: string; text: string }) {
  return (
    <p className="flex h-4 items-center gap-2 whitespace-nowrap text-[12px] font-medium text-ink-2">
      <span aria-hidden="true" className="grid h-4 min-w-4 place-items-center rounded-[4px] bg-ink px-1 font-mono text-[9.5px] text-paper">
        {letter}
      </span>
      {text}
    </p>
  );
}

/** Q tags are purple, P tags yellow (COLOR_SYSTEM.md); the highlighted state lives in hiw.module.css. */
function Tag({ children }: { children: string }) {
  const kind = children.startsWith("P") ? "p" : "q";
  return (
    <span
      data-tag
      data-kind={kind}
      className={cn(
        "grid h-5 w-7 shrink-0 place-items-center rounded-[5px] font-mono text-[10.5px] transition-[background-color,color] duration-200",
        kind === "q" ? "bg-purple-soft text-purple-ink" : "bg-yellow-soft text-yellow-ink",
      )}
    >
      {children}
    </span>
  );
}

function GateGrid({ scenario }: { scenario: Scenario }) {
  const tiles = scenario.gate;
  // Narrow panels show 12 tiles in 6 columns; wide panels all 20 in 10 columns.
  const tileClass = (i: number) => cn("relative overflow-hidden rounded-[7px] bg-surface-2", i >= 12 && "@max-[339px]:hidden");
  const gridClass = "grid grid-cols-6 gap-x-1.5 gap-y-2.5 @min-[340px]:grid-cols-10";
  return (
    <div data-dyn aria-hidden="true" className="relative mt-4">
      {/* Before the searches return: a quiet note instead of a gray 0/0 grid. */}
      <div
        data-gate-wait
        className="invisible absolute inset-0 grid place-items-center rounded-[10px] border border-dashed border-ink/15 opacity-0"
      >
        <span className="px-4 text-center text-[12px] text-ink/62">Opens when the searches return</span>
      </div>
      <div data-gate-block className="relative">
        {/* Gray layer: what the gate has not reached yet */}
        <div data-gate-grid className={gridClass}>
          {tiles.map((t, i) => (
            <div key={`g-${t.n}-${i}`} className={tileClass(i)}>
              <Image
                src={thumb(t.n).poster}
                alt=""
                width={POSTER_W}
                height={POSTER_H}
                unoptimized
                className={cn("aspect-[3/4] size-full object-cover", styles.grayTile)}
              />
            </div>
          ))}
        </div>
        {/* Color layer: revealed by the sweep. Off-topic tiles stay gray. */}
        <div className="absolute inset-0">
          <div data-gate-color className={gridClass}>
            {tiles.map((t, i) => (
              <div key={`c-${t.n}-${i}`} className={tileClass(i)}>
                <Image
                  src={thumb(t.n).poster}
                  alt=""
                  width={POSTER_W}
                  height={POSTER_H}
                  unoptimized
                  className={cn("aspect-[3/4] size-full object-cover", !t.pass && styles.grayTile)}
                />
                {t.pass ? (
                  <span data-gate-ring className="absolute inset-0 rounded-[7px] ring-[1.5px] ring-inset ring-purple" />
                ) : (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-[18px] place-items-center rounded-full bg-paper/90 font-mono text-[10px] leading-none text-ink/75">
                      ✕
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
          <div data-gate-line className="pointer-events-none absolute -bottom-1.5 -top-1.5 left-0 w-full" style={{ transform: "translateX(100%)" }}>
            <span className="absolute inset-y-0 left-0 w-px bg-purple" />
            <span className="absolute -top-[3px] left-[0.5px] size-[7px] -translate-x-1/2 rounded-full border-[1.5px] border-purple bg-paper" />
            <span className="absolute -bottom-[3px] left-[0.5px] size-[7px] -translate-x-1/2 rounded-full bg-purple" />
          </div>
        </div>
      </div>
    </div>
  );
}
