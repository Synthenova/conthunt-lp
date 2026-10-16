"use client";

/**
 * Deep research fragment: the featured video broken into its six analyzed scenes (jreAl
 * "auto-chapters" pattern). Micro-interaction: on tile hover a highlight steps through the
 * scenes like a playhead and the timeline segment follows; hovering or focusing a scene snaps
 * the highlight to it. Leaving returns to 0:00. Scenes and facets are verbatim analysis output.
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/motion";
import { FACETS, SCENES, VIDEO } from "./data";
import { FEATURE_TONE, GLOW_BASE } from "./feature-tone";
import { TikTokGlyph } from "./glyphs";

const TONE = FEATURE_TONE.research;

/** Rows share one height (`grid-auto-rows: 1fr` = the tallest row), so the highlight is one
 *  row tall and moves by transform only, and long scene text wraps instead of truncating. */
const ROW_MIN_H = 50; // px
const STEP_MS = 420;
const TOTAL_S = SCENES[SCENES.length - 1].end;

const ts = (s: number) => `0:${String(s).padStart(2, "0")}`;

export function ResearchFragment({ active }: { active: boolean }) {
  const [scene, setScene] = useState(0);
  const manual = useRef(false);

  useEffect(() => {
    if (!active) {
      manual.current = false;
      const t = window.setTimeout(() => setScene(0), 160);
      return () => window.clearTimeout(t);
    }
    if (prefersReducedMotion()) return;
    const t = window.setInterval(() => {
      if (manual.current) return;
      setScene((s) => Math.min(s + 1, SCENES.length - 1));
    }, STEP_MS);
    return () => window.clearInterval(t);
  }, [active]);

  const pick = (i: number) => {
    manual.current = true;
    setScene(i);
  };

  const current = SCENES[scene];

  return (
    <div className={cn("relative rounded-[16px] border bg-paper p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]", TONE.border)}>
      <span aria-hidden="true" className={cn(GLOW_BASE, TONE.glow)} />
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="flex items-center gap-1.5 text-[12px] font-medium leading-none text-ink">
          <TikTokGlyph className="size-3.5" />
          {VIDEO.creator}
        </span>
        <span className="font-mono text-[11px] leading-none tabular-nums text-ink">
          {ts(current.start)} <span className="text-ink/62">/ {ts(TOTAL_S)}</span>
        </span>
      </div>

      {/* Scene timeline: segment widths are the real scene durations */}
      <div className="mt-2.5 flex gap-[3px] px-1" aria-hidden="true">
        {SCENES.map((s, i) => (
          <span
            key={s.start}
            className={cn(
              "h-1 rounded-full transition-colors duration-300 ease-out",
              i < scene ? "bg-purple/45" : i === scene ? "bg-purple" : "bg-ink/10",
            )}
            style={{ flexGrow: s.end - s.start, flexBasis: 0 }}
          />
        ))}
      </div>

      <ol className="relative mt-2.5 grid [grid-auto-rows:1fr]" aria-label="Scenes">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 rounded-[10px] bg-purple-soft transition-transform duration-300 ease-out"
          style={{ height: `${100 / SCENES.length}%`, transform: `translateY(${scene * 100}%)` }}
        />
        {SCENES.map((s, i) => (
          <li key={s.start} className="relative">
            <button
              type="button"
              aria-current={i === scene ? "step" : undefined}
              onPointerEnter={() => pick(i)}
              onFocus={() => pick(i)}
              onClick={() => pick(i)}
              className="flex h-full w-full gap-2 rounded-[10px] px-1.5 py-[7px] text-left"
              style={{ minHeight: ROW_MIN_H }}
            >
              <span className="flex w-10 shrink-0 flex-col gap-1">
                <span className={cn("font-mono text-[11px] leading-[1.3] tabular-nums transition-colors duration-200", i === scene ? "text-purple-ink" : "text-ink/62")}>
                  {ts(s.start)}
                </span>
                {s.tag && (
                  <span
                    className={cn(
                      "font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.02em] transition-colors duration-200",
                      i === scene ? "text-purple-ink" : "text-ink/62",
                    )}
                  >
                    {s.tag}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[12px] leading-[1.3] text-pretty transition-colors duration-200",
                  i === scene ? "text-ink" : "text-ink/62",
                )}
              >
                {s.text}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <dl className="mt-3 grid gap-1.5 border-t border-hairline px-1 pt-3">
        {FACETS.map((f) => (
          <div key={f.label} className="flex gap-2 text-[11.5px] leading-[1.3]">
            <dt className="w-12 shrink-0 font-mono text-[10.5px] leading-[1.45] text-ink/62">{f.label}</dt>
            <dd className="min-w-0 text-ink-2">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
