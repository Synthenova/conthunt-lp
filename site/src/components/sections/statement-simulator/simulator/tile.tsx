"use client";

/**
 * SimTile: one 9:16 board card (MediaCard inside SelectableMediaCard, simulator-spec §5.2).
 *
 * Skeleton tiles keep the real tile anatomy (score badge, platform glyph, creator, two-line
 * caption, four metric glyphs) with static bars for the values the owner has not supplied yet.
 * The anatomy is pure CSS (./tile.module.css): a skeleton tile is a button, one glyph layer, the
 * badge and the select box, so a rail of eight costs a few kilobytes of markup. The rail draws one
 * shimmer sweep over a rail of skeleton tiles (./board.tsx).
 * Real cards (`skeleton` false and a `thumbnail_url`) render the poster, gradient, creator,
 * caption and metrics; a `playback_url` plays as a muted preview on hover.
 */
import Image from "next/image";
import { memo, useState } from "react";
import type { SimVideoCard } from "@/content/simulator/types";
import { cn } from "@/lib/cn";
import { engagementRate, formatCount, PLATFORM_LABEL } from "./format";
import { PlatformIcon } from "./platform-icon";
import t from "./tile.module.css";

export const TILE_W = 140;
export const TILE_H = 249;

export interface SimTileOpen {
  railKey: string;
  id: string;
  badge: string | null;
  platform?: SimVideoCard["platform"];
}

export interface SimTileProps {
  /** Rail the tile belongs to (selection and drawer key). */
  railKey: string;
  id: string;
  card: SimVideoCard | null;
  /** Badge text, for example "97%". `null` hides the badge. */
  badge: string | null;
  skeleton?: boolean;
  status?: "ready" | "loading" | "unavailable";
  selected?: boolean;
  /** Position in the rail (accessible name of a skeleton tile). */
  index: number;
  /** Stable callbacks: the tile passes its own rail key so memo() holds across renders. */
  onToggleSelect?: (railKey: string, id: string) => void;
  onOpen?: (tile: SimTileOpen) => void;
}

type MetricKind = "views" | "likes" | "shares" | "er";

/** Metric glyph (lucide play / heart / share-2 / trending-up) drawn as a CSS mask in currentColor. */
function Glyph({ kind }: { kind: MetricKind }) {
  return <span aria-hidden className={t.glyph} data-i={kind} />;
}

function SimTileImpl({ railKey, id, card, badge, skeleton, status = "ready", selected, index, onToggleSelect, onOpen }: SimTileProps) {
  const [hover, setHover] = useState(false);
  const loading = status === "loading";
  const showSkeleton = skeleton || loading || !card;
  const platform = card?.platform;
  const creator = card?.author_name || card?.creator_handle;
  const caption = card?.title || card?.primary_text || "No Title";
  const preview = !showSkeleton && hover && card?.playback_url;

  const label = showSkeleton
    ? `Video ${index + 1}${platform ? ` on ${PLATFORM_LABEL[platform]}` : ""}${badge ? `, score ${badge}` : ""}`
    : `${creator ?? "Video"}: ${caption}${badge ? `, score ${badge}` : ""}`;

  if (status === "unavailable") {
    return (
      <div
        className="relative grid shrink-0 place-items-center rounded-[14px] bg-surface text-center"
        style={{ width: TILE_W, height: TILE_H }}
      >
        <div className="px-4">
          <p className="text-[13px] text-muted">Video source unavailable</p>
          {badge ? <p className="mt-1 font-mono text-[13.5px] tabular-nums text-ink-2">{badge}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      data-tile={id}
      className={t.tile}
      // Only real cards have a hover preview to start; skeleton tiles skip the state update.
      onPointerEnter={showSkeleton ? undefined : () => setHover(true)}
      onPointerLeave={showSkeleton ? undefined : () => setHover(false)}
    >
      <button
        type="button"
        data-rove={id}
        data-p={showSkeleton ? platform : undefined}
        aria-label={`Open ${label}${selected ? ", selected" : ""}`}
        onClick={() => onOpen?.({ railKey, id, badge, platform })}
        onKeyDown={(e) => {
          // Space selects (Enter opens), so the per-tile checkbox needs no tab stop of its own.
          if (e.key !== " " || !onToggleSelect) return;
          e.preventDefault();
          if (!e.repeat) onToggleSelect(railKey, id);
        }}
        onKeyUp={(e) => {
          if (e.key === " " && onToggleSelect) e.preventDefault();
        }}
        className={showSkeleton ? cn(t.face, t.sk) : t.face}
      >
        {showSkeleton ? (
          // Bars come from the face's ::before / ::after; the glyphs are one masked layer.
          <span className={t.skIcons} />
        ) : (
          <>
            {card?.thumbnail_url ? (
              <Image src={card.thumbnail_url} alt="" fill sizes="140px" unoptimized className="object-cover" />
            ) : null}
            {preview ? (
              <video
                src={card.playback_url ?? undefined}
                muted
                autoPlay
                loop
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                className="absolute inset-0 size-full object-cover"
              />
            ) : null}
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2.5 text-white">
              <span className="flex min-w-0 items-center gap-1">
                <span className="truncate text-[13.5px] font-bold leading-tight">{creator}</span>
                {platform ? <PlatformIcon platform={platform} size={11} className="shrink-0 opacity-90" /> : null}
              </span>
              <span className="line-clamp-2 text-[12px] leading-snug text-white/80">{caption}</span>
              <span className="mt-0.5 flex items-center justify-between font-mono text-[11.5px] tabular-nums text-white/85">
                <span className="flex items-center gap-0.5">
                  <Glyph kind="views" />
                  {formatCount(card?.metrics.views)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Glyph kind="likes" />
                  {formatCount(card?.metrics.likes)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Glyph kind="shares" />
                  {formatCount(card?.metrics.shares ?? card?.metrics.comments)}
                </span>
                <span className="flex items-center gap-0.5">
                  <Glyph kind="er" />
                  {card ? engagementRate(card.metrics) : "—"}
                </span>
              </span>
            </span>
          </>
        )}
      </button>

      {badge ? (
        <span aria-hidden className={t.badge}>
          {badge}
        </span>
      ) : null}

      {onToggleSelect ? (
        <button
          type="button"
          role="checkbox"
          tabIndex={-1}
          aria-checked={!!selected}
          aria-label={`Select ${label}`}
          onClick={() => onToggleSelect(railKey, id)}
          className={t.check}
        />
      ) : null}

      {selected ? <span aria-hidden className={t.selRing} /> : null}
    </div>
  );
}

export const SimTile = memo(SimTileImpl);
