"use client";

/**
 * Shared hover state for the tracking section.
 *
 * - `region`: the part of the board to light up. It is set by the feature list
 *   ("Selected videos" lights up the video cards, "Daily snapshots" the tick row, and
 *   so on) and is only ever non-null while that part is actually on screen, so the board
 *   never fades out for something the visitor cannot see.
 * - `hovered` and `placement`: what the pointer or focus is on and where it sits
 *   relative to the viewport. When it is off screen the feature list says so and offers
 *   a jump instead (see `scrollToRegion`).
 * - `focusId`: set by an account column or a chart legend item. The chart emphasises
 *   that account's line and mutes the others.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLenis } from "@/components/layout/smooth-scroll";
import { prefersReducedMotion } from "@/lib/motion";

export type Region = "accounts" | "videos" | "snapshots" | "growth";
export type Placement = "in" | "above" | "below";

/** Name of each region as the board shows it, for "<name> is below" hints. */
export const REGION_NAME: Record<Region, string> = {
  accounts: "Account columns",
  videos: "Video cards",
  snapshots: "Snapshot row",
  growth: "Growth chart",
};

interface HighlightContextValue {
  /** Region to light up. Null when nothing is hovered or the hovered region is off screen. */
  region: Region | null;
  /** Region the pointer or keyboard focus is on, on screen or not. */
  hovered: Region | null;
  /** Where `hovered` sits relative to the viewport. Null when nothing is hovered. */
  placement: Placement | null;
  setRegion: (region: Region | null) => void;
  /** Scroll the region into view (a no-op when it is already fully visible). */
  scrollToRegion: (region: Region) => void;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
}

const noop = () => {};
const HighlightContext = createContext<HighlightContextValue>({
  region: null,
  hovered: null,
  placement: null,
  setRegion: noop,
  scrollToRegion: noop,
  focusId: null,
  setFocusId: noop,
});

/** Elements that make up a region on the board. */
const regionElements = (region: Region) => Array.from(document.querySelectorAll<HTMLElement>(`[data-region="${region}"]`));

/**
 * "in" when at least part of the region is on screen (about 72px of any one element, or
 * all of a shorter one); otherwise whether it sits above or below the viewport.
 */
function measurePlacement(region: Region): Placement {
  const vh = window.innerHeight;
  let below = false;
  for (const el of regionElements(region)) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    if (visible >= Math.min(rect.height, 72)) return "in";
    if (rect.top >= vh) below = true;
  }
  return below ? "below" : "above";
}

interface HoverState {
  hovered: Region | null;
  placement: Placement | null;
}

export function TrackingHighlightProvider({ children }: { children: ReactNode }) {
  const lenis = useLenis();
  const [{ hovered, placement }, setHover] = useState<HoverState>({ hovered: null, placement: null });
  const [focusId, setFocusId] = useState<string | null>(null);

  const setRegion = useCallback((next: Region | null) => {
    setHover(next ? { hovered: next, placement: measurePlacement(next) } : { hovered: null, placement: null });
  }, []);

  // While a region is hovered the page can still scroll (wheel over the list), so keep the
  // placement current. State only changes when the answer does.
  useEffect(() => {
    if (!hovered) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = measurePlacement(hovered);
      setHover((s) => (s.hovered === hovered && s.placement !== next ? { hovered, placement: next } : s));
    };
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [hovered]);

  const scrollToRegion = useCallback(
    (target: Region) => {
      const els = regionElements(target);
      // The snapshot row is the last piece of the board; the others read best from their first.
      const el = target === "snapshots" ? els[els.length - 1] : els[0];
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.top >= 96 && rect.bottom <= vh - 24) return;
      // Centre what fits, and park taller things below the navbar.
      const offset = rect.height < vh * 0.6 ? (vh - rect.height) / 2 : 112;
      const top = Math.max(0, rect.top + window.scrollY - offset);
      if (lenis) lenis.scrollTo(top, { duration: 1.2 });
      else window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    },
    [lenis],
  );

  const region = placement === "in" ? hovered : null;
  const value = useMemo(
    () => ({ region, hovered, placement, setRegion, scrollToRegion, focusId, setFocusId }),
    [region, hovered, placement, setRegion, scrollToRegion, focusId],
  );
  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>;
}

export const useTrackingHighlight = () => useContext(HighlightContext);

/** "on" for the active region, "dim" for the others, undefined when nothing is active. */
export function regionState(active: Region | null, region: Region): "on" | "dim" | undefined {
  if (!active) return undefined;
  return active === region ? "on" : "dim";
}

/**
 * Classes for a region element. Use on an element GSAP does not animate, so the CSS
 * transition never fights an inline style.
 */
export const REGION_CLASS =
  "transition-[opacity,box-shadow,background-color] duration-300 ease-out " +
  "data-[hl=dim]:opacity-35 " +
  "data-[hl=on]:bg-[color-mix(in_srgb,var(--accent)_5%,var(--paper))] data-[hl=on]:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_55%,transparent)]";
