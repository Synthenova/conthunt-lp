"use client";

/**
 * CountUp: a number that counts up once when it scrolls into view, then eases to
 * a new value whenever `value` changes (for example when the chart metric flips).
 *
 *   <CountUp value={1_100_000} format={compact} delay={0.2} />
 *
 * - The server renders the final text, so the number is correct without JS.
 * - `format` must be a stable (module-level) function.
 * - GSAP writes into the existing text node, so React can keep updating it.
 * - By default the first count starts when the element scrolls into view. Pass `play`
 *   (a boolean) to control it instead: the count starts when `play` becomes true. Use
 *   this when a parent already owns the scroll trigger, so the numbers and the rest of
 *   the animation can never get out of step.
 * - Reduced motion: final value, no tween.
 */
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_OK, MOTION_REDUCED } from "@/lib/motion";

export interface CountUpProps {
  value: number;
  format: (n: number) => string;
  /** Seconds before the first count starts, after the element enters view. */
  delay?: number;
  duration?: number;
  /** ScrollTrigger start for the first count (ignored when `play` is set). */
  start?: string;
  /** Controlled start: the first count runs once this turns true. */
  play?: boolean;
  className?: string;
}

export function CountUp({ value, format, delay = 0, duration = 1.4, start = "top 90%", play, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  /** True once the first count has been triggered. */
  const revealed = useRef(false);
  /** The number currently on screen. */
  const shown = useRef(value);

  useGSAP(
    () => {
      const el = ref.current;
      const node = el?.firstChild;
      if (!el || !node || node.nodeType !== Node.TEXT_NODE) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const o = { v: revealed.current ? shown.current : 0 };
        const write = () => {
          shown.current = o.v;
          node.nodeValue = format(o.v);
        };
        const run = (first: boolean) =>
          gsap.to(o, {
            v: value,
            duration: first ? duration : 0.9,
            delay: first ? delay : 0,
            ease: "power3.out",
            onUpdate: write,
            onComplete: () => {
              shown.current = value;
              node.nodeValue = format(value);
            },
          });

        write();
        if (revealed.current) {
          run(false);
        } else if (play !== undefined) {
          if (play) {
            revealed.current = true;
            run(true);
          }
        } else {
          ScrollTrigger.create({
            trigger: el,
            start,
            once: true,
            onEnter: () => {
              revealed.current = true;
              run(true);
            },
          });
        }
      });

      mm.add(MOTION_REDUCED, () => {
        shown.current = value;
        node.nodeValue = format(value);
      });
    },
    { scope: ref, dependencies: [value, format, delay, duration, start, play], revertOnUpdate: true },
  );

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
