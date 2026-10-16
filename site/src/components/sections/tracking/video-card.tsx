"use client";

/**
 * A tracked video on the board: poster, caption, the metrics the app stores
 * (views, likes, saves shown here), the 24h gain and a 14-day daily-gain sparkline.
 *
 * The sparkline is a row of daily bars (one per saved snapshot). The last bar is the
 * 24h gain and carries the trend color. Hovering a bar swaps the chip to that day.
 *
 * Compact layout: poster | date, two-line caption, the saved metrics, then the 24h gain
 * and the sparkline (under the poster instead when the card is narrow).
 */
import Image from "next/image";
import { Bookmark, Eye, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { DeltaChip } from "./delta-chip";
import { SPARK_DAYS, type TrackedVideo, type VideoTone } from "./data";
import { compact, dayLabel, postedLabel, signedCompact } from "./format";
import { REGION_CLASS, regionState, useTrackingHighlight } from "./highlight";

const BAR_TONE: Record<VideoTone, string> = {
  breakout: "bg-breakout",
  growth: "bg-growth",
  steady: "bg-ink/55",
};

export function VideoCard({ video }: { video: TrackedVideo }) {
  const { region } = useTrackingHighlight();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...video.daily);
  const shownIndex = hover ?? SPARK_DAYS - 1;
  const shownGain = video.daily[shownIndex];

  return (
    // Outer element is the GSAP entrance target; the inner one owns hover and region state.
    <li className="tk-card list-none">
      <div
        data-region="videos"
        data-hl={regionState(region, "videos")}
        className={cn(
          REGION_CLASS,
          "group/card @container rounded-[14px] border border-hairline bg-paper p-2 transition-[transform,border-color,opacity,box-shadow,background-color] hover:-translate-y-px hover:border-ink/20",
        )}
      >
        {/* Wide cards (desktop columns): the poster spans both rows and the 24h gain sits
            under the metrics. Narrow cards (scrolling columns on phones): the gain row runs
            the full width under the poster. */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 @min-[244px]:grid-rows-[minmax(0,1fr)_auto]">
          <div className="relative aspect-[9/16] w-[46px] shrink-0 self-start overflow-hidden rounded-[6px] bg-surface outline outline-1 -outline-offset-1 outline-black/10 @min-[244px]:row-span-2 @min-[244px]:w-[54px]">
            <Image
              src={video.poster}
              alt=""
              width={104}
              height={185}
              sizes="54px"
              className="size-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.06]"
            />
          </div>
          <div className="flex min-w-0 flex-col py-0.5 pr-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.02em] text-ink/60">{postedLabel(video.postedAt)}</p>
            {/* The caption always reserves two lines (2 x 1.35em), so a one-line caption never makes
                its card shorter than its neighbours'. Muted: the numbers lead, not the caption. */}
            <p
              title={video.title}
              className="mt-1 line-clamp-2 min-h-[2.7em] text-[12.5px] leading-[1.35] tracking-[-0.005em] text-ink/62"
            >
              {video.title}
            </p>
            <ul
              aria-label="Saved metrics"
              className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-1 font-mono text-[11px] tabular-nums text-ink/60"
            >
              <li className="flex items-center gap-1 font-medium text-ink">
                <Eye aria-hidden="true" className="size-3 text-ink/50" strokeWidth={2} />
                <span className="sr-only">Views </span>
                {compact(video.views)}
              </li>
              <li className="flex items-center gap-1">
                <Heart aria-hidden="true" className="size-3 text-ink/40" strokeWidth={2} />
                <span className="sr-only">Likes </span>
                {compact(video.likes)}
              </li>
              <li className="flex items-center gap-1">
                <Bookmark aria-hidden="true" className="size-3 text-ink/40" strokeWidth={2} />
                <span className="sr-only">Saves </span>
                {compact(video.saves)}
              </li>
            </ul>
          </div>

          <div className="col-span-2 mt-2 flex items-end justify-between gap-2 px-0.5 @min-[244px]:col-span-1 @min-[244px]:col-start-2 @min-[244px]:mt-1 @min-[244px]:pl-0 @min-[244px]:pr-1">
            <DeltaChip tone={video.tone} label={hover === null ? "Δ24h" : dayLabel(shownIndex, SPARK_DAYS)}>
              {signedCompact(shownGain)}
            </DeltaChip>
            <div
              role="img"
              aria-label={`Views gained per day, last ${SPARK_DAYS} days. Latest ${signedCompact(video.delta24h)}.`}
              className="flex h-6 w-[92px] min-w-[56px] shrink items-end gap-[2px]"
              onPointerLeave={() => setHover(null)}
            >
              {video.daily.map((gain, i) => {
                const last = i === SPARK_DAYS - 1;
                return (
                  <div key={i} className="flex h-full flex-1 items-end" onPointerEnter={() => setHover(i)}>
                    <div
                      className={cn(
                        "tk-bar w-full rounded-[1.5px] transition-colors duration-150",
                        last ? BAR_TONE[video.tone] : i === hover ? "bg-ink/60" : "bg-ink/15",
                      )}
                      style={{ height: `${Math.max(14, (gain / max) * 100)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
