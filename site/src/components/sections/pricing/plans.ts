/**
 * Reconciled plan data for the pricing section, the /pricing page and the calculator.
 * Pure module: safe to import from server and client components.
 *
 * Pricing revision 3 (owner, 2026-10-18). Three plans, cheapest first: Pro ($29), Creator ($79) and
 * Research ($189). The app's Free plan is a silent fallback and never appears on the site.
 *
 * The owner gave rev 3 in two steps, and the order matters because two names swap places:
 *   1. New allowances and features, under the rev 2 names (Creator $29, Pro $79, Research):
 *      - Creator: 2 daily agents (was AI boards), Deep Search (x200), MCP access, mid-tier AI models,
 *        account tracking; 600 hunt credits, 3,000 AI credits.
 *      - Pro: everything in Creator plus 5 daily agents, frontier models, Deep Search (x500);
 *        3,000 hunt credits (x5), 15,000 AI credits (x5).
 *      - Research ($149 -> $189): 25 daily agents, Deep Search (x500), Deep Search (x1,000) coming soon,
 *        experimental features; 12,000 hunt credits (x20), 60,000 AI credits (x20).
 *   2. Then the names move by position: the first plan is renamed Pro, the second Creator, the third
 *      stays Research. Ids follow the names, and each "Everything in …, plus" names the new plan below.
 * Owner, 2026-10-19: "Account tracking" is "Competitor tracking", Pro no longer lists the platforms, and new blurbs.
 *
 * Sources and rules:
 * - Hunt credits replace the separate search and tracking allowances: one pool that both spend (a search
 *   costs one hunt credit per platform it queries, a tracked item one per refresh, as the two meters did).
 * - Prices: Pro and Creator keep the app fixtures ($300/yr = $25/mo, $756/yr = $63/mo). Research's yearly
 *   price ($151/mo) keeps its old 20% yearly saving on the new $189 (owner to confirm).
 * - Trial allowances are 7/30 of the month, the rule the app's `_TRIALS` follow; rev 3 sets none yet.
 * - No struck list prices since rev 3 (the new card head shows the price alone).
 * - Features are a ladder: the entry plan lists its base, the others list only what they add.
 * - The credit-to-video conversion is the app's own planning estimator
 *   (`frontend/src/lib/researchBudget.ts`: 4 x (videos + ceil(videos / 10))).
 */
import { GET_STARTED_URL } from "@/lib/links";

export const PLAN_IDS = ["pro", "creator", "research"] as const;
export type PlanId = (typeof PLAN_IDS)[number];
/** Identity hue of a plan, from the owner's card-head art (2026-10-18): Pro purple, Creator red, Research blue. */
export type PlanHue = "purple" | "red" | "blue";
export type Billing = "yearly" | "monthly";

export interface PlanFeature {
  /** Key figure, set in the value weight (e.g. "25"). */
  lead?: string;
  text: string;
  /** Fuller wording for the /pricing card. Falls back to `text`. */
  full?: string;
  /** Small status chip after the text (e.g. "Coming soon"). */
  badge?: string;
}

/** One row of the allowance spec: label, value and an optional note on the /pricing card. */
export interface AllowanceRow {
  key: "huntCredits" | "aiCredits";
  label: string;
  value: number;
  note?: string;
}

export interface Allowance {
  /** One pool for searches and tracking. */
  huntCredits: number;
  aiCredits: number;
}

export interface Plan {
  id: PlanId;
  name: string;
  /** Small tag on the card head ("Most popular", "Best value"). */
  tag: string | null;
  /** The highlighted plan. Exactly one. */
  featured: boolean;
  /** Identity hue. */
  hue: PlanHue;
  blurb: string;
  /** Per month, in USD. Yearly is the per-month price when billed yearly. */
  price: { monthly: number; yearly: number };
  trialDays: number;
  cta: { label: string; href: string };
  /** Monthly allowance. */
  allowance: Allowance;
  /** Smaller allowance during the 7-day trial (7/30 of the month). */
  trial: Allowance;
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

export const TRIAL_DAYS = 7;

/** The entry plan's monthly allowance; Creator is 5x it and Research 20x (owner, rev 3). */
const ENTRY_ALLOWANCE: Allowance = { huntCredits: 600, aiCredits: 3_000 };
const times = (n: number): Allowance => ({
  huntCredits: ENTRY_ALLOWANCE.huntCredits * n,
  aiCredits: ENTRY_ALLOWANCE.aiCredits * n,
});
/** Trial allowance: the share of a 30-day month that the trial covers. */
const trialOf = (a: Allowance): Allowance => ({
  huntCredits: Math.round((a.huntCredits * TRIAL_DAYS) / 30),
  aiCredits: Math.round((a.aiCredits * TRIAL_DAYS) / 30),
});

const PRO_ALLOWANCE = times(1); // 600 hunt credits, 3,000 AI credits
const CREATOR_ALLOWANCE = times(5); // 3,000 hunt credits, 15,000 AI credits
const RESEARCH_ALLOWANCE = times(20); // 12,000 hunt credits, 60,000 AI credits

export const PLANS: readonly Plan[] = [
  {
    id: "pro",
    name: "Pro",
    tag: null,
    featured: false,
    hue: "purple",
    blurb: "For starters to taste content intelligence.",
    price: { monthly: 29, yearly: 25 },
    trialDays: TRIAL_DAYS,
    cta: { label: "Start free trial", href: GET_STARTED_URL },
    allowance: PRO_ALLOWANCE,
    trial: trialOf(PRO_ALLOWANCE),
    includes: "Includes",
    features: [
      { lead: "2", text: "daily agents" },
      { text: "Deep Search (×200)" },
      { text: "MCP access" },
      { text: "Mid-tier AI models" },
      { text: "Competitor tracking" },
    ],
  },
  {
    id: "creator",
    name: "Creator",
    tag: "Most popular",
    featured: true,
    hue: "red",
    blurb: "For professionals who want full access to content intelligence.",
    price: { monthly: 79, yearly: 63 },
    trialDays: TRIAL_DAYS,
    cta: { label: "Start free trial", href: GET_STARTED_URL },
    allowance: CREATOR_ALLOWANCE,
    trial: trialOf(CREATOR_ALLOWANCE),
    includes: "Everything in Pro, plus",
    features: [
      { lead: "5", text: "daily agents" },
      { text: "Frontier AI models" },
      { text: "Deep Search (×500)" },
      { text: "Upcoming platforms as they launch" },
    ],
  },
  {
    id: "research",
    name: "Research",
    tag: "Best value",
    featured: false,
    hue: "blue",
    blurb: "For agencies and brands researching multiple niches every day.",
    price: { monthly: 189, yearly: 151 },
    trialDays: TRIAL_DAYS,
    cta: { label: "Start free trial", href: GET_STARTED_URL },
    allowance: RESEARCH_ALLOWANCE,
    trial: trialOf(RESEARCH_ALLOWANCE),
    includes: "Everything in Creator, plus",
    features: [
      { lead: "25", text: "daily agents" },
      { text: "Deep Search (×500)" },
      { text: "Deep Search (×1,000)", badge: "Coming soon" },
      { text: "Access to experimental features" },
    ],
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = {
  pro: PLANS[0],
  creator: PLANS[1],
  research: PLANS[2],
};

/** By name. Since rev 3, Pro is the entry plan and Creator the middle one: use PLANS order for "cheapest first". */
export const PRO = PLAN_BY_ID.pro;
export const CREATOR = PLAN_BY_ID.creator;
export const RESEARCH = PLAN_BY_ID.research;

// -------------------------------------------------------------------- helpers

/** Per-month price for the billing period. */
export const monthlyPrice = (plan: Plan, billing: Billing): number => plan.price[billing];

/** What a yearly plan is charged once a year. */
export const yearlyTotal = (plan: Plan): number => plan.price.yearly * 12;

/** Yearly vs monthly saving as a whole percent (Pro 14, Creator 20, Research 20). */
export function yearlySavingPct(plan: Plan): number {
  return Math.round((1 - plan.price.yearly / plan.price.monthly) * 100);
}

/** Dollars saved per year by choosing yearly over monthly (Pro $48, Creator $192, Research $456). */
export const yearlySavingUsd = (plan: Plan): number => plan.price.monthly * 12 - yearlyTotal(plan);

/** The largest yearly saving across plans, for the "Save up to N%" chip. */
export const MAX_YEARLY_SAVING_PCT = Math.max(...PLANS.map(yearlySavingPct));

export const allowanceRows = (plan: Plan): AllowanceRow[] => {
  const { huntCredits, aiCredits } = plan.allowance;
  return [
    { key: "huntCredits", label: "Hunt credits", value: huntCredits, note: "for searches and tracking" },
    {
      key: "aiCredits",
      label: "AI credits",
      value: aiCredits,
      note: `about ${formatInt(approx(videosForCredits(aiCredits)))} videos analyzed`,
    },
  ];
};
