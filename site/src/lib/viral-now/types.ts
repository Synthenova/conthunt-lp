/**
 * Viral Now data contract (landing page).
 *
 * Standalone: no imports. Two layers live here.
 *  1. `ViralNow*` types are what every page component consumes. They are
 *     source-agnostic: live public boards, the bundled seed snapshot and the
 *     trending feed all map into the same shapes.
 *  2. `Api*` types mirror the hosted ContHunt API payloads exactly as fetched
 *     on 2026-10-14 (see docs/revamp/specs/viral-now-spec.md for samples).
 *
 * Mapping rules and the fallback order are documented in the spec and
 * implemented in ./api.ts.
 */

/* ------------------------------------------------------------------ */
/* Landing-side types                                                  */
/* ------------------------------------------------------------------ */

/** Where a niche or video came from. Fallback order: live, then seed, then trending. */
export type ViralNowSource = "live" | "seed" | "trending";

export type ViralNowPlatform = "tiktok" | "instagram" | "youtube" | "pinterest" | "other";

/**
 * r2     signed object-storage URL, expires (about 1 hour), renewable.
 * origin third-party URL (YouTube watch page, platform CDN). No expiry we control.
 * local  file bundled with the landing site (seed snapshot). Never expires.
 */
export type ViralNowAssetSource = "r2" | "origin" | "local";

/** A poster image or a playable video file, plus what is needed to renew it. */
export interface ViralNowAsset {
  /** media_assets.id. Null for bundled files. Required for renewal. */
  asset_id: string | null;
  /** URL to put in <img src> or <video src>. Null when nothing usable exists. */
  url: string | null;
  /** ISO timestamp. Null means the URL does not expire. */
  expires_at: string | null;
  source: ViralNowAssetSource | null;
}

export interface ViralNowCreator {
  /** Platform handle without the leading @. */
  handle: string | null;
  /** Display name. */
  name: string | null;
  /** Profile URL on the platform. */
  url: string | null;
  /** Third-party avatar URL. May expire or be hotlink-blocked; always render an initials fallback. */
  avatar: string | null;
}

/** Raw platform counters. Null means "unknown", never zero. */
export interface ViralNowMetrics {
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
}

/**
 * Short, card-sized view of a saved video analysis. Public-board list payloads do
 * not carry it, so live videos have `analysis: null` until `fetchAnalysis` runs
 * (on hover or open). Seed videos may ship it pre-filled.
 */
export interface ViralNowAnalysis {
  /** One sentence: what the hook is. */
  hook: string | null;
  /** Hook family, for example "Visual revelation". */
  hook_type: string | null;
  /** creative_summary from the structured analysis. */
  summary: string | null;
  /** Up to three retention devices, one line each. */
  retention: string[];
  /** Name of the first replicable pattern. */
  pattern: string | null;
  /** First emotional driver, one line. */
  emotion: string | null;
  /** Call to action wording, when there is one. */
  cta: string | null;
}

export interface ViralNowVideo {
  /** content_items.id (UUID). Stable across weeks, so a repeat winner keeps its id. */
  id: string;
  /** Niche slug, for example "fitness-gym". "trending" for the trending tier. */
  niche: string;
  /** 1-based position inside the niche. 1 is the best. */
  rank: number;
  /** JEV composite, 0 to 100. Null for trending and for boards without a score. */
  score: number | null;
  title: string;
  creator: ViralNowCreator;
  platform: ViralNowPlatform;
  /** Canonical post URL on the platform. */
  url: string;
  poster: ViralNowAsset;
  video: ViralNowAsset;
  /** Null for live boards today (the API does not expose it yet). */
  duration_seconds: number | null;
  metrics: ViralNowMetrics;
  /** ISO timestamp the creator posted it. */
  posted_at: string | null;
  /** Monday (UTC) of the ranking week, YYYY-MM-DD. */
  week_of: string | null;
  analysis: ViralNowAnalysis | null;
  source: ViralNowSource;
  /** Public board slug. Needed to renew live media and to load the analysis. */
  board_slug: string | null;
}

/** Static niche facts the landing site owns (from src/content/viral-now/niches.json). */
export interface ViralNowNicheMeta {
  slug: string;
  name: string;
  /** Short label for the niche button. */
  label: string;
  description: string;
}

/**
 * Facts about a whole board that headers and the niche selector need before every one of
 * its videos has arrived (the bundled seed streams in after the first paint).
 */
export interface ViralNowNicheSummary {
  /** Sum of the views of every video on the board. Null when none has a view count. */
  total_views: number | null;
  /** Platforms present on the board, in display order. */
  platforms: ViralNowPlatform[];
  /** Poster URL of the rank 1 video (the selector thumbnail). */
  cover: string | null;
}

export interface ViralNowNiche extends ViralNowNicheMeta {
  /** Public board slug: `viral-now-${slug}`. */
  board_slug: string;
  source: ViralNowSource;
  week_of: string | null;
  /** ISO timestamp of the last board refresh. Null for seed and trending. */
  updated_at: string | null;
  /**
   * Videos on the board in total. `videos` holds fewer than this while only a preview is
   * loaded (live row previews, or seed videos that are still streaming in).
   */
  video_count: number;
  /** Rank ascending. */
  videos: ViralNowVideo[];
  /** Seed niches only. Present from the first paint, so it stays valid while `videos` is partial. */
  summary?: ViralNowNicheSummary;
}

export interface ViralNowSnapshot {
  /** ISO timestamp this snapshot was assembled. */
  generated_at: string;
  week_of: string | null;
  niches: ViralNowNiche[];
  /** Why each fallback tier was or was not used. For logs only, never shown to users. */
  diagnostics?: ViralNowDiagnostics;
}

export interface ViralNowDiagnostics {
  live: { ok: boolean; niches: number; error: string | null };
  seed: { ok: boolean; niches: number };
  trending: { used: boolean; ok: boolean; videos: number; error: string | null };
  /** niche slug to the tier that supplied it. */
  tiers: Record<string, ViralNowSource>;
}

/** Outcome of one media renewal. */
export type ViralNowRenewal =
  | { status: "renewed"; asset: ViralNowAsset }
  /** 403 or 404: the board rotated or unpublished. Drop the URL and refetch the niche. */
  | { status: "revoked" }
  /** Network or server failure. Keep the old URL until it expires; retry later. */
  | { status: "error"; error: string };

/* ------------------------------------------------------------------ */
/* API wire types (hosted ContHunt API, /v1)                           */
/* ------------------------------------------------------------------ */

export interface ApiContentItem {
  id: string;
  platform: string;
  external_id: string;
  content_type: string;
  canonical_url: string | null;
  /** Often "" or null. Fall back to the first line of primary_text. */
  title: string | null;
  primary_text: string | null;
  published_at: string | null;
  creator_handle: string | null;
  author_id: string | null;
  author_name: string | null;
  author_url: string | null;
  author_image_url: string | null;
  metrics: Record<string, number | null>;
  is_analyzed: boolean;
}

export interface ApiPublicBoardAsset {
  id: string;
  /** video, thumbnail, cover, image. Only the analysis video is ever listed. */
  asset_type: string;
  /** stored, downloaded, pending, failed, ... */
  status: string;
  /** Third-party URL, or the signed URL once stored. */
  source_url: string | null;
  /** Present only for objects in private R2 storage. Valid about 1 hour. */
  signed_url: string | null;
  expires_at: string | null;
}

export interface ApiPublicBoardItem {
  public_board_id: string;
  content_item: ApiContentItem;
  analysis_media_asset_id: string;
  assets: ApiPublicBoardAsset[];
  /** 1-based inside the board. */
  rank: number;
  /** numeric(0..100) by the Viral Now convention. Null on legacy boards. */
  score: number | null;
  /** The search query that found it. */
  source_query: string | null;
  /** YYYY-MM-DD of the last refresh that touched this row. */
  snapshot_date: string | null;
  added_at: string;
}

export interface ApiPublicBoard {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  rank: number;
  item_count: number;
  /** Signed poster URL of the cover item, or null. */
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  last_refreshed_at: string | null;
}

export interface ApiPublicBoardSection extends ApiPublicBoard {
  /** At most `preview_limit` items (API cap 24), rank ascending. */
  preview_items: ApiPublicBoardItem[];
}

export interface ApiPublicBoardList {
  boards: ApiPublicBoardSection[];
  /** Offset cursor as a string, or null on the last page. */
  next_cursor: string | null;
}

export interface ApiPublicBoardItems {
  items: ApiPublicBoardItem[];
  next_cursor: string | null;
}

/** GET .../media/{asset_id}/signed-url (public boards and trending). */
export interface ApiMediaAccess {
  url: string;
  expires_at: string | null;
  /** Seconds. 0 for source "origin". */
  expires_in: number;
  source: "r2" | "origin";
}

export interface ApiTrendingItem {
  id: string;
  external_id: string;
  url: string | null;
  title: string | null;
  platform: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  playback_asset_id: string;
  thumbnail_asset_id: string;
  playback_expires_at: string | null;
  thumbnail_expires_at: string | null;
  author: { id: string | null; uniqueId: string | null; nickname: string | null; avatar: string | null };
  creator_name: string | null;
  creator_image: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  share_count: number | null;
  public_trending: true;
}

export interface ApiTrendingResponse {
  items: ApiTrendingItem[];
  cached: boolean;
}

export interface ApiTrendingNiche {
  trend: "up1" | "up2" | "down1" | "down2";
  keyword: string;
  hashtags: string[];
}

/** GET /v1/public-boards/{slug}/items/{content_item_id}/analysis. */
export interface ApiPublicAnalysis {
  media_asset_id: string;
  status: "completed";
  /** Markdown, same text as full_markdown. */
  analysis: string;
  full_markdown: string;
  created_at: string;
  stages: Record<string, unknown>;
  fine_grained: ApiFineGrainedAnalysis;
}

export interface ApiFineGrainedAnalysis {
  hooks?: Array<{
    type?: string | null;
    payoff?: string | null;
    timestamp?: string | null;
    confidence?: string | null;
    spoken_hook?: string | null;
    visual_hook?: string | null;
    on_screen_text?: string | null;
  }>;
  hidden_gems?: Array<{ insight?: string | null; evidence?: string | null; timestamp?: string | null }>;
  call_to_action?: { type?: string | null; wording?: string | null; strength?: string | null; placement?: string | null };
  story_structure?: {
    setup?: string | null;
    payoff?: string | null;
    progression?: string | null;
    problem_or_tension?: string | null;
  };
  creative_summary?: string | null;
  emotional_drivers?: Array<{ insight?: string | null; evidence?: string | null; timestamp?: string | null }>;
  retention_devices?: Array<{ insight?: string | null; evidence?: string | null; timestamp?: string | null }>;
  replicable_patterns?: Array<{
    tactic?: string | null;
    difficulty?: string | null;
    execution_steps?: string[];
    supporting_evidence?: string | null;
  }>;
}
