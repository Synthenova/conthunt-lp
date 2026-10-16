"use client";

/**
 * FeatureTile — one smaller bento tile: a jreAl two-tone caption (1–2 ink words on line one, then a muted
 * continuation at the same size) above ONE coded UI fragment.
 *
 *   <FeatureTile feature={FEATURES.niche}>{(active) => <NicheFragment active={active} />}</FeatureTile>
 *
 * `active` is true while a mouse/pen hovers the tile or focus is inside it. On devices without
 * hover it turns on while the tile is at least 60% in view, so touch users still see the
 * micro-interaction. Fragments decide what `active` does (200–400ms, ch.out).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { observeInView } from "@/lib/media";
import type { Feature } from "./data";
import { FEATURE_TONE } from "./feature-tone";

export interface FeatureTileProps {
  feature: Feature;
  children: (active: boolean) => ReactNode;
  className?: string;
  /** Classes for the fragment area (e.g. negative margins to bleed off an edge). */
  fragmentClassName?: string;
}

/** Keep hyphenated words ("low-competition") on one line so balance never breaks at "-". */
function keepHyphens(text: string): ReactNode {
  return text.split(/(\S+-\S+)/).map((part, i) =>
    /\S+-\S+/.test(part) ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export function FeatureTile({ feature, children, className, fragmentClassName }: FeatureTileProps) {
  const ref = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: hover)").matches) return;
    return observeInView(el, (e) => setInView(e.isIntersecting && e.intersectionRatio >= 0.6), { threshold: [0, 0.6, 1] });
  }, []);

  const active = hovered || focused || inView;
  const tone = FEATURE_TONE[feature.key];

  return (
    <article
      ref={ref}
      data-feature={feature.key}
      data-active={active}
      onPointerEnter={(e) => e.pointerType !== "touch" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType !== "touch" && setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className={cn("group/tile @container/tile relative flex min-w-0 flex-col overflow-hidden rounded-card p-6 md:p-7", tone.backdrop, className)}
    >
      {/* Glow blob: transform and opacity only. Sits under the caption and the fragment. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -bottom-1/3 -right-1/4 aspect-square w-3/4 rounded-full blur-3xl transition-[opacity,scale] duration-500 ease-out group-data-[active=true]/tile:scale-110",
          tone.blob,
        )}
      />
      {/* jreAl: the ink caption owns line one, the muted continuation balances below it. The
          size follows the viewport but is capped by the tile's own width (cqi), so narrow tiles
          never split "Deep research." or orphan "Like". Bold (700) at >= 18.66px is WCAG
          "large text", so --muted on --surface (3.3:1) passes 3:1; the floor stays at 19px. */}
      <h3 className="relative z-[1] max-w-[36ch] text-[length:max(1.1875rem,min(clamp(1.1875rem,1.05rem+0.45vw,1.4375rem),calc(6cqi+8px)))] font-bold leading-[1.16] tracking-[-0.025em] text-ink">
        <span className="block whitespace-nowrap">{feature.caption}</span>{" "}
        <span className="block text-balance text-muted">{keepHyphens(feature.rest)}</span>
      </h3>
      <div className={cn("relative z-[1] mt-7 flex flex-1 flex-col justify-end", fragmentClassName)}>{children(active)}</div>
    </article>
  );
}
