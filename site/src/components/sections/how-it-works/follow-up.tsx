"use client";

/**
 * Outro chat: the agent offers to keep going and three follow-up pills (per brief)
 * type themselves into a mini composer. The send control is the real next step: it
 * opens the app ("Get started"). Typing is instant under reduced motion.
 *
 * No tray: the agent line, the outlined suggestions and the floating composer sit on
 * the page, so there is one surface level (the composer) instead of three.
 */
import { ArrowUpRight, CornerDownRight, Telescope } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL } from "@/lib/links";
import { prefersReducedMotion } from "@/lib/motion";
import { useHiw } from "./hiw-context";
import styles from "./hiw.module.css";

export function FollowUp({ className }: { className?: string }) {
  const { scenario } = useHiw();
  const root = useRef<HTMLDivElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const sendRef = useRef<HTMLAnchorElement>(null);
  const typingProxy = useRef({ n: 0 });
  const [chosen, setChosen] = useState<number | null>(null);
  const [chosenFor, setChosenFor] = useState(scenario.id);

  // A new brief brings new suggestions: clear the composer.
  if (chosenFor !== scenario.id) {
    setChosenFor(scenario.id);
    setChosen(null);
  }

  // Stop any typing tween when the brief changes or the section unmounts.
  useGSAP(() => () => gsap.killTweensOf(typingProxy.current), { dependencies: [scenario.id] });

  const choose = (i: number) => {
    const el = typedRef.current;
    if (!el) return;
    setChosen(i);
    const text = scenario.followUps[i];
    if (sendRef.current) gsap.killTweensOf(sendRef.current);
    if (prefersReducedMotion()) {
      el.textContent = text;
      return;
    }
    const proxy = typingProxy.current;
    gsap.killTweensOf(proxy);
    proxy.n = 0;
    root.current?.setAttribute("data-typing", "true");
    gsap.to(proxy, {
      n: text.length,
      duration: Math.min(1.6, text.length * 0.028),
      ease: "none",
      onUpdate: () => {
        el.textContent = text.slice(0, Math.round(proxy.n));
      },
      onComplete: () => {
        root.current?.setAttribute("data-typing", "false");
        if (sendRef.current) gsap.fromTo(sendRef.current, { scale: 1 }, { scale: 1.06, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
      },
    });
  };

  return (
    <div ref={root} className={cn("@container", className)}>
      {/* Agent message */}
      <div className="flex gap-3 pb-3">
        <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-[9px] bg-ink font-mono text-[11px] text-paper">
          C
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium text-ink/62">ContHunt agent</p>
          <p className="mt-0.5 text-[14.5px] leading-[1.45] text-ink-2">
            That answer cites {scenario.cited} of the {scenario.passed.toLocaleString("en-US")} videos I watched. Want me to go
            further?
          </p>
        </div>
      </div>

      {/* Suggestions */}
      <div role="group" aria-label="Follow-up suggestions" className="flex flex-col gap-1.5 pb-3">
        {scenario.followUps.map((text, i) => {
          const active = chosen === i;
          return (
            <button
              key={text}
              type="button"
              aria-pressed={active}
              onClick={() => choose(i)}
              className={cn(
                "group/sug flex min-h-10 pointer-coarse:min-h-11 items-center gap-2.5 rounded-[12px] px-3 py-1.5 text-left text-[13.5px] font-medium leading-[1.35] text-ink-2",
                "transition-[background-color,color,box-shadow,scale] duration-200 ease-out active:scale-[0.99]",
                active
                  ? "bg-pink-soft text-ink shadow-[inset_0_0_0_1.5px_var(--pink)]"
                  : "shadow-[inset_0_0_0_1px_var(--hairline)] hover:bg-paper hover:text-ink hover:shadow-[inset_0_0_0_1px_rgba(15,15,15,0.18)]",
              )}
            >
              <CornerDownRight
                aria-hidden="true"
                className={cn(
                  "size-3.5 shrink-0 transition-[color,translate] duration-200 ease-out group-hover/sug:translate-x-0.5",
                  "text-pink",
                )}
                strokeWidth={2}
              />
              {text}
            </button>
          );
        })}
      </div>

      {/* Mini composer */}
      <div className="rounded-[18px] bg-paper shadow-float">
        <div className="relative min-h-[42px] px-4 pb-0.5 pt-2.5 text-[15px] leading-[1.5] text-ink">
          {chosen === null && (
            <span className="pointer-events-none absolute left-4 top-2.5 text-ink/62">Send a message</span>
          )}
          <span key={scenario.id} ref={typedRef} />
          <span aria-hidden="true" className={cn("ml-px inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-pink", styles.caret)} />
        </div>
        <div className="flex items-center gap-1.5 px-2 pb-2">
          <span
            aria-hidden="true"
            className="hidden h-8 items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-accent/10 px-2.5 text-[12.5px] font-medium text-accent @min-[340px]:inline-flex"
          >
            <Telescope className="size-3.5" strokeWidth={1.75} />
            Deep Research
          </span>
          <a
            ref={sendRef}
            href={GET_STARTED_URL}
            {...phAttrs("how_it_works", "app")}
            className="relative ml-auto inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[11px] bg-ink pl-3.5 pr-3 text-[13px] font-medium text-paper transition-[background-color,scale] duration-200 after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] hover:bg-ink-2 active:scale-[0.96]"
          >
            Continue in ContHunt
            <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={2} />
          </a>
        </div>
      </div>
    </div>
  );
}
