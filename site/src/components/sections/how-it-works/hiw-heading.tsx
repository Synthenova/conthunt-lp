"use client";

/**
 * Section heading in the D1IvW3 pattern: three short lines, one per step. The verbs
 * sit in soft pills with mono superscript step numbers; each pill is a link to its
 * step. The pill of the step currently in view takes the step's hue (scroll-spy from HiwSteps);
 * hover only darkens a pill, so the current step stays unambiguous. Line 1 is ink,
 * lines 2-3 are the muted continuation. One Boska keyword.
 *
 * The header sits flush on the rail like every other home section header (one left edge
 * down the page). The step rows below keep their inset because the rail carries their
 * spectrum progress line and nodes. Each line stays on one line at every width: below
 * ~520px the size follows the viewport instead of Display L.
 */
import { useRef, type ReactNode } from "react";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { onceInView } from "@/lib/media";
import { MOTION_OK } from "@/lib/motion";
import { useHiw, type StepNumber } from "./hiw-context";

/** The active verb pill takes its step's hue (01 pink, 02 purple, 03 blue). Full class names, so Tailwind emits them. */
const VERB_ACTIVE: Record<StepNumber, { pill: string; sup: string }> = {
  1: { pill: "bg-pink-soft text-pink-ink", sup: "text-pink-ink" },
  2: { pill: "bg-purple-soft text-purple-ink", sup: "text-purple-ink" },
  3: { pill: "bg-blue-soft text-blue-ink", sup: "text-blue-ink" },
};

export function HiwHeading({ index, total }: { index?: number; total?: number }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Fires once at ~10% into view. IntersectionObserver instead of ScrollTrigger so
        // a pin spacer added later above this section cannot make it fire offscreen.
        const tween = gsap.from(el.querySelectorAll("[data-line], [data-aside]"), {
          yPercent: 60,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: EASE.out,
          paused: true,
        });
        const stop = onceInView(el, () => tween.play(), { rootMargin: "0px 0px -10% 0px" });
        return () => stop();
      });
    },
    { scope: root },
  );

  return (
    <header ref={root}>
      <div>
        <Eyebrow index={index} total={total} label="How it works" />
        {/* Display L, capped so the longest line ("Watches 500+ videos.") fits a phone. */}
        <h2 className="display-l mt-5 text-[min(clamp(2.125rem,1.4648rem+2.8169vw,4rem),calc((100vw-44px)/10.9))] leading-[1.1]">
          <span data-line className="block whitespace-nowrap">
            <Verb step={1}>Splits</Verb> your question.
          </span>
          <span data-line className="block whitespace-nowrap text-muted">
            <Verb step={2}>Watches</Verb> 500+ videos.
          </span>
          <span data-line className="block whitespace-nowrap text-muted">
            <Verb step={3}>Ranks</Verb> what <Emphasis>wins</Emphasis>.
          </span>
        </h2>
      </div>
      {/* Legend for the Q and P tags used in step 02. */}
      <div data-aside className="mt-5">
        <dl className="flex flex-col gap-1.5 text-[13px] text-ink/60 sm:flex-row sm:flex-wrap sm:gap-x-7">
          <div className="flex items-center gap-2.5">
            <dt className="grid h-5 w-7 place-items-center rounded-[5px] bg-purple-soft font-mono text-[10.5px] text-purple-ink">Q</dt>
            <dd>a question the agent must answer</dd>
          </div>
          <div className="flex items-center gap-2.5">
            <dt className="grid h-5 w-7 place-items-center rounded-[5px] bg-yellow-soft font-mono text-[10.5px] text-yellow-ink">P</dt>
            <dd>a parameter every video is scored on</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

/**
 * The accessible name comes from the content, so it starts with the visible word
 * ("Splits, step 1"): the mono superscript is decorative and the step number is
 * spoken from a visually hidden suffix (WCAG 2.5.3, label in name).
 */
function Verb({ step, children }: { step: StepNumber; children: ReactNode }) {
  const { activeStep } = useHiw();
  const active = activeStep === step;
  return (
    <a
      href={`#hiw-step-${step}`}
      aria-current={active ? "step" : undefined}
      className="group/verb inline-flex items-start whitespace-nowrap align-baseline"
    >
      {/* The pill box starts on the column edge, so the eyebrow, pills and sub line align. */}
      <span
        className={cn(
          "rounded-[0.16em] px-[0.14em] pb-[0.04em] pt-[0.02em] leading-[0.98] transition-[background-color,color] duration-300 ease-out",
          active ? VERB_ACTIVE[step].pill : "bg-ink/[0.055] group-hover/verb:bg-ink/10 group-hover/verb:text-ink",
        )}
      >
        {children}
      </span>
      <sup
        aria-hidden="true"
        className={cn(
          "top-0 ml-[0.12em] mt-[0.18em] font-mono text-[max(11px,0.2em)] font-medium leading-none tracking-normal transition-colors duration-300",
          active ? VERB_ACTIVE[step].sup : "text-ink/62 group-hover/verb:text-ink",
        )}
      >
        {`0${step}`}
      </sup>
      <span className="sr-only">{`, step ${step}`}</span>
    </a>
  );
}
