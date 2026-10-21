"use client";

/**
 * SimTile: one 9:16 board card (MediaCard inside SelectableMediaCard, simulator-spec §5.2).
 *
 * Skeleton tiles keep the real tile anatomy (score badge, platform glyph, creator, two-line
 * caption, three metric glyphs) with static bars for the values the owner has not supplied yet.
 * The anatomy is pure CSS (./tile.module.css): a skeleton tile is a button, one glyph layer, the
 * badge and the select box, so a rail of eight costs a few kilobytes of markup. The rail draws one
 * shimmer sweep over a rail of skeleton tiles (./board.tsx).
 * Real cards (`skeleton` false and a `thumbnail_url`) render the poster, gradient, creator,
 * caption and metrics.
 *
 * Hover play (SIM-UI.md §4): a mouse that rests on a real card for HOVER_INTENT_MS mounts the muted
 * `playback_url` clip; the poster stays until the clip fires `playing`, then the clip fades in.
 * Leaving fades it out, pauses and unmounts it. One clip plays at a time across the simulator
 * (./preload.ts `claimPreview`); none under reduced motion or Save-Data; touch never starts one.
 */
import Image from "next/image";
import { memo, useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { SimVideoCard } from "@/content/simulator/types";
import { cn } from "@/lib/cn";
import { formatTileCount, PLATFORM_LABEL } from "./format";
import { PlatformIcon } from "./platform-icon";
import { claimPreview, hoverPlayAllowed, releasePreview } from "./preload";
import t from "./tile.module.css";

/** Pointer rest before a hover clip mounts. */
const HOVER_INTENT_MS = 120;
/** Clip fade (in on `playing`, out on leave); matches `.clip` in ./tile.module.css. */
const CLIP_FADE_MS = 150;

/**
 * The card's one size, in design px: 4.5 cards across the inline board's default visible width
 * (856px with the sidebar collapsed and the chat open: 20px inset + 4 x (176 + 12) + about half a
 * card). It is also the maximum: a wider board (Full Control) shows more cards, never bigger ones.
 * 9:16 (176 x 313); the anatomy below and the skeleton in ./tile.module.css are drawn for it.
 * Phones keep the 140 x 249 card: the tile is drawn at this size and zoomed by --sim-tile-zoom
 * (140/176, set under the phone query in ./sim.module.css), so the skeleton still lines up.
 */
export const TILE_W = 176;
export const TILE_H = 313;

export interface SimTileOpen {
  railKey: string;
  id: string;
  badge: string | null;
  platform?: SimVideoCard["platform"];
  /** The card the drawer shows (null for a skeleton tile). */
  card?: SimVideoCard | null;
  /** The tile is still a skeleton: the drawer keeps its shimmer layout. */
  skeleton?: boolean;
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
  /** Poster loading: "eager" for the rails visible on landing (default lazy). */
  posterLoading?: "eager" | "lazy";
  /** Fetch priority of the poster: "high" for the tiles visible on landing. */
  posterPriority?: "high" | "low" | "auto";
  /** The rail just completed: a skeleton face over the card fades out (one crossfade per rail). */
  revealing?: boolean;
}

type MetricKind = "views" | "likes" | "shares";

/** Metric glyph (lucide play / heart / share-2) drawn as a CSS mask in currentColor. */
function Glyph({ kind }: { kind: MetricKind }) {
  return <span aria-hidden className={t.glyph} data-i={kind} />;
}

type ClipState = "off" | "loading" | "live" | "leaving";

/** The hover clip state machine: intent, poster until `playing`, fade out, unmount. */
function useHoverClip(src: string | null | undefined) {
  const [clip, setClipState] = useState<ClipState>("off");
  // Mirror of `clip` for the handlers: a pointerleave can land before React commits a change.
  const clipRef = useRef<ClipState>("off");
  const timer = useRef<number | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);

  const setClip = useCallback((next: ClipState) => {
    clipRef.current = next;
    setClipState(next);
  }, []);

  const stop = useCallback(() => {
    window.clearTimeout(timer.current);
    if (clipRef.current === "off") return;
    setClip("leaving");
    timer.current = window.setTimeout(() => {
      videoRef.current?.pause();
      setClip("off");
    }, CLIP_FADE_MS);
  }, [setClip]);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      releasePreview(stop);
    },
    [stop],
  );

  const enter = (e: ReactPointerEvent) => {
    if (!src || e.pointerType === "touch" || !hoverPlayAllowed()) return;
    window.clearTimeout(timer.current);
    const video = videoRef.current;
    if (clipRef.current === "leaving" && video) {
      // Back within the fade-out: the clip is still mounted, so it fades straight back in. A clip
      // that never reached `playing` stays "loading" and fades in when it does.
      claimPreview(stop);
      setClip(video.paused || video.readyState < 3 ? "loading" : "live");
      void video.play().catch(() => {});
      return;
    }
    timer.current = window.setTimeout(() => {
      claimPreview(stop);
      if (clipRef.current === "off") setClip("loading");
    }, HOVER_INTENT_MS);
  };
  const leave = () => {
    window.clearTimeout(timer.current);
    releasePreview(stop);
    stop();
  };
  const onPlaying = () => {
    if (clipRef.current === "loading") setClip("live");
  };
  return { clip, enter, leave, onPlaying, videoRef };
}

function SimTileImpl({
  railKey,
  id,
  card,
  badge,
  skeleton,
  status = "ready",
  selected,
  index,
  onToggleSelect,
  onOpen,
  posterLoading,
  posterPriority,
  revealing,
}: SimTileProps) {
  const loading = status === "loading";
  const showSkeleton = skeleton || loading || !card;
  const platform = card?.platform;
  const creator = card?.author_name || card?.creator_handle;
  const caption = card?.title || card?.primary_text || "No Title";
  const { clip, enter, leave, onPlaying, videoRef } = useHoverClip(showSkeleton ? null : card?.playback_url);

  const label = showSkeleton
    ? `Video ${index + 1}${platform ? ` on ${PLATFORM_LABEL[platform]}` : ""}${badge ? `, score ${badge}` : ""}`
    : `${creator ?? "Video"}: ${caption}${badge ? `, score ${badge}` : ""}`;

  if (status === "unavailable") {
    return (
      <div
        className="relative grid shrink-0 place-items-center rounded-[18px] bg-surface text-center"
        style={{ width: TILE_W, height: TILE_H, zoom: "var(--sim-tile-zoom, 1)" }}
      >
        <div className="px-5">
          <p className="text-[16px] text-muted">Video source unavailable</p>
          {badge ? <p className="mt-1 font-mono text-[16.5px] tabular-nums text-ink-2">{badge}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      data-tile={id}
      className={t.tile}
      // Only real cards with a clip have a hover preview to start.
      onPointerEnter={showSkeleton || !card?.playback_url ? undefined : enter}
      onPointerLeave={showSkeleton || !card?.playback_url ? undefined : leave}
    >
      <button
        type="button"
        data-rove={id}
        data-p={showSkeleton ? platform : undefined}
        aria-label={`Open ${label}${selected ? ", selected" : ""}`}
        onClick={() => onOpen?.({ railKey, id, badge, platform, card, skeleton: showSkeleton })}
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
          // Bars come from the skeleton layer's ::before / ::after; the glyphs are one masked layer.
          <span className={t.skLayer}>
            <span className={t.skIcons} />
          </span>
        ) : (
          <>
            {card?.thumbnail_url ? (
              <Image
                src={card.thumbnail_url}
                alt=""
                fill
                sizes="176px"
                unoptimized
                loading={posterLoading}
                fetchPriority={posterPriority}
                className="object-cover"
              />
            ) : null}
            {clip !== "off" && card?.playback_url ? (
              <video
                ref={videoRef}
                src={card.playback_url}
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                disableRemotePlayback
                aria-hidden
                onPlaying={onPlaying}
                data-clip={clip}
                className={t.clip}
              />
            ) : null}
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
            {/* The 140px card's anatomy scaled by 176/140 (padding 12, gap 5, type 17 / 15 / 13px), zoomed by
                --t-s (./tile.module.css) so it renders near the app card's size. */}
            <span className={cn(t.info, "absolute inset-x-0 bottom-0 flex flex-col gap-[5px] p-3 text-white")}>
              <span className="flex min-w-0 items-center gap-[5px]">
                <span className="truncate text-[17px] font-bold leading-tight">{creator}</span>
                {platform ? <PlatformIcon platform={platform} size={14} className="shrink-0 opacity-90" /> : null}
              </span>
              {/* Always two lines tall, so the creator line sits where the skeleton bar is (y 218)
                  even on a one-line caption and the rail's reveal crossfade does not jump. */}
              <span className="line-clamp-2 min-h-[2lh] text-[15px] leading-snug text-white/80">{caption}</span>
              {/* Three metrics only, harshly rounded, so the row never overflows the tile (owner, 2026-10-17).
                  Sized so three 4-character values (1.6M 0.3M 4.1K) still keep a 4px gap: 3 × (14 + 2 + 4ch) + 8 ≤ 152. */}
              <span className="mt-[3px] flex items-center justify-between gap-1 font-mono text-[13px] leading-[18px] tabular-nums text-white/85">
                <span className="flex items-center gap-[2px]">
                  <Glyph kind="views" />
                  {formatTileCount(card?.metrics.views)}
                </span>
                <span className="flex items-center gap-[2px]">
                  <Glyph kind="likes" />
                  {formatTileCount(card?.metrics.likes)}
                </span>
                <span className="flex items-center gap-[2px]">
                  <Glyph kind="shares" />
                  {formatTileCount(card?.metrics.shares ?? card?.metrics.comments)}
                </span>
              </span>
            </span>
          </>
        )}
      </button>

      {revealing && !showSkeleton ? (
        <span aria-hidden className={cn(t.face, t.sk, t.skOut)} data-p={platform}>
          <span className={t.skLayer}>
            <span className={t.skIcons} />
          </span>
        </span>
      ) : null}

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
