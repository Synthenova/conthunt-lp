/**
 * Data for the Home Deep Search simulator: three real ContHunt Deep Searches, curated for the demo.
 *
 * Each tab's run (transcript, published sections, research-question rails, cards with their
 * analysis, the three next steps with ContHunt's own answers) is a generated file in `./runs/`,
 * written by `.scratch/deepsearch/tools/build_sim_data.py <tab>` from the tab's export (spec:
 * `.scratch/deepsearch/DATA.md`). Only the static per-tab copy lives here: tab label, chat title,
 * the prompt as it was run (300 videos, the run's platforms, the last 30 days), platforms and date
 * filter.
 *
 * Payload: the active tab's run ships with the page (expanded here, on the server). The other tabs
 * ship as this copy only and load their run file on demand (`./runs/index.ts`, generated: tab hover
 * or focus, or the first hover inside the frame), so a tab switch never shows a skeleton.
 */
import { expandRun } from "./expand";
import skincareRun from "./runs/skincare.json";
import type { DeepSearchSimulatorProps, SimDeepSearch, SimRecentChat, SimRunData } from "./types";

/** The approved budget every run was given (plan-<tab>.md): 12 keyword searches, 300 videos. */
const BUDGET = { searches: 12, videos: 300 };

/** Static copy of one tab; the run fills `messages`, `sections` and `rubrics`. */
function copy(tab: Pick<SimDeepSearch, "id" | "tab_label" | "chat_title" | "prompt" | "platforms">): SimDeepSearch {
  return {
    ...tab,
    status: "completed",
    approved_budget: BUDGET,
    date_filter: "month",
    messages: [],
    sections: [],
    rubrics: [],
    skeleton: true,
  };
}

const SKINCARE = copy({
  id: "ds-skincare-hooks",
  tab_label: "Skincare ad hooks",
  chat_title: "DTC skincare: winning hooks, proof and offers",
  prompt:
    "Research what is working for DTC skincare brands on TikTok, Instagram Reels and YouTube Shorts in the last 30 days. " +
    "Watch 300 videos and show me the hooks, proof types and offers that earn the most views, " +
    "and what top creators do in the first three seconds.",
  platforms: ["tiktok", "instagram", "youtube"],
});

const SUPPLEMENTS = copy({
  id: "ds-supplement-ugc",
  tab_label: "Supplement UGC proof",
  chat_title: "Supplements: UGC proof styles that sell",
  prompt:
    "Which UGC proof styles (before and after, doctor cameo, ingredient demo, honest review) sell collagen and greens supplements " +
    "on TikTok and Instagram Reels in the last 30 days? Watch 300 videos and rank the formats by reach.",
  platforms: ["tiktok", "instagram"],
});

const GIFTING = copy({
  id: "ds-q4-gifting",
  tab_label: "Q4 gifting angles",
  chat_title: "Q4 gifting and holiday offers for Shopify brands",
  prompt:
    "Find the gifting and holiday-offer angles that Shopify brands in home, fashion and beauty are running on TikTok, " +
    "Instagram Reels and YouTube Shorts ahead of Black Friday. Watch 300 videos from the last 30 days and show me the hooks and offers to test first.",
  platforms: ["tiktok", "instagram", "youtube"],
});

// JSON imports widen literal unions to string; the generator is the contract for the shape.
const SEARCHES: SimDeepSearch[] = [expandRun(SKINCARE, skincareRun as unknown as SimRunData), SUPPLEMENTS, GIFTING];

/** The sidebar Recents list shows the same chats, highlighted by the active tab. */
const RECENTS: SimRecentChat[] = SEARCHES.map((search) => ({
  id: search.id,
  title: search.chat_title,
  group: "Today" as const,
}));

export const simulatorProps: DeepSearchSimulatorProps = {
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
