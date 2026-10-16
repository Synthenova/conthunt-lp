/**
 * Numbers derived from the data on screen. Nothing here is estimated or invented: every
 * value is computed from the videos a visitor can see, and says so in its label.
 */
import { BOARD_SIZE, type IngredientKey } from "./ranking";
import type { ViralNowMetrics, ViralNowNiche, ViralNowPlatform, ViralNowVideo } from "./types";

const DAY_MS = 86_400_000;

export function sum(values: Array<number | null | undefined>): number {
  let total = 0;
  for (const value of values) if (typeof value === "number" && Number.isFinite(value)) total += value;
  return total;
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** (likes + comments + shares) / views. Null when views are unknown or zero. */
export function engagementRate(metrics: ViralNowMetrics): number | null {
  const { views, likes, comments, shares } = metrics;
  if (!views || views <= 0) return null;
  if (likes === null && comments === null && shares === null) return null;
  return sum([likes, comments, shares]) / views;
}

/** Whole days between `postedAt` and `asOf`, floored at a quarter day so a fresh post is not infinite. */
export function ageDays(postedAt: string | null, asOf: number): number | null {
  if (!postedAt) return null;
  const posted = Date.parse(postedAt);
  if (!Number.isFinite(posted)) return null;
  return Math.max((asOf - posted) / DAY_MS, 0.25);
}

export function viewsPerDay(video: ViralNowVideo, asOf: number): number | null {
  const views = video.metrics.views;
  const age = ageDays(video.posted_at, asOf);
  return views !== null && age !== null ? views / age : null;
}

type BoardShape = Pick<ViralNowNiche, "videos" | "video_count" | "summary" | "source">;

/**
 * Videos on a board as a visitor counts them. A snapshot niche counts its whole board (at most
 * BOARD_SIZE) while its videos are still streaming in. Live boards count what they hold: a live
 * row preview is meant to be partial until the full board is fetched.
 */
export function nicheSize(niche: Pick<ViralNowNiche, "videos" | "video_count" | "source">): number {
  return niche.source === "seed" ? Math.max(niche.videos.length, Math.min(niche.video_count, BOARD_SIZE)) : niche.videos.length;
}

/** True once every video of the board is in `videos`. */
export function nicheLoaded(niche: Pick<ViralNowNiche, "videos" | "video_count" | "source">): boolean {
  return niche.videos.length >= nicheSize(niche);
}

/** Total views of a board. Uses the summary while the videos are still streaming in, so the number never jumps. */
export function nicheViews(niche: BoardShape): number {
  if (nicheLoaded(niche) || !niche.summary) return sum(niche.videos.map((v) => v.metrics.views));
  return niche.summary.total_views ?? 0;
}

/** Platforms on a board, from its videos or, while they are still streaming in, from its summary. */
export function nichePlatforms(niche: BoardShape): ViralNowPlatform[] {
  if (nicheLoaded(niche) || !niche.summary) return [...new Set(niche.videos.map((v) => v.platform))];
  return niche.summary.platforms;
}

export interface PlatformShare {
  platform: ViralNowPlatform;
  count: number;
}

export interface NicheStats {
  videos: number;
  totalViews: number;
  medianViews: number | null;
  medianEngagement: number | null;
  creators: number;
  platforms: PlatformShare[];
}

export function nicheStats(niche: Pick<ViralNowNiche, "videos">): NicheStats {
  const { videos } = niche;
  const byPlatform = new Map<ViralNowPlatform, number>();
  const handles = new Set<string>();
  for (const video of videos) {
    byPlatform.set(video.platform, (byPlatform.get(video.platform) ?? 0) + 1);
    handles.add(video.creator.handle ?? video.creator.name ?? video.id);
  }
  const views = videos.map((v) => v.metrics.views).filter((v): v is number => v !== null);
  const rates = videos.map((v) => engagementRate(v.metrics)).filter((v): v is number => v !== null);
  return {
    videos: videos.length,
    totalViews: sum(views),
    medianViews: median(views),
    medianEngagement: median(rates),
    creators: handles.size,
    platforms: [...byPlatform.entries()].map(([platform, count]) => ({ platform, count })).sort((a, b) => b.count - a.count),
  };
}

export interface IngredientStanding {
  key: IngredientKey;
  /** Display value, for example "1.7M views". Filled by the caller's formatter. */
  value: number | null;
  /** 1 is best among the niche's videos. Null when the value is unknown. */
  place: number | null;
  /** Videos that have a value for this ingredient. */
  of: number;
  /** 0 to 1, where 1 is the best in the niche (bar fill). */
  fill: number;
}

type Picker = (video: ViralNowVideo, asOf: number) => number | null;

const PICKERS: Record<IngredientKey, Picker> = {
  reach: (v) => v.metrics.views,
  engagement: (v) => engagementRate(v.metrics),
  velocity: (v, asOf) => viewsPerDay(v, asOf),
  // Newer is better: negate the age so "higher is better" holds for every ingredient.
  recency: (v, asOf) => {
    const age = ageDays(v.posted_at, asOf);
    return age === null ? null : -age;
  },
};

/**
 * Where one video stands on each part of the score, among the videos of its niche.
 * `place` is a plain rank (1 is best) among the niche's listed videos, so the dialog can
 * say "2nd of 30 for reach". It is not the normalized component the ranking used.
 */
export function ingredientStandings(video: ViralNowVideo, pool: ViralNowVideo[], asOf: number): IngredientStanding[] {
  return (Object.keys(PICKERS) as IngredientKey[]).map((key) => {
    const pick = PICKERS[key];
    const own = pick(video, asOf);
    const values = pool.map((v) => pick(v, asOf)).filter((v): v is number => v !== null);
    if (own === null || values.length === 0) return { key, value: null, place: null, of: values.length, fill: 0 };
    const place = 1 + values.filter((v) => v > own).length;
    const fill = values.length > 1 ? (values.length - place) / (values.length - 1) : 1;
    return { key, value: key === "recency" ? -own : own, place, of: values.length, fill };
  });
}

export interface ViewsVsMedian {
  /** For example 2.4 means 2.4 times the niche median. */
  multiple: number;
}

export function viewsVsMedian(video: ViralNowVideo, stats: NicheStats): ViewsVsMedian | null {
  const views = video.metrics.views;
  if (views === null || !stats.medianViews) return null;
  return { multiple: views / stats.medianViews };
}

/** Sort keys used by the niche grid. */
export type SortKey = "rank" | "views" | "newest" | "engagement";

export function sortVideos(videos: ViralNowVideo[], key: SortKey): ViralNowVideo[] {
  const list = [...videos];
  const by = (pick: (v: ViralNowVideo) => number | null, dir: 1 | -1 = -1) =>
    list.sort((a, b) => {
      const x = pick(a);
      const y = pick(b);
      if (x === null && y === null) return a.rank - b.rank;
      if (x === null) return 1;
      if (y === null) return -1;
      return (x - y) * dir || a.rank - b.rank;
    });
  switch (key) {
    case "views":
      return by((v) => v.metrics.views);
    case "newest":
      return by((v) => (v.posted_at ? Date.parse(v.posted_at) : null));
    case "engagement":
      return by((v) => engagementRate(v.metrics));
    default:
      return list.sort((a, b) => a.rank - b.rank);
  }
}
