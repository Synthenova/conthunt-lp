"use client";

/**
 * Growth charts: two cumulative-change charts side by side (Followers and Likes), each
 * with both tracked accounts and a daily-snapshot tick row under it. There is no switch
 * between metrics.
 *
 * - Hand-built SVG at the real pixel width (ResizeObserver), so strokes, dots and
 *   text stay 1:1 on every screen. d3-scale and d3-shape do the path maths.
 * - Each chart has one axis: every line is indexed to its own day one, so accounts of
 *   different size share a scale (it runs below zero when a line dips under its start).
 *   Absolute counts are on the board columns and in the table view.
 * - Lines draw once on view (DrawSVG), snapshot ticks stamp in beside them, end numbers
 *   count up. Reduced motion: everything is simply there.
 * - Hover (or arrow keys) scrubs a crosshair on BOTH charts at once, so one day can be read
 *   across followers and likes. The reading lives in a line above each plot (one value and
 *   one daily gain per account, the gain green or red), so nothing ever sits on top of a
 *   line. On touch the reading stays after the finger lifts, until the next tap elsewhere.
 * - The legend buttons above the charts pin an account's lines; hovering an account on the
 *   board emphasizes them too.
 * - Series are illustrative (see data.ts). The panel says "Illustrative trend".
 *
 * Performance: scrubbing re-renders the charts on each day change, so everything heavy
 * (axes, lines, end dots, end labels, the screen-reader table) is memoised and does not
 * re-render while the pointer moves.
 */
import { curveMonotoneX, line as d3Line } from "d3-shape";
import { scaleLinear, type ScaleLinear } from "d3-scale";
import { memo, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { CountUp } from "./count-up";
import {
  ACCOUNTS,
  METRICS,
  METRIC_LABEL,
  SERIES_DAYS,
  SNAPSHOT_TIME_LABEL,
  TONE_STROKE,
  type MetricKey,
  type TrackedAccount,
} from "./data";
import { axisPct, dayLabel, signedCompact, signedPct } from "./format";
import { REGION_CLASS, regionState, useTrackingHighlight } from "./highlight";
import { useElementWidth } from "./use-element-width";

const LAST = SERIES_DAYS - 1;
const numberFormat = new Intl.NumberFormat("en-US");

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
/** Room on the right for the end number ("+4.6%"). Names are in the legend, not on the plot. */
const MARGIN: Margin = { top: 12, right: 56, bottom: 24, left: 38 };
const HEIGHT = 176;
/** End label height (leading-5); labels never overlap. */
const LABEL_H = 20;

/** Round the y domain out to clean bounds and list the gridline values. */
function niceScale(minPct: number, maxPct: number) {
  const hi = maxPct * 1.06;
  const lo = Math.min(0, minPct * 1.1);
  const step = [0.5, 1, 2, 5, 10].find((s) => (hi - lo) / s <= 5) ?? 20;
  const top = Math.ceil(hi / step) * step;
  const bottom = Math.floor(lo / step) * step;
  const ticks: number[] = [];
  for (let t = bottom; t <= top + 1e-9; t += step) ticks.push(Math.round(t * 100) / 100);
  return { top, bottom, ticks };
}

interface Row {
  account: TrackedAccount;
  /** Percent change since day one, one value per day. */
  pct: number[];
  /** Absolute counts per day. */
  counts: number[];
}

type Scale = ScaleLinear<number, number>;

/** Gain over the previous day. Null on day one. */
const dayGain = (counts: number[], i: number): number | null => (i === 0 ? null : counts[i] - counts[i - 1]);

/* ------------------------------------------------------------------ plot */

interface PlotProps {
  rows: Row[];
  paths: string[];
  x: Scale;
  y: Scale;
  yTicks: number[];
  margin: Margin;
  plotRight: number;
  plotBottom: number;
  focusId: string | null;
}

/** Axes, lines and end dots. Re-renders only when the data, size or focused series change. */
const Plot = memo(function Plot({ rows, paths, x, y, yTicks, margin, plotRight, plotBottom, focusId }: PlotProps) {
  // Draw the focused line last so it sits on top.
  const order = rows
    .map((_, i) => i)
    .sort((a, b) => (rows[a].account.id === focusId ? 1 : 0) - (rows[b].account.id === focusId ? 1 : 0));
  const xDays = plotRight - margin.left >= 250 ? [0, 7, 14, 21, LAST] : [0, 14, LAST];

  return (
    <>
      <g className="tk-axis">
        {/* The last 7 days: the window behind the "7d" change on each account. */}
        <rect
          x={x(LAST - 7)}
          y={margin.top}
          width={x(LAST) - x(LAST - 7)}
          height={plotBottom - margin.top}
          fill="var(--ink)"
          fillOpacity={0.04}
        />
        <text x={x(LAST - 7) + 6} y={margin.top + 12} className="fill-ink/60 font-mono text-[10px]">
          7D
        </text>
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={margin.left}
              x2={plotRight}
              y1={y(t)}
              y2={y(t)}
              stroke={t === 0 ? "var(--ink)" : "var(--hairline)"}
              strokeOpacity={t === 0 ? 0.25 : 1}
              strokeWidth={1}
            />
            <text
              x={margin.left - 8}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-ink/60 font-mono text-[10px]"
            >
              {axisPct(t)}
            </text>
          </g>
        ))}
        {xDays.map((d) => (
          <text
            key={d}
            x={x(d)}
            y={plotBottom + 17}
            textAnchor={d === 0 ? "start" : d === LAST ? "end" : "middle"}
            className="fill-ink/60 font-mono text-[10px]"
          >
            {dayLabel(d)}
          </text>
        ))}
      </g>

      {order.map((i) => {
        const { account } = rows[i];
        const dim = focusId !== null && focusId !== account.id;
        return (
          <path
            key={account.id}
            className="tk-line"
            d={paths[i]}
            fill="none"
            stroke={TONE_STROKE[account.tone]}
            strokeWidth={focusId === account.id ? 2.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={dim ? 0.2 : 1}
            style={{ transition: "stroke-opacity 200ms var(--ease-out)" }}
          />
        );
      })}

      {rows.map(({ account, pct }) => {
        const dim = focusId !== null && focusId !== account.id;
        return (
          <g key={account.id} className="tk-enddot">
            <circle
              cx={x(LAST)}
              cy={y(pct[LAST])}
              r={4.5}
              fill={TONE_STROKE[account.tone]}
              stroke="var(--paper)"
              strokeWidth={2}
              opacity={dim ? 0.3 : 1}
              style={{ transition: "opacity 200ms var(--ease-out)" }}
            />
          </g>
        );
      })}
    </>
  );
});

interface EndLabelsProps {
  rows: Row[];
  x: Scale;
  y: Scale;
  focusId: string | null;
  /** The reader is scrubbing: the end labels step back so the reading leads. */
  scrubbing: boolean;
  /** Starts the count-ups. */
  revealed: boolean;
}

/** End labels: the number at the end of each line. Identity comes from the line colour and the legend. */
const EndLabels = memo(function EndLabels({ rows, x, y, focusId, scrubbing, revealed }: EndLabelsProps) {
  // Labels are 20px tall: when two line ends sit closer than that, push the lower one down.
  const tops = new Map<string, number>();
  let floor = -Infinity;
  [...rows]
    .sort((a, b) => y(a.pct[LAST]) - y(b.pct[LAST]))
    .forEach(({ account, pct }) => {
      const top = Math.max(y(pct[LAST]) - 10, floor);
      tops.set(account.id, top);
      floor = top + LABEL_H;
    });
  return (
    <div className="pointer-events-none absolute inset-0">
      {rows.map(({ account, pct }) => {
        const dim = focusId !== null && focusId !== account.id;
        return (
          <div
            key={account.id}
            className="tk-endlabel absolute whitespace-nowrap"
            style={{ left: x(LAST) + 11, top: tops.get(account.id) ?? y(pct[LAST]) - 10 }}
          >
            <span
              className="block font-mono text-[12px] font-medium tabular-nums leading-5 text-ink transition-opacity duration-200 ease-out"
              style={{ opacity: dim ? 0.35 : scrubbing ? 0.45 : 1 }}
            >
              <CountUp value={pct[LAST]} format={signedPct} delay={1.6} play={revealed} />
            </span>
          </div>
        );
      })}
    </div>
  );
});

/** Table view: every value, for screen readers. Static per metric. */
const ValueTable = memo(function ValueTable({ rows, metric }: { rows: Row[]; metric: MetricKey }) {
  return (
    <table className="sr-only">
      <caption>
        Illustrative {METRIC_LABEL[metric].toLowerCase()} count per day, last {SERIES_DAYS} days.
      </caption>
      <thead>
        <tr>
          <th scope="col">Day</th>
          {rows.map((r) => (
            <th key={r.account.id} scope="col">
              {r.account.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: SERIES_DAYS }, (_, i) => (
          <tr key={i}>
            <th scope="row">{dayLabel(i)}</th>
            {rows.map((r) => (
              <td key={r.account.id}>
                {numberFormat.format(r.counts[i])} ({signedPct(r.pct[i])})
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
});

/* ----------------------------------------------------------- one chart */

interface MetricChartProps {
  metric: MetricKey;
  hover: number | null;
  setHover: (i: number | null) => void;
  focusId: string | null;
  /** Extra seconds before this chart's entrance, so the pair draws one after the other. */
  delay: number;
}

function MetricChart({ metric, hover, setHover, focusId, delay }: MetricChartProps) {
  const { region } = useTrackingHighlight();
  /** True once the chart has scrolled into view; starts the end-label count-ups. */
  const [revealed, setRevealed] = useState(false);
  const [frameRef, width] = useElementWidth<HTMLDivElement>(340);
  const rootRef = useRef<HTMLElement>(null);

  const margin = MARGIN;
  const plotRight = width - margin.right;
  const plotBottom = HEIGHT - margin.bottom;
  const scrubbing = hover !== null;
  const shown = hover ?? LAST;

  const rows: Row[] = useMemo(
    () =>
      ACCOUNTS.map((account) => {
        const counts = account.series[metric];
        return { account, counts, pct: counts.map((v) => (v / counts[0] - 1) * 100) };
      }),
    [metric],
  );

  const {
    top,
    bottom,
    ticks: yTicks,
  } = useMemo(() => {
    const all = rows.flatMap((r) => r.pct);
    return niceScale(Math.min(...all), Math.max(...all));
  }, [rows]);
  const x = useMemo(() => scaleLinear().domain([0, LAST]).range([margin.left, plotRight]), [margin.left, plotRight]);
  const y = useMemo(
    () => scaleLinear().domain([bottom, top]).range([plotBottom, margin.top]),
    [bottom, top, plotBottom, margin.top],
  );

  const paths = useMemo(() => {
    const gen = d3Line<number>()
      .x((_, i) => x(i))
      .y((d) => y(d))
      .curve(curveMonotoneX);
    return rows.map((r) => gen(r.pct) ?? "");
  }, [rows, x, y]);

  /* -------------------------------------------------------------- motion */

  // One-time entrance: the lines draw, the snapshot ticks stamp in, the end numbers count up.
  // It owns the hidden start states and clears them when it ends, so nothing is left hidden
  // for a later re-render to trip over.
  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const lines = gsap.utils.toArray<SVGPathElement>(root.querySelectorAll(".tk-line"));
        const axis = gsap.utils.toArray<SVGGElement>(root.querySelectorAll(".tk-axis"));
        const ticks = gsap.utils.toArray<SVGRectElement>(root.querySelectorAll(".tk-tick"));
        const endDots = gsap.utils.toArray<SVGGElement>(root.querySelectorAll(".tk-enddot"));
        const endLabels = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".tk-endlabel"));

        gsap.set(lines, { drawSVG: "0%", opacity: 0 });
        gsap.set(axis, { opacity: 0 });
        gsap.set(ticks, { scaleY: 0, transformOrigin: "50% 100%" });
        gsap.set(endDots, { opacity: 0 });
        gsap.set(endLabels, { opacity: 0, x: -8 });

        const tl = gsap.timeline({
          paused: true,
          onComplete: () => {
            gsap.set(lines, { clearProps: "strokeDasharray,strokeDashoffset,opacity" });
            gsap.set([...axis, ...endDots, ...endLabels], { clearProps: "opacity,transform" });
            gsap.set(ticks, { clearProps: "transform,transformOrigin" });
          },
        });
        tl.to(axis, { opacity: 1, duration: 0.5 }, delay)
          .to(lines, { opacity: 1, duration: 0.05, stagger: 0.16 }, delay + 0.1)
          .to(lines, { drawSVG: "100%", duration: 1.8, ease: EASE.inOut, stagger: 0.16 }, delay + 0.1)
          .to(ticks, { scaleY: 1, duration: 0.45, stagger: 0.045 }, delay + 0.2)
          .to(endDots, { opacity: 1, duration: 0.3, stagger: 0.16 }, delay + 1.85)
          .to(endLabels, { opacity: 1, x: 0, duration: 0.55, stagger: 0.16 }, delay + 1.9);

        ScrollTrigger.create({
          trigger: root,
          start: "top 78%",
          once: true,
          onEnter: () => {
            setRevealed(true);
            tl.play();
          },
        });
      });
    },
    { scope: rootRef },
  );

  /* --------------------------------------------------------- interaction */

  const indexFromPointer = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.min(LAST, Math.max(0, Math.round(x.invert(e.clientX - rect.left))));
  };
  const scrubHandlers = {
    onPointerMove: (e: PointerEvent<SVGSVGElement>) => setHover(indexFromPointer(e)),
    onPointerDown: (e: PointerEvent<SVGSVGElement>) => setHover(indexFromPointer(e)),
    onPointerLeave: (e: PointerEvent<SVGSVGElement>) => {
      if (e.pointerType !== "touch") setHover(null);
    },
    onPointerCancel: () => setHover(null),
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = hover ?? LAST;
    let next: number | null | undefined;
    if (e.key === "ArrowLeft") next = Math.max(0, current - 1);
    else if (e.key === "ArrowRight") next = Math.min(LAST, current + 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = LAST;
    else if (e.key === "Escape") next = null;
    if (next === undefined) return;
    e.preventDefault();
    setHover(next);
  };

  return (
    <section ref={rootRef} aria-label={`${METRIC_LABEL[metric]} growth over 30 days, illustrative`} className="min-w-0">
      <div
        data-region="growth"
        data-hl={regionState(region, "growth")}
        className={cn(REGION_CLASS, "px-4 pb-1 pt-4 md:px-5")}
      >
        <h4 className="text-[15px] font-semibold leading-none tracking-[-0.015em] text-ink">{METRIC_LABEL[metric]}</h4>
        {/* The idle caption and the scrub reading share one cell, so the chart never changes height. */}
        <div className="mt-1.5 grid">
          <p
            className={cn(
              "col-start-1 row-start-1 text-[12.5px] leading-5 text-ink/60 transition-opacity duration-150 ease-out",
              scrubbing && "opacity-0",
            )}
          >
            Change since {dayLabel(0)}
          </p>
          <p
            aria-hidden="true"
            className={cn(
              "col-start-1 row-start-1 flex min-w-0 flex-wrap items-center gap-x-3 font-mono text-[11.5px] leading-5 tabular-nums text-ink transition-opacity duration-150 ease-out",
              !scrubbing && "opacity-0",
            )}
          >
            <span>{dayLabel(shown)}</span>
            {rows.map(({ account, pct, counts }) => {
              const gain = dayGain(counts, shown);
              return (
                <span key={account.id} className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-[2px] w-3 rounded-full"
                    style={{ background: TONE_STROKE[account.tone] }}
                  />
                  <span className="font-medium">{signedPct(pct[shown])}</span>
                  {gain !== null && (
                    <span className={gain < 0 ? "text-decline-ink" : "text-growth-ink"}>{signedCompact(gain)}</span>
                  )}
                </span>
              );
            })}
          </p>
        </div>

        <div
          ref={frameRef}
          data-scrub-area=""
          tabIndex={0}
          role="group"
          aria-label={`${METRIC_LABEL[metric]} chart. Use the left and right arrow keys to read each day.`}
          onKeyDown={onKeyDown}
          onBlur={() => setHover(null)}
          className="relative mt-2 select-none rounded-[8px] focus-visible:rounded-[8px]"
        >
          <svg
            width={width}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            aria-hidden="true"
            className="block touch-pan-y overflow-visible"
            {...scrubHandlers}
          >
            <Plot
              rows={rows}
              paths={paths}
              x={x}
              y={y}
              yTicks={yTicks}
              margin={margin}
              plotRight={plotRight}
              plotBottom={plotBottom}
              focusId={focusId}
            />

            {hover !== null && (
              <g pointerEvents="none">
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={margin.top - 4}
                  y2={plotBottom}
                  stroke="var(--ink)"
                  strokeOpacity={0.28}
                  strokeWidth={1}
                />
                {rows.map(({ account, pct }) => (
                  <circle
                    key={account.id}
                    cx={x(hover)}
                    cy={y(pct[hover])}
                    r={4.5}
                    fill={TONE_STROKE[account.tone]}
                    stroke="var(--paper)"
                    strokeWidth={2}
                    opacity={focusId !== null && focusId !== account.id ? 0.3 : 1}
                  />
                ))}
              </g>
            )}
          </svg>

          <EndLabels rows={rows} x={x} y={y} focusId={focusId} scrubbing={scrubbing} revealed={revealed} />
        </div>
      </div>

      {/* Daily snapshots: one saved reading per day, one tick per reading. */}
      <div
        data-region="snapshots"
        data-hl={regionState(region, "snapshots")}
        className={cn(REGION_CLASS, "px-4 pb-4 pt-1 md:px-5")}
      >
        <div data-scrub-area="" className="relative">
          <svg
            width={width}
            height={22}
            viewBox={`0 0 ${width} 22`}
            aria-hidden="true"
            className="block touch-pan-y overflow-visible"
            {...scrubHandlers}
          >
            {Array.from({ length: SERIES_DAYS }, (_, i) => {
              const today = i === LAST;
              const active = hover === i;
              const h = today ? 20 : active ? 18 : 14;
              return (
                <rect
                  key={i}
                  className="tk-tick"
                  x={x(i) - 1.5}
                  y={21 - h}
                  width={3}
                  height={h}
                  rx={1.5}
                  fill={today ? "var(--accent)" : "var(--ink)"}
                  fillOpacity={today || active ? 1 : 0.16}
                  style={{ transition: "fill-opacity 150ms var(--ease-out)" }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      <ValueTable rows={rows} metric={metric} />
    </section>
  );
}

/* ---------------------------------------------------------------- panel */

export function GrowthCharts({ className }: { className?: string }) {
  const { focusId: hoveredAccount, setFocusId } = useTrackingHighlight();
  const [pinned, setPinned] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const focusId = pinned ?? hoveredAccount;
  const scrubbing = hover !== null;

  // Touch: the reading stays after the finger lifts. A tap anywhere else clears it.
  useEffect(() => {
    if (!scrubbing) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (e.pointerType !== "touch") return;
      if ((e.target as Element | null)?.closest("[data-scrub-area]")) return;
      setHover(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [scrubbing]);

  const summary =
    hover === null
      ? ""
      : `${dayLabel(hover)}. ${METRICS.map(
          (m) =>
            `${METRIC_LABEL[m]}: ${ACCOUNTS.map((a) => {
              const s = a.series[m];
              return `${a.shortName} ${signedPct((s[hover] / s[0] - 1) * 100)}`;
            }).join(", ")}`,
        ).join(". ")}.`;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-hairline bg-paper shadow-[0_1px_2px_rgba(0,0,0,0.04),0_3px_8px_-2px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 px-4 pt-4 md:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h3 className="text-[18px] font-semibold leading-none tracking-[-0.02em] text-ink">Cumulative growth</h3>
            {/* The one "Illustrative" label style, shared with the Bento velocity chart. */}
            <Badge tone="outline" className="text-muted">
              Illustrative trend
            </Badge>
          </div>
          <p className="mt-2 text-[13px] leading-snug text-ink/60">
            One point and one tick per daily snapshot. Last saved {SNAPSHOT_TIME_LABEL}.
          </p>
        </div>

        <div role="group" aria-label="Accounts" className="-mx-2 flex gap-1">
          {ACCOUNTS.map((account) => {
            const active = pinned === account.id;
            return (
              <button
                key={account.id}
                type="button"
                aria-pressed={active}
                onPointerEnter={() => setFocusId(account.id)}
                onPointerLeave={() => setFocusId(null)}
                onFocus={() => setFocusId(account.id)}
                onBlur={() => setFocusId(null)}
                onClick={() => setPinned(active ? null : account.id)}
                className={cn(
                  "flex min-h-9 items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-left text-[13px] font-medium tracking-[-0.005em] text-ink-2 focus-visible:rounded-[10px]",
                  "transition-[background-color,color,transform] duration-200 ease-out hover:bg-surface active:scale-[0.97] pointer-coarse:min-h-11",
                  active && "bg-surface text-ink",
                )}
              >
                <span
                  aria-hidden="true"
                  className="h-[2px] w-4 shrink-0 rounded-full"
                  style={{ background: TONE_STROKE[account.tone] }}
                />
                {account.shortName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-1 grid md:grid-cols-2 [&>*+*]:border-t [&>*+*]:border-hairline md:[&>*+*]:border-l md:[&>*+*]:border-t-0">
        {METRICS.map((metric, i) => (
          <MetricChart key={metric} metric={metric} hover={hover} setHover={setHover} focusId={focusId} delay={i * 0.15} />
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {summary}
      </p>
    </div>
  );
}
