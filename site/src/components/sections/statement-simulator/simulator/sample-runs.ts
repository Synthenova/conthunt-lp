/**
 * Finished sample runs for the simulator tabs that ship as stubs.
 *
 * `src/content/simulator/placeholder.ts` designs one deep search (skincare) and leaves tabs 2 and 3
 * as `skeleton: true` stubs with empty `messages`, `sections` and `rubrics`. Under the caption
 * "A finished Deep Search." a stub tab read as a run that never finishes, so the simulator fills
 * known stubs with the same finished anatomy as tab 1: completed worker, real section titles,
 * rubric rows and counts, and skeleton tiles where the owner's videos will go.
 *
 * Rules:
 *  - Only a search that is still a stub (`skeleton` set and nothing to show) is filled, and only
 *    when this file has a run for its id. Owner data (`skeleton` dropped, messages present) always
 *    wins, so this file can be deleted once real data lands.
 *  - The output uses the shapes in `src/content/simulator/types.ts` unchanged.
 *  - It runs on the client (inside DeepSearchSimulator), so the server payload stays the stub.
 */
import type {
  SimChatItem,
  SimDeepSearch,
  SimPlatform,
  SimResearchSection,
  SimRubricRow,
  SimRubricVideo,
  SimSectionVideo,
  SimVideoCard,
} from "@/content/simulator/types";

/** Tiles per rail in the sim (the app pages 20 at a time; the sim renders up to 8). */
const RAIL = 8;

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

/** Descending editorial Selection scores, platforms cycling through the run's own platforms. */
function sectionVideos(prefix: string, topScore: number, platforms: SimPlatform[]): SimSectionVideo[] {
  return Array.from({ length: RAIL }, (_, index) => {
    const id = `${prefix}-${String(index + 1).padStart(2, "0")}`;
    return {
      video: id,
      score: Math.max(40, Math.round((topScore - index * 1.4) * 10) / 10),
      status: "ready" as const,
      card: skeletonCard(id, platforms[index % platforms.length]),
      skeleton: true,
    };
  });
}

function rubricVideos(prefix: string, platforms: SimPlatform[]): SimRubricVideo[] {
  return Array.from({ length: RAIL }, (_, index) => {
    const id = `${prefix}-${String(index + 1).padStart(2, "0")}`;
    return {
      content_item_id: id,
      status: "ready" as const,
      match_status: "present" as const,
      match_probability: Math.max(0.5, 0.96 - index * 0.03),
      card: skeletonCard(id, platforms[index % platforms.length]),
      skeleton: true,
    };
  });
}

interface RunSpec {
  /** Prefix for skeleton tile ids. */
  key: string;
  elapsed: string;
  topScore: number;
  queries: string[];
  sections: Array<{ title: string; why: string; total: number }>;
  rubrics: Array<{ parameter: string; predicate: string }>;
  sourceCount: number;
  nextPrompts: Array<{ label: string; prompt: string }>;
}

/** Runs keyed by `SimDeepSearch.id` (the placeholder's tab 2 and tab 3 ids). */
const RUNS: Record<string, RunSpec> = {
  "ds-supplement-ugc": {
    key: "su",
    elapsed: "7m 20s",
    topScore: 96,
    queries: [
      "collagen powder results",
      "greens powder taste test",
      "dietitian reacts to supplements",
      "supplement honest review",
      "collagen 30 day results",
      "morning greens routine",
      "gut health supplement routine",
      "supplement ugc ad",
      "what i take in a day supplements",
      "greens powder before and after",
    ],
    sections: [
      {
        title: "Top videos",
        why: "The 60 videos that best answer the brief: high reach for the niche, a proof moment in the first five seconds and a clear product shot.",
        total: 60,
      },
      {
        title: "Day-by-day diaries that cut to day 30",
        why: "Creators film the same angle every few days and jump to the end. The timeline does the convincing, not the script.",
        total: 27,
      },
      {
        title: "Dietitian and doctor cameos",
        why: "A credentialed voice reacts to the product in one line. Strongest when the expert is not the brand's own.",
        total: 21,
      },
      {
        title: "Ingredient demos in a glass",
        why: "Powders mixed on camera: texture, color and the first sip. Greens brands lean on this format.",
        total: 24,
      },
      {
        title: "Honest reviews that name a downside",
        why: "Reviews that open with a complaint or a not-sponsored line, then land on a recommendation. They draw the most comments.",
        total: 19,
      },
    ],
    rubrics: [
      {
        parameter: "Proof in the first five seconds",
        predicate: "The video shows a result, a test or a measurable claim within the first five seconds.",
      },
      {
        parameter: "Expert on camera",
        predicate: "A dietitian, doctor or trainer appears on camera and comments on the product.",
      },
      {
        parameter: "Product taken on camera",
        predicate: "The creator mixes, pours or takes the supplement on camera.",
      },
      {
        parameter: "Names an ingredient or dose",
        predicate: "The video names an ingredient or a dose, such as 10 g of collagen peptides.",
      },
      {
        parameter: "Subscription or bundle offer",
        predicate: "The video mentions a subscription saving, a discount code or a bundle.",
      },
    ],
    sourceCount: 11,
    nextPrompts: [
      {
        label: "Write three UGC briefs for a collagen launch",
        prompt: "Use the strongest proof styles from this research to write three UGC briefs for a collagen powder launch.",
      },
      {
        label: "Compare expert cameos with honest reviews",
        prompt: "Compare the expert-cameo videos with the honest-review videos in this research. Which earns more reach, and why?",
      },
      {
        label: "List creators who post every week",
        prompt: "Which creators in this research post supplement content every week? List them with their best-performing hook.",
      },
    ],
  },
  "ds-q4-gifting": {
    key: "gf",
    elapsed: "8m 40s",
    topScore: 95,
    queries: [
      "holiday gift guide",
      "gifts for her under 50",
      "early black friday deals",
      "christmas gift ideas for him",
      "hostess gift ideas",
      "gift set unboxing",
      "stocking stuffer ideas",
      "small business holiday packaging",
      "secret santa gift ideas",
      "cozy home gift ideas",
    ],
    sections: [
      {
        title: "Top videos",
        why: "The 60 videos that best fit the brief: a gifting or holiday-offer angle, strong reach and a clear next step for the viewer.",
        total: 60,
      },
      {
        title: "Gift guides sorted by recipient",
        why: "Products grouped by who they are for: the host, the partner, the coworker. Easy to rebuild from a catalog.",
        total: 26,
      },
      {
        title: "Unboxing and packaging reveals",
        why: "The box, the wrapping and the first reaction carry the video. A strong fit for premium home and beauty sets.",
        total: 23,
      },
      {
        title: "Early Black Friday countdowns",
        why: "Early-access, countdown and price-drop videos. Useful for planning offer timing and urgency lines.",
        total: 22,
      },
      {
        title: "Bundles framed around a price cap",
        why: "Gift sets pitched as under $50 or under $100. Fashion and beauty brands use this to lift order value.",
        total: 20,
      },
    ],
    rubrics: [
      {
        parameter: "Names who the gift is for",
        predicate: "The video names a recipient, such as a partner, a parent, a host or a coworker.",
      },
      {
        parameter: "States a price or holiday discount",
        predicate: "The video states a price, a price cap or a holiday discount.",
      },
      {
        parameter: "Packaging shown on camera",
        predicate: "The box, the wrapping or the unboxing is shown on camera.",
      },
      {
        parameter: "Deadline or urgency line",
        predicate: "The video mentions a deadline, a countdown, limited stock or an early-access window.",
      },
      {
        parameter: "Product shown in use",
        predicate: "The product is used, worn or styled on camera, not only displayed.",
      },
    ],
    sourceCount: 12,
    nextPrompts: [
      {
        label: "Pick three offers to test before Black Friday",
        prompt: "From this research, pick the three holiday offers we should test before Black Friday and explain why each one works.",
      },
      {
        label: "Turn gift guides into a November calendar",
        prompt: "Turn the strongest gift-guide angles from this research into a four-week content calendar for November.",
      },
      {
        label: "Compare home, fashion and beauty",
        prompt: "Compare the winning gifting angles for home, fashion and beauty in this research. What does each category do differently?",
      },
    ],
  },
};

/** True for a tab that ships as a loading stub with nothing to show. */
function isStub(search: SimDeepSearch): boolean {
  return !!search.skeleton && search.messages.length === 0 && search.sections.length === 0;
}

function finishRun(search: SimDeepSearch, run: RunSpec): SimDeepSearch {
  const platforms: SimPlatform[] = search.platforms.length ? search.platforms : ["tiktok", "instagram", "youtube"];
  const { searches, videos } = search.approved_budget;

  const sections: SimResearchSection[] = run.sections.map((section, i) => ({
    title: section.title,
    why: section.why,
    videos: sectionVideos(`${run.key}-s${i + 1}`, run.topScore - i * 2, platforms),
    videos_total: section.total,
  }));

  const rubrics: SimRubricRow[] = run.rubrics.map((rubric, i) => ({
    rubric_no: i + 1,
    parameter: rubric.parameter,
    predicate: rubric.predicate,
    // Row 0 is the selected rubric, so it ships its first page; the others load on demand (as in tab 1).
    ...(i === 0 ? { videos: rubricVideos(`${run.key}-r1`, platforms) } : {}),
    total: videos,
  }));

  const messages: SimChatItem[] = [
    { kind: "user", id: `${run.key}-m1`, text: search.prompt },
    { kind: "thinking_group", id: `${run.key}-m2`, summary: "Checked credits · Research approved · Thinking", skeleton: true },
    { kind: "auto_approved", id: `${run.key}-m3`, searches, videos },
    {
      kind: "worker_task",
      id: `${run.key}-m4`,
      label: "Deep Search worker",
      status: "completed",
      elapsed: run.elapsed,
      status_label: "Finished",
      expanded: false,
      rows: [
        {
          kind: "searches",
          label: "Searched",
          count: run.queries.length,
          skeleton: true,
          rows: run.queries.map((label, index) => ({ id: `${run.key}-q${index + 1}`, label })),
        },
        { kind: "analysis", label: "Analysis finished", percent: 100, terminal: videos, total: videos, skeleton: true },
        { kind: "tool", label: "Read video analyses", skeleton: true },
        { kind: "tool", label: "Publish research sections", skeleton: true },
        { kind: "tool", label: "Wrote file", chip: "report", mono: true, skeleton: true },
      ],
    },
    { kind: "assistant", id: `${run.key}-m5`, skeleton: true, skeleton_lines: 4, source_count: run.sourceCount },
    { kind: "next_prompts", id: `${run.key}-m6`, prompts: run.nextPrompts },
  ];

  return { ...search, messages, sections, rubrics, skeleton: false };
}

/** Fills known stub tabs with a finished run. Returns the same array when nothing changes. */
export function finishSampleRuns(searches: SimDeepSearch[]): SimDeepSearch[] {
  let changed = false;
  const next = searches.map((search) => {
    const run = RUNS[search.id];
    if (!run || !isStub(search)) return search;
    changed = true;
    return finishRun(search, run);
  });
  return changed ? next : searches;
}
