"use client";

/**
 * The tracking board: a light product window with one column per tracked account
 * (identity, followers, selected videos). The growth charts are a separate full-width
 * panel below it (growth-chart.tsx).
 *
 * Static by design (not a simulation). On view the columns cascade in and the numbers
 * count up once; after that only hover reveals more.
 */
import { PanelLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";
import { AccountColumn } from "./account-column";
import { ACCOUNTS, SNAPSHOT_TIME_LABEL, TOTAL_VIDEOS } from "./data";
import { observedLabel } from "./format";
import { REGION_CLASS, regionState, useTrackingHighlight } from "./highlight";

export function TrackingBoard() {
  const { region } = useTrackingHighlight();
  const rootRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLUListElement>(null);
  /** True once the columns have scrolled into view; starts the follower count-ups. */
  const [revealed, setRevealed] = useState(false);
  /** The columns scroll sideways on narrow screens; only then are they a keyboard tab stop. */
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const el = columnsRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setScrollable(el.scrollWidth > el.clientWidth + 1));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const columns = columnsRef.current;
      if (!columns) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const trigger = { trigger: columns, start: "top 82%", once: true };
        ScrollTrigger.create({ ...trigger, onEnter: () => setRevealed(true) });
        gsap.from(columns.querySelectorAll(".tk-col"), {
          y: 22,
          opacity: 0,
          duration: 0.85,
          stagger: 0.12,
          clearProps: "transform,opacity",
          scrollTrigger: trigger,
        });
        gsap.from(columns.querySelectorAll(".tk-card"), {
          y: 16,
          opacity: 0,
          duration: 0.7,
          delay: 0.3,
          stagger: 0.07,
          clearProps: "transform,opacity",
          scrollTrigger: trigger,
        });
        gsap.from(columns.querySelectorAll(".tk-bar"), {
          scaleY: 0,
          transformOrigin: "50% 100%",
          duration: 0.6,
          delay: 0.6,
          stagger: 0.012,
          clearProps: "transform",
          scrollTrigger: trigger,
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={`Tracking board with ${ACCOUNTS.length} public accounts and ${TOTAL_VIDEOS} selected videos. History is illustrative.`}
      className="overflow-hidden rounded-card border border-hairline bg-paper shadow-[0_1px_2px_rgba(0,0,0,0.04),0_3px_8px_-2px_rgba(0,0,0,0.04)]"
    >
      <header className="flex h-[52px] items-center justify-between gap-3 border-b border-hairline px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <PanelLeft aria-hidden="true" className="size-4 shrink-0 text-ink/45" strokeWidth={1.75} />
          <h3 className="text-[14.5px] font-semibold tracking-[-0.01em] text-ink">Tracking</h3>
          <span aria-hidden="true" className="hidden h-3.5 w-px bg-hairline sm:block" />
          <p className="hidden font-mono text-[11px] tabular-nums text-ink/60 sm:block">
            {ACCOUNTS.length} accounts <span aria-hidden="true">·</span> {TOTAL_VIDEOS} videos
          </p>
        </div>
        <div
          data-region="snapshots"
          data-hl={regionState(region, "snapshots")}
          className={cn(
            REGION_CLASS,
            "inline-flex h-7 shrink-0 items-center gap-2 rounded-chip border border-hairline px-2.5 font-mono text-[11px] text-ink-2",
          )}
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-green" />
          <span className="sm:hidden">
            Daily <span aria-hidden="true">·</span> {SNAPSHOT_TIME_LABEL}
          </span>
          <span className="hidden sm:inline">
            Updates daily <span aria-hidden="true">·</span> {SNAPSHOT_TIME_LABEL}
          </span>
        </div>
      </header>

      <ul
        ref={columnsRef}
        tabIndex={scrollable ? 0 : undefined}
        data-lenis-prevent-wheel={scrollable ? "" : undefined}
        aria-label="Tracked accounts, scroll sideways"
        className="grid auto-cols-[minmax(228px,1fr)] grid-flow-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent snap-x snap-mandatory divide-x divide-hairline overflow-x-auto overscroll-x-contain bg-surface/70 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {ACCOUNTS.map((account, i) => (
          <AccountColumn key={account.id} account={account} index={i} play={revealed} />
        ))}
      </ul>

      <footer className="border-t border-hairline px-4 py-2.5">
        <p className="text-pretty text-[12px] leading-snug text-ink/60">
          Handles, avatars, posters and today&apos;s counts: public TikTok data from {observedLabel}. 7-day changes and
          24h gains are illustrative.
        </p>
      </footer>
    </div>
  );
}
