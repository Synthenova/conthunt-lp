/**
 * Content specifications for vertical use-case landing pages, short-form video glossary entries,
 * and programmatic SEO/GEO hub pages (Moves #7, #8, #10, #11, #12, #13, #14, #15, #16).
 *
 * Editorial rules:
 * - ContHunt verified facts only: https://conthunt.app, app https://agent.conthunt.app,
 *   hosted MCP https://mcp.conthunt.app/mcp, MCP docs https://conthunt.app/docs/integrations/mcp,
 *   covers TikTok, Instagram Reels, and YouTube Shorts, paid plans starting at $25/mo.
 * - Benchmark figures cited in glossary context come strictly from ContHunt's November 2026
 *   sampled dataset (benchmark-2026.json, extracted 2026-11-23, n = 500 sampled clips per platform)
 *   and are labeled as sample medians rather than universal platform averages.
 * - All examples are explicitly framed as illustrative scenarios with no invented creators or testimonials.
 * - Partner categories are transparently framed as open ecosystem categories, never claimed partnerships.
 */

export interface EntityFaq {
  readonly question: string;
  readonly answer: string;
}

export interface UseCaseWorkflowStep {
  readonly title: string;
  readonly detail: string;
}

export type UseCaseSlug =
  | "ugc-agencies"
  | "ecommerce-brands"
  | "saas-growth-teams"
  | "faceless-channels"
  | "short-form-creators"
  | "ai-agent-builders";

export interface UseCasePageSpec {
  readonly slug: UseCaseSlug;
  readonly name: string;
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly subtitle: string;
  readonly answerFirst: string;
  readonly painPoints: readonly string[];
  readonly workflowSteps: readonly UseCaseWorkflowStep[];
  readonly mcpAngle: string;
  readonly faqs: readonly EntityFaq[];
}

export type GlossarySlug =
  | "outlier-video"
  | "hook-rate"
  | "3-second-retention"
  | "engagement-rate"
  | "virality-score"
  | "mcp-content-research"
  | "ugc-whitelisting"
  | "watch-time-ratio"
  | "view-velocity"
  | "save-rate"
  | "share-rate"
  | "fyp-algorithm"
  | "scroll-stopper"
  | "faceless-shorts"
  | "content-intelligence";

export interface GlossaryTermSpec {
  readonly slug: GlossarySlug;
  readonly term: string;
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly shortDefinition: string;
  readonly deepDive: string;
  readonly formula?: string;
  readonly benchmarkContext: string;
  readonly example: string;
  readonly faqs: readonly EntityFaq[];
  readonly relatedSlugs: readonly GlossarySlug[];
}

export interface HubPageCopy {
  readonly path: string;
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly h1: string;
  readonly subtitle: string;
  readonly answerFirst: string;
  readonly highlights: readonly string[];
  readonly methodologyNote?: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly faqs: readonly EntityFaq[];
}

export interface PartnerCategorySpec {
  readonly id: string;
  readonly name: string;
  readonly summary: string;
  readonly collaborationFormats: readonly string[];
  readonly exampleWorkflow: string;
  readonly statusLabel: "Open partner category";
}

export interface PartnersHubCopy extends HubPageCopy {
  readonly transparencyNotice: string;
  readonly partnerCategories: readonly PartnerCategorySpec[];
}

export interface GrowthHubCopyMap {
  readonly dataHub: HubPageCopy;
  readonly viralHooks: HubPageCopy;
  readonly trendingHashtags: HubPageCopy;
  readonly boards: HubPageCopy;
  readonly creators: HubPageCopy;
  readonly newsletter: HubPageCopy;
  readonly partners: PartnersHubCopy;
  readonly viralIndex: HubPageCopy;
}

export const USE_CASE_PAGES: readonly UseCasePageSpec[] = [
  {
    slug: "ugc-agencies",
    name: "UGC Agencies",
    seoTitle: "Short-Form Video Research for UGC Agencies | ContHunt",
    metaDescription:
      "Build evidence-backed UGC creative briefs faster. Discover outlier hooks across TikTok, Instagram Reels, and YouTube Shorts, save client boards, and connect via MCP.",
    h1: "Turn cross-platform outlier research into client-ready UGC briefs.",
    subtitle:
      "Stop pasting scattered TikTok links into spreadsheets before every sprint. Research winning hooks, creator angles, and repeatable ad structures across TikTok, Instagram Reels, and YouTube Shorts in one workspace.",
    answerFirst:
      "UGC agencies use ContHunt to replace manual scrolling with structured creative intelligence across TikTok, Instagram Reels, and YouTube Shorts. Strategists filter for outlier videos that beat an account's usual baseline, inspect opening hooks and transcripts, organize proof into client-specific boards, and hand creators briefs backed by real short-form evidence rather than guesswork.",
    painPoints: [
      "Creative strategists spend hours manually scrolling burner accounts across TikTok, Reels, and Shorts to assemble weekly client reference decks.",
      "Single viral clips get mistaken for repeatable formats when agencies do not compare each video against the posting account's baseline performance.",
      "Reference links scatter across Slack threads, Notion docs, and browser bookmarks, forcing teams to re-research the same niche for every new retainer.",
      "Creators receive vague briefs ('make it feel native and punchy') instead of concrete opening-frame patterns, pacing cues, and objection-handling structures.",
    ],
    workflowSteps: [
      {
        title: "Search category keywords and competitor handles across three platforms",
        detail:
          "Run niche discovery across TikTok, Instagram Reels, and YouTube Shorts inside https://agent.conthunt.app to see which product demos, problem-agitate-solve scripts, and founder angles are breaking out now.",
      },
      {
        title: "Isolate true outliers instead of vanity follower reach",
        detail:
          "Compare each clip's views and engagement against normal account baselines so your team studies hooks that earned algorithmic distribution on smaller accounts too.",
      },
      {
        title: "Curate client-specific boards and extract hook structures",
        detail:
          "Group winning clips into saved boards by client vertical, angle, or funnel stage, then break down transcripts, visual openings, and call-to-action transitions for your scriptwriters.",
      },
      {
        title: "Ship repeatable brief packs directly into your agency stack",
        detail:
          "Export evidence-backed creative angles or pull saved boards straight into your AI briefing assistant through ContHunt's hosted MCP server.",
      },
    ],
    mcpAngle:
      "Connect ContHunt's hosted MCP endpoint (https://mcp.conthunt.app/mcp) to Claude, ChatGPT, or internal agency workflows so strategists can ask an agent to query a client's saved board, group recurring 3-second hook patterns, and draft structured UGC creator briefs grounded in real links and metrics. Setup docs live at https://conthunt.app/docs/integrations/mcp.",
    faqs: [
      {
        question: "How does ContHunt help UGC agencies across multiple client niches?",
        answer:
          "Agencies can run niche discovery across TikTok, Instagram Reels, and YouTube Shorts and organize separate saved boards per client or campaign angle so strategists reuse proven patterns without starting from scratch each month.",
      },
      {
        question: "Does ContHunt replace ad libraries like Meta Ad Library or TikTok Creative Center?",
        answer:
          "No—it complements them. Ad libraries show what brands are paying to run, while ContHunt focuses on organic short-form video discovery, outlier performance, hook analysis, and transcripts across TikTok, Reels, and YouTube Shorts so agencies spot winning organic angles before they saturate paid feeds.",
      },
      {
        question: "Can our scriptwriters use ContHunt inside Claude or Cursor?",
        answer:
          "Yes. Paid ContHunt plans (starting at $25/mo) include access to the hosted MCP server at https://mcp.conthunt.app/mcp, allowing creative teams to inspect saved boards, video evidence, and transcripts directly inside MCP-compatible AI assistants.",
      },
      {
        question: "Which platforms does ContHunt cover for UGC research?",
        answer:
          "ContHunt covers TikTok, Instagram Reels, and YouTube Shorts so agencies can track how a winning hook travels from one vertical feed to the others.",
      },
    ],
  },
  {
    slug: "ecommerce-brands",
    name: "Ecommerce & DTC Brands",
    seoTitle: "Short-Form Video Research for DTC Brands | ContHunt",
    metaDescription:
      "Spot winning product demo hooks, unboxing angles, and competitor outliers across TikTok, Instagram Reels, and YouTube Shorts with ContHunt.",
    h1: "Find product video angles that earn organic reach before you put spend behind them.",
    subtitle:
      "Track how competitors, affiliates, and category creators demonstrate products across TikTok, Instagram Reels, and YouTube Shorts—and turn repeatable hooks into your next studio or creator shoot.",
    answerFirst:
      "Ecommerce and DTC brands use ContHunt to identify which product demonstrations, comparison angles, and problem-solution hooks are outperforming baselines across TikTok, Instagram Reels, and YouTube Shorts. Instead of guessing which creative concept to film next, growth teams study real outlier clips, organize winning formats on boards, and feed verified reference evidence into both organic posting and paid creative testing.",
    painPoints: [
      "Paid social creative fatigues quickly when internal teams recycle the same three product benefits without fresh native hook formats.",
      "Category trends often break on TikTok weeks before they show up on Instagram Reels or YouTube Shorts, leaving single-platform trackers behind.",
      "Manually monitoring dozens of competing DTC brands and affiliate creators every week breaks down during peak retail launches.",
      "Founders and performance marketers struggle to distinguish lucky one-off viral posts from repeatable demonstration formats worth briefing to creators.",
    ],
    workflowSteps: [
      {
        title: "Track category problem keywords and competing DTC accounts",
        detail:
          "Search buyer pain points, product categories, and rival brand handles across TikTok, Instagram Reels, and YouTube Shorts inside https://agent.conthunt.app.",
      },
      {
        title: "Audit winning product-demo openings and proof moments",
        detail:
          "Inspect how top-performing clips frame the first three seconds—texture close-ups, before-and-after reveals, side-by-side comparisons, or myth-busting claims.",
      },
      {
        title: "Build campaign boards by SKU and customer objection",
        detail:
          "Save high-performing clips into structured boards (for example, 'price objection hooks', 'routine integration', or 'gift angle') so media buyers and creative directors share one reference library.",
      },
      {
        title: "Translate organic winners into creative testing sprints",
        detail:
          "Hand your in-house team or UGC roster concise shot lists and hook templates derived from observed outlier patterns across all three short-form platforms.",
      },
    ],
    mcpAngle:
      "Wire ContHunt MCP (https://mcp.conthunt.app/mcp) into your growth team's AI assistant to pull weekly summaries of saved competitor boards, compare hook patterns across TikTok and Reels, and draft fresh creative test matrices grounded in real video evidence. See https://conthunt.app/docs/integrations/mcp for setup.",
    faqs: [
      {
        question: "Is ContHunt a TikTok Shop GMV estimator?",
        answer:
          "No. ContHunt is a cross-platform short-form video intelligence workspace focused on TikTok, Instagram Reels, and YouTube Shorts discovery, outlier detection, hook analysis, boards, and MCP workflows. If you specifically need TikTok Shop store revenue estimates, pair ContHunt with a dedicated Shop analytics tool.",
      },
      {
        question: "How much does ContHunt cost for an ecommerce growth team?",
        answer:
          "Paid ContHunt plans start at $25/mo and cover TikTok, Instagram Reels, and YouTube Shorts discovery plus hosted MCP access.",
      },
      {
        question: "Why research organic Reels and Shorts if most of our spend is on paid social?",
        answer:
          "Organic short-form feeds act as a live testing ground for native hooks, pacing, and visual framing. Formats that hold attention organically often translate into stronger thumbstop rates when adapted for whitelisted creator ads and paid creative tests.",
      },
      {
        question: "Can we organize separate reference boards per product line?",
        answer:
          "Yes. Brands routinely maintain separate saved boards per SKU, seasonal campaign, or objection theme inside https://agent.conthunt.app.",
      },
    ],
  },
  {
    slug: "saas-growth-teams",
    name: "SaaS & B2B Growth Teams",
    seoTitle: "Short-Form Video Research for SaaS Teams | ContHunt",
    metaDescription:
      "Discover winning founder-led, product-walkthrough, and B2B educational short-form formats across TikTok, Instagram Reels, and YouTube Shorts.",
    h1: "Build a repeatable short-form engine for SaaS without copying consumer fluff.",
    subtitle:
      "Study how high-performing software founders, developer advocates, and B2B educators turn complex workflows into clear 30-to-60-second clips across TikTok, Instagram Reels, and YouTube Shorts.",
    answerFirst:
      "SaaS and B2B growth teams use ContHunt to find short-form video formats that actually resonate with technical and business buyers across TikTok, Instagram Reels, and YouTube Shorts. Rather than forcing consumer trends onto software products, teams track category educators, screen-recording walk-throughs, and founder storytelling outliers—then turn those structures into repeatable weekly scripts.",
    painPoints: [
      "Most viral trend libraries skew heavily toward lifestyle and consumer products, leaving B2B and SaaS marketers with few relevant creative benchmarks.",
      "Founder-led and product-marketing channels stall when every video sounds like a feature release note instead of a curiosity-driven story or workflow demo.",
      "Small growth teams do not have time to monitor YouTube Shorts, TikTok, and Instagram Reels separately to see how software topics perform on each feed.",
      "Marketing and product teams lack a shared repository of proven hook openings, screen-demo pacing, and educational series formats.",
    ],
    workflowSteps: [
      {
        title: "Map software category topics and creator benchmarks",
        detail:
          "Search workflow terms, adjacent SaaS tools, and niche B2B creators across YouTube Shorts, TikTok, and Instagram Reels to see which framing styles earn saves and comments.",
      },
      {
        title: "Compare educational formats against baseline views",
        detail:
          "Separate repeatable formats—like teardown threads, side-by-side workflow comparisons, and 'stop doing X manually' demos—from one-off industry news spikes.",
      },
      {
        title: "Save cross-platform series ideas to team boards",
        detail:
          "Organize winning clips by funnel stage (problem awareness, category comparison, product workflow) so founders, PMMs, and editors stay aligned.",
      },
      {
        title: "Automate weekly research digests with ContHunt MCP",
        detail:
          "Query your saved boards and category searches from Claude, Cursor, or internal growth agents via https://mcp.conthunt.app/mcp to turn real video evidence into weekly script outlines.",
      },
    ],
    mcpAngle:
      "SaaS teams already live in AI coding and writing assistants. By adding https://mcp.conthunt.app/mcp to Claude, Cursor, or an internal growth agent, marketers can pull real YouTube Shorts, TikTok, and Reels outliers straight into campaign docs and founder script drafts without manual copy-paste. Full setup instructions are at https://conthunt.app/docs/integrations/mcp.",
    faqs: [
      {
        question: "Does short-form video actually work for B2B and SaaS products?",
        answer:
          "Yes—especially when framed around concrete workflows, category myths, tear-downs, and visual product demos rather than generic trend dances. ContHunt helps SaaS teams study real software and B2B creator formats across YouTube Shorts, TikTok, and Instagram Reels.",
      },
      {
        question: "Which short-form platform should a SaaS team research first?",
        answer:
          "Many software buyers search and consume tutorials on YouTube Shorts while discovering founder stories on TikTok and Instagram Reels. ContHunt covers all three feeds in one workspace so you can compare how the same topic performs across platforms.",
      },
      {
        question: "Can our growth engineers integrate ContHunt into automated internal workflows?",
        answer:
          "Yes. ContHunt's hosted MCP server at https://mcp.conthunt.app/mcp lets technical growth teams connect short-form discovery, boards, and video evidence directly into MCP-compatible agents.",
      },
      {
        question: "What do paid ContHunt plans start at?",
        answer:
          "Paid plans start at $25/mo, including cross-platform research across TikTok, Instagram Reels, and YouTube Shorts plus hosted MCP access.",
      },
    ],
  },
  {
    slug: "faceless-channels",
    name: "Faceless Video Channels",
    seoTitle: "Outlier Research for Faceless Channels | ContHunt",
    metaDescription:
      "Find high-retention faceless storytelling niches, repeatable pacing structures, and cross-platform breakout formats on YouTube Shorts, TikTok, and Reels.",
    h1: "Spot repeatable faceless formats before a niche gets saturated.",
    subtitle:
      "Research high-performing narration hooks, visual pacing patterns, and topic clusters across YouTube Shorts, TikTok, and Instagram Reels so every script you produce starts from validated demand.",
    answerFirst:
      "Operators of faceless video channels use ContHunt to discover which storytelling niches, caption styles, and opening hooks consistently outperform channel baselines across YouTube Shorts, TikTok, and Instagram Reels. By analyzing real outlier clips and transcripts before writing scripts or rendering edits, faceless teams avoid burned-out topics and build repeatable episode templates.",
    painPoints: [
      "Copying clips that went viral months ago leads to saturated niches where audience retention drops before the first five seconds.",
      "Producing scripted narration, B-roll, and captions takes real production effort—guessing topics blindly wastes hours of editing.",
      "A faceless format that works on TikTok often needs pacing or title adjustments to win on YouTube Shorts and Instagram Reels.",
      "Tracking dozens of benchmark faceless channels across three platforms manually quickly becomes unsustainable for solo operators and small studios.",
    ],
    workflowSteps: [
      {
        title: "Discover active faceless niches across Shorts, TikTok, and Reels",
        detail:
          "Search storytelling themes, educational explainers, history/science breakdowns, or product listicles inside https://agent.conthunt.app to see where engagement is active right now.",
      },
      {
        title: "Filter for outlier clips on modest-sized channels",
        detail:
          "Prioritize videos whose views significantly beat the channel's normal median—a strong signal that the topic and opening hook carried distribution rather than an existing celebrity audience.",
      },
      {
        title: "Deconstruct script beats and opening visual loops",
        detail:
          "Review transcripts and pacing patterns to see how winning faceless clips open a curiosity gap in sentence one, deliver escalating beats, and close without telegraphing the ending too early.",
      },
      {
        title: "Standardize episode templates on saved boards",
        detail:
          "Keep dedicated boards for opening hooks, narration structures, and cross-platform winners so editors and scriptwriters follow proven blueprints.",
      },
    ],
    mcpAngle:
      "Faceless channel studios often combine research with AI script outlines and production pipelines. Connect https://mcp.conthunt.app/mcp so your AI writing assistant can inspect your saved boards, extract structural patterns across winning transcripts, and generate fresh topic variations grounded in observed outliers—not generic prompt tropes.",
    faqs: [
      {
        question: "Does ContHunt generate faceless videos automatically?",
        answer:
          "No. ContHunt is the research and content-intelligence layer—helping you find outlier videos, inspect hooks and transcripts, and organize validated formats across TikTok, Instagram Reels, and YouTube Shorts before you script and edit in your preferred production stack.",
      },
      {
        question: "Why check YouTube Shorts alongside TikTok and Reels for faceless channels?",
        answer:
          "Many faceless operators republish across all three feeds, yet topic demand and retention behavior differ by platform. Cross-platform research helps you spot formats gaining traction on one feed that remain under-served on another.",
      },
      {
        question: "How does outlier filtering help brand-new faceless channels?",
        answer:
          "When a small or newer channel publishes a clip that outperforms its typical posts by several multiples, that clip's topic and hook likely drove algorithmic distribution on merit—making it a far more useful blueprint for a new channel than a mega-creator's vlog.",
      },
      {
        question: "Can I feed ContHunt research into my scriptwriting agent?",
        answer:
          "Yes. Connect the hosted MCP server at https://mcp.conthunt.app/mcp (documented at https://conthunt.app/docs/integrations/mcp) to bring saved boards and video evidence directly into MCP-compatible AI assistants.",
      },
    ],
  },
  {
    slug: "short-form-creators",
    name: "Short-Form Creators",
    seoTitle: "Viral Hook Research for Short-Form Creators | ContHunt",
    metaDescription:
      "Beat blank-page syndrome with real outlier research. Find winning hooks, analyze peers, and save swipe boards across TikTok, Instagram Reels, and YouTube Shorts.",
    h1: "Know what hooks your audience before you hit record.",
    subtitle:
      "Replace endless doom-scrolling with focused research across TikTok, Instagram Reels, and YouTube Shorts—spot outlier videos in your niche, save inspiration to boards, and sharpen your opening three seconds.",
    answerFirst:
      "Short-form creators use ContHunt to turn chaotic feed scrolling into a focused weekly research habit across TikTok, Instagram Reels, and YouTube Shorts. Instead of guessing why a peer's clip took off, creators surface outlier videos, study the opening hook and transcript structure, save repeatable ideas to swipe boards, and adapt proven angles into their own voice.",
    painPoints: [
      "Scrolling your own For You or Explore feed mixes entertainment with research, eating hours while leaving you with only a handful of saved bookmarks.",
      "It is hard to tell whether a creator's video performed well because of the hook and topic or simply because the account already has a massive following.",
      "Saved folders inside TikTok, Instagram, and YouTube are siloed, making it annoying to compare hooks across all three platforms when planning a shoot day.",
      "Strong ideas underperform when the first two seconds bury the premise instead of establishing immediate visual and verbal stakes.",
    ],
    workflowSteps: [
      {
        title: "Search your niche across TikTok, Reels, and YouTube Shorts",
        detail:
          "Look up your core topics and adjacent niches in https://agent.conthunt.app to see what formats are pulling outsized attention right now.",
      },
      {
        title: "Study outlier videos rather than average uploads",
        detail:
          "Focus on clips that beat an account's usual baseline views and sparked strong likes or comments—those are the structural cues worth learning from.",
      },
      {
        title: "Collect swipe boards organized by format and hook type",
        detail:
          "Group winning clips into boards like 'storytime openers', 'myth-busting hooks', or 'tutorial pacing' so shoot-day prep takes minutes instead of an afternoon.",
      },
      {
        title: "Adapt the structure—never copy the script—into your own voice",
        detail:
          "Use the hook mechanics, visual pacing, and payoff timing as scaffolding while bringing your own perspective, lived experience, and examples.",
      },
    ],
    mcpAngle:
      "Pair ContHunt's hosted MCP server (https://mcp.conthunt.app/mcp) with Claude or ChatGPT as a personal creative producer: pull clips from your swipe boards, compare why three different hooks worked, and brainstorm original angles tailored to your channel's voice. See https://conthunt.app/docs/integrations/mcp.",
    faqs: [
      {
        question: "Is ContHunt built only for big agencies, or can solo creators use it?",
        answer:
          "Solo creators use ContHunt alongside agencies and brands. Paid plans start at $25/mo and give you cross-platform discovery across TikTok, Instagram Reels, and YouTube Shorts, saved swipe boards, and hosted MCP access.",
      },
      {
        question: "Does studying outlier videos make my content sound generic?",
        answer:
          "Only if you copy scripts word-for-word. The goal of content intelligence is understanding underlying mechanics—how a hook frames tension, how fast the visual scene shifts, and where the payoff lands—so you can apply those mechanics to your own original ideas.",
      },
      {
        question: "Can I research Instagram Reels and YouTube Shorts even if I mostly post on TikTok?",
        answer:
          "Yes. Studying all three platforms often gives creators an edge because strong formats frequently emerge on one feed before spreading to the other two.",
      },
      {
        question: "How do free ContHunt tools relate to the full app?",
        answer:
          "You can test public account analyzers, calculators, and hook libraries directly on https://conthunt.app, then move into https://agent.conthunt.app when you want saved boards, deeper cross-platform discovery, and hosted MCP workflows.",
      },
    ],
  },
  {
    slug: "ai-agent-builders",
    name: "AI Agent Builders",
    seoTitle: "Social Video MCP Server for AI Agents | ContHunt",
    metaDescription:
      "Give Claude, ChatGPT, Cursor, Codex, and custom MCP agents live access to TikTok, Instagram Reels, and YouTube Shorts discovery, boards, and video evidence.",
    h1: "Give your AI agents structured short-form video intelligence via hosted MCP.",
    subtitle:
      "Skip brittle scrapers and ad-hoc browser scripts. Connect any MCP-compatible assistant or custom agent directly to https://mcp.conthunt.app/mcp for TikTok, Instagram Reels, and YouTube Shorts discovery, saved boards, and structured video evidence.",
    answerFirst:
      "AI agent builders use ContHunt's hosted Model Context Protocol (MCP) server at https://mcp.conthunt.app/mcp to equip Claude, ChatGPT, Cursor, Codex, and custom autonomous workflows with structured short-form video research across TikTok, Instagram Reels, and YouTube Shorts. Instead of maintaining fragile scraping pipelines, teams connect one remote MCP endpoint to search videos, inspect transcripts and metrics, and query saved boards programmatically.",
    painPoints: [
      "Building and maintaining custom scrapers for TikTok, Instagram Reels, and YouTube Shorts breaks constantly whenever platform markup or rate limits shift.",
      "General web-search tools return blog summaries about viral trends instead of structured clip metrics, transcripts, and platform-specific evidence.",
      "Copy-pasting CSV exports and video links into LLM chat windows breaks automated research loops and introduces stale context.",
      "Teams building creative-ops or market-intelligence agents need consistent, normalized fields across all three major short-form video platforms.",
    ],
    workflowSteps: [
      {
        title: "Connect the hosted ContHunt MCP endpoint",
        detail:
          "Point your MCP client (Claude Desktop, Claude Code, Cursor, Codex, ChatGPT, or a custom MCP host) to https://mcp.conthunt.app/mcp following the step-by-step guide at https://conthunt.app/docs/integrations/mcp.",
      },
      {
        title: "Discover and filter clips across TikTok, Reels, and Shorts",
        detail:
          "Let your agent search niche keywords, inspect outlier performance, and retrieve structured metadata and video evidence without writing custom scraping glue.",
      },
      {
        title: "Read and analyze saved boards as durable agent memory",
        detail:
          "Use ContHunt boards as curated collections that human strategists and AI agents share—allowing agents to run repeatable pattern analyses on vetted clip sets.",
      },
      {
        title: "Compose downstream creative, reporting, or monitoring automations",
        detail:
          "Feed structured ContHunt outputs into creative brief generators, competitive trend memos, or Slack/Notion summaries with traceable source URLs and metrics.",
      },
    ],
    mcpAngle:
      "ContHunt is MCP-native rather than bolting on a limited read-only export: https://mcp.conthunt.app/mcp exposes cross-platform short-form discovery, saved boards, and structured video analysis directly inside the Model Context Protocol, included on paid plans starting at $25/mo. Read the integration guide at https://conthunt.app/docs/integrations/mcp.",
    faqs: [
      {
        question: "What is ContHunt's hosted MCP server URL?",
        answer:
          "The hosted remote MCP endpoint is https://mcp.conthunt.app/mcp, and full setup instructions for supported clients are published at https://conthunt.app/docs/integrations/mcp.",
      },
      {
        question: "Which AI clients and agent frameworks work with ContHunt MCP?",
        answer:
          "Any client that supports remote Model Context Protocol (MCP) servers—including Claude, Cursor, Codex, ChatGPT MCP connectors, and custom MCP-compliant agent harnesses—can connect to https://mcp.conthunt.app/mcp.",
      },
      {
        question: "Do I have to pay an enterprise add-on fee to access ContHunt MCP?",
        answer:
          "No. Hosted MCP access is included on paid ContHunt plans starting at $25/mo rather than locked behind a separate enterprise add-on.",
      },
      {
        question: "What platforms can my agent research through ContHunt MCP?",
        answer:
          "Agents connected to ContHunt MCP can research short-form video content across TikTok, Instagram Reels, and YouTube Shorts, alongside saved boards and structured video evidence.",
      },
    ],
  },
] as const;

export const GLOSSARY_TERMS: readonly GlossaryTermSpec[] = [
  {
    slug: "outlier-video",
    term: "Outlier Video",
    seoTitle: "What Is an Outlier Video? Formula & Examples | ContHunt",
    metaDescription:
      "Learn what an outlier video is on TikTok, Instagram Reels, and YouTube Shorts, how to calculate the outlier multiplier against median views, and why strategists track it.",
    shortDefinition:
      "An outlier video is a post whose views significantly exceed the posting account's typical baseline—most reliably measured as a multiple of that account's recent median views rather than its follower count.",
    deepDive:
      "Follower counts are noisy indicators of creative quality on modern interest-graph feeds. A 500,000-follower channel getting 40,000 views is underperforming its baseline, whereas a 4,000-follower account pulling 80,000 views has produced a strong outlier. Measuring outlier performance against an account's recent median views (instead of the mean, which a single viral spike can skew) isolates creative concepts, hooks, and topics that earned algorithmic reach on their own merit. Research teams study outlier videos across TikTok, Instagram Reels, and YouTube Shorts to find repeatable formats rather than copying celebrity creators whose reach depends on existing fame.",
    formula: "Outlier Multiplier = Video Views / Account Recent Median Views",
    benchmarkContext:
      "Creative teams commonly flag clips at 2x to 3x an account's recent median views as notable outperformers and 5x to 10x+ as breakout outliers. In ContHunt's November 2026 sample dataset (n = 500 sampled clips per platform, extracted 2026-11-23), sample median views were 2,818 on TikTok (90th percentile: 202,504), 3,068 on Instagram Reels (90th percentile: 78,858), and 998 on YouTube Shorts (90th percentile: 29,277), illustrating how sharply top-decile videos separate from typical medians.",
    example:
      "Illustrative example: Suppose a niche skincare creator's last 20 Reels have a median of 4,000 views, and a new clip comparing two cleanser textures reaches 36,000 views. Its outlier multiplier is 9.0x (36,000 / 4,000), marking the hook and comparison structure as a strong candidate to analyze and adapt.",
    faqs: [
      {
        question: "Why use median views instead of average views to identify outlier videos?",
        answer:
          "A single runaway viral post inflates an account's arithmetic average (mean), hiding strong 3x to 5x performers underneath it. Median views represent the true middle of the account's recent performance and keep the outlier multiplier honest.",
      },
      {
        question: "Does a high outlier multiplier guarantee a format will go viral for another account?",
        answer:
          "No single metric guarantees virality. Outlier multipliers show where algorithmic distribution spiked relative to an account's baseline, giving you a shortlist of high-signal hooks and topics to inspect for repeatable structure.",
      },
      {
        question: "How many recent posts should be included when calculating a median baseline?",
        answer:
          "Using the last 15 to 30 published clips (excluding pinned legacy posts) typically balances recency with enough sample size to smooth out day-to-day variance.",
      },
    ],
    relatedSlugs: ["virality-score", "view-velocity", "hook-rate", "content-intelligence"],
  },
  {
    slug: "hook-rate",
    term: "Hook Rate",
    seoTitle: "What Is Hook Rate (Thumbstop Rate)? | ContHunt Glossary",
    metaDescription:
      "Understand hook rate (thumbstop rate) on TikTok, Instagram Reels, and YouTube Shorts, how it is calculated, and how to improve your first three seconds.",
    shortDefinition:
      "Hook rate (often called thumbstop rate in paid social) is the percentage of viewers who stay past the opening three seconds of a video instead of scrolling away immediately.",
    deepDive:
      "Every short-form feed—TikTok's For You feed, Instagram Reels, and YouTube Shorts—forces a split-second decision at frame zero. Hook rate measures whether your combined visual motion, on-screen text, and opening spoken line earned the viewer's initial attention. Note that exact 3-second view counts are private creator or ad-account analytics (not publicly visible on other people's organic profiles), so teams diagnose hook strength externally by studying outlier openings and internally by tracking 3-second retention inside native analytics or ad managers.",
    formula: "Hook Rate (%) = (3-Second Video Views / Total Impressions or Initial Views) × 100",
    benchmarkContext:
      "Because platforms define impressions and initial view thresholds differently—and paid ads face colder audiences than organic followers—hook rate targets vary widely by channel, niche, and offer. Paid social buyers often treat roughly 25% to 35% as a healthy starting range on Meta/TikTok placements, while organic creator retention curves are best benchmarked against your own channel's rolling 30-day median rather than a single universal cutoff.",
    example:
      "Illustrative example: If a paid UGC Reels ad logs 10,000 impressions and 3,400 three-second plays, its hook rate is 34%. Swapping only the first two seconds—for example, moving the final product result to frame zero—lets you isolate whether the visual opener improved thumbstop performance.",
    faqs: [
      {
        question: "What is the difference between hook rate and 3-second retention?",
        answer:
          "In practice, the two terms measure the same early attention hurdle. 'Hook rate' or 'thumbstop rate' is most common in paid social reporting (3-second views divided by impressions), while '3-second retention' is typically read from organic creator retention graphs.",
      },
      {
        question: "Can you see a competitor's exact hook rate publicly?",
        answer:
          "No—3-second retention curves are private to the account owner. External research tools like ContHunt help you infer winning hooks by surfacing outlier videos, analyzing opening transcripts, and spotting repeatable visual patterns across high-performing clips.",
      },
      {
        question: "What improves hook rate fastest without reshooting an entire video?",
        answer:
          "Trimming throat-clearing intros ('Hey guys, today I want to talk about...'), adding a crisp visual pattern interrupt at frame zero, and pairing spoken tension with a concise 4-to-7-word on-screen headline usually move hook rate fastest.",
      },
    ],
    relatedSlugs: ["3-second-retention", "scroll-stopper", "watch-time-ratio", "outlier-video"],
  },
  {
    slug: "3-second-retention",
    term: "3-Second Retention",
    seoTitle: "What Is 3-Second Retention in Video? | ContHunt Glossary",
    metaDescription:
      "Learn how 3-second retention works in TikTok, Instagram Reels, and YouTube Shorts analytics, why early drop-off kills reach, and how to audit opening frames.",
    shortDefinition:
      "3-second retention is the percentage of viewers who are still watching a short-form video at the 3-second mark, shown as the first steep drop point on native audience retention graphs.",
    deepDive:
      "Audience retention graphs almost always drop sharpest during the first three seconds as uninterested scrollers flick to the next clip. A strong 3-second retention score signals to recommendation systems that the opening premise matched viewer curiosity, earning wider test batches in the feed. Crucially, 3-second retention must be paired with mid-video hold and completion: clickbait openings that spike 3-second retention but disappoint viewers by second eight usually stall out shortly after.",
    formula: "3-Second Retention (%) = (Viewers Remaining at 0:03 / Initial Viewers at 0:00) × 100",
    benchmarkContext:
      "Native retention curves are private to each creator's studio dashboard and vary significantly across TikTok, Reels, and YouTube Shorts (where YouTube Shorts also reports 'Viewed vs. Swiped Away'). The most actionable benchmark is your own account's historical top-quartile clips: compare any new upload's 0:03 mark against your top five performers in the same format.",
    example:
      "Illustrative example: Suppose a tutorial channel's usual clips retain 52% of viewers at 0:03 when opening with a static talking head, while clips that show the finished result on screen immediately retain 71% at 0:03. That 19-point lift gives the rest of the tutorial far more viewers to carry through to completion.",
    faqs: [
      {
        question: "Why does the retention graph always look steepest between 0 and 3 seconds?",
        answer:
          "Auto-playing vertical feeds register viewers the instant a clip enters the viewport. Many users swipe immediately while browsing, so the opening three seconds carry the heaviest filtering load of the entire video.",
      },
      {
        question: "Is 3-second retention more important than total watch time?",
        answer:
          "They work sequentially. Strong 3-second retention gets viewers past the gate, while pacing, story payoff, and watch-time ratio determine whether the video earns sustained algorithmic distribution.",
      },
      {
        question: "How does YouTube Shorts measure early retention?",
        answer:
          "YouTube Studio pairs the per-second retention curve with a 'Stayed to watch' vs. 'Swiped away' metric, giving Shorts creators a direct view of how effectively the opening seconds stopped the scroll.",
      },
    ],
    relatedSlugs: ["hook-rate", "scroll-stopper", "watch-time-ratio", "fyp-algorithm"],
  },
  {
    slug: "engagement-rate",
    term: "Engagement Rate",
    seoTitle: "Short-Form Engagement Rate Formula | ContHunt Glossary",
    metaDescription:
      "Calculate short-form video engagement rate by views across TikTok, Instagram Reels, and YouTube Shorts, and compare public like and comment ratios accurately.",
    shortDefinition:
      "Engagement rate by views measures the share of video viewers who take an active interaction—such as liking, commenting, saving, or sharing—expressed as a percentage of total views.",
    deepDive:
      "For short-form video, engagement rate by views is far more informative than engagement rate by followers because TikTok, Instagram Reels, and YouTube Shorts distribute clips primarily to non-followers. When benchmarking public profiles externally, be strict about which interactions are actually exposed on each platform: likes and comments are widely visible, whereas saves and shares may be hidden or partial depending on platform and endpoint. Never compare a formula that includes saves and shares against a likes-only number without stating the exact numerator.",
    formula: "Public Engagement Rate by Views (%) = ((Likes + Comments [+ Shares + Saves if public]) / Views) × 100",
    benchmarkContext:
      "Public interaction ratios differ noticeably by platform. In ContHunt's November 2026 sample dataset (n = 500 sampled clips per platform, extracted 2026-11-23), sample median like-to-view ratios were 4.85% on TikTok (p75: 7.92%), 5.20% on Instagram Reels (p75: 8.44%), and 1.77% on YouTube Shorts (p75: 3.13%), while sample median comment-to-view ratios were 0.09% on TikTok, 0.22% on Instagram Reels, and 0.10% on YouTube Shorts (n = 230 non-null). Treat these as sample reference points rather than universal platform averages.",
    example:
      "Illustrative example: A TikTok clip with 50,000 views, 3,200 likes, and 180 comments has a public like+comment engagement rate of 6.76% ((3,200 + 180) / 50,000 × 100), signaling above-median viewer resonance relative to typical passive views.",
    faqs: [
      {
        question: "Why divide engagement by views instead of followers on TikTok and Reels?",
        answer:
          "Because interest-graph feeds push videos far beyond an account's follower base. Dividing by followers produces distorted numbers (sometimes over 100%) on breakout posts and hides weak performance on large dormant accounts.",
      },
      {
        question: "Why are YouTube Shorts like-to-view ratios lower than TikTok and Instagram Reels?",
        answer:
          "YouTube Shorts users tend to watch more passively and interact less frequently with the like button compared to TikTok and Instagram double-tap habits, which is why cross-platform audits should benchmark each feed against its own platform norms.",
      },
      {
        question: "Does a high engagement rate always lead to high views?",
        answer:
          "Not always. Niche communities can engage enthusiastically on a small reach pool without broad algorithmic expansion, while mass-appeal entertainment clips can pull huge views with lower comment ratios.",
      },
    ],
    relatedSlugs: ["save-rate", "share-rate", "outlier-video", "virality-score"],
  },
  {
    slug: "virality-score",
    term: "Virality Score",
    seoTitle: "What Is a Virality Score? Formula & Guide | ContHunt",
    metaDescription:
      "Learn how virality scores combine outlier view multiples, engagement ratios, and view velocity to rank breakout short-form videos—and what to check behind the score.",
    shortDefinition:
      "A virality score is a composite ranking metric that summarizes how unusually well a video is performing by combining relative view lift (outlier multiple), interaction ratios, and—when time-series data exists—view velocity.",
    deepDive:
      "Every analytics tool defines its own proprietary virality score weighting, so smart strategists treat a composite score as a sorting shortcut rather than black-box truth. The strongest scoring frameworks normalize raw views against the creator's baseline (so smaller accounts can surface alongside massive channels), incorporate public engagement depth (likes, comments, shares, saves when available), and account for clip age so a fast-climbing 12-hour post can outrank a stagnant 6-month-old clip. Whenever you inspect a virality score, verify the underlying components: median baseline, view count, interaction rate, and publish date.",
    formula: "Composite Index = f(Outlier View Multiplier, Engagement Ratios, View Velocity / Recency)",
    benchmarkContext:
      "Because there is no single industry-standard formula for a virality score, scores are only comparable within the same tool and snapshot window. Pairing a composite score with transparent raw metrics—like the outlier view multiple against platform or account medians—keeps creative research auditable.",
    example:
      "Illustrative example: Two clips in the same niche both sit at 45,000 views. Clip A came from an account averaging 40,000 views with 2% likes; Clip B came from an account with a 3,000-view median, posted 18 hours ago, with 9% likes and strong comment volume. A well-designed virality score ranks Clip B substantially higher because its relative lift, velocity, and engagement all outperform.",
    faqs: [
      {
        question: "Are virality scores standardized across different SEO and social tools?",
        answer:
          "No. Each platform chooses its own weights and normalization scale (0–100, 1–10, or multiplier tiers). Always inspect the underlying views, account median, and engagement rates alongside any composite score.",
      },
      {
        question: "Can a small-view video get a high virality score?",
        answer:
          "Yes, if the score weights outlier multiplier or engagement rate heavily on a tiny baseline (for example, 5,000 views on a 200-view account). Setting a minimum view floor prevents tiny samples from crowding out genuinely proven formats.",
      },
      {
        question: "How does ContHunt approach virality benchmarking?",
        answer:
          "ContHunt surfaces transparent underlying signals—views, likes, comments, engagement ratios, and outlier multiples against platform baselines—so teams see exactly why a clip stands out.",
      },
    ],
    relatedSlugs: ["outlier-video", "view-velocity", "engagement-rate", "content-intelligence"],
  },
  {
    slug: "mcp-content-research",
    term: "MCP Content Research",
    seoTitle: "What Is MCP Content Research? | ContHunt Glossary",
    metaDescription:
      "Learn how Model Context Protocol (MCP) content research lets AI assistants like Claude, ChatGPT, and Cursor query real short-form video data, boards, and transcripts directly.",
    shortDefinition:
      "MCP content research is the workflow of connecting an AI assistant or autonomous agent to a live content-intelligence tool via the Model Context Protocol (MCP) so the model researches real video metrics, boards, and transcripts directly instead of relying on stale training data or manual CSV uploads.",
    deepDive:
      "Historically, teams using LLMs for creative strategy had to export spreadsheets, copy transcripts by hand, and paste links into chat prompts—breaking context every time the data changed. With the Model Context Protocol (MCP), an AI host such as Claude, ChatGPT, Cursor, or Codex connects to a remote MCP server over a standardized tool interface. For short-form video teams, connecting ContHunt's hosted MCP server (https://mcp.conthunt.app/mcp) turns an AI assistant into an evidence-grounded creative analyst capable of discovering TikTok, Instagram Reels, and YouTube Shorts clips, inspecting saved boards, and synthesizing real hook patterns with clickable source links.",
    benchmarkContext:
      "MCP adoption accelerated rapidly across developer and marketing stacks in 2025–2026 because it replaces brittle custom API glue with one interoperable protocol. When evaluating an MCP content research setup, look for structured outputs (real URLs, timestamps, platform identifiers, and metrics), durable workspace objects like saved boards, and transparent pricing rather than enterprise-only lock-in.",
    example:
      "Illustrative example: A strategist opens Claude connected to https://mcp.conthunt.app/mcp and prompts: 'Inspect my skincare client's saved board, group the top-performing Reels by opening hook type, and draft five new script angles citing the exact source clips.' The assistant queries real board data directly and returns traceable recommendations.",
    faqs: [
      {
        question: "What does MCP stand for in content research?",
        answer:
          "MCP stands for Model Context Protocol, an open protocol that lets AI assistants and coding agents securely invoke external tools and data sources through a standardized interface.",
      },
      {
        question: "How is MCP content research different from asking ChatGPT to search the web?",
        answer:
          "General web search mostly retrieves articles and web snippets, rarely exposing structured TikTok, Reels, and YouTube Shorts metrics, transcripts, or curated team boards. An MCP content server gives the assistant purpose-built discovery and analysis tools.",
      },
      {
        question: "Where can I find ContHunt's MCP setup instructions?",
        answer:
          "ContHunt's hosted MCP endpoint is https://mcp.conthunt.app/mcp, with step-by-step client configuration docs at https://conthunt.app/docs/integrations/mcp.",
      },
    ],
    relatedSlugs: ["content-intelligence", "outlier-video", "hook-rate", "fyp-algorithm"],
  },
  {
    slug: "ugc-whitelisting",
    term: "UGC Whitelisting",
    seoTitle: "What Is UGC Whitelisting (Spark Ads)? | ContHunt",
    metaDescription:
      "Understand UGC whitelisting—running paid social ads through a creator's handle via Meta Partnership Ads or TikTok Spark Ads—plus licensing and creative research best practices.",
    shortDefinition:
      "UGC whitelisting (also known as creator licensing, Meta Partnership Ads, or TikTok Spark Ads) is the paid-social practice where a brand runs ads through a creator's own social handle rather than solely from the brand's official account.",
    deepDive:
      "Running creative from a real person's handle preserves native social proof—viewer comments, authentic creator identity, and organic feed styling—which often lowers buyer skepticism compared to obvious brand banners. On TikTok this workflow runs through Spark Ads using a creator-generated authorization code; on Instagram and Facebook it runs through Meta Partnership Ads permissions. Effective whitelisting starts before contracts are signed: brands research which organic creator formats and hooks already earn native engagement in their niche, then negotiate clear usage windows, ad-spend rights, and landing-page testing permissions upfront.",
    benchmarkContext:
      "Whitelisting performance depends heavily on creative-audience fit, creator credibility, and offer economics rather than the handle swap alone. Agencies typically separate creator production fees from monthly whitelisting/usage licensing fees (commonly structured in 30-, 60-, or 90-day windows) and refresh opening hooks before creative fatigue drives up CPA.",
    example:
      "Illustrative example: A DTC coffee brand spots a creator whose organic Reels recipe clip outperformed their baseline by 6x. With written usage rights and Partnership Ads access, the brand tests three 3-second hook variations of a new product demo running through the creator's handle while linking directly to a dedicated starter-kit landing page.",
    faqs: [
      {
        question: "What is the difference between UGC whitelisting and dark posting?",
        answer:
          "Whitelisting is the broader permission to run ads through a creator's handle. 'Dark posting' refers to running an ad variant from that handle that does not appear on the creator's public organic profile grid (whereas boosting an existing organic post keeps it visible on their feed).",
      },
      {
        question: "Do brands need written permission to whitelist a creator's video?",
        answer:
          "Yes—both platform authorization (such as a TikTok Spark Ads code or Meta Partnership Ads permission) and a clear written agreement specifying duration, paid channels, exclusivity, and compensation.",
      },
      {
        question: "How does organic content research help UGC whitelisting?",
        answer:
          "Analyzing organic outlier clips across TikTok and Instagram Reels shows which creators naturally hold attention in your niche and which hook structures feel native—reducing wasted spend on stiff, overly scripted ads.",
      },
    ],
    relatedSlugs: ["hook-rate", "scroll-stopper", "outlier-video", "content-intelligence"],
  },
  {
    slug: "watch-time-ratio",
    term: "Watch Time Ratio",
    seoTitle: "What Is Watch Time Ratio (APV)? | ContHunt Glossary",
    metaDescription:
      "Learn how watch time ratio (average percentage viewed) drives TikTok, Instagram Reels, and YouTube Shorts distribution, including how loops push ratios above 100%.",
    shortDefinition:
      "Watch time ratio (also called average percentage viewed) is the average watch duration of a video divided by its total length, showing how much of the clip viewers consume—including replays above 100%.",
    deepDive:
      "Short-form recommendation algorithms evaluate both absolute seconds watched and the proportion of the video completed. A 15-second clip with an average watch time of 18 seconds reaches a 120% watch time ratio because viewers rewatched part of the loop or let it replay while reading captions or comments. Conversely, a 60-second clip with 35 seconds of average watch time sits at 58%—still strong in raw seconds, though tighter editing might lift both completion and distribution. Pairing watch time ratio with 3-second retention separates hook problems (early exit) from pacing problems (mid-video sag).",
    formula: "Watch Time Ratio (%) = (Average Watch Duration / Total Video Length) × 100",
    benchmarkContext:
      "Target watch time ratio scales inversely with video length: ultra-short 7-to-15-second clips often need near or above 100% ratios (replays) to break out widely, whereas 45-to-90-second educational or storytelling clips can earn massive distribution at lower percentages because they deliver high absolute seconds watched. Always compare clips within similar duration bands.",
    example:
      "Illustrative example: A 24-second product comparison clip averages 26.4 seconds of watch time because viewers rewatch the final side-by-side summary table. Its watch time ratio is 110% (26.4 / 24 × 100).",
    faqs: [
      {
        question: "How can a video have a watch time ratio over 100%?",
        answer:
          "When viewers replay the clip—whether intentionally to catch a fast visual detail, seamlessly through an end-to-start audio loop, or while reading the caption and comment section—total average watch time exceeds the clip's duration.",
      },
      {
        question: "Should creators make every video shorter just to raise watch time ratio?",
        answer:
          "Not blindly. Platforms weigh total watch time alongside percentage viewed. Cutting dead air always helps, but shrinking a valuable 45-second story into a rushed 10-second clip can reduce overall satisfaction and shares.",
      },
      {
        question: "Is watch time ratio visible on competitors' public profiles?",
        answer:
          "No, exact watch time metrics are private creator analytics. Strategists infer high-retention structures externally by examining outlier clips, pacing cuts, transcript tightness, and replay-friendly visual density.",
      },
    ],
    relatedSlugs: ["3-second-retention", "fyp-algorithm", "hook-rate", "faceless-shorts"],
  },
  {
    slug: "view-velocity",
    term: "View Velocity",
    seoTitle: "What Is View Velocity in Video? | ContHunt Glossary",
    metaDescription:
      "Understand view velocity (views per hour or day), why early momentum signals active algorithmic expansion, and how teams spot rising trends before saturation.",
    shortDefinition:
      "View velocity is the rate at which a video accumulates views over a defined time interval—such as views per hour in the first 24 hours or views per day—used to spot active algorithmic acceleration.",
    deepDive:
      "Cumulative view counts tell you what worked in the past; view velocity tells you what is accelerating right now. A six-month-old clip with 400,000 views may be completely dormant, whereas a 14-hour-old clip climbing at 8,000 views per hour is actively passing algorithmic test pools. Tracking velocity helps brands and creators catch emerging formats, sounds, and niche angles while the window to participate is still open—rather than copying a trend weeks after audiences have moved on.",
    formula: "View Velocity = Views Gained During Window / Elapsed Hours (or Days)",
    benchmarkContext:
      "Velocity should always be interpreted relative to clip age and account size. Most short-form clips see their steepest hourly velocity within the first 24 to 72 hours, though YouTube Shorts and search-indexed TikTok tutorials can experience delayed 'second-wave' velocity weeks after publishing.",
    example:
      "Illustrative example: Two competitor Shorts both sit at 60,000 total views. Video A was posted 90 days ago (~667 views/day average), while Video B was posted 12 hours ago (5,000 views/hour). Video B's high velocity signals active demand worth inspecting immediately.",
    faqs: [
      {
        question: "Can a video gain view velocity weeks after it was posted?",
        answer:
          "Yes. Both YouTube Shorts and TikTok occasionally re-test older clips when a topic surges in search or interest graphs, producing a sudden delayed velocity spike.",
      },
      {
        question: "Why is snapshot freshness important when comparing view velocity?",
        answer:
          "True velocity requires measuring view changes across timestamps or comparing total views against exact publish age. Static single-point snapshots show views-per-age rather than instantaneous hourly acceleration.",
      },
      {
        question: "How does view velocity complement outlier multiplier?",
        answer:
          "Outlier multiplier identifies clips that beat an account's baseline; view velocity tells you which of those outliers are actively surging right now.",
      },
    ],
    relatedSlugs: ["outlier-video", "virality-score", "fyp-algorithm", "content-intelligence"],
  },
  {
    slug: "save-rate",
    term: "Save Rate",
    seoTitle: "What Is Save Rate on TikTok & Reels? | ContHunt",
    metaDescription:
      "Learn what save rate measures in short-form video, why tutorials and frameworks drive bookmarks, and how to use save rate alongside shares and comments.",
    shortDefinition:
      "Save rate (or bookmark rate) is the percentage of video viewers who bookmark a clip to revisit later, serving as a strong signal of reference utility and educational value.",
    deepDive:
      "While likes are low-friction reflexes, tapping Save signals intent to return—typically triggered by recipes, tool stacks, checklists, workout routines, design tutorials, or concise frameworks viewers cannot memorize in one pass. On Instagram Reels and TikTok, high saves indicate high content utility, though save counts are not always exposed publicly on every platform or API (for instance, Instagram saves are visible only in native Insights for the account owner). Internally, tracking save rate tells educational brands and SaaS channels which topics solve tangible problems worth expanding into deeper series or lead magnets.",
    formula: "Save Rate (%) = (Total Saves / Total Views) × 100",
    benchmarkContext:
      "Save rate varies dramatically by content category: pure comedy and entertainment clips earn far more shares than saves, whereas how-to checklists, templates, and product comparisons drive much higher save rates. Benchmark your clips by content pillar inside native creator analytics rather than expecting entertainment and tutorial posts to share the same save target.",
    example:
      "Illustrative example: A B2B creator posts a 35-second Excel shortcut breakdown that earns 20,000 views and 740 bookmarks in native analytics—a 3.7% save rate—indicating strong reference value and a clear signal to film a multi-part shortcut series.",
    faqs: [
      {
        question: "Are save counts publicly visible on Instagram Reels and YouTube Shorts?",
        answer:
          "Instagram Reels keeps save counts private to the posting account's Insights dashboard, and YouTube Shorts relies on playlists/Watch Later rather than a public save counter. TikTok exposes bookmark counts more frequently on public videos, though availability can vary.",
      },
      {
        question: "What types of hooks and formats increase save rate?",
        answer:
          "Dense, scannable value—step-by-step checklists, side-by-side comparison tables, prompt templates, recipes, and resource lists—naturally earns bookmarks because viewers want to reference the details later.",
      },
      {
        question: "Should I explicitly ask viewers to save the video?",
        answer:
          "A brief, natural cue ('save this for your next shoot') works well when the clip genuinely contains reference steps; asking for saves on thin content rarely moves the needle.",
      },
    ],
    relatedSlugs: ["share-rate", "engagement-rate", "watch-time-ratio", "fyp-algorithm"],
  },
  {
    slug: "share-rate",
    term: "Share Rate",
    seoTitle: "What Is Share Rate in Short-Form Video? | ContHunt Glossary",
    metaDescription:
      "Learn how share rate (sends per view) drives organic distribution on Instagram Reels, TikTok, and YouTube Shorts, and what triggers viewers to send clips to friends.",
    shortDefinition:
      "Share rate is the percentage of viewers who send a short-form video to someone else via DMs, messaging apps, reposts, or copied links—one of the strongest signals of social resonance.",
    deepDive:
      "When a viewer shares a clip in a direct message or group chat, they put their own social credibility behind it and bring a brand-new viewer directly back onto the platform. Instagram leadership has publicly highlighted 'sends per reach' as a major ranking signal for reaching unconnected audiences on Reels, and TikTok and YouTube Shorts similarly reward clips that spark off-feed sharing. High-share content usually taps into relatable identity ('this is literally us'), surprising discoveries worth warning a friend about, or concise explanations that settle a common debate.",
    formula: "Share Rate (%) = (Total Shares / Total Views) × 100",
    benchmarkContext:
      "Share rate is heavily format-dependent: relatable humor, sharp industry takes, giftable product discoveries, and urgent 'did you know' tips typically generate much higher share rates than solo vlogs. Compare share rate inside your native studio analytics across formats to spot which angles travel organically through DMs.",
    example:
      "Illustrative example: A productivity creator publishes a 22-second clip showing a common calendar mistake teams make in standups. Out of 30,000 views, 690 viewers send it to coworkers—a 2.3% share rate—propelling fresh non-follower reach beyond the creator's usual audience.",
    faqs: [
      {
        question: "Why do platforms weight shares so heavily for non-follower reach?",
        answer:
          "A DM share brings another person into the app and validates that the clip is compelling enough to recommend socially—a stronger endorsement than a passive scroll-by like.",
      },
      {
        question: "What is the difference between high-save content and high-share content?",
        answer:
          "High-save content is useful to the individual later (tutorials, checklists, recipes). High-share content expresses identity, humor, strong opinions, or timely discoveries that viewers want to pass along to a specific friend or teammate.",
      },
      {
        question: "Can external tools see private DM share counts on Instagram Reels?",
        answer:
          "Instagram does not consistently expose exact share counts publicly across all surfaces; account owners see full 'Sends' data inside Instagram Insights, while public audits combine visible views, likes, comments, and outlier multiples.",
      },
    ],
    relatedSlugs: ["save-rate", "engagement-rate", "fyp-algorithm", "virality-score"],
  },
  {
    slug: "fyp-algorithm",
    term: "FYP Algorithm",
    seoTitle: "How the FYP Algorithm Works | ContHunt Glossary",
    metaDescription:
      "Understand how interest-graph For You Page (FYP) recommendation systems test, score, and expand short-form videos across TikTok, Instagram Reels, and YouTube Shorts.",
    shortDefinition:
      "The FYP (For You Page) algorithm is an interest-graph recommendation system—pioneered at scale by TikTok and echoed by Instagram Reels and YouTube Shorts—that distributes videos to non-followers based on viewer behavior signals rather than follower count alone.",
    deepDive:
      "Unlike legacy social feeds built mainly around who you follow, short-form FYP algorithms evaluate each uploaded clip largely on its own viewer satisfaction signals. Newly published clips are shown to initial test audiences matched by topic cues (spoken audio, captions, visual frames, hashtags, and past account viewers). If viewers stop scrolling (3-second retention), watch a high share of the clip (watch time ratio), replay, or interact meaningfully (shares, saves, comments, likes), the recommendation system expands distribution into progressively broader audience cohorts. That interest-graph mechanic is why small accounts can produce massive outlier videos whenever a hook and topic resonate.",
    benchmarkContext:
      "None of the major platforms publish exact ranking weights, and all three tune their models continuously. However, public platform documentation consistently points to the same core pillars: viewer retention/watch time, active interactions (shares, saves, comments, likes), topic relevance from audio/text/visuals, and absence of negative feedback ('Not Interested' or immediate swipes).",
    example:
      "Illustrative example: A brand-new home-espresso account with 350 followers posts a tight 28-second dial-in fix. Because coffee enthusiasts finish the clip at high rates and share it with friends, the FYP algorithm expands distribution far past the 350 followers into broader specialty-coffee interest clusters.",
    faqs: [
      {
        question: "Does follower count still matter under an FYP algorithm?",
        answer:
          "Follower count helps provide an initial warm audience and brand credibility, but it no longer guarantees views—and a small follower count no longer blocks breakout reach when a video earns strong retention and engagement.",
      },
      {
        question: "Do TikTok, Instagram Reels, and YouTube Shorts use the exact same algorithm?",
        answer:
          "No—each platform has its own ranking model, audience habits, and search integration. Still, all three rely heavily on interest-graph matching, early retention, watch duration, and meaningful viewer interactions.",
      },
      {
        question: "Do hashtags alone force the FYP algorithm to push a video?",
        answer:
          "No. Hashtags help provide initial topic classification alongside spoken words, on-screen text, and visual signals, but sustained distribution depends on how real viewers respond once the clip is tested in the feed.",
      },
    ],
    relatedSlugs: ["outlier-video", "3-second-retention", "watch-time-ratio", "share-rate"],
  },
  {
    slug: "scroll-stopper",
    term: "Scroll-Stopper",
    seoTitle: "What Is a Scroll-Stopper in Video? | ContHunt Glossary",
    metaDescription:
      "Learn what makes an effective visual and verbal scroll-stopper in the first 1–3 seconds of TikTok, Instagram Reels, and YouTube Shorts clips.",
    shortDefinition:
      "A scroll-stopper is a deliberate visual, verbal, or on-screen text pattern interrupt deployed in the first 1 to 3 seconds of a short-form video to halt passive thumb-scrolling and earn immediate attention.",
    deepDive:
      "Viewers swipe through vertical feeds in under a second when an opening frame looks predictable—such as a motionless talking head adjusting the camera or a slow logo intro. Effective scroll-stoppers layer three cues simultaneously: visual motion or an unusual prop in frame zero, a crisp 4-to-7-word on-screen headline that works even with sound off, and an opening spoken line that introduces tension, proof, or a clear stake immediately. The strongest scroll-stoppers stay tightly connected to the video's actual payoff so viewers feel rewarded rather than tricked.",
    benchmarkContext:
      "You measure a scroll-stopper's impact directly in 3-second retention (organic) and hook rate / thumbstop rate (paid). Testing two or three distinct visual openers on the exact same body script is one of the highest-leverage creative experiments available to agencies and brands.",
    example:
      "Illustrative example: Instead of opening a stain-remover demo by holding the bottle and saying 'Hi everyone, let me show you our new spray,' a scroll-stopper starts mid-action pouring espresso onto a white sneaker with the caption 'Testing this $14 spray on fresh espresso.'",
    faqs: [
      {
        question: "Does a scroll-stopper have to be loud or gimmicky?",
        answer:
          "Not at all. Quiet, ultra-specific visual proof—like showing a broken spreadsheet snapping into a clean dashboard or zooming into a surprising physical detail—often outperforms forced shouting or gimmicks.",
      },
      {
        question: "Why should scroll-stoppers work with sound off?",
        answer:
          "Many users browse Reels and Shorts muted or in noisy environments. Combining clear visual action with concise on-screen text ensures the hook lands even before audio registers.",
      },
      {
        question: "Where can I study real scroll-stopper examples by niche?",
        answer:
          "You can browse curated public hook snapshots on ContHunt's Viral Hooks hub (/data/viral-hooks) or test reusable templates in the free hook generator before running deeper niche research inside https://agent.conthunt.app.",
      },
    ],
    relatedSlugs: ["hook-rate", "3-second-retention", "ugc-whitelisting", "outlier-video"],
  },
  {
    slug: "faceless-shorts",
    term: "Faceless Shorts",
    seoTitle: "What Are Faceless Shorts? Formats & Guide | ContHunt",
    metaDescription:
      "Understand faceless short-form video channels across YouTube Shorts, TikTok, and Instagram Reels—common formats, retention mechanics, and how operators research topics.",
    shortDefinition:
      "Faceless shorts are vertical videos published on YouTube Shorts, TikTok, or Instagram Reels that tell stories, explain concepts, or demonstrate products without an on-camera presenter's face.",
    deepDive:
      "Faceless channels rely on tight voiceover narration, dynamic B-roll, screen recordings, archival visuals, motion graphics, or hands-only demonstrations paired with synchronized captions. Because there is no on-camera personality anchoring viewer loyalty, faceless shorts live or die by topic selection, curiosity-gap hooks, visual pacing (frequent scene refreshes that maintain attention), and crisp narrative payoff. Operators frequently publish the same core format across YouTube Shorts, TikTok, and Instagram Reels while tailoring length and captions to each feed.",
    benchmarkContext:
      "Competition in broad faceless niches (such as generic motivational quotes or recycled trivia) is intense, whereas specific visual-proof formats—software workflows, engineering explainers, niche history, data animations, and hands-only product teardowns—tend to build far stronger differentiation and retention.",
    example:
      "Illustrative example: A hands-only desk-setup and software-workflow channel publishes 35-second vertical clips pairing tight over-the-shoulder keyboard shots, animated callouts, and concise voiceover—never showing the creator's face while still building a recognizable visual signature.",
    faqs: [
      {
        question: "Can faceless channels still grow on YouTube Shorts, TikTok, and Reels?",
        answer:
          "Yes, provided the channel delivers original scripting, clear visual storytelling, and real topic value rather than low-effort scraped reuploads that platforms de-prioritize or demonetize.",
      },
      {
        question: "What matters most for retention in faceless shorts?",
        answer:
          "An immediate premise in the first sentence, clean pacing with visual progression every few seconds, readable captions placed safely inside platform UI margins, and a payoff that resolves the opening tension.",
      },
      {
        question: "How do faceless channel operators choose topics?",
        answer:
          "Experienced operators research outlier videos across YouTube Shorts, TikTok, and Instagram Reels to validate which angles beat channel baselines before investing time in scriptwriting and editing.",
      },
    ],
    relatedSlugs: ["watch-time-ratio", "outlier-video", "scroll-stopper", "content-intelligence"],
  },
  {
    slug: "content-intelligence",
    term: "Content Intelligence",
    seoTitle: "What Is Content Intelligence? | ContHunt Glossary",
    metaDescription:
      "Learn what content intelligence means for TikTok, Instagram Reels, and YouTube Shorts teams—combining cross-platform discovery, outlier analytics, hook analysis, and MCP workflows.",
    shortDefinition:
      "Content intelligence is the systematic practice of collecting, benchmarking, and analyzing real short-form video performance—outlier reach, hook structures, transcripts, and engagement patterns—to guide what a team scripts and films next.",
    deepDive:
      "Traditional social media analytics look backward at your own past posts, telling you what already happened on your own account. Content intelligence looks outward across your entire category on TikTok, Instagram Reels, and YouTube Shorts to reveal which creative angles, visual openings, and narrative structures are outperforming baselines right now. Modern content intelligence combines four layers: cross-platform discovery, baseline-normalized outlier detection, qualitative breakdown (hooks, transcripts, pacing), and workflow integration—including connecting directly to AI assistants via MCP so research flows seamlessly into creative briefs.",
    benchmarkContext:
      "Teams adopting structured content intelligence move from reactive trend-chasing to repeatable pre-production sprints: validating angles against observed category performance before allocating creator budgets, studio days, or paid media spend.",
    example:
      "Illustrative example: Instead of brainstorming 15 random Reels ideas in a Monday meeting, a brand's growth lead audits 30 category outliers across TikTok, Reels, and Shorts in ContHunt, tags the three recurring objection-handling hooks onto a shared board, and briefs creators directly from verified examples.",
    faqs: [
      {
        question: "How is content intelligence different from social listening?",
        answer:
          "Social listening focuses on brand mentions, sentiment tracking, and PR alerts across text and social feeds. Content intelligence focuses specifically on creative mechanics—which video topics, hooks, transcripts, and formats earn outsized reach and engagement.",
      },
      {
        question: "Why do teams need cross-platform content intelligence instead of single-platform tools?",
        answer:
          "Winning hooks and formats constantly migrate between TikTok, Instagram Reels, and YouTube Shorts. Monitoring all three in one place exposes cross-platform gaps early and prevents siloed swipe files.",
      },
      {
        question: "How does ContHunt deliver content intelligence?",
        answer:
          "ContHunt (https://conthunt.app, app at https://agent.conthunt.app) combines TikTok, Instagram Reels, and YouTube Shorts discovery, saved boards, video evidence, and a hosted MCP server (https://mcp.conthunt.app/mcp) starting at $25/mo.",
      },
    ],
    relatedSlugs: ["outlier-video", "mcp-content-research", "virality-score", "hook-rate"],
  },
] as const;

export const USE_CASES_HUB: HubPageCopy = {
  path: "/use-cases",
  seoTitle: "Short-Form Video Intelligence Use Cases | ContHunt",
  metaDescription:
    "See how UGC agencies, ecommerce brands, SaaS growth teams, faceless channels, short-form creators, and AI agent builders use ContHunt across TikTok, Reels, and Shorts.",
  eyebrow: "Use Cases",
  h1: "Built for teams that turn short-form video research into output.",
  subtitle:
    "Whether you brief UGC creators, run DTC creative sprints, grow a SaaS channel, produce faceless Shorts, or wire MCP tools into AI agents, ContHunt gives your workflow structured evidence across TikTok, Instagram Reels, and YouTube Shorts.",
  answerFirst:
    "ContHunt adapts to six core short-form video workflows—UGC agencies, ecommerce brands, SaaS growth teams, faceless channels, solo creators, and AI agent builders—by combining cross-platform discovery (TikTok, Instagram Reels, and YouTube Shorts), outlier benchmarking, saved boards, and hosted MCP access (https://mcp.conthunt.app/mcp) starting at $25/mo.",
  highlights: [
    "Cross-platform discovery across TikTok, Instagram Reels, and YouTube Shorts in one workspace",
    "Baseline-aware outlier research and saved boards organized by client, SKU, or format",
    "Hosted MCP server (https://mcp.conthunt.app/mcp) included on paid plans for AI-native briefing workflows",
  ],
  ctaLabel: "Open ContHunt",
  ctaHref: "https://agent.conthunt.app",
  faqs: [
    {
      question: "Do all use cases require separate ContHunt products?",
      answer:
        "No. Every workflow runs on the same core ContHunt workspace (https://agent.conthunt.app) and hosted MCP endpoint (https://mcp.conthunt.app/mcp), with paid plans starting at $25/mo.",
    },
    {
      question: "Which platforms are included across every use case?",
      answer:
        "TikTok, Instagram Reels, and YouTube Shorts are supported across discovery, saved boards, and MCP workflows.",
    },
  ],
};

export const GLOSSARY_HUB: HubPageCopy = {
  path: "/glossary",
  seoTitle: "Short-Form Video & Social Analytics Glossary | ContHunt",
  metaDescription:
    "Clear definitions, formulas, and practical context for 15 core short-form video terms—outlier video, hook rate, 3-second retention, watch time ratio, MCP content research, and more.",
  eyebrow: "Glossary",
  h1: "Short-form video & content intelligence glossary.",
  subtitle:
    "Plain-English definitions, exact formulas, and grounded context for the metrics and workflows behind TikTok, Instagram Reels, and YouTube Shorts growth.",
  answerFirst:
    "This glossary defines 15 essential short-form video analytics and creative-strategy concepts—from outlier videos, hook rate, and 3-second retention to UGC whitelisting and MCP content research—with transparent formulas, clearly labeled illustrative examples, and verified platform context.",
  highlights: [
    "15 foundational short-form video analytics and creative-strategy terms",
    "Explicit formulas separating public profile metrics from private creator analytics",
    "Grounded benchmark context referencing ContHunt's November 2026 sampled dataset where applicable",
  ],
  ctaLabel: "Explore ContHunt Data Hub",
  ctaHref: "/data",
  faqs: [
    {
      question: "Are the benchmark numbers in this glossary universal platform averages?",
      answer:
        "No. Where numeric sample medians are cited (such as public like-to-view or view percentiles), they are explicitly labeled as figures from ContHunt's November 2026 500-clip-per-platform sample dataset (extracted 2026-11-23), not official platform-wide averages.",
    },
    {
      question: "Why does the glossary distinguish public metrics from private analytics?",
      answer:
        "Metrics like views, likes, and comments are publicly inspectable for competitive research, whereas 3-second retention curves, watch time ratios, and Instagram saves live inside private creator or ad accounts. Keeping that boundary explicit prevents misleading audits.",
    },
  ],
};

export const HUB_COPY: GrowthHubCopyMap = {
  dataHub: {
    path: "/data",
    seoTitle: "Short-Form Video Data Hub: Hooks & Hashtags | ContHunt",
    metaDescription:
      "Explore ContHunt's public short-form video data hub: sampled viral hooks, recurring hashtags, curated boards, featured creators, and the 2026 Virality Index across TikTok, Reels, and Shorts.",
    eyebrow: "Public Data Hub",
    h1: "Public short-form video data across TikTok, Reels, and YouTube Shorts.",
    subtitle:
      "Browse ContHunt's bundled public datasets—breakout hooks, recurring hashtag clusters, curated niche boards, creator snapshots, and cross-platform benchmarks—before running custom searches in the full workspace.",
    answerFirst:
      "ContHunt's public Data Hub aggregates structured short-form video datasets from our bundled Viral Now snapshots and November 2026 platform benchmark sample across TikTok, Instagram Reels, and YouTube Shorts. Use these pages to inspect real hook openings, recurring niche hashtags, and median platform baselines without logging in.",
    highlights: [
      "Viral Hooks database (/data/viral-hooks) with platform, niche, views, and public engagement ratios",
      "Trending Hashtags explorer (/data/trending-hashtags) ranked by snapshot frequency and median views",
      "Virality Index (/viral-index) comparing breakout snapshots against November 2026 sample baselines",
      "Curated niche Boards (/boards) and public Creator snapshots (/creators)",
    ],
    methodologyNote:
      "Public Data Hub pages are powered by ContHunt's bundled Viral Now snapshots and our November 2026 platform benchmark sample (500 sampled clips per platform, extracted 2026-11-23)—not an unfiltered live platform firehose. Each view displays its snapshot date transparently. For fresh on-demand niche queries, open https://agent.conthunt.app or connect https://mcp.conthunt.app/mcp.",
    ctaLabel: "Run Live Discovery in ContHunt",
    ctaHref: "https://agent.conthunt.app",
    faqs: [
      {
        question: "Is the ContHunt Data Hub free to browse?",
        answer:
          "Yes. Every public dataset under /data, /boards, /creators, and /viral-index is free to inspect with no signup required.",
      },
      {
        question: "How fresh is the data in the public Data Hub?",
        answer:
          "Public hub views read from ContHunt's bundled Viral Now snapshot and dated benchmark dataset rather than streaming every upload in real time. Each page displays its snapshot date, and live custom discovery is available inside https://agent.conthunt.app.",
      },
      {
        question: "Can AI agents query live ContHunt data programmatically?",
        answer:
          "Yes. Paid ContHunt plans (starting at $25/mo) include access to the hosted MCP server at https://mcp.conthunt.app/mcp, documented at https://conthunt.app/docs/integrations/mcp.",
      },
    ],
  },
  viralHooks: {
    path: "/data/viral-hooks",
    seoTitle: "Viral Hooks Database: TikTok, Reels & Shorts | ContHunt",
    metaDescription:
      "Browse real short-form video hooks from ContHunt's public Viral Now snapshot across TikTok, Instagram Reels, and YouTube Shorts—filter by platform and niche.",
    eyebrow: "Data Hub · Viral Hooks",
    h1: "Real short-form hooks that earned breakout attention.",
    subtitle:
      "Filter curated outlier clips across TikTok, Instagram Reels, and YouTube Shorts by niche and platform to study opening hooks alongside visible views, likes, comments, and public engagement ratios.",
    answerFirst:
      "ContHunt's Viral Hooks database catalogs opening hooks and clip metrics from our bundled public Viral Now snapshot across TikTok, Instagram Reels, and YouTube Shorts. Instead of abstract copywriting advice, strategists and creators can inspect real clip titles, extracted hook angles, and public engagement rates side by side.",
    highlights: [
      "Filter real short-form entries by platform (TikTok, Instagram Reels, YouTube Shorts) and niche",
      "Inspect extracted hook lines alongside views, likes, comments, and like+comment engagement rate",
      "Click directly through to original public clips to study visual pacing and framing",
    ],
    methodologyNote:
      "Entries come from ContHunt's cached bundled Viral Now snapshot (a curated breakout sample, not a representative feed of all uploads). Public engagement rate is calculated strictly from visible likes and comments divided by views.",
    ctaLabel: "Research Custom Hooks in ContHunt",
    ctaHref: "https://agent.conthunt.app",
    faqs: [
      {
        question: "How is engagement rate calculated in the Viral Hooks table?",
        answer:
          "Public engagement rate is computed as (likes + comments) / views × 100 using visible public counts recorded in the snapshot.",
      },
      {
        question: "Are these hooks invented templates or real public videos?",
        answer:
          "These entries come from real public clips captured in ContHunt's bundled Viral Now snapshot, each linked to its source video URL. If you want fill-in-the-blank starter templates, use ContHunt's free Viral Hook Generator tool.",
      },
      {
        question: "How do I find hooks for a niche not listed in the public snapshot?",
        answer:
          "Open https://agent.conthunt.app (or connect https://mcp.conthunt.app/mcp) to run on-demand keyword and competitor discovery across TikTok, Instagram Reels, and YouTube Shorts.",
      },
    ],
  },
  trendingHashtags: {
    path: "/data/trending-hashtags",
    seoTitle: "Trending Short-Form Hashtags Directory | ContHunt",
    metaDescription:
      "Inspect recurring hashtags extracted from ContHunt's public breakout video snapshot—frequency, median views, top platform, and niche overlap across TikTok, Reels, and Shorts.",
    eyebrow: "Data Hub · Hashtags",
    h1: "Hashtags showing up across breakout short-form clips.",
    subtitle:
      "See which tags recur most often in ContHunt's public breakout snapshot, along with median views, dominant platform, and the niches where each tag appears.",
    answerFirst:
      "ContHunt's Trending Hashtags directory extracts every hashtag appearing in titles across our bundled public Viral Now snapshot, ranking tags by occurrence frequency alongside median views, top platform, and niche overlap. Use hashtags for clean topic classification—never as a substitute for a strong 3-second hook.",
    highlights: [
      "Extracted directly from public clip titles in ContHunt's bundled breakout snapshot",
      "Shows tag frequency, median views across tagged clips, dominant platform, and niche tags",
      "Helps pair niche-specific classification tags with proven creative formats",
    ],
    methodologyNote:
      "Hashtag rankings reflect frequency and median views within ContHunt's bundled Viral Now breakout snapshot rather than official platform-wide trending charts. Treat median views as snapshot-level signals for topic clustering.",
    ctaLabel: "Explore Full Topic Discovery",
    ctaHref: "https://agent.conthunt.app",
    faqs: [
      {
        question: "Do trending hashtags make a weak video go viral?",
        answer:
          "No. Hashtags help algorithms classify a clip's initial topic alongside audio and visuals, but distribution still depends on early retention, watch time, and viewer interactions.",
      },
      {
        question: "How many hashtags should I use on TikTok, Instagram Reels, or YouTube Shorts?",
        answer:
          "Most creators see cleaner topic matching with 3 to 5 specific niche and format tags rather than stuffing dozens of broad generic tags.",
      },
      {
        question: "Why does the table report median views instead of average views?",
        answer:
          "A single multi-million-view outlier can distort an average across a small tag group. Median views give a steadier picture of typical snapshot performance for that hashtag.",
      },
    ],
  },
  boards: {
    path: "/boards",
    seoTitle: "Curated Short-Form Video Boards by Niche | ContHunt",
    metaDescription:
      "Browse ContHunt's public curated niche boards featuring breakout TikTok, Instagram Reels, and YouTube Shorts clips with view totals and update dates.",
    eyebrow: "Curated Boards",
    h1: "Niche swipe boards built from real short-form breakouts.",
    subtitle:
      "Explore curated public boards grouped by category so strategists, brands, and creators can inspect proven TikTok, Instagram Reels, and YouTube Shorts clips in one place.",
    answerFirst:
      "ContHunt Boards organize high-performing short-form videos into structured niche collections across TikTok, Instagram Reels, and YouTube Shorts. Public boards preview curated category snapshots directly on conthunt.app, while private workspace boards in https://agent.conthunt.app let teams save custom research and query it through ContHunt MCP.",
    highlights: [
      "Category-organized collections spanning TikTok, Instagram Reels, and YouTube Shorts",
      "Transparent clip counts, combined snapshot views, and last-updated timestamps",
      "Build unlimited custom client or campaign boards inside https://agent.conthunt.app",
    ],
    methodologyNote:
      "Public boards are generated from ContHunt's bundled Viral Now niche collections and display their snapshot update timestamps. Custom private boards and live updates are managed inside https://agent.conthunt.app.",
    ctaLabel: "Create Your Own Board",
    ctaHref: "https://agent.conthunt.app",
    faqs: [
      {
        question: "Can I create private boards for my clients or internal campaigns?",
        answer:
          "Yes. Inside https://agent.conthunt.app, teams organize private saved boards per client, product line, or hook style—and can query those boards directly through https://mcp.conthunt.app/mcp.",
      },
      {
        question: "How are clips selected for public ContHunt boards?",
        answer:
          "Public boards showcase curated breakout videos from ContHunt's Viral Now niche snapshots, displaying clip count, combined views, and snapshot update dates.",
      },
      {
        question: "Can an AI assistant read my ContHunt boards?",
        answer:
          "Yes. Connecting ContHunt's hosted MCP server (https://mcp.conthunt.app/mcp) lets MCP-compatible assistants inspect your saved boards and video evidence directly.",
      },
    ],
  },
  creators: {
    path: "/creators",
    seoTitle: "Public Short-Form Creator Snapshots | ContHunt",
    metaDescription:
      "Browse public creator profiles featured in ContHunt's breakout short-form video snapshots—compare platforms, featured clip counts, median views, and top videos.",
    eyebrow: "Creator Directory",
    h1: "Creators behind standout short-form clips.",
    subtitle:
      "Inspect public creator snapshots featured across ContHunt's curated TikTok, Instagram Reels, and YouTube Shorts collections—see which niches they publish in and which clips led their snapshot performance.",
    answerFirst:
      "ContHunt's public Creators directory groups breakout clips from our bundled Viral Now snapshot by public creator handle, showing platform coverage, featured clip counts, snapshot median views, and top-performing examples. To audit any public handle on demand, pair this directory with ContHunt's free Account Analyzers.",
    highlights: [
      "Grouped by public creator handle across TikTok, Instagram Reels, and YouTube Shorts",
      "Displays featured clip count, snapshot median views, total snapshot views, and top breakout clip",
      "Connects directly to public account analyzer workflows for deeper baseline audits",
    ],
    methodologyNote:
      "Creator stats on this directory summarize only the clips captured in ContHunt's bundled public Viral Now snapshot—not a creator's entire historical catalog or private audience demographics.",
    ctaLabel: "Analyze Any Public Account",
    ctaHref: "/tools",
    faqs: [
      {
        question: "Do creator view totals here represent a creator's lifetime channel views?",
        answer:
          "No. Directory totals and medians summarize only the featured videos included in ContHunt's bundled public Viral Now snapshot.",
      },
      {
        question: "How can I audit a specific creator handle that is not listed here?",
        answer:
          "Use ContHunt's free public account analyzers on conthunt.app or search any public handle across TikTok, Reels, and Shorts inside https://agent.conthunt.app.",
      },
      {
        question: "Are the creators listed here endorsed by or partnered with ContHunt?",
        answer:
          "No. Listing a public creator handle reflects publicly available short-form video snapshots only and does not imply endorsement, affiliation, or partnership.",
      },
    ],
  },
  newsletter: {
    path: "/newsletter",
    seoTitle: "ContHunt Short-Form Video Intelligence Dispatch | Newsletter",
    metaDescription:
      "Get concise breakdowns of breakout short-form hooks, cross-platform formats, and AI-assisted research workflows across TikTok, Instagram Reels, and YouTube Shorts.",
    eyebrow: "Newsletter",
    h1: "Practical short-form video intelligence—zero fluff.",
    subtitle:
      "Receive periodic dispatches unpacking real outlier hooks, cross-platform format shifts across TikTok, Instagram Reels, and YouTube Shorts, and repeatable MCP research workflows.",
    answerFirst:
      "The ContHunt dispatch delivers concise, evidence-backed creative teardowns covering real outlier formats on TikTok, Instagram Reels, and YouTube Shorts—plus practical tips for building faster brief and AI-agent research pipelines with ContHunt.",
    highlights: [
      "Real hook teardowns showing why specific openings beat account baselines",
      "Cross-platform format notes spanning TikTok, Instagram Reels, and YouTube Shorts",
      "Practical MCP prompts and workflow ideas for creative strategists and growth teams",
      "No spam, no fake vanity metrics, and one-click unsubscribe anytime",
    ],
    ctaLabel: "Subscribe to the Dispatch",
    ctaHref: "/newsletter",
    faqs: [
      {
        question: "Who is the ContHunt newsletter written for?",
        answer:
          "UGC agencies, DTC ecommerce marketers, SaaS growth leads, solo creators, and AI-native teams who want concrete short-form video patterns rather than generic social media news.",
      },
      {
        question: "Is the newsletter free?",
        answer:
          "Yes, subscribing is completely free and you can unsubscribe in one click at any time.",
      },
      {
        question: "What makes ContHunt's dispatch different from generic creator newsletters?",
        answer:
          "Every issue focuses on observable short-form mechanics—opening hooks, baseline-normalized outliers, cross-platform format transfers, and structured research workflows—grounded in real clips.",
      },
    ],
  },
  partners: {
    path: "/partners",
    seoTitle: "Ecosystem & Integration Partner Program | ContHunt",
    metaDescription:
      "Explore open partner categories for ContHunt across scheduling, video editing, UGC marketplaces, AI agent frameworks, analytics, and creator CRMs—built around our hosted MCP.",
    eyebrow: "Ecosystem & Partners",
    h1: "Partner with ContHunt across the short-form creative stack.",
    subtitle:
      "ContHunt focuses deeply on cross-platform short-form discovery, outlier analysis, and hosted MCP intelligence. We welcome integration swaps, co-authored workflow guides, and reciprocal ecosystem collaborations across six complementary categories.",
    answerFirst:
      "ContHunt partners with complementary tools across the creator and growth stack—scheduling, video editing, UGC marketplaces, AI agent frameworks, analytics/BI, and creator CRMs—through open MCP integrations, joint workflow documentation, and co-marketing swaps. Every category listed below is an open invitation for collaboration, not a claim of existing signed partnerships.",
    highlights: [
      "Hosted MCP server (https://mcp.conthunt.app/mcp) makes technical workflow integrations lightweight",
      "Six clear, non-competing partner categories across the short-form production lifecycle",
      "Open to reciprocal integration directories, co-authored playbooks, and agency referral programs",
    ],
    transparencyNotice:
      "Transparency note: The six categories below represent open partner tracks where ContHunt actively welcomes integration and co-marketing collaborations. Listing a category does not claim an existing official partnership or endorsement with any third-party vendor.",
    partnerCategories: [
      {
        id: "scheduling",
        name: "Scheduling & Publishing Tools",
        summary:
          "ContHunt handles pre-production discovery across TikTok, Instagram Reels, and YouTube Shorts; scheduling tools handle calendar queues, multi-account publishing, and posting automation.",
        collaborationFormats: [
          "Reciprocal integration and workflow guide listings",
          "Shared creative-calendar templates linking ContHunt boards to publishing queues",
          "Joint webinars or playbooks on research-to-publish velocity",
        ],
        exampleWorkflow:
          "Strategists finalize validated hook angles on a ContHunt board, brief scripts, and hand approved vertical edits straight into a scheduling platform's cross-posting queue.",
        statusLabel: "Open partner category",
      },
      {
        id: "video-editing",
        name: "Video Editing & Clipping Tools",
        summary:
          "Connect upstream hook and pacing research with downstream captioning, B-roll assembly, and vertical repurposing tools.",
        collaborationFormats: [
          "Co-authored teardown guides pairing hook structures with editing templates",
          "Reciprocal tool directory placement for creator and faceless-channel workflows",
          "Creator bundle promotions or educational tutorials",
        ],
        exampleWorkflow:
          "Editors inspect outlier pacing and opening visual cues in ContHunt, then apply matching caption timing and cut rhythms inside their preferred vertical video editor.",
        statusLabel: "Open partner category",
      },
      {
        id: "ugc-marketplaces",
        name: "UGC Marketplaces & Creator Sourcing",
        summary:
          "Pair ContHunt's evidence-backed creative briefing with platforms that handle creator casting, contracts, deliverables, and payouts.",
        collaborationFormats: [
          "Joint UGC briefing templates combining ContHunt board links with creator casting specs",
          "Agency partner spotlights and co-marketing swaps",
          "Cross-referrals for DTC brands scaling monthly creator sprints",
        ],
        exampleWorkflow:
          "A brand researches winning category product demos in ContHunt, packages reference links into a brief, and commissions vetted creators through a UGC marketplace.",
        statusLabel: "Open partner category",
      },
      {
        id: "ai-agent-frameworks",
        name: "AI Agent Frameworks & MCP Clients",
        summary:
          "Because ContHunt ships a remote MCP server (https://mcp.conthunt.app/mcp), AI assistants, workflow orchestrators, and coding-agent ecosystems can add live short-form video intelligence with minimal glue code.",
        collaborationFormats: [
          "Official MCP directory listings and verified quick-start recipes",
          "Reference agent templates combining ContHunt MCP with script or brief automation",
          "Joint technical walkthroughs for marketing and developer communities",
        ],
        exampleWorkflow:
          "An MCP-compatible assistant or workflow builder connects to https://mcp.conthunt.app/mcp to pull niche outliers and saved boards directly into automated weekly creative reports.",
        statusLabel: "Open partner category",
      },
      {
        id: "analytics-bi",
        name: "Analytics, Attribution & BI Platforms",
        summary:
          "Combine ContHunt's external creative intelligence (what hooks earn organic reach) with internal attribution, paid-media ROAS, and warehouse reporting.",
        collaborationFormats: [
          "Co-authored measurement guides connecting organic hook research to paid creative tests",
          "Reciprocal partner directory listings",
          "Joint benchmark commentary and creative-ops case studies",
        ],
        exampleWorkflow:
          "Growth teams surface promising organic angles in ContHunt, launch structured creative variants, and track downstream conversion lift inside their attribution or BI suite.",
        statusLabel: "Open partner category",
      },
      {
        id: "creator-crms",
        name: "Creator CRMs & Agency Workflow Tools",
        summary:
          "Bridge ContHunt's creator and outlier discovery with relationship management, campaign tracking, approval portals, and client reporting.",
        collaborationFormats: [
          "Shared agency operating-system templates (discovery to client sign-off)",
          "Reciprocal integration guides and newsletter swaps",
          "Agency community co-promotions",
        ],
        exampleWorkflow:
          "Account strategists identify breakout niche creators and winning angles in ContHunt, then track outreach, briefs, and deliverables inside their agency CRM.",
        statusLabel: "Open partner category",
      },
    ],
    ctaLabel: "Read ContHunt MCP Integration Docs",
    ctaHref: "https://conthunt.app/docs/integrations/mcp",
    faqs: [
      {
        question: "Are the six partner categories existing signed partnerships?",
        answer:
          "No. They are open ecosystem categories where ContHunt welcomes technical MCP integrations, co-authored workflow guides, and reciprocal directory or co-marketing collaborations.",
      },
      {
        question: "How can a tool or agency propose an integration or co-marketing swap?",
        answer:
          "Review our hosted MCP documentation at https://conthunt.app/docs/integrations/mcp for technical capabilities and reach out via conthunt.app with the workflow or integration recipe you want to co-build.",
      },
      {
        question: "Does ContHunt charge partner platforms to connect via MCP?",
        answer:
          "MCP integration recipes and documentation are open to build around https://mcp.conthunt.app/mcp; mutual users authenticate with their own ContHunt accounts (paid plans start at $25/mo).",
      },
    ],
  },
  viralIndex: {
    path: "/viral-index",
    seoTitle: "Short-Form Virality Index (2026 Snapshot) | ContHunt",
    metaDescription:
      "Compare breakout short-form video snapshots against ContHunt's November 2026 platform baseline medians across TikTok, Instagram Reels, and YouTube Shorts.",
    eyebrow: "Virality Index · 2026 Snapshot",
    h1: "How breakout short-form clips compare against platform baselines.",
    subtitle:
      "Inspect ContHunt's Virality Index: breakout snapshot medians and peak outlier multiples across TikTok, Instagram Reels, and YouTube Shorts measured against our November 2026 500-clip-per-platform benchmark sample.",
    answerFirst:
      "The ContHunt Virality Index compares curated breakout videos from our bundled Viral Now snapshot against baseline platform medians extracted on 2026-11-23 (500 sampled clips each across TikTok, Instagram Reels, and YouTube Shorts). It shows the gap between typical short-form views and breakout outlier multiples by platform and niche.",
    highlights: [
      "Platform-by-platform breakout sample medians compared to November 2026 benchmark medians",
      "Peak outlier multiples showing how far top breakout clips separate from baseline distribution",
      "Niche-level snapshot medians and top recurring hashtag across featured breakout clips",
    ],
    methodologyNote:
      "Methodology & caveat: The Viral Now collection is a selected breakout sample, not a representative feed of all uploads on TikTok, Instagram Reels, or YouTube Shorts. Baseline medians come from ContHunt's benchmark-2026.json sample (n = 500 clips per platform, extracted 2026-11-23): 2,818 median views on TikTok, 3,068 on Instagram Reels, and 998 on YouTube Shorts. Both snapshot and benchmark dates are displayed alongside the figures.",
    ctaLabel: "Run Live Outlier Search in ContHunt",
    ctaHref: "https://agent.conthunt.app",
    faqs: [
      {
        question: "What baseline does the ContHunt Virality Index compare breakout clips against?",
        answer:
          "Each platform's breakout sample is compared against ContHunt's November 2026 benchmark dataset (500 sampled clips per platform, extracted 2026-11-23), which recorded sample medians of 2,818 views on TikTok, 3,068 on Instagram Reels, and 998 on YouTube Shorts.",
      },
      {
        question: "Is the Virality Index a live real-time ticker of all social platforms?",
        answer:
          "No. It is a transparent, date-stamped snapshot comparing ContHunt's bundled Viral Now breakout collection against our dated platform benchmark sample.",
      },
      {
        question: "How should marketers use the Virality Index?",
        answer:
          "Use it to calibrate expectations across TikTok, Instagram Reels, and YouTube Shorts—understanding why a 30,000-view clip represents a very different relative outlier multiple on Shorts versus TikTok—then inspect the featured breakout clips for repeatable hook mechanics.",
      },
    ],
  },
} as const;

export function getUseCaseBySlug(slug: string): UseCasePageSpec | undefined {
  return USE_CASE_PAGES.find((item) => item.slug === slug);
}

export function getGlossaryTermBySlug(
  slug: string,
): GlossaryTermSpec | undefined {
  return GLOSSARY_TERMS.find((item) => item.slug === slug);
}
