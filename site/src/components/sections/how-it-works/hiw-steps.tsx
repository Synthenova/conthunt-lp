"use client";

/**
 * The three step rows (plus the outro row) as wide rows inside the letterbox:
 * 01 text | visual, 02 text band over a full-width stage, 03 visual | text.
 *
 * Signature device: the left rail of the page becomes the run's progress line.
 * A 2px line grows down the rail with the reading position (62% of the viewport). It is ONE gradient
 * mapped to the whole rail (pink, orange, purple, blue, green from the first step to the outro), revealed
 * with a clip so the hues never squash as it grows, with a slow sheen flowing down it. Each row's node
 * takes the gradient colour at its position and fills when the row reaches it. No pinning (PLAN §2).
 * Reduced motion shows the whole gradient, static, and keeps the nodes (color only).
 */
import { MousePointer2 } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { observeInView } from "@/lib/media";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { AskVisual } from "./ask-visual";
import { BriefPicker } from "./brief-picker";
import { STEPS, type StepCopy } from "./content";
import { useHiw, type StepNumber } from "./hiw-context";
import { PlanStage } from "./plan-stage";
import { RankStage } from "./rank-stage";
import styles from "./hiw.module.css";

const HINTS = [
  "Pick a brief to rerun the whole walkthrough.",
  // Step 02 has a touch variant: there is no hover on phones, a tap pins the path.
  "Hover a question or a keyword to trace its path.",
  "Switch the sort to Views to see why raw reach misleads.",
] as const;
type StepHue = "pink" | "purple" | "blue";
/** Step hues (COLOR_SYSTEM.md): 01 pink, 02 purple, 03 blue; the outro row follows step 01. */
const STEP_INK: Record<StepCopy["index"], string> = { "01": "text-pink-ink", "02": "text-purple-ink", "03": "text-blue-ink" };
const STEP_HUE: Record<StepCopy["index"], StepHue> = { "01": "pink", "02": "purple", "03": "blue" };
const HINT_ICON: Record<StepHue, string> = { pink: "text-pink", purple: "text-purple", blue: "text-blue" };
/** The rail gradient's stops, evenly spaced from the top of the first step to the bottom of the outro (hiw.module.css `.railFill`). */
const RAIL_STOPS = ["--pink", "--orange", "--purple", "--blue", "--green"] as const;
/** The rail gradient's colour at fraction f (0 top, 1 bottom), as a CSS colour for a node. */
function railColor(f: number): string {
  const x = Math.min(1, Math.max(0, f)) * (RAIL_STOPS.length - 1);
  const i = Math.min(RAIL_STOPS.length - 2, Math.floor(x));
  const keep = Math.round((1 - (x - i)) * 100);
  return `color-mix(in oklab, var(${RAIL_STOPS[i]}) ${keep}%, var(${RAIL_STOPS[i + 1]}))`;
}
const HINT_TOUCH = "Tap a question or a keyword to see what it is wired to.";
/** Step 02's hint inside the plan stage's window bar (lg+), short enough to share the bar with the status. */
const BAR_HINT = "Hover a question or keyword to trace its path.";
const BAR_HINT_TOUCH = "Tap a question or keyword to trace its path.";
/** Space above each row's hairline. Tight on purpose: the hairline and its rail node already separate the rows. */
const ROW_GAP = "mt-7";

export function HiwSteps({ outro, className }: { outro?: ReactNode; className?: string }) {
  const { setActiveStep } = useHiw();
  const root = useRef<HTMLDivElement>(null);

  // Rail progress + row nodes + heading scroll-spy. Measured from live layout on scroll
  // (one rAF-throttled read per frame, only while the steps are near the viewport) rather
  // than from ScrollTrigger start/end values, so a pin spacer created later by another
  // section (statement-simulator) can never leave them stale.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const line = el.querySelector<HTMLElement>("[data-rail-progress]");
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-hiw-row]"));
    const markers = rows.map((row) => row.querySelector<HTMLElement>("[data-rail-marker]"));
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    let frame = 0;
    let near = false;
    let lastStep = 0;

    const update = () => {
      frame = 0;
      const mark = window.innerHeight * 0.62;
      const box = el.getBoundingClientRect();
      if (line) {
        const p = Math.min(1, Math.max(0, (mark - box.top) / Math.max(1, box.height)));
        // Clip, never scale: the gradient stays mapped to the whole rail while the fill grows.
        line.style.clipPath = reduced.matches ? "inset(0 0 0 0)" : `inset(0 0 ${((1 - p) * 100).toFixed(2)}% 0)`;
      }
      let step = 1;
      rows.forEach((row, i) => {
        const reached = row.getBoundingClientRect().top < mark;
        const marker = markers[i];
        if (marker) {
          marker.dataset.on = reached ? "true" : "false";
          // The node takes the rail colour at its own position (row top as a fraction of the rail).
          marker.style.setProperty("--node", railColor((row.getBoundingClientRect().top - box.top) / Math.max(1, box.height)));
        }
        const n = Number(row.dataset.hiwRow);
        if (reached && n >= 1 && n <= 3) step = n;
      });
      if (step !== lastStep) {
        lastStep = step;
        setActiveStep(step as StepNumber);
      }
    };
    const schedule = () => {
      if (near && !frame) frame = requestAnimationFrame(update);
    };
    const stopIO = observeInView(
      el,
      (entry) => {
        near = entry.isIntersecting;
        el.dataset.near = near ? "true" : "false";
        // Settle the final state when leaving, then stop reading layout.
        if (!frame) frame = requestAnimationFrame(update);
      },
      { rootMargin: "25% 0px 25% 0px" },
    );
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    return () => {
      stopIO();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [setActiveStep]);

  const [s1, s2, s3] = STEPS;

  return (
    <div ref={root} className={cn("relative", className)}>
      <span
        data-rail-progress
        aria-hidden="true"
        className={cn("pointer-events-none absolute bottom-0 left-[-0.5px] top-0 z-[1] w-[2px]", styles.railFill)}
        style={{ clipPath: "inset(0 0 100% 0)" }}
      />

      {/* 01: text | composer */}
      <StepRow n={1}>
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
          <StepText step={s1} hint={HINTS[0]} className="lg:col-span-5 max-[1439px]:lg:col-span-6">
            <BriefPicker className="mt-5" />
          </StepText>
          <AskVisual className="lg:col-span-7 lg:self-start max-[1439px]:lg:col-span-6" />
        </div>
      </StepRow>

      {/* 02: text band, then the full-width plan stage. From lg the hint sits in the
          stage's own window bar (next to what it explains), so it costs no extra row. */}
      <StepRow n={2} className={ROW_GAP}>
        {/* Heading | body on the same split as step 01 (6/6 below 1440px, 5/7 from it), so the body starts where the visual does. */}
        <div className="grid gap-y-5 lg:grid-cols-12 lg:items-end lg:gap-x-10">
          <StepHead step={s2} className="lg:col-span-5 max-[1439px]:lg:col-span-6" />
          <p className="max-w-[56ch] text-[16px] leading-[1.55] text-ink/60 lg:col-span-6 lg:col-start-6 max-[1439px]:lg:col-start-7">{s2.body}</p>
        </div>
        <PlanStage className="mt-5" hint={BAR_HINT} hintTouch={BAR_HINT_TOUCH} />
        <Hint hue="purple" className="mt-4 lg:hidden">
          <span className="pointer-coarse:hidden">{HINTS[1]}</span>
          <span className="hidden pointer-coarse:inline">{HINT_TOUCH}</span>
        </Hint>
      </StepRow>

      {/* 03: rank stage | text */}
      <StepRow n={3} className={ROW_GAP}>
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
          <StepText step={s3} hint={HINTS[2]} className="lg:col-span-4" />
          <RankStage className="lg:order-first lg:col-span-8 lg:self-start" />
        </div>
      </StepRow>

      {outro && (
        <StepRow n={4} id="hiw-next" className={ROW_GAP}>
          {outro}
        </StepRow>
      )}
    </div>
  );
}

/**
 * One row: a top hairline, a node on the rail, and content inset from both rails.
 * Anchor offset: Lenis already clears the navbar (-96px) for in-page links, so the
 * row only carries a scroll margin when Lenis is off (reduced motion, native jumps).
 */
function StepRow({ n, id, className, children }: { n: number; id?: string; className?: string; children: ReactNode }) {
  return (
    <div
      id={id ?? `hiw-step-${n}`}
      data-hiw-row={n}
      className={cn("relative border-t border-hairline px-5 pt-5 motion-reduce:scroll-mt-24 md:px-7 xl:px-8", className)}
    >
      <span
        data-rail-marker
        data-on="false"
        aria-hidden="true"
        className={cn(
          "absolute -left-1 -top-1 z-[2] size-[9px] border border-ink/25 bg-paper transition-[background-color,border-color] duration-300 ease-out data-[on=true]:border-transparent data-[on=true]:bg-[var(--node)]",
        )}
      />
      {children}
    </div>
  );
}

function StepHead({ step, className }: { step: StepCopy; className?: string }) {
  return (
    <div className={className}>
      <p className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.04em]">
        <span className={STEP_INK[step.index]}>{step.index}</span>
        <span className="text-ink/62">{step.label}</span>
      </p>
      <h3 className="mt-3 max-w-[16ch] text-[clamp(1.625rem,1.35rem+0.9vw,2.125rem)] font-bold leading-[1.06] tracking-[-0.03em] text-ink">
        {step.title}
      </h3>
    </div>
  );
}

function StepText({
  step,
  hint,
  className,
  children,
}: {
  step: StepCopy;
  hint: string;
  className?: string;
  /** Replaces the facts line (step 01 puts the brief picker here). */
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <StepHead step={step} />
      <p className="mt-4 max-w-[44ch] text-[16px] leading-[1.55] text-ink/60">{step.body}</p>
      {children ?? <Facts items={step.facts} className="mt-4" />}
      <Hint hue={STEP_HUE[step.index]} className={children ? "mt-3.5" : "mt-5"}>
        {hint}
      </Hint>
    </div>
  );
}

/**
 * The step's key facts as one wrapped line (no table restating the visual). Every
 * item carries the same small square (the rail node, in miniature), so a wrapped line
 * never starts with a stray separator.
 */
function Facts({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[14px] font-medium leading-[1.45] text-ink-2", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2">
          <span aria-hidden="true" className="size-[5px] shrink-0 border border-ink/35" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Hint({ children, className, hue = "pink" }: { children: ReactNode; className?: string; hue?: StepHue }) {
  return (
    <p className={cn("flex items-center gap-2 text-[13px] text-ink/62", className)}>
      <MousePointer2 aria-hidden="true" className={cn("size-3.5 shrink-0", HINT_ICON[hue])} strokeWidth={2} />
      {children}
    </p>
  );
}
