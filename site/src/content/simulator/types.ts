/**
 * Props contract for the Home "Deep Search" simulator (section 2).
 *
 * Standalone: no imports. Field names mirror the ContHunt app so real data can be dropped in
 * later without remapping. Every type cites its app source (paths are relative to
 * `conthunt/frontend/src/`). Full structure: `docs/revamp/specs/simulator-spec.md`.
 *
 * Rules:
 *  - Do not add fields the app does not have. Fields marked "(sim)" are the only exceptions and
 *    exist because the simulator ships a small slice of a 500-video board, or plays back
 *    pre-written replies instead of running an agent.
 *  - `skeleton: true` means "render shimmer for the dynamic content of this node". The structural
 *    label (for example "Deep Search worker", "Searched") still renders as real text.
 */

// ---------------------------------------------------------------------------
// Shared vocabularies (verbatim from the app)
// ---------------------------------------------------------------------------

/** `BoardFilterBar` platform keys in the research canvas: QuestionResearchCanvas.tsx:313. */
export type SimPlatform = "tiktok" | "instagram" | "youtube";

/** `ClientDateFilter` in components/boards/BoardFilterBar.tsx:34-42. */
export type SimDateFilter =
  | "all"
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "three_months"
  | "six_months"
  | "year";

/** `ClientSortOption` in components/boards/BoardFilterBar.tsx:33. */
export type SimSortOption =
  | "default"
  | "average_score"
  | "views"
  | "likes"
  | "shares"
  | "comments"
  | "newest";

/** Dropdown labels, verbatim from BoardFilterBar.tsx:61-80 (the research canvas relabels `default`). */
export const SIM_SORT_LABELS: Record<Exclude<SimSortOption, "average_score">, string> = {
  default: "Assessment score",
  views: "Most Viewed",
  likes: "Most Liked",
  shares: "Most Shared",
  comments: "Most Commented",
  newest: "Newest First",
};

export const SIM_DATE_LABELS: Record<SimDateFilter, string> = {
  all: "Any Date",
  today: "Today",
  yesterday: "Yesterday",
  week: "Last 7 Days",
  month: "Last 30 Days",
  three_months: "Last 3 Months",
  six_months: "Past 6 Months",
  year: "Past Year",
};

/**
 * The fixed left-nav, in order. Labels and paths: components/layout/AppSidebar.tsx:43-49.
 * `lucide` is the lucide icon that matches the app's animated icon geometry
 * (components/ui/home.tsx, history.tsx, tracking-icon.tsx, layout-panel-top.tsx, public-boards.tsx).
 */
export const SIM_NAV_ITEMS = [
  { title: "Home", path: "/app", lucide: "house" },
  { title: "Chats", path: "/app/chats", lucide: "history" },
  { title: "Tracking", path: "/app/tracking", lucide: "chart-spline" },
  { title: "Boards", path: "/app/boards", lucide: "layout-panel-top" },
  { title: "Public Boards", path: "/app/public-boards", lucide: "globe" },
] as const;

export type SimNavTitle = (typeof SIM_NAV_ITEMS)[number]["title"];

// ---------------------------------------------------------------------------
// Video cards (board)
// ---------------------------------------------------------------------------

/** `metrics` keys read by transformToMediaItem (lib/transformers.ts:213-220). */
export interface SimVideoMetrics {
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
}

/**
 * Subset of `SearchCardV1` (lib/transformers.ts:23-53) that MediaCard actually draws
 * (components/search/MediaCard.tsx:630-688):
 * creator + platform icon, 2-line caption, views / likes / shares-or-comments / engagement rate.
 */
export interface SimVideoCard {
  content_item_id: string;
  platform: SimPlatform;
  /** Caption. MediaCard falls back title -> primary_text -> "No Title". */
  title: string | null;
  primary_text?: string | null;
  /** MediaCard shows `author_name` first, then `creator_handle`. */
  creator_handle: string | null;
  author_name?: string | null;
  author_image_url?: string | null;
  published_at?: string | null;
  durationSeconds?: number | null;
  metrics: SimVideoMetrics;
  /** 9:16 poster. */
  thumbnail_url: string | null;
  /** Muted hover preview (H.264 mp4). Optional. */
  playback_url?: string | null;
  canonical_url?: string | null;
  /** (sim) The run's analysis of this video, shown in the video drawer. */
  analysis?: SimVideoAnalysis;
}

/**
 * (sim) A slice of the app's per-video analysis (ContentDrawer: the HOOK and SUMMARY sections, and
 * "Research findings", one row per research question of the run with its closed label).
 */
export interface SimVideoAnalysis {
  /** At most about 280 characters. */
  summary: string;
  hook?: string;
  /** This video's result for each of the run's research questions, in rubric order. */
  checks: Array<{ parameter: string; status: "present" | "absent"; probability: number | null }>;
}

/**
 * One entry of a published section: hooks/useResearchSections.ts:9-13.
 * `score` is the editorial "Selection score" (0-100, task fit). It is NOT JEV, a rubric average
 * or a viral-likelihood number. The badge reads `${Math.round(score)}%`
 * (QuestionResearchCanvas.tsx:239). `status: "unavailable"` renders "Video source unavailable"
 * (QuestionResearchCanvas.tsx:262-265).
 */
export interface SimSectionVideo {
  video: string;
  score: number;
  status: "ready" | "unavailable";
  card: SimVideoCard | null;
  analysis_run_id?: string;
  media_asset_id?: string;
  /** Render the whole tile as shimmer. */
  skeleton?: boolean;
}

/**
 * A published section (hooks/useResearchSections.ts:14, backend app/research/sections.py:20-39).
 * A completed 500-video Deep Search publishes FIVE sections: "Top videos" first (about 60 videos),
 * then four agent-chosen descriptive-phrase titles with 20-30 videos each.
 */
export interface SimResearchSection {
  title: string;
  why: string;
  videos: SimSectionVideo[];
  /** (sim) Shown in "{n} videos" when the sim only ships a slice of the real list. */
  videos_total?: number;
}

/** Rubric definition (QuestionResearchCanvas.tsx:282-290): label is `parameter`, or `parameter · parent question`. */
export interface SimRubric {
  rubric_no: number;
  parameter: string;
  /** Plain-language predicate shown under the dropdown (QuestionResearchCanvas.tsx:325). */
  predicate: string;
  /** Optional parent research question; when present the dropdown label is "parameter · question". */
  parent_question?: string;
}

/**
 * One video in a rubric rail: subset of ResearchQuestionVideo (hooks/useResearchQuestions.ts:9-37).
 * Badge = `Math.round(100 * match_probability)` + "%" when `match_status` is "present" or "absent"
 * (QuestionResearchCanvas.tsx:141-144); otherwise no badge.
 */
export interface SimRubricVideo {
  content_item_id: string;
  status: "ready" | "loading" | "unavailable";
  match_status: "present" | "absent" | null;
  /** 0-1. */
  match_probability: number | null;
  card: SimVideoCard | null;
  skeleton?: boolean;
}

export interface SimRubricRow extends SimRubric {
  /** First page of the ranked rail (the app pages 20 at a time). */
  videos?: SimRubricVideo[];
  /** (sim) Total length of the rail, for example 500. */
  total?: number;
}

// ---------------------------------------------------------------------------
// Chat transcript (right panel)
// ---------------------------------------------------------------------------

/** One row inside a Thinking group or a worker task: components/chat/transcript/*. */
export type SimTraceRow =
  /** SearchActivity.tsx:37-48: label "Searching…" | "Searched" + horizontal strip + "{n} searches". */
  | {
      kind: "searches";
      label: "Searching…" | "Searched" | "Search pending";
      /** Rows are `{label: query, description: "platform · N videos"}`. */
      rows: Array<{ id: string; label: string; platform?: SimPlatform; count?: number }>;
      count: number;
      skeleton?: boolean;
    }
  /** BackgroundTask.tsx:24-28 + ThinkingSearch.tsx:25-28 (progress bar + percent). */
  | {
      kind: "analysis";
      label: "Analyzing videos" | "Analysis finished" | "Analysis failed";
      percent: number;
      terminal?: number;
      total?: number;
      skeleton?: boolean;
    }
  /** Generic ToolChips row: label from lib/chatPresentation.ts:16-62 (past tense when done). */
  | { kind: "tool"; label: string; chip?: string; mono?: boolean; skeleton?: boolean }
  /** NativeReasoningPart.tsx: label "Thinking" + preview chip. */
  | { kind: "thinking"; label: "Thinking"; preview?: string; skeleton?: boolean };

/** Right-aligned bubble, max 85% width (MessageRow.tsx:74-76). */
export interface SimUserMessage {
  kind: "user";
  id: string;
  text: string;
}

/**
 * Collapsed ToolChips group (ThinkingBlock.tsx:116-130). `summary` is up to three labels joined
 * with " · " plus "+N activities", for example "Checked credits · Research approved · Thinking".
 */
export interface SimThinkingGroup {
  kind: "thinking_group";
  id: string;
  summary: string;
  rows?: SimTraceRow[];
  skeleton?: boolean;
}

/** Green ValuePill, NativeParts.tsx:105-111: "Auto-approved: Research budget · 10 searches · 500 videos". */
export interface SimAutoApproved {
  kind: "auto_approved";
  id: string;
  searches: number;
  videos: number;
}

/** Research budget card (PresentPlanCard.tsx:31-87, RecommendationCard.tsx). Optional; the default sim uses `auto_approved`. */
export interface SimBudgetCard {
  kind: "budget";
  id: string;
  /** ResearchBudgetOption (components/chat/transcript/types.ts:4-13). */
  option: {
    id: string;
    label: string;
    searches: number;
    videos: number;
    searchCreditEstimate?: number;
    aiCreditEstimate?: number;
    /** 0-100 */
    researchDepth?: number;
    rationale?: string;
  };
  accepted: boolean;
}

/** Plan view (PresentPlanCard.tsx:117-151). Optional and tall; real chats render it above the budget. */
export interface SimResearchPlan {
  kind: "plan";
  id: string;
  objective: string;
  output?: string;
  research_questions: Array<{ question: string; evidence_required?: string }>;
  criteria: Array<{ name: string; predicate: string }>;
  searches: string[];
}

/**
 * Inline delegated task: TaskRows row (BackgroundTask.tsx:98-129).
 * Header = status badge + "Deep Search worker" + elapsed + status pill ("Finished") + chevron.
 */
export interface SimWorkerTask {
  kind: "worker_task";
  id: string;
  label: "Deep Search worker";
  status: "running" | "completed" | "failed";
  /** For example "8m" or "7m 20s" (BackgroundTask.tsx:58-59 format: "{s}s", "{m}m" for whole minutes or "{m}m {s}s"). */
  elapsed?: string;
  /** taskPhaseLabel(): "Finished" | "Failed" | "Starting" | "Searching" | "Analyzing videos" ... */
  status_label?: string;
  expanded?: boolean;
  rows: SimTraceRow[];
}

/** Final answer: StreamingText (markdown) + Copy + "Sources {n}" (AssistantMessageChrome.tsx:64-71). */
export interface SimAssistantMessage {
  kind: "assistant";
  id: string;
  markdown?: string;
  /** Shimmer lines instead of text. */
  skeleton?: boolean;
  skeleton_lines?: number;
  source_count?: number;
}

/**
 * (sim) A pre-written agent reply to one next-step prompt. The simulator runs no agent: sending a
 * step that has one plays it back (the sent bubble, a working line, then the reply streamed in as
 * markdown) and offers the same next steps again. Steps without one open the real product.
 */
export interface SimPrecookedResponse {
  /** Markdown: paragraphs split on blank lines, `**bold**`, `*italic*`, `- ` and `1. ` lists. */
  markdown: string;
  /** The working line shown before the reply (ThinkingBlock status). Default "Reading this research". */
  status_label?: string;
  /** "Sources {n}" under the reply, like the report. */
  source_count?: number;
}

/** One suggested next step. `response` is the simulator's pre-written reply (sim). */
export interface SimNextPrompt {
  label: string;
  prompt: string;
  response?: SimPrecookedResponse;
}

/** NextPromptSuggestions.tsx: ApprovalCard titled "Next step", options = `label`, edit pencil sends `prompt` to the composer. */
export interface SimNextPrompts {
  kind: "next_prompts";
  id: string;
  prompts: SimNextPrompt[];
}

export type SimChatItem =
  | SimUserMessage
  | SimThinkingGroup
  | SimAutoApproved
  | SimBudgetCard
  | SimResearchPlan
  | SimWorkerTask
  | SimAssistantMessage
  | SimNextPrompts;

/** Composer (components/chat/chat-input/ChatInput.tsx:553-580, constants.ts:5-18). */
export interface SimComposer {
  /** "Send a message" (PromptBar.tsx:28). */
  placeholder: string;
  /** Model picker; options are MODEL_OPTIONS in constants.ts. Default is Gemini 3.8 Flash. */
  model: { label: string; value: string };
  /** BadgeCheck toggle, aria-label "Auto approve". */
  auto_approve: boolean;
  /** Telescope toggle, aria-label "Deep Research" (read-only in an existing Deep Research chat). */
  deep_research_enabled: boolean;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export interface SimSidebarAccount {
  /** SidebarUser.tsx:123: displayName, else the email prefix. */
  display_name: string;
  /** First letter of the email, uppercase (SidebarUser.tsx:119). */
  initial: string;
  /** Plan label, uppercase 9px (SidebarUser.tsx:42-46, 124). The pricing plan names are Free, Creator and Pro. */
  plan_label: string;
}

/** Recents row: the chat list grouped by date (AppSidebar.tsx:154-189). */
export interface SimRecentChat {
  /** Same id as a `SimDeepSearch.id`; the active tab's chat is the highlighted row. */
  id: string;
  title: string;
  group: "Today" | "Yesterday" | "Previous 7 Days" | "Previous 30 Days" | "Older";
}

export interface SimSidebar {
  /** The active nav item. In the app, /app/chats/:id matches "Chats" (AppSidebar.tsx:214-218). */
  active_nav: SimNavTitle;
  account: SimSidebarAccount;
  /** Recents segmented control; the app defaults to "chats" (AppSidebar.tsx:119). */
  recents_tab: "boards" | "chats";
  /** Initial state; the user can toggle it. */
  collapsed: boolean;
}

// ---------------------------------------------------------------------------
// One completed Deep Search = one tab + one chat
// ---------------------------------------------------------------------------

export interface SimDeepSearch {
  /** Chat id. Also the tab key (lib/canvasTabs.ts:9-14: `research:${chatId}`). */
  id: string;
  /** Tab label: CanvasTab `{ kind: "research", chatId, label }` (lib/canvasTabs.ts:5). The app default label is "Deep Research". */
  tab_label: string;
  /** Full chat title for the header row (ChatTitle.tsx:99). */
  chat_title: string;
  /** The user's prompt, also the first chat bubble. */
  prompt: string;
  status: "completed";
  /** BackgroundRun.approvedBudget (hooks/useBackgroundRuns.ts:19): searches and videos. */
  approved_budget: { searches: number; videos: number };
  /** Platforms searched. */
  platforms: SimPlatform[];
  /** Date window, rendered with SIM_DATE_LABELS. */
  date_filter: SimDateFilter;
  /** Transcript, top to bottom. */
  messages: SimChatItem[];
  /** Published sections: "Top videos" first. */
  sections: SimResearchSection[];
  /** Rubric dropdown rows. Row 0 is selected by default. */
  rubrics: SimRubricRow[];
  /** Whole tab is a loading skeleton ("Preparing research selections…" + card skeleton rail). */
  skeleton?: boolean;
}

/**
 * (sim) One run file, `src/content/simulator/runs/<slug>.json`, written by
 * `.scratch/deepsearch/tools/build_sim_data.py` from a real Deep Search. It is a `SimDeepSearch` slice
 * (the static copy, tab label, title, prompt, platforms and date filter, stays in `data.ts`) with two
 * savings that `expandRun` (./expand.ts) undoes: each card is stored once in `cards` and tiles carry
 * its `content_item_id`, and `analysis.checks` is one `[status, probability]` pair (or null) per
 * entry of `rubrics`, in order.
 */
export interface SimRunData {
  id: string;
  approved_budget: { searches: number; videos: number };
  /** The transcript after the user's prompt (expandRun adds the prompt bubble). */
  messages: SimChatItem[];
  sections: Array<Omit<SimResearchSection, "videos"> & { videos: Array<Omit<SimSectionVideo, "card"> & { card: string }> }>;
  rubrics: Array<Omit<SimRubricRow, "videos"> & { videos: Array<Omit<SimRubricVideo, "card"> & { card: string }> }>;
  cards: Record<
    string,
    Omit<SimVideoCard, "analysis"> & {
      analysis?: Omit<SimVideoAnalysis, "checks"> & { checks: Array<["present" | "absent", number | null] | null> };
    }
  >;
}

export interface SimFilterState {
  sort: SimSortOption;
  date_filter: SimDateFilter;
  /** Empty = all platforms. */
  platforms: SimPlatform[];
}

export interface DeepSearchSimulatorProps {
  /** One to three completed deep searches, in tab order. */
  searches: SimDeepSearch[];
  /** Defaults to `searches[0].id`. */
  activeSearchId?: string;
  sidebar: SimSidebar;
  /** Sidebar Recents; normally one row per entry in `searches`, group "Today". */
  recents: SimRecentChat[];
  composer: SimComposer;
  /** Initial board filter state (rubric row only). */
  filters?: SimFilterState;
  className?: string;
}
