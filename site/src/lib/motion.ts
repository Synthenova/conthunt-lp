/**
 * Motion helpers shared by every animated component.
 *
 * - `usePrefersReducedMotion()` — live boolean for `prefers-reduced-motion: reduce`.
 *   Returns `false` during SSR and the first client render, then the real value
 *   (via useSyncExternalStore, so no hydration mismatch and no effect flicker).
 * - `prefersReducedMotion()` — one-off synchronous read for imperative code
 *   (inside useGSAP callbacks, event handlers).
 * - `useIsomorphicLayoutEffect` — useLayoutEffect in the browser, useEffect on
 *   the server (avoids the SSR warning). Prefer `useGSAP` for GSAP work.
 *
 * GSAP pattern for reduced motion (preferred, auto-reverts on change):
 *   useGSAP(() => {
 *     const mm = gsap.matchMedia();
 *     mm.add(MOTION_OK, () => { ...animations... });
 *     mm.add(MOTION_REDUCED, () => { gsap.set(targets, finalState); });
 *   }, { scope: ref });
 */
import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** gsap.matchMedia() condition strings. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED = REDUCED_MOTION_QUERY;

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerSnapshot = () => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
