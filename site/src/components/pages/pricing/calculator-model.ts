/**
 * Pricing calculator math. Pure functions, no React, so the numbers can be
 * checked in isolation (type-stripped under node: plans.ts and this file have no browser imports).
 *
 * Where each number comes from:
 * - Plan allowances: `sections/pricing/plans.ts` (pricing rev 3: hunt credits and AI credits per plan).
 * - Recommendation: the smallest plan, in `PLANS` order (cheapest first), whose limits hold the usage
 *   with headroom left. When none does, it stays on the largest plan and reports the share it covers.
 * - AI credits per run: the app's own planning estimate, 4 x (videos + ceil(videos / 10)),
 *   from `frontend/src/lib/researchBudget.ts`. It already includes a 10% video buffer.
 * - Hunt credits: one pool that searches and tracking both spend. Every keyword search runs on three
 *   platforms and costs one hunt credit per platform (`searchCreditEstimate: searches * 3`); tracking
 *   costs the credits below. `Usage` keeps both parts (`searchUnits`, `trackingCredits`) as the
 *   breakdown and adds them up as `huntCredits`.
 * - Keyword searches per Deep Search: modeled as one per `videosPerKeywordSearch` videos
 *   (default 50, so a 500-video Deep Search is 10 searches). An editable assumption, not an app rule.
 * - Tracking: the app's tracking estimator charges one credit for the first refresh and one
 *   per day for the 30-day window, per tracked account or video (`tracking/schedule.py`).
 * - Time saved: videos x minutes per video / 60 - runs x run minutes / 60. Minutes per video,
 *   run minutes and hourly rate are editable assumptions with the defaults from the brief.
 *
 * Nothing here is a promise. The UI says so next to the numbers.
 */
import {
  PLANS,
  PLATFORM_UNITS_PER_KEYWORD_SEARCH,
  estimateAiCredits,
  type Plan,
} from "@/components/sections/pricing/plans";

export const VIDEO_STOPS = [100, 200, 500, 1000] as const;
export const DEEP_SEARCH_MIN = 1;
export const DEEP_SEARCH_MAX = 12;
export const TRACKED_MIN = 5;
export const TRACKED_MAX = 150;
export const TRACKED_STEP = 5;
/** App tracking window: first refresh plus one per day over 30 days. */
export const TRACKING_CREDITS_PER_ITEM = 30;
/** Hours of watching in one working day, for the calendar picture. */
export const WORKDAY_HOURS = 8;
/** Share of a plan's credits we keep free for follow-up chat and re-runs. */
export const HEADROOM = 0.15;
/** Agents ask follow-ups on their own, so we keep more room when MCP / agents is selected. */
export const HEADROOM_AGENTS = 0.3;

export interface CalcInputs {
  deepSearches: number;
  videosPerSearch: number;
  tracking: boolean;
  trackedItems: number;
  agents: boolean;
}

export interface Assumptions {
  minutesPerVideo: number;
  hourlyRate: number;
  runMinutes: number;
  videosPerKeywordSearch: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  minutesPerVideo: 2.5,
  hourlyRate: 40,
  runMinutes: 5,
  videosPerKeywordSearch: 50,
};

export const DEFAULT_INPUTS: CalcInputs = {
  deepSearches: 4,
  videosPerSearch: 200,
  tracking: false,
  trackedItems: 25,
  agents: false,
};

// ------------------------------------------------------------------ use cases

export type UseCaseId = "product" | "hooks" | "competitors" | "ugc" | "radar" | "agency";

export interface UseCase {
  id: UseCaseId;
  label: string;
  hint: string;
  /** Starting point for the sliders, never a limit. */
  preset: { deepSearches: number; videosPerSearch: number; trackedItems?: number; tracking?: boolean; agents?: boolean };
}

export const USE_CASES: readonly UseCase[] = [
  { id: "product", label: "Product research", hint: "What's moving in a category", preset: { deepSearches: 2, videosPerSearch: 500 } },
  { id: "hooks", label: "Hook & ad research", hint: "Hooks worth borrowing", preset: { deepSearches: 4, videosPerSearch: 200 } },
  {
    id: "competitors",
    label: "Competitor tracking",
    hint: "Rival accounts, day by day",
    preset: { deepSearches: 1, videosPerSearch: 200, tracking: true, trackedItems: 25 },
  },
  { id: "ugc", label: "UGC creator sourcing", hint: "Creators worth a message", preset: { deepSearches: 2, videosPerSearch: 200 } },
  { id: "radar", label: "Niche trend radar", hint: "A weekly pulse on your niche", preset: { deepSearches: 4, videosPerSearch: 100 } },
  {
    id: "agency",
    label: "Agency client work",
    hint: "The same research, per client",
    preset: { deepSearches: 6, videosPerSearch: 500, agents: true },
  },
] as const;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Snap to the nearest video stop that is not below `videos` (so a blend never under-counts). */
const snapStop = (videos: number): number => VIDEO_STOPS.find((s) => s >= videos) ?? VIDEO_STOPS[VIDEO_STOPS.length - 1];

/**
 * Blends several selected use cases into slider values. Total videos are summed and expressed as
 * runs of the largest run size picked, so choosing Product research (2 x 500) and Hook research
 * (4 x 200) gives 1,800 videos, shown as 4 runs of 500.
 */
export function blendUseCases(selected: readonly UseCaseId[], fallback: CalcInputs): CalcInputs {
  const picked = USE_CASES.filter((u) => selected.includes(u.id));
  if (picked.length === 0) return fallback;
  const totalVideos = picked.reduce((sum, u) => sum + u.preset.deepSearches * u.preset.videosPerSearch, 0);
  const runSize = snapStop(Math.max(...picked.map((u) => u.preset.videosPerSearch)));
  const trackedItems = picked.reduce((sum, u) => sum + (u.preset.trackedItems ?? 0), 0);
  return {
    deepSearches: clamp(Math.round(totalVideos / runSize), DEEP_SEARCH_MIN, DEEP_SEARCH_MAX),
    videosPerSearch: runSize,
    tracking: picked.some((u) => u.preset.tracking),
    trackedItems: trackedItems > 0 ? clamp(trackedItems, TRACKED_MIN, TRACKED_MAX) : fallback.trackedItems,
    agents: picked.some((u) => u.preset.agents),
  };
}

// ---------------------------------------------------------------------- usage

export interface Usage {
  videos: number;
  keywordSearches: number;
  /** Hunt credits the searches spend: one per platform per keyword search. */
  searchUnits: number;
  /** Hunt credits tracking spends (0 when tracking is off). */
  trackingCredits: number;
  /** The hunt-credit pool both draw on: `searchUnits + trackingCredits`. */
  huntCredits: number;
  aiCredits: number;
}

export function computeUsage(inputs: CalcInputs, assumptions: Assumptions): Usage {
  const perRunSearches = Math.ceil(inputs.videosPerSearch / Math.max(1, assumptions.videosPerKeywordSearch));
  const keywordSearches = inputs.deepSearches * perRunSearches;
  const searchUnits = keywordSearches * PLATFORM_UNITS_PER_KEYWORD_SEARCH;
  const trackingCredits = inputs.tracking ? inputs.trackedItems * TRACKING_CREDITS_PER_ITEM : 0;
  return {
    videos: inputs.deepSearches * inputs.videosPerSearch,
    keywordSearches,
    searchUnits,
    trackingCredits,
    huntCredits: searchUnits + trackingCredits,
    aiCredits: inputs.deepSearches * estimateAiCredits(inputs.videosPerSearch),
  };
}

export type FitKey = "huntCredits" | "aiCredits";

export interface Fit {
  ratios: Record<FitKey, number>;
  /** Largest ratio: the dimension that runs out first. */
  max: number;
  binding: FitKey;
}

export function computeFit(plan: Plan, usage: Usage): Fit {
  const a = plan.allowance;
  const ratios: Record<FitKey, number> = {
    huntCredits: usage.huntCredits / a.huntCredits,
    aiCredits: usage.aiCredits / a.aiCredits,
  };
  const entries = Object.entries(ratios) as [FitKey, number][];
  const [binding, max] = entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best));
  return { ratios, max, binding };
}

export const FIT_LABEL: Record<FitKey, string> = {
  huntCredits: "hunt credits",
  aiCredits: "AI credits",
};

// ------------------------------------------------------------- recommendation

export interface PlanFit {
  plan: Plan;
  fit: Fit;
}

export interface Recommendation {
  plan: Plan;
  fit: Fit;
  /** The next cheaper plan in `PLANS` order (null when the entry plan is recommended), for the "why" line. */
  below: PlanFit | null;
  /** The next dearer plan in `PLANS` order (null when the largest plan is recommended), for the "why" line. */
  above: PlanFit | null;
  headroom: number;
  /** The cheaper plan was skipped only because it leaves less than the headroom. */
  belowTight: boolean;
  /**
   * Even the largest plan cannot hold the usage with headroom left. `coverage` tells the two cases apart:
   * below 1 the usage exceeds the plan; at 1 it fits, with less than the headroom to spare.
   */
  overMax: boolean;
  /** Share of the usage the recommended plan can cover (1 when it fits). */
  coverage: number;
}

export function recommend(inputs: CalcInputs, usage: Usage): Recommendation {
  const headroom = inputs.agents ? HEADROOM_AGENTS : HEADROOM;
  const fits: PlanFit[] = PLANS.map((plan) => ({ plan, fit: computeFit(plan, usage) }));
  const found = fits.findIndex(({ fit }) => fit.max <= 1 - headroom);
  const overMax = found === -1;
  const index = overMax ? fits.length - 1 : found;
  const chosen = fits[index];
  const below = index > 0 ? fits[index - 1] : null;
  const above = index < fits.length - 1 ? fits[index + 1] : null;
  return {
    plan: chosen.plan,
    fit: chosen.fit,
    below,
    above,
    headroom,
    belowTight: below !== null && below.fit.max <= 1,
    overMax,
    coverage: chosen.fit.max > 1 ? 1 / chosen.fit.max : 1,
  };
}

// ----------------------------------------------------------------------- time

export interface TimeSaved {
  videosAnalyzed: number;
  runs: number;
  watchHours: number;
  runHours: number;
  hoursSaved: number;
  valueUsd: number;
  workdays: number;
}

/** Time saved for the part of the usage the plan can actually cover. */
export function computeTime(inputs: CalcInputs, usage: Usage, coverage: number, a: Assumptions): TimeSaved {
  const videosAnalyzed = usage.videos * coverage;
  const runs = inputs.deepSearches * coverage;
  const watchHours = (videosAnalyzed * a.minutesPerVideo) / 60;
  const runHours = (runs * a.runMinutes) / 60;
  const hoursSaved = Math.max(0, watchHours - runHours);
  return {
    videosAnalyzed,
    runs,
    watchHours,
    runHours,
    hoursSaved,
    valueUsd: hoursSaved * a.hourlyRate,
    workdays: watchHours / WORKDAY_HOURS,
  };
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

/**
 * The playful line: when you would finish watching by hand, starting Monday morning.
 * `short` drops the "Starting Monday" lead-in so a late-week answer stays on one line in a narrow column.
 */
export function watchLine(workdays: number, short = false): string {
  if (workdays < 0.06) return "Done before your coffee cools.";
  if (workdays <= 0.5) return "About half a workday of watching.";
  const daysNeeded = Math.ceil(workdays - 1e-9);
  if (daysNeeded === 1) return "That's a full Monday gone to watching.";
  const day = WEEKDAYS[(daysNeeded - 1) % 5];
  const week = Math.floor((daysNeeded - 1) / 5) + 1;
  if (short && week > 1) return `You'd still be watching on ${day} of week ${week}.`;
  return week === 1
    ? `Starting Monday, you'd still be watching on ${day}.`
    : `Starting Monday, you'd still be watching on ${day} of week ${week}.`;
}

/** Hours with one decimal under 10, whole above. */
export const formatHours = (h: number): string => (h < 10 ? h.toFixed(1) : String(Math.round(h)));
