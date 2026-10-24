"use client";

/**
 * Multi-platform fragment: a search composer. Micro-interaction: on tile hover the platform
 * chips snap on one after another (TikTok → Reels → Shorts) with a plus→check morph; leaving
 * resets them. Chips and the Keyword / Hashtag / Creator switch are also clickable.
 * Query values are real: the sample query, a caption tag and the creator of the featured video.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Check, Plus, Search } from "lucide-react";
import { capture } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { PLATFORMS, SEARCH_MODES, type PlatformKey } from "./data";
import { FEATURE_TONE, GLOW_BASE } from "./feature-tone";
import { PLATFORM_GLYPH } from "./glyphs";

const TONE = FEATURE_TONE.platforms;

const DEFAULT_ON: PlatformKey[] = ["tiktok"];
const SNAP_GAP_MS = 110;

export function PlatformsFragment({ active }: { active: boolean }) {
  const [mode, setMode] = useState(0);
  const [on, setOn] = useState<Set<PlatformKey>>(() => new Set(DEFAULT_ON));
  const touched = useRef(false);
  const modeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!active) {
      touched.current = false;
      const t = window.setTimeout(() => setOn(new Set(DEFAULT_ON)), 120);
      return () => window.clearTimeout(t);
    }
    const timers = PLATFORMS.map((p, i) =>
      window.setTimeout(() => {
        if (touched.current) return;
        setOn((prev) => new Set(prev).add(p.key));
      }, 90 + i * SNAP_GAP_MS),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active]);

  const toggle = (key: PlatformKey) => {
    touched.current = true;
    capture("bento_interacted", { control: "platform", value: key });
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(key) && next.size > 1) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Radio group: one Tab stop (the checked mode), Arrow/Home/End move focus and selection together.
  const onModeKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const n = SEARCH_MODES.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setMode(next);
    capture("bento_interacted", { control: "platform_mode", value: SEARCH_MODES[next]?.key ?? String(next) });
    modeRefs.current[next]?.focus();
  };

  return (
    <div className={cn("relative -mr-6 -mb-6 rounded-tl-[16px] border-l border-t bg-paper p-3 pb-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:-mr-7 md:-mb-7 md:pb-7", TONE.border)}>
      <span aria-hidden="true" className={cn(GLOW_BASE, TONE.glow)} />
      {/* Mode switch */}
      <div role="radiogroup" aria-label="Search by" className="relative inline-grid grid-cols-3 rounded-[10px] bg-surface p-[3px]">
        <span
          aria-hidden="true"
          className="absolute inset-y-[3px] left-[3px] w-[calc((100%-6px)/3)] rounded-[7px] bg-paper shadow-[0_1px_2px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${mode * 100}%)` }}
        />
        {SEARCH_MODES.map((m, i) => (
          <button
            key={m.key}
            ref={(el) => {
              modeRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={i === mode}
            tabIndex={i === mode ? 0 : -1}
            onClick={() => {
              setMode(i);
              capture("bento_interacted", { control: "platform_mode", value: m.key });
            }}
            onKeyDown={(e) => onModeKey(e, i)}
            className={cn(
              "relative z-[1] px-3 py-1.5 text-[12.5px] font-medium leading-none transition-colors duration-200 pointer-coarse:py-3",
              i === mode ? "text-ink" : "text-ink/62 hover:text-ink",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Query field */}
      <div className="mt-3 flex items-center gap-2.5 rounded-[12px] border border-hairline px-3 py-2.5">
        <Search className="size-4 shrink-0 text-ink/55" strokeWidth={1.75} aria-hidden="true" />
        <div className="grid min-w-0 flex-1">
          {SEARCH_MODES.map((m, i) => (
            <span
              key={m.key}
              aria-hidden={i !== mode}
              className={cn(
                "col-start-1 row-start-1 truncate text-[15px] font-medium leading-6 tracking-[-0.01em] text-ink transition-[opacity,translate] duration-300 ease-out",
                i === mode ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
              )}
            >
              {m.value}
              <span className="ml-0.5 inline-block h-[1.05em] w-px translate-y-[0.18em] bg-pink" aria-hidden="true" />
            </span>
          ))}
        </div>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-ink text-paper" aria-hidden="true">
          <ArrowUp className="size-4" strokeWidth={2} />
        </span>
      </div>

      {/* Platform chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Platforms">
        {PLATFORMS.map((p) => {
          const isOn = on.has(p.key);
          const Glyph = PLATFORM_GLYPH[p.key];
          return (
            <button
              key={p.key}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggle(p.key)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-[9px] border pl-2 pr-2.5 text-[12.5px] font-medium leading-none transition-[background-color,border-color,color,scale] duration-200 ease-out active:scale-[0.96] pointer-coarse:h-10",
                isOn ? "border-pink-ink bg-pink-ink text-white" : "border-hairline bg-paper text-ink-2 hover:border-ink/25",
              )}
            >
              <span className="relative size-3.5" aria-hidden="true">
                <Plus
                  className={cn(
                    "absolute inset-0 size-3.5 transition-[opacity,scale,filter] duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)]",
                    isOn ? "scale-25 opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0",
                  )}
                  strokeWidth={2}
                />
                <Check
                  className={cn(
                    "absolute inset-0 size-3.5 transition-[opacity,scale,filter] duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)]",
                    isOn ? "scale-100 opacity-100 blur-0" : "scale-25 opacity-0 blur-[4px]",
                  )}
                  strokeWidth={2.25}
                />
              </span>
              <Glyph className="size-3.5" />
              {p.label}
            </button>
          );
        })}
        <span className="ml-auto pl-2 font-mono text-[11px] tabular-nums text-ink/62" aria-live="polite">
          {on.size} of {PLATFORMS.length} platforms
        </span>
      </div>
    </div>
  );
}
