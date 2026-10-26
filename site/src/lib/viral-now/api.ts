/**
 * Viral Now fetch adapter.
 *
 * Talks to the hosted ContHunt API through relative `/v1/...` URLs. In the
 * browser they hit the landing site's own `/v1` rewrite (same origin, so CORS
 * never applies). On the server a relative URL cannot resolve, so the adapter
 * uses an absolute base from NEXT_PUBLIC_BACKEND_URL.
 *
 * Depends only on ./types. Runs in the browser, Node 20+ and the Edge runtime.
 *
 * Fallback order (see resolveViralNow): live `viral-now-*` public boards, then
 * the bundled seed snapshot, then the trending feed.
 */
import type {
  ApiFineGrainedAnalysis,
  ApiMediaAccess,
  ApiPublicAnalysis,
  ApiPublicBoard,
  ApiPublicBoardAsset,
  ApiPublicBoardItem,
  ApiPublicBoardItems,
  ApiPublicBoardList,
  ApiTrendingItem,
  ApiTrendingNiche,
  ApiTrendingResponse,
  ViralNowAnalysis,
  ViralNowAsset,
  ViralNowCreator,
  ViralNowDiagnostics,
  ViralNowMetrics,
  ViralNowNiche,
  ViralNowNicheMeta,
  ViralNowPlatform,
  ViralNowRenewal,
  ViralNowSnapshot,
  ViralNowVideo,
} from "./types";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

/** public_boards.category for every Viral Now board. */
export const VIRAL_NOW_CATEGORY = "viral-now";
/** public_boards.slug is `viral-now-${niche.slug}`. */
export const VIRAL_NOW_BOARD_PREFIX = "viral-now-";
export const TRENDING_NICHE_SLUG = "trending";

/** Public-board list endpoint caps: boards per page 20, preview items per board 24, items per page 80. */
export const API_LIMITS = { boards: 20, preview: 24, items: 80 } as const;

/** Signed URLs live about an hour. Renew when one minute is left (same window as the app). */
export const RENEW_SKEW_MS = 60_000;

const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_LIST_PAGES = 5;

export const viralNowBoardSlug = (nicheSlug: string): string => `${VIRAL_NOW_BOARD_PREFIX}${nicheSlug}`;
export const nicheSlugFromBoard = (boardSlug: string): string =>
  boardSlug.startsWith(VIRAL_NOW_BOARD_PREFIX) ? boardSlug.slice(VIRAL_NOW_BOARD_PREFIX.length) : boardSlug;

/* ------------------------------------------------------------------ */
/* Transport                                                           */
/* ------------------------------------------------------------------ */

export interface FetchOptions {
  /** Origin override, for example in tests. Default: "" in the browser, NEXT_PUBLIC_BACKEND_URL on the server. */
  baseUrl?: string;
  signal?: AbortSignal;
  /** Default 15000. */
  timeoutMs?: number;
  /**
   * Next.js data cache, server side only. A number sets `next.revalidate`
   * (seconds); `false` sets `cache: "no-store"`. Keep this under 1500 so the
   * signed URLs inside a cached response stay valid for most of their hour.
   */
  revalidate?: number | false;
  /** Injected fetch, for tests. */
  fetchImpl?: typeof fetch;
}

export class ViralNowApiError extends Error {
  readonly status: number;
  readonly path: string;
  constructor(status: number, path: string, message: string) {
    super(message);
    this.name = "ViralNowApiError";
    this.status = status;
    this.path = path;
  }
}

function readEnv(name: string): string | undefined {
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
  return g.process?.env?.[name];
}

function apiBase(baseUrl?: string): string {
  if (baseUrl !== undefined) return baseUrl.replace(/\/+$/, "");
  if (typeof window !== "undefined") return "";
  const env = readEnv("NEXT_PUBLIC_BACKEND_URL");
  if (!env) throw new ViralNowApiError(0, "", "NEXT_PUBLIC_BACKEND_URL is not set; cannot call the API on the server");
  return env.replace(/\/+$/, "").replace(/\/v1$/, "");
}

type Query = Record<string, string | number | undefined>;

function buildUrl(path: string, query: Query | undefined, baseUrl?: string): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const suffix = search.toString();
  return `${apiBase(baseUrl)}${path}${suffix ? `?${suffix}` : ""}`;
}

function guard(signal: AbortSignal | undefined, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  const relay = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", relay, { once: true });
  return {
    signal: controller.signal,
    done: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", relay);
    },
  };
}

async function requestJson<T>(path: string, opts: FetchOptions = {}, query?: Query): Promise<T> {
  const url = buildUrl(path, query, opts.baseUrl);
  const run = opts.fetchImpl ?? fetch;
  const timed = guard(opts.signal, opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const init: Record<string, unknown> = {
    method: "GET",
    headers: { accept: "application/json" },
    credentials: "omit",
    signal: timed.signal,
  };
  if (opts.revalidate === false) init.cache = "no-store";
  else if (typeof opts.revalidate === "number" && typeof window === "undefined") init.next = { revalidate: opts.revalidate };
  try {
    const response = await run(url, init as RequestInit);
    if (!response.ok) {
      let detail = response.statusText;
      try {
        const body = (await response.json()) as { detail?: unknown };
        if (typeof body.detail === "string") detail = body.detail;
      } catch {
        /* keep statusText */
      }
      throw new ViralNowApiError(response.status, path, detail || `HTTP ${response.status}`);
    }
    try {
      return (await response.json()) as T;
    } catch {
      throw new ViralNowApiError(response.status, path, "Response was not valid JSON");
    }
  } catch (error) {
    if (error instanceof ViralNowApiError) throw error;
    const aborted = error instanceof Error && error.name === "AbortError";
    throw new ViralNowApiError(0, path, aborted ? "Request timed out or was aborted" : error instanceof Error ? error.message : "Network error");
  } finally {
    timed.done();
  }
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);
const str = (value: unknown): string | null => (typeof value === "string" && value.trim() !== "" ? value : null);

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/** Monday (UTC) of the week containing `input`, as YYYY-MM-DD. */
export function weekOf(input: string | number | Date | null | undefined): string | null {
  if (input === null || input === undefined || input === "") return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  const sinceMonday = (date.getUTCDay() + 6) % 7;
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - sinceMonday));
  return monday.toISOString().slice(0, 10);
}

export function normalizePlatform(value: string | null | undefined): ViralNowPlatform {
  const platform = (value ?? "").toLowerCase();
  if (platform.startsWith("tiktok")) return "tiktok";
  if (platform.startsWith("instagram")) return "instagram";
  if (platform.startsWith("youtube")) return "youtube";
  if (platform.startsWith("pinterest")) return "pinterest";
  return "other";
}

/** Clamp to 0..100 with one decimal. */
export function normalizeScore(score: number | null | undefined): number | null {
  const value = num(score);
  if (value === null) return null;
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
}

/** `title` is often "" or null; captions start with the useful line. */
export function deriveTitle(title: string | null | undefined, primaryText: string | null | undefined): string {
  const direct = (title ?? "").trim();
  if (direct) return clip(direct, 140);
  const firstLine = (primaryText ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line !== "");
  return firstLine ? clip(firstLine, 140) : "Untitled video";
}

const EMPTY_ASSET: ViralNowAsset = { asset_id: null, url: null, expires_at: null, source: null };

/** True when the URL can go straight into <video src> or <img src>. */
export function isPlayable(asset: ViralNowAsset): boolean {
  return asset.url !== null && (asset.source === "r2" || asset.source === "local");
}

/* ------------------------------------------------------------------ */
/* Mapping: public-board items                                         */
/* ------------------------------------------------------------------ */

function assetFrom(asset: ApiPublicBoardAsset | undefined): ViralNowAsset {
  if (!asset) return { ...EMPTY_ASSET };
  if (asset.signed_url) {
    return { asset_id: asset.id, url: asset.signed_url, expires_at: asset.expires_at, source: "r2" };
  }
  const origin = asset.source_url && /^https?:\/\//i.test(asset.source_url) ? asset.source_url : null;
  return origin
    ? { asset_id: asset.id, url: origin, expires_at: null, source: "origin" }
    : { asset_id: asset.id, url: null, expires_at: null, source: null };
}

const POSTER_ORDER = ["thumbnail", "cover", "image"] as const;

function pickPoster(assets: ApiPublicBoardAsset[]): ViralNowAsset {
  for (const type of POSTER_ORDER) {
    const hit = assets.find((asset) => asset.asset_type === type && asset.signed_url);
    if (hit) return assetFrom(hit);
  }
  for (const type of POSTER_ORDER) {
    const hit = assets.find((asset) => asset.asset_type === type && asset.source_url);
    if (hit) return assetFrom(hit);
  }
  return { ...EMPTY_ASSET };
}

function pickVideo(assets: ApiPublicBoardAsset[], analysisAssetId: string): ViralNowAsset {
  const hit =
    assets.find((asset) => asset.id === analysisAssetId) ?? assets.find((asset) => asset.asset_type === "video");
  return assetFrom(hit);
}

function creatorFrom(item: ApiPublicBoardItem["content_item"], platform: ViralNowPlatform): ViralNowCreator {
  const handle = str(item.creator_handle)?.replace(/^@/, "") ?? null;
  const url = str(item.author_url) ?? (platform === "tiktok" && handle ? `https://www.tiktok.com/@${handle}` : null);
  return { handle, name: str(item.author_name), url, avatar: str(item.author_image_url) };
}

function metricsFrom(raw: Record<string, number | null> | undefined): ViralNowMetrics {
  const m = raw ?? {};
  return {
    views: num(m.views) ?? num(m.plays),
    likes: num(m.likes),
    comments: num(m.comments),
    shares: num(m.shares),
    saves: num(m.saves),
  };
}

export interface BoardItemContext {
  niche: string;
  boardSlug: string;
  /** Rank to use when the API returns 0. */
  fallbackRank: number;
  /** Used for week_of when the item has no snapshot_date. */
  updatedAt?: string | null;
}

export function mapBoardItem(item: ApiPublicBoardItem, ctx: BoardItemContext): ViralNowVideo {
  const content = item.content_item;
  const platform = normalizePlatform(content.platform);
  return {
    id: content.id,
    niche: ctx.niche,
    rank: item.rank > 0 ? item.rank : ctx.fallbackRank,
    score: normalizeScore(item.score),
    movement: item.mark ?? null,
    delta: typeof item.delta === "number" ? item.delta : null,
    title: deriveTitle(content.title, content.primary_text),
    creator: creatorFrom(content, platform),
    platform,
    url: content.canonical_url ?? "",
    poster: pickPoster(item.assets),
    video: pickVideo(item.assets, item.analysis_media_asset_id),
    duration_seconds: null,
    metrics: metricsFrom(content.metrics),
    posted_at: content.published_at,
    week_of: weekOf(item.snapshot_date ?? ctx.updatedAt),
    analysis: null,
    source: "live",
    board_slug: ctx.boardSlug,
  };
}

export function mapBoardToNiche(
  board: ApiPublicBoard,
  items: ApiPublicBoardItem[],
  meta?: ViralNowNicheMeta,
): ViralNowNiche {
  const niche = meta?.slug ?? nicheSlugFromBoard(board.slug);
  const updatedAt = board.last_refreshed_at ?? board.updated_at;
  const videos = items
    .map((item, index) => mapBoardItem(item, { niche, boardSlug: board.slug, fallbackRank: index + 1, updatedAt }))
    .filter((video) => video.video.url !== null)
    .sort((a, b) => a.rank - b.rank);
  return {
    slug: niche,
    name: meta?.name ?? board.title,
    label: meta?.label ?? meta?.name ?? board.title,
    description: meta?.description ?? board.description ?? "",
    board_slug: board.slug,
    source: "live",
    week_of: videos[0]?.week_of ?? weekOf(updatedAt),
    updated_at: updatedAt,
    video_count: Math.max(board.item_count, videos.length),
    videos,
  };
}

/* ------------------------------------------------------------------ */
/* Mapping: trending items                                             */
/* ------------------------------------------------------------------ */

export function mapTrendingItem(item: ApiTrendingItem, rank: number, now: number = Date.now()): ViralNowVideo {
  const handle = str(item.author?.uniqueId);
  return {
    id: item.id,
    niche: TRENDING_NICHE_SLUG,
    rank,
    score: null,
    title: deriveTitle(item.title, null),
    creator: {
      handle,
      name: str(item.creator_name) ?? str(item.author?.nickname),
      url: handle ? `https://www.tiktok.com/@${handle}` : null,
      avatar: str(item.creator_image) ?? str(item.author?.avatar),
    },
    platform: normalizePlatform(item.platform),
    url: item.url ?? "",
    poster: {
      asset_id: item.thumbnail_asset_id,
      url: item.thumbnail_url,
      expires_at: item.thumbnail_expires_at,
      source: "r2",
    },
    video: { asset_id: item.playback_asset_id, url: item.video_url, expires_at: item.playback_expires_at, source: "r2" },
    duration_seconds: num(item.duration) && item.duration > 0 ? item.duration : null,
    metrics: {
      views: num(item.view_count),
      likes: num(item.like_count),
      comments: num(item.comment_count),
      shares: num(item.share_count),
      saves: null,
    },
    posted_at: null,
    week_of: weekOf(now),
    analysis: null,
    source: "trending",
    board_slug: null,
  };
}

/* ------------------------------------------------------------------ */
/* Mapping: analysis                                                   */
/* ------------------------------------------------------------------ */

export function mapAnalysis(fine: ApiFineGrainedAnalysis | null | undefined): ViralNowAnalysis | null {
  if (!fine || typeof fine !== "object") return null;
  const hook = fine.hooks?.[0];
  const result: ViralNowAnalysis = {
    hook: str(hook?.visual_hook) ?? str(hook?.spoken_hook) ?? str(hook?.on_screen_text) ?? str(hook?.payoff),
    hook_type: str(hook?.type),
    summary: str(fine.creative_summary),
    retention: (fine.retention_devices ?? [])
      .map((entry) => str(entry?.insight))
      .filter((line): line is string => line !== null)
      .slice(0, 3),
    pattern: str(fine.replicable_patterns?.[0]?.tactic),
    emotion: str(fine.emotional_drivers?.[0]?.insight),
    cta: str(fine.call_to_action?.wording),
  };
  const empty =
    !result.hook && !result.summary && result.retention.length === 0 && !result.pattern && !result.emotion && !result.cta;
  return empty ? null : result;
}

/* ------------------------------------------------------------------ */
/* Fetchers                                                            */
/* ------------------------------------------------------------------ */

export interface LiveOptions extends FetchOptions {
  /** Niche facts from src/content/viral-now/niches.json. Sets display order and names. */
  metas?: ViralNowNicheMeta[];
  /** Preview items per board, 1..24. Default 24. */
  previewLimit?: number;
}

/** Wire-level: every published board whose category is "viral-now". */
export async function listLiveBoards(opts: LiveOptions = {}): Promise<ApiPublicBoardList["boards"]> {
  const boards: ApiPublicBoardList["boards"] = [];
  let cursor: string | undefined;
  for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
    const body = await requestJson<ApiPublicBoardList>("/v1/public-boards/search", opts, {
      q: VIRAL_NOW_CATEGORY,
      limit: API_LIMITS.boards,
      preview_limit: Math.min(Math.max(opts.previewLimit ?? API_LIMITS.preview, 1), API_LIMITS.preview),
      cursor,
    });
    boards.push(...body.boards);
    if (!body.next_cursor) break;
    cursor = body.next_cursor;
  }
  // The search is a substring match on title, description and category; keep only ours.
  return boards.filter((board) => board.category === VIRAL_NOW_CATEGORY && board.slug.startsWith(VIRAL_NOW_BOARD_PREFIX));
}

/** Live niche rows: one request (plus paging). Each niche carries up to `previewLimit` videos. */
export async function fetchLiveNiches(opts: LiveOptions = {}): Promise<ViralNowNiche[]> {
  const boards = await listLiveBoards(opts);
  const metaBySlug = new Map((opts.metas ?? []).map((meta) => [meta.slug, meta] as const));
  const niches = boards.map((board) => mapBoardToNiche(board, board.preview_items, metaBySlug.get(nicheSlugFromBoard(board.slug))));
  const order = new Map((opts.metas ?? []).map((meta, index) => [meta.slug, index] as const));
  const position = (slug: string): number => order.get(slug) ?? Number.MAX_SAFE_INTEGER;
  // Array.prototype.sort is stable, so unlisted niches keep the API's rank order.
  return niches.sort((a, b) => position(a.slug) - position(b.slug));
}

/**
 * One niche with up to `limit` (default 30) videos, for the grid.
 * Accepts the niche slug ("fitness-gym") or the board slug ("viral-now-fitness-gym").
 * Returns null when the board is not published.
 */
export async function fetchNicheVideos(
  nicheOrBoardSlug: string,
  opts: FetchOptions & { limit?: number; meta?: ViralNowNicheMeta } = {},
): Promise<ViralNowNiche | null> {
  const boardSlug = nicheOrBoardSlug.startsWith(VIRAL_NOW_BOARD_PREFIX) ? nicheOrBoardSlug : viralNowBoardSlug(nicheOrBoardSlug);
  return fetchBoardAsNiche(boardSlug, opts);
}

/** Any public board as a niche. Used by fetchNicheVideos and by tests against the legacy boards. */
export async function fetchBoardAsNiche(
  boardSlug: string,
  opts: FetchOptions & { limit?: number; meta?: ViralNowNicheMeta } = {},
): Promise<ViralNowNiche | null> {
  const slug = encodeURIComponent(boardSlug);
  try {
    const [board, items] = await Promise.all([
      requestJson<ApiPublicBoard>(`/v1/public-boards/${slug}`, opts),
      requestJson<ApiPublicBoardItems>(`/v1/public-boards/${slug}/items`, opts, {
        limit: Math.min(Math.max(opts.limit ?? 30, 1), API_LIMITS.items),
      }),
    ]);
    return mapBoardToNiche(board, items.items, opts.meta);
  } catch (error) {
    if (error instanceof ViralNowApiError && error.status === 404) return null;
    throw error;
  }
}

/** Saved analysis, trimmed for a card. Null when there is none (404). */
export async function fetchAnalysis(
  boardSlug: string,
  contentItemId: string,
  opts: FetchOptions = {},
): Promise<ViralNowAnalysis | null> {
  try {
    const body = await requestJson<ApiPublicAnalysis>(
      `/v1/public-boards/${encodeURIComponent(boardSlug)}/items/${encodeURIComponent(contentItemId)}/analysis`,
      opts,
    );
    return mapAnalysis(body.fine_grained);
  } catch (error) {
    if (error instanceof ViralNowApiError && error.status === 404) return null;
    throw error;
  }
}

/** Last tier: the shared trending feed as a single "Trending now" niche. Max 50. */
export async function fetchTrending(opts: FetchOptions & { count?: number } = {}): Promise<ViralNowNiche> {
  const body = await requestJson<ApiTrendingResponse>("/v1/trending/tiktok", opts, {
    count: Math.min(Math.max(opts.count ?? 30, 1), 50),
  });
  const now = Date.now();
  const videos = body.items.map((item, index) => mapTrendingItem(item, index + 1, now));
  return {
    slug: TRENDING_NICHE_SLUG,
    name: "Trending now",
    label: "Trending",
    description: "What is spiking on TikTok today.",
    board_slug: "",
    source: "trending",
    week_of: weekOf(now),
    updated_at: null,
    video_count: videos.length,
    videos,
  };
}

/** Daily topic list (keyword, hashtags, direction). 15+ entries, includes cooling topics. */
export function fetchTrendingTopics(opts: FetchOptions = {}): Promise<ApiTrendingNiche[]> {
  return requestJson<ApiTrendingNiche[]>("/v1/trending/niches", opts);
}

/* ------------------------------------------------------------------ */
/* Seed snapshot                                                       */
/* ------------------------------------------------------------------ */

function seedAsset(value: unknown): ViralNowAsset {
  if (typeof value === "string") return { asset_id: null, url: value, expires_at: null, source: "local" };
  if (!isRecord(value)) return { ...EMPTY_ASSET };
  const url = str(value.url);
  return { asset_id: null, url, expires_at: null, source: url ? "local" : null };
}

function seedVideo(raw: unknown, niche: string, index: number): ViralNowVideo | null {
  if (!isRecord(raw)) return null;
  const id = str(raw.id);
  if (!id) return null;
  const creator = isRecord(raw.creator) ? raw.creator : {};
  const metrics = isRecord(raw.metrics) ? raw.metrics : {};
  return {
    id,
    niche,
    rank: num(raw.rank) ?? index + 1,
    score: normalizeScore(num(raw.score)),
    title: str(raw.title) ?? "Untitled video",
    creator: { handle: str(creator.handle), name: str(creator.name), url: str(creator.url), avatar: null },
    platform: normalizePlatform(str(raw.platform)),
    url: str(raw.url) ?? "",
    poster: seedAsset(raw.poster),
    video: seedAsset(raw.video),
    duration_seconds: num(raw.duration_seconds),
    metrics: {
      views: num(metrics.views),
      likes: num(metrics.likes),
      comments: num(metrics.comments),
      shares: num(metrics.shares),
      saves: num(metrics.saves),
    },
    posted_at: str(raw.posted_at),
    week_of: str(raw.week_of),
    analysis: isRecord(raw.analysis) ? (mapSeedAnalysis(raw.analysis) ?? null) : null,
    source: "seed",
    board_slug: null,
  };
}

function mapSeedAnalysis(raw: Record<string, unknown>): ViralNowAnalysis {
  return {
    hook: str(raw.hook),
    hook_type: str(raw.hook_type),
    summary: str(raw.summary),
    retention: Array.isArray(raw.retention) ? raw.retention.filter((x): x is string => typeof x === "string").slice(0, 3) : [],
    pattern: str(raw.pattern),
    emotion: str(raw.emotion),
    cta: str(raw.cta),
  };
}

/**
 * Validate and normalize the contents of src/content/viral-now/seed.json.
 * Accepts `{ niches: [...] }` or a bare array of niches. Videos without an id are dropped.
 */
export function coerceSeed(raw: unknown, metas: ViralNowNicheMeta[] = []): ViralNowNiche[] {
  const list = isRecord(raw) ? raw.niches : raw;
  if (!Array.isArray(list)) return [];
  const metaBySlug = new Map(metas.map((meta) => [meta.slug, meta] as const));
  const niches: ViralNowNiche[] = [];
  for (const entry of list) {
    if (!isRecord(entry)) continue;
    const slug = str(entry.slug);
    if (!slug || !Array.isArray(entry.videos)) continue;
    const meta = metaBySlug.get(slug);
    const videos = entry.videos
      .map((video, index) => seedVideo(video, slug, index))
      .filter((video): video is ViralNowVideo => video !== null)
      .sort((a, b) => a.rank - b.rank);
    if (videos.length === 0) continue;
    niches.push({
      slug,
      name: meta?.name ?? str(entry.name) ?? slug,
      label: meta?.label ?? str(entry.label) ?? meta?.name ?? str(entry.name) ?? slug,
      description: meta?.description ?? str(entry.description) ?? "",
      board_slug: viralNowBoardSlug(slug),
      source: "seed",
      week_of: str(entry.week_of) ?? videos[0]?.week_of ?? null,
      updated_at: str(entry.updated_at),
      video_count: videos.length,
      videos,
    });
  }
  return niches;
}

/* ------------------------------------------------------------------ */
/* Orchestration: live, then seed, then trending                       */
/* ------------------------------------------------------------------ */

export interface ResolveOptions extends LiveOptions {
  /** Parsed contents of seed.json (the loader lives in the page, this file imports nothing). */
  seed?: unknown;
  /** A live niche with fewer videos than this is treated as "not ready" and the seed is used. Default 12. */
  minLiveVideos?: number;
  /**
   * auto: add the trending tier only when no niche has live or seed data.
   * always: append it as an extra "Trending now" niche. never: skip it.
   */
  trending?: "auto" | "always" | "never";
  trendingCount?: number;
}

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : "Unknown error");

/**
 * Builds the snapshot a page renders. Never throws.
 * Tier is chosen per niche: a niche uses its live board when it has at least
 * `minLiveVideos`, otherwise the seed, otherwise it is omitted.
 */
export async function resolveViralNow(opts: ResolveOptions = {}): Promise<ViralNowSnapshot> {
  const metas = opts.metas ?? [];
  const minLive = opts.minLiveVideos ?? 12;
  const diagnostics: ViralNowDiagnostics = {
    live: { ok: false, niches: 0, error: null },
    seed: { ok: false, niches: 0 },
    trending: { used: false, ok: false, videos: 0, error: null },
    tiers: {},
  };

  let live: ViralNowNiche[] = [];
  try {
    live = await fetchLiveNiches(opts);
    diagnostics.live = { ok: true, niches: live.length, error: null };
  } catch (error) {
    diagnostics.live = { ok: false, niches: 0, error: messageOf(error) };
  }

  const seed = coerceSeed(opts.seed, metas);
  diagnostics.seed = { ok: seed.length > 0, niches: seed.length };

  const liveBySlug = new Map(live.map((niche) => [niche.slug, niche] as const));
  const seedBySlug = new Map(seed.map((niche) => [niche.slug, niche] as const));
  const order = metas.length > 0 ? metas.map((meta) => meta.slug) : [...new Set([...live, ...seed].map((niche) => niche.slug))];

  const niches: ViralNowNiche[] = [];
  for (const slug of order) {
    const fromLive = liveBySlug.get(slug);
    const fromSeed = seedBySlug.get(slug);
    const chosen = fromLive && fromLive.videos.length >= minLive ? fromLive : (fromSeed ?? (fromLive && fromLive.videos.length > 0 ? fromLive : undefined));
    if (!chosen) continue;
    diagnostics.tiers[slug] = chosen.source;
    niches.push(chosen);
  }

  const mode = opts.trending ?? "auto";
  if (mode === "always" || (mode === "auto" && niches.length === 0)) {
    diagnostics.trending.used = true;
    try {
      const trending = await fetchTrending({ ...opts, count: opts.trendingCount });
      diagnostics.trending = { used: true, ok: trending.videos.length > 0, videos: trending.videos.length, error: null };
      if (trending.videos.length > 0) {
        diagnostics.tiers[TRENDING_NICHE_SLUG] = "trending";
        niches.push(trending);
      }
    } catch (error) {
      diagnostics.trending = { used: true, ok: false, videos: 0, error: messageOf(error) };
    }
  }

  const weeks = niches.map((niche) => niche.week_of).filter((week): week is string => week !== null).sort();
  return {
    generated_at: new Date().toISOString(),
    week_of: weeks[weeks.length - 1] ?? null,
    niches,
    diagnostics,
  };
}

/* ------------------------------------------------------------------ */
/* Signed-URL renewal                                                  */
/* ------------------------------------------------------------------ */

/** True when the asset is a renewable R2 URL with `skewMs` or less left (or already expired). */
export function needsRenewal(asset: ViralNowAsset, now: number = Date.now(), skewMs: number = RENEW_SKEW_MS): boolean {
  const left = msUntilRenewal(asset, now, skewMs);
  return left !== null && left <= 0;
}

/**
 * Milliseconds until a timer should fire to renew this asset, or null when it
 * never needs renewal. Schedule `setTimeout(renew, ms)` and re-schedule from
 * the renewed asset. Also re-check on `visibilitychange` and on media `error`.
 */
export function msUntilRenewal(asset: ViralNowAsset, now: number = Date.now(), skewMs: number = RENEW_SKEW_MS): number | null {
  if (!asset.asset_id || asset.source !== "r2" || !asset.expires_at) return null;
  const expires = Date.parse(asset.expires_at);
  if (!Number.isFinite(expires)) return null;
  return expires - skewMs - now;
}

function renewalPath(video: ViralNowVideo, assetId: string): string | null {
  const id = encodeURIComponent(assetId);
  if (video.source === "trending") return `/v1/trending/media/${id}/signed-url`;
  if (video.source === "live" && video.board_slug) return `/v1/public-boards/${encodeURIComponent(video.board_slug)}/media/${id}/signed-url`;
  return null;
}

/**
 * Ask the API for a fresh signed URL for one asset of one video.
 * Seed (local) assets and assets without an id are not renewable and return an error result.
 */
export async function renewAsset(
  video: ViralNowVideo,
  kind: "poster" | "video",
  opts: FetchOptions = {},
): Promise<ViralNowRenewal> {
  const current = video[kind];
  const path = current.asset_id ? renewalPath(video, current.asset_id) : null;
  if (!current.asset_id || !path || current.source === "local") {
    return { status: "error", error: "Asset is not renewable" };
  }
  try {
    const body = await requestJson<ApiMediaAccess>(path, { ...opts, revalidate: false });
    if (typeof body.url !== "string" || body.url === "") return { status: "error", error: "Empty URL in response" };
    const expiresAt =
      body.expires_at ?? (body.expires_in > 0 ? new Date(Date.now() + body.expires_in * 1000).toISOString() : null);
    if (body.url === current.url) return { status: "error", error: "API returned the same URL" };
    return {
      status: "renewed",
      asset: { asset_id: current.asset_id, url: body.url, expires_at: expiresAt, source: body.source },
    };
  } catch (error) {
    if (error instanceof ViralNowApiError && (error.status === 403 || error.status === 404)) return { status: "revoked" };
    return { status: "error", error: messageOf(error) };
  }
}

/**
 * Renewal queue: one in-flight request per asset, at most `concurrency` (default 2)
 * running at once, the same limits as the app's media access store.
 */
export function createMediaRenewer(opts: FetchOptions & { concurrency?: number } = {}) {
  const limit = Math.max(1, opts.concurrency ?? 2);
  const inflight = new Map<string, Promise<ViralNowRenewal>>();
  const waiting: Array<() => void> = [];
  let running = 0;

  const acquire = (): Promise<void> => {
    if (running < limit) {
      running += 1;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      waiting.push(() => {
        running += 1;
        resolve();
      });
    });
  };
  const release = () => {
    running -= 1;
    waiting.shift()?.();
  };

  return {
    renew(video: ViralNowVideo, kind: "poster" | "video", signal?: AbortSignal): Promise<ViralNowRenewal> {
      const key = `${video.source}:${video.board_slug ?? ""}:${video[kind].asset_id ?? ""}`;
      const existing = inflight.get(key);
      if (existing) return existing;
      const task = (async () => {
        await acquire();
        try {
          return await renewAsset(video, kind, { ...opts, signal: signal ?? opts.signal });
        } finally {
          release();
        }
      })().finally(() => inflight.delete(key));
      inflight.set(key, task);
      return task;
    },
  };
}
