"use client";

/**
 * VideoTile — a muted, looping short-form clip that only plays while near the
 * viewport, through the global playback manager (max 6 playing on desktop, 3 on
 * mobile; nothing autoplays under reduced motion; all pause when the tab is hidden).
 *
 *   <VideoTile src="/media/hero/01.mp4" poster="/media/hero/01.webp" label="Gym transformation hook, 2.1M views" />
 *   <VideoTile src={src} poster={poster} label="…" aspect="4/5" priority={2}
 *     overlay={<ScoreBadge score={97} />} className="w-[220px]" />
 *
 * - Default aspect 9:16, radius 14px (video tile token), surface background.
 * - `overlay` (or children) renders above the video in an absolute inset layer;
 *   it receives pointer events, so add `pointer-events-none` for decorative overlays.
 * - `autoPlay={false}` opts out of the manager (poster only; control the
 *   element yourself through `videoRef`, a RefObject you own).
 * - Hovering boosts the tile above the cap (`boostOnHover`, default true).
 * - Every tile should carry data (score, views, platform, hook) per PLAN §2 Video.
 */
import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { posterStyle, useManagedVideo, videoManager } from "@/lib/media";

export interface VideoTileProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  src: string;
  /** Poster image, painted as the video's CSS background (see posterStyle in lib/media), so it loads only once the tile renders. */
  poster?: string;
  /** Accessible description of the clip (what it shows / why it matters). */
  label: string;
  /** CSS aspect-ratio. Default "9/16". */
  aspect?: string;
  overlay?: ReactNode;
  children?: ReactNode;
  /** Managed autoplay. Default true. */
  autoPlay?: boolean;
  /** Higher wins when more tiles are visible than the cap. Default 0. */
  priority?: number;
  /** Autoplay even under reduced motion. Default false. */
  allowReducedMotion?: boolean;
  /** Boost playback priority while hovered. Default true. */
  boostOnHover?: boolean;
  /** object-fit for the video. Default "cover". */
  fit?: "cover" | "contain";
  videoClassName?: string;
  /** Your own ref to the <video> element (e.g. to seek or read currentTime). */
  videoRef?: RefObject<HTMLVideoElement | null>;
}

export function VideoTile({
  src,
  poster,
  label,
  aspect = "9/16",
  overlay,
  children,
  autoPlay = true,
  priority = 0,
  allowReducedMotion = false,
  boostOnHover = true,
  fit = "cover",
  className,
  videoClassName,
  videoRef,
  style,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: VideoTileProps) {
  const ownRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef ?? ownRef;
  useManagedVideo(ref, { priority, allowReducedMotion, enabled: autoPlay });

  const tileStyle: CSSProperties = { aspectRatio: aspect, ...style };

  return (
    <div
      className={cn("relative isolate overflow-hidden rounded-btn bg-surface", className)}
      style={tileStyle}
      onPointerEnter={(e) => {
        if (boostOnHover && autoPlay && ref.current) videoManager.boost(ref.current, true);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        if (boostOnHover && autoPlay && ref.current) videoManager.boost(ref.current, false);
        onPointerLeave?.(e);
      }}
      {...rest}
    >
      <video
        ref={ref}
        src={src}
        style={posterStyle(poster, fit)}
        aria-label={label}
        muted
        playsInline
        loop
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        className={cn("absolute inset-0 size-full", fit === "cover" ? "object-cover" : "object-contain", videoClassName)}
      />
      {(overlay || children) && (
        <div className="absolute inset-0">
          {overlay}
          {children}
        </div>
      )}
    </div>
  );
}
