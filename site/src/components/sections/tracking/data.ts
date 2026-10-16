/**
 * Tracking section data layer.
 *
 * Real inputs (src/content/media/tracking.json, observed 2026-10-14): handles, names,
 * roles, avatars, posters, and today's follower / total-likes / per-video counts.
 *
 * Illustrative (the app has no history for these accounts, and one public read gives no
 * daily deltas): the 30-day account series and the 14-day daily view gains. Every series
 * is deterministic (seeded) and anchored so its LAST point equals the real current count.
 * The charts say "Illustrative trend"; nothing here is presented as measured history. Everything derived from
 * a series (weekly change, 24h gain, tone) is computed here, so the labels on the
 * board always agree with the chart.
 *
 * What the app actually stores (backend/alembic/versions/0049_tracking.py):
 * followers and totals for accounts; views, likes, comments, shares, saves for videos.
 * Snapshots run once a day at a time the user picks (default 9:00 AM local).
 */
import raw from "@/content/media/tracking.json";

export type MetricKey = "followers" | "likes";
/** Account identity hue: the chart series, the role badge and the avatar ring. The board tracks two accounts (pink, blue). */
export type ChartTone = "pink" | "purple" | "blue";
export type VideoTone = "breakout" | "growth" | "steady";

/** Account series length and sparkline length. */
export const SERIES_DAYS = 30;
export const SPARK_DAYS = 14;

/** Day of the last snapshot (the real counts). */
export const OBSERVED_ON: string = raw.observed_on;

/** Default daily refresh time in the app (backend/app/tracking/schedule.py). */
export const SNAPSHOT_TIME_LABEL = "9:00 AM";

export const METRIC_LABEL: Record<MetricKey, string> = { followers: "Followers", likes: "Likes" };

/** Both metrics are charted side by side, in this order. */
export const METRICS: MetricKey[] = ["followers", "likes"];

/**
 * Stroke colour for each account hue (COLOR_SYSTEM: Tracking uses pink, purple, blue for its
 * series, so green, red and yellow stay free for the trend semantics beside them).
 */
export const TONE_STROKE: Record<ChartTone, string> = {
  pink: "var(--pink)",
  purple: "var(--purple)",
  blue: "var(--blue)",
};

export interface TrackedVideo {
  id: string;
  poster: string;
  title: string;
  postedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  /** Illustrative views gained per day, oldest first, length SPARK_DAYS. */
  daily: number[];
  /** Views gained in the last 24h (the last entry of `daily`). */
  delta24h: number;
  tone: VideoTone;
}

export interface TrackedAccount {
  id: string;
  handle: string;
  name: string;
  /** Short name for chart labels. */
  shortName: string;
  roleLabel: string;
  role: "dtc-brand" | "competitor";
  avatar: string;
  /** Cropped, faded-in cover for the card (a crop of the account's own video poster). */
  cover: string;
  followers: number;
  totalLikes: number;
  posts: number;
  tone: ChartTone;
  /** Illustrative cumulative counts per day, oldest first, last = real count. */
  series: Record<MetricKey, number[]>;
  /** Change over the last 7 days, in percent, derived from `series`. */
  weeklyPct: Record<MetricKey, number>;
  videos: TrackedVideo[];
}

/* -------------------------------------------------------------- generators */

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A one-off push (positive) or slump (negative) in the daily gain, centred on a day. */
type GrowthEvent = [at: number, amp: number, width: number];

interface GrowthConfig {
  /** Total growth across the window, as a fraction (0.036 = +3.6%). */
  growth: number;
  seed: number;
  /** Day-to-day wobble, as a multiple of the average daily gain. Above 1, some days net out negative. */
  noise: number;
  /** Spikes and dips: day index, weight vs an average day (negative = a net loss), width in days. */
  events: GrowthEvent[];
}

/**
 * Cumulative counter that ends exactly on `final` and grows `growth` over the window.
 * The daily gain is an average day plus noise plus the events, so the line has real ups and
 * downs (a launch spike, a slump) instead of an even climb.
 */
function growthSeries(final: number, cfg: GrowthConfig): number[] {
  const rnd = mulberry32(cfg.seed);
  const weights = [0];
  for (let i = 1; i < SERIES_DAYS; i++) {
    const wobble = (rnd() + rnd() + rnd() - 1.5) * 2;
    let w = 1 + cfg.noise * wobble;
    for (const [at, amp, width] of cfg.events) w += amp * Math.exp(-((i - at) ** 2) / (2 * width ** 2));
    weights.push(w);
  }
  const total = weights.reduce((a, b) => a + b, 0);
  const start = final / (1 + cfg.growth);
  let cumulative = 0;
  return weights.map((w, i) => {
    cumulative += w / total;
    return i === SERIES_DAYS - 1 ? final : Math.round(start * (1 + cfg.growth * cumulative));
  });
}

type VideoProfile = "steady" | "slowing" | "rising" | "spike";

interface DailyConfig {
  mean: number;
  profile: VideoProfile;
  seed: number;
}

/** Views gained per day over SPARK_DAYS. */
function dailyGains({ mean, profile, seed }: DailyConfig): number[] {
  const rnd = mulberry32(seed);
  const spike = [3.4, 6.2, 9.5];
  const out: number[] = [];
  for (let i = 0; i < SPARK_DAYS; i++) {
    const t = i / (SPARK_DAYS - 1);
    let f = 1 + (rnd() - 0.5) * 0.36;
    if (profile === "slowing") f *= 1.25 - 0.5 * t;
    if (profile === "rising") f *= 0.7 + 0.7 * t;
    if (profile === "spike") f *= i >= SPARK_DAYS - 3 ? spike[i - (SPARK_DAYS - 3)] : 0.85;
    out.push(Math.max(1, Math.round(mean * f)));
  }
  return out;
}

function toneFor(daily: number[]): VideoTone {
  const last = daily[daily.length - 1];
  const prior = daily.slice(0, -1);
  const avg = prior.reduce((a, b) => a + b, 0) / prior.length;
  const ratio = last / avg;
  if (ratio >= 2.5) return "breakout";
  if (ratio >= 1.1) return "growth";
  return "steady";
}

/* ------------------------------------------------------------ illustration */

interface AccountStyle {
  tone: ChartTone;
  shortName: string;
  followers: GrowthConfig;
  likes: GrowthConfig;
  videos: DailyConfig[];
}

/**
 * Per-account illustration settings. rhode is the competitor with a launch-week
 * acceleration and a cool-off, Glossier a slower, large brand account with a mid-month
 * dip. Each account gets its own spikes and slumps so the two lines never track each other.
 */
const STYLE: Record<string, AccountStyle> = {
  glossier: {
    tone: "pink",
    shortName: "Glossier",
    followers: { growth: 0.021, seed: 11, noise: 2.2, events: [[8, 5, 0.9], [18, -6, 0.9], [26, 6, 1.1]] },
    likes: { growth: 0.03, seed: 5, noise: 3, events: [[4, 5, 0.6], [9, -4, 0.7], [14, 6, 0.7], [19, -4, 0.8], [24, 8, 0.8]] },
    videos: [
      { mean: 2400, profile: "slowing", seed: 3 },
      { mean: 900, profile: "steady", seed: 4 },
    ],
  },
  rhode: {
    tone: "blue",
    shortName: "rhode",
    followers: { growth: 0.046, seed: 37, noise: 1.8, events: [[9, -5, 0.9], [19, 8, 1.2], [23, -4, 0.7], [27, 7, 1]] },
    likes: { growth: 0.064, seed: 13, noise: 2, events: [[10, 8, 0.8], [17, -4, 0.9], [25, 10, 1]] },
    videos: [
      { mean: 15000, profile: "slowing", seed: 7 },
      { mean: 20000, profile: "spike", seed: 8 },
    ],
  },
};

/** Video gain settings for a third or later video of an account (none yet): a plain steady profile. */
const fallbackVideo = (views: number, seed: number): DailyConfig => ({
  mean: Math.max(200, Math.round(views / 3000)),
  profile: "steady",
  seed,
});

/* ----------------------------------------------------------------- builders */

interface RawVideo {
  poster: string;
  url: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posted_at: string;
}

interface RawAccount {
  handle: string;
  name: string;
  role: string;
  role_label: string;
  avatar: string;
  cover: string;
  followers: number;
  total_likes: number;
  videos_count: number;
  videos: RawVideo[];
}

const weekly = (s: number[]) => (s[s.length - 1] / s[s.length - 8] - 1) * 100;

function build(a: RawAccount): TrackedAccount {
  const style = STYLE[a.handle];
  const followers = growthSeries(a.followers, style.followers);
  const likes = growthSeries(a.total_likes, style.likes);
  return {
    id: a.handle,
    handle: a.handle,
    name: a.name,
    shortName: style.shortName,
    roleLabel: a.role_label,
    role: a.role as TrackedAccount["role"],
    avatar: a.avatar,
    cover: a.cover,
    followers: a.followers,
    totalLikes: a.total_likes,
    posts: a.videos_count,
    tone: style.tone,
    series: { followers, likes },
    weeklyPct: { followers: weekly(followers), likes: weekly(likes) },
    videos: a.videos.map((v, i) => {
      const daily = dailyGains(style.videos[i] ?? fallbackVideo(v.views, 20 + i));
      return {
        id: v.url.split("/").pop() ?? `${a.handle}-${i}`,
        poster: v.poster,
        title: v.title,
        postedAt: v.posted_at,
        views: v.views,
        likes: v.likes,
        comments: v.comments,
        shares: v.shares,
        saves: v.saves,
        daily,
        delta24h: daily[daily.length - 1],
        tone: toneFor(daily),
      };
    }),
  };
}

/** Tracked accounts in board order (DTC brand, then competitor). */
export const ACCOUNTS: TrackedAccount[] = (raw.accounts as RawAccount[]).map(build);

export const TOTAL_VIDEOS = ACCOUNTS.reduce((n, a) => n + a.videos.length, 0);
