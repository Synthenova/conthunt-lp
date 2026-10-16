/**
 * Shared blog types. Everything here is plain JSON-serializable data, so server
 * code (the loader) can hand it to client components (carousel, filters).
 */

export const CATEGORIES = ["Playbooks", "Research", "Guides", "Product"] as const;
export type PostCategory = (typeof CATEGORIES)[number];

/* ------------------------------------------------------------- fragments */
/* Shapes follow content/blog/README.md ("fragment_data shapes"). The values are
   illustrative mock UI for the cover, never measured results. */

export interface SearchBarData {
  query: string;
  platforms: string[];
  scope: string;
  status: string;
}
export interface ScoreCardData {
  title: string;
  score: number;
  out_of: number;
  verdict: string;
  metrics: { label: string; value: string }[];
}
export interface HookTimelineData {
  window: string;
  hook_family: string;
  segments: { t: string; label: string }[];
  score: number;
}
export interface TrendChartData {
  title: string;
  series: { label: string; points: number[] }[];
  badge: string;
}
export interface BoardGridData {
  board: string;
  items: { label: string; score: number }[];
}
export interface AgentTraceData {
  steps: { label: string; status: "done" | "running" }[];
}
export interface TrackingChartData {
  account: string;
  metric: string;
  points: number[];
  labels: string[];
  delta: string;
  badge: string;
}
export interface McpTerminalData {
  lines: string[];
}
export interface NicheChipsData {
  chips: { label: string; state: string }[];
  active: string;
  window: string;
}

export type FragmentSpec =
  | { kind: "search-bar"; data: SearchBarData }
  | { kind: "score-card"; data: ScoreCardData }
  | { kind: "hook-timeline"; data: HookTimelineData }
  | { kind: "trend-chart"; data: TrendChartData }
  | { kind: "board-grid"; data: BoardGridData }
  | { kind: "agent-trace"; data: AgentTraceData }
  | { kind: "tracking-chart"; data: TrackingChartData }
  | { kind: "mcp-terminal"; data: McpTerminalData }
  | { kind: "niche-chips"; data: NicheChipsData };

export type FragmentKind = FragmentSpec["kind"];

/* ----------------------------------------------------------------- cover */

export interface CoverSpec {
  /** Post slug, or "_index" for the shared index plate. */
  slug: string;
  plate1600: string;
  plate800: string;
  mood: string;
  /** Dominant plate color, used as the background and the blur placeholder. */
  dominant: string;
  /** 1x1 SVG data URL in the dominant color, for `placeholder="blur"`. */
  blurDataURL: string;
  /** Null for the index plate (no overlay). */
  fragment: FragmentSpec | null;
}

/* ----------------------------------------------------------------- posts */

export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  category: PostCategory;
  readingMinutes: number;
  author: string;
  featured: boolean;
  featuredOrder: number | null;
  cover: CoverSpec;
}

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface Post extends PostSummary {
  /** Markdown body with `{{GET_STARTED_URL}}` already replaced. */
  body: string;
  toc: TocItem[];
}
