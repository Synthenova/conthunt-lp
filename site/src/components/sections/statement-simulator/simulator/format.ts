/**
 * Pure helpers for the Deep Search simulator: number formats, board filters and sort.
 *
 * They mirror the app so real data behaves the same once it replaces the skeletons:
 * - `formatCount` follows MediaCard.tsx:740-746 (1.2k, 2.6M, 1.4B).
 * - `engagementRate` follows MediaCard.tsx:654-688: (likes + comments + shares) / views, "—" when
 *   any input is missing.
 * - `applyRubricFilters` implements BoardFilterBar's sort, date and platform options. They act on the
 *   rubric rail only (QuestionResearchCanvas.tsx:310-314); section rails are never filtered.
 */
import type {
  SimDateFilter,
  SimFilterState,
  SimPlatform,
  SimRubricVideo,
  SimVideoCard,
  SimVideoMetrics,
} from "@/content/simulator/types";

const trim = (value: number) => value.toFixed(1).replace(/\.0$/, "");

export function formatCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${trim(value / 1e9)}B`;
  if (abs >= 1e6) return `${trim(value / 1e6)}M`;
  if (abs >= 1e3) return `${trim(value / 1e3)}k`;
  return String(Math.round(value));
}

export function engagementRate(metrics: SimVideoMetrics): string {
  const { views, likes, comments, shares } = metrics;
  if (views == null || likes == null || comments == null || shares == null || views <= 0) return "—";
  return `${(((likes + comments + shares) / views) * 100).toFixed(1)}%`;
}

/** Section badge: `${Math.round(score)}%` (QuestionResearchCanvas.tsx:239). */
export const sectionBadge = (score: number) => `${Math.round(score)}%`;

/** Rubric badge: only when the match status is known (QuestionResearchCanvas.tsx:141-144). */
export function rubricBadge(video: SimRubricVideo): string | null {
  if (video.match_status == null || video.match_probability == null) return null;
  return `${Math.round(100 * video.match_probability)}%`;
}

export const PLATFORM_LABEL: Record<SimPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

/** Window in days for each date filter; `null` means no limit. */
const DATE_WINDOW_DAYS: Record<SimDateFilter, number | null> = {
  all: null,
  today: 1,
  yesterday: 2,
  week: 7,
  month: 30,
  three_months: 91,
  six_months: 182,
  year: 365,
};

function withinWindow(card: SimVideoCard | null, filter: SimDateFilter, now: number): boolean {
  const days = DATE_WINDOW_DAYS[filter];
  // Unknown publish dates stay visible: skeleton tiles have none.
  if (days == null || !card?.published_at) return true;
  const published = Date.parse(card.published_at);
  if (Number.isNaN(published)) return true;
  return now - published <= days * 86_400_000;
}

type MetricKey = keyof SimVideoMetrics;
const SORT_METRIC: Partial<Record<SimFilterState["sort"], MetricKey>> = {
  views: "views",
  likes: "likes",
  shares: "shares",
  comments: "comments",
};

/**
 * Stable sort plus filters. Nulls sort last, so a board of skeleton tiles keeps its ranked order
 * whatever the sort, and the platform filter (which every tile has) still works visibly.
 */
export function applyRubricFilters(
  videos: SimRubricVideo[],
  filters: SimFilterState,
  now: number = Date.now(),
): SimRubricVideo[] {
  const platforms = filters.platforms;
  const kept = videos.filter((video) => {
    const platform = video.card?.platform;
    if (platforms.length > 0 && platform && !platforms.includes(platform)) return false;
    return withinWindow(video.card, filters.date_filter, now);
  });

  const metric = SORT_METRIC[filters.sort];
  if (!metric && filters.sort !== "newest") return kept;

  const value = (video: SimRubricVideo): number | null => {
    if (filters.sort === "newest") {
      const date = video.card?.published_at ? Date.parse(video.card.published_at) : NaN;
      return Number.isNaN(date) ? null : date;
    }
    return video.card?.metrics[metric as MetricKey] ?? null;
  };

  return kept
    .map((video, index) => ({ video, index, value: value(video) }))
    .sort((a, b) => {
      if (a.value == null && b.value == null) return a.index - b.index;
      if (a.value == null) return 1;
      if (b.value == null) return -1;
      return b.value - a.value || a.index - b.index;
    })
    .map((entry) => entry.video);
}

/** Elapsed label of the first worker task in a transcript, for copy outside the frame. */
export function workerElapsed(messages: { kind: string; elapsed?: string }[]): string | null {
  for (const message of messages) if (message.kind === "worker_task" && message.elapsed) return message.elapsed;
  return null;
}
