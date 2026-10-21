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

/**
 * Subtitle chips (hero-rev14, the owner's Pencil frame dFkvz): "Claim your superpower. Search through
 * [7 platforms] over [10,862 niches] and [10,384,719 videos] updated daily. Save around [33 hours]
 * every week." (niches was 104,862 until rev 14)
 */
export const HERO_STATS = {
  platforms: { value: 7, suffix: "", label: "platforms" },
  niches: { value: 10_862, suffix: "", label: "niches" },
  videos: { value: 10_384_719, suffix: "", label: "videos" },
  hours: { value: 33, suffix: "", label: "hours" },
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
 * Triangle layout: columns hold 1, 2, 3, 4 and 5 cards, left to right (hero-rev13: the old static
 * columns are gone; every column is an engine column). Each entry is a slot index into
 * BOARD_CARDS[set]. How many show is the hero row's column count N (hero-rev14, below).
 */
export const COLUMNS: number[][] = [[0], [1, 2], [3, 4, 5], [6, 7, 8, 9], [10, 11, 12, 13, 14]];
export const SLOT_COUNT = 15;
/** Slots of columns 1–4. Slots from here on are the fifth column, shown only where N = 5. */
export const CORE_SLOT_COUNT = 10;

/*
 * Column visibility (hero-rev14; hero.module.css "the hero row model" is the source, keep both in
 * step). The board shows N whole columns: N ≥ 3 when the hero is at least ROW_N3 units wide, N ≥ 4
 * from ROW_N4, N = 5 from ROW_N5 (u = the hero unit). The stacked layout below 1024px shows
 * columns 1–3. CSS decides with container queries in u; a <picture> source needs a media query, so
 * these restate the same rule in viewport terms, for the posters of hidden columns (never fetched).
 *
 * u = max(0.6rem, min(clamp(0.75rem, W / 120, 1.15rem), fit(H))), fit = the height guard
 * (hero.module.css --u-fit: the text block, max(46.5u, 42.39375u + 3.0722rem), fits between the 88px
 * navbar and the 65px strip with 2.5rem of air). Column N shows where u ≤ W / ROW_N. Without the
 * guard that is the width alone: columns 3 and 4 from ROW_N × the 0.75rem floor, column 5 from
 * ROW_N5 × the 1.15rem cap. On short windows the guard holds u down (to 0.6rem), so a column can show
 * on a narrower window: from ROW_N × 0.6rem, where H ≤ 153px + 2.5rem + block(W / ROW_N). A media
 * query cannot mix W and H, so each such band is cut into width steps, each hidden only above the
 * height line at its widest end: a slightly smaller hidden region than the real one, so a visible
 * column never shows an empty image (at worst a window a few px off the line would fetch posters it
 * does not show). Viewport widths also count a classic scrollbar, which the hero's 100cqw does not.
 * Both slips are closed by the posters of columns 3–5 being lazy (hero-board.tsx Slot): a lazy image
 * in a display:none column is never fetched, so these queries only decide the first parse's candidate.
 */
export const ROW_N3 = 92.69375;
export const ROW_N4 = 106.86875;
export const ROW_N5 = 134.175;
/** The width floor, the height guard's floor and the cap of u, in rem. */
const U_MIN_REM = 0.75;
const U_FIT_MIN_REM = 0.6;
const U_MAX_REM = 1.15;
const rem = (n: number) => `${Math.round(n * 10000) / 10000}rem`;
/** The text block's height at u (both in rem), as the height guard models it. */
const blockRem = (u: number) => Math.max(46.5 * u, 42.39375 * u + 3.0722);

/** Widths from..to (rem) in steps, each hidden above the height line at its widest end. */
function hiddenAboveFit(row: number, from: number, to: number, steps: number, prefix = ""): string[] {
  const parts: string[] = [];
  for (let k = 0; k < steps; k++) {
    const a = from + ((to - from) * k) / steps;
    const b = from + ((to - from) * (k + 1)) / steps;
    parts.push(`${prefix}(${rem(a)} <= width < ${rem(b)}) and (height > calc(153px + ${rem(2.5 + blockRem(b / row))}))`);
  }
  return parts;
}

/** Per column (COLUMNS order): the media query under which it is hidden, or undefined (always shown). */
export const COLUMN_HIDDEN_MEDIA: (string | undefined)[] = [
  undefined,
  undefined,
  // Shown in the stacked layout; from 1024px it needs ROW_N3 units (the guard's floor is under 1024px).
  hiddenAboveFit(ROW_N3, 64, ROW_N3 * U_MIN_REM, 2, "(1024px <= width) and ").join(", "),
  [
    "(width < 1024px)",
    `(width < ${rem(ROW_N4 * U_FIT_MIN_REM)})`,
    ...hiddenAboveFit(ROW_N4, ROW_N4 * U_FIT_MIN_REM, ROW_N4 * U_MIN_REM, 3),
  ].join(", "),
  [
    "(width < 1024px)",
    `(width < ${rem(ROW_N5 * U_FIT_MIN_REM)})`,
    ...hiddenAboveFit(ROW_N5, ROW_N5 * U_FIT_MIN_REM, ROW_N5 * U_MAX_REM, 16),
  ].join(", "),
];

/** The column a slot belongs to. */
export const columnOf = (slot: number) => COLUMNS.findIndex((col) => col.includes(slot));

/*
 * Poster sizes. Every hero poster exists at 360×640 (`<n>.webp`) and 240×427 (`<n>-sm.webp`,
 * the same frame). Below 1024px the cards are about 105–125px wide, so a phone at 1–2x
 * picks the 240 file and a 3x phone, a tablet or a desktop the 360 one. Every slot (and
 * the engine's preloads) uses the lead card's size, so a poster is one cached file wherever
 * it lands. Lead card width: 1.12 × (100vw − 2 × 20px gutter − 2 × 12px gap) / 3.12, capped
 * at 1.12 × 156px from 552px (hero.module.css .columns; hero-rev13 made the cards 3:5).
 */
export const HERO_POSTER_SIZES = "(max-width: 551px) calc((100vw - 64px) / 2.78), (max-width: 1023.98px) 175px, 360px";

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
 *
 * Column 5 (slots 10–14, 2K windows only; hero-rev13) takes what the set has left (its two
 * spare ranks) and fills the rest from a donor set's lowest ranks, so a set of twelve still
 * gives fifteen distinct videos and no poster appears twice on screen. The donor's cards keep
 * their own score, trend and chart; only the rank is renumbered (13–15) so the card backs never
 * show one rank twice. Highest score first, so the column reads like the others.
 */
function boardCards(set: PromptSet, donor: PromptSet): HeroCard[] {
  const head = set.cards.slice(0, 6);
  const tail = set.cards.slice(6);
  let core: HeroCard[];
  if (tail.length < 4) {
    core = set.cards.slice(0, CORE_SLOT_COUNT);
  } else {
    const declines = tail.filter((c) => c.trend === "decline").slice(0, MIDDLE_ROWS.length);
    const rest = tail.filter((c) => !declines.includes(c));
    const col: (HeroCard | undefined)[] = [undefined, undefined, undefined, undefined];
    declines.forEach((c, k) => (col[MIDDLE_ROWS[k]] = c));
    for (let r = 0; r < col.length; r++) col[r] ??= rest.shift();
    core = [...head, ...(col as HeroCard[])];
  }
  const wanted = SLOT_COUNT - CORE_SLOT_COUNT;
  const taken = new Set(core.map((c) => c.poster));
  const spares = set.cards.filter((c) => !core.includes(c)).slice(0, wanted);
  spares.forEach((c) => taken.add(c.poster));
  const fill = [...donor.cards]
    .reverse()
    .filter((c) => !taken.has(c.poster))
    .slice(0, wanted - spares.length)
    .map((c, k): HeroCard => ({ ...c, rank: 13 + k, video: undefined }));
  const fifth = [...spares, ...fill].sort((a, b) => b.score - a.score);
  return [...core, ...fifth];
}

/** Each set borrows from the set two along: the next set is the one that follows it on screen, so its cards never meet its own mid-wave. */
export const BOARD_CARDS: HeroCard[][] = PROMPT_SETS.map((set, k) => boardCards(set, PROMPT_SETS[(k + 2) % PROMPT_SETS.length]));

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
 * Chart box = bottom 34% of a 3:5 card (hero-rev13; it was 40% of a 4:5 card) → aspect 1.76:1, close to
 * the viewBox's 2:1, so the 100×50 chart maps with only a slight vertical stretch. The actual line
 * stops at x = CHART_END with its end dot; from there a dotted projection runs to the card's right
 * edge (owner, hero-rev2 C).
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
