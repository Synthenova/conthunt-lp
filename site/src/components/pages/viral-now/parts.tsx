"use client";

/**
 * Small shared pieces for the Viral Now page: platform glyph, poster, score chip.
 */
import Image from "next/image";
import { cn } from "@/lib/cn";
import { PLATFORM_ORDER, PLATFORMS, platformInfo } from "@/lib/viral-now/glyphs";
import { useAssetUrl } from "@/lib/viral-now/media-store";
import type { ViralNowPlatform, ViralNowVideo } from "@/lib/viral-now/types";
import styles from "./viral-now.module.css";

const glyphId = (platform: string): string => `vn-p-${platform}`;

/**
 * One hidden SVG holding every platform mark and the eye icon. Cards draw them with `<use>`,
 * so a card carries a 100-byte reference instead of 750 bytes of path data (a row of 30 cards
 * used to repeat the TikTok path 60 times). Render it once, above everything that draws a glyph.
 */
export function GlyphSprite() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute size-0 overflow-hidden">
      {PLATFORM_ORDER.map((platform) => (
        <symbol key={platform} id={glyphId(platform)} viewBox="0 0 24 24">
          <path d={PLATFORMS[platform].path} />
        </symbol>
      ))}
      <symbol id="vn-eye" viewBox="0 0 24 24">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </symbol>
    </svg>
  );
}

export function PlatformGlyph({ platform, className }: { platform: ViralNowPlatform; className?: string }) {
  if (!platformInfo(platform)) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={cn("size-3.5 shrink-0 fill-current", className)}>
      <use href={`#${glyphId(platform)}`} />
    </svg>
  );
}

/** The "views" eye. Same shape as lucide's Eye, drawn from the sprite. */
export function EyeGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <use href="#vn-eye" />
    </svg>
  );
}

/** A 9:16 poster. Local files render as-is; live R2 posters renew once on error. */
export function Poster({
  video,
  sizes,
  priority = false,
  early = false,
  className,
}: {
  video: ViralNowVideo;
  sizes: string;
  /** Preload and fetch with high priority (the first screen). */
  priority?: boolean;
  /** Load now rather than lazily, without a preload (cards that are about to be on screen). */
  early?: boolean;
  className?: string;
}) {
  const { url, onError } = useAssetUrl(video, "poster");
  if (!url) {
    return (
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center bg-surface-2 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-2/70"
      >
        No preview
      </span>
    );
  }
  return (
    <Image
      src={url}
      alt=""
      fill
      sizes={sizes}
      unoptimized
      priority={priority}
      loading={!priority && early ? "eager" : undefined}
      draggable={false}
      onError={onError}
      className={cn(styles.poster, className)}
    />
  );
}

export function ScoreChip({ score, className }: { score: number | null; className?: string }) {
  if (score === null) return null;
  return (
    <span className={cn(styles.scoreChip, className)} title="Score out of 100">
      {score.toFixed(1)}
    </span>
  );
}
