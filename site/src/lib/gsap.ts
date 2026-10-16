/**
 * Single entry point for GSAP. Always import GSAP and its plugins from here,
 * never from "gsap" directly, so plugins are registered exactly once.
 *
 *   import { gsap, ScrollTrigger, SplitText, useGSAP, EASE } from "@/lib/gsap";
 *   import { Flip } from "@/lib/gsap-flip";
 *
 * Registration only runs in the browser (the module is safe to import from
 * client components that are server-rendered). All GSAP plugins are free since
 * 3.13. Registered here: ScrollTrigger, SplitText, DrawSVG and CustomEase. Every page
 * loads this module first, so a plugin only a few components use is registered where
 * it is used: Flip from "@/lib/gsap-flip", and InertiaPlugin (momentum for drag/flick
 * scrollers) in its one user, components/pages/viral-now/h-scroller.tsx. MorphSVG is
 * deliberately not bundled (nothing uses it); a section that needs it, or Observer /
 * ScrollToPlugin, registers it in its own file (registering twice does nothing).
 *
 * Named eases (PLAN §2): "ch.out", "ch.inOut", "ch.outFast". Use them as
 * `ease: EASE.out` or `ease: "ch.out"`.
 */
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/** Ease names registered with CustomEase. */
export const EASE = {
  out: "ch.out",
  inOut: "ch.inOut",
  outFast: "ch.outFast",
} as const;

/** The same curves as CSS (`var(--ease-out)` etc. in globals.css). */
export const EASE_CSS = {
  out: "cubic-bezier(.2,.715,.205,.99)",
  inOut: "cubic-bezier(.835,.12,.225,.77)",
  outFast: "cubic-bezier(0,0,0,1)",
} as const;

let registered = false;

/** Idempotent; called on import in the browser. Safe to call again. */
export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  registered = true;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);
  CustomEase.create(EASE.out, "0.2,0.715,0.205,0.99");
  CustomEase.create(EASE.inOut, "0.835,0.12,0.225,0.77");
  CustomEase.create(EASE.outFast, "0,0,0,1");
  gsap.defaults({ ease: EASE.out, duration: 0.6 });
}

registerGsap();

export { gsap, CustomEase, DrawSVGPlugin, ScrollTrigger, SplitText, useGSAP };
