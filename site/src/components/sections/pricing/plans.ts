/**
 * Reconciled plan data for the pricing section, the /pricing page and the calculator.
 * Pure module: safe to import from server and client components.
 *
 * Pricing revision 2 (docs/revamp/sections/pricing-rev2.md, owner feedback 2026-10-16): exactly three
 * plans are shown, Creator ($29), Pro ($79) and Research ($149). The app's Free plan is a silent
 * fallback and never appears on the site: no card, no comparison column, no calculator option.
 *
 * Sources:
 * - Names, prices, struck prices, retained feature items: legacy `src/content/site/pricing.ts`
 *   (left untouched; "Pro Research" there is now "Pro" here). Prices match the app fixtures
 *   ($300/yr = $25/mo, $756/yr = $63/mo; Research $1,428/yr = $119/mo).
 * - Creator and Pro allowances (searches, AI credits, tracking credits): app
 *   `backend/app/services/plan_wallets.py` `_PLANS`; trial allowances `_TRIALS`.
 * - Research allowances and trial are extrapolated from the Creator to Pro step (owner's rule: each
 *   allowance grows a little faster than the price and is never a clean multiple). The app has no
 *   Research plan yet; the numbers are in OWNER_DECISIONS C4.
 * - Struck prices ($49, $139, $259) have NO source in the app (OWNER_DECISIONS C5). Rev 4 shows each once,
 *   quietly struck beside the price, and derives no percentage from them: the only percentage on a card
 *   is the yearly saving, computed here, never typed.
 * - Features (Rev 4) are a ladder: Creator lists its base, Pro and Research list only what they add.
 * - The credit-to-video conversion is the app's own planning estimator
 *   (`frontend/src/lib/researchBudget.ts`: 4 x (videos + ceil(videos / 10))).
 */
import { GET_STARTED_URL } from "@/lib/links";

export const PLAN_IDS = ["creator", "pro", "research"] as const;
export type PlanId = (typeof PLAN_IDS)[number];
/** Identity hue of a plan card (docs/revamp/COLOR_SYSTEM.md, Pricing): Creator pink, Pro the spectrum on night, Research blue. */
export type PlanHue = "pink" | "purple" | "blue";
export type Billing = "yearly" | "monthly";

export interface PlanFeature {
  /** Key figure, set in the value weight (e.g. "25"). */
  lead?: string;
  text: string;
  /** Fuller wording for the /pricing card. Falls back to `text`. */
  full?: string;
}

/** One row of the allowance spec: label, value and an optional note on the /pricing card. */
export interface AllowanceRow {
  key: "searches" | "aiCredits" | "trackingCredits";
  label: string;
  value: number;
  note?: string;
}

export interface Allowance {
  searches: number;
  aiCredits: number;
  trackingCredits: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  /** Small tag in the card's header row ("Most popular", "Best value"). */
  tag: string | null;
  /** The highlighted card (dark aurora surface, spectrum ring, spectrum tag, white CTA). Exactly one plan. */
  featured: boolean;
  /** Identity hue. The featured plan is purple, the middle of its spectrum. */
  hue: PlanHue;
  blurb: string;
  /** Per month, in USD. Yearly is the per-month price when billed yearly. */
  price: { monthly: number; yearly: number };
  /** Struck-through list price (per month). Null when none is shown. */
  listPrice: number | null;
  trialDays: number;
  cta: { label: string; href: string };
  /** Monthly allowance. */
  allowance: Allowance;
  /** Smaller allowance during the 7-day trial (app `_TRIALS`). Tracking is zero in trials. */
  trial: { searches: number; aiCredits: number };
  /** Heading over the feature list: what the entry plan includes, or the plan this one builds on. */
  includes: string;
  /** What this plan adds over the plan below it (the entry plan lists its base). */
  features: readonly PlanFeature[];
}

// ---------------------------------------------------------------- credits math

/** App planning estimate for AI credits spent analyzing `videos` videos, including the normal 10% buffer. */
export const estimateAiCredits = (videos: number): number => 4 * (videos + Math.ceil(videos / 10));

/** Credits per video implied by the estimator, for 500 videos (4 x 550 / 500 = 4.4). */
export const CREDITS_PER_VIDEO = estimateAiCredits(500) / 500;

/** Videos a credit balance covers under the planning estimate. */
export const videosForCredits = (credits: number): number => Math.floor(credits / CREDITS_PER_VIDEO);

/** One keyword search runs on three platforms and the app meters each platform as one unit. */
export const PLATFORM_UNITS_PER_KEYWORD_SEARCH = 3;

/** Rounds a figure down to a "friendly" approximate (1,136 -> 1,100). */
export const approx = (n: number): number => {
  if (n < 100) return Math.floor(n);
  const magnitude = 10 ** (Math.floor(Math.log10(n)) - 1);
  return Math.floor(n / magnitude) * magnitude;
};

export const formatInt = (n: number): string => Math.round(n).toLocaleString("en-US");

// ---------------------------------------------------------------------- plans

const PRO_ALLOWANCE: Allowance = { searches: 900, aiCredits: 15_000, trackingCredits: 5_000 };
const RESEARCH_ALLOWANCE: Allowance = { searches: 1_900, aiCredits: 32_000, trackingCredits: 12_000 };

/** The smallest step from one monthly allowance to another, across searches, AI credits and tracking. */
export function minAllowanceRatio(from: Allowance, to: Allowance): number {
  const keys = ["searches", "aiCredits", "trackingCredits"] as const;
  return Math.min(...keys.map((k) => to[k] / from[k]));
}

/**
 * Research's second line is computed, never typed: it shows only while every Research limit is more than
 * double Pro's (today 2.11x searches, 2.13x AI credits and 2.4x tracking).
 */
const RESEARCH_OVER_PRO: PlanFeature[] =
  minAllowanceRatio(PRO_ALLOWANCE, RESEARCH_ALLOWANCE) > 2 ? [{ text: "More than double Pro's monthly allowance" }] : [];

export const PLANS: readonly Plan[] = [
  {
    id: "creator",
    name: "Creator",
    tag: null,
    featured: false,
    hue: "pink",
    blurb: "For marketers and creators who research every week.",
    price: { monthly: 29, yearly: 25 },
    listPrice: 49,
    trialDays: 7,
    cta: { label: "Start free trial", href: GET_STARTED_URL },
    allowance: { searches: 300, aiCredits: 5_000, trackingCredits: 1_500 },
    trial: { searches: 70, aiCredits: 1_166 },
    includes: "Includes",
    features: [
      { lead: "5", text: "AI boards" },
      { text: "Deep Search and all AI features" },
      { text: "Latest AI models" },
      { text: "TikTok, Reels and Shorts", full: "TikTok, Instagram Reels and YouTube Shorts" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tag: "Most popular",
    featured: true,
    hue: "purple",
    blurb: "For growing teams who research at volume.",
    price: { monthly: 79, yearly: 63 },
    listPrice: 139,
    trialDays: 7,
    cta: { label: "Start free trial", href: GET_STARTED_URL },
    allowance: PRO_ALLOWANCE,
    trial: { searches: 210, aiCredits: 3_500 },
    includes: "Everything in Creator, plus",
    features: [
      { lead: "25", text: "AI boards" },
      { text: "Upcoming platforms as they launch" },
    ],
  },
  {
    id: "research",
    name: "Research",
    tag: "Best value",
    featured: false,
    hue: "blue",
    blurb: "For agencies and brands researching many niches every day.",
    price: { monthly: 149, yearly: 119 },
    listPrice: 259,
    trialDays: 7,
    cta: { label: "Start free trial", href: GET_STARTED_URL },
    allowance: RESEARCH_ALLOWANCE,
    trial: { searches: 440, aiCredits: 7_500 },
    includes: "Everything in Pro, plus",
    features: [{ lead: "60", text: "AI boards" }, ...RESEARCH_OVER_PRO],
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = {
  creator: PLANS[0],
  pro: PLANS[1],
  research: PLANS[2],
};

export const CREATOR = PLAN_BY_ID.creator;
export const PRO = PLAN_BY_ID.pro;
export const RESEARCH = PLAN_BY_ID.research;

export const TRIAL_DAYS = 7;

// -------------------------------------------------------------------- helpers

/** Per-month price for the billing period. */
export const monthlyPrice = (plan: Plan, billing: Billing): number => plan.price[billing];

/** What a yearly plan is charged once a year. */
export const yearlyTotal = (plan: Plan): number => plan.price.yearly * 12;

/** Yearly vs monthly saving as a whole percent (Creator 14, Pro 20, Research 20). */
export function yearlySavingPct(plan: Plan): number {
  return Math.round((1 - plan.price.yearly / plan.price.monthly) * 100);
}

/** Dollars saved per year by choosing yearly over monthly (Creator $48, Pro $192, Research $360). */
export const yearlySavingUsd = (plan: Plan): number => plan.price.monthly * 12 - yearlyTotal(plan);

/** The largest yearly saving across plans, for the "Save up to N%" chip. */
export const MAX_YEARLY_SAVING_PCT = Math.max(...PLANS.map(yearlySavingPct));

export const allowanceRows = (plan: Plan): AllowanceRow[] => {
  const { searches, aiCredits, trackingCredits } = plan.allowance;
  return [
    { key: "searches", label: "Searches", value: searches },
    {
      key: "aiCredits",
      label: "AI credits",
      value: aiCredits,
      note: `about ${formatInt(approx(videosForCredits(aiCredits)))} videos analyzed`,
    },
    { key: "trackingCredits", label: "Tracking credits", value: trackingCredits },
  ];
};
