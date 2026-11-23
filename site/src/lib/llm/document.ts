import "server-only";
/**
 * Markdown for the pages this Next app owns.
 * Prices come from PLANS. Article bodies are the existing Markdown, with the real title and
 * excerpt first so a short quote is the page's own summary. Legacy privacy, terms, and docs
 * are not rendered here: nginx serves those HTML files, and this image does not contain them.
 */
import { getAllPosts, getPost } from "@/lib/blog/posts";
import type { Post, PostSummary } from "@/lib/blog/types";
import {
  PLATFORM_UNITS_PER_KEYWORD_SEARCH,
  PLANS,
  TRIAL_DAYS,
  approx,
  formatInt,
  videosForCredits,
  yearlyTotal,
  type Plan,
  type PlanFeature,
} from "@/components/sections/pricing/plans";
import {
  CONTACT,
  MESSAGE_CHECKLIST,
  SUPPORT_DESCRIPTION,
  TOPICS,
  type Paragraph,
} from "@/components/pages/support/content";
import { APP_URL, DOCS_URL, MCP_DOCS_URL, MCP_SERVER_URL, PRIVACY_URL, SITE_URL, TERMS_URL } from "@/lib/links";
import { PRODUCT_SUMMARY, absoluteUrl } from "@/lib/seo/site";
import { loadPlatformBenchmarks } from "@/lib/tools/benchmarks";
import { BOARD_SIZE } from "@/lib/viral-now/ranking";
import { snapshotDescription } from "@/lib/viral-now/copy";
import { loadViralNowData } from "@/lib/viral-now/load";
import { absoluteMarkdownUrl, isMarkdownDocument } from "./paths";

const INTRO =
  "ContHunt supports three platforms today: TikTok, Instagram Reels and YouTube Shorts. For each analyzed video it reports the hook, the content, the audience, a possible virality concept and the metrics, plus how relevant the video is to the question that was asked. Scores are ContHunt's analysis of the content and its fit to the question. They are not measured viewer retention. After a Deep Search finishes you can keep talking to the agent to dig further into the results.";

const PAGE_BLURBS: { path: string; label: string; blurb: string }[] = [
  { path: "/", label: "Home", blurb: "what ContHunt does, how Deep Search works, the main features, plans and common questions." },
  { path: "/pricing", label: "Pricing", blurb: "the three plans, yearly or monthly billing, and a calculator that estimates the research hours you get back." },
  { path: "/support", label: "Support", blurb: "how to reach support by email, what to include, and help topics." },
  { path: "/viral-now", label: "Viral Now", blurb: "the top viral short-form videos across the published niches." },
  {
    path: "/tools",
    label: "Free Creator Tools",
    blurb: "free TikTok and Instagram Reels engagement rate and outlier calculators benchmarked against public Viral Now clips.",
  },
  {
    path: "/tools/tiktok-engagement-rate-calculator",
    label: "TikTok Engagement Rate Calculator",
    blurb: "free TikTok engagement rate, like-to-view, save-to-view, share-to-view and outlier calculator with Viral Now niche benchmarks.",
  },
  {
    path: "/tools/instagram-engagement-rate-calculator",
    label: "Instagram Engagement Rate Calculator",
    blurb: "free Instagram Reels engagement rate by views and followers, batch average and outlier calculator benchmarked against public Viral Now Reels.",
  },
  {
    path: "/resources",
    label: "Resources",
    blurb: "playbooks, guides and research on short-form video, hooks, formats and virality.",
  },
];

function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function linkLabel(text: string): string {
  return oneLine(text).replace(/[\[\]]/g, "");
}

function canonicalLine(htmlPath: string): string {
  return `Canonical: ${absoluteUrl(htmlPath)}`;
}

function featureLabel(feature: PlanFeature): string {
  const label = `${feature.lead ? `${feature.lead} ` : ""}${feature.text}`;
  return feature.badge ? `${label} (${feature.badge})` : label;
}

function planSentence(plan: Plan): string {
  const features = plan.features.map(featureLabel).join(", ");
  const added = plan.includes === "Includes" ? features : `${plan.includes} ${features}`;
  return `- ${plan.name}: $${plan.price.yearly} per month billed yearly ($${formatInt(yearlyTotal(plan))} a year) or $${plan.price.monthly} billed monthly. ${formatInt(plan.allowance.huntCredits)} hunt credits and ${formatInt(plan.allowance.aiCredits)} AI credits per month (about ${formatInt(approx(videosForCredits(plan.allowance.aiCredits)))} videos analyzed); the ${TRIAL_DAYS}-day trial gives ${formatInt(plan.trial.huntCredits)} hunt credits and ${formatInt(plan.trial.aiCredits)} AI credits. ${added}.`;
}

function pricingIntro(): string {
  return `Prices are in US dollars and are as listed on ${absoluteUrl("/pricing")}, which is the source of truth. Every plan starts with a ${TRIAL_DAYS}-day free trial. Yearly billing is shown by default and costs less per month than monthly billing; both get the same credits. Hunt credits pay for searches and tracking: a keyword search costs one hunt credit per platform it queries, so ${PLATFORM_UNITS_PER_KEYWORD_SEARCH} across TikTok, Instagram Reels and YouTube Shorts, and tracking costs one per tracked item per refresh. AI credits pay for video analysis, Deep Search, chat and insights.`;
}

function productFacts(nicheCount: number): string[] {
  return [
    "- What it is: a research product for finding and analyzing short-form video, so teams can see what hooks, formats and trends work in a niche before they brief a creator or plan an ad.",
    "- Platforms: TikTok, Instagram Reels, YouTube Shorts. No other platform is supported today.",
    "- Deep Search: breaks a question into sub-questions to answer and parameters to score, builds keyword searches, analyzes 500 to 1,000 videos in under five minutes, then ranks them and answers with citations to the video data.",
    `- Viral Now: a public page of top-performing short-form videos across ${nicheCount} niches, with up to ${BOARD_SIZE} ranked videos per niche.`,
    "- Tracking: follow public accounts and selected videos, and keep daily cumulative snapshots to review competitor growth.",
    "- AI boards: save and organize videos from your research.",
    `- MCP server: AI agents can use ContHunt through the hosted MCP server at ${MCP_SERVER_URL}. Sign-in is with a ContHunt account.`,
    `- App: ${APP_URL}`,
  ];
}

function articleLink(post: PostSummary): string {
  return `- [${linkLabel(post.title)}](${absoluteMarkdownUrl(post.href)}): ${oneLine(post.excerpt)}`;
}

const START_HERE_SLUGS = [
  "what-is-content-intelligence",
  "how-to-score-a-tiktok-you-do-not-own",
  "how-to-compare-two-tiktoks-without-analytics",
  "how-many-public-tiktoks-to-watch-before-a-brief",
  "when-a-public-tiktok-caption-disagrees-with-the-footage",
  "how-to-tell-a-product-question-in-tiktok-comments-from-a-joke",
  "how-to-score-a-ugc-video-you-do-not-own",
  "using-conthunt-with-ai-agents-through-mcp",
];

function startHereLinks(): string[] {
  const bySlug = new Map(getAllPosts().map((post) => [post.slug, post]));
  return START_HERE_SLUGS.flatMap((slug) => {
    const post = bySlug.get(slug);
    return post ? [articleLink(post)] : [];
  });
}

function pageLinks(): string[] {
  return PAGE_BLURBS.map((page) => `- [${page.label}](${absoluteMarkdownUrl(page.path)}): ${page.blurb}`);
}

function nicheLinks(): string[] {
  return loadViralNowData().niches.map(
    (niche) => `- [${linkLabel(niche.name)}](${absoluteUrl(`/viral-now/${niche.slug}`)}): ${oneLine(niche.description)}`,
  );
}

function renderHome(): string {
  const nicheCount = loadViralNowData().niches.length;
  return [
    "# ContHunt",
    "",
    `> ${PRODUCT_SUMMARY}`,
    "",
    INTRO,
    "",
    canonicalLine("/"),
    "",
    "## Product facts",
    "",
    ...productFacts(nicheCount),
    "",
    "## Pricing",
    "",
    pricingIntro(),
    "",
    ...PLANS.map(planSentence),
    "",
    "## Pages",
    "",
    ...pageLinks(),
    "",
  ].join("\n");
}

function renderPricing(): string {
  return [
    "# Pricing",
    "",
    `> ContHunt plans: Pro, Creator and Research, each with a ${TRIAL_DAYS}-day free trial. Yearly billing saves more.`,
    "",
    pricingIntro(),
    "",
    ...PLANS.map(planSentence),
    "",
    canonicalLine("/pricing"),
    "",
  ].join("\n");
}

function paragraphMarkdown(runs: Paragraph): string {
  return runs.map((run) => (typeof run === "string" ? run : `[${run.text}](${run.href})`)).join("");
}

function renderSupport(): string {
  return [
    "# Support",
    "",
    `> ${SUPPORT_DESCRIPTION}`,
    "",
    ...CONTACT.map(paragraphMarkdown),
    "",
    "## What to include",
    "",
    ...MESSAGE_CHECKLIST.map((item) => `- ${item}`),
    "",
    ...TOPICS.flatMap((topic) => [`## ${topic.title}`, "", ...topic.body.flatMap((runs) => [paragraphMarkdown(runs), ""])]),
    canonicalLine("/support"),
    "",
  ].join("\n");
}

function renderViralNow(): string {
  const { niches } = loadViralNowData();
  const description = snapshotDescription({ niches: niches.length, weekOf: null });
  return [
    "# Viral Now",
    "",
    `> ${description}`,
    "",
    canonicalLine("/viral-now"),
    "",
    "## Niches",
    "",
    ...nicheLinks(),
    "",
  ].join("\n");
}

function renderTools(): string {
  return [
    "# Free Creator Tools",
    "",
    "> Free, no-login short-form video calculators benchmarked against ContHunt's public Viral Now dataset.",
    "",
    canonicalLine("/tools"),
    "",
    "## Calculators",
    "",
    `- [TikTok Engagement Rate Calculator](${absoluteUrl("/tools/tiktok-engagement-rate-calculator")}): Calculate TikTok engagement rate by views and followers, like-to-view, save-to-view, share-to-view, and breakout outlier multiplier against real Viral Now niche medians.`,
    `- [Instagram Engagement Rate Calculator](${absoluteUrl("/tools/instagram-engagement-rate-calculator")}): Calculate Instagram Reels engagement rate by views and followers, batch 3-10 post averages, and outlier scores against public Viral Now Reels benchmarks.`,
    "",
  ].join("\n");
}

function renderCalculatorDoc(platform: "tiktok" | "instagram"): string {
  const dataset = loadPlatformBenchmarks(platform);
  const isTikTok = platform === "tiktok";
  const path = isTikTok
    ? "/tools/tiktok-engagement-rate-calculator"
    : "/tools/instagram-engagement-rate-calculator";
  const title = isTikTok
    ? "TikTok Engagement Rate Calculator"
    : "Instagram Engagement Rate Calculator";
  return [
    `# ${title}`,
    "",
    `> Free ${isTikTok ? "TikTok" : "Instagram Reels"} engagement rate and outlier calculator with single-post and batch (3-10 posts) modes, CSV export, and real Viral Now public niche medians.`,
    "",
    canonicalLine(path),
    "",
    "## Formulas",
    "",
    "- Full Engagement Rate by Views: ((Likes + Comments + Shares + Saves) / Views) * 100",
    `- Public-Comparable Engagement Rate by Views: ${isTikTok ? "((Likes + Comments + Shares) / Views) * 100" : "((Likes + Comments) / Views) * 100"}`,
    "- Engagement Rate by Followers: ((Likes + Comments + Shares + Saves) / Followers) * 100",
    "- Outlier Multiplier: Video Views / Account Median Views",
    "",
    `## Viral Now Public Benchmark Snapshot (week of ${dataset.weekOf})`,
    "",
    `- Sample size: ${dataset.totalPlatformVideos} public ${isTikTok ? "TikTok" : "Instagram Reels"} clips across 20 niches`,
    `- Median public engagement rate by views: ${dataset.overallMedianPublicErPct.toFixed(2)}%`,
    `- 75th percentile public engagement rate by views: ${dataset.overallP75PublicErPct.toFixed(2)}%`,
    `- Median like-to-view ratio: ${dataset.overallMedianLikeToViewPct.toFixed(2)}%`,
    "",
  ].join("\n");
}

function renderResources(): string {
  const posts = getAllPosts().filter((post) => post.section === "resources");
  return [
    "# Resources",
    "",
    "> Playbooks, guides and research on short-form video, hooks, formats and virality for TikTok, Reels and Shorts, from the team behind ContHunt Deep Search.",
    "",
    canonicalLine("/resources"),
    "",
    "## Articles",
    "",
    ...posts.map(articleLink),
    "",
  ].join("\n");
}

function renderArticle(post: Post): string {
  return [`# ${post.title}`, "", oneLine(post.excerpt), "", `Updated: ${post.updated}`, canonicalLine(post.href), "", post.body.trim(), ""].join("\n");
}

function articleAt(htmlPath: string): Post | null {
  const match = /^\/(?:resources|blog)\/([a-z0-9-]+)$/.exec(htmlPath);
  if (!match?.[1]) return null;
  const post = getPost(match[1]);
  if (!post || post.href !== htmlPath) return null;
  return post;
}

/** Markdown for one public page, or null when this app does not own that path. */
export function renderMarkdown(htmlPath: string): string | null {
  if (!isMarkdownDocument(htmlPath)) return null;
  if (htmlPath === "/") return renderHome();
  if (htmlPath === "/pricing") return renderPricing();
  if (htmlPath === "/support") return renderSupport();
  if (htmlPath === "/viral-now") return renderViralNow();
  if (htmlPath === "/tools") return renderTools();
  if (htmlPath === "/tools/tiktok-engagement-rate-calculator") return renderCalculatorDoc("tiktok");
  if (htmlPath === "/tools/instagram-engagement-rate-calculator") return renderCalculatorDoc("instagram");
  if (htmlPath === "/resources") return renderResources();
  const post = articleAt(htmlPath);
  return post ? renderArticle(post) : null;
}

function newestArticleUpdate(): string | null {
  const dates = getAllPosts().map((post) => post.updated);
  if (dates.length === 0) return null;
  return dates.reduce((latest, date) => (date > latest ? date : latest));
}

/** llms.txt index. Page links point at Markdown. Legal and docs stay HTML. */
export function renderLlmsTxt(): string {
  const posts = getAllPosts();
  const resources = posts.filter((post) => post.section === "resources");
  const blog = posts.filter((post) => post.section === "blog");
  const newest = newestArticleUpdate();
  const nicheCount = loadViralNowData().niches.length;
  return [
    "# ContHunt",
    "",
    `> ${PRODUCT_SUMMARY}`,
    "",
    newest ? `Newest article update: ${newest}` : "",
    "",
    INTRO,
    "",
    "The HTML page is the canonical URL. The links below are the Markdown copy of the same words.",
    "",
    "## Product facts",
    "",
    ...productFacts(nicheCount),
    "",
    "## Pricing",
    "",
    pricingIntro(),
    "",
    ...PLANS.map(planSentence),
    "",
    "## Pages",
    "",
    ...pageLinks(),
    "",
    "## Viral Now niches",
    "",
    "Each niche has its own HTML page. The link is the canonical URL.",
    "",
    ...nicheLinks(),
    "",
    "## Start here",
    "",
    "One worked pass, the six public-video checks, and the agent connection. The full lists follow.",
    "",
    ...startHereLinks(),
    "",
    "## Resources (articles)",
    "",
    ...resources.map(articleLink),
    "",
    "## Blog (articles)",
    "",
    ...blog.map(articleLink),
    "",
    "## Optional",
    "",
    "Privacy, terms, and the docs are HTML. This app does not publish a Markdown twin for them.",
    "",
    `- [Documentation](${DOCS_URL}): product documentation.`,
    `- [MCP setup guide](${MCP_DOCS_URL}): connect an AI agent to the ContHunt MCP server.`,
    `- [Privacy policy](${PRIVACY_URL})`,
    `- [Terms of service](${TERMS_URL})`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    `- [Full Markdown export](${SITE_URL}/llms-full.txt)`,
    `- [Agent skill](${SITE_URL}/.well-known/skills/conthunt/SKILL.md)`,
    "",
  ]
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n");
}

/** Home, pricing, support, tools, Viral Now, the resources index, and every article, in that order. */
export function renderLlmsFull(): string {
  const pages = [
    "/",
    "/pricing",
    "/support",
    "/tools",
    "/tools/tiktok-engagement-rate-calculator",
    "/tools/instagram-engagement-rate-calculator",
    "/viral-now",
    "/resources",
    ...getAllPosts().map((post) => post.href),
  ];
  const parts = pages.map((path) => renderMarkdown(path)).filter((part): part is string => Boolean(part));
  return `${parts.join("\n\n---\n\n").trim()}\n`;
}
