"use client";

/**
 * BannerScroll: wraps the banner plate in a layer that drifts down slowly as the
 * page scrolls (scrubbed `y`, transform only). The wrapper is oversized by 12% so
 * the drift never exposes an edge. Reduced motion: static.
 */
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

export function BannerScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to(el, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top top", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="absolute inset-x-0 -top-[8%] -bottom-[4%] will-change-transform" aria-hidden="true">
      {children}
    </div>
  );
}
