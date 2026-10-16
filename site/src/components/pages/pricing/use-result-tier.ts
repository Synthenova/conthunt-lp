"use client";

/**
 * useResultTier: how much of the calculator's result column fits on screen.
 *
 *   "full"    sticky column on a tall desktop viewport (880px or taller): everything shows.
 *   "compact" sticky column on a short desktop viewport (700 to 879px): the work calendar and the
 *             trial one-liner are dropped so hours, plan, price, toggle, CTA and usage still fit.
 *   "flow"    below lg, or a desktop viewport under 700px tall: the column is not sticky. It scrolls
 *             with the page and a bottom dock keeps the headline numbers in view.
 *
 * The thresholds mirror the media queries on `.result` in calculator.module.css. The server and the
 * first client render both say "flow" (everything visible), then the real value arrives.
 */
import { useSyncExternalStore } from "react";

export type ResultTier = "full" | "compact" | "flow";

/** Keep in sync with `.result` in calculator.module.css. */
export const STICKY_TOP = 84;
/** Breathing room under the sticky column. */
export const STICKY_GAP = 8;
/**
 * A column taller than the room under the navbar rides up under it, so its bottom edge (price, toggle, CTA)
 * stays on screen. It may slide this far from the top of the viewport; beyond that it stops being sticky.
 */
export const STICKY_MIN_TOP = 48;
export const STICKY_QUERY = "(min-width: 1024px) and (min-height: 700px)";
const COMPACT_QUERY = "(max-height: 879px)";

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(STICKY_QUERY), window.matchMedia(COMPACT_QUERY)];
  for (const q of queries) q.addEventListener("change", onChange);
  return () => {
    for (const q of queries) q.removeEventListener("change", onChange);
  };
}

function getSnapshot(): ResultTier {
  if (!window.matchMedia(STICKY_QUERY).matches) return "flow";
  return window.matchMedia(COMPACT_QUERY).matches ? "compact" : "full";
}

export function useResultTier(): ResultTier {
  return useSyncExternalStore(subscribe, getSnapshot, () => "flow" as const);
}
