"use client";

/**
 * Step 01 visual: a chat composer types the brief, the send button pulses, then the
 * prompt lifts into the transcript as a sent message and the Deep Search worker
 * starts planning. The "Try a brief" pills live in the step text (brief-picker.tsx).
 *
 * Default markup is the final state (sent message + worker row), so reduced motion
 * and no-JS visitors see the finished frame.
 */
import { ArrowDown, ArrowUp, Plus, Telescope } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { PlatformGlyph } from "./glyphs";
import { useHiw } from "./hiw-context";
import { playWhenVisible } from "./playback";
import styles from "./hiw.module.css";

export function AskVisual({ className }: { className?: string }) {
  const { scenario, runKey } = useHiw();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const $ = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
        const typed = $("[data-ask-typed]");
        const placeholder = $("[data-ask-placeholder]");
        const bubble = $("[data-ask-bubble]");
        const status = $("[data-ask-status]");
        const hint = $("[data-ask-hint]");
        const send = $("[data-ask-send]");
        const ring = $("[data-ask-ring]");
        const clock = $("[data-ask-clock]");
        const text = scenario.prompt;

        // Measure the lift distance before anything moves (read, then write).
        const dy = typed.getBoundingClientRect().top - bubble.getBoundingClientRect().top;

        typed.textContent = "";
        clock.textContent = "0:00";
        // Reset every animated target explicitly. Reverting the previous run restores each
        // tween's own start value, and `typed` is faded out and then set back to 1 by two
        // tweens: the revert can leave it at opacity 0 / hidden, which hid every retyped brief.
        gsap.set(typed, { autoAlpha: 1, y: 0 });
        gsap.set([bubble, status], { autoAlpha: 0 });
        gsap.set(hint, { autoAlpha: 1 });
        gsap.set(placeholder, { autoAlpha: 1 });
        send.dataset.ready = "false";
        el.dataset.typing = "false";

        const typeDur = Math.min(3.2, text.length * 0.032);
        const t1 = 0.45 + typeDur;
        const proxy = { n: 0, s: 0 };
        const tl = gsap.timeline({ paused: true, defaults: { ease: EASE.out } });

        tl.to(placeholder, { autoAlpha: 0, duration: 0.2 }, 0.3)
          .call(() => void (el.dataset.typing = "true"), [], 0.45)
          .to(
            proxy,
            {
              n: text.length,
              duration: typeDur,
              ease: "none",
              onUpdate: () => {
                typed.textContent = text.slice(0, Math.round(proxy.n));
              },
            },
            0.45,
          )
          .call(() => {
            el.dataset.typing = "false";
            send.dataset.ready = "true";
          }, [], t1)
          .fromTo(
            ring,
            { scale: 1, opacity: 0.55 },
            { scale: 2.1, opacity: 0, duration: 0.75, ease: "power2.out", repeat: 1, repeatDelay: 0.05 },
            t1 + 0.25,
          )
          .to(send, { scale: 0.9, duration: 0.1, ease: "power2.in" }, t1 + 1.45)
          .to(send, { scale: 1, duration: 0.25 }, t1 + 1.55)
          .to(typed, { autoAlpha: 0, y: -6, duration: 0.25, ease: "power2.in" }, t1 + 1.55)
          .to(hint, { autoAlpha: 0, duration: 0.2 }, t1 + 1.55)
          .fromTo(bubble, { y: dy, autoAlpha: 0, scale: 0.985 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.75 }, t1 + 1.6)
          .call(() => {
            send.dataset.ready = "false";
            typed.textContent = "";
          }, [], t1 + 1.85)
          .set(typed, { autoAlpha: 1, y: 0 }, t1 + 1.86)
          .to(placeholder, { autoAlpha: 1, duration: 0.3 }, t1 + 1.9)
          .fromTo(status, { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45 }, t1 + 2.15)
          .to(
            proxy,
            {
              s: 4,
              duration: 4,
              ease: "none",
              onUpdate: () => {
                clock.textContent = `0:0${Math.floor(proxy.s)}`;
              },
            },
            t1 + 2.15,
          );

        const playback = playWhenVisible(el, tl);
        return () => playback.stop();
      });
    },
    { scope: root, dependencies: [scenario.id, runKey], revertOnUpdate: true },
  );

  return (
    <div ref={root} className={cn("relative rounded-card bg-surface p-2.5 sm:p-3", className)}>
      <p className="sr-only">
        Example brief: {scenario.prompt} The prompt is sent in Deep Research mode and the agent starts planning.
      </p>

      <div>
        {/* Transcript */}
        <div className="relative flex min-h-[112px] flex-col justify-end gap-2.5 px-2.5 pb-3 pt-2.5 sm:min-h-[104px]">
          <p aria-hidden="true" data-ask-hint className="invisible absolute left-2.5 top-2 text-[13px] text-ink/62 opacity-0">
            Ask about any niche, hook or format.
          </p>
          <div
            aria-hidden="true"
            data-ask-bubble
            className="ml-auto max-w-[88%] rounded-[16px] rounded-br-[6px] bg-ink px-4 py-3 text-[14px] leading-[1.45] text-paper sm:text-[14.5px]"
          >
            {scenario.prompt}
          </div>
          <div data-ask-status className="flex items-center gap-2 text-[12.5px] text-ink-2">
            <span aria-hidden="true" className={cn("size-3.5 rounded-full border-[1.5px] border-ink/15 border-t-pink", styles.spin)} />
            <span aria-hidden="true" className="whitespace-nowrap font-medium text-ink">
              Deep Search worker
            </span>
            <span
              aria-hidden="true"
              className="rounded-[6px] bg-pink-soft px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.04em] text-pink-ink"
            >
              Planning
            </span>
            <span aria-hidden="true" data-ask-clock className="font-mono text-[11px] tabular-nums text-ink/62">
              0:04
            </span>
            <a
              href="#hiw-step-2"
              className="group/next relative -mr-1 ml-auto hidden items-center gap-1 rounded-chip px-1.5 py-1 text-[12.5px] font-medium text-ink/62 transition-colors duration-200 after:absolute after:-inset-x-1 after:-inset-y-2.5 after:content-[''] hover:text-pink-ink sm:inline-flex lg:hidden min-[1440px]:inline-flex"
            >
              See the plan
              <ArrowDown className="size-3.5 transition-transform duration-200 ease-out group-hover/next:translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Composer */}
        <div aria-hidden="true" className="rounded-[18px] bg-paper shadow-float">
          <div className="relative min-h-[60px] px-4 pb-1.5 pt-3 text-[15px] leading-[1.5] text-ink">
            <span data-ask-placeholder className="pointer-events-none absolute left-4 top-3 text-ink/62">
              Send a message
            </span>
            <span data-ask-typed className="relative inline" />
            <span className={cn("ml-px inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-pink", styles.caret)} />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
            <span className="grid size-8 place-items-center rounded-[10px] text-ink/60">
              <Plus className="size-4" strokeWidth={1.75} />
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-accent/10 px-2.5 text-[12.5px] font-medium text-accent">
              <Telescope className="size-3.5" strokeWidth={1.75} />
              Deep Research
            </span>
            <span className="hidden h-8 items-center gap-2 rounded-[10px] px-2 text-ink/60 sm:inline-flex">
              <PlatformGlyph platform="tiktok" />
              <PlatformGlyph platform="instagram" />
              <PlatformGlyph platform="youtube" />
            </span>
            <span className="relative ml-auto">
              <span
                data-ask-ring
                className="pointer-events-none absolute inset-0 rounded-[10px] border border-pink opacity-0"
              />
              <span
                data-ask-send
                data-ready="false"
                className={cn("relative grid size-8 place-items-center rounded-[10px]", styles.send)}
              >
                <ArrowUp className="size-4" strokeWidth={2} />
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
