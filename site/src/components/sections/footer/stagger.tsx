"use client";

/**
 * Stagger — fades and lifts its `[data-stagger]` descendants in once, when it
 * scrolls into view (0.7s, 0.07s apart). Server-rendered visible; reduced
 * motion leaves everything in its final state.
 *
 *   <Stagger className="grid ..."><div data-stagger>…</div><div data-stagger>…</div></Stagger>
 */
import { useRef, type ReactNode } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { onceInView } from "@/lib/media";
import { MOTION_OK } from "@/lib/motion";

/** `start`: how far up from the viewport bottom the block must rise before it plays, in % (8 ≈ "top 92%"). */
export function Stagger({ children, className, start = 8 }: { children: ReactNode; className?: string; start?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tween = gsap.from(gsap.utils.toArray<HTMLElement>("[data-stagger]", root), {
          y: 18,
          opacity: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: EASE.out,
          paused: true,
        });
        // IntersectionObserver, not ScrollTrigger: a stale trigger start (the footer sits
        // below the pinned scene) must never leave the links hidden.
        return onceInView(root, () => tween.play(), { rootMargin: `0px 0px -${start}% 0px` });
      });
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
