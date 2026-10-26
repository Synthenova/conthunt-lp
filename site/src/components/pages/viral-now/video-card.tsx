"use client";

/**
 * VideoCard: one 9:16 poster in a niche row (`variant="row"`, with the big outlined rank
 * numeral) or in the niche grid (`variant="grid"`, with a rank badge).
 *
 * Desktop hover (180ms delay): the card scales up and rises above its neighbors, a loop
 * plays muted when one exists (seed ranks 1 to 3, or a live signed URL), and a paper info
 * panel slides up with platform, creator, score, views and likes. Keyboard focus shows the
 * same state at once. Click opens the dialog through `onOpen`.
 *
 * Touch devices have no hover, so a tap goes straight to the dialog.
 *
 * In a row only one card is a tab stop (`tabStop`, moved by the row as focus moves), so a row
 * costs one Tab press and Arrow keys walk along it (see HScroller `roving`).
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/cn";
import { isPlayable } from "@/lib/viral-now/api";
import { creatorLabel, formatCount } from "@/lib/viral-now/format";
import { freshVideoUrl, refreshVideoUrl } from "@/lib/viral-now/media-store";
import type { ViralNowVideo } from "@/lib/viral-now/types";
import { youtubeVideoId } from "@/lib/viral-now/youtube";
import { EyeGlyph, PlatformGlyph, Poster, ScoreChip } from "./parts";
import { useViralNow } from "./provider";
import { YouTubeFrame } from "./youtube-frame";
import styles from "./viral-now.module.css";

const HOVER_DELAY_MS = 180;

export interface VideoCardProps {
  video: ViralNowVideo;
  variant: "row" | "grid";
  /** Mark the poster as high priority (above the fold). */
  eager?: boolean;
  /** Load the poster now (not lazily) without a preload. For rows that mount just before they scroll in. */
  early?: boolean;
  /** Row cards only: this card is the row's tab stop until focus moves (roving tabindex). */
  tabStop?: boolean;
  /** Stagger index for the CSS entrance animation (first row only). Omit for no entrance. */
  entrance?: number;
  onOpen: (video: ViralNowVideo, trigger: HTMLElement) => void;
}

export function VideoCard({ video, variant, eager = false, early = false, tabStop = false, entrance, onOpen }: VideoCardProps) {
  const { reducedMotion: reduced } = useViralNow();
  const [active, setActive] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canPlay = isPlayable(video.video);
  const youtubeId = video.platform === "youtube" ? youtubeVideoId(video.url) : null;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Resolve a playable URL the first time the card is hovered (renewed when close to expiry).
  useEffect(() => {
    if (!active || !canPlay || reduced || failed || src) return;
    let cancelled = false;
    void freshVideoUrl(video).then((url) => {
      if (!cancelled && url) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [active, canPlay, reduced, failed, src, video]);

  // Play while active, pause otherwise. State follows the media events.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active && src && !reduced) {
      el.currentTime = 0;
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, [active, src, reduced]);

  const onPointerEnter = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(true), HOVER_DELAY_MS);
  }, []);

  const onPointerLeave = useCallback(() => {
    window.clearTimeout(timer.current);
    setActive(false);
  }, []);

  const who = creatorLabel(video.creator);
  const views = video.metrics.views;
  // WCAG 2.5.3 (label in name): the accessible name must open with the text a sighted user reads on
  // the card. That is the rank badge ("#3") and then the views chip ("1.7M"), so the name starts
  // "#3, 1.7M views" and carries the creator, title and score after it.
  const label = [
    `#${video.rank}`,
    views !== null ? `${formatCount(views)} views` : null,
    who,
    video.title,
    video.score !== null ? `score ${video.score.toFixed(1)}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const lead = video.rank <= 3;
  const sizes = variant === "row" ? "(min-width: 1280px) 220px, 150px" : "(min-width: 1280px) 220px, (min-width: 900px) 20vw, 33vw";

  const card = (
    <button
      type="button"
      className={styles.card}
      data-active={active ? "true" : "false"}
      data-grid={variant === "grid" ? "true" : undefined}
      data-fill={variant === "grid" ? "true" : undefined}
      aria-haspopup="dialog"
      data-video-id={video.id}
      data-roving={variant === "row" ? "" : undefined}
      tabIndex={variant === "row" ? (tabStop ? 0 : -1) : undefined}
      aria-label={label}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) setActive(true);
      }}
      onBlur={() => setActive(false)}
      onClick={(event) => onOpen(video, event.currentTarget)}
    >
      <Poster video={video} sizes={sizes} priority={eager} early={early} />
      {youtubeId && active && !reduced && <YouTubeFrame videoId={youtubeId} className={styles.youtube} />}
      {src && !youtubeId && (
        <video
          ref={videoRef}
          className={styles.video}
          data-playing={playing ? "true" : "false"}
          src={src}
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            // A dead URL gets one renewal (live media); anything else stops trying.
            setSrc(null);
            void refreshVideoUrl(video).then((url) => (url ? setSrc(url) : setFailed(true)));
          }}
        />
      )}
      {variant === "grid" && (
        <span className={styles.rankBadge} data-lead={lead ? "true" : undefined} aria-hidden="true">
          #{video.rank}
        </span>
      )}{" "}
      <span className={styles.platformMark} aria-hidden="true">
        <PlatformGlyph platform={video.platform} className="size-3" />
      </span>
      {views !== null && (
        <span className={styles.viewsChip} aria-hidden="true">
          <EyeGlyph className="size-3" />
          {formatCount(views)}
        </span>
      )}
      <span className={styles.info} aria-hidden="true">
        <span className={styles.infoTop}>
          <span className={styles.infoWho}>
            <PlatformGlyph platform={video.platform} className="size-3" />
            <span>{who}</span>
          </span>
          <ScoreChip score={video.score} />
        </span>
        <span className={styles.infoTitle}>{video.title}</span>
        <span className={styles.infoStats}>
          <span>
            <b>{formatCount(views)}</b> views
          </span>
          <span>
            <b>{formatCount(video.metrics.likes)}</b> likes
          </span>
        </span>
      </span>
    </button>
  );

  if (variant === "grid") {
    return (
      <li className={styles.gridItem} data-active={active ? "true" : "false"} data-enter="true" data-flip-id={video.id}>
        {card}
      </li>
    );
  }

  return (
    <li
      className={cn(styles.item)}
      data-snap=""
      data-digits={video.rank >= 10 ? "2" : "1"}
      data-active={active ? "true" : "false"}
      data-entrance={entrance !== undefined ? "" : undefined}
      style={entrance !== undefined ? ({ "--vn-i": entrance } as CSSProperties) : undefined}
    >
      <span className={styles.numeral} data-lead={lead ? "true" : undefined} aria-hidden="true">
        {video.rank}
      </span>
      {card}
    </li>
  );
}
