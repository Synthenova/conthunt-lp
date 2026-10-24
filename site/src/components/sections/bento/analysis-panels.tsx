"use client";

/**
 * The nine data panels dealt around the featured video. Pure presentation plus small local
 * interactions (point at / focus / tap a question, a score or a re-rank lens). The parent tile
 * animates them through `data-*` hooks:
 *
 *   data-panel          the card (dealt from the video centre)
 *   data-count + data-format="int|pct|plain"   numbers that count up (SSR renders the final value)
 *   data-bar="0.92"     score bar fills (scaleX to the given fraction)
 *   data-draw / data-area   sparkline stroke and area
 *   data-wave           waveform bars (scaleY)
 *   data-wave-played / data-playhead   the audio progress overlay, synced to the video
 *
 * Every value comes from `./data` (bento-analysis.json). Derived values carry a "d" mark.
 *
 * Legibility floor (WCAG 1.4.3): every text run is at least 10.5px and at least ink/62
 * (about 5.4:1 on --paper, 5.2:1 on --surface). Data colours (growth, decline) are used for
 * marks, never for small text.
 */
import { useEffect, useId, useState, type ReactNode } from "react";
import { area, curveMonotoneX, line } from "d3-shape";
import { captureOnce } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import type { Hue } from "@/lib/tones";
import {
  AUDIO,
  AUDIO_ENVELOPE,
  HOOK,
  MEASURES,
  METRICS,
  QUALITATIVE,
  RERANK,
  SCORES,
  TREND,
  VIRALITY,
  fmtInt,
  fmtPct,
} from "./data";
import styles from "./analysis-tile.module.css";

/** Shared micro-label style: mono, 10.5px, ink/62. */
const MICRO = "font-mono text-[10.5px] leading-none tracking-[0.04em] text-ink/62";

/* ------------------------------------------------------------------ atoms */

/**
 * Panel hues (docs/revamp/COLOR_SYSTEM.md, Bento). Panels stay white; only the label, one inner
 * accent and the bars take the hue. Text uses the -ink step, marks use the base. Written out
 * in full because Tailwind only emits classes it finds in source.
 */
const HUE_INK: Record<Hue, string> = {
  pink: "text-pink-ink",
  purple: "text-purple-ink",
  blue: "text-blue-ink",
  green: "text-green-ink",
  yellow: "text-yellow-ink",
  orange: "text-orange-ink",
  red: "text-red-ink",
};
const HUE_DOT: Record<Hue, string> = {
  pink: "bg-pink",
  purple: "bg-purple",
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow-deep",
  orange: "bg-orange-ink",
  red: "bg-red",
};
const HUE_TAG: Record<Hue, string> = {
  pink: "bg-pink-soft text-pink-ink",
  purple: "bg-purple-soft text-purple-ink",
  blue: "bg-blue-soft text-blue-ink",
  green: "bg-green-soft text-green-ink",
  yellow: "bg-yellow-soft text-yellow-ink",
  orange: "bg-orange-soft text-orange-ink",
  red: "bg-red-soft text-red-ink",
};

export function PanelLabel({ children, className, hue }: { children: ReactNode; className?: string; hue?: Hue }) {
  return (
    <span className={cn(MICRO, "whitespace-nowrap font-medium uppercase", hue && ["inline-flex items-center gap-1.5", HUE_INK[hue]], className)}>
      {hue && <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", HUE_DOT[hue])} />}
      {children}
    </span>
  );
}

function Tag({ children, mono = true, className, hue }: { children: ReactNode; mono?: boolean; className?: string; hue?: Hue }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center whitespace-nowrap rounded-[5px] px-1.5 text-[10.5px] leading-none",
        hue ? HUE_TAG[hue] : "bg-surface text-ink-2",
        mono && "font-mono tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Superscript "d" for derived values (explained in the Measures legend and in sr-only text). */
function D({ hue }: { hue?: Hue }) {
  return (
    <>
      <sup aria-hidden="true" className={cn("ml-px font-mono text-[10px] font-semibold normal-case", hue ? HUE_INK[hue] : "text-ink/62")}>
        d
      </sup>
      <span className="sr-only"> (derived)</span>
    </>
  );
}

interface PanelProps {
  name: string;
  hue?: Hue;
  label: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
  onFocusIn?: () => void;
  onFocusOut?: () => void;
}

export function Panel({ name, hue, label, aside, className, children, onFocusIn, onFocusOut }: PanelProps) {
  return (
    <div
      data-panel={name}
      onClick={() => captureOnce(`bento:analysis:${name}`, "bento_interacted", { control: "analysis", value: name })}
      onFocus={onFocusIn}
      onBlur={(e) => {
        if (onFocusOut && !e.currentTarget.contains(e.relatedTarget as Node | null)) onFocusOut();
      }}
      className={cn(
        // transition-none: GSAP owns opacity/visibility/transform here. Under reduced motion the
        // global 0.01ms transition-duration rule would otherwise delay the instant swap a frame.
        "invisible relative flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-hairline bg-paper p-3.5 opacity-0 transition-none",
        className,
      )}
    >
      <div className="flex min-h-4 min-w-0 items-center justify-between gap-2">
        <PanelLabel hue={hue}>{label}</PanelLabel>
        {aside && <div className={cn(MICRO, "flex shrink-0 items-center gap-1")}>{aside}</div>}
      </div>
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- panels */

export function HookPanel() {
  return (
    <Panel
      name="hook"
      hue="pink"
      className={styles.hook}
      label="Hook"
      aside={
        <>
          <Tag hue="pink">{HOOK.timestamp}</Tag>
          <Tag hue="pink" mono={false} className="hidden @min-[30rem]/bento-one:inline-flex">
            {HOOK.type}
          </Tag>
        </>
      }
    >
      <p className="mt-2 text-[14px] font-bold uppercase leading-[1.12] tracking-[-0.012em] text-ink text-balance @min-[53rem]/bento-one:mt-2.5 @min-[53rem]/bento-one:text-[15px] @min-[64rem]/bento-one:text-[19px]">
        &ldquo;{HOOK.text}&rdquo;
      </p>
      <p className="mt-auto pt-2 text-[11.5px] leading-[1.3] text-ink/62 @min-[30rem]/bento-one:hidden">
        {HOOK.type} · {HOOK.confidence} confidence
      </p>
      <dl className="mt-auto hidden gap-0.5 pt-1.5 text-[11.5px] leading-[1.3] @min-[30rem]/bento-one:grid">
        {[
          ["Visual", HOOK.visual],
          ["Payoff", HOOK.payoff],
        ].map(([k, v]) => (
          <div key={k} className="line-clamp-2 min-w-0 text-ink-2">
            <dt className="inline font-mono text-[10.5px] text-ink/62">{k} </dt>
            <dd className="inline">{v}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

export function MetricsPanel() {
  return (
    <Panel
      name="metrics"
      hue="blue"
      className={styles.metrics}
      label="Metrics · TikTok"
      aside={<span className="hidden @min-[30rem]/bento-one:inline">{METRICS.ageDays} days live</span>}
    >
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          data-count={METRICS.views}
          data-format="int"
          className="font-mono text-[clamp(1.25rem,0.9rem+1.6cqw,1.75rem)] font-medium leading-none tracking-[-0.04em] text-ink tabular-nums"
        >
          {fmtInt(METRICS.views)}
        </span>
        <span className="text-[11.5px] text-ink/62">views</span>
      </div>
      <dl className="mt-auto grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-hairline pt-2 @min-[48rem]/bento-one:grid-cols-4">
        {METRICS.minor.map((m) => (
          <div key={m.label} className="min-w-0">
            <dt className="truncate text-[10.5px] leading-tight text-ink/62">
              {m.label}
              {m.derived && <D hue="blue" />}
            </dt>
            <dd
              data-count={m.value}
              data-format={m.kind}
              className="mt-0.5 font-mono text-[13px] font-medium leading-tight text-ink tabular-nums"
            >
              {m.kind === "pct" ? fmtPct(m.value) : fmtInt(m.value)}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

export function QualPanel() {
  const [active, setActive] = useState(0);
  const uid = useId();
  return (
    <Panel name="qual" hue="purple" className={styles.qual} label="Qualitative" aside={<span>{QUALITATIVE.length} answers</span>}>
      <ul className="mt-1.5 flex flex-col">
        {QUALITATIVE.map((item, i) => (
          <li key={item.q}>
            <button
              type="button"
              aria-pressed={i === active}
              aria-describedby={`${uid}a${i}`}
              onPointerEnter={(e) => e.pointerType !== "touch" && setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "flex min-h-6 w-full items-center gap-2 rounded-md text-left text-[12px] leading-[1.25] transition-colors duration-200 ease-out",
                i === active ? "text-ink" : "text-ink/62 hover:text-ink",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("w-4 shrink-0 font-mono text-[10.5px] tabular-nums transition-colors duration-200", i === active ? "text-purple-ink" : "text-ink/62")}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="truncate">{item.q}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "ml-auto size-1.5 shrink-0 rounded-full bg-purple transition-[opacity,scale] duration-200 ease-out",
                  i === active ? "scale-100 opacity-100" : "scale-0 opacity-0",
                )}
              />
            </button>
          </li>
        ))}
      </ul>
      {/* All answers share one grid cell, so the panel keeps the tallest answer's height. */}
      <div className="mt-auto grid border-t border-hairline pt-2.5">
        {QUALITATIVE.map((item, i) => (
          <p
            key={item.q}
            id={`${uid}a${i}`}
            aria-hidden={i !== active}
            className={cn(
              "col-start-1 row-start-1 text-[12.5px] leading-[1.38] text-ink-2 text-pretty transition-[opacity,translate] duration-300 ease-out",
              i === active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0",
            )}
          >
            {item.a}
          </p>
        ))}
      </div>
    </Panel>
  );
}

/** Real loudness envelope; the ink overlay is clipped to the video's playback position. */
export function AudioPanel() {
  const bars = (key: string) =>
    AUDIO_ENVELOPE.map((v, i) => (
      <span
        key={`${key}${i}`}
        data-wave=""
        className="min-w-0 flex-1 origin-center rounded-full bg-current"
        style={{ height: `${Math.max(7, Math.round(v * 100))}%` }}
      />
    ));
  return (
    <Panel name="audio" hue="orange" className={styles.audio} label="Audio" aside={<Tag mono={false}>{AUDIO.voiceover ? "Voiceover" : "No voiceover"}</Tag>}>
      <div className="relative mt-2.5 h-8 shrink-0" aria-hidden="true">
        <div className="absolute inset-0 flex items-center gap-[2px] text-ink/18">{bars("base")}</div>
        <div data-wave-played className="absolute inset-0 flex items-center gap-[2px] text-orange-ink [clip-path:inset(0_100%_0_0)]">
          {bars("played")}
        </div>
        <span data-playhead className="absolute -inset-y-1 left-0 w-px bg-orange-ink" />
      </div>
      <p className={cn(MICRO, "mt-1.5 flex justify-between uppercase")}>
        <span>0:00</span>
        <span>Loudness, measured</span>
        <span>0:11</span>
      </p>
      <dl className="mt-auto grid gap-1 pt-2 text-[11.5px] leading-[1.3]">
        {AUDIO.rows.slice(0, 2).map((r) => (
          <div key={r.label} className="flex min-w-0 gap-2">
            <dt className="w-9 shrink-0 font-mono text-[10.5px] leading-[1.45] text-ink/62">{r.label}</dt>
            <dd className="min-w-0 text-ink-2">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

/**
 * Why it works: the one-line summary, then the five logged reasons as a stepper. Clicking or
 * tapping the reason advances to the next one (crossfade, the arrow nudges on hover).
 */
export function ViralityPanel() {
  const [reason, setReason] = useState(0);
  const total = VIRALITY.reasons.length;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <Panel name="virality" hue="yellow" className={styles.virality} label="Why it works">
      <p className="mt-2.5 text-[13px] font-medium leading-[1.3] tracking-[-0.012em] text-ink text-pretty @min-[53rem]/bento-one:text-[14px]">
        <span className="rounded-[4px] bg-yellow-soft px-1 py-px [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">{VIRALITY.line}</span>
      </p>
      <button
        type="button"
        onClick={() => setReason((r) => (r + 1) % total)}
        aria-label={`Reason ${reason + 1} of ${total}: ${VIRALITY.reasons[reason]}. Show the next reason.`}
        className="group/why -mx-1.5 -mb-1.5 mt-auto rounded-[10px] px-1.5 pb-1.5 pt-2 text-left transition-colors duration-200 ease-out hover:bg-surface"
      >
        <span aria-hidden="true" className={cn(MICRO, "flex items-center justify-between uppercase")}>
          <span>
            Reason <span className="text-yellow-ink tabular-nums">{pad(reason + 1)}</span>/{pad(total)}
          </span>
          <svg viewBox="0 0 16 16" className="size-3 transition-transform duration-200 ease-out group-hover/why:translate-x-0.5">
            <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {/* All titles share one grid cell, so the button keeps the tallest title's height. */}
        <span aria-hidden="true" className="mt-1.5 grid">
          {VIRALITY.reasons.map((r, i) => (
            <span
              key={r}
              className={cn(
                "col-start-1 row-start-1 text-[12px] leading-[1.3] text-ink-2 text-pretty transition-[opacity,translate] duration-300 ease-out",
                i === reason ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
              )}
            >
              {r}
            </span>
          ))}
        </span>
      </button>
    </Panel>
  );
}

const SPARK_W = 160;
const SPARK_H = 36;

export function TrendPanel() {
  const n = TREND.series.length;
  const x = (i: number) => (i / (n - 1)) * SPARK_W;
  const y = (v: number) => SPARK_H - 2 - v * (SPARK_H - 6);
  const pts = TREND.series.map((v, i) => [x(i), y(v)] as [number, number]);
  const linePath = line().curve(curveMonotoneX)(pts) ?? "";
  const areaPath =
    area<[number, number]>()
      .x((d) => d[0])
      .y0(SPARK_H)
      .y1((d) => d[1])
      .curve(curveMonotoneX)(pts) ?? "";
  const breakout = TREND.className === "breakout";
  return (
    <Panel
      name="trend"
      hue="green"
      className={styles.trend}
      label="Trend"
      aside={
        <span className={cn("flex items-center gap-1.5 capitalize", breakout ? "text-breakout-ink" : "text-green-ink")}>
          <span aria-hidden="true" className={cn("size-1.5 rounded-full", breakout ? "bg-breakout" : "bg-growth")} />
          {TREND.className}
        </span>
      }
    >
      <div className={cn("relative mt-auto w-full shrink-0 pt-4", breakout ? "text-breakout" : "text-growth")}>
        <span className={cn(MICRO, "absolute right-0 top-0 uppercase")}>Modeled</span>
        <svg viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="block aspect-[160/36] w-full overflow-visible" aria-hidden="true">
          <path data-area d={areaPath} fill="currentColor" fillOpacity={0.12} />
          <path data-draw d={linePath} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.3] text-ink-2" title={TREND.name}>
        {TREND.pattern}
      </p>
      <span className="sr-only">
        {TREND.name}. The curve is a modeled shape; no daily snapshots exist for this video.
      </span>
    </Panel>
  );
}

export function ScoresPanel() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <Panel name="scores" hue="blue" className={styles.scores} label="Scores · 0–100" aside={<Tag>derived</Tag>} onFocusOut={() => setHover(null)}>
      <ul className="mt-2 flex min-h-0 flex-1 flex-col justify-between" onPointerLeave={(e) => e.pointerType !== "touch" && setHover(null)}>
        {SCORES.map((s, i) => {
          const on = hover === i;
          const dim = hover !== null && !on;
          return (
            <li key={s.name}>
              <button
                type="button"
                aria-pressed={on}
                onPointerEnter={(e) => e.pointerType !== "touch" && setHover(i)}
                onFocus={() => setHover(i)}
                // Select, never toggle: on Android a tap focuses (selects) first, then clicks.
                onClick={() => setHover(i)}
                className="grid min-h-6 w-full cursor-default grid-cols-[minmax(0,5.6rem)_minmax(0,1fr)_1.5rem] @min-[48rem]/bento-one:min-h-[18px] items-center gap-2 rounded-[4px] text-left text-[11.5px] leading-tight"
              >
                <span className={cn("truncate transition-colors duration-200", on ? "font-medium text-ink" : "text-ink-2")}>{s.name}</span>
                <span className="relative h-[5px] overflow-hidden rounded-full bg-ink/[0.07]" aria-hidden="true">
                  <span
                    data-bar={s.value / 100}
                    className={cn(
                      "absolute inset-0 origin-left rounded-full transition-opacity duration-200",
                      s.value < 50 ? "bg-decline" : "bg-blue",
                      dim && "opacity-30",
                    )}
                    style={{ transform: `scaleX(${s.value / 100})` }}
                  />
                </span>
                <span data-count={s.value} data-format="plain" className="text-right font-mono font-medium tabular-nums text-ink">
                  {s.value}
                </span>
                <span className="sr-only">. Basis: {s.basis}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p aria-hidden="true" className="mt-2 line-clamp-2 min-h-[2.7em] border-t border-hairline pt-1.5 text-[11px] leading-[1.35] text-ink/62">
        {hover === null ? (
          <>
            <span className="pointer-coarse:hidden">Point at</span>
            <span className="hidden pointer-coarse:inline">Tap</span> a score to see what it is derived from.
          </>
        ) : (
          <span className="text-ink-2">{SCORES[hover].basis}</span>
        )}
      </p>
    </Panel>
  );
}

/** A single odometer digit column; CSS transition on transform (interruptible). */
function Digit({ d }: { d: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-top">
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-out"
        style={{ transform: `translateY(${-d * 10}%)` }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block h-[1em] leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Two-digit odometer. The layout box is always "#" + two digits (+ suffix), so nothing beside it
 * reflows. For single-digit ranks the tens column fades and the ones digit and the suffix slide
 * left one digit width with a transform, so "#5 /41" sits as tight as "#33 /41".
 */
function Odometer({ value, suffix, className }: { value: number; suffix?: ReactNode; className?: string }) {
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return (
    <span className={cn("inline-flex items-start leading-none tabular-nums", className)} aria-hidden="true">
      #
      <span className={cn("inline-flex transition-opacity duration-300 ease-out", tens === 0 && "opacity-0")}>
        <Digit d={tens} />
      </span>
      <span
        className="inline-flex items-start transition-transform duration-500 ease-out"
        style={{ transform: tens === 0 ? "translateX(-0.62em)" : "translateX(0)" }}
      >
        <Digit d={ones} />
        {suffix}
      </span>
    </span>
  );
}

const LENS_SHORT: Record<string, string> = {
  views: "views",
  "views per day": "views/day",
  "engagement rate": "eng. rate",
  "share rate": "share rate",
};

const LENS_STEP_MS = 1900;

/**
 * Re-rank: the real fact for the sample query (41 TikTok results): #10 in platform order,
 * then #5 by views, #7 by views/day, #33 by engagement rate and #29 by share rate.
 * On open it steps through the lenses ONCE and settles on "views" (about 7.6s). It pauses while
 * the panel is pointed at or holds focus, and stops for good once the visitor picks a lens.
 * The stepping display is aria-hidden; an sr-only sentence states every rank at once, so
 * nothing is announced on each tick.
 */
export function RerankPanel({ open, reduced }: { open: boolean; reduced: boolean }) {
  const N = RERANK.lenses.length;
  const [idx, setIdx] = useState(0);
  const [steps, setSteps] = useState(N); // auto steps already taken this opening (N = done)
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  // Each opening restarts the single loop from "views" (state adjusted during render).
  if (open !== prevOpen) {
    setPrevOpen(open);
    setIdx(0);
    setSteps(open ? 0 : N);
  }

  useEffect(() => {
    if (!open || reduced || hovered || focused || steps >= N) return;
    const t = window.setTimeout(() => {
      setIdx((i) => (i + 1) % N);
      setSteps((s) => s + 1);
    }, LENS_STEP_MS);
    return () => window.clearTimeout(t);
  }, [open, reduced, hovered, focused, steps, N]);

  const pick = (i: number) => {
    setIdx(i);
    setSteps(N); // the visitor is in charge now
  };

  const lens = RERANK.lenses[idx];
  const improved = lens.rank < RERANK.before;
  const lensName = LENS_SHORT[lens.lens] ?? lens.lens;

  return (
    <Panel
      name="rerank"
      hue="green"
      className={styles.rerank}
      label={
        <>
          Re-rank
          <D />
        </>
      }
      onFocusIn={() => setFocused(true)}
      onFocusOut={() => setFocused(false)}
      aside={
        // Pointer shortcut only (point at or tap a dot). The keyboard / screen-reader control is
        // the rank readout button below, which meets the 24px target size (WCAG 2.5.8
        // "equivalent control" exception for these 16px dots).
        <div className="-my-1 flex" aria-hidden="true">
          {RERANK.lenses.map((l, i) => (
            <span
              key={l.lens}
              data-lens={l.lens}
              data-on={i === idx}
              onPointerEnter={(e) => e.pointerType !== "touch" && pick(i)}
              onClick={() => pick(i)}
              className="group/lens flex h-6 w-4 cursor-pointer items-center justify-center"
            >
              <span
                className={cn(
                  "block h-[3px] rounded-full transition-[width,background-color] duration-200 ease-out",
                  i === idx ? "w-2.5 bg-green" : "w-[5px] bg-green/35 group-hover/lens:bg-green/65",
                )}
              />
            </span>
          ))}
        </div>
      }
    >
      <div
        className="flex min-h-0 flex-1 flex-col"
        onPointerEnter={(e) => e.pointerType !== "touch" && setHovered(true)}
        onPointerLeave={(e) => e.pointerType !== "touch" && setHovered(false)}
      >
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.25] text-ink/62" title={RERANK.query}>
          &ldquo;{RERANK.query}&rdquo;
        </p>
        <button
          type="button"
          onClick={() => pick((idx + 1) % N)}
          aria-label={`Ranking lens: ${lens.lens}, number ${lens.rank} of ${RERANK.results}. Show the next lens.`}
          className="group/rr -mx-1.5 -mb-1.5 mt-auto rounded-[10px] px-1.5 pb-1.5 pt-1.5 text-left transition-colors duration-200 ease-out hover:bg-surface"
        >
          <span className="flex items-end gap-1.5" aria-hidden="true">
            <span className="mb-px font-mono text-[14px] leading-none text-ink/62 tabular-nums line-through decoration-ink/40">
              #{RERANK.before}
            </span>
            <svg
              viewBox="0 0 16 16"
              className={cn("mb-0.5 size-3.5 shrink-0 transition-[rotate,color] duration-300 ease-out", improved ? "text-green-ink" : "text-decline")}
              style={{ rotate: improved ? "-45deg" : "45deg" }}
            >
              <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Odometer
              value={lens.rank}
              className={cn("font-mono text-[22px] font-medium leading-none tracking-[-0.04em] transition-colors duration-300 @min-[30rem]/bento-one:text-[24px]", improved ? "text-green-ink" : "text-ink")}
              suffix={
                <span className="ml-1.5 font-mono text-[10.5px] font-normal leading-none tracking-normal text-ink/62 tabular-nums">
                  /{RERANK.results}
                </span>
              }
            />
          </span>
          <span className="mt-1.5 block truncate text-[11px] leading-none text-ink/62" aria-hidden="true">
            Platform → <span className="font-medium text-ink">{lensName}</span>
          </span>
        </button>
        <p className="sr-only">
          For the search &ldquo;{RERANK.query}&rdquo; ({RERANK.results} TikTok results), this video is number {RERANK.before} in
          platform order. Re-ranked:{" "}
          {RERANK.lenses.map((l) => `number ${l.rank} by ${l.lens}`).join(", ")}.
        </p>
      </div>
    </Panel>
  );
}

export function QuantPanel() {
  return (
    <Panel name="quant" className={cn(styles.quant, "px-3 @min-[53rem]/bento-one:px-3.5")} hue="purple" label="Measures">
      <dl className="mt-2 flex min-h-0 flex-1 flex-col justify-between">
        {MEASURES.map((m) => (
          <div
            key={m.label}
            className="flex items-baseline justify-between gap-1.5 border-b border-hairline/80 py-[2px] text-[11px] leading-tight last:border-b-0 @min-[53rem]/bento-one:text-[11.5px]"
          >
            <dt className="whitespace-nowrap text-ink/62" title={m.title}>
              {m.label}
              {m.derived && <D hue="purple" />}
            </dt>
            <dd className="font-mono font-medium tabular-nums text-ink">{m.value}</dd>
          </div>
        ))}
      </dl>
      <p className={cn(MICRO, "mt-1")}>
        <span className="font-semibold">d</span> = derived
      </p>
    </Panel>
  );
}
