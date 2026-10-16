/**
 * How a Viral Now score is made, in words and weights.
 *
 * The weights are the ones the seed snapshot was ranked with (see `ranking.formula` in
 * src/content/viral-now/seed.json):
 *   score = 100 * (0.45*norm(log10(views+1)) + 0.25*norm(engagement_rate)
 *                  + 0.20*norm(views_per_day) + 0.10*norm(recency)),
 * min-max normalized inside each niche, at most 3 videos per creator.
 * Live boards are ranked by the pipeline in docs/revamp/specs/viral-now-spec.md; their
 * public wording stays generic until that blend is final.
 *
 * Wording that depends on the board's age (snapshot date, "updated at") lives in ./copy.ts.
 */
import type { ViralNowSource } from "./types";

export type IngredientKey = "reach" | "engagement" | "velocity" | "recency";

export interface RankingIngredient {
  key: IngredientKey;
  label: string;
  /** Share of the score, 0 to 100. */
  weight: number;
  /** One line: what is measured. */
  measures: string;
  /** One line: why it is in the blend. */
  why: string;
}

export const SEED_INGREDIENTS: readonly RankingIngredient[] = [
  {
    key: "reach",
    label: "Reach",
    weight: 45,
    measures: "Views, on a log scale.",
    why: "A 50M outlier does not flatten everything else in the niche.",
  },
  {
    key: "engagement",
    label: "Engagement",
    weight: 25,
    measures: "Likes, comments and shares per view.",
    why: "Separates videos people react to from videos they only scroll past.",
  },
  {
    key: "velocity",
    label: "Velocity",
    weight: 20,
    measures: "Views per day since posting.",
    why: "A video that took two days beats one that took two weeks to get there.",
  },
  {
    key: "recency",
    label: "Recency",
    weight: 10,
    measures: "How recently it was posted.",
    why: "Keeps the board on the week it covers, not on last month.",
  },
] as const;

/** Maximum videos per creator in one niche board. */
export const MAX_PER_CREATOR = 3;

/** Videos per niche board. */
export const BOARD_SIZE = 30;

export function rankingSummary(source: ViralNowSource | "mixed"): string {
  if (source === "seed") {
    return "Each niche is scored against itself. The score blends reach, engagement, velocity and recency, and no creator takes more than three spots.";
  }
  if (source === "live") {
    return "Live boards are scored from each video's saved ContHunt analysis plus its audience reach, then ranked inside the niche.";
  }
  if (source === "mixed") {
    return "Live boards are scored from each video's saved ContHunt analysis plus its audience reach. Niches without a live board show the snapshot, scored on reach, engagement, velocity and recency.";
  }
  return "Trending videos are listed in the order the feed returns them. They carry no score.";
}

/** Short note for the dialog under the score. */
export function rankSourceNote(source: ViralNowSource, rank: number, nicheName: string): string {
  if (source === "seed") {
    return `Ranked #${rank} in ${nicheName} by an engagement-weighted score: reach, engagement rate, views per day and recency, normalized inside the niche.`;
  }
  if (source === "live") {
    return `Ranked #${rank} in ${nicheName} by ContHunt's score: analyzed video quality plus audience reach.`;
  }
  return `#${rank} on today's trending feed. Trending videos are not scored.`;
}
