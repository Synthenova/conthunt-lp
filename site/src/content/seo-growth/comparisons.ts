/**
 * Comparison hub and 10 date-stamped competitor comparison page specifications (Move #6).
 * Competitor pricing and capabilities verified against public vendor pages and 2026 pricing trackers on 2026-11-24.
 * Readers are advised to confirm current regional pricing and promotions directly on each vendor site.
 */

export interface ComparisonRow {
  readonly dimension: string;
  readonly left: string;
  readonly right: string;
  readonly conthunt: string;
}

export interface ComparisonFaq {
  readonly question: string;
  readonly answer: string;
}

export interface ComparisonBestFor {
  readonly left: string;
  readonly right: string;
  readonly conthunt: string;
}

export interface ComparisonPageSpec {
  readonly slug: string;
  readonly updated: string;
  readonly leftName: string;
  readonly rightName: string;
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly verdictSummary: string;
  readonly bestFor: ComparisonBestFor;
  readonly comparisonRows: readonly ComparisonRow[];
  readonly pricingNote: string;
  readonly whereContHuntFits: string;
  readonly faqs: readonly ComparisonFaq[];
  readonly relatedSlugs: readonly string[];
}

export interface ComparisonsHubCopy {
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly h1: string;
  readonly subtitle: string;
  readonly methodologyNote: string;
  readonly updated: string;
  readonly faqs: readonly ComparisonFaq[];
}

export const COMPARISONS_UPDATED = "2026-11-24" as const;

export const COMPARISONS_HUB: ComparisonsHubCopy = {
  seoTitle: "Compare Short-Form Video & Social Intelligence Tools (2026) | ContHunt",
  metaDescription:
    "Side-by-side 2026 comparisons of ContHunt, Shortimize, Virlo, Kalodata, Sandcastles, 1of10, FastMoss, Shoplus, vidIQ, and Exolyt — verified pricing, platform coverage, and MCP access.",
  eyebrow: "Tool Comparisons · Updated Nov 2026",
  h1: "Honest comparisons of short-form video intelligence tools.",
  subtitle:
    "Compare platform coverage, pricing tiers, TikTok Shop depth, YouTube packaging workflows, and hosted MCP access across 10 major creator and brand research tools — verified on 2026-11-24.",
  methodologyNote:
    "Every comparison below separates verified product scope from hype: we state plainly when a rival is stronger for TikTok Shop GMV estimates, automated UGC payouts, enterprise TikTok social listening, or long-form YouTube thumbnail packaging. Pricing reflects public USD tiers verified on 2026-11-24; confirm current regional pricing on each vendor site.",
  updated: COMPARISONS_UPDATED,
  faqs: [
    {
      question: "How does ContHunt verify competitor pricing in these comparisons?",
      answer:
        "All listed competitor tiers were checked against public vendor pricing pages and 2026 pricing documentation on 2026-11-24. Because SaaS tools run seasonal promotions and regional currencies (especially Kalodata, FastMoss, and Exolyt), every page carries an explicit date stamp and advises verifying live checkout rates.",
    },
    {
      question: "Why does ContHunt include comparisons between two third-party tools like Kalodata vs FastMoss?",
      answer:
        "Buyers evaluating TikTok Shop or YouTube tools often discover mid-research that they also need cross-platform creative hook intelligence or AI-agent MCP workflows. Side-by-side reviews help teams choose the right specialized tool — and see clearly when ContHunt should replace or complement it.",
    },
    {
      question: "What makes ContHunt pricing structurally different from Shortimize, Virlo, and Exolyt?",
      answer:
        "ContHunt starts at $25/mo billed yearly ($29/mo monthly) with a 7-day free trial and includes hosted MCP access (https://mcp.conthunt.app/mcp) plus TikTok, Instagram Reels, and YouTube Shorts research on every paid tier — without charging a separate $150/mo MCP add-on or enterprise-only workspace fees.",
    },
  ],
} as const;

export const COMPARISON_PAGES: readonly ComparisonPageSpec[] = [
  {
    slug: "shortimize-vs-virlo",
    updated: COMPARISONS_UPDATED,
    leftName: "Shortimize",
    rightName: "Virlo",
    seoTitle: "Shortimize vs Virlo (2026): Pricing, Tracking, Trend Discovery & MCP | ContHunt",
    metaDescription:
      "Compare Shortimize ($99/mo) vs Virlo ($49/mo) vs ContHunt ($25/mo yearly) across TikTok, Reels, and Shorts tracking, trend discovery, creator payouts, and MCP access.",
    h1: "Shortimize vs Virlo (2026): tracking dashboards vs trend agents.",
    verdictSummary:
      "Shortimize is stronger if you manage a fleet of UGC or brand accounts and need centralized performance dashboards, product analytics integrations (PostHog, Mixpanel, Amplitude), and automated creator payouts via Contra. Virlo is stronger if you want niche trend listening, Meta Ads coverage, and credit-based 24/7 research agents at a lower starting price ($49/mo vs $99/mo). If you want multi-platform discovery, Deep Search, saved boards, and hosted MCP included without add-on fees starting at $25/mo yearly ($29/mo monthly), ContHunt fills the gap.",
    bestFor: {
      left: "Brands and UGC teams tracking their own creator fleets, needing automated Contra payouts and analytics syncs (Slack, PostHog, Mixpanel).",
      right: "Growth marketers wanting automated trend listening across TikTok, Reels, Shorts, and Meta Ads with prepaid developer API access.",
      conthunt:
        "Creators, agencies, and AI-agent teams wanting cross-platform TikTok, Reels, and Shorts discovery, Deep Search, saved boards, and hosted MCP included from $25/mo yearly.",
    },
    comparisonRows: [
      {
        dimension: "Primary focus",
        left: "Cross-platform account & video performance tracking with creator payouts",
        right: "Short-form trend discovery, outlier scouting, and 24/7 research agents",
        conthunt: "Cross-platform discovery, video analysis, Deep Search, boards & hosted MCP",
      },
      {
        dimension: "Platforms covered",
        left: "TikTok, Instagram Reels, YouTube Shorts",
        right: "TikTok, Instagram Reels, YouTube Shorts, Meta Ads",
        conthunt: "TikTok, Instagram Reels, YouTube Shorts",
      },
      {
        dimension: "Entry pricing (verified 2026-11-24)",
        left: "Launch $99/mo ($79/mo yearly); Scale $249/mo ($199/mo yearly); 7-day trial",
        right: "Starter $49/mo (~$34/mo yearly); Pro $199/mo (~$139/mo yearly); 7-day trial",
        conthunt: "Pro $25/mo yearly ($29/mo monthly); Creator $63/mo yearly ($79/mo monthly); 7-day trial",
      },
      {
        dimension: "MCP & programmatic access",
        left: "API, Webhooks & MCP listed as $150/mo add-on on Launch/Scale (included on Enterprise)",
        right: "Developer API credit included ($5–$300/mo by tier) plus pay-as-you-go prepaid API",
        conthunt: "Hosted Streamable HTTP MCP (mcp.conthunt.app/mcp) included on all paid plans",
      },
      {
        dimension: "Metering model",
        left: "Unlimited tracked accounts; metered by stored video cap (1,000–5,000) and refresh speed",
        right: "Monthly credit pool (2,000–50,000 credits) plus separate API credits",
        conthunt: "Hunt credits (1 per platform searched or tracked refresh) + AI credits (7 est. per analyzed video)",
      },
      {
        dimension: "Standout extra capability",
        left: "Automated creator payments via Contra + PostHog/Mixpanel/Amplitude integrations",
        right: "Meta Ads coverage + pay-as-you-go API starting from $10 prepaid balance",
        conthunt: "SQL reads over saved boards + hosted Deep Search reports + official Agent Skill",
      },
    ],
    pricingNote:
      "Verified against public vendor pages on 2026-11-24: Shortimize Launch is $99/mo ($79/mo yearly) with a $150/mo API/Webhooks/MCP add-on; Virlo Starter is $49/mo (~$34/mo yearly) and Pro is $199/mo; ContHunt Pro is $25/mo yearly ($29/mo monthly). Confirm current billing terms on each vendor site.",
    whereContHuntFits:
      "Teams comparing Shortimize and Virlo often realize Shortimize is priced for post-publish fleet reporting ($99+/mo plus $150/mo for MCP), while Virlo jumps from $49/mo to $199/mo once you need team scale and larger credit pools. ContHunt sits right in the sweet spot for pre-production research and AI-agent workflows: Pro ($25/mo yearly) and Creator ($63/mo yearly) include TikTok, Reels, and Shorts discovery, Deep Search, saved boards, and hosted MCP with zero add-on surcharges.",
    faqs: [
      {
        question: "Is Shortimize or Virlo better for tracking our own UGC creator accounts?",
        answer:
          "Shortimize is built specifically for ongoing account tracking, centralized view reporting across unlimited accounts, and automating creator payouts via Contra. Virlo is geared more toward scouting external trends and outliers.",
      },
      {
        question: "Which tool gives the lowest-cost MCP access for Claude, Cursor, or Codex?",
        answer:
          "ContHunt includes its hosted MCP server on every paid plan starting at $25/mo billed yearly ($29/mo monthly). Shortimize lists API/Webhooks/MCP as a $150/mo add-on on Launch and Scale tiers.",
      },
      {
        question: "Does either Shortimize or ContHunt track Meta Ads like Virlo?",
        answer:
          "Virlo includes Meta Ads alongside TikTok, Reels, and Shorts. Neither Shortimize nor ContHunt is a Meta Ad Library tool — both focus on organic short-form video intelligence.",
      },
      {
        question: "Can agencies pair Shortimize with ContHunt?",
        answer:
          "Yes. Agencies with large creator rosters sometimes use Shortimize for client-facing view tracking and Contra payouts while using ContHunt (and ContHunt MCP) for weekly niche discovery, hook analysis, and Deep Search briefs.",
      },
    ],
    relatedSlugs: ["conthunt-vs-shortimize", "conthunt-vs-virlo", "exolyt-vs-shortimize"],
  },
  {
    slug: "conthunt-vs-shortimize",
    updated: COMPARISONS_UPDATED,
    leftName: "ContHunt",
    rightName: "Shortimize",
    seoTitle: "ContHunt vs Shortimize (2026): Pricing, Deep Search & MCP Compared",
    metaDescription:
      "Detailed 2026 comparison of ContHunt ($25/mo yearly) vs Shortimize ($99/mo): pre-production research, Deep Search, account tracking, Contra payouts, and MCP add-on costs.",
    h1: "ContHunt vs Shortimize (2026): research intelligence vs fleet tracking.",
    verdictSummary:
      "Choose ContHunt if your priority is discovering breakout topics across TikTok, Reels, and Shorts, analyzing hooks with Deep Search, organizing swipe-file boards, and connecting Claude, Cursor, or Codex via included hosted MCP from $25/mo yearly ($29/mo monthly). Choose Shortimize if your primary job is tracking unlimited owned/UGC creator accounts, refreshing dashboards every 1–24 hours, piping metrics into Mixpanel/PostHog, and paying creators via Contra.",
    bestFor: {
      left: "Creators, agencies, and growth teams focused on pre-production research, Deep Search pattern analysis, swipe-file boards, and zero-add-on MCP workflows.",
      right: "Consumer apps and UGC agencies running dozens of active creator accounts that need centralized post-publish reporting and automated Contra payouts.",
      conthunt:
        "Teams that want multi-platform discovery, AI video analysis, Deep Search, competitor tracking, and hosted MCP included in one plan from $25/mo yearly.",
    },
    comparisonRows: [
      {
        dimension: "Core workflow strength",
        left: "Niche discovery, AI hook/video analysis, Deep Search reports, saved boards & MCP",
        right: "Unlimited account tracking, post-publish reporting, analytics integrations & creator payouts",
        conthunt: "Combines discovery, competitor tracking, Deep Search, and MCP in one workspace",
      },
      {
        dimension: "Entry plan price (verified 2026-11-24)",
        left: "Pro $25/mo billed yearly ($29/mo monthly), 7-day free trial",
        right: "Launch $99/mo ($79/mo billed yearly), 7-day free trial",
        conthunt: "$25/mo yearly (Pro), $63/mo yearly (Creator), $119/mo yearly (Research)",
      },
      {
        dimension: "Mid-tier & scale pricing",
        left: "Creator $63/mo yearly ($79/mo monthly); Research $119/mo yearly ($149/mo monthly)",
        right: "Scale $249/mo ($199/mo yearly); Enterprise custom",
        conthunt: "Up to 14,000 Hunt credits, 33,500 AI credits, and 25 daily agents on Research",
      },
      {
        dimension: "MCP server access",
        left: "Included on Pro, Creator, and Research at https://mcp.conthunt.app/mcp",
        right: "$150/mo add-on on Launch and Scale; included on Enterprise",
        conthunt: "Zero MCP add-on fee + official Agent Skill + SQL reads over saved data",
      },
      {
        dimension: "Account tracking & refresh cadence",
        left: "Competitor tracking metered at 1 Hunt credit per tracked item per refresh",
        right: "Unlimited tracked accounts; 1,000–5,000 stored videos; 24h/12h refresh (4h/1h paid add-ons)",
        conthunt: "Flexible tracking alongside keyword search in one Hunt credit pool",
      },
      {
        dimension: "Creator payouts & BI integrations",
        left: "Not a payout tool; integrates with AI assistants and automation tools via MCP",
        right: "Native Contra automated payouts + Slack, Discord, Mixpanel, Amplitude, PostHog",
        conthunt: "Pair with n8n/Zapier MCP for Slack/Notion alerts; use Shortimize if you need Contra payouts",
      },
    ],
    pricingNote:
      "Verified on 2026-11-24: ContHunt Pro starts at $25/mo billed yearly ($29/mo monthly) with MCP included; Shortimize Launch is $99/mo ($79/mo yearly) plus $150/mo if you add API/Webhooks/MCP, or $250–$500/mo for faster refresh rates. Confirm latest pricing on both sites.",
    whereContHuntFits:
      "If you are deciding what to film next — researching hooks across TikTok, Instagram Reels, and YouTube Shorts, analyzing why outlier clips worked, or plugging live video data into Claude, Cursor, or Codex — ContHunt delivers deeper research and included MCP at roughly a quarter of Shortimize Launch monthly cost (and saves the $150/mo MCP add-on).",
    faqs: [
      {
        question: "Why is Shortimize $99/mo while ContHunt Pro starts at $25/mo yearly?",
        answer:
          "Shortimize is positioned around continuous fleet tracking across unlimited owned/UGC accounts plus operational integrations like Contra payouts and product analytics sync. ContHunt is priced for creators, strategists, and agencies running scoped searches, competitor tracking, Deep Search, and MCP workflows with transparent credit allowances.",
      },
      {
        question: "Does ContHunt include competitor tracking like Shortimize?",
        answer:
          "Yes. Every ContHunt plan includes competitor tracking, metered at 1 Hunt credit per tracked item per refresh. If you need 1-hour polling across thousands of owned UGC posts plus automated creator payouts, Shortimize is built specifically for that operational layer.",
      },
      {
        question: "How much do I save on MCP access with ContHunt vs Shortimize?",
        answer:
          "On Shortimize Launch ($99/mo) plus the API/Webhooks/MCP add-on ($150/mo), monthly cost is $249/mo. ContHunt includes hosted MCP on Pro ($25/mo yearly / $29/mo monthly), Creator ($63/mo yearly / $79/mo monthly), and Research ($119/mo yearly / $149/mo monthly).",
      },
      {
        question: "Can I try ContHunt before switching from Shortimize?",
        answer:
          "Yes. ContHunt offers a 7-day free trial on Pro, Creator, and Research plans, plus free public Viral Now boards and calculators at conthunt.app with no card required.",
      },
    ],
    relatedSlugs: ["shortimize-vs-virlo", "conthunt-vs-virlo", "exolyt-vs-shortimize"],
  },
  {
    slug: "conthunt-vs-virlo",
    updated: COMPARISONS_UPDATED,
    leftName: "ContHunt",
    rightName: "Virlo",
    seoTitle: "ContHunt vs Virlo (2026): AI Video Research, Pricing & MCP Compared",
    metaDescription:
      "Compare ContHunt ($25–$119/mo yearly) vs Virlo ($49–$499/mo) across TikTok, Reels, Shorts, Meta Ads, Deep Search, saved boards, and hosted MCP workflows.",
    h1: "ContHunt vs Virlo (2026): Deep Search + MCP vs trend agents + Meta Ads.",
    verdictSummary:
      "ContHunt and Virlo both help growth teams spot short-form outliers across TikTok, Instagram Reels, and YouTube Shorts. Virlo stands out if you specifically want Meta Ads monitoring in the same dashboard or a standalone pay-as-you-go REST API. ContHunt stands out if you want lower starting and mid-tier pricing ($25/mo yearly Pro and $63/mo yearly Creator vs Virlo $49/mo Starter and $199/mo Pro), visual swipe-file boards with SQL querying, hosted Deep Search reports, and an official Agent Skill + hosted MCP for Claude, Cursor, Codex, and Gemini.",
    bestFor: {
      left: "Creators, agencies, and AI-agent builders wanting cross-platform short-form discovery, visual boards, SQL-backed evidence, Deep Search, and native MCP from $25/mo yearly.",
      right: "Performance marketers who want Meta Ads alongside short-form trend feeds, native Notion/Slack push automations, or a prepaid per-call REST developer API.",
      conthunt:
        "Teams scaling weekly short-form research without jumping from $49/mo to $199/mo — Creator ($63/mo yearly) and Research ($119/mo yearly) pack large Hunt and AI credit pools plus MCP.",
    },
    comparisonRows: [
      {
        dimension: "Platforms covered",
        left: "TikTok, Instagram Reels, YouTube Shorts",
        right: "TikTok, Instagram Reels, YouTube Shorts, Meta Ads",
        conthunt: "Dedicated to public organic short-form video across TikTok, Reels, and Shorts",
      },
      {
        dimension: "Pricing tiers (verified 2026-11-24)",
        left: "Pro $25/mo yearly ($29/mo); Creator $63/mo yearly ($79/mo); Research $119/mo yearly ($149/mo)",
        right: "Starter $49/mo (~$34/mo yearly); Pro $199/mo (~$139/mo yearly); Enterprise $499/mo",
        conthunt: "7-day free trial on all 3 plans; yearly billing saves 14%–20%",
      },
      {
        dimension: "AI agent & developer interface",
        left: "Hosted Streamable HTTP MCP (mcp.conthunt.app/mcp) + official Agent Skill + SQL reads",
        right: "Built-in 24/7 research agents + AI Copilot + standalone pay-as-you-go REST API",
        conthunt: "Plugs directly into Claude, Claude Code, Cursor, Codex, ChatGPT, Gemini, and n8n",
      },
      {
        dimension: "Research organization",
        left: "Saved boards, public Viral Now boards, persistent Deep Search threads, SQL query layer",
        right: "Content Trends feeds, creator tracking, outlier views, exports, Slack/Notion automations",
        conthunt: "Reuse saved workspace boards via SQL at zero additional search credit cost",
      },
      {
        dimension: "Mid-tier agency value",
        left: "Creator $63/mo yearly (6,000 Hunt + 17,000 AI credits, 5 daily agents, frontier models)",
        right: "Pro $199/mo (~$139/mo yearly, 12,000 monthly credits, 3 seats, $50/mo API credit)",
        conthunt: "Research tier ($119/mo yearly) stays well below Virlo Pro monthly list price",
      },
      {
        dimension: "Free public tools",
        left: "Public Viral Now niche boards + free engagement & outlier calculators",
        right: "7-day free trial on Starter and Pro",
        conthunt: "Inspect public Viral Now benchmarks and calculators before creating an account",
      },
    ],
    pricingNote:
      "Verified on 2026-11-24: Virlo lists Starter at $49/mo (~$34/mo yearly), Pro at $199/mo (~$139/mo yearly), Enterprise at $499/mo, plus pay-as-you-go API calls from $0.01 (agent runs $0.50); ContHunt lists Pro at $25/mo yearly ($29/mo monthly), Creator at $63/mo yearly ($79/mo monthly), and Research at $119/mo yearly ($149/mo monthly). Confirm live pricing on vendor sites.",
    whereContHuntFits:
      "Virlo is a strong trend-scouting tool, especially if Meta Ads monitoring matters to your paid social team. When your bottleneck is turning organic TikTok, Reels, and Shorts research into deep hook breakdowns, visual swipe boards, and live AI-agent workflows inside Claude, Cursor, or Codex, ContHunt offers a lower entry tier ($25/mo yearly) and a gentler mid-tier ramp ($63/mo yearly vs $199/mo).",
    faqs: [
      {
        question: "Does Virlo or ContHunt cover Meta Ads?",
        answer:
          "Virlo covers Meta Ads in addition to TikTok, Reels, and Shorts. ContHunt focuses on organic short-form video intelligence across TikTok, Instagram Reels, and YouTube Shorts.",
      },
      {
        question: "How does ContHunt MCP compare to Virlo developer API?",
        answer:
          "Virlo offers a traditional metered REST API billed per call from a prepaid balance. ContHunt exposes a hosted OAuth MCP server (`https://mcp.conthunt.app/mcp`) included on all paid plans so AI assistants and coding agents can search, run SQL on saved boards, analyze videos, and invoke Deep Search natively.",
      },
      {
        question: "Which tool is more cost-effective for a 3-person creative agency?",
        answer:
          "Virlo includes 3 seats on its Pro plan ($199/mo monthly or ~$139/mo yearly). ContHunt Creator ($63/mo yearly / $79/mo monthly) and Research ($119/mo yearly / $149/mo monthly) offer lower price points for heavy multi-niche research, though verify multi-seat collaboration needs against both workspaces.",
      },
      {
        question: "Do both tools offer a 7-day free trial?",
        answer:
          "Yes. Both ContHunt and Virlo offer a 7-day free trial so you can benchmark search relevance in your exact niche before committing.",
      },
    ],
    relatedSlugs: ["shortimize-vs-virlo", "conthunt-vs-shortimize", "conthunt-vs-sandcastles"],
  },
  {
    slug: "conthunt-vs-kalodata",
    updated: COMPARISONS_UPDATED,
    leftName: "ContHunt",
    rightName: "Kalodata",
    seoTitle: "ContHunt vs Kalodata (2026): Creative Intelligence vs TikTok Shop Analytics",
    metaDescription:
      "Compare ContHunt vs Kalodata in 2026: TikTok, Reels & Shorts hook research and MCP vs TikTok Shop GMV estimates, affiliate rankings, and livestream sales data.",
    h1: "ContHunt vs Kalodata (2026): cross-platform creative research vs TikTok Shop GMV.",
    verdictSummary:
      "Kalodata and ContHunt solve adjacent but distinct jobs. Kalodata is purpose-built for TikTok Shop sellers and affiliates who need estimated product GMV, shop revenue leaderboards, livestream sales tracking, and affiliate contact exports inside TikTok. ContHunt is purpose-built for cross-platform creative intelligence across TikTok, Instagram Reels, and YouTube Shorts — helping brands, agencies, and creators dissect winning hooks, run Deep Search across niches, build swipe-file boards, and query video evidence inside AI agents via MCP.",
    bestFor: {
      left: "Brands, SaaS teams, creators, and UGC agencies researching hooks, formats, and outlier videos across TikTok, Instagram Reels, and YouTube Shorts.",
      right: "TikTok Shop merchants, dropshippers, and affiliate managers selecting winning SKUs by estimated TikTok Shop revenue, shop sales, and live commerce data.",
      conthunt:
        "Ecommerce and DTC brands that sell on Shopify, Amazon, or TikTok Shop and need winning creative angles across TikTok, Reels, and Shorts — not just TikTok Shop revenue tables.",
    },
    comparisonRows: [
      {
        dimension: "Primary job to be done",
        left: "Cross-platform creative discovery, hook/video analysis, Deep Search & AI-agent MCP",
        right: "TikTok Shop ecommerce analytics: estimated product GMV, shop revenue, affiliates & livestreams",
        conthunt: "Explains why videos win across 3 feeds; does not estimate TikTok Shop GMV",
      },
      {
        dimension: "Platforms covered",
        left: "TikTok, Instagram Reels, YouTube Shorts",
        right: "TikTok & TikTok Shop only",
        conthunt: "Single workflow across all three vertical video platforms",
      },
      {
        dimension: "Pricing (verified 2026-11-24)",
        left: "Pro $25/mo yearly ($29/mo); Creator $63/mo yearly ($79/mo); Research $119/mo yearly ($149/mo)",
        right: "Regional: US Starter $59.90/mo, Pro $119.90/mo; UK/EU Starter $45.90/mo, Pro $99.90/mo (SEA/LATAM lower)",
        conthunt: "Flat global USD pricing with 7-day trial and no regional multi-market bundle surcharge",
      },
      {
        dimension: "TikTok Shop GMV & affiliate exports",
        left: "Not included (focuses on public video performance and creative structure)",
        right: "Core feature: SKU revenue estimates, top shops, livestream analytics, creator contact exports (Pro)",
        conthunt: "Best paired with Kalodata if you run TikTok Shop; replaces Kalodata if you only need creative research",
      },
      {
        dimension: "AI video analysis & Deep Search",
        left: "Built-in video analysis, long-video analysis, and Deep Search specialist reports",
        right: "AI script export/assistance geared around TikTok Shop product videos",
        conthunt: "Structured hook, pacing, and multi-video pattern synthesis across TikTok, Reels, and Shorts",
      },
      {
        dimension: "Hosted MCP for AI agents",
        left: "Included on all paid plans at https://mcp.conthunt.app/mcp",
        right: "Enterprise credit-based API only (no self-serve hosted MCP on Starter/Pro)",
        conthunt: "Works natively with Claude, Cursor, Codex, ChatGPT, Gemini, and n8n",
      },
    ],
    pricingNote:
      "Verified on 2026-11-24: Kalodata pricing varies by country (US Starter $59.90/mo, US Pro $119.90/mo; UK/EU Starter $45.90/mo; Multi-region Starter bundle $99.90/mo; 7-day limited trial without card). ContHunt uses uniform USD pricing starting at $25/mo billed yearly ($29/mo monthly) with a 7-day trial. Confirm current regional pricing on Kalodata after login.",
    whereContHuntFits:
      "If you do not sell on TikTok Shop — or if you already picked your product and now need winning creative hooks across TikTok, Instagram Reels, and YouTube Shorts — paying $59.90–$119.90/mo for TikTok Shop revenue tables leaves Reels and Shorts blind. Many DTC brands use Kalodata strictly for TikTok Shop SKU validation and use ContHunt for cross-platform creative research and AI-agent scripting.",
    faqs: [
      {
        question: "Does ContHunt estimate TikTok Shop GMV or affiliate commissions like Kalodata?",
        answer:
          "No. ContHunt focuses on public short-form video discovery, outlier performance, AI creative analysis, and MCP workflows across TikTok, Reels, and Shorts. For TikTok Shop revenue estimates and affiliate contact directories, Kalodata or FastMoss is the specialized tool.",
      },
      {
        question: "Why does Kalodata cost different amounts in the US vs UK vs Southeast Asia?",
        answer:
          "Kalodata scopes each single-country plan to one TikTok Shop marketplace (such as US or UK) and prices tiers regionally. Accessing multiple markets requires a multi-region bundle (starting around $99.90/mo for US/UK/EU Starter).",
      },
      {
        question: "Can Shopify or SaaS brands benefit more from ContHunt than Kalodata?",
        answer:
          "Yes. Brands driving traffic to Shopify stores, SaaS sign-ups, or app installs care most about organic reach, hook retention, and cross-platform creative angles across TikTok, Reels, and Shorts — which is exactly what ContHunt is built for.",
      },
      {
        question: "Can I use ContHunt MCP alongside a TikTok Shop workflow?",
        answer:
          "Yes. Once you identify a winning SKU in Kalodata, you can ask Claude or Codex via ContHunt MCP to research how creators pitch comparable products across TikTok, Reels, and Shorts and build a swipe-file board for your UGC briefs.",
      },
    ],
    relatedSlugs: ["kalodata-vs-fastmoss", "kalodata-vs-shoplus", "conthunt-vs-shortimize"],
  },
  {
    slug: "conthunt-vs-sandcastles",
    updated: COMPARISONS_UPDATED,
    leftName: "ContHunt",
    rightName: "Sandcastles.ai",
    seoTitle: "ContHunt vs Sandcastles.ai (2026): Short-Form Research, Scripting & MCP",
    metaDescription:
      "Compare ContHunt ($25/mo yearly) vs Sandcastles.ai ($49/mo) across TikTok, Instagram Reels, and YouTube Shorts research, scriptwriting, credit allowances, and MCP access.",
    h1: "ContHunt vs Sandcastles.ai (2026): evidence-first research vs AI script studio.",
    verdictSummary:
      "Both ContHunt and Sandcastles.ai cover TikTok, Instagram Reels, and YouTube Shorts and both offer MCP connectors. Sandcastles.ai leans heavily into guided AI scriptwriting, competitor watchlists (up to 150 tracked accounts on Pro), and agency guest workspaces on its Titan tier. ContHunt leans into broader discovery volume, visual swipe-file boards, SQL querying over saved evidence, multi-video Deep Search, and lower entry pricing ($25/mo yearly vs $49/mo monthly / $39/mo yearly) with a 7-day free trial.",
    bestFor: {
      left: "Creators, agencies, and AI-agent builders who want high-volume cross-platform discovery, Deep Search reports, SQL-queryable boards, and MCP starting at $25/mo yearly.",
      right: "Solo creators and boutique teams who want an opinionated, all-in-one competitor watchlist and guided script generator inside one web studio.",
      conthunt:
        "Teams that already write scripts in Claude, ChatGPT, Cursor, or Codex and want deep, verifiable short-form video evidence plus hosted MCP at a lower monthly entry cost.",
    },
    comparisonRows: [
      {
        dimension: "Platforms covered",
        left: "TikTok, Instagram Reels, YouTube Shorts",
        right: "Instagram Reels, TikTok, YouTube Shorts",
        conthunt: "Unified search, creator lookups, boards, and analysis across all three feeds",
      },
      {
        dimension: "Entry pricing (verified 2026-11-24)",
        left: "Pro $25/mo yearly ($29/mo monthly); 7-day free trial",
        right: "Pro $49/mo ($39/mo billed yearly); 100 credits/mo",
        conthunt: "Pro starts $14–$20/mo lower than Sandcastles Pro and includes 2,000 Hunt + 6,000 AI credits",
      },
      {
        dimension: "Mid & agency pricing",
        left: "Creator $63/mo yearly ($79/mo); Research $119/mo yearly ($149/mo)",
        right: "Visionary $99/mo ($79/mo yearly, 250 credits); Titan $499/mo ($399/mo yearly, 1,500 credits)",
        conthunt: "Research tier ($119/mo yearly) includes 25 daily agents, 14,000 Hunt + 33,500 AI credits",
      },
      {
        dimension: "MCP & agent workflow",
        left: "Hosted Streamable HTTP MCP (mcp.conthunt.app/mcp) + official Agent Skill + SQL reads",
        right: "MCP connector included across plans; REST API on Titan ($499/mo)",
        conthunt: "SQL query layer lets AI agents reuse saved boards without re-spending discovery credits",
      },
      {
        dimension: "Primary workflow emphasis",
        left: "Niche discovery, Deep Search pattern reports, visual boards & open agent integration",
        right: "Competitor tracking (up to 150 accounts on Pro), video breakdowns & guided script generation",
        conthunt: "Separates raw search credits (Hunt) from model analysis credits (AI) for predictable scaling",
      },
      {
        dimension: "Public free utilities",
        left: "Public Viral Now niche boards + free TikTok/Reels/Shorts calculators",
        right: "Paid plans (confirm current trial/free preview on vendor site)",
        conthunt: "Test live public benchmarks and calculators on conthunt.app before signing up",
      },
    ],
    pricingNote:
      "Verified on 2026-11-24: Sandcastles.ai lists Pro at $49/mo ($39/mo yearly, 100 credits), Visionary at $99/mo ($79/mo yearly, 250 credits), and Titan at $499/mo ($399/mo yearly, 1,500 credits, API & guest workspaces). ContHunt lists Pro at $25/mo yearly ($29/mo monthly), Creator at $63/mo yearly ($79/mo monthly), and Research at $119/mo yearly ($149/mo monthly). Confirm current pricing on both sites.",
    whereContHuntFits:
      "If you want your short-form research to power custom AI workflows — whether inside agent.conthunt.app or connected to Claude, Cursor, Codex, and n8n via MCP — ContHunt gives you higher monthly research throughput, SQL access to saved evidence, and a significantly lower price ceiling ($119/mo yearly on Research vs $499/mo on Sandcastles Titan).",
    faqs: [
      {
        question: "Do both ContHunt and Sandcastles.ai support MCP?",
        answer:
          "Yes. Both platforms offer MCP connectivity across paid plans. ContHunt adds a dedicated SQL query layer (`query_saved_data`), persistent hosted `deep_search` threads, `analyze_long_video`, and an official Agent Skill so external agents reuse saved evidence cleanly.",
      },
      {
        question: "Which tool is better for agencies managing multiple client niches?",
        answer:
          "Sandcastles.ai Titan ($499/mo) includes guest workspace access designed for client seats. ContHunt Research ($119/mo yearly / $149/mo monthly) is dramatically less expensive for agencies running high-volume daily research across 25 daily agents and multiple niches.",
      },
      {
        question: "How do credits compare between ContHunt and Sandcastles.ai?",
        answer:
          "Sandcastles.ai meters video analyses, script runs, and reports from one monthly credit pool (100 to 1,500 credits). ContHunt splits credits into Hunt credits (searches and tracking refreshes, 2,000–14,000/mo) and AI credits (model-backed analysis and Deep Search, 6,000–33,500/mo, estimated at 7 AI credits per analyzed video).",
      },
      {
        question: "Can ContHunt generate scripts from analyzed videos?",
        answer:
          "Yes. You can analyze standout videos in agent.conthunt.app or pull analyzed clips and saved boards straight into Claude, ChatGPT, or Cursor through ContHunt MCP to draft scripts in your exact brand voice.",
      },
    ],
    relatedSlugs: ["conthunt-vs-virlo", "conthunt-vs-1of10", "conthunt-vs-shortimize"],
  },
  {
    slug: "conthunt-vs-1of10",
    updated: COMPARISONS_UPDATED,
    leftName: "ContHunt",
    rightName: "1of10",
    seoTitle: "ContHunt vs 1of10 (2026): Cross-Platform Short-Form vs YouTube Outliers",
    metaDescription:
      "Compare ContHunt vs 1of10 in 2026: TikTok, Reels & Shorts Deep Search and MCP ($25/mo yearly) vs YouTube outlier search, AI thumbnail generation, and packaging ($19–$89/mo).",
    h1: "ContHunt vs 1of10 (2026): 3-platform short-form vs YouTube packaging.",
    verdictSummary:
      "1of10 is purpose-built for YouTube creators optimizing long-form ideas, outlier titles, and AI-generated thumbnails — with a free tier and a $19/mo Basic plan. ContHunt is purpose-built for cross-platform short-form video intelligence across TikTok, Instagram Reels, and YouTube Shorts, with Deep Search, visual swipe-file boards, and hosted MCP included starting at $25/mo yearly (whereas 1of10 reserves MCP & API access for its $89/mo Pro tier).",
    bestFor: {
      left: "Short-form creators, UGC agencies, SaaS teams, and AI-agent workflows researching hooks and outliers across TikTok, Instagram Reels, and YouTube Shorts.",
      right: "YouTube-first creators who want outlier title inspiration, AI thumbnail generation/iteration, and YouTube-specific packaging tools.",
      conthunt:
        "Teams that need TikTok and Instagram Reels alongside YouTube Shorts — or want hosted MCP access at $25/mo yearly instead of $89/mo.",
    },
    comparisonRows: [
      {
        dimension: "Platforms covered",
        left: "TikTok, Instagram Reels, YouTube Shorts",
        right: "YouTube (long-form and Shorts outlier discovery)",
        conthunt: "Covers all three major short-form platforms in one search",
      },
      {
        dimension: "Core strength",
        left: "Cross-platform discovery, video & hook analysis, Deep Search, boards & MCP",
        right: "YouTube outlier database, AI title & thumbnail generation, channel packaging",
        conthunt: "Not an AI thumbnail generator; specializes in video research and creative evidence",
      },
      {
        dimension: "Entry pricing (verified 2026-11-24)",
        left: "Pro $25/mo yearly ($29/mo monthly), 7-day free trial",
        right: "Free ($0, capped top 5 search results); Basic $19/mo ($15/mo yearly)",
        conthunt: "Free public Viral Now boards & calculators; paid plans start with 7-day trial",
      },
      {
        dimension: "MCP & API threshold",
        left: "Included on Pro ($25/mo yearly / $29/mo monthly)",
        right: "Included on Pro ($89/mo monthly / $69/mo yearly)",
        conthunt: "Saves $44–$60/mo if your main goal is connecting short-form video data to Claude or Cursor via MCP",
      },
      {
        dimension: "Long-form YouTube packaging",
        left: "Supports analyze_long_video for dissecting a long video source, but no thumbnail generator",
        right: "Dedicated AI thumbnail generator, title generator, and YouTube outlier feed",
        conthunt: "Pair 1of10 for YouTube thumbnails with ContHunt for TikTok, Reels & Shorts hooks",
      },
      {
        dimension: "Cross-platform format arbitrage",
        left: "Compare winning angles on TikTok & Reels to adapt before they saturate YouTube Shorts",
        right: "YouTube ecosystem only",
        conthunt: "Built for multi-channel short-form distribution",
      },
    ],
    pricingNote:
      "Verified on 2026-11-24: 1of10 offers Free ($0, 60 AI credits, top-5 capped search), Basic ($19/mo or $15/mo yearly, 150 AI credits), Pro ($89/mo or $69/mo yearly, 1,000 AI credits, adds API & MCP), and Ultra ($4,999/yr). ContHunt offers Pro ($25/mo yearly / $29/mo monthly), Creator ($63/mo yearly / $79/mo monthly), and Research ($119/mo yearly / $149/mo monthly). Confirm live pricing on vendor sites.",
    whereContHuntFits:
      "If you run a long-form YouTube channel and want AI thumbnail variations and YouTube-only outlier titles, 1of10 is a strong specialist tool. The moment your growth strategy spans TikTok, Instagram Reels, and YouTube Shorts — or you want affordable hosted MCP access for Claude, Cursor, or Codex — ContHunt covers all three feeds at a fraction of 1of10 Pro cost.",
    faqs: [
      {
        question: "Does ContHunt generate YouTube thumbnails like 1of10?",
        answer:
          "No. ContHunt focuses on short-form video discovery, outlier research, video/hook analysis, Deep Search, boards, and hosted MCP across TikTok, Reels, and Shorts. If AI thumbnail generation is your top need, 1of10 or vidIQ is designed for that workflow.",
      },
      {
        question: "Can I use ContHunt for YouTube Shorts outlier research?",
        answer:
          "Yes. ContHunt searches public YouTube Shorts alongside TikTok and Instagram Reels, inspects channel upload histories via creator lookup, and provides a free Viral Outlier Score Calculator on conthunt.app.",
      },
      {
        question: "How do MCP prices compare between ContHunt and 1of10?",
        answer:
          "1of10 unlocks API and MCP access on its Pro plan ($89/mo monthly or $69/mo billed yearly). ContHunt includes hosted MCP on its entry Pro plan ($25/mo billed yearly or $29/mo monthly).",
      },
      {
        question: "Should a hybrid YouTube + TikTok creator use both?",
        answer:
          "Many hybrid teams do: 1of10 Basic ($19/mo) handles long-form YouTube packaging and thumbnails, while ContHunt Pro ($25/mo yearly) powers short-form hook research, Deep Search, and MCP workflows across TikTok, Reels, and Shorts.",
      },
    ],
    relatedSlugs: ["vidiq-vs-1of10", "conthunt-vs-sandcastles", "conthunt-vs-virlo"],
  },
  {
    slug: "kalodata-vs-fastmoss",
    updated: COMPARISONS_UPDATED,
    leftName: "Kalodata",
    rightName: "FastMoss",
    seoTitle: "Kalodata vs FastMoss (2026): Pricing, Historical Data & TikTok Shop Depth",
    metaDescription:
      "Compare Kalodata vs FastMoss in 2026: US and global TikTok Shop pricing, 90-day vs 1,200+ day history, affiliate data, and where ContHunt fits for Reels & Shorts.",
    h1: "Kalodata vs FastMoss (2026): two TikTok Shop leaders compared.",
    verdictSummary:
      "Kalodata and FastMoss are the two main TikTok Shop analytics platforms. Kalodata is often favored for clean US/regional workflows, creator contact exports on Professional, and fast daily SKU/livestream checks (US Starter $59.90/mo; UK/EU $45.90/mo). FastMoss stands out for deep multi-year historical data (up to 1,200–1,500+ days on Ultimate), 20-market global memberships ($69–$159/mo), and introductory first-month discounts (US Basic $29 first month, then $49/mo). Neither covers Instagram Reels or YouTube Shorts — which is where ContHunt complements both.",
    bestFor: {
      left: "TikTok Shop sellers and agencies focused on one primary market (US, UK/EU, or SEA) who want fast product, shop, livestream, and affiliate lookups.",
      right: "Global TikTok Shop operators needing 20-market coverage, multi-year historical sales lookbacks (1,200+ days on Ultimate), or lower US entry pricing ($49/mo standard).",
      conthunt:
        "Ecommerce brands and UGC teams that need winning creative hooks across TikTok, Instagram Reels, and YouTube Shorts plus hosted MCP starting at $25/mo yearly.",
    },
    comparisonRows: [
      {
        dimension: "Primary focus",
        left: "TikTok Shop product revenue estimates, creator/affiliate rankings, livestream insights",
        right: "TikTok Shop product, shop, creator, ad, and livestream intelligence across 20 markets",
        conthunt: "Cross-platform creative intelligence across TikTok, Reels, and Shorts (not TikTok Shop GMV)",
      },
      {
        dimension: "US entry pricing (verified 2026-11-24)",
        left: "US Starter $59.90/mo ($49.92/mo yearly); 7-day limited trial",
        right: "US Basic $49/mo ($29 first month); 7-day trial (no card)",
        conthunt: "Pro $25/mo yearly ($29/mo monthly); 7-day trial",
      },
      {
        dimension: "Mid & top self-serve tiers",
        left: "US Professional $119.90/mo (UK/EU $99.90/mo); Enterprise custom",
        right: "US Pro $89/mo, Ultimate $139/mo; Global Basic $69, Pro $109, Ultimate $159/mo",
        conthunt: "Creator $63/mo yearly ($79/mo); Research $119/mo yearly ($149/mo)",
      },
      {
        dimension: "Historical data window",
        left: "90 days (Starter), 180 days (Professional)",
        right: "90 days (Basic), 180 days (Pro), 1,200–1,500+ days (Ultimate)",
        conthunt: "Live public discovery + persistent saved workspace boards & SQL history",
      },
      {
        dimension: "Instagram Reels & YouTube Shorts",
        left: "Not supported (TikTok only)",
        right: "Not supported (TikTok only)",
        conthunt: "Full native discovery, creator lookup, Deep Search, and MCP across all 3 platforms",
      },
      {
        dimension: "API & MCP access",
        left: "Enterprise credit-based API only",
        right: "Enterprise / custom pricing for API, MCP, and CLI (plus metered API endpoints)",
        conthunt: "Hosted Streamable HTTP MCP included on all paid plans from $25/mo yearly",
      },
    ],
    pricingNote:
      "Verified on 2026-11-24: Kalodata prices regionally (US Starter $59.90/mo, Pro $119.90/mo; UK/EU Starter $45.90/mo; Multi-region bundle $99.90/mo). FastMoss lists US Basic $49/mo ($29 1st mo), Pro $89/mo, Ultimate $139/mo, and Global tiers from $69–$159/mo (lower on annual). ContHunt starts at $25/mo yearly ($29/mo monthly). Confirm current checkout rates on vendor sites.",
    whereContHuntFits:
      "Kalodata and FastMoss answer which SKU is selling on TikTok Shop — they do not tell you what hooks are breaking out on Instagram Reels or YouTube Shorts, nor do they give your AI agents self-serve MCP access on entry plans. Brands running multi-channel ecommerce pair one TikTok Shop tracker (Kalodata or FastMoss) with ContHunt for cross-platform creative research and UGC scripting.",
    faqs: [
      {
        question: "Is FastMoss cheaper than Kalodata for US TikTok Shop sellers?",
        answer:
          "On standard US monthly list pricing verified on 2026-11-24, FastMoss US Basic ($49/mo, $29 first month) and Pro ($89/mo) come in lower than Kalodata US Starter ($59.90/mo) and Professional ($119.90/mo). Always compare daily search caps and export limits for your exact workflow.",
      },
      {
        question: "Which has longer historical TikTok Shop data?",
        answer:
          "Both offer 90 days on entry tiers and 180 days on mid tiers, while FastMoss Ultimate extends historical lookback to 1,200–1,500+ days for seasonal trend analysis.",
      },
      {
        question: "Do either Kalodata or FastMoss include self-serve MCP on starter plans?",
        answer:
          "No — both reserve API/MCP access for enterprise or metered developer tiers. ContHunt includes hosted MCP on all paid plans starting at $25/mo yearly for cross-platform organic video research.",
      },
      {
        question: "Should a Shopify brand without TikTok Shop buy Kalodata or FastMoss?",
        answer:
          "Usually neither. If you sell via Shopify and run organic or UGC video across TikTok, Instagram Reels, and YouTube Shorts, a cross-platform creative intelligence tool like ContHunt directly addresses your hook and format research without paying for TikTok Shop SKU tables you do not use.",
      },
    ],
    relatedSlugs: ["conthunt-vs-kalodata", "kalodata-vs-shoplus", "conthunt-vs-shortimize"],
  },
  {
    slug: "kalodata-vs-shoplus",
    updated: COMPARISONS_UPDATED,
    leftName: "Kalodata",
    rightName: "Shoplus",
    seoTitle: "Kalodata vs Shoplus (2026): Pricing, Service Status & Alternatives",
    metaDescription:
      "Compare Kalodata vs Shoplus in 2026 — including verified pricing tiers, the August 2026 Shoplus service-status notice, and when to choose ContHunt for cross-platform creative research.",
    h1: "Kalodata vs Shoplus (2026): pricing, features, and service status check.",
    verdictSummary:
      "Kalodata is the safer active choice between the two for dedicated TikTok Shop analytics in late 2026: it offers a 7-day no-card trial, clear regional tiers (US Starter $59.90/mo; UK/EU $45.90/mo), and active product/livestream coverage. Shoplus historically competed at $49–$99/mo with a strict no-refund policy and 1-day trial, and multiple industry trackers reported operational shutdown notices for Shoplus in August 2026 — so verify live service availability before paying. For cross-platform TikTok, Reels, and Shorts creative research (outside TikTok Shop GMV), ContHunt starts at $25/mo yearly.",
    bestFor: {
      left: "Active TikTok Shop merchants and affiliate managers needing reliable SKU revenue estimates, shop rankings, and a 7-day trial before committing.",
      right: "Legacy Shoplus users evaluating migration — verify active Shoplus service status directly before purchasing any new subscription.",
      conthunt:
        "Brands, creators, and agencies that care about creative hook performance across TikTok, Instagram Reels, and YouTube Shorts plus hosted MCP from $25/mo yearly.",
    },
    comparisonRows: [
      {
        dimension: "Service continuity (as of Nov 2026)",
        left: "Actively maintained TikTok Shop analytics platform",
        right: "Multiple trackers reported operational shutdown notices in Aug 2026; verify live status first",
        conthunt: "Actively maintained web app (agent.conthunt.app) and hosted MCP (mcp.conthunt.app/mcp)",
      },
      {
        dimension: "Entry pricing (verified 2026-11-24)",
        left: "US Starter $59.90/mo; UK/EU $45.90/mo; SEA/LATAM $16.90–$22.90/mo",
        right: "Listed Basic $49/mo ($39/mo yearly); Premium $69/mo; Professional $99/mo",
        conthunt: "Pro $25/mo yearly ($29/mo monthly); Creator $63/mo yearly ($79/mo monthly)",
      },
      {
        dimension: "Trial & refund friction",
        left: "7-day free trial (limited features, no credit card required)",
        right: "1-day Basic VIP trial; strict no-refund policy reported on paid plans",
        conthunt: "7-day free trial on Pro, Creator, and Research + free public Viral Now boards",
      },
      {
        dimension: "Primary data scope",
        left: "TikTok Shop GMV, shops, affiliates, videos, and livestreams",
        right: "TikTok & TikTok Shop product lists (Top 100–300 on lower tiers) and influencer lookups",
        conthunt: "Public TikTok, Instagram Reels & YouTube Shorts discovery, Deep Search, boards & MCP",
      },
      {
        dimension: "Multi-seat / sub-accounts",
        left: "Single user on Starter/Pro; multiple sub-accounts on Enterprise",
        right: "0 sub-accounts on Basic; 2 on Premium; 5 on Professional",
        conthunt: "Scale via daily agents (2–25) and shared ContHunt workspace boards",
      },
      {
        dimension: "Reels & YouTube Shorts coverage",
        left: "None (TikTok only)",
        right: "None (TikTok only)",
        conthunt: "Full coverage of TikTok, Instagram Reels, and YouTube Shorts",
      },
    ],
    pricingNote:
      "Verified on 2026-11-24: Kalodata US Starter is $59.90/mo (UK/EU $45.90/mo); Shoplus public pricing pages have listed Basic $49/mo, Premium $69/mo, and Professional $99/mo, but multiple third-party trackers reported Shoplus operational shutdown notices in August 2026. Confirm active service availability on vendor sites before subscribing.",
    whereContHuntFits:
      "If you were evaluating Shoplus or Kalodata mainly to discover viral TikTok video angles rather than TikTok Shop GMV tables, switching to ContHunt gives you TikTok, Instagram Reels, and YouTube Shorts in one workspace starting at $25/mo yearly — plus Deep Search and hosted MCP access.",
    faqs: [
      {
        question: "Is Shoplus still operating in late 2026?",
        answer:
          "Several industry trackers reported operational shutdown notices for Shoplus in August 2026 even while legacy pricing pages remained visible online. Confirm live login and active data freshness directly before entering payment details, especially given Shoplus historically strict no-refund policy.",
      },
      {
        question: "What are the best active alternatives if I am migrating off Shoplus?",
        answer:
          "For TikTok Shop GMV and SKU revenue tracking, Kalodata and FastMoss are the leading active replacements. For organic short-form hook research across TikTok, Instagram Reels, and YouTube Shorts (plus AI-agent MCP workflows), ContHunt starts at $25/mo yearly with a 7-day free trial.",
      },
      {
        question: "Does Kalodata require a credit card for its 7-day trial?",
        answer:
          "Public 2026 documentation notes Kalodata offers a limited-feature 7-day free trial without a credit card, making it easy to verify data coverage in your country before subscribing.",
      },
      {
        question: "Can ContHunt replace Kalodata for TikTok Shop affiliates?",
        answer:
          "Only for the creative research side (finding viral video formats and dissecting hooks across TikTok, Reels, and Shorts). If you rely on TikTok Shop product GMV estimates and commission rankings, keep Kalodata or FastMoss for SKU selection.",
      },
    ],
    relatedSlugs: ["kalodata-vs-fastmoss", "conthunt-vs-kalodata", "conthunt-vs-shortimize"],
  },
  {
    slug: "vidiq-vs-1of10",
    updated: COMPARISONS_UPDATED,
    leftName: "vidIQ",
    rightName: "1of10",
    seoTitle: "vidIQ vs 1of10 (2026): YouTube Outliers, AI Credits, Pricing & MCP",
    metaDescription:
      "Compare vidIQ ($0–$49/mo) vs 1of10 ($0–$89/mo) vs ContHunt ($25/mo yearly) for YouTube keyword SEO, outlier packaging, AI thumbnails, Shorts research, and MCP access.",
    h1: "vidIQ vs 1of10 (2026): all-in-one YouTube suite vs outlier packaging.",
    verdictSummary:
      "vidIQ is the better all-in-one YouTube growth suite for solo creators who want browser-extension stats, keyword SEO, AI Coach, clipping, Instagram Reels additions, and generous AI credits at $19/mo (Boost) or $49/mo (Max), with vidIQ MCP available even on Free. 1of10 is stronger if your main workflow is spotting pure YouTube outlier topics and rapidly iterating high-CTR thumbnails and titles (Basic $19/mo; Pro $89/mo adds MCP/API). Neither gives you full cross-platform TikTok + Reels + Shorts Deep Search — which is where ContHunt fits.",
    bestFor: {
      left: "YouTube creators wanting keyword research, Chrome extension stats, AI Coach, clipping, and broad YouTube channel optimization at $19–$49/mo.",
      right: "YouTube creators and packaging strategists laser-focused on outlier video discovery, title ideation, and AI thumbnail generation.",
      conthunt:
        "Short-form creators, brands, and agencies researching viral hooks and outliers across TikTok, Instagram Reels, and YouTube Shorts in one workspace with hosted MCP.",
    },
    comparisonRows: [
      {
        dimension: "Primary strength",
        left: "YouTube SEO, browser extension analytics, AI Coach, clipping & creator coaching",
        right: "YouTube outlier search database, AI title generation & AI thumbnail studio",
        conthunt: "Cross-platform short-form discovery, hook analysis, Deep Search, boards & MCP",
      },
      {
        dimension: "Platforms covered",
        left: "YouTube (primary) plus newer Instagram Reels tools",
        right: "YouTube only",
        conthunt: "TikTok, Instagram Reels, and YouTube Shorts equally",
      },
      {
        dimension: "Free & entry tiers (verified 2026-11-24)",
        left: "Free ($0, 150 AI credits); Boost $19/mo ($199/yr, 2,000 AI credits)",
        right: "Free ($0, 60 AI credits, top-5 capped); Basic $19/mo ($15/mo yearly, 150 AI credits)",
        conthunt: "Pro $25/mo yearly ($29/mo monthly, 2,000 Hunt + 6,000 AI credits); 7-day free trial",
      },
      {
        dimension: "Pro / Max tier pricing",
        left: "Max $49/mo ($468/yr, 6,000 AI credits); Coaching ~$1,188/yr",
        right: "Pro $89/mo ($69/mo yearly, 1,000 AI credits); Ultra $4,999/yr",
        conthunt: "Creator $63/mo yearly ($79/mo); Research $119/mo yearly ($149/mo)",
      },
      {
        dimension: "MCP availability",
        left: "vidIQ MCP included starting on Free tier (uses AI credits)",
        right: "API & MCP unlocked on Pro ($89/mo or $69/mo yearly)",
        conthunt: "Hosted MCP (mcp.conthunt.app/mcp) included on all paid plans from $25/mo yearly",
      },
      {
        dimension: "TikTok & cross-feed arbitrage",
        left: "No TikTok discovery",
        right: "No TikTok or Instagram Reels discovery",
        conthunt: "Compare TikTok, Reels, and Shorts formats side by side in one search",
      },
    ],
    pricingNote:
      "Verified on 2026-11-24: vidIQ US single-channel plans are Free ($0), Boost ($19/mo or $199/yr), Max ($49/mo or $468/yr), and Coaching (~$1,188/yr); 1of10 plans are Free ($0), Basic ($19/mo or $15/mo yearly), Pro ($89/mo or $69/mo yearly), and Ultra ($4,999/yr); ContHunt starts at $25/mo yearly ($29/mo monthly). Confirm live regional pricing on each vendor site.",
    whereContHuntFits:
      "YouTube creators often hit a ceiling when they only research inside YouTube: the freshest short-form hook formats frequently break out on TikTok or Instagram Reels weeks before saturating YouTube Shorts. Pairing vidIQ or 1of10 (for YouTube packaging/SEO) with ContHunt (for cross-platform short-form discovery and Deep Search) closes that blind spot cleanly — and as noted in ContHunt MCP docs, chaining a YouTube SEO server with ContHunt MCP works without tool overlap.",
    faqs: [
      {
        question: "Which is better for a beginner YouTuber: vidIQ Boost or 1of10 Basic?",
        answer:
          "Both list at $19/mo monthly. Choose vidIQ Boost if you want YouTube keyword search data, Chrome extension analytics, AI Coach, and 2,000 AI credits/mo. Choose 1of10 Basic if you want dedicated outlier search filters and AI thumbnail/title packaging workflows.",
      },
      {
        question: "Can I chain vidIQ MCP and ContHunt MCP inside Claude or Cursor?",
        answer:
          "Yes. Because vidIQ focuses on YouTube channel optimization and SEO while ContHunt covers cross-platform TikTok, Instagram Reels, and YouTube Shorts discovery and saved boards, the two MCP servers complement each other cleanly.",
      },
      {
        question: "Which tool is best if my main channel is YouTube Shorts plus TikTok?",
        answer:
          "ContHunt is built specifically for multi-platform short-form video (TikTok, Instagram Reels, and YouTube Shorts). Neither vidIQ nor 1of10 searches TikTok.",
      },
      {
        question: "Do unused monthly AI credits roll over on vidIQ?",
        answer:
          "According to vidIQ 2026 pricing documentation, monthly plan AI credits reset each cycle and do not roll over, though separately purchased add-on credits remain in your balance.",
      },
    ],
    relatedSlugs: ["conthunt-vs-1of10", "conthunt-vs-virlo", "conthunt-vs-sandcastles"],
  },
  {
    slug: "exolyt-vs-shortimize",
    updated: COMPARISONS_UPDATED,
    leftName: "Exolyt",
    rightName: "Shortimize",
    seoTitle: "Exolyt vs Shortimize (2026): TikTok Enterprise Intelligence vs Multi-Platform Tracking",
    metaDescription:
      "Compare Exolyt ($330–$950/mo) vs Shortimize ($99–$249/mo) vs ContHunt ($25–$119/mo yearly) for TikTok social listening, cross-platform Reels & Shorts tracking, and MCP.",
    h1: "Exolyt vs Shortimize (2026): enterprise TikTok listening vs cross-platform tracking.",
    verdictSummary:
      "Exolyt is a B2B TikTok-only social intelligence suite priced for enterprise brands and research teams ($330–$400/mo Essentials; $790–$950/mo Advanced in USD, up to 10 seats per workspace), excelling at comment sentiment analysis, demographic breakdowns, hashtag/sound social listening, and massive CSV exports. Shortimize starts far lower ($99/mo Launch; $249/mo Scale), covers TikTok + Instagram Reels + YouTube Shorts, tracks unlimited accounts, and automates creator payouts via Contra. For pre-production hook research, Deep Search, and included MCP across all 3 platforms from $25/mo yearly, ContHunt is the leanest option.",
    bestFor: {
      left: "Enterprise consumer brands, agencies, and market research teams needing deep TikTok-only social listening, comment sentiment, audience demographics, and 10-seat workspaces.",
      right: "Growth teams and UGC agencies tracking unlimited creator accounts across TikTok, Instagram Reels, and YouTube Shorts with PostHog/Mixpanel sync and Contra payouts.",
      conthunt:
        "Creators, lean brands, and AI-first teams wanting cross-platform TikTok, Reels, and Shorts research, Deep Search, visual boards, and hosted MCP without $150–$950/mo overhead.",
    },
    comparisonRows: [
      {
        dimension: "Platforms covered",
        left: "TikTok only",
        right: "TikTok, Instagram Reels, YouTube Shorts",
        conthunt: "TikTok, Instagram Reels, YouTube Shorts",
      },
      {
        dimension: "Paid entry pricing (verified 2026-11-24)",
        left: "Basic $0 (1 account); Essentials ~$400/mo ($330/mo yearly USD; ~€250/mo EUR)",
        right: "Launch $99/mo ($79/mo yearly), 7-day free trial",
        conthunt: "Pro $25/mo yearly ($29/mo monthly), 7-day free trial",
      },
      {
        dimension: "Upper self-serve pricing",
        left: "Advanced ~$950/mo ($790/mo yearly USD; ~€600/mo EUR); Enterprise custom",
        right: "Scale $249/mo ($199/mo yearly); Enterprise custom",
        conthunt: "Creator $63/mo yearly ($79/mo); Research $119/mo yearly ($149/mo)",
      },
      {
        dimension: "Seats & team model",
        left: "Workspace-priced: up to 10 team members included on paid plans",
        right: "1 seat on Launch, 3 seats on Scale ($20/extra seat/mo)",
        conthunt: "Plan-based credit & daily agent pools (2, 5, or 25 daily agents)",
      },
      {
        dimension: "Standout analytics depth",
        left: "TikTok social listening projects, comment sentiment, age/gender demographics (Advanced), 500K–1M CSV credits",
        right: "Unlimited tracked accounts, Contra creator payouts, Slack/Discord/PostHog/Mixpanel integrations",
        conthunt: "AI video analysis, Deep Search specialist reports, SQL-queryable boards & hosted MCP",
      },
      {
        dimension: "MCP & AI-agent access",
        left: "Not positioned around self-serve hosted MCP (check Enterprise API)",
        right: "$150/mo add-on on Launch/Scale (included on Enterprise)",
        conthunt: "Included on every paid plan at https://mcp.conthunt.app/mcp",
      },
    ],
    pricingNote:
      "Verified on 2026-11-24: Exolyt displays localized Paddle pricing (reported US tiers: Basic $0, Essentials $400/mo or $330/mo yearly, Advanced $950/mo or $790/mo yearly; European EUR equivalents lower, ex-VAT, up to 10 seats). Shortimize lists Launch $99/mo ($79/mo yearly) and Scale $249/mo ($199/mo yearly) plus optional add-ons. ContHunt lists Pro $25/mo yearly, Creator $63/mo yearly, and Research $119/mo yearly. Confirm current local pricing on each vendor site.",
    whereContHuntFits:
      "Many teams looking at Exolyt ($330–$950/mo) and Shortimize ($99–$249/mo) do not actually need 10-seat enterprise TikTok sentiment monitoring or automated Contra payouts — they need to discover breakout formats across TikTok, Instagram Reels, and YouTube Shorts, inspect hooks quickly, and feed evidence into creative briefs or AI agents. ContHunt handles that core job from $25/mo yearly with hosted MCP included.",
    faqs: [
      {
        question: "Why is Exolyt priced so much higher than Shortimize and ContHunt?",
        answer:
          "Exolyt prices per 10-seat B2B workspace rather than per individual creator, bundling TikTok social listening, industry benchmarks, comment sentiment analysis, demographic modeling (on Advanced), and large CSV export quotas.",
      },
      {
        question: "Does Exolyt track Instagram Reels or YouTube Shorts?",
        answer:
          "No. Exolyt is strictly a TikTok intelligence platform. If your team operates across Reels and Shorts too, Shortimize (for fleet tracking) or ContHunt (for creative research, Deep Search, and MCP) covers all three platforms.",
      },
      {
        question: "Is Exolyt free Basic plan enough for competitor tracking?",
        answer:
          "Exolyt Basic ($0) limits you to 1 tracked TikTok account, 1 hashtag, 1 sound, and 7 days of chart history — useful as a product preview, but too small for real multi-competitor research.",
      },
      {
        question: "Which tool has the lowest total cost if I want MCP + 3-platform tracking?",
        answer:
          "ContHunt Pro ($25/mo billed yearly / $29/mo monthly) includes TikTok, Instagram Reels, and YouTube Shorts discovery, competitor tracking, Deep Search, and hosted MCP without paid add-ons.",
      },
    ],
    relatedSlugs: ["conthunt-vs-shortimize", "shortimize-vs-virlo", "conthunt-vs-kalodata"],
  },
] as const;

export const COMPARISON_SLUGS: readonly string[] = COMPARISON_PAGES.map(
  (item) => item.slug,
);

export function getComparisonBySlug(
  slug: string,
): ComparisonPageSpec | undefined {
  return COMPARISON_PAGES.find((item) => item.slug === slug);
}
