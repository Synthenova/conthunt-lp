"use client";

/**
 * SmoothScroll — global Lenis instance driven by gsap.ticker and synced to ScrollTrigger.
 *
 * Mounted once in the root layout. Under `prefers-reduced-motion: reduce` Lenis is
 * not created (native scroll), and it is created/destroyed live if the setting changes.
 *
 *   const lenis = useLenis();          // Lenis | null (null under reduced motion / SSR)
 *   lenis?.stop(); lenis?.start();     // e.g. while a modal sheet is open
 *   lenis?.scrollTo("#pricing", { offset: -96 });
 *
 * Nested scroll areas (sheets, horizontal rows, code blocks) need `data-lenis-prevent`.
 * Pinning with ScrollTrigger works as-is: the scroller is the window, and Lenis calls
 * ScrollTrigger.update on every scroll. Do not create a second Lenis.
 */
import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

const LenisContext = createContext<Lenis | null>(null);

export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    let instance: Lenis | null = null;
    const tick = (time: number) => instance?.raf(time * 1000);

    const start = () => {
      if (instance) return;
      instance = new Lenis({ lerp: 0.1, autoRaf: false, anchors: { offset: -96 }, stopInertiaOnNavigate: true });
      instance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);
    };

    const stop = () => {
      if (!instance) return;
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      instance = null;
      setLenis(null);
    };

    const apply = () => (mql.matches ? stop() : start());
    apply();
    mql.addEventListener("change", apply);

    // Webfonts change text metrics; re-measure triggers once they settle.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      mql.removeEventListener("change", apply);
      stop();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
