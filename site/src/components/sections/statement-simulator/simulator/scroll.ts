/**
 * Scroll ownership for the simulator's vertical scroll areas (board, transcript, drawer body).
 *
 * The page owns the wheel by default, so scrolling over the frame keeps scrolling the page.
 * After a click or keyboard focus inside the frame ("engaged"), these areas take the wheel:
 * `data-lenis-prevent-wheel` tells Lenis to skip the event so the area scrolls natively.
 * At either end of an area, ./index.tsx removes the attribute before Lenis sees the event and
 * releases the engagement, so the same gesture continues the page (no scroll trap).
 *
 * Touch is never intercepted (Lenis leaves touch native), and `overscroll-behavior: auto`
 * overrides lenis.css's `contain` so a swipe at an edge chains to the page as usual.
 */
import type { CSSProperties } from "react";

/** Marks a vertical scroll area for the edge hand-off. */
export const SCROLL_AREA_ATTR = "data-sim-scroll";

const CHAIN: CSSProperties = { overscrollBehavior: "auto" };

export function scrollAreaProps(ownsWheel: boolean): {
  [SCROLL_AREA_ATTR]: "";
  "data-lenis-prevent-wheel"?: "";
  style: CSSProperties;
} {
  return ownsWheel
    ? { [SCROLL_AREA_ATTR]: "", "data-lenis-prevent-wheel": "", style: CHAIN }
    : { [SCROLL_AREA_ATTR]: "", style: CHAIN };
}

/** Overflow class for a scroll area: hidden until the frame owns the wheel. */
export const scrollAreaOverflow = (ownsWheel: boolean) => (ownsWheel ? "overflow-y-auto" : "overflow-y-hidden");
