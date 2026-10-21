/**
 * Every piece of Viral Now copy that depends on where the data came from, in one place.
 *
 * The page renders one of three sources: the bundled seed snapshot (a single ranking taken on
 * one day, scored on engagement), live public boards (refreshed daily by the pipeline and
 * scored on analysis plus reach), or the trending feed. Time words are only used for the
 * sources they are true for: "refreshed daily" is live-only. The status line names the ranking week
 * only ("Week 2 of Oct 2026"; owner, 2026-10-19: the boards are run weekly, keep it clean).
 *
 * Pure functions, UTC dates only, so the server render and the client hydration agree.
 */
import { formatShortDate, formatUtcStamp, formatWeekOfMonth } from "./format";
import { BOARD_SIZE } from "./ranking";
import type { ViralNowSource } from "./types";

/** What the page is showing: one source for every niche, or a mix of live and snapshot boards. */
export type BoardKind = "seed" | "live" | "mixed" | "trending";

export interface BoardState {
  kind: BoardKind;
  /** Monday (UTC) of the ranking week, YYYY-MM-DD. */
  weekOf: string | null;
  /** ISO timestamp. Snapshot: when it was taken. Live and mixed: the latest board refresh. */
  at: string | null;
  niches: number;
  liveNiches: number;
}

export function boardKind(sources: ViralNowSource[]): BoardKind {
  if (sources.some((source) => source === "trending")) return "trending";
  const live = sources.filter((source) => source === "live").length;
  if (live === 0) return "seed";
  return live === sources.length ? "live" : "mixed";
}

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/** The mono line above the headline: the ranking week, "Week 2 of Oct 2026" (the trending feed has none). */
export function statusText(board: BoardState): string {
  switch (board.kind) {
    case "seed":
    case "live":
    case "mixed":
      return formatWeekOfMonth(board.weekOf) ?? "";
    case "trending": {
      const stamp = formatUtcStamp(board.at);
      return ["Trending feed", stamp ? `updated ${stamp}` : null].filter(Boolean).join(" · ");
    }
  }
}

/** The sentence under the headline. */
export function sublineText(board: BoardState): string {
  const week = formatShortDate(board.weekOf);
  switch (board.kind) {
    case "seed":
      return `Up to ${BOARD_SIZE} short videos in each of ${board.niches} niches${week ? ` for the week of ${week}` : ""}, ranked by ContHunt on reach, engagement, velocity and recency.`;
    case "live":
      return `The top ${BOARD_SIZE} short videos this week in ${board.niches} niches, refreshed daily and ranked by ContHunt.`;
    case "mixed":
      return `The top short videos of the week in ${board.niches} niches. ${plural(board.liveNiches, "board is", "boards are")} live and refreshed daily, the rest come from a snapshot.`;
    case "trending":
      return "What is trending right now on short-form platforms, in the order the feed returns it.";
  }
}

/** Under a niche name, in a row (`style: "row"`) or above its grid (`style: "grid"`). */
export function countLabel(
  niche: { source: ViralNowSource; week_of: string | null },
  size: number,
  style: "row" | "grid",
): string {
  const count = style === "row" && size >= BOARD_SIZE ? `Top ${BOARD_SIZE}` : plural(size, "video", "videos");
  if (niche.source === "live") return `${count} this week`;
  if (niche.source === "seed") {
    const week = formatShortDate(niche.week_of);
    return week ? `${count} · week of ${week}` : count;
  }
  return `${count} right now`;
}

/** Meta description. Runs on the server, which always renders the snapshot. */
export function snapshotDescription(args: { niches: number; weekOf: string | null; nicheName?: string; count?: number }): string {
  const week = formatShortDate(args.weekOf);
  const when = week ? ` for the week of ${week}` : "";
  const how = "ranked by ContHunt on reach, engagement, velocity and recency";
  return args.nicheName
    ? `The top ${args.count ?? BOARD_SIZE} viral short-form videos in ${args.nicheName}${when}, ${how}.`
    : `The top viral short-form videos in ${args.niches} niches${when}, ${how}.`;
}

/** Shown when no board of any source could be loaded. */
export const EMPTY_BOARDS = {
  title: "No boards are published yet.",
  body: "Boards appear here as soon as they are published. In the meantime you can run a deep search on any niche.",
} as const;

/** One line in the ranking explainer for the snapshot. */
export function snapshotNote(takenAt: string | null): string {
  const taken = formatShortDate(takenAt);
  return taken
    ? `Snapshot taken ${taken}. View and like counts are from that day and do not change.`
    : "This is a snapshot. View and like counts are from the day it was taken and do not change.";
}

/** Under the metrics in the video dialog, for snapshot videos. */
export function countsCaption(asOf: string | null): string {
  const day = formatShortDate(asOf);
  return day ? `Counts as of ${day}.` : "Counts from the snapshot.";
}
