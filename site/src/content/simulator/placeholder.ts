/**
 * Placeholder data for the Home Deep Search simulator: ONE designed deep search plus two stub tabs.
 *
 * The owner will supply real video content and agent traces later. Until then every video tile,
 * trace chip body and the final report render as shimmer (`skeleton: true`). Structure, labels,
 * counts and copy that the app also shows (prompt, tab titles, section titles, "Research budget"
 * counts, next-step prompts) are real text. Shapes: `./types.ts`. Spec: `docs/revamp/specs/simulator-spec.md`.
 *
 * To drop in real data: replace `skeleton: true` nodes with real `SimVideoCard`s (set `skeleton`
 * to false or remove it), fill `SimTraceRow` bodies and `SimAssistantMessage.markdown`.
 */
import type {
  DeepSearchSimulatorProps,
  SimDeepSearch,
  SimPlatform,
  SimRecentChat,
  SimResearchSection,
  SimRubricRow,
  SimRubricVideo,
  SimSectionVideo,
  SimVideoCard,
} from "./types";

const PLATFORM_CYCLE: SimPlatform[] = ["tiktok", "instagram", "youtube"];

/** A tile with no data. The component draws shimmer for the whole tile when `skeleton` is set. */
function skeletonCard(id: string, platform: SimPlatform): SimVideoCard {
  return {
    content_item_id: id,
    platform,
    title: null,
    creator_handle: null,
    metrics: { views: null, likes: null, comments: null, shares: null },
    thumbnail_url: null,
  };
}

/** Descending editorial Selection scores (0-100), platforms cycling TikTok, Instagram, YouTube. */
function skeletonSectionVideos(prefix: string, count: number, topScore: number): SimSectionVideo[] {
  return Array.from({ length: count }, (_, index) => {
    const id = `${prefix}-${String(index + 1).padStart(2, "0")}`;
    return {
      video: id,
      score: Math.max(40, Math.round((topScore - index * 1.4) * 10) / 10),
      status: "ready" as const,
      card: skeletonCard(id, PLATFORM_CYCLE[index % PLATFORM_CYCLE.length]),
      skeleton: true,
    };
  });
}

function skeletonRubricVideos(prefix: string, count: number): SimRubricVideo[] {
  return Array.from({ length: count }, (_, index) => {
    const id = `${prefix}-${String(index + 1).padStart(2, "0")}`;
    return {
      content_item_id: id,
      status: "ready" as const,
      match_status: "present" as const,
      match_probability: Math.max(0.5, 0.97 - index * 0.03),
      card: skeletonCard(id, PLATFORM_CYCLE[index % PLATFORM_CYCLE.length]),
      skeleton: true,
    };
  });
}

// ---------------------------------------------------------------------------
// Deep search 1 (designed): DTC skincare
// ---------------------------------------------------------------------------

const SKINCARE_PROMPT =
  "Research what is working for DTC skincare brands on TikTok, Instagram Reels and YouTube Shorts in the last 30 days. " +
  "Watch 500 videos and show me the hooks, proof types and offers that earn the most views, " +
  "and what top creators do in the first three seconds.";

/** Five published sections: "Top videos" first (about 60 videos for a 500-video run), then four descriptive-phrase titles. */
const SKINCARE_SECTIONS: SimResearchSection[] = [
  {
    title: "Top videos",
    why: "The 60 videos that best fit the brief: strong reach, a clear hook in the first three seconds and visible proof of results.",
    videos: skeletonSectionVideos("sk-top", 8, 97),
    videos_total: 60,
  },
  {
    title: "Before-and-after proof in the first three seconds",
    why: "Creators who open on the result, then explain the routine. These hold attention without a hard pitch.",
    videos: skeletonSectionVideos("sk-proof", 8, 94),
    videos_total: 24,
  },
  {
    title: "Dermatologist and ingredient explainers",
    why: "Authority-led videos that name one active and one claim. A repeatable format for a serum or SPF launch.",
    videos: skeletonSectionVideos("sk-derm", 8, 92),
    videos_total: 22,
  },
  {
    title: "Routine videos that sell without a pitch",
    why: "Get-ready-with-me and night-routine formats where the product shows up naturally mid-routine.",
    videos: skeletonSectionVideos("sk-routine", 8, 90),
    videos_total: 26,
  },
  {
    title: "Offer-led videos with bundles and codes",
    why: "Direct-response videos that lead with a discount, bundle or free gift. Useful for promo planning.",
    videos: skeletonSectionVideos("sk-offer", 8, 88),
    videos_total: 20,
  },
];

/** Rubrics follow the sections (QuestionResearchCanvas.tsx:310-330). Row 0 is selected by default. */
const SKINCARE_RUBRICS: SimRubricRow[] = [
  {
    rubric_no: 1,
    parameter: "Hook in the first three seconds",
    predicate: "The video states or shows a clear hook within the first three seconds.",
    videos: skeletonRubricVideos("sk-rubric-hook", 8),
    total: 500,
  },
  {
    rubric_no: 2,
    parameter: "Visible result shown",
    predicate: "The video shows a visible before-and-after or skin result on camera.",
    total: 500,
  },
  {
    rubric_no: 3,
    parameter: "Names an active ingredient",
    predicate: "The creator names a specific active ingredient such as retinol, niacinamide or vitamin C.",
    total: 500,
  },
  {
    rubric_no: 4,
    parameter: "Shows a price, discount or code",
    predicate: "The video mentions a price, a discount, a bundle or a promo code.",
    total: 500,
  },
  {
    rubric_no: 5,
    parameter: "Creator speaks to camera",
    predicate: "A creator speaks directly to the camera for most of the video.",
    total: 500,
  },
];

const SKINCARE: SimDeepSearch = {
  id: "ds-skincare-hooks",
  tab_label: "Skincare ad hooks",
  chat_title: "DTC skincare: winning hooks, proof and offers",
  prompt: SKINCARE_PROMPT,
  status: "completed",
  approved_budget: { searches: 10, videos: 500 },
  platforms: ["tiktok", "instagram", "youtube"],
  date_filter: "month",
  messages: [
    { kind: "user", id: "m1", text: SKINCARE_PROMPT },
    // Collapsed group; its summary is built from tool labels (ThinkingBlock.tsx:116-125).
    { kind: "thinking_group", id: "m2", summary: "Checked credits · Research approved · Thinking", skeleton: true },
    // Auto approve is on, so the real transcript shows this pill instead of the budget card.
    { kind: "auto_approved", id: "m3", searches: 10, videos: 500 },
    {
      kind: "worker_task",
      id: "m4",
      label: "Deep Search worker",
      status: "completed",
      elapsed: "8m",
      status_label: "Finished",
      expanded: false,
      rows: [
        {
          kind: "searches",
          label: "Searched",
          count: 10,
          skeleton: true,
          rows: [
            "skincare routine",
            "glass skin routine",
            "vitamin c serum before and after",
            "sunscreen reapply hack",
            "dermatologist skincare mistakes",
            "retinol beginner routine",
            "skincare haul",
            "acne scars results",
            "korean skincare routine",
            "skincare founder story",
          ].map((label, index) => ({ id: `q${index + 1}`, label })),
        },
        { kind: "analysis", label: "Analysis finished", percent: 100, terminal: 500, total: 500, skeleton: true },
        { kind: "tool", label: "Read video analyses", skeleton: true },
        { kind: "tool", label: "Publish research sections", skeleton: true },
        { kind: "tool", label: "Wrote file", chip: "report", mono: true, skeleton: true },
      ],
    },
    { kind: "assistant", id: "m5", skeleton: true, skeleton_lines: 4, source_count: 12 },
    {
      kind: "next_prompts",
      id: "m6",
      prompts: [
        {
          label: "Turn the top five hooks into UGC briefs",
          prompt: "Turn the five strongest hooks from this research into UGC briefs for a vitamin C serum launch.",
        },
        {
          label: "Compare TikTok and Reels winners",
          prompt: "Compare what wins on TikTok with what wins on Instagram Reels in this research. Which format should we test first?",
        },
        {
          label: "Find creators worth briefing",
          prompt: "Which creators in this research appear more than once in the top videos? List them with their best-performing hook.",
        },
      ],
    },
  ],
  sections: SKINCARE_SECTIONS,
  rubrics: SKINCARE_RUBRICS,
};

// ---------------------------------------------------------------------------
// Deep searches 2 and 3: stubs. Clicking the tab shows the loading skeleton.
// ---------------------------------------------------------------------------

const SUPPLEMENTS: SimDeepSearch = {
  id: "ds-supplement-ugc",
  tab_label: "Supplement UGC proof",
  chat_title: "Supplements: UGC proof styles that sell",
  prompt:
    "Which UGC proof styles (before and after, doctor cameo, ingredient demo, honest review) sell collagen and greens supplements " +
    "on TikTok and Instagram Reels this month? Watch 500 videos and rank the formats by reach.",
  status: "completed",
  approved_budget: { searches: 10, videos: 500 },
  platforms: ["tiktok", "instagram"],
  date_filter: "month",
  messages: [],
  sections: [],
  rubrics: [],
  skeleton: true,
};

const GIFTING: SimDeepSearch = {
  id: "ds-q4-gifting",
  tab_label: "Q4 gifting angles",
  chat_title: "Q4 gifting and holiday offers for Shopify brands",
  prompt:
    "Find the gifting and holiday-offer angles that Shopify brands in home, fashion and beauty are running on TikTok, " +
    "Instagram Reels and YouTube Shorts ahead of Black Friday. Watch 500 videos from the last 30 days and show me the hooks and offers to test first.",
  status: "completed",
  approved_budget: { searches: 10, videos: 500 },
  platforms: ["tiktok", "instagram", "youtube"],
  date_filter: "month",
  messages: [],
  sections: [],
  rubrics: [],
  skeleton: true,
};

const SEARCHES: SimDeepSearch[] = [SKINCARE, SUPPLEMENTS, GIFTING];

/** The sidebar Recents list shows the same chats, highlighted by the active tab. */
const RECENTS: SimRecentChat[] = SEARCHES.map((search) => ({
  id: search.id,
  title: search.chat_title,
  group: "Today" as const,
}));

export const placeholderSimulatorProps: DeepSearchSimulatorProps = {
  searches: SEARCHES,
  activeSearchId: SKINCARE.id,
  sidebar: {
    active_nav: "Chats",
    account: { display_name: "Acme Skincare", initial: "A", plan_label: "Pro" },
    recents_tab: "chats",
    collapsed: true,
  },
  recents: RECENTS,
  composer: {
    placeholder: "Send a message",
    model: { label: "Gemini 3.8 Flash", value: "google-vertex/gemini-3.8-flash" },
    auto_approve: true,
    deep_research_enabled: true,
  },
  filters: { sort: "default", date_filter: "all", platforms: [] },
};
