"use client";

/**
 * Calculator read-outs: CountUp (GSAP tween on a plain object, DOM text written
 * directly so React never re-renders per frame), the work-calendar picture and the
 * usage bars. Only transform and opacity animate.
 */
import { memo, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import { onceInView } from "@/lib/media";
import { usePrefersReducedMotion } from "@/lib/motion";
import { formatInt } from "@/components/sections/pricing/plans";
import { WORKDAY_HOURS } from "./calculator-model";
import styles from "./calculator.module.css";

// -------------------------------------------------------------------- CountUp

export interface CountUpProps {
  value: number;
  format?: (v: number) => string;
  /** Seconds. Default 0.9. */
  duration?: number;
  className?: string;
}

/**
 * Counts from the previous value to the new one. On first render it waits until
 * the element scrolls into view and counts up from 0 (when it starts below the
 * fold). Reduced motion: the value simply changes.
 */
export function CountUp({ value, format = formatInt, duration = 0.9, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const state = useRef({ v: value });
  const shownOnce = useRef(false);
  const reduced = usePrefersReducedMotion();
  // React renders this once; afterwards GSAP owns the text node.
  const [initialText] = useState(() => format(value));
  const fmt = useRef(format);
  useEffect(() => {
    fmt.current = format;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const s = state.current;
    const write = () => {
      el.textContent = fmt.current(s.v);
    };
    const tweenTo = (to: number, dur: number) => {
      gsap.to(s, { v: to, duration: dur, ease: "power3.out", overwrite: true, onUpdate: write });
    };

    if (reduced) {
      gsap.killTweensOf(s);
      s.v = value;
      write();
      return;
    }
    if (!shownOnce.current) {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) {
        s.v = 0;
        write();
        return onceInView(
          el,
          () => {
            shownOnce.current = true;
            tweenTo(value, duration * 1.4);
          },
          { threshold: 0.6 },
        );
      }
      shownOnce.current = true;
    }
    tweenTo(value, duration);
    return () => {
      gsap.killTweensOf(s);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {initialText}
    </span>
  );
}

// ----------------------------------------------------------------- WorkCalendar

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export interface WorkCalendarProps {
  /** Working days of watching by hand (8 hours per day). */
  workdays: number;
  /** Minutes of ContHunt run time, shown as a sliver against one workday. */
  runMinutes: number;
  /** Rows shown before "+ N more weeks". Default 2. */
  maxWeeks?: number;
}

/**
 * The month as a work calendar: each cell is one 8-hour day of watching by hand.
 * Cells fill left to right, week by week. The accent sliver underneath is the time
 * ContHunt needs to run the same research, on the same scale.
 */
export function WorkCalendar({ workdays, runMinutes, maxWeeks = 2 }: WorkCalendarProps) {
  const totalWeeks = Math.max(1, Math.ceil(workdays / 5 - 1e-9));
  const weeks = Math.min(totalWeeks, maxWeeks);
  const hidden = totalWeeks - weeks;
  const runFraction = Math.min(1, runMinutes / (WORKDAY_HOURS * 60));

  return (
    <div role="img" aria-label={`${workdays.toFixed(1)} working days of watching by hand, against ${Math.round(runMinutes)} minutes with ContHunt`}>
      <div aria-hidden="true">
        <div className="grid grid-cols-5 gap-1.5">
          {DAY_LABELS.map((d) => (
            <span key={d} className="font-mono text-[11px] uppercase leading-none tracking-[0.04em] text-ink-2/75">
              {d}
            </span>
          ))}
        </div>
        <div className="mt-1.5 flex flex-col gap-1.5">
          {Array.from({ length: weeks }, (_, w) => (
            <div key={w} className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 5 }, (_, d) => {
                const idx = w * 5 + d;
                const fill = Math.min(1, Math.max(0, workdays - idx));
                return (
                  <span key={d} className="relative block h-[14px] overflow-hidden rounded-[4px] bg-surface-2">
                    <span
                      className={cn(styles.cell, "absolute inset-0 rounded-[4px] bg-ink")}
                      style={{ transform: `scaleX(${fill.toFixed(3)})`, transitionDelay: `${idx * 22}ms` }}
                    />
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        {hidden > 0 && (
          <p className="mt-1.5 font-mono text-[11px] leading-none text-ink-2/75">
            + {hidden} more {hidden === 1 ? "week" : "weeks"} of watching
          </p>
        )}
        <div className="mt-3 grid grid-cols-5 items-center gap-1.5">
          <span className="relative block h-[14px] overflow-hidden rounded-[4px] bg-surface-2">
            <span
              className={cn(styles.cell, "absolute inset-0 rounded-[4px] bg-accent")}
              style={{ transform: `scaleX(${Math.max(0.05, runFraction).toFixed(3)})` }}
            />
          </span>
          <span className="col-span-4 font-mono text-[11px] leading-none text-ink-2/75">
            ContHunt runs it in about {Math.max(1, Math.round(runMinutes))} min
          </span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- UsageBar

export interface UsageBarProps {
  label: string;
  used: number;
  cap: number;
  /** Bigger label and bar for the primary resource. */
  primary?: boolean;
}

export const UsageBar = memo(function UsageBar({ label, used, cap, primary = false }: UsageBarProps) {
  const ratio = cap > 0 ? used / cap : 0;
  const over = ratio > 1;
  const pct = Math.round(ratio * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={cn("text-ink-2", primary ? "text-[14px] font-medium" : "text-[13px]")}>{label}</span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] tabular-nums text-ink">
          {/* Red text on white is 3.9:1, under AA at this size, so over-limit is a red dot beside ink text. */}
          {over && <span aria-hidden="true" className="size-1.5 rounded-full bg-decline" />}
          <span>
            <CountUp value={used} duration={0.7} /> <span className="text-ink-2/75">/ {formatInt(cap)}</span>
          </span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={cap}
        aria-valuenow={Math.min(used, cap)}
        aria-valuetext={`${pct}% of the monthly allowance`}
        className={cn("relative mt-1.5 overflow-hidden rounded-full bg-surface-2", primary ? "h-2" : "h-1.5")}
      >
        <span
          className={cn(styles.bar, "absolute inset-0 rounded-full", over ? "bg-decline" : "bg-ink")}
          style={{ transform: `scaleX(${Math.min(1, ratio).toFixed(4)})` }}
        />
      </div>
    </div>
  );
});
