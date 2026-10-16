/**
 * FAQ entries shown by the FAQ section: the retained legacy copy from
 * `src/content/site/faqs.ts` (read-only for this section), with two minimal
 * corrections applied here, plus three additions that restate facts the owner
 * supplied (brief, PLAN, OWNER_DECISIONS).
 *
 * Corrections to retained copy (docs/revamp/content/legacy-inventory.md §5 and §4):
 *  - "Which platforms do you support?" drops the unverified LinkedIn / X "beta"
 *    claim; the product supports TikTok, Instagram Reels and YouTube Shorts only.
 *  - "Can I cancel anytime?" no longer says "monthly billing, no long-term
 *    contracts"; plans bill yearly by default with monthly as the alternative.
 *
 * Additions (switch off with INCLUDE_ADDITIONS = false): what a deep search is,
 * the 1-week trial, and the MCP route. Each sentence repeats a fact that is
 * already in the owner's brief or the plan; none introduces a new number.
 */
import { data, type FaqItem } from "@/content/site/faqs";
import { MCP_DOCS_URL, ROUTES } from "@/lib/links";

export type FaqEntry = FaqItem & {
  /** Stable key, used by `pickFaqs`. */
  id?: string;
  /** Short mono tags rendered under the answer. */
  chips?: readonly string[];
  /** Optional quiet link rendered under the answer. */
  link?: { label: string; href: string };
};

/** Set false to ship only the (corrected) retained questions. */
const INCLUDE_ADDITIONS = true;

const ID_BY_QUESTION: Record<string, string> = {
  "Is this just another social listening tool?": "social-listening",
  "Which platforms do you support?": "platforms",
  "Can I cancel anytime?": "cancel",
};

/** Corrections keyed by the legacy question text. A changed question in the data file drops its override. */
const CORRECTIONS: Record<string, Partial<FaqEntry>> = {
  "Which platforms do you support?": {
    answer: "Currently, we support TikTok, Instagram Reels, and YouTube Shorts.",
    chips: ["TikTok", "Instagram Reels", "YouTube Shorts"],
  },
  "Can I cancel anytime?": {
    answer:
      "Absolutely. Plans bill yearly by default, or monthly if you prefer, and you can cancel anytime. You can export your data before you leave.",
    emphasis: [],
  },
};

const retained: FaqEntry[] = data.items.map((item) => ({
  ...item,
  id: ID_BY_QUESTION[item.question],
  ...CORRECTIONS[item.question],
}));

const additions = {
  deepSearch: {
    id: "deep-search",
    question: "What is a deep search?",
    answer:
      "Deep search is ContHunt's flagship research. It breaks your search into the questions that need answering and the parameters to score, then watches 500 to 1,000 videos from your niche and analyzes them in under 5 minutes. You get a ranked list and answers backed by actual video data.",
    emphasis: ["500 to 1,000 videos", "under 5 minutes"],
    chips: ["500 to 1,000 videos", "< 5 min"],
  },
  trial: {
    id: "free-trial",
    question: "Is there a free trial?",
    answer:
      "Yes. Every plan starts with a 1-week free trial, and plans are currently on discounted prices.",
    emphasis: ["1-week free trial"],
    link: { label: "See pricing", href: ROUTES.pricing },
  },
  mcp: {
    id: "agents",
    question: "Can I use ContHunt inside my AI agent?",
    answer:
      "Yes. ContHunt runs as an MCP server, so any MCP-compatible agent can search, analyze and rank videos for you. The docs have the exact setup steps.",
    emphasis: ["MCP server"],
    link: { label: "Read the MCP guide", href: MCP_DOCS_URL },
  },
} satisfies Record<string, FaqEntry>;

const [socialListening, platforms, cancel] = retained;

/** Default order: lead with the product, then the retained questions, then the commercial ones. */
export const FAQ_ITEMS: readonly FaqEntry[] = INCLUDE_ADDITIONS
  ? [additions.deepSearch, socialListening, platforms, additions.trial, cancel, additions.mcp].filter((entry): entry is FaqEntry => Boolean(entry))
  : retained;

/** Pick entries by id for a page that wants a subset, e.g. `pickFaqs(["free-trial", "cancel"])` on /pricing. */
export function pickFaqs(ids: readonly string[]): FaqEntry[] {
  return ids.map((id) => FAQ_ITEMS.find((item) => item.id === id)).filter((item): item is FaqEntry => Boolean(item));
}
