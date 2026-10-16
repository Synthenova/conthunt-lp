"use client";

/**
 * Ruled list of what tracking saves. It is the left column beside the board from lg; below
 * that it stacks above the board (one column on phones, two from md). Hairline rules between
 * items, no bullet marks.
 *
 * With a mouse (or keyboard focus on a cell's jump button), an item lights up the matching
 * part of the board below (accounts, videos, snapshots, growth), so the list doubles as
 * a legend.
 *
 * The board only lights up a part that is on screen. When the part is off screen (the
 * charts sit below the list at laptop heights) nothing fades; the arrow turns
 * down, the hint above the list names where it is, and a click scrolls it into view.
 * Touch gets the plain list: the highlight is an extra, never the only way to read anything.
 *
 * Copy is grounded in the app (backend/alembic/versions/0049_tracking.py, the
 * TrackingView UI and plan_wallets.py): public TikTok / Instagram / YouTube links,
 * followers and totals for accounts, per-video views/likes/comments/shares/saves,
 * daily snapshots at a user-chosen time, 7/30/90-day history, tracking credits on
 * Creator (1,500), Pro (5,000) and Research (12,000).
 */
import { ArrowDown, ArrowDownRight, ArrowRight } from "lucide-react";
import type { PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { REGION_NAME, useTrackingHighlight, type Region } from "./highlight";

interface Feature {
  title: string;
  body: string;
  region: Region | null;
}

const FEATURES: Feature[] = [
  {
    title: "Public accounts.",
    body: "Follow any public TikTok, Instagram or YouTube profile. Followers and totals, saved daily.",
    region: "accounts",
  },
  {
    title: "Selected videos.",
    body: "Pick the posts worth watching. Views, likes, comments, shares and saves.",
    region: "videos",
  },
  {
    title: "Daily snapshots.",
    body: "One reading a day, at the time you choose, saved for you to revisit.",
    region: "snapshots",
  },
  {
    title: "Growth curves.",
    body: "A 7-day change on every account, with 7, 30 and 90-day history.",
    region: "growth",
  },
  {
    title: "Competitor campaigns.",
    body: "Line a rival's launch week up against its daily curve.",
    region: "growth",
  },
  {
    title: "Tracking credits.",
    body: "Included on every plan: 1,500 on Creator, 5,000 on Pro, 12,000 on Research.",
    region: null,
  },
];

export function FeatureList({ className }: { className?: string }) {
  const { setRegion, hovered, placement, scrollToRegion } = useTrackingHighlight();
  const hoverOnly = (region: Region | null) => (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    setRegion(region);
  };
  /** The hovered part of the board is off screen: say where it is. */
  const away = hovered && placement && placement !== "in" ? { region: hovered, placement } : null;

  return (
    <div className={cn("lg:flex lg:flex-col", className)}>
      <div className="border-b border-hairline pb-2.5">
        <h3 className="text-[15px] font-medium tracking-[-0.01em] text-ink">What gets tracked</h3>
        {/* A fixed-height line, so the hint swapping to "below · click to jump" never moves the list. */}
        <p
          aria-hidden="true"
          className={cn(
            "mt-1 hidden h-4 whitespace-nowrap font-mono text-[11px] uppercase leading-4 tracking-[0.02em] transition-colors duration-200 ease-out md:block pointer-coarse:hidden",
            away ? "text-accent" : "text-ink/60",
          )}
        >
          {away
            ? `${REGION_NAME[away.region]} ${away.placement === "below" ? "below" : "above"} · click to jump`
            : "Hover an item to find it on the board"}
        </p>
      </div>
      {/* From lg the list shares its row with the board: the rows split the column height evenly, so the
          list ends on the board's bottom edge instead of leaving a blank band under it. */}
      <ul className="grid md:grid-cols-2 md:gap-x-8 lg:flex lg:flex-1 lg:flex-col">
        {FEATURES.map((f) => {
          const region = f.region;
          const isAway = region !== null && away?.region === region;
          // The board sits to the right of the list from lg, and below it before that.
          const away_below = isAway && away.placement === "below";
          const StackArrow = away_below ? ArrowDown : ArrowDownRight;
          const SideArrow = away_below ? ArrowDown : ArrowRight;
          const arrowClass =
            "mt-0.5 size-4 shrink-0 text-accent opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 max-md:hidden";
          return (
            <li
              key={f.title}
              onPointerEnter={region ? hoverOnly(region) : undefined}
              onPointerLeave={region ? hoverOnly(null) : undefined}
              className="group relative flex items-start gap-2 border-b border-hairline py-3 lg:flex-1 lg:items-center lg:py-4"
            >
              <p className="min-w-0 flex-1 text-[13.5px] leading-[1.45] tracking-[-0.005em]">
                <strong
                  className={cn(
                    "font-semibold text-ink transition-colors duration-200 ease-out",
                    region && "group-hover:text-accent group-has-[:focus-visible]:text-accent",
                  )}
                >
                  {f.title}
                </strong>{" "}
                <span className="text-ink/60">{f.body}</span>
              </p>
              {region && (
                <>
                  <StackArrow
                    aria-hidden="true"
                    className={cn(arrowClass, "lg:hidden", away_below ? "group-hover:translate-y-0.5" : "group-hover:translate-x-0.5 group-hover:translate-y-0.5")}
                    strokeWidth={2}
                  />
                  <SideArrow
                    aria-hidden="true"
                    className={cn(arrowClass, "max-lg:hidden", away_below ? "group-hover:translate-y-0.5" : "group-hover:translate-x-0.5")}
                    strokeWidth={2}
                  />
                  {/* Stretched over the row: keyboard focus lights the board up like hover does, and
                      Enter or a click scrolls it into view when it is off screen. */}
                  <button
                    type="button"
                    aria-label={`Show ${f.title.replace(/\.$/, "").toLowerCase()} on the board`}
                    onClick={() => scrollToRegion(region)}
                    onFocus={() => setRegion(region)}
                    onBlur={() => setRegion(null)}
                    className={cn(
                      "absolute inset-0 rounded-[10px] focus-visible:rounded-[10px] max-md:hidden pointer-coarse:hidden",
                      isAway && "cursor-pointer",
                    )}
                  />
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
