"use client";

/**
 * Velocity fragment: a view curve against a dashed "creator average" line. ILLUSTRATIVE: the
 * shape is not tied to any video and carries no numbers (labelled in the UI).
 * Micro-interaction: on tile hover the ink curve draws over the faint one (stroke-dashoffset
 * via DrawSVG), the break-out point pops and an "Outpacing avg" chip morphs in.
 */
import { useId, useMemo, useRef } from "react";
import { TrendingUp } from "lucide-react";
import { curveMonotoneX, line } from "d3-shape";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { FEATURE_TONE, GLOW_BASE } from "./feature-tone";

const TONE = FEATURE_TONE.velocity;

const W = 240;
const H = 110;
const AVG = 0.42; // baseline height (0..1), illustrative
const SHAPE = [0.3, 0.36, 0.31, 0.4, 0.35, 0.41, 0.37, 0.45, 0.43, 0.55, 0.68, 0.84, 0.97];
const BREAK_INDEX = 9; // first point clearly above the baseline

const px = (i: number) => (i / (SHAPE.length - 1)) * W;
const py = (v: number) => H - 6 - v * (H - 16);

export function VelocityFragment({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const path = useMemo(() => line().curve(curveMonotoneX)(SHAPE.map((v, i) => [px(i), py(v)] as [number, number])) ?? "", []);
  const fillPath = `${path} L${W},${H} L0,${H} Z`;
  const gradId = useId();
  const end = { x: px(SHAPE.length - 1), y: py(SHAPE[SHAPE.length - 1]) };
  const brk = { x: px(BREAK_INDEX), y: py(SHAPE[BREAK_INDEX]) };

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const d = reduced ? 0 : 1;
      if (active) {
        gsap.fromTo(
          "[data-ink]",
          { drawSVG: "0% 0%", opacity: 1 },
          { drawSVG: "0% 100%", opacity: 1, duration: 0.75 * d, ease: "power2.inOut", overwrite: "auto" },
        );
        gsap.fromTo(
          "[data-fill]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6 * d, delay: 0.35 * d, ease: "none", overwrite: "auto" },
        );
        gsap.fromTo(
          "[data-dot]",
          { scale: 0.25, autoAlpha: 0, filter: "blur(4px)" },
          { scale: 1, autoAlpha: 1, filter: "blur(0px)", duration: 0.3 * d, delay: 0.55 * d, ease: EASE.out, stagger: 0.12 * d, overwrite: "auto" },
        );
        gsap.fromTo(
          "[data-chip]",
          { y: 6, autoAlpha: 0, filter: "blur(4px)" },
          { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.32 * d, delay: 0.7 * d, ease: EASE.out, overwrite: "auto" },
        );
      } else {
        gsap.to("[data-ink]", { drawSVG: "0% 0%", duration: 0.3 * d, ease: EASE.outFast, overwrite: "auto" });
        gsap.to(["[data-dot]", "[data-chip]", "[data-fill]"], { autoAlpha: 0, duration: 0.18 * d, overwrite: "auto" });
      }
    },
    { scope: root, dependencies: [active] },
  );

  return (
    <div ref={root} className={cn("relative rounded-[16px] border bg-paper p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]", TONE.border)}>
      <span aria-hidden="true" className={cn(GLOW_BASE, TONE.glow)} />
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 px-1">
        <span className="whitespace-nowrap font-mono text-[10.5px] uppercase leading-none tracking-[0.04em] text-ink/62">Views over time</span>
        {/* The one "Illustrative" label style, shared with the Tracking history chart. */}
        <Badge tone="outline" className="text-muted">
          Illustrative
        </Badge>
      </div>
      <div className="relative mt-3 aspect-[240/110] w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--growth)" stopOpacity={0.2} />
              <stop offset="1" stopColor="var(--growth)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path data-fill d={fillPath} fill={`url(#${gradId})`} stroke="none" className="invisible opacity-0" />
          <line
            x1={0}
            x2={W}
            y1={py(AVG)}
            y2={py(AVG)}
            stroke="currentColor"
            className="text-ink/35"
            strokeWidth={1}
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
          <path d={path} fill="none" stroke="currentColor" className="text-growth/20" strokeWidth={1.75} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path
            data-ink
            d={path}
            fill="none"
            stroke="currentColor"
            className="text-growth"
            strokeWidth={1.75}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0}
          />
        </svg>
        <span
          className="absolute right-0 font-mono text-[10.5px] uppercase leading-none tracking-[0.04em] text-ink/62"
          style={{ top: `calc(${(py(AVG) / H) * 100}% + 6px)` }}
        >
          Creator avg
        </span>
        {[brk, end].map((p, i) => (
          <span
            key={i}
            data-dot
            aria-hidden="true"
            className={cn(
              "invisible absolute -ml-[4.5px] -mt-[4.5px] size-[9px] rounded-full opacity-0",
              i === 0 ? "border-[1.5px] border-growth bg-paper" : "bg-growth ring-4 ring-growth/15",
            )}
            style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
          />
        ))}
        <span
          data-chip
          className="invisible absolute left-0 top-0 flex items-center gap-1 rounded-[7px] bg-green-ink px-2 py-1 text-[11px] font-medium leading-none text-white opacity-0"
        >
          <TrendingUp className="size-3" strokeWidth={2.25} aria-hidden="true" />
          Outpacing avg
        </span>
      </div>
      <p className="sr-only">Illustrative chart: a video&apos;s views rising above its creator&apos;s average.</p>
    </div>
  );
}
