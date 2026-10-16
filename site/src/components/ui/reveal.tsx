"use client";

/**
 * Reveal — SplitText line reveal that fires once (PLAN §2 Motion):
 * lines rise from yPercent 60 with a fade, 0.6s, 0.1s stagger, when the element's
 * top crosses 90% of the viewport (≈10% into view).
 *
 *   <Reveal as="h2" className="display-l">Watch <Emphasis>less</Emphasis>, know more</Reveal>
 *   <Reveal as="p" className="body-l text-muted" delay={0.15}>Supporting line…</Reveal>
 *   <Reveal as="h1" className="display-xl" immediate initiallyHidden>Hero headline</Reveal>
 *
 * - Children must be static text/inline markup (SplitText rewrites the DOM;
 *   it is restored when the reveal completes or the component unmounts).
 * - `immediate` plays on mount instead of on scroll (above-the-fold copy).
 * - `initiallyHidden` server-renders `visibility:hidden` to avoid a flash before
 *   hydration. Only use it above the fold; it relies on JS to show the text.
 * - Reduced motion: no split, text is shown in its final state.
 */
import { useRef, type CSSProperties, type ElementType, type HTMLAttributes } from "react";
import { EASE, gsap, SplitText, useGSAP } from "@/lib/gsap";
import { MOTION_OK, MOTION_REDUCED } from "@/lib/motion";

export type RevealTag = "div" | "p" | "span" | "h1" | "h2" | "h3" | "h4" | "blockquote" | "li";

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: RevealTag;
  /** Split granularity. Default "lines". */
  type?: "lines" | "words";
  /** Seconds before the reveal starts. Default 0. */
  delay?: number;
  /** Seconds between lines/words. Default 0.1. */
  stagger?: number;
  /** Seconds per line/word. Default 0.6. */
  duration?: number;
  /** ScrollTrigger start. Default "top 90%". */
  start?: string;
  /** Play on mount rather than on scroll. */
  immediate?: boolean;
  /** SSR with visibility:hidden until the split is ready (above the fold only). */
  initiallyHidden?: boolean;
}

export function Reveal({
  as = "div",
  type = "lines",
  delay = 0,
  stagger = 0.1,
  duration = 0.6,
  start = "top 90%",
  immediate = false,
  initiallyHidden = false,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const split = SplitText.create(el, {
          type: type === "lines" ? "lines" : "words,lines",
          mask: type,
          linesClass: "ch-line",
          wordsClass: "ch-word",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { visibility: "visible" });
            const targets = type === "lines" ? self.lines : self.words;
            return gsap.from(targets, {
              yPercent: 60,
              opacity: 0,
              duration,
              stagger,
              delay,
              ease: EASE.out,
              // Restore the original DOM once revealed: no lingering masks
              // clipping italic descenders, no re-splitting on resize.
              onComplete: () => self.revert(),
              scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
            });
          },
        });
        return () => split.revert();
      });

      mm.add(MOTION_REDUCED, () => {
        gsap.set(el, { visibility: "visible" });
      });
    },
    { scope: ref, dependencies: [type, delay, stagger, duration, start, immediate] },
  );

  const Tag = as as ElementType;
  const mergedStyle: CSSProperties | undefined = initiallyHidden ? { visibility: "hidden", ...style } : style;
  return (
    <Tag ref={ref} className={className} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  );
}
