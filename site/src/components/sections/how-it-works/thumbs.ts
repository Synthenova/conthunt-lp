/**
 * Typed access to the 60 "how it works" posters (`src/content/media/hiw-thumbs.json`).
 *
 * Creator handles, platforms and view counts are real (captured by the media agent);
 * every score on this section is illustrative. The step visuals read as animations, so they
 * carry no visible label; the rank stage's screen-reader caption says so.
 */
import raw from "@/content/media/hiw-thumbs.json";

export type Platform = "tiktok" | "instagram" | "youtube";

export interface Thumb {
  n: number;
  poster: string;
  platform: Platform;
  creator: string;
  url: string;
  views: number;
}

export const THUMBS: readonly Thumb[] = raw as Thumb[];

const BY_N = new Map(THUMBS.map((t) => [t.n, t]));

/** Look up a poster by its 1-based number. Throws in dev if the number is unknown. */
export function thumb(n: number): Thumb {
  const t = BY_N.get(n);
  if (!t) throw new Error(`how-it-works: unknown thumb ${n}`);
  return t;
}

/** Poster natural size (all posters are 120x213 WebP). */
export const POSTER_W = 120;
export const POSTER_H = 213;

export const PLATFORM_LABEL: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Reels",
  youtube: "Shorts",
};

/** App number format (MediaCard.tsx): 1.2k, 2.6M, 1.4B. */
export function formatCount(value: number): string {
  if (value >= 1e9) return `${trim(value / 1e9)}B`;
  if (value >= 1e6) return `${trim(value / 1e6)}M`;
  if (value >= 1e3) return `${trim(value / 1e3)}k`;
  return String(value);
}

function trim(v: number): string {
  const fixed = v >= 100 ? v.toFixed(0) : v.toFixed(1);
  return fixed.includes(".") ? fixed.replace(/\.0$/, "") : fixed;
}

/** "04:38" from seconds. */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
