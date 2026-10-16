/**
 * Hero data: owner-editable constants, the typed prompt sets and precomputed
 * chart geometry. Everything the hero shows comes from here.
 */
import { curveMonotoneX, area as d3area, line as d3line } from "d3-shape";
import rawPrompts from "@/content/media/hero-prompts.json";

/* ------------------------------------------------------------------------ */
/* Owner-editable copy and numbers (from the owner's sketch, node UgHZX).    */
/* Change these freely; the count-up animation reads them.                   */
/* ------------------------------------------------------------------------ */

/** Subtext chips: "Search through [7 platforms] across [104,862 niches] and over [10,384,719 videos] updated daily." (owner-set figures, 2026-10-16) */
export const HERO_STATS = {
  platforms: { value: 7, suffix: "", label: "platforms" },
  niches: { value: 104_862, suffix: "", label: "niches" },
  videos: { value: 10_384_719, suffix: "", label: "videos" },
} as const;

/** Seconds between prompt changes (owner brief: "every six seconds"). */
export const CYCLE_SECONDS = 6;
/** Reduced-motion cadence (crossfade instead of the board). */
export const CYCLE_SECONDS_REDUCED = 8;

/* ------------------------------------------------------------------------ */
/* Prompt sets                                                               */
/* ------------------------------------------------------------------------ */

export type Trend = "breakout" | "growth" | "decline";

export type ParamKey = "hook" | "relevance" | "engagement" | "velocity" | "trendFit" | "audience";

export interface HeroCard {
  rank: number;
  poster: string;
  video?: string;
  platform: string;
  creator: string;
  title: string;
  url: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  posted_at: string;
  hook: string;
  score: number;
  trend: Trend;
  series: number[];
  params: Record<ParamKey, number>;
  keywords: string[];
}

export interface PromptSet {
  prompt: string;
  cards: HeroCard[];
}

export const PROMPT_SETS = rawPrompts as PromptSet[];

/** Radar axes, clockwise from the top. Abbreviations fit the card back. */
export const PARAMS: { key: ParamKey; short: string; label: string }[] = [
  { key: "hook", short: "HOOK", label: "Hook" },
  { key: "relevance", short: "REL", label: "Relevance" },
  { key: "engagement", short: "ENG", label: "Engagement" },
  { key: "velocity", short: "VEL", label: "Velocity" },
  { key: "trendFit", short: "FIT", label: "Trend fit" },
  { key: "audience", short: "AUD", label: "Audience" },
];

export const TREND_LABEL: Record<Trend, string> = {
  breakout: "Breakout",
  growth: "Growing",
  decline: "Declining",
};

/**
 * Triangle layout: columns hold 1, 2, 3, 4 cards, left to right. Each entry is a
 * slot index into BOARD_CARDS[set].
 */
export const COLUMNS: number[][] = [[0], [1, 2], [3, 4, 5], [6, 7, 8, 9]];
export const SLOT_COUNT = 10;
/** Slots visible below 1024px (columns 1–3). */
export const COMPACT_SLOT_COUNT = 6;

/*
 * Poster sizes. Every hero poster exists at 360×640 (`<n>.webp`) and 240×427 (`<n>-sm.webp`,
 * the same frame). Below 1024px the cards are about 105–125px wide, so a phone at 1–2x
 * picks the 240 file and a 3x phone, a tablet or a desktop the 360 one. Every slot (and
 * the engine's preloads) uses the lead card's size, so a poster is one cached file wherever
 * it lands. Lead card width: 1.12 × (100vw − 2 × 20px gutter − 2 × 12px gap) / 3.12, capped
 * at 1.12 × 190px from 657px (hero.module.css .columns).
 */
export const HERO_POSTER_SIZES = "(max-width: 656px) calc((100vw - 64px) / 2.78), (max-width: 1023.98px) 213px, 360px";

/** `srcset` for a hero poster URL (`/media/hero/<set>/<n>.webp`). */
export const heroPosterSrcSet = (poster: string) => `${poster.replace(/\.webp$/, "-sm.webp")} 240w, ${poster} 360w`;

/** Column 4 rows that sit fully inside the stage (its top and bottom rows are cut). */
const MIDDLE_ROWS = [1, 2];

/**
 * The card each slot shows, per prompt set. Columns 1–3 (slots 0–5) are ranks
 * 1–6 in order, so scores fall to the right. Column 4 (slots 6–9) holds four
 * of the weakest results (ranks 7–12): up to two declining cards go in its two
 * middle rows, the ones a visitor can actually see, and the best remaining
 * ranks fill the top and bottom. That keeps the owner's "mix and match them and
 * place them clearly" true for every set. Each card keeps its real rank and score.
 */
function boardCards(set: PromptSet): HeroCard[] {
  const head = set.cards.slice(0, 6);
  const tail = set.cards.slice(6);
  if (tail.length < 4) return set.cards.slice(0, SLOT_COUNT);
  const declines = tail.filter((c) => c.trend === "decline").slice(0, MIDDLE_ROWS.length);
  const rest = tail.filter((c) => !declines.includes(c));
  const col: (HeroCard | undefined)[] = [undefined, undefined, undefined, undefined];
  declines.forEach((c, k) => (col[MIDDLE_ROWS[k]] = c));
  for (let r = 0; r < col.length; r++) col[r] ??= rest.shift();
  return [...head, ...(col as HeroCard[])];
}

export const BOARD_CARDS: HeroCard[][] = PROMPT_SETS.map(boardCards);

/* ------------------------------------------------------------------------ */
/* Formatting and chart geometry                                             */
/* ------------------------------------------------------------------------ */

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
export const formatViews = (n: number) => compact.format(n);

/** Platform glyph paths (24×24, from simple-icons) are passed in from the server: see icons.ts. */
export type GlyphMap = Record<string, string>;
export const PLATFORM_NAME: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

/**
 * Chart box = bottom 40% of a 4:5 card → aspect 2:1, so viewBox 100×50 maps
 * uniformly. The actual line stops at x = CHART_END with its end dot; from there
 * a dotted projection runs to the card's right edge (owner, hero-rev2 C).
 */
export const CHART_W = 100;
export const CHART_H = 50;
export const CHART_END = 82;
const PAD_TOP = 6;
const PAD_BOTTOM = 7;

export interface ChartGeometry {
  line: string;
  area: string;
  /** Dotted projection from the end dot to the right edge, and the paler area under it. */
  projLine: string;
  projArea: string;
  /** End point in % of the chart box (for the HTML dot). */
  endX: number;
  endY: number;
}

const yOf = (v: number) => CHART_H - PAD_BOTTOM - v * (CHART_H - PAD_TOP - PAD_BOTTOM);
const xOf = (i: number, n: number) => (i / (n - 1)) * CHART_END;
const round = (n: number) => Math.round(n * 100) / 100;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const lineGen = d3line<number>()
  .x((_, i, arr) => round(xOf(i, arr.length)))
  .y((v) => round(yOf(v)))
  .curve(curveMonotoneX);

const areaGen = d3area<number>()
  .x((_, i, arr) => round(xOf(i, arr.length)))
  .y0(CHART_H)
  .y1((v) => round(yOf(v)))
  .curve(curveMonotoneX);

/**
 * Where the trend is heading at the right edge, extrapolated from the slope of
 * the last three steps: a breakout keeps surging (it may rise above the chart
 * box into the poster), growth climbs gently (a flat series stays flat) and a
 * decline keeps falling, never through the floor.
 */
function projectedValue(card: HeroCard): number {
  const s = card.series;
  const n = s.length;
  const last = s[n - 1] ?? 0;
  if (n < 4) return last;
  const slope = (last - s[n - 4]) / 3; // per step
  const steps = (CHART_W - CHART_END) / (CHART_END / (n - 1));
  const run = slope * steps;
  if (card.trend === "breakout") return last + clamp(run * 0.6, 0.25, 0.45);
  if (card.trend === "growth") return last + clamp(run, slope > 0.015 ? 0.07 : -0.03, 0.18);
  return last + clamp(run * 0.8, -(last - 0.03), -0.06);
}

const geometryCache = new Map<HeroCard, ChartGeometry>();

export function chartGeometry(card: HeroCard): ChartGeometry {
  const hit = geometryCache.get(card);
  if (hit) return hit;
  const s = card.series;
  const last = s[s.length - 1] ?? 0;
  const x0 = CHART_END;
  const y0 = round(yOf(last));
  const y1 = round(yOf(projectedValue(card)));
  const g: ChartGeometry = {
    line: lineGen(s) ?? "",
    area: areaGen(s) ?? "",
    projLine: `M${x0},${y0}L${CHART_W},${y1}`,
    projArea: `M${x0},${y0}L${CHART_W},${y1}L${CHART_W},${CHART_H}L${x0},${CHART_H}Z`,
    endX: (CHART_END / CHART_W) * 100,
    endY: (y0 / CHART_H) * 100,
  };
  geometryCache.set(card, g);
  return g;
}

/* ------------------------------------------------------------------------ */
/* Static columns (wide screens)                                              */
/* ------------------------------------------------------------------------ */

/**
 * The lowest tier, shown as extra columns on wide windows (hero-rev2 A): one static column
 * from the 21:20 stage aspect (five cards), a second one from 7:5 (browser windows on 1920 to
 * 2560px screens are short and wide, so four or five columns would leave a long empty run
 * between the prompt box and the lead card). The second column holds four cards, so the
 * silhouette tapers (1, 2, 3, 4, 5, 4) instead of plateauing. These cards never flap and never tick: posters only
 * (no loop), low scores and declining or flat charts. Each poster is a spare from one prompt
 * set (a rank 7–12 card that set does not put on the board), so a static card never repeats
 * a card the board is showing for that set, and no poster appears twice among the nine.
 */
const STATIC_TIERS: { score: number; trend: Trend; series: number[] }[][] = [
  [
    { score: 16, trend: "decline", series: [0.21, 0.46, 0.64, 0.8, 1, 0.9, 0.79, 0.68, 0.6, 0.52, 0.45, 0.38, 0.31, 0.25] },
    { score: 14, trend: "growth", series: [0.3, 0.36, 0.33, 0.38, 0.35, 0.37, 0.34, 0.38, 0.36, 0.34, 0.37, 0.35, 0.36, 0.36] },
    { score: 18, trend: "decline", series: [0.19, 0.4, 0.58, 0.74, 0.9, 1, 0.88, 0.77, 0.66, 0.57, 0.5, 0.42, 0.36, 0.31] },
    { score: 12, trend: "decline", series: [0.26, 0.5, 0.73, 1, 0.92, 0.8, 0.7, 0.6, 0.51, 0.43, 0.36, 0.29, 0.24, 0.2] },
    { score: 15, trend: "growth", series: [0.42, 0.38, 0.41, 0.37, 0.4, 0.36, 0.39, 0.38, 0.35, 0.38, 0.36, 0.37, 0.35, 0.36] },
  ],
  [
    { score: 15, trend: "decline", series: [0.34, 0.55, 0.78, 0.97, 1, 0.86, 0.74, 0.63, 0.55, 0.47, 0.4, 0.33, 0.28, 0.23] },
    { score: 13, trend: "growth", series: [0.38, 0.35, 0.39, 0.36, 0.34, 0.38, 0.37, 0.35, 0.39, 0.36, 0.37, 0.35, 0.38, 0.37] },
    { score: 17, trend: "decline", series: [0.18, 0.37, 0.55, 0.7, 0.86, 1, 0.9, 0.78, 0.69, 0.58, 0.5, 0.44, 0.37, 0.3] },
    { score: 11, trend: "decline", series: [0.29, 0.52, 0.8, 1, 0.85, 0.73, 0.62, 0.54, 0.46, 0.38, 0.32, 0.27, 0.22, 0.18] },
  ],
];

/** The two spare cards (ranks 7–12) that prompt set `k` leaves off its board, lowest rank last. */
function spareCards(k: number): HeroCard[] {
  const at = k % PROMPT_SETS.length;
  const onBoard = new Set(BOARD_CARDS[at]);
  return [...PROMPT_SETS[at].cards].reverse().filter((c) => !onBoard.has(c));
}

/**
 * The static columns, nearest the board first. Column one takes each set's lowest spare;
 * column two takes the other spare, from a set two steps along, so neighbouring rows never
 * show posters from the same set.
 */
export const STATIC_COLUMNS: HeroCard[][] = STATIC_TIERS.map((tiers, col) =>
  tiers.map((tier, k) => {
    const spares = spareCards(col === 0 ? k : k + 2);
    const spare = spares[col] ?? spares[0] ?? PROMPT_SETS[0].cards[PROMPT_SETS[0].cards.length - 1];
    return { ...spare, rank: 13 + col * tiers.length + k, video: undefined, ...tier };
  }),
);

/* ------------------------------------------------------------------------ */
/* Radar geometry (card back)                                                */
/* ------------------------------------------------------------------------ */

export const RADAR_R = 30;

/** Unit vector for axis i of 6, clockwise from the top. */
export function radarAxis(i: number): [number, number] {
  const a = -Math.PI / 2 + (i * Math.PI) / 3;
  return [Math.cos(a), Math.sin(a)];
}

export function radarPoints(values: number[], r = RADAR_R): string {
  return values
    .map((v, i) => {
      const [x, y] = radarAxis(i);
      const k = (Math.max(4, Math.min(100, v)) / 100) * r;
      return `${round(x * k)},${round(y * k)}`;
    })
    .join(" ");
}

export const paramValues = (card: HeroCard) => PARAMS.map((p) => card.params[p.key]);

/**
 * Keyword chips for the card back: the card's first three keywords, shortest
 * first, so as many whole chips as possible fit the one-row strip (chips that do
 * not fit are hidden whole, never cut).
 */
export const backKeywords = (card: HeroCard) =>
  card.keywords.slice(0, 3).sort((a, b) => a.length - b.length);

/**
 * Accessible name of a card. It opens with the text a sighted user sees on the front
 * (view count, then "97%"), so the name contains the visible label (WCAG 2.5.3 Label in
 * Name) and voice control can target the card by what it shows; the rank and the scoring
 * detail follow. It is the text content of the card's visually hidden native <button>
 * (hero-board.tsx Slot), whose name therefore comes from its contents with no aria-label
 * to mismatch the visible text; the visual card is aria-hidden, so this is the whole
 * announcement.
 */
export function describeCard(card: HeroCard): string {
  const params = PARAMS.map((p) => `${p.label} ${card.params[p.key]}`).join(", ");
  const views = formatViews(card.views);
  return `${views} views, ${card.score}% search score. Rank ${card.rank}: ${PLATFORM_NAME[card.platform] ?? card.platform} video by ${
    card.creator
  }, ${TREND_LABEL[card.trend].toLowerCase()}. Scored on ${params}. Keywords: ${card.keywords.join(", ")}. Show why it scored.`;
}
