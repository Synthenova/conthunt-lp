/**
 * Compact wire format for the bundled seed snapshot (client-safe, no side effects).
 *
 * Why it exists: the page used to hand all 586 normalized videos to the client provider as a
 * prop, which put about 450 KB of JSON into the HTML (the React Server Components payload).
 * Now the first paint carries only what it can show:
 *
 *   - a "shell" per niche (name, counts, summary, no videos),
 *   - the first SSR_ROW_CARDS videos of the first EAGER_ROWS rows, or all of the opened niche,
 *   - everything else streams in after hydration from /viral-now/seed.json (see seed-chunk.ts).
 *
 * A video travels as a positional tuple (see WireVideo). Everything that follows a convention
 * is derived on the way back instead of being sent: rank from the position, poster and loop
 * paths from the niche slug and rank, post and creator URLs from the platform and handle,
 * week from the niche, and every constant field. The encoder checks its own output: a video
 * the compact fields cannot reproduce exactly travels whole in the `full` slot, so a changed
 * seed.json can make the payload bigger but never wrong.
 */
import { PLATFORM_ORDER } from "./glyphs";
import type { ViralNowAsset, ViralNowNiche, ViralNowNicheSummary, ViralNowPlatform, ViralNowVideo } from "./types";

/** Bump when the tuple layout changes. It is part of the chunk URL, so old caches are skipped. */
export const WIRE_VERSION = 1;

/** Rows (from the top) that render their first cards on the server. */
export const EAGER_ROWS = 2;

/** Cards of an eager row that are in the server render. The rest arrive with the seed chunk. */
export const SSR_ROW_CARDS = 12;

const PLATFORM_CODES = ["tiktok", "instagram", "youtube", "pinterest", "other"] as const satisfies readonly ViralNowPlatform[];

/** Fields that did not follow the conventions. Absent in almost every video. */
export interface WireExtra {
  rank?: number;
  saves?: number | null;
  score?: number | null;
  duration?: number | null;
  posted_at?: string | null;
  week_of?: string | null;
  creator_url?: string | null;
  poster?: string | null;
  video?: string;
  /** The video exactly as it is; wins over every other field. */
  full?: ViralNowVideo;
}

/**
 * [0] id  [1] title  [2] platform code  [3] handle  [4] creator name
 * [5] post link: the path tail, or the whole URL when it does not follow the platform pattern
 * [6] duration in tenths of a second  [7] views  [8] likes  [9] comments  [10] shares
 * [11] posted at, epoch seconds  [12] score in tenths  [13] 1 when the loop video exists
 * [14] optional extras
 */
export type WireVideo = [
  id: string,
  title: string,
  platform: number,
  handle: string | null,
  name: string | null,
  link: string,
  duration: number | null,
  views: number | null,
  likes: number | null,
  comments: number | null,
  shares: number | null,
  posted: number | null,
  score: number | null,
  loop: 0 | 1,
  extra?: WireExtra,
];

/** Videos by niche slug, rank order, as they are listed on the board. */
export type WireNiches = Record<string, WireVideo[]>;

/** The static chunk at /viral-now/seed.json. */
export interface SeedChunk {
  v: number;
  niches: WireNiches;
}

/* ------------------------------------------------------------------ */
/* Conventions                                                         */
/* ------------------------------------------------------------------ */

const mediaBase = (slug: string): string => `/media/viral-now/${slug}`;

interface LinkRule {
  /** The path tail of a post URL, or null when the URL does not match the pattern. */
  tail: (url: string) => string | null;
  post: (handle: string | null, tail: string) => string | null;
  creator: (handle: string) => string;
}

const LINK_RULES: Partial<Record<ViralNowPlatform, LinkRule>> = {
  tiktok: {
    tail: (url) => /^https:\/\/www\.tiktok\.com\/@[^/]+\/video\/(\d+)$/.exec(url)?.[1] ?? null,
    post: (handle, tail) => (handle ? `https://www.tiktok.com/@${handle}/video/${tail}` : null),
    creator: (handle) => `https://www.tiktok.com/@${handle}`,
  },
  instagram: {
    tail: (url) => /^https:\/\/www\.instagram\.com\/reel\/([A-Za-z0-9_-]+)\/$/.exec(url)?.[1] ?? null,
    post: (_handle, tail) => `https://www.instagram.com/reel/${tail}/`,
    creator: (handle) => `https://www.instagram.com/${handle}/`,
  },
  youtube: {
    tail: (url) => /^https:\/\/www\.youtube\.com\/shorts\/([A-Za-z0-9_-]+)$/.exec(url)?.[1] ?? null,
    post: (_handle, tail) => `https://www.youtube.com/shorts/${tail}`,
    creator: (handle) => `https://www.youtube.com/@${handle}`,
  },
};

const ABSOLUTE = /^https?:\/\//i;

const emptyAsset = (): ViralNowAsset => ({ asset_id: null, url: null, expires_at: null, source: null });
const localAsset = (url: string): ViralNowAsset => ({ asset_id: null, url, expires_at: null, source: "local" });

/* ------------------------------------------------------------------ */
/* Decode                                                              */
/* ------------------------------------------------------------------ */

export function decodeVideo(wire: WireVideo, slug: string, week: string | null, index: number): ViralNowVideo {
  const extra = wire[14];
  if (extra?.full) return extra.full;
  const rank = extra?.rank ?? index + 1;
  const platform: ViralNowPlatform = PLATFORM_CODES[wire[2]] ?? "other";
  const handle = wire[3];
  const rule = LINK_RULES[platform];
  const link = wire[5];

  const poster =
    extra && "poster" in extra
      ? extra.poster
        ? localAsset(extra.poster)
        : emptyAsset()
      : localAsset(`${mediaBase(slug)}/${rank}.webp`);
  const video =
    extra?.video !== undefined ? localAsset(extra.video) : wire[13] === 1 ? localAsset(`${mediaBase(slug)}/${rank}.mp4`) : emptyAsset();

  const creatorUrl =
    extra && "creator_url" in extra ? (extra.creator_url ?? null) : rule && handle ? rule.creator(handle) : null;

  const posted = extra && "posted_at" in extra ? (extra.posted_at ?? null) : wire[11] === null ? null : new Date(wire[11] * 1000).toISOString();

  const tenth = (value: number | null): number | null => (value === null ? null : value / 10);

  return {
    id: wire[0],
    niche: slug,
    rank,
    score: extra && "score" in extra ? (extra.score ?? null) : tenth(wire[12]),
    title: wire[1],
    creator: { handle, name: wire[4], url: creatorUrl, avatar: null },
    platform,
    url: ABSOLUTE.test(link) ? link : (rule?.post(handle, link) ?? link),
    poster,
    video,
    duration_seconds: extra && "duration" in extra ? (extra.duration ?? null) : tenth(wire[6]),
    metrics: { views: wire[7], likes: wire[8], comments: wire[9], shares: wire[10], saves: extra?.saves ?? null },
    posted_at: posted,
    week_of: extra && "week_of" in extra ? (extra.week_of ?? null) : week,
    analysis: null,
    source: "seed",
    board_slug: null,
  };
}

export function decodeVideos(wire: WireVideo[], slug: string, week: string | null): ViralNowVideo[] {
  return wire.map((entry, index) => decodeVideo(entry, slug, week, index));
}

/* ------------------------------------------------------------------ */
/* Encode (server side)                                                */
/* ------------------------------------------------------------------ */

/** Key-sorted JSON, so two videos compare equal whatever order their keys were built in. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, inner: unknown) => {
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      return Object.fromEntries(Object.entries(inner as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)));
    }
    return inner;
  });
}

const sameVideo = (a: ViralNowVideo, b: ViralNowVideo): boolean => canonical(a) === canonical(b);

/** A tenth-of-a-unit integer when `value` has at most one decimal, else null. */
function toTenths(value: number | null): number | null | undefined {
  if (value === null) return null;
  const tenths = Math.round(value * 10);
  return tenths / 10 === value ? tenths : undefined;
}

export function encodeVideo(video: ViralNowVideo, slug: string, week: string | null, index: number): WireVideo {
  const extra: WireExtra = {};
  const platformCode = Math.max(PLATFORM_CODES.indexOf(video.platform), 0);
  const rule = LINK_RULES[video.platform];
  const handle = video.creator.handle;

  if (video.rank !== index + 1) extra.rank = video.rank;
  const rank = video.rank;

  const tail = rule?.tail(video.url) ?? null;
  const link = tail !== null && rule?.post(handle, tail) === video.url ? tail : video.url;

  const expectedCreator = rule && handle ? rule.creator(handle) : null;
  if (video.creator.url !== expectedCreator) extra.creator_url = video.creator.url;

  const posterOk = video.poster.source === "local" && video.poster.url === `${mediaBase(slug)}/${rank}.webp`;
  const posterBlank = video.poster.url === null && video.poster.source === null;
  if (!posterOk) extra.poster = posterBlank ? null : video.poster.url;

  const loopOk = video.video.source === "local" && video.video.url === `${mediaBase(slug)}/${rank}.mp4`;
  const loopBlank = video.video.url === null && video.video.source === null;
  if (!loopOk && !loopBlank && video.video.url) extra.video = video.video.url;

  const duration = toTenths(video.duration_seconds);
  if (duration === undefined) extra.duration = video.duration_seconds;
  const score = toTenths(video.score);
  if (score === undefined) extra.score = video.score;

  let posted: number | null = null;
  if (video.posted_at !== null) {
    const ms = Date.parse(video.posted_at);
    if (Number.isFinite(ms) && ms % 1000 === 0 && new Date(ms).toISOString() === video.posted_at) posted = ms / 1000;
    else extra.posted_at = video.posted_at;
  }

  if (video.week_of !== week) extra.week_of = video.week_of;
  if (video.metrics.saves !== null) extra.saves = video.metrics.saves;

  const tuple: WireVideo = [
    video.id,
    video.title,
    platformCode,
    handle,
    video.creator.name,
    link,
    duration ?? null,
    video.metrics.views,
    video.metrics.likes,
    video.metrics.comments,
    video.metrics.shares,
    posted,
    score ?? null,
    loopOk ? 1 : 0,
  ];
  if (Object.keys(extra).length > 0) tuple.push(extra);

  if (sameVideo(decodeVideo(tuple, slug, week, index), video)) return tuple;
  // The compact fields cannot reproduce this video (an analysis, an avatar, a new field...). Send it whole.
  return [video.id, video.title, platformCode, handle, video.creator.name, video.url, null, null, null, null, null, null, null, 0, { full: video }];
}

export function encodeVideos(videos: ViralNowVideo[], slug: string, week: string | null): WireVideo[] {
  return videos.map((video, index) => encodeVideo(video, slug, week, index));
}

/* ------------------------------------------------------------------ */
/* Shells and merging                                                  */
/* ------------------------------------------------------------------ */

export function summarize(videos: ViralNowVideo[]): ViralNowNicheSummary {
  let total: number | null = null;
  const present = new Set<ViralNowPlatform>();
  for (const video of videos) {
    present.add(video.platform);
    if (video.metrics.views !== null) total = (total ?? 0) + video.metrics.views;
  }
  return {
    total_views: total,
    platforms: PLATFORM_ORDER.filter((platform) => present.has(platform)),
    cover: videos[0]?.poster.url ?? null,
  };
}

/** A seed niche without its videos: everything the first paint needs to describe the board. */
export function nicheShell(niche: ViralNowNiche): ViralNowNiche {
  return { ...niche, videos: [], summary: niche.summary ?? summarize(niche.videos) };
}

/** True while a seed niche still has videos to stream in. */
export const needsSeedVideos = (niche: ViralNowNiche): boolean => niche.source === "seed" && niche.videos.length < niche.video_count;

/** Fill shells with the compact videos that came with the first paint. */
export function hydrateNiches(shells: ViralNowNiche[], wire: WireNiches): ViralNowNiche[] {
  return shells.map((shell) => {
    const entries = wire[shell.slug];
    return entries && entries.length > shell.videos.length
      ? { ...shell, videos: decodeVideos(entries, shell.slug, shell.week_of) }
      : shell;
  });
}

/**
 * Fill every seed niche that is still incomplete from the chunk. Niches that have been replaced
 * by live boards, or already hold all their videos, are left exactly as they are.
 */
export function mergeSeedChunk(current: ViralNowNiche[], chunk: SeedChunk): ViralNowNiche[] {
  return current.map((niche) => {
    if (!needsSeedVideos(niche)) return niche;
    const entries = chunk.niches[niche.slug];
    return entries && entries.length > niche.videos.length
      ? { ...niche, videos: decodeVideos(entries, niche.slug, niche.week_of) }
      : niche;
  });
}
