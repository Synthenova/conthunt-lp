/**
 * Copy and scenario data for the "how it works" section.
 *
 * Real: creator handles, platforms and view counts (from hiw-thumbs.json), the
 * deep-search budget of 10 keyword searches for a 500-video run (agent contract,
 * docs/revamp/specs/simulator-spec.md §5.1).
 * Illustrative (the step visuals are animations, so no visible label; the rank
 * stage's screen-reader caption states it): scores, question/parameter sets,
 * keyword queries, run counters, run times and the answer summaries.
 */
import type { Platform } from "./thumbs";

export type ScenarioId = "pets" | "kitchen" | "skincare";

export interface Keyword {
  text: string;
  platform: Platform;
  /** Which Q/P rows produced this query (ids like "q1", "p5"); drives hover highlights. */
  from: string[];
}

export interface RankedVideo {
  /** Poster number in hiw-thumbs.json. */
  n: number;
  /** Illustrative assessment score, 0-100. */
  score: number;
  /** Short hook label (illustrative read of the poster). */
  hook: string;
  /** Matched research questions, e.g. ["Q1", "Q3"]. */
  matched: string[];
}

export interface Scenario {
  id: ScenarioId;
  /** Label of the "try a brief" pill. */
  chip: string;
  prompt: string;
  questions: string[];
  /** [name, weight %]. Weights sum to 100. */
  parameters: [string, number][];
  /** Six of the ten keyword searches, shown in step 2. */
  keywords: Keyword[];
  /** Candidates per platform lane after the searches ran (sum = found). */
  lanes: Record<Platform, number>;
  found: number;
  /** Videos that pass the relevance gate (= watched in step 3). */
  passed: number;
  /** Run time in seconds (always under 5 minutes). */
  runSeconds: number;
  /** Step 2 gate sample: 20 posters, `pass` keeps color, the rest are dropped as off-topic. */
  gate: { n: number; pass: boolean }[];
  /** Candidate rows for step 3. Top five by score and top five by views are both drawn from here. */
  ranked: RankedVideo[];
  answer: string;
  /** Videos the answer cites. */
  cited: number;
  followUps: string[];
}

const P = (id: number, pass = true) => ({ n: id, pass });

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  pets: {
    id: "pets",
    chip: "Pet gadgets",
    prompt:
      "Which hooks are selling pet gadgets this month? Watch 500 videos and rank what works.",
    questions: [
      "Which hooks open the top 10%?",
      "Which pet problem is shown first?",
      "What price points show up?",
      "Which formats are growing?",
    ],
    parameters: [
      ["Hook strength", 30],
      ["Relevance", 25],
      ["Engagement rate", 20],
      ["Velocity", 15],
      ["Purchase intent", 10],
    ],
    keywords: [
      { text: "tiktok made me buy it pets", platform: "tiktok", from: ["q1", "p5"] },
      { text: "cat hair remover", platform: "tiktok", from: ["q2", "p2"] },
      { text: "dog grooming hack", platform: "instagram", from: ["q2", "q4"] },
      { text: "smart pet feeder review", platform: "youtube", from: ["q3", "p5"] },
      { text: "dog bath hack", platform: "tiktok", from: ["q2", "p4"] },
      { text: "pet products amazon finds", platform: "instagram", from: ["q3", "q4"] },
    ],
    lanes: { tiktok: 318, instagram: 241, youtube: 183 },
    found: 742,
    passed: 512,
    runSeconds: 278,
    gate: [
      P(22), P(34), P(53, false), P(47), P(43), P(13), P(21, false), P(7), P(19), P(25),
      P(38), P(12, false), P(40), P(50), P(48, false), P(56), P(37), P(24, false), P(60), P(46, false),
    ],
    ranked: [
      { n: 22, score: 94, hook: "Before and after on camera", matched: ["Q1", "Q2"] },
      { n: 34, score: 91, hook: "Curiosity close-up", matched: ["Q1", "Q4"] },
      { n: 47, score: 89, hook: "Problem shown first", matched: ["Q2", "Q4"] },
      { n: 43, score: 87, hook: "Warning hook", matched: ["Q1", "Q3"] },
      { n: 13, score: 84, hook: "“Obsessed” claim", matched: ["Q2", "Q3"] },
      { n: 7, score: 62, hook: "Grooming ASMR", matched: ["Q4"] },
    ],
    answer:
      "Winners open on the problem (shedding, matted fur, bath-time chaos) and show the gadget fixing it within two seconds. Close-ups beat talking heads.",
    cited: 38,
    followUps: [
      "Turn the top 5 hooks into a creator brief",
      "Why did @pawlumepets beat a 10.9M-view video?",
      "Alert me when a pet gadget breaks out",
    ],
  },
  kitchen: {
    id: "kitchen",
    chip: "Kitchen finds",
    prompt:
      "Which kitchen gadget demos are winning right now? Watch 500 videos and rank the hooks.",
    questions: [
      "Which hooks open the top 10%?",
      "Do winners show the result first?",
      "What price points show up?",
      "Which creators repeat a format?",
    ],
    parameters: [
      ["Hook strength", 30],
      ["Relevance", 25],
      ["Demo clarity", 20],
      ["Velocity", 15],
      ["Purchase intent", 10],
    ],
    keywords: [
      { text: "amazon kitchen finds", platform: "tiktok", from: ["q1", "q3"] },
      { text: "kitchen gadgets you need", platform: "youtube", from: ["q1", "p3"] },
      { text: "tiktok made me buy it", platform: "tiktok", from: ["q3", "p5"] },
      { text: "meat defroster tray", platform: "tiktok", from: ["q2", "p3"] },
      { text: "kitchen organization hack", platform: "instagram", from: ["q4", "p2"] },
      { text: "cooking gadget review", platform: "youtube", from: ["q2", "q4"] },
    ],
    lanes: { tiktok: 352, instagram: 214, youtube: 240 },
    found: 806,
    passed: 538,
    runSeconds: 291,
    gate: [
      P(4), P(9), P(53, false), P(35), P(2), P(1), P(23, false), P(55), P(57), P(59),
      P(33, false), P(51), P(52), P(11, false), P(44), P(42), P(48, false), P(5), P(17), P(26, false),
    ],
    ranked: [
      { n: 4, score: 95, hook: "Result in the first frame", matched: ["Q1", "Q2"] },
      { n: 59, score: 91, hook: "Side-by-side test", matched: ["Q2", "Q4"] },
      { n: 9, score: 88, hook: "Numbered finds list", matched: ["Q1", "Q3"] },
      { n: 35, score: 86, hook: "“No regrets” review", matched: ["Q3", "Q4"] },
      { n: 2, score: 83, hook: "Satisfying pour", matched: ["Q1", "Q2"] },
      { n: 17, score: 64, hook: "Slow reveal", matched: ["Q4"] },
      { n: 52, score: 58, hook: "Recipe first", matched: ["Q4"] },
    ],
    answer:
      "Top demos show the finished result in the first frame, then rewind to the gadget. Numbered “finds” lists hold attention longest.",
    cited: 41,
    followUps: [
      "Write three hooks in the @glenxda style",
      "Compare Reels and Shorts winners",
      "Find creators worth briefing",
    ],
  },
  skincare: {
    id: "skincare",
    chip: "Skincare routines",
    prompt:
      "What do top skincare routines show in the first three seconds? Watch 500 videos and rank them.",
    questions: [
      "What happens in the first 3 seconds?",
      "Which products get named?",
      "Which proof types show up?",
      "Who is the audience?",
    ],
    parameters: [
      ["Hook strength", 30],
      ["Relevance", 25],
      ["Visible result", 20],
      ["Engagement rate", 15],
      ["Velocity", 10],
    ],
    keywords: [
      { text: "night skincare routine", platform: "tiktok", from: ["q1", "q4"] },
      { text: "grwm skincare", platform: "tiktok", from: ["q1", "p1"] },
      { text: "facial before and after", platform: "instagram", from: ["q3", "p3"] },
      { text: "skincare must haves", platform: "youtube", from: ["q2", "p2"] },
      { text: "morning skincare routine", platform: "tiktok", from: ["q1", "q2"] },
      { text: "esthetician tips", platform: "instagram", from: ["q3", "q4"] },
    ],
    lanes: { tiktok: 401, instagram: 236, youtube: 183 },
    found: 820,
    passed: 521,
    runSeconds: 252,
    gate: [
      P(36), P(3), P(53, false), P(11), P(18), P(21, false), P(20), P(8), P(7, false), P(14),
      P(30), P(4, false), P(39, false), P(23, false), P(34, false), P(12, false), P(48, false), P(46, false), P(26, false), P(24, false),
    ],
    ranked: [
      { n: 36, score: 93, hook: "Finished skin shown first", matched: ["Q1", "Q3"] },
      { n: 3, score: 90, hook: "Treatment close-up", matched: ["Q1", "Q3"] },
      { n: 11, score: 88, hook: "Product named in frame one", matched: ["Q1", "Q2"] },
      { n: 18, score: 85, hook: "“Updated routine” hook", matched: ["Q2", "Q4"] },
      { n: 20, score: 81, hook: "Must-have list", matched: ["Q2"] },
      { n: 30, score: 57, hook: "Unboxing", matched: ["Q2"] },
    ],
    answer:
      "Winning routines open on the finished skin, then name one hero product within three seconds. Talking straight to camera beats voiceover.",
    cited: 34,
    followUps: [
      "Turn the top 5 openings into UGC briefs",
      "Which products get named most?",
      "Compare TikTok and Reels winners",
    ],
  },
};

export const SCENARIO_ORDER: ScenarioId[] = ["pets", "kitchen", "skincare"];
export const DEFAULT_SCENARIO: ScenarioId = "pets";

/** Keyword searches per 500-video run (agent contract). Step 2 shows six of them. */
export const KEYWORD_BUDGET = 10;

/* ------------------------------------------------------------------ copy */

export interface StepCopy {
  index: "01" | "02" | "03";
  /** Short label for the step marker. */
  label: string;
  title: string;
  body: string;
  /** Key facts, shown as one wrapped line under the body. */
  facts: string[];
}

export const STEPS: [StepCopy, StepCopy, StepCopy] = [
  {
    index: "01",
    label: "Assistant",
    title: "You ask, in plain words.",
    body: "Explain your requirements in detail or go on a vague rant. Your agent takes care of the rest.",
    // Step 01 shows the brief picker instead of a facts line.
    facts: [],
  },
  {
    index: "02",
    label: "Planner",
    title: "It turns your ask into a plan.",
    body: "The agent breaks your request into questions (Q) to answer and parameters (P) to score. Then it spins up niche keywords along with the mainstream ones.",
    facts: [],
  },
  {
    index: "03",
    label: "Watcher",
    title: "It watches, then ranks.",
    body: "500 to 1,000 videos from your niche, watched and scored against your parameters in under five minutes. Noise drops out and high-potential videos rise.",
    facts: ["500 to 1,000 videos", "Under 5 minutes", "Ranked list with a cited answer"],
  },
];

/** Outro row: the "keep asking" band over the deep-dive recording and the follow-up chat. */
export const OUTRO = {
  label: "Back to assistant",
  videoCaption: "Deep dive, recorded in the ContHunt app",
} as const;
