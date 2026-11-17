/**
 * Reconciled plan data for the pricing section, the /pricing page and the calculator.
 * Pure module: safe to import from server and client components.
 *
 * Three plans, cheapest first: Pro ($29), Creator ($79) and Research ($189). The app's Free plan is a
 * silent fallback and never appears on the site. Allowances must match the app and backend exactly.
 *
 * Sources and rules:
 * - One credit is $0.00188 of provider cost. Hunt credits are one pool that searches and tracking both
 *   spend (a search costs one hunt credit per platform it queries, a tracked item one per refresh).
 * - Yearly and monthly billing get the same credits; only the price differs.
 * - Prices: Pro $300/yr ($25/mo), Creator $756/yr ($63/mo), Research $151/mo yearly.
 * - Trial allowances are 7/30 of the month, rounded up to the nearest 500.
 * - Features are a ladder: the entry plan lists its base, the others list only what they add.
 * - An analyzed video is planned at 7 AI credits. Measured production use is lower (base analysis about
 *   3, a full Deep Search about 6.6 per video), so the figure already carries the headroom.
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
  /** Smaller allowance during the 7-day trial (7/30 of the month, rounded up to 500). */
  trial: Allowance;
  /** Heading over the feature list: what the entry plan includes, or the plan this one builds on. */
  includes: string;
  /** What this plan adds over the plan below it (the entry plan lists its base). */
  features: readonly PlanFeature[];
}

// ---------------------------------------------------------------- credits math

/** Planning figure for AI credits per analyzed video, headroom included. */
export const CREDITS_PER_VIDEO = 7;

/** Planning estimate for AI credits spent analyzing `videos` videos. */
export const estimateAiCredits = (videos: number): number => CREDITS_PER_VIDEO * videos;

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

/** Trial allowance: the share of a 30-day month that the trial covers, rounded up to the nearest 500. */
const trialOf = (a: Allowance): Allowance => {
  const share = (credits: number) => Math.ceil((credits * TRIAL_DAYS) / 30 / 500) * 500;
  return { huntCredits: share(a.huntCredits), aiCredits: share(a.aiCredits) };
};

const PRO_ALLOWANCE: Allowance = { huntCredits: 1_000, aiCredits: 7_000 };
const CREATOR_ALLOWANCE: Allowance = { huntCredits: 3_000, aiCredits: 20_000 };
const RESEARCH_ALLOWANCE: Allowance = { huntCredits: 7_000, aiCredits: 53_500 };

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
