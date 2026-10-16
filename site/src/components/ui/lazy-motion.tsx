"use client";

/**
 * Lazy motion features — `motion` (Framer Motion) without its animation engine in a page's
 * first-load JavaScript.
 *
 * Components render `m.*` (not `motion.*`) inside <MotionFeatures> or <LazyMotionConfig>. The
 * `m` components server-render and hydrate exactly like `motion` ones; the features that make
 * them animate (domMax: animations, exit, layout and shared `layoutId` transitions) arrive in
 * one chunk right after hydration (a plain `import()`, which Next does not preload). Until it
 * lands, a change shows its end state at once. `strict` makes a stray `motion.*` throw in dev.
 *
 *   <LazyMotionConfig>        // = <MotionFeatures> + <MotionConfig reducedMotion="user">
 *     <m.span layoutId="thumb" transition={{ type: "spring", ... }} />
 *   </LazyMotionConfig>
 */
import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

export function MotionFeatures({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}

/** <MotionFeatures> with `reducedMotion="user"` (transforms snap, fades still run). */
export function LazyMotionConfig({ children }: { children: ReactNode }) {
  return (
    <MotionFeatures>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </MotionFeatures>
  );
}
