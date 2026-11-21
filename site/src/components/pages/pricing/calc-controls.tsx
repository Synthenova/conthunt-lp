"use client";

/**
 * Calculator controls: numbered step shell, dial slider with tick marks, selectable
 * choice cards and a small number field. All are controlled and keyboard-accessible
 * (native range and checkbox semantics).
 */
import { memo, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./calculator.module.css";

// ----------------------------------------------------------------- step shell

export function Step({
  n,
  title,
  hint,
  last = false,
  children,
}: {
  n: number;
  title: string;
  hint?: ReactNode;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "sm:grid sm:grid-cols-[36px_minmax(0,1fr)] sm:gap-x-6",
        n > 1 && "max-sm:mt-8 max-sm:border-t max-sm:border-hairline max-sm:pt-8",
      )}
      aria-labelledby={`step-${n}`}
    >
      <div className="hidden flex-col items-center sm:flex">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface font-mono text-[13px] font-medium tabular-nums text-ink">
          {n}
        </span>
        {!last && <span aria-hidden="true" className="mt-2 w-px flex-1 bg-hairline" />}
      </div>
      <div className={cn(!last && "sm:pb-11")}>
        <div className="flex items-center gap-3 sm:block">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-surface font-mono text-[12px] font-medium tabular-nums text-ink sm:hidden"
          >
            {n}
          </span>
          <h3 id={`step-${n}`} className="text-[20px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:pt-1">
            {title}
          </h3>
        </div>
        {hint && <p className="mt-1.5 max-w-[56ch] text-[14px] leading-snug text-ink-2/75">{hint}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- dial slider

export interface DialSliderProps {
  label: string;
  /** Right-aligned readout beside the label. */
  readout: ReactNode;
  value: number;
  onChange: (value: number) => void;
  /** Continuous slider: min, max, step. */
  min?: number;
  max?: number;
  step?: number;
  /** Discrete slider: the allowed values, evenly spaced, with clickable labels. */
  stops?: readonly number[];
  stopLabel?: (value: number) => string;
  /** Tick marks between neighboring steps (continuous) or stops (discrete). */
  subdivisions?: number;
  valueText?: (value: number) => string;
  /** Labels under the track for a continuous slider: [value, text]. */
  endLabels?: readonly [number, string][];
}

function DialSliderImpl({
  label,
  readout,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 1,
  stops,
  stopLabel = String,
  subdivisions = 3,
  valueText,
  endLabels,
}: DialSliderProps) {
  const id = useId();
  const discrete = Boolean(stops);
  const lo = discrete ? 0 : min;
  const hi = discrete ? stops!.length - 1 : max;
  const current = discrete ? Math.max(0, stops!.indexOf(value)) : value;
  const pos = hi === lo ? 0 : (current - lo) / (hi - lo);
  const steps = discrete ? hi : Math.round((hi - lo) / step);
  const tickCount = steps * subdivisions + 1;

  return (
    <div>
      {/* flex-wrap: a long readout ("25 items · 750 hunt credits") drops under the label on a phone instead of
          squeezing the label into a column of one word per line. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <label htmlFor={id} className="text-[14px] font-medium text-ink">
          {label}
        </label>
        <output htmlFor={id} className="ml-auto shrink-0 whitespace-nowrap font-mono text-[13px] tabular-nums text-ink">
          {readout}
        </output>
      </div>

      <div className="mt-5">
        <div aria-hidden="true" className="flex items-end justify-between px-[13px]">
          {Array.from({ length: tickCount }, (_, i) => {
            const t = i / (tickCount - 1);
            const near = Math.exp(-(((t - pos) * 7) ** 2));
            const major = i % subdivisions === 0;
            const scale = (major ? 0.5 : 0.28) + (major ? 0.5 : 0.72) * near;
            const opacity = (major ? 0.32 : 0.16) + (major ? 0.68 : 0.84) * near;
            return (
              <span
                key={i}
                className={styles.tick}
                style={{ transform: `scaleY(${scale.toFixed(3)})`, opacity: opacity.toFixed(3) }}
              />
            );
          })}
        </div>
        <input
          id={id}
          type="range"
          className={styles.range}
          min={lo}
          max={hi}
          step={discrete ? 1 : step}
          value={current}
          style={{ ["--p" as string]: pos }}
          aria-valuetext={valueText ? valueText(value) : undefined}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange(discrete ? stops![n] : n);
          }}
        />
        {discrete && (
          <div className="relative mt-1 h-6">
            {stops!.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                aria-label={`Set ${label} to ${stopLabel(s)}`}
                style={{ left: `calc(13px + (100% - 26px) * ${i / (stops!.length - 1)})` }}
                className={cn(
                  "absolute -translate-x-1/2 rounded-chip px-2 py-1 font-mono text-[12px] tabular-nums transition-colors duration-200",
                  s === value ? "text-ink" : "text-ink-2/75 hover:text-ink",
                )}
              >
                {stopLabel(s)}
              </button>
            ))}
          </div>
        )}
        {!discrete && endLabels && (
          <div className="relative mt-1 h-6">
            {endLabels.map(([v, text]) => (
              <span
                key={v}
                style={{ left: `calc(13px + (100% - 26px) * ${(v - lo) / (hi - lo)})` }}
                className="absolute -translate-x-1/2 px-2 py-1 font-mono text-[12px] tabular-nums text-ink-2/75"
              >
                {text}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Memoized: every prop is a primitive or a module constant, so an unrelated control moving does not re-render it. */
export const DialSlider = memo(DialSliderImpl);

// ------------------------------------------------------------- choice card

export interface ChoiceProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  icon?: ReactNode;
  label: ReactNode;
  hint?: ReactNode;
  /** Mono value on the right under the checkbox, e.g. "2 x 500". */
  meta?: string;
  className?: string;
}

/** A selectable card with a check box (multi-select). Space and Enter toggle it. */
export function Choice({ checked, onChange, icon, label, hint, meta, className }: ChoiceProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        styles.choice,
        "flex w-full items-center gap-3 rounded-btn border p-3 text-left",
        checked ? "border-ink bg-surface" : "border-hairline bg-paper hover:border-ink/40",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-chip transition-colors duration-200",
            checked ? "bg-ink text-paper" : "bg-surface text-ink-2",
          )}
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium leading-tight text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] leading-snug text-ink-2/75">{hint}</span>}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          aria-hidden="true"
          className={cn(
            styles.box,
            "grid size-5 place-items-center rounded-[6px] border",
            checked ? "border-ink bg-ink text-paper" : "border-ink/25 bg-paper",
          )}
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path pathLength={1} className={styles.boxCheck} d="M3.5 8.5l3 3 6-7" />
          </svg>
        </span>
        {meta && <span className="font-mono text-[11px] tabular-nums text-ink-2/75">{meta}</span>}
      </span>
    </button>
  );
}

// ------------------------------------------------------------- number field

export interface NumberFieldProps {
  label: string;
  unit: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  hint?: string;
}

/**
 * Number input that lets the field be cleared while typing, and clamps on blur. From `sm` it is a subgrid of
 * three rows (label, input, hint), for a parent grid that gives it `grid-rows-[auto_auto_auto]` (the
 * assumptions panel), so side-by-side fields keep their inputs level; a one-line label sits on its input.
 */
export function NumberField({ label, unit, value, onChange, min, max, step = 1, hint }: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? String(value);

  const commit = (raw: string) => {
    const n = Number(raw);
    if (raw.trim() !== "" && Number.isFinite(n)) onChange(Math.min(max, Math.max(min, n)));
  };

  return (
    <div className="flex flex-col gap-1.5 sm:row-span-3 sm:grid sm:grid-rows-subgrid">
      <label htmlFor={id} className="text-[13px] font-medium text-ink sm:self-end">
        {label}
      </label>
      <div className="flex h-11 items-center rounded-btn border border-hairline bg-paper px-3 transition-colors duration-200 focus-within:border-ink hover:border-ink/40">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={shown}
          onChange={(e) => {
            setText(e.target.value);
            commit(e.target.value);
          }}
          onBlur={() => setText(null)}
          className={cn(styles.numberInput, "w-full min-w-0 bg-transparent font-mono text-[14px] tabular-nums text-ink outline-none")}
        />
        <span className="ml-2 shrink-0 font-mono text-[12px] text-ink-2/75">{unit}</span>
      </div>
      {hint && <p className="text-[12px] leading-snug text-ink-2/75">{hint}</p>}
    </div>
  );
}

