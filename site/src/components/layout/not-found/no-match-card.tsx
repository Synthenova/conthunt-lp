"use client";

/**
 * NoMatchCard — the 404 page's one visual: a score card in the hero's language (a
 * score chip top right, a semi-transparent graph below), showing what a missing page
 * scores. Decorative, so it is hidden from assistive tech; the H1 carries the message.
 *
 *   <NoMatchCard className="hidden md:block" />
 *
 * It shows the requested path on the card, truncated. The path is read after mount: on the
 * server usePathname() reports the internal "/_not-found" route while the client reports the
 * real URL, so rendering it during hydration mismatches (React error #418). The server and the
 * hydration render share a stable "/…" placeholder (useSyncExternalStore's server snapshot);
 * React then swaps in the real path from window.location.
 * The line draws in once on mount (DrawSVG). Reduced motion: shown in its final state.
 * The graph is the data-palette "decline" red: a short run, then a flat line at zero.
 */
import { useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

/** Rendered on the server and for the first client paint, so hydration always matches. */
const PATH_PLACEHOLDER = "/…";

// The path of a rendered 404 never changes while it is mounted, so there is nothing to subscribe to.
const subscribeNever = () => () => {};
const readPath = () => window.location.pathname || "/";
const readPlaceholder = () => PATH_PLACEHOLDER;

/** One rise, a drop, then flat at the floor. Drawn on a 240 x 120 board. */
const LINE = "M0 54 C22 50 34 30 58 34 C84 38 92 74 118 98 C128 106 138 106 150 106 L240 106";
const AREA = `${LINE} L240 120 L0 120 Z`;

export function NoMatchCard({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = useSyncExternalStore(subscribeNever, readPath, readPlaceholder);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ delay: 0.35 });
        tl.from("[data-line]", { drawSVG: "0%", duration: 1.3, ease: EASE.out }, 0)
          .from("[data-area]", { opacity: 0, duration: 0.9, ease: EASE.out }, 0.5)
          .from("[data-end]", { scale: 0, transformOrigin: "50% 50%", duration: 0.4, ease: EASE.out }, 1.1);
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={cn("relative w-full max-w-[19rem] select-none rounded-card bg-paper p-5 shadow-float", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow inline-flex items-center gap-2 text-ink-2">
          <span className="size-1.5 rounded-full bg-decline" />
          No match
        </span>
        <span className="rounded-chip bg-decline/10 px-2 py-1 font-mono text-[12px] font-medium leading-none text-decline-ink tabular-nums">
          00
        </span>
      </div>

      <svg viewBox="0 0 240 120" className="mt-8 block h-auto w-full overflow-visible" fill="none">
        <defs>
          <linearGradient id="nf-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--decline)", stopOpacity: 0.2 }} />
            <stop offset="1" style={{ stopColor: "var(--decline)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <g className="stroke-hairline" strokeWidth="1">
          <path d="M0 30.5H240" />
          <path d="M0 68.5H240" />
          <path d="M0 106.5H240" strokeDasharray="3 4" />
        </g>
        <path data-area d={AREA} fill="url(#nf-area)" />
        <path data-line d={LINE} className="stroke-decline" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle data-end cx="238" cy="106" r="4" className="fill-paper stroke-decline" strokeWidth="2" />
      </svg>

      <div className="mt-8 border-t border-hairline pt-4">
        <p className="eyebrow truncate text-ink-2" title={pathname}>
          {pathname}
        </p>
        <p className="eyebrow mt-1.5">0 videos · 0 platforms</p>
      </div>
    </div>
  );
}
