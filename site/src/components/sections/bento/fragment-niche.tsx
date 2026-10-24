"use client";

/**
 * Niche hunter fragment: a cloud of niche chips (labels from the Viral Now niche list) and a
 * four-corner reticle. Micro-interaction: on tile hover the reticle snaps from its idle frame
 * onto a niche (corners travel independently, 320ms ch.out); pointing at any other chip
 * re-targets it. No metrics are shown or implied.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { capture } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { EASE, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { NICHES, NICHE_DEFAULT } from "./data";
import { FEATURE_TONE, GLOW_BASE } from "./feature-tone";

const TONE = FEATURE_TONE.niche;

const CORNER = 9; // px
const PAD = 4; // px around the target chip

export function NicheFragment({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const target = active ? (picked ?? NICHE_DEFAULT) : null;

  const aim = useCallback((slug: string | null) => {
    const box = root.current;
    if (!box) return;
    const corners = gsap.utils.toArray<HTMLElement>("[data-corner]", box);
    let x = 0;
    let y = 0;
    let w = box.offsetWidth;
    let h = box.offsetHeight;
    let alpha = 0.35;
    const chip = slug ? box.querySelector<HTMLElement>(`[data-niche="${slug}"]`) : null;
    if (chip) {
      x = chip.offsetLeft - PAD;
      y = chip.offsetTop - PAD;
      w = chip.offsetWidth + PAD * 2;
      h = chip.offsetHeight + PAD * 2;
      alpha = 1;
    }
    const spots = [
      [x, y],
      [x + w - CORNER, y],
      [x, y + h - CORNER],
      [x + w - CORNER, y + h - CORNER],
    ];
    const reduced = prefersReducedMotion();
    corners.forEach((c, i) =>
      gsap.to(c, {
        x: spots[i][0],
        y: spots[i][1],
        autoAlpha: alpha,
        duration: reduced ? 0 : 0.32,
        delay: reduced ? 0 : i * 0.018,
        ease: EASE.out,
        overwrite: "auto",
      }),
    );
  }, []);

  const targetRef = useRef<string | null>(null);

  // Re-aim on resize (chips reflow) and kill the corner tweens on unmount.
  useEffect(() => {
    const box = root.current;
    if (!box) return;
    const ro = new ResizeObserver(() => aim(targetRef.current));
    ro.observe(box);
    return () => {
      ro.disconnect();
      gsap.killTweensOf(box.querySelectorAll("[data-corner]"));
    };
  }, [aim]);

  useEffect(() => {
    targetRef.current = target;
    aim(target);
  }, [aim, target]);

  const locked = NICHES.find((n) => n.slug === target);

  return (
    <div className={cn("relative rounded-[16px] border bg-paper p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]", TONE.border)}>
      <span aria-hidden="true" className={cn(GLOW_BASE, TONE.glow)} />
      <div ref={root} className="relative flex flex-wrap gap-1.5 p-1">
        {NICHES.map((n) => (
          <button
            key={n.slug}
            type="button"
            data-niche={n.slug}
            aria-pressed={n.slug === target}
            onPointerEnter={() => setPicked(n.slug)}
            onFocus={() => setPicked(n.slug)}
            onClick={() => {
              setPicked(n.slug);
              capture("bento_interacted", { control: "niche", value: n.slug });
            }}
            className={cn(
              "relative z-[1] h-7 rounded-[8px] border px-2.5 text-[12.5px] font-medium leading-none transition-[background-color,border-color,color] duration-200 ease-out pointer-coarse:h-9",
              n.slug === target ? "border-yellow-deep bg-yellow text-ink" : "border-hairline bg-paper text-ink-2",
            )}
          >
            {n.label}
          </button>
        ))}
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            data-corner
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-[2] border-yellow-deep opacity-0",
              i === 0 && "rounded-tl-[3px] border-l-[1.5px] border-t-[1.5px]",
              i === 1 && "rounded-tr-[3px] border-r-[1.5px] border-t-[1.5px]",
              i === 2 && "rounded-bl-[3px] border-b-[1.5px] border-l-[1.5px]",
              i === 3 && "rounded-br-[3px] border-b-[1.5px] border-r-[1.5px]",
            )}
            style={{ width: CORNER, height: CORNER }}
          />
        ))}
      </div>
      <p className="mt-2 flex items-center justify-between border-t border-hairline px-1 pt-2 font-mono text-[10.5px] uppercase leading-none tracking-[0.04em]">
        <span className="text-ink/62">{locked ? "Locked" : "Niches"}</span>
        <span className={cn("transition-colors duration-200", locked ? "text-ink" : "text-ink/62")} aria-live="polite">
          {locked ? locked.label : `${NICHES.length} in view`}
        </span>
      </p>
    </div>
  );
}
