"use client";

/**
 * One tracked account as a board column: identity, follower count, 7-day change,
 * then the videos selected from that account.
 *
 * Hovering the header emphasizes this account's lines in the charts (the legend buttons
 * above the charts do the same for keyboard users).
 */
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { CountUp } from "./count-up";
import { DeltaChip } from "./delta-chip";
import { TONE_STROKE, type TrackedAccount } from "./data";
import { compact, signedPct } from "./format";
import { REGION_CLASS, regionState, useTrackingHighlight } from "./highlight";
import { VideoCard } from "./video-card";

/** Role badge and avatar ring follow the account's hue (static maps so Tailwind sees every class). */
const ROLE_TONE: Record<TrackedAccount["tone"], BadgeTone> = { pink: "pink", purple: "purple", blue: "blue" };
const AVATAR_RING: Record<TrackedAccount["tone"], string> = {
  pink: "ring-pink/30",
  purple: "ring-purple/30",
  blue: "ring-blue/30",
};

/** Radial fade anchored on the top-right corner: full strength there, gone by about two thirds of the way across. */
const COVER_MASK = {
  maskImage: "radial-gradient(ellipse 72% 118% at 100% 0%, #000 0%, rgb(0 0 0 / .82) 28%, rgb(0 0 0 / .36) 54%, transparent 82%)",
  WebkitMaskImage: "radial-gradient(ellipse 72% 118% at 100% 0%, #000 0%, rgb(0 0 0 / .82) 28%, rgb(0 0 0 / .36) 54%, transparent 82%)",
};

const thousands = new Intl.NumberFormat("en-US");

export function AccountColumn({ account, index, play }: { account: TrackedAccount; index: number; play: boolean }) {
  const { region, setFocusId } = useTrackingHighlight();
  const weekly = account.weeklyPct.followers;

  return (
    <li className="tk-col @container flex min-w-0 snap-start flex-col gap-2 p-2">
      <div
        data-region="accounts"
        data-hl={regionState(region, "accounts")}
        onPointerEnter={() => setFocusId(account.id)}
        onPointerLeave={() => setFocusId(null)}
        className={cn(REGION_CLASS, "relative isolate overflow-hidden rounded-[14px] border border-hairline bg-paper p-3")}
      >
        {/* Cover: the account's own poster, strongest in the top-right corner and masked away toward the
            centre and bottom-left, so it only reads in that quadrant. It is in the card, so it dims and
            lights up with the card. Fixed box and a fixed-size image: no layout shift. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={COVER_MASK}>
          <Image
            src={account.cover}
            alt=""
            width={408}
            height={238}
            sizes="260px"
            loading="lazy"
            className="absolute right-0 top-0 h-full w-auto max-w-none object-cover object-right-top "
          />
        </div>
        <div className="flex items-center gap-3">
          <Image
            src={account.avatar}
            alt=""
            width={88}
            height={88}
            sizes="44px"
            className={cn("size-10 shrink-0 rounded-full bg-surface object-cover ring-2", AVATAR_RING[account.tone])}
          />
          <div className="min-w-0">
            <p title={account.name} className="truncate text-[15px] font-semibold leading-tight tracking-[-0.015em] text-ink">
              {account.name}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-ink/60">@{account.handle}</p>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.02em] text-ink/60">
          <span aria-hidden="true" className="h-[2px] w-3 rounded-full" style={{ background: TONE_STROKE[account.tone] }} />
          Followers
        </p>
        {/* The number on the left; the role label and the 7d change sit together on its right. When a
            column is too narrow for all three they wrap under the number, still together. The number
            scales with the container (28px to 36px), so columns that differ by a pixel never differ. */}
        <div className="mt-1 flex flex-wrap items-end justify-between gap-x-2 gap-y-2">
          <p className="text-[34px] font-bold leading-none tracking-[-0.04em] text-ink @min-[220px]:text-[length:clamp(28px,13cqi,36px)]">
            <CountUp value={account.followers} format={compact} delay={0.25 + index * 0.1} play={play} />
          </p>
          <div className="mb-0.5 flex items-center gap-1.5">
            <Badge tone={ROLE_TONE[account.tone]}>{account.roleLabel}</Badge>
            <DeltaChip tone={weekly < 0 ? "decline" : "growth"} label="7d">
              <CountUp value={weekly} format={signedPct} delay={0.4 + index * 0.1} play={play} />
            </DeltaChip>
          </div>
        </div>

        <p className="mt-2.5 flex gap-2.5 border-t border-hairline pt-2 font-mono text-[10.5px] tabular-nums text-ink/60">
          <span>{thousands.format(account.posts)} posts</span>
          <span aria-hidden="true">·</span>
          <span>{compact(account.totalLikes)} likes</span>
        </p>
      </div>

      <div className="flex items-center justify-between px-1.5 pt-0.5 font-mono text-[10px] uppercase tracking-[0.02em] text-ink/60">
        <span>Selected videos</span>
        <span className="tabular-nums">
          {account.videos.length} of {thousands.format(account.posts)}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {account.videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </ul>
    </li>
  );
}
