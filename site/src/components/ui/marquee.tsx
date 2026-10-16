"use client";

/**
 * Marquee — infinite horizontal loop (CSS transform animation, compositor-only).
 *
 * The content is rendered twice; the track slides by exactly one copy, so the
 * loop is seamless. Speed is in px/second and stays constant whatever the
 * content width. Pauses while offscreen (IntersectionObserver), while the tab is
 * hidden and (optionally) on hover. Under reduced motion it is static and
 * horizontally scrollable instead.
 *
 *   <Marquee speed={40} gap={48} label="Customer testimonials">
 *     {quotes.map((q) => <QuoteCard key={q.id} {...q} />)}
 *   </Marquee>
 *   <Marquee direction="right" fade={false}>{logos}</Marquee>
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { observeInView, onDocumentVisibility } from "@/lib/media";
import { usePrefersReducedMotion } from "@/lib/motion";

export interface MarqueeProps {
  children: ReactNode;
  /** Pixels per second. Default 40. */
  speed?: number;
  direction?: "left" | "right";
  /** Space between items and between the two copies, px. Default 32. */
  gap?: number;
  pauseOnHover?: boolean;
  /** Fade the left/right edges. Default true. */
  fade?: boolean;
  /** Accessible name for the region. */
  label?: string;
  className?: string;
  /** Classes for each copy's flex row (alignment etc.). */
  rowClassName?: string;
}

export function Marquee({
  children,
  speed = 40,
  direction = "left",
  gap = 32,
  pauseOnHover = true,
  fade = true,
  label,
  className,
  rowClassName,
}: MarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const dupRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [duration, setDuration] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  // Duration = one copy's width / speed, re-measured when content resizes.
  useEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    const measure = () => setDuration(copy.offsetWidth / Math.max(speed, 1));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(copy);
    return () => ro.disconnect();
  }, [speed]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stopObserving = observeInView(root, (entry) => setOnScreen(entry.isIntersecting), { rootMargin: "100px 0px" });
    const stopVisibility = onDocumentVisibility(setTabHidden);
    return () => {
      stopObserving();
      stopVisibility();
    };
  }, []);

  // The duplicate copy is aria-hidden but must stay hit-testable (hover states),
  // so instead of `inert` we only pull its focusable descendants out of the tab order.
  useEffect(() => {
    const dup = dupRef.current;
    if (!dup) return;
    dup.querySelectorAll<HTMLElement>("a, button, input, select, textarea, [tabindex]").forEach((el) => {
      el.tabIndex = -1;
    });
  });

  const running = !reduced && onScreen && !tabHidden && duration > 0;
  // Animation lives in globals.css (.ch-marquee-track); inline we only set vars,
  // so the hover rule can still override the play state.
  const trackStyle = reduced
    ? undefined
    : ({
        "--marquee-duration": `${duration}s`,
        "--marquee-direction": direction === "right" ? "reverse" : "normal",
        "--marquee-state": running ? "running" : "paused",
      } as CSSProperties);
  const copyStyle: CSSProperties = { gap, paddingRight: gap };

  return (
    <div
      ref={rootRef}
      role={label ? "region" : undefined}
      aria-label={label}
      className={cn(
        "ch-marquee relative",
        reduced ? "overflow-x-auto" : "overflow-hidden",
        fade && "edge-fade-x",
        className,
      )}
    >
      <div
        className={cn("flex w-max", !reduced && "ch-marquee-track will-change-transform")}
        data-pause-on-hover={pauseOnHover ? "" : undefined}
        style={trackStyle}
      >
        <div ref={copyRef} className={cn("flex shrink-0 items-center", rowClassName)} style={copyStyle}>
          {children}
        </div>
        {!reduced && (
          <div className={cn("flex shrink-0 items-center", rowClassName)} style={copyStyle} aria-hidden="true" ref={dupRef}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
