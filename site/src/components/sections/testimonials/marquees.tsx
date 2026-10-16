"use client";

/**
 * TestimonialMarquees — the moving part of the testimonials band.
 *
 *  - `band`: a visible Pause control (WCAG 2.2.2: moving content longer than 5s
 *    needs a way to stop it) and the rows. With fewer than TWO_ROW_MIN quotes it
 *    is ONE row: two rows of four quotes read as wallpaper, because every card
 *    would stack above a copy of itself. From TWO_ROW_MIN quotes up it becomes
 *    two Marquee rows in opposite directions, the second offset by half the list
 *    so stacked cards differ. The second row is a visual echo of the same
 *    quotes, so it is aria-hidden (screen readers hear each quote once).
 *  - `compact`: one row, smaller cards, no pause control (the pricing page strip).
 *
 * Under prefers-reduced-motion the marquees are not rendered at all; a static
 * three-card row is shown instead (CSS `motion-reduce:` swap, so there is no
 * flash and no JS needed).
 *
 * The data has four unique quotes, so each row copy repeats them twice. That
 * keeps the loop seamless on ultra-wide screens (a copy must be wider than the
 * viewport). The repeated half is aria-hidden. Card width grows with the
 * viewport (clamp, 25vw) so that four cards span a 1920px screen and no quote
 * shows twice at once below ~1920px.
 */
import { Pause, Play } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Testimonial } from "@/content/site/testimonials";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/cn";
import { TestimonialCard } from "./card";

/** Below this many quotes the band is a single row (see above). Add quotes to src/content/site/testimonials.ts and it becomes two rows by itself. */
export const TWO_ROW_MIN = 6;

function rotate<T>(list: readonly T[], by: number): T[] {
  if (list.length === 0) return [];
  const n = ((by % list.length) + list.length) % list.length;
  return [...list.slice(n), ...list.slice(0, n)];
}

function Row({ items, size }: { items: readonly Testimonial[]; size: "default" | "compact" }) {
  const width = size === "compact" ? "w-[clamp(280px,22vw,400px)]" : "w-[clamp(300px,25vw,480px)]";
  const set = (hidden: boolean) => {
    const cards = items.map((item, i) => <TestimonialCard key={`${item.name}-${hidden}`} item={item} index={i} size={size} className={width} />);
    return hidden ? (
      <div key="repeat" className="contents" aria-hidden="true">
        {cards}
      </div>
    ) : (
      <div key="first" className="contents">
        {cards}
      </div>
    );
  };
  return (
    <>
      {set(false)}
      {set(true)}
    </>
  );
}

export interface TestimonialMarqueesProps {
  items: readonly Testimonial[];
  variant: "band" | "compact";
  /** Band only: heading block rendered at the left of the header row; the Pause control sits at its right. */
  header?: ReactNode;
  className?: string;
}

/** Header (band), rows and the Pause control. `paused` freezes both rows through CSS. */
export function TestimonialMarquees({ items, variant, header, className }: TestimonialMarqueesProps) {
  const [paused, setPaused] = useState(false);
  const compact = variant === "compact";
  const size = compact ? "compact" : "default";
  const twoRows = !compact && items.length >= TWO_ROW_MIN;

  return (
    <div className={cn("flex flex-col", className)}>
      {!compact && (
        <div className="letterbox mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1.5 md:flex-row md:items-end md:gap-8">{header}</div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className={cn(
              "group/pause -ml-3 inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-chip px-3 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-ink-2/75 motion-reduce:hidden md:ml-0 md:self-auto",
              "transition-[background-color,color,transform] duration-200 ease-out hover:bg-surface-2 hover:text-ink active:scale-[0.96]",
            )}
          >
            <span className="relative inline-flex size-3.5 items-center justify-center">
              <Pause
                aria-hidden="true"
                className={cn("absolute size-3.5 transition-[opacity,transform,filter] duration-200 ease-out", paused ? "scale-[0.25] opacity-0 blur-[2px]" : "scale-100 opacity-100 blur-0")}
              />
              <Play
                aria-hidden="true"
                className={cn("absolute size-3.5 transition-[opacity,transform,filter] duration-200 ease-out", paused ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[2px]")}
              />
            </span>
            {paused ? "Play" : "Pause"}
            <span className="sr-only"> testimonials</span>
          </button>
        </div>
      )}

      {/* Reduced motion: static 3-card row. */}
      <div className="letterbox hidden gap-4 motion-reduce:grid lg:motion-reduce:grid-cols-3">
        {items.slice(0, 3).map((item, i) => (
          <TestimonialCard key={item.name} item={item} index={i} size={size} className="w-full" />
        ))}
      </div>

      {/* Motion: marquee rows. */}
      <div
        data-paused={paused ? "" : undefined}
        className={cn(
          "flex flex-col gap-1 motion-reduce:hidden",
          // Freeze both rows while paused. Beats the inline play-state var (set by Marquee).
          "[&[data-paused]_.ch-marquee-track]:[animation-play-state:paused]!",
        )}
      >
        <Marquee label="Customer testimonials" speed={compact ? 30 : 34} gap={24} className="py-3" rowClassName="items-stretch">
          <Row items={items} size={size} />
        </Marquee>
        {twoRows && (
          <div aria-hidden="true">
            <Marquee direction="right" speed={28} gap={24} className="py-3" rowClassName="items-stretch">
              <Row items={rotate(items, Math.floor(items.length / 2))} size={size} />
            </Marquee>
          </div>
        )}
      </div>

    </div>
  );
}
