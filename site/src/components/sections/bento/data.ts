/**
 * Bento data: every value the section renders, mapped from the shared content files.
 *
 * Sources (nothing here is invented):
 * - `@/content/media/bento-analysis.json`: the normalised ContHunt analysis of the featured
 *   TikTok (@glenxda, Kayuso defrosting box). Fields flagged "derived" there stay labelled
 *   "derived" in the UI; null fields (sound name, BPM, saves) are omitted.
 * - The scene list, editing/camera/lighting notes and the timeline come from the same ContHunt
 *   analysis, copied verbatim below.
 * - `@/content/site/bento.ts`: the retained legacy tile copy, rewritten into the two-tone
 *   caption form (1–2 ink words, then a muted continuation) with the meaning kept. The legacy
 *   LinkedIn claim is dropped: the product supports TikTok, Instagram Reels and YouTube Shorts.
 * - `@/content/viral-now/niches.json`: niche labels for the Niche hunter fragment.
 *
 * Measured by the bento agent (2026-10-14), recorded here so it can be re-run:
 * - `AUDIO_ENVELOPE`: RMS loudness of the original download (content item
 *   video_uZffFlO1gBkY, 11.86 s, AAC stereo) decoded with ffmpeg to 8 kHz mono, split into
 *   48 equal bins, converted to dBFS and normalised over a 36 dB window below the loudest bin
 *   (peak −9.6 dBFS). Zeros are real near-silences at the jump cuts.
 * - `LOOP_SOURCE_OFFSET_S`: `public/media/bento/featured.mp4` is source 0.8 s → 7.8 s
 *   (SSIM 0.987 against the original at that offset), so the waveform playhead can follow it.
 */
import analysis from "@/content/media/bento-analysis.json";
import niches from "@/content/viral-now/niches.json";
import { data as legacy } from "@/content/site/bento";

/* ------------------------------------------------------------------ format */

const INT = new Intl.NumberFormat("en-US");
const COMPACT = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const fmtInt = (n: number) => INT.format(Math.round(n));
export const fmtCompact = (n: number) => COMPACT.format(n);
export const fmtPct = (n: number, digits = 2) => `${n.toFixed(digits)}%`;

/* ------------------------------------------------------------ section copy */

/** Retained legacy heading and subhead ("Intelligence, not just search."). */
export const SECTION = {
  label: "Features",
  index: 3,
  /** Legacy: "Intelligence, not just search." The keyword "Intelligence" is set in Boska. */
  keyword: "Intelligence",
  titleRest: ",",
  muted: "not just search.",
  sub: legacy.subhead, // "Everything you need to reverse-engineer virality."
} as const;

/* ------------------------------------------------------- featured analysis */

const a = analysis;

export const VIDEO = {
  src: a.video.src,
  poster: a.video.poster,
  creator: a.video.creator,
  creatorName: a.video.creator_name,
  platform: "TikTok",
  product: a.video.product,
  durationS: a.video.duration_seconds,
  views: a.metrics.views,
  label: `${a.video.product} demo by ${a.video.creator} on TikTok, ${fmtCompact(a.metrics.views)} views`,
} as const;

export const TILE_ONE = {
  caption: "Every signal,",
  rest: "pulled from one video.",
  receipt: ["Real ContHunt analysis", "TikTok · Oct 14, 2026"] as const,
} as const;

export const HOOK = {
  text: a.hook.text,
  timestamp: "0:00",
  type: a.hook.type,
  confidence: a.hook.confidence,
  visual: a.hook.visual_hook,
  payoff: a.hook.payoff,
} as const;

/** `metrics.views_per_day` (derived: views / days live on 2026-10-14). */
export const VIEWS_PER_DAY = a.metrics.views_per_day;

export const METRICS = {
  views: a.metrics.views,
  ageDays: a.metrics.age_days_on_2026_10_14,
  minor: [
    { label: "Likes", value: a.metrics.likes, kind: "int" as const, derived: false },
    { label: "Comments", value: a.metrics.comments, kind: "int" as const, derived: false },
    { label: "Shares", value: a.metrics.shares, kind: "int" as const, derived: false },
    { label: "Eng. rate", value: a.metrics.engagement_rate_pct, kind: "pct" as const, derived: true },
  ],
} as const;

/**
 * Qualitative Q&A. `short` trims each analysis answer to fit the panel; facts unchanged.
 * Order matches the JSON.
 */
const QA_SHORT = [
  "On-screen text at 0:00 over frozen meat landing on the device. A problem/solution hook with the payoff in the same clip.",
  "The need for a fast way to defrost meat. The payoff is a thawed, pliable steak tested with tongs.",
  "Home cooks and kitchen gadget enthusiasts. Themes: convenience, kitchen efficiency, technology in the home.",
  "Fast jump cuts remove downtime, and a satisfying before-and-after lands at 0:04 to 0:05.",
  "No. The analysis flags a missing CTA (link in bio, website) as the main area for improvement.",
  "The Visual Proof Demonstration pattern, low difficulty: pain point, product in use, jump cut to the result.",
];
export const QUALITATIVE = a.qualitative.map((item, i) => ({
  q: item.q,
  a: QA_SHORT[i] ?? item.a,
}));

export type Measure = { label: string; value: string; derived: boolean; title?: string };
const quant = (label: string) => a.quantitative.find((m) => m.label === label);
const counts = a.metrics;
/**
 * Quantitative measures. The first two come straight from `quantitative`; the next three are
 * ratios of the real counts above (views 3,114,525 · likes 64,035 · comments 123 · shares
 * 7,187), computed here, so they carry the "d" mark. Age (Metrics) and time to hook (the
 * Hook panel's 0:00 chip) are shown elsewhere, so they are not repeated.
 */
export const MEASURES: Measure[] = [
  { label: "Share rate", value: fmtPct(quant("Share rate")?.value ?? 0), derived: true, title: "shares / views" },
  { label: "Views/day", value: fmtInt(quant("Views per day")?.value ?? 0), derived: true, title: `views / ${counts.age_days_on_2026_10_14} days live` },
  { label: "Likes/view", value: fmtPct((counts.likes / counts.views) * 100), derived: true, title: "likes / views" },
  { label: "Shares/like", value: (counts.shares / counts.likes).toFixed(2), derived: true, title: "shares / likes" },
  { label: "Comments/1k", value: ((counts.comments / counts.views) * 1000).toFixed(2), derived: true, title: "comments per 1,000 views" },
  { label: "Runtime", value: `0:${String(quant("Runtime")?.value ?? 0).padStart(2, "0")}`, derived: false },
  { label: "Scenes", value: String(quant("Scenes")?.value ?? 0), derived: false },
];

export const TREND = {
  className: a.trend.trend_class as "growth" | "breakout",
  pattern: a.trend.pattern,
  name: a.trend.name,
  tags: a.trend.caption_tags.slice(0, 3),
  series: a.trend.series,
  /** The series is a modeled shape (no daily snapshots exist for this video). */
  modelled: a.trend.series_meta.derived,
} as const;

/** 48-bin RMS loudness envelope of the original clip (see header). */
export const AUDIO_ENVELOPE = [
  0.0, 0.465, 0.0, 0.467, 0.007, 0.831, 0.0, 0.0, 0.956, 1.0, 0.263, 0.351, 0.0, 0.317, 0.481, 0.532,
  0.536, 0.524, 0.519, 0.452, 0.037, 0.0, 0.0, 0.0, 0.0, 0.0, 0.707, 0.756, 0.865, 0.982, 0.071, 0.452,
  0.538, 0.544, 0.537, 0.536, 0.53, 0.534, 0.563, 0.515, 0.54, 0.539, 0.548, 0.583, 0.59, 0.342, 0.0,
  0.766,
];
export const AUDIO_SOURCE_DURATION_S = 11.86;
export const LOOP_SOURCE_OFFSET_S = 0.8;

export const AUDIO = {
  voiceover: a.audio.voiceover,
  rows: [
    { label: "Music", value: a.audio.music },
    // Trimmed from `audio.sound_effects` ("Natural sounds (clinking, tapping, whirring of the
    // device) are emphasized.") so it fits one line at every tile width.
    { label: "SFX", value: "Clinking, tapping, device whirr." },
    { label: "Mix", value: "Clear and balanced." },
  ],
} as const;

export const VIRALITY = {
  /** Trimmed from `virality.summary`. */
  line: "Proves one claim fast: frozen meat becomes thawed meat in the same clip.",
  /** The five logged reasons, verbatim titles (details stay in the JSON). */
  reasons: a.virality.reasons.map((r) => r.title),
} as const;

export type Score = { name: string; value: number; basis: string };
export const SCORES: Score[] = a.scores.items.map((s) => ({ name: s.name, value: s.value, basis: s.basis }));

/** `rerank.source` is "derived" (ranks computed in SQL over the saved results), so the panel carries the "d" mark. */
export const RERANK = {
  query: a.rerank.sample_query,
  results: a.rerank.result_count,
  before: a.rerank.rank_before,
  lenses: a.rerank.alternatives.map((l) => ({ lens: l.lens, rank: l.rank })),
} as const;

/* ---------------------------------------------------- deep research scenes */

/** Verbatim from the raw analysis markdown (## Scenes, ## Timeline). */
export const SCENES = [
  { start: 0, end: 2, text: "Placing the frozen steak on the device base.", tag: "Hook" },
  { start: 2, end: 4, text: "Covering the steak and activating the device.", tag: null },
  { start: 4, end: 5, text: "Demonstrating the thawed steak with tongs.", tag: "Proof" },
  { start: 5, end: 6, text: "Placing the frozen ground beef on the device base.", tag: null },
  { start: 6, end: 8, text: "Covering the meat and activating the device.", tag: null },
  { start: 8, end: 11, text: "Demonstrating the thawed ground beef with tongs.", tag: "Climax" },
] as const;

/** Facets from the raw markdown (Transcript, Editing Style, Camera Work, Lighting Design). */
export const FACETS = [
  { label: "Hook", value: "On-screen text at 0:00" },
  { label: "Pacing", value: "Fast jump cuts between steps" },
  { label: "Visuals", value: "Static top-down, high-key light" },
  { label: "Script", value: "No speech, one text overlay" },
] as const;

/* ----------------------------------------------------------- feature copy */

const legacyItem = (title: string) => legacy.items.find((i) => i.title === title);

export type FeatureKey = "platforms" | "research" | "niche" | "velocity";
export type Feature = { key: FeatureKey; caption: string; rest: string; legacyTitle: string };

/** Retained legacy items in two-tone form. `legacyTitle` keeps the trace to bento.ts. */
export const FEATURES: Record<FeatureKey, Feature> = {
  platforms: {
    key: "platforms",
    caption: "Multi-platform.",
    rest: "Keywords, hashtags or creators across TikTok, Reels and Shorts at once.",
    legacyTitle: legacyItem("Multi-Platform Aggregation")?.title ?? "Multi-Platform Aggregation",
  },
  research: {
    key: "research",
    caption: "Deep research.",
    rest: "Like NotebookLM, for short-form video.",
    legacyTitle: legacyItem("Deep Research Agent")?.title ?? "Deep Research Agent",
  },
  niche: {
    key: "niche",
    caption: "Niche hunter.",
    rest: "Low-competition, high-velocity topics for your brand.",
    legacyTitle: legacyItem("Niche Hunter")?.title ?? "Niche Hunter",
  },
  velocity: {
    key: "velocity",
    caption: "Velocity metrics.",
    rest: "Videos growing faster than their creator’s average.",
    legacyTitle: legacyItem("Velocity Metrics")?.title ?? "Velocity Metrics",
  },
};

/** Search modes named in the retained copy, with real values from the featured analysis. */
export const SEARCH_MODES = [
  { key: "keyword", label: "Keyword", value: a.rerank.sample_query },
  { key: "hashtag", label: "Hashtag", value: a.trend.caption_tags[0] ?? "#amazonfinds" },
  { key: "creator", label: "Creator", value: a.video.creator },
] as const;

export const PLATFORMS = [
  { key: "tiktok", label: "TikTok" },
  { key: "reels", label: "Instagram Reels" },
  { key: "shorts", label: "YouTube Shorts" },
] as const;
export type PlatformKey = (typeof PLATFORMS)[number]["key"];

/** Niche labels from the Viral Now niche list (labels only; no metrics are implied). */
const NICHE_PICK = ["food-recipes", "fitness-gym", "beauty-skincare", "tiktok-shop-finds", "pets-animals", "home-diy", "tech-gadgets", "travel", "personal-finance"];
export const NICHES = NICHE_PICK.map((slug) => niches.find((n) => n.slug === slug))
  .filter((n): n is (typeof niches)[number] => Boolean(n))
  .map((n) => ({ slug: n.slug, label: n.label }));
export const NICHE_DEFAULT = "tiktok-shop-finds";
