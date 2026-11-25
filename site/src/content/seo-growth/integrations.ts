/**
 * Integration hub and 12 dedicated integration landing page specifications (Move #5).
 * Verified against live ContHunt MCP docs (/docs/integrations/mcp) and pricing (plans.ts) on 2026-11-24.
 */

export type IntegrationCategory =
  | "platform-mcp"
  | "ai-assistant"
  | "coding-agent"
  | "automation";

export interface IntegrationSetupStep {
  readonly title: string;
  readonly detail: string;
  readonly code?: string;
}

export interface IntegrationCapability {
  readonly title: string;
  readonly detail: string;
}

export interface IntegrationFaq {
  readonly question: string;
  readonly answer: string;
}

export interface IntegrationPageSpec {
  readonly slug: string;
  readonly name: string;
  readonly category: IntegrationCategory;
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly eyebrow: string;
  readonly summary: string;
  readonly answerFirst: string;
  readonly setupSteps: readonly IntegrationSetupStep[];
  readonly examplePrompts: readonly string[];
  readonly capabilities: readonly IntegrationCapability[];
  readonly faqs: readonly IntegrationFaq[];
  readonly relatedSlugs: readonly string[];
}

export interface IntegrationsHubCopy {
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly eyebrow: string;
  readonly h1: string;
  readonly subtitle: string;
  readonly answerFirst: string;
  readonly endpointLabel: string;
  readonly endpointUrl: string;
  readonly docsUrl: string;
  readonly skillDocsUrl: string;
  readonly categoryLabels: Readonly<Record<IntegrationCategory, string>>;
  readonly categoryDescriptions: Readonly<Record<IntegrationCategory, string>>;
  readonly quickStartNote: string;
  readonly faqs: readonly IntegrationFaq[];
}

export const MCP_ENDPOINT = "https://mcp.conthunt.app/mcp" as const;
export const MCP_SERVER_ROOT = "https://mcp.conthunt.app" as const;

export const INTEGRATIONS_HUB: IntegrationsHubCopy = {
  seoTitle: "ContHunt Integrations: Hosted MCP for Video Research",
  metaDescription:
    "Connect ContHunt hosted MCP server (mcp.conthunt.app/mcp) to Claude, Claude Code, Cursor, Codex, ChatGPT, Gemini, n8n, Zapier, and autonomous AI agents.",
  eyebrow: "Integrations & MCP",
  h1: "Connect ContHunt to every AI assistant, coding agent, and workflow.",
  subtitle:
    "One hosted Streamable HTTP MCP server for TikTok, Instagram Reels, and YouTube Shorts research — included on every paid ContHunt plan starting at $25/mo billed yearly ($29/mo monthly), with browser OAuth sign-in and no API keys to paste into chat.",
  answerFirst:
    "ContHunt exposes a single hosted Model Context Protocol (MCP) server at https://mcp.conthunt.app/mcp (also reachable at https://mcp.conthunt.app). Once connected and signed in through OAuth, any compatible client — including Claude, Claude Code, Cursor, Codex, ChatGPT, Gemini CLI, n8n, Zapier, and OpenClaw agents — can search public short-form videos across TikTok, Instagram Reels, and YouTube Shorts, inspect creator profiles, query saved boards via SQL, analyze individual videos, and run Deep Search investigations.",
  endpointLabel: "Hosted MCP endpoint",
  endpointUrl: MCP_ENDPOINT,
  docsUrl: "/docs/integrations/mcp",
  skillDocsUrl: "/docs/integrations/skill",
  categoryLabels: {
    "platform-mcp": "Platform MCP Servers",
    "ai-assistant": "AI Assistants",
    "coding-agent": "Coding Agents & IDEs",
    automation: "Workflow & Agent Automation",
  },
  categoryDescriptions: {
    "platform-mcp":
      "Platform-focused guides for querying TikTok, Instagram Reels, and YouTube Shorts through ContHunt unified hosted MCP endpoint.",
    "ai-assistant":
      "Connect ContHunt directly inside conversational AI workspaces so you can research hooks, outliers, and saved boards without leaving chat.",
    "coding-agent":
      "Wire ContHunt into terminal and IDE coding agents to turn short-form video evidence into creative briefs, landing pages, and data scripts.",
    automation:
      "Trigger repeatable short-form research and board audits from MCP-capable workflow runners and autonomous agent frameworks.",
  },
  quickStartNote:
    "Hosted MCP access is included on Pro ($25/mo yearly / $29/mo monthly), Creator ($63/mo yearly / $79/mo monthly), and Research ($119/mo yearly / $149/mo monthly) plans, each with a 7-day free trial. Searches and analyses draw from your normal monthly Hunt and AI credit allowances.",
  faqs: [
    {
      question: "Do I need a separate API key or paid add-on to use ContHunt MCP?",
      answer:
        "No. Hosted MCP access is included on all ContHunt paid plans starting with Pro ($25/mo billed yearly or $29/mo monthly) and during the 7-day free trial. Authentication uses standard OAuth sign-in in your browser, so you never paste raw tokens into prompts.",
    },
    {
      question: "Should I use https://mcp.conthunt.app or https://mcp.conthunt.app/mcp?",
      answer:
        "Both URLs point to the same Cloudflare-hosted, OAuth-protected Streamable HTTP MCP server. Use https://mcp.conthunt.app/mcp for clients that expect an explicit /mcp path, or https://mcp.conthunt.app as shown in our CLI installation tabs.",
    },
    {
      question: "Which tools are available once ContHunt MCP is connected?",
      answer:
        "Connected clients gain access to live short-form discovery (search, creator, video, trending), board management (boards, insights), SQL reads over your saved evidence (query_saved_data), single-video analysis (analyze_video, analyze_long_video), multi-video Deep Search (deep_search), report retrieval (files), media access (download), and credit checks (whoami).",
    },
    {
      question: "Does connecting ContHunt MCP share my login across different apps?",
      answer:
        "No. Each client stores its own OAuth session separately. Adding ContHunt in Cursor does not sign Claude Code or Gemini CLI in — complete the browser sign-in once in each app you use.",
    },
  ],
} as const;

export const INTEGRATION_PAGES: readonly IntegrationPageSpec[] = [
  {
    slug: "mcp-tiktok",
    name: "TikTok MCP Server",
    category: "platform-mcp",
    seoTitle: "TikTok MCP Server for AI Agents | ContHunt",
    metaDescription:
      "Connect ContHunt hosted TikTok MCP server (mcp.conthunt.app/mcp) to Claude, Cursor, Codex, and AI agents to search public TikTok videos, creators, hooks, and saved boards.",
    h1: "Hosted TikTok MCP server for AI agents and content research.",
    eyebrow: "Platform MCP · TikTok",
    summary:
      "Give Claude, Cursor, Codex, ChatGPT, or custom agents live read access to public TikTok search results, creator profiles, engagement metrics, transcripts, and Deep Search reports through one hosted MCP endpoint.",
    answerFirst:
      "ContHunt hosted MCP server at https://mcp.conthunt.app/mcp works as a ready-to-use TikTok MCP server with zero local scraping setup. After signing in through OAuth, your agent can call search, creator, video, analyze_video, deep_search, and query_saved_data to discover breakout TikTok videos, inspect hooks and pacing, and save winning references to ContHunt boards.",
    setupSteps: [
      {
        title: "Add the hosted ContHunt MCP server to your client",
        detail:
          "Use the universal add-mcp CLI or your client native MCP command to register https://mcp.conthunt.app/mcp as a Streamable HTTP server.",
        code: "npx add-mcp https://mcp.conthunt.app/mcp --name conthunt",
      },
      {
        title: "Complete browser OAuth sign-in",
        detail:
          "Approve the first authentication prompt from your agent and sign in with your ContHunt account (Pro, Creator, Research, or active 7-day trial). No TikTok cookies or third-party scraper keys are required.",
      },
      {
        title: "Install the optional ContHunt Agent Skill",
        detail:
          "Add the ContHunt skill from https://conthunt.app/docs/integrations/skill so your agent automatically reuses saved SQL evidence before spending new Hunt credits and formats citations as ContHunt workspace links.",
      },
      {
        title: "Run a scoped TikTok search and save winners to a board",
        detail:
          "Start with a focused keyword query restricted to TikTok and a recent date window (for example, last 30 days), inspect returned view and interaction metrics, then run analyze_video or deep_search on standout clips.",
      },
    ],
    examplePrompts: [
      "Search TikTok for \"UGC skincare hook\" posted in the last 30 days, sort by views, and list the top 10 public videos with their view counts and like-to-view ratios.",
      "Look up the public TikTok profile @handle using ContHunt creator lookup and flag any recent video performing above 3x the account median views.",
      "Analyze this TikTok URL with ContHunt analyze_video and break down the opening 3-second visual hook, spoken hook, pacing beats, and CTA.",
      "Query my saved ContHunt TikTok boards with SQL to find every video saved in my Q4 SaaS hooks board that has more than 100,000 views.",
      "Run a ContHunt Deep Search on TikTok clips explaining cold plunge benefits from the last 60 days and summarize the recurring hook structures with citations.",
    ],
    capabilities: [
      {
        title: "Keyword & Top TikTok discovery",
        detail:
          "Run natural-language creator queries with explicit publication date filters using the search tool, billed at 1 Hunt credit per platform query.",
      },
      {
        title: "Public creator audits on demand",
        detail:
          "Pull recent public TikTok posts and baseline performance via the creator tool to separate repeatable formats from one-off viral spikes.",
      },
      {
        title: "Frame-aware video & hook analysis",
        detail:
          "Inspect individual TikTok links with analyze_video to extract spoken hooks, narrative structure, visual transitions, and conversion angles without manual scrubbing.",
      },
      {
        title: "Persistent boards & SQL querying",
        detail:
          "Save high-performing clips into ContHunt boards and query your historical TikTok research at zero search credit cost via query_saved_data.",
      },
    ],
    faqs: [
      {
        question: "Does ContHunt TikTok MCP require my personal TikTok login or browser cookies?",
        answer:
          "No. ContHunt queries public TikTok data through its hosted infrastructure. You only sign in to your ContHunt account via OAuth.",
      },
      {
        question: "How many credits does a TikTok-only search use?",
        answer:
          "ContHunt bills 1 Hunt credit per platform queried. A TikTok-only keyword search uses 1 Hunt credit; running the same keyword across TikTok, Instagram Reels, and YouTube Shorts uses 3 Hunt credits.",
      },
      {
        question: "Can my agent extract hooks and transcripts from a specific TikTok URL?",
        answer:
          "Yes. Paste the public TikTok URL and ask your agent to ingest it with the video tool and analyze it with analyze_video. AI analysis draws from your monthly AI credit allowance (estimated at 7 AI credits per analyzed video).",
      },
      {
        question: "Can I cross-compare TikTok results with Reels and Shorts in the same MCP session?",
        answer:
          "Yes. Because https://mcp.conthunt.app/mcp covers TikTok, Instagram Reels, and YouTube Shorts in one server, your agent can compare the same topic across all three feeds without switching connectors.",
      },
    ],
    relatedSlugs: ["mcp-instagram-reels", "mcp-youtube-shorts", "claude-code", "cursor"],
  },
  {
    slug: "mcp-instagram-reels",
    name: "Instagram Reels MCP Server",
    category: "platform-mcp",
    seoTitle: "Instagram Reels MCP Server for AI Agents | ContHunt",
    metaDescription:
      "Use ContHunt hosted Instagram Reels MCP server (mcp.conthunt.app/mcp) in Claude, Cursor, Codex, and AI workflows to search public Reels, audit creators, and dissect hooks.",
    h1: "Hosted Instagram Reels MCP server for creator and brand research.",
    eyebrow: "Platform MCP · Instagram Reels",
    summary:
      "Search public Instagram Reels by topic, inspect creator accounts, analyze script structure, and organize swipe-file boards directly from your AI assistant or coding agent.",
    answerFirst:
      "ContHunt hosted MCP endpoint at https://mcp.conthunt.app/mcp serves as a production Instagram Reels MCP server requiring no Meta app review or local scraper maintenance. Once signed in with OAuth, your agent can discover public Reels, audit competitor profiles, save standout formats to boards, and run multi-video Deep Search reports.",
    setupSteps: [
      {
        title: "Register ContHunt MCP in your AI client",
        detail:
          "Point your MCP client to https://mcp.conthunt.app/mcp over Streamable HTTP (or run npx add-mcp for automatic setup).",
        code: "npx add-mcp https://mcp.conthunt.app/mcp --name conthunt",
      },
      {
        title: "Authorize your ContHunt workspace via OAuth",
        detail:
          "Sign in through the browser flow when prompted. All Reels searches, creator lookups, and saved boards sync immediately with agent.conthunt.app.",
      },
      {
        title: "Run scoped Instagram Reels discovery",
        detail:
          "Specify platform: Instagram Reels along with a clear publication window so your agent retrieves fresh creative angles rather than stale evergreen clips.",
      },
      {
        title: "Audit top Reels and push winners to a shared board",
        detail:
          "Use analyze_video to break down high-performing Reels hooks and comment triggers, then save verified references into a named ContHunt board.",
      },
    ],
    examplePrompts: [
      "Search Instagram Reels for \"founder story SaaS launch\" published in the last 45 days and surface the 8 highest-engagement clips.",
      "Pull the recent public Reels for @brandhandle using ContHunt creator lookup and compute which topics outperform the account median view count.",
      "Analyze this Instagram Reel URL and write a beat-by-beat script breakdown covering the opening visual frame, text overlay, spoken hook, and DM keyword CTA.",
      "Check my saved ContHunt board \"Reels DTC Hooks\" via SQL and group the saved Reels by creator and view count.",
      "Run a ContHunt Deep Search across Instagram Reels and TikTok for \"AI workflow demo\" to compare which hooks travel best across both platforms.",
    ],
    capabilities: [
      {
        title: "Cross-account Instagram Reels search",
        detail:
          "Discover public Reels by keyword and niche language without relying on manual hashtag scrolling inside the Instagram mobile app.",
      },
      {
        title: "Creator Reels benchmarking",
        detail:
          "Inspect public creator profiles and recent Reels performance to identify breakout outlier topics before pitching UGC scripts or brand collaborations.",
      },
      {
        title: "Script, hook & CTA deconstruction",
        detail:
          "Use analyze_video on individual Reels to unpack text-on-screen hooks, pacing cadence, comment/DM CTAs, and visual proof points.",
      },
      {
        title: "Zero-credit SQL reuse on saved boards",
        detail:
          "Query previously fetched Instagram Reels metadata and analyses using query_saved_data before triggering new searches.",
      },
    ],
    faqs: [
      {
        question: "Do I need a Meta Developer account or Instagram Graph API approval?",
        answer:
          "No. ContHunt handles public Reels discovery on its hosted backend. Connecting via MCP only requires signing in to your ContHunt account.",
      },
      {
        question: "Can the Reels MCP see private Instagram accounts or Instagram Stories?",
        answer:
          "No. ContHunt works strictly with public short-form videos and public creator profiles. Private accounts and ephemeral Stories are not accessible.",
      },
      {
        question: "Does Instagram Reels MCP work alongside TikTok and YouTube Shorts?",
        answer:
          "Yes. A single search call can target Instagram Reels alone (1 Hunt credit) or all three short-form platforms simultaneously (3 Hunt credits).",
      },
      {
        question: "Where do Reels saved by my AI agent live?",
        answer:
          "Every board created or updated through the boards MCP tool appears directly inside your ContHunt web workspace at https://agent.conthunt.app so teammates can review the same clips visually.",
      },
    ],
    relatedSlugs: ["mcp-tiktok", "mcp-youtube-shorts", "claude", "n8n"],
  },
  {
    slug: "mcp-youtube-shorts",
    name: "YouTube Shorts MCP Server",
    category: "platform-mcp",
    seoTitle: "YouTube Shorts MCP Server for AI Agents | ContHunt",
    metaDescription:
      "Connect ContHunt hosted YouTube Shorts MCP server (mcp.conthunt.app/mcp) to Claude, Cursor, Codex, and Gemini to find breakout Shorts, analyze hooks, and run Deep Search.",
    h1: "Hosted YouTube Shorts MCP server for outlier and format research.",
    eyebrow: "Platform MCP · YouTube Shorts",
    summary:
      "Query public YouTube Shorts, inspect channel upload histories, analyze retention hooks, and compare Shorts formats against TikTok and Reels from one hosted MCP server.",
    answerFirst:
      "ContHunt hosted MCP server at https://mcp.conthunt.app/mcp gives AI agents direct access to public YouTube Shorts discovery, channel lookups, single-video and long-video analysis, SQL queries over saved boards, and multi-video Deep Search — with no YouTube Data API quota management required.",
    setupSteps: [
      {
        title: "Connect the ContHunt hosted MCP server",
        detail:
          "Add https://mcp.conthunt.app/mcp to Claude, Cursor, Codex, Gemini CLI, or any Streamable HTTP MCP client.",
        code: "npx add-mcp https://mcp.conthunt.app/mcp --name conthunt",
      },
      {
        title: "Sign in to your ContHunt account",
        detail:
          "Complete the browser OAuth flow when your client connects for the first time. Your plan Hunt and AI credit allowances apply automatically.",
      },
      {
        title: "Search YouTube Shorts with explicit time windows",
        detail:
          "Ask your agent to run a YouTube Shorts search for your niche topic and inspect titles, view counts, likes, comments, and publish dates.",
      },
      {
        title: "Analyze outlier Shorts or long-form source videos",
        detail:
          "Call analyze_video on breakout Shorts for hook and pacing breakdowns, or use analyze_long_video when repurposing a longer YouTube source video into Shorts angles.",
      },
    ],
    examplePrompts: [
      "Search YouTube Shorts for \"personal finance mistakes\" uploaded in the last 30 days and rank the results by views and like-to-view ratio.",
      "Inspect YouTube channel @channelhandle with ContHunt creator lookup and identify its top 5 Shorts outliers compared to median views.",
      "Analyze this YouTube Short URL with analyze_video and explain how the creator loops the ending back into the opening hook.",
      "Use analyze_long_video on this 20-minute YouTube interview URL and identify the 5 strongest 45-second Shorts clip angles with timestamps.",
      "Compare how \"mechanical keyboard sound test\" performs on YouTube Shorts versus TikTok using ContHunt search and save the best 12 examples to a board.",
    ],
    capabilities: [
      {
        title: "Zero YouTube API quota headaches",
        detail:
          "Skip Google Cloud Console OAuth apps and YouTube Data API daily unit limits — ContHunt manages hosted discovery through one MCP endpoint.",
      },
      {
        title: "Short-form + long-form video analysis",
        detail:
          "Combine analyze_video for 15-60 second Shorts with analyze_long_video when auditing longer YouTube videos or mining podcast episodes for clip ideas.",
      },
      {
        title: "Channel outlier screening",
        detail:
          "Retrieve a channel public uploads and compare individual Shorts against the channel baseline median to isolate high-leverage topics.",
      },
      {
        title: "Cross-platform arbitrage with TikTok & Reels",
        detail:
          "Spot formats winning on TikTok or Instagram Reels that remain under-served on YouTube Shorts inside one unified research thread.",
      },
    ],
    faqs: [
      {
        question: "Can ContHunt MCP analyze both YouTube Shorts and longer YouTube videos?",
        answer:
          "Yes. Use analyze_video for standard short-form clips and analyze_long_video when you need a deeper specialist analysis of a single longer video source.",
      },
      {
        question: "Does ContHunt MCP show YouTube RPM or private YouTube Studio retention graphs?",
        answer:
          "No. ContHunt inspects public video data, metadata, and observable video content (audio, transcript, visuals, pacing). Private creator revenue (RPM) and YouTube Studio audience retention curves are only visible to the channel owner.",
      },
      {
        question: "Can I pair ContHunt MCP with a YouTube keyword or SEO MCP server?",
        answer:
          "Yes. As noted in ContHunt MCP docs, pairing a search-volume/SEO server with ContHunt cross-platform short-form discovery server works cleanly because the tool roles do not overlap.",
      },
      {
        question: "Which ContHunt plans include YouTube Shorts MCP access?",
        answer:
          "All paid plans include hosted MCP access across YouTube Shorts, TikTok, and Instagram Reels, starting with Pro at $25/mo billed yearly ($29/mo monthly) after a 7-day free trial.",
      },
    ],
    relatedSlugs: ["mcp-tiktok", "mcp-instagram-reels", "gemini", "claude"],
  },
  {
    slug: "claude",
    name: "Claude (Claude.ai & Desktop)",
    category: "ai-assistant",
    seoTitle: "ContHunt + Claude MCP Integration: Video Research",
    metaDescription:
      "Connect ContHunt hosted MCP connector (mcp.conthunt.app/mcp) to Claude.ai in two clicks. Research TikTok, Instagram Reels, and YouTube Shorts hooks directly in Claude.",
    h1: "Connect ContHunt to Claude for live short-form video research.",
    eyebrow: "AI Assistant · Claude",
    summary:
      "Add ContHunt as a custom remote MCP connector inside Claude.ai so Claude can search TikTok, Instagram Reels, and YouTube Shorts, query your saved boards, and draft scripts backed by real video evidence.",
    answerFirst:
      "To connect ContHunt to Claude.ai, open Customize → Connectors → Add custom connector, name it ContHunt, paste https://mcp.conthunt.app/mcp (or https://mcp.conthunt.app), and complete OAuth sign-in. Claude immediately gains tools to search public short-form videos, audit creators, query saved boards via SQL, analyze hooks, and launch Deep Search investigations.",
    setupSteps: [
      {
        title: "Open Connectors in Claude.ai",
        detail:
          "In Claude, navigate to Customize → Connectors → Add custom connector, or open ContHunt pre-filled Claude connector link from https://conthunt.app/docs/integrations/mcp.",
      },
      {
        title: "Enter the ContHunt MCP server URL",
        detail:
          "Set the connector name to ContHunt and paste the hosted Streamable HTTP server URL below.",
        code: "https://mcp.conthunt.app/mcp",
      },
      {
        title: "Sign in to ContHunt via OAuth",
        detail:
          "Click Connect and finish the browser sign-in using the ContHunt account where your boards and credits live. You never need to copy or paste an API key.",
      },
      {
        title: "Verify with a small niche lookup",
        detail:
          "Ask Claude to check your account status with whoami or run one targeted search across TikTok, Reels, and Shorts, then confirm the saved board shows up at agent.conthunt.app.",
      },
    ],
    examplePrompts: [
      "Use ContHunt to find 10 recent TikTok and Instagram Reels videos about \"AI note-taking app\" from the last 30 days and summarize the top 3 hook patterns.",
      "Check my existing ContHunt boards with query_saved_data and tell me which saved clips have the highest like-to-view ratio.",
      "Analyze these 3 competitor TikTok URLs in ContHunt and draft a 5-script UGC test batch for our brand using only verified hooks from the analysis.",
      "Run a ContHunt Deep Search on \"B2B founder LinkedIn vs TikTok demos\" and return a cited creative strategy brief.",
      "Look up @creatorhandle on TikTok and Reels via ContHunt and recommend 3 collaboration concepts tailored to their winning formats.",
    ],
    capabilities: [
      {
        title: "Zero-code browser connector setup",
        detail:
          "Works directly inside Claude.ai web and desktop apps using Anthropic custom remote MCP connectors — no terminal or local config file required.",
      },
      {
        title: "Evidence-backed scriptwriting in Claude",
        detail:
          "Ground Claude hook drafts and creative briefs in real analyzed videos and saved board evidence instead of generic LLM brainstorming.",
      },
      {
        title: "Live Deep Search reports with ContHunt citations",
        detail:
          "Delegate multi-video pattern analysis to ContHunt hosted Deep Search specialist and review the cited report right inside your Claude conversation.",
      },
      {
        title: "Board-first credit discipline",
        detail:
          "Claude can inspect saved searches and boards via SQL (query_saved_data) before running new paid discovery calls, stretching your monthly Hunt credits.",
      },
    ],
    faqs: [
      {
        question: "Which Claude plans support custom remote MCP connectors?",
        answer:
          "Custom remote MCP connectors require a Claude plan that includes Connectors support (check Anthropic current plan documentation). On the ContHunt side, MCP is included on Pro, Creator, Research, and the 7-day trial.",
      },
      {
        question: "Can I use ContHunt in both Claude.ai and Claude Code?",
        answer:
          "Yes, though each app stores its own OAuth session separately. Connect ContHunt once in Claude.ai Connectors and separately via claude mcp add inside Claude Code.",
      },
      {
        question: "Why did opening https://mcp.conthunt.app/mcp in my browser show an error?",
        answer:
          "The MCP URL is an authenticated protocol endpoint for MCP clients, not a webpage. Browser GET requests return an HTTP 401 or 405 status by design — paste the URL inside Claude custom connector dialog instead.",
      },
      {
        question: "Does Claude automatically save videos to my ContHunt boards?",
        answer:
          "Only when you ask it to. Tell Claude the board name (or ask it to create a new board) and it will call the boards tool so your saved swipe file stays synced at agent.conthunt.app.",
      },
    ],
    relatedSlugs: ["claude-code", "chatgpt", "mcp-tiktok", "mcp-instagram-reels"],
  },
  {
    slug: "claude-code",
    name: "Claude Code",
    category: "coding-agent",
    seoTitle: "ContHunt + Claude Code MCP Setup: Video Research",
    metaDescription:
      "Add ContHunt hosted MCP server to Claude Code with one command. Research TikTok, Instagram Reels, and YouTube Shorts outliers and generate briefs from your terminal.",
    h1: "Add ContHunt MCP to Claude Code in one terminal command.",
    eyebrow: "Coding Agent · Claude Code",
    summary:
      "Wire TikTok, Instagram Reels, and YouTube Shorts intelligence straight into your Claude Code terminal workflow — ideal for growth engineers, indie hackers, and automated content pipelines.",
    answerFirst:
      "Connect ContHunt to Claude Code by running `claude mcp add --transport http conthunt https://mcp.conthunt.app/mcp`, then running `/mcp` inside Claude Code to finish browser OAuth sign-in. Pair it with the ContHunt Agent Skill so Claude Code knows when to reuse SQL evidence versus run fresh searches or Deep Search.",
    setupSteps: [
      {
        title: "Register the remote HTTP MCP server",
        detail:
          "Run the official Claude Code MCP add command in your terminal (matches https://conthunt.app/docs/integrations/mcp).",
        code: "claude mcp add --transport http conthunt https://mcp.conthunt.app/mcp",
      },
      {
        title: "Authenticate inside Claude Code",
        detail:
          "Launch Claude Code, type /mcp, select conthunt, and complete the browser OAuth login for your ContHunt account.",
        code: "/mcp",
      },
      {
        title: "Install the ContHunt Skill for consistent workflows",
        detail:
          "Add the ContHunt skill from https://conthunt.app/docs/integrations/skill so Claude Code automatically follows board-first SQL reads, explicit date windows, and verified ContHunt citations.",
      },
      {
        title: "Pipe short-form research directly into local repo files",
        detail:
          "Ask Claude Code to search a niche, analyze top videos, and save structured markdown briefs, hook libraries, or CSV datasets directly inside your project repository.",
      },
    ],
    examplePrompts: [
      "Using ContHunt MCP, search TikTok and Reels for \"AI coding workflow\" from the last 30 days, analyze the top 5 outliers, and write a brief to docs/short-form-brief.md.",
      "Run query_saved_data on my ContHunt workspace to export all saved videos in my \"Product Demos\" board into a local JSON file.",
      "Look up 3 competitor founder accounts via ContHunt creator lookup and compare their posting cadence and median views in a markdown table.",
      "Launch a ContHunt Deep Search on \"developer tool launch Reels\" and summarize the winning first-3-second visual demos.",
      "Check my remaining ContHunt Hunt and AI credits via whoami before running a 3-platform search batch.",
    ],
    capabilities: [
      {
        title: "Repo-native content intelligence",
        detail:
          "Turn live TikTok, Reels, and Shorts research directly into markdown docs, landing-page copy, creative briefs, or structured TypeScript/JSON files inside your codebase.",
      },
      {
        title: "Repeatable CLI + Skill governance",
        detail:
          "Combine ContHunt MCP with CLAUDE.md instructions and the ContHunt skill so your coding agent respects credit budgets and checks saved data before running new searches.",
      },
      {
        title: "SQL-first evidence inspection",
        detail:
          "Query previously captured search runs, creator pulls, and video analyses through query_saved_data right from the terminal.",
      },
      {
        title: "Cross-platform launch research",
        detail:
          "Audit how similar developer tools, SaaS products, or consumer apps present demos across TikTok, Instagram Reels, and YouTube Shorts before recording your own launch clips.",
      },
    ],
    faqs: [
      {
        question: "Does Claude Code need a local Node or Python MCP server process for ContHunt?",
        answer:
          "No. ContHunt runs as a hosted Streamable HTTP MCP server at https://mcp.conthunt.app/mcp, so there is nothing to clone, compile, or keep running locally.",
      },
      {
        question: "What if /mcp shows ContHunt connected but searches fail?",
        answer:
          "Run /mcp again to verify OAuth login completed cleanly, and call whoami to confirm your ContHunt account has active Hunt/AI credits. Remember that closing the browser login tab early leaves the server unauthenticated.",
      },
      {
        question: "Can I scope ContHunt MCP to one project or user-wide in Claude Code?",
        answer:
          "Yes. Pass Claude Code standard scope flag (such as --scope user or --scope project) when running claude mcp add depending on whether you want ContHunt available across all repositories.",
      },
      {
        question: "Can Claude Code run Deep Search while I keep working?",
        answer:
          "Yes. Deep Search runs as a persistent hosted specialist on ContHunt infrastructure, returning a thread/execution handle that Claude Code can inspect and read via the files tool once complete.",
      },
    ],
    relatedSlugs: ["claude", "cursor", "codex", "openclaw-agents"],
  },
  {
    slug: "cursor",
    name: "Cursor",
    category: "coding-agent",
    seoTitle: "ContHunt + Cursor MCP Integration: Video Research",
    metaDescription:
      "Install ContHunt hosted MCP server in Cursor via one-click deeplink or ~/.cursor/mcp.json. Search TikTok, Instagram Reels, and YouTube Shorts without leaving your IDE.",
    h1: "Use ContHunt MCP inside Cursor for data-backed growth engineering.",
    eyebrow: "Coding Agent · Cursor",
    summary:
      "Add ContHunt to ~/.cursor/mcp.json (or use the one-click Cursor deeplink in our docs) to pull live TikTok, Reels, and Shorts research directly into Cursor Agent chat.",
    answerFirst:
      "To integrate ContHunt with Cursor, add `{\"mcpServers\":{\"conthunt\":{\"url\":\"https://mcp.conthunt.app/mcp\"}}}` to `~/.cursor/mcp.json` (or click the Install in Cursor deeplink at https://conthunt.app/docs/integrations/mcp) and complete the OAuth browser login. Cursor Agent can then search short-form videos, inspect creators, run SQL over saved boards, and generate content assets grounded in real clips.",
    setupSteps: [
      {
        title: "Add ContHunt to ~/.cursor/mcp.json",
        detail:
          "Open your global Cursor MCP configuration file (~/.cursor/mcp.json) and add the ContHunt remote server entry, or use the one-click Install in Cursor button on /docs/integrations/mcp.",
        code: "{\n  \"mcpServers\": {\n    \"conthunt\": {\n      \"url\": \"https://mcp.conthunt.app/mcp\"\n    }\n  }\n}",
      },
      {
        title: "Reload MCP servers and sign in",
        detail:
          "Open Cursor Settings → MCP, confirm the conthunt server appears, and complete the browser OAuth sign-in when Cursor prompts you.",
      },
      {
        title: "Test in Cursor Agent mode",
        detail:
          "Ask Cursor Agent to run a small public search or check your saved ContHunt boards so you can confirm tool calls succeed before running larger batches.",
      },
      {
        title: "Combine with Cursor Rules for growth workflows",
        detail:
          "Optionally add the ContHunt skill guidance to your workspace rules so Cursor checks saved SQL boards before spending new Hunt credits.",
      },
    ],
    examplePrompts: [
      "Search TikTok and YouTube Shorts via ContHunt for \"mobile app onboarding demo\" from the last 30 days and write a competitive hook matrix in docs/onboarding-hooks.md.",
      "Query my saved ContHunt boards using query_saved_data and generate a TypeScript fixture of the top 10 recurring hook categories.",
      "Analyze these 2 viral Instagram Reels URLs with ContHunt and adapt the pacing into a 30-second product launch script for our homepage hero video.",
      "Look up @competitorhandle on TikTok using ContHunt creator lookup and summarize which product angles get the highest share-to-view ratios.",
      "Run a ContHunt Deep Search on \"fitness app UGC ads\" and output a structured markdown creative brief for our video editors.",
    ],
    capabilities: [
      {
        title: "Global IDE setup in 3 lines of JSON",
        detail:
          "Configure once in ~/.cursor/mcp.json with zero local binaries, environment secrets, or Docker containers to manage.",
      },
      {
        title: "Direct research-to-code workflows",
        detail:
          "Turn viral short-form hooks, audience objections, and creator phrasing directly into landing page headlines, onboarding copy, or programmatic SEO tables inside Cursor.",
      },
      {
        title: "Saved board SQL inspection",
        detail:
          "Pull structured records from your existing ContHunt boards and previous Deep Search runs using query_saved_data.",
      },
      {
        title: "Multi-platform short-form coverage",
        detail:
          "Inspect TikTok, Instagram Reels, and YouTube Shorts side by side without leaving Cursor Agent.",
      },
    ],
    faqs: [
      {
        question: "Should I put the ContHunt config in ~/.cursor/mcp.json or a project .cursor/mcp.json?",
        answer:
          "Using ~/.cursor/mcp.json makes ContHunt available across every workspace in Cursor. You can also place it in a project-level .cursor/mcp.json if you want team-shared configuration without committing any secrets (since auth happens via per-user OAuth).",
      },
      {
        question: "Does Cursor share my ContHunt login with Claude Code or VS Code?",
        answer:
          "No. Each editor maintains its own OAuth session. Sign in once in Cursor and separately in any other IDE or CLI you use.",
      },
      {
        question: "Why does Cursor need Agent mode to use ContHunt MCP?",
        answer:
          "Cursor invokes MCP tools through its Agent/Composer tool-calling mode rather than plain inline autocomplete. Switch to Agent mode when prompting ContHunt searches or analyses.",
      },
      {
        question: "Does ContHunt MCP work in VS Code too?",
        answer:
          "Yes. In VS Code, add `\"conthunt\": { \"type\": \"http\", \"url\": \"https://mcp.conthunt.app/mcp\" }` under `mcp.servers` and complete the OAuth login.",
      },
    ],
    relatedSlugs: ["claude-code", "codex", "mcp-tiktok", "openclaw-agents"],
  },
  {
    slug: "codex",
    name: "OpenAI Codex CLI",
    category: "coding-agent",
    seoTitle: "ContHunt + Codex MCP Setup: Video Research in CLI",
    metaDescription:
      "Connect ContHunt hosted MCP server to OpenAI Codex CLI with codex mcp add and codex mcp login. Search TikTok, Reels, and Shorts directly from Codex.",
    h1: "Connect ContHunt MCP to OpenAI Codex CLI in two commands.",
    eyebrow: "Coding Agent · Codex",
    summary:
      "Give OpenAI Codex CLI live access to TikTok, Instagram Reels, and YouTube Shorts search, creator audits, saved SQL boards, and Deep Search reports with native OAuth login.",
    answerFirst:
      "To use ContHunt inside OpenAI Codex CLI, run `codex mcp add conthunt --url https://mcp.conthunt.app/mcp` followed by `codex mcp login conthunt`. Once authenticated, Codex can search short-form videos across TikTok, Instagram Reels, and YouTube Shorts, inspect saved ContHunt boards with SQL, analyze clips, and trigger Deep Search investigations.",
    setupSteps: [
      {
        title: "Add ContHunt to Codex CLI",
        detail:
          "Register the hosted Streamable HTTP server with the exact codex mcp add command.",
        code: "codex mcp add conthunt --url https://mcp.conthunt.app/mcp",
      },
      {
        title: "Authenticate with codex mcp login",
        detail:
          "Run the login command and approve the OAuth flow in your browser using your ContHunt account.",
        code: "codex mcp login conthunt",
      },
      {
        title: "Optional: install the ContHunt Skill",
        detail:
          "Install the ContHunt agent skill from https://conthunt.app/docs/integrations/skill so Codex automatically prioritizes saved SQL evidence, honors explicit date windows, and cites ContHunt workspace URLs.",
      },
      {
        title: "Run your first short-form research task",
        detail:
          "Start a Codex session and ask for a bounded niche search, creator audit, or SQL query against an existing board.",
      },
    ],
    examplePrompts: [
      "Use ContHunt to check my credit balance with whoami, then search TikTok and Reels for \"standing desk setup\" posted in the last 30 days.",
      "Query my saved ContHunt searches with query_saved_data and write a CSV summary of the top 20 videos by engagement rate.",
      "Inspect @creatorhandle on YouTube Shorts via ContHunt and flag which video formats beat the channel median views by 3x or more.",
      "Analyze this TikTok video URL in ContHunt and generate 5 hook variations formatted for our creative testing spreadsheet.",
      "Run a ContHunt Deep Search on \"B2B SaaS demo Reels\" and save the resulting report summary into reports/demo-reels.md.",
    ],
    capabilities: [
      {
        title: "Native Codex OAuth workflow",
        detail:
          "Built directly for `codex mcp add` and `codex mcp login` — no manual bearer tokens or custom proxy scripts needed.",
      },
      {
        title: "Automated research-to-artifact pipelines",
        detail:
          "Let Codex gather short-form evidence, run SQL aggregations across saved boards, and generate markdown reports, scripts, or JSON datasets in one session.",
      },
      {
        title: "Explicit credit & scope control",
        detail:
          "Use `whoami` and `query_saved_data` before new discovery calls so long Codex runs stay predictable and inside your monthly credit budget.",
      },
      {
        title: "Full 3-platform coverage",
        detail:
          "Query TikTok, Instagram Reels, and YouTube Shorts from one unified server configuration.",
      },
    ],
    faqs: [
      {
        question: "Do I need to re-run codex mcp login on every Codex session?",
        answer:
          "No. Codex persists your OAuth session for the conthunt server across chats on that machine. You only re-run `codex mcp login conthunt` if your session expires or you sign out.",
      },
      {
        question: "Can I add ContHunt to Codex using a natural-language prompt instead of CLI flags?",
        answer:
          "Yes. As listed in /docs/integrations/mcp, you can paste `Add an MCP server named ContHunt at https://mcp.conthunt.app/mcp and sign in when asked.` directly into Codex.",
      },
      {
        question: "What happens if Codex calls ContHunt before I run codex mcp login?",
        answer:
          "Unauthenticated calls return HTTP 401 and will fail rather than return empty data. Complete `codex mcp login conthunt` first, then retry the research prompt.",
      },
      {
        question: "Does Codex get access to Deep Search and long-video analysis?",
        answer:
          "Yes. All hosted ContHunt MCP tools — including `deep_search`, `analyze_video`, `analyze_long_video`, `boards`, and `files` — are exposed to Codex according to your ContHunt plan tier.",
      },
    ],
    relatedSlugs: ["claude-code", "cursor", "chatgpt", "gemini"],
  },
  {
    slug: "chatgpt",
    name: "ChatGPT",
    category: "ai-assistant",
    seoTitle: "ContHunt + ChatGPT MCP Integration: Video Research",
    metaDescription:
      "Connect ContHunt hosted MCP server (mcp.conthunt.app/mcp) to ChatGPT via custom remote MCP connectors to search TikTok, Instagram Reels, and YouTube Shorts.",
    h1: "Bring live TikTok, Reels, and Shorts research into ChatGPT.",
    eyebrow: "AI Assistant · ChatGPT",
    summary:
      "Connect ContHunt hosted Streamable HTTP MCP endpoint to ChatGPT custom MCP connector support so ChatGPT can pull real short-form video metrics, hooks, and saved boards directly into your chats.",
    answerFirst:
      "On ChatGPT plans that support custom remote MCP connectors (Connectors / Developer Mode), add a new remote MCP server named ContHunt pointing to https://mcp.conthunt.app/mcp and sign in with your ContHunt account via OAuth. ChatGPT can then run live TikTok, Instagram Reels, and YouTube Shorts searches, analyze specific video URLs, and inspect your saved ContHunt boards.",
    setupSteps: [
      {
        title: "Enable custom MCP connectors in ChatGPT settings",
        detail:
          "Open ChatGPT Settings → Connectors (or Apps & Connectors → Developer Mode on supported ChatGPT plans) and choose Create / Add custom MCP connector.",
      },
      {
        title: "Point the connector to ContHunt hosted MCP URL",
        detail:
          "Name the connector ContHunt, select OAuth authentication, and enter the Streamable HTTP endpoint below.",
        code: "https://mcp.conthunt.app/mcp",
      },
      {
        title: "Complete OAuth sign-in with your ContHunt account",
        detail:
          "Approve access in the ContHunt browser window so ChatGPT connects to your active workspace and saved boards.",
      },
      {
        title: "Enable the ContHunt connector in a new chat",
        detail:
          "Toggle ContHunt on in your chat tools menu and start with a bounded niche search, creator lookup, or URL analysis.",
      },
    ],
    examplePrompts: [
      "Use ContHunt to find the top 10 TikTok videos from the last 30 days about \"meal prep for busy founders\" and break down their opening hooks.",
      "Pull my saved ContHunt board \"Q4 Competitor Ads\" and summarize the 4 most common creative structures across those videos.",
      "Analyze this Instagram Reel URL with ContHunt and turn its pacing structure into a shot list for our skincare serum.",
      "Compare how \"cold email teardown\" performs across YouTube Shorts and TikTok using ContHunt search.",
      "Run a ContHunt Deep Search on \"AI calendar app demos\" and list the top objections viewers raise and how creators answer them.",
    ],
    capabilities: [
      {
        title: "Real short-form evidence inside ChatGPT",
        detail:
          "Replace guesswork and outdated web snippets with live public video metrics, verified creator histories, and real video analyses.",
      },
      {
        title: "OAuth-protected remote MCP",
        detail:
          "ContHunt Cloudflare-hosted MCP endpoint supports standard OAuth discovery (`/.well-known/oauth-protected-resource`) for smooth connector onboarding.",
      },
      {
        title: "Seamless handoff to ContHunt boards",
        detail:
          "Save standout videos discovered in ChatGPT straight into visual boards inside agent.conthunt.app for creative directors and editors.",
      },
      {
        title: "Deep Search & script iteration",
        detail:
          "Kick off multi-video pattern research in ContHunt, then iterate on hook variations and shot lists inside the same ChatGPT conversation.",
      },
    ],
    faqs: [
      {
        question: "Which ChatGPT plans allow adding a custom MCP server?",
        answer:
          "OpenAI custom remote MCP connector availability depends on your ChatGPT tier and workspace admin settings (check OpenAI current Connectors documentation). If your ChatGPT workspace restricts custom MCP servers, you can still run research in agent.conthunt.app or connect via Codex CLI, Claude, or Cursor.",
      },
      {
        question: "Does ChatGPT use my ContHunt credits when running searches?",
        answer:
          "Yes. Every ContHunt tool call made by ChatGPT draws from your connected ContHunt plan Hunt and AI credit allowances (Pro starts at $25/mo billed yearly or $29/mo monthly, with a 7-day free trial).",
      },
      {
        question: "Will ChatGPT invent view counts if a call fails?",
        answer:
          "Remind ChatGPT to cite only returned ContHunt tool results and ContHunt workspace links. If an OAuth session expires, reconnect ContHunt in Connectors rather than letting the model guess metrics.",
      },
      {
        question: "Can I use ContHunt in both ChatGPT and Codex CLI?",
        answer:
          "Yes. Both connect to https://mcp.conthunt.app/mcp and share the same underlying ContHunt boards and credit pool once signed into the same account.",
      },
    ],
    relatedSlugs: ["claude", "codex", "gemini", "mcp-tiktok"],
  },
  {
    slug: "gemini",
    name: "Gemini CLI & Gemini Agents",
    category: "ai-assistant",
    seoTitle: "ContHunt + Gemini CLI MCP Setup: Video Research",
    metaDescription:
      "Connect ContHunt hosted MCP server to Gemini CLI with gemini mcp add and /mcp auth conthunt. Research TikTok, Reels, and YouTube Shorts in Gemini.",
    h1: "Connect ContHunt MCP to Gemini CLI for cross-platform video research.",
    eyebrow: "AI Assistant · Gemini",
    summary:
      "Add ContHunt to Gemini CLI with one command and OAuth sign-in to search YouTube Shorts, TikTok, and Instagram Reels, query saved boards, and run Deep Search investigations.",
    answerFirst:
      "Connect ContHunt to Gemini CLI by running `gemini mcp add --transport http -s user conthunt https://mcp.conthunt.app/mcp`, then running `/mcp auth conthunt` inside Gemini CLI to finish browser OAuth sign-in. Gemini immediately gains access to ContHunt short-form search, creator lookup, board SQL, video analysis, and Deep Search tools.",
    setupSteps: [
      {
        title: "Register ContHunt in Gemini CLI",
        detail:
          "Run the user-scoped Streamable HTTP MCP command from ContHunt live MCP documentation.",
        code: "gemini mcp add --transport http -s user conthunt https://mcp.conthunt.app/mcp",
      },
      {
        title: "Authenticate inside Gemini CLI",
        detail:
          "Open Gemini CLI and run the auth command below, then sign in with your ContHunt account in the browser window that opens.",
        code: "/mcp auth conthunt",
      },
      {
        title: "Verify your connection",
        detail:
          "Ask Gemini to call whoami or list your saved ContHunt boards to confirm OAuth authentication is active.",
      },
      {
        title: "Run multi-platform Shorts, TikTok, and Reels research",
        detail:
          "Combine Gemini long-context synthesis with ContHunt structured SQL board reads and Deep Search reports.",
      },
    ],
    examplePrompts: [
      "Use ContHunt to search YouTube Shorts and TikTok for \"home espresso workflow\" over the last 30 days and compare average views per platform.",
      "Query my saved ContHunt boards with query_saved_data and cluster the saved hooks by opening structure.",
      "Look up @channelhandle using ContHunt creator lookup and identify their top 3 Shorts formats to test next.",
      "Analyze this YouTube Short URL with ContHunt analyze_video and extract the hook, visual pacing, and retention loop.",
      "Run a ContHunt Deep Search on \"B2B product teardown short videos\" and write a cited summary report.",
    ],
    capabilities: [
      {
        title: "Two-step Gemini CLI setup",
        detail:
          "Uses native `gemini mcp add --transport http` and `/mcp auth conthunt` commands documented directly on /docs/integrations/mcp.",
      },
      {
        title: "YouTube Shorts + TikTok + Reels in one place",
        detail:
          "Pair Gemini with unified short-form data across all three major vertical video feeds instead of limiting research to YouTube alone.",
      },
      {
        title: "Long-context synthesis over saved evidence",
        detail:
          "Pull full saved boards and Deep Search reports via `query_saved_data` and `files` so Gemini can synthesize dozens of real examples without hallucinating metrics.",
      },
      {
        title: "Shared workspace with agent.conthunt.app",
        detail:
          "Every board and Deep Search report created through Gemini CLI stays accessible in the ContHunt web app.",
      },
    ],
    faqs: [
      {
        question: "What does the -s user flag do in gemini mcp add?",
        answer:
          "The `-s user` flag installs the ContHunt MCP server in your user-level Gemini CLI settings so it is available across every project folder on your machine.",
      },
      {
        question: "Can I use ContHunt with Google Agent Development Kit (ADK) or custom Gemini apps?",
        answer:
          "Yes. Any Gemini framework supporting Streamable HTTP MCP clients with OAuth can connect to https://mcp.conthunt.app/mcp.",
      },
      {
        question: "Why did /mcp auth conthunt fail to finish?",
        answer:
          "Check that the server URL is spelled exactly `https://mcp.conthunt.app/mcp` (or `https://mcp.conthunt.app`), keep the browser tab open until the OAuth callback confirms completion, and re-run `/mcp auth conthunt` without removing the server first.",
      },
      {
        question: "How much does ContHunt MCP cost with Gemini CLI?",
        answer:
          "MCP access is included with every paid ContHunt plan — Pro starts at $25/mo billed yearly ($29/mo monthly) with a 7-day free trial.",
      },
    ],
    relatedSlugs: ["mcp-youtube-shorts", "claude-code", "codex", "openclaw-agents"],
  },
  {
    slug: "n8n",
    name: "n8n",
    category: "automation",
    seoTitle: "ContHunt + n8n MCP Integration: Video Workflows",
    metaDescription:
      "Connect ContHunt hosted MCP server (mcp.conthunt.app/mcp) to n8n AI Agent workflows using n8n MCP Client Tool node to automate TikTok, Reels, and Shorts intelligence.",
    h1: "Automate TikTok, Reels, and Shorts research in n8n via MCP.",
    eyebrow: "Automation · n8n",
    summary:
      "Wire ContHunt hosted Streamable HTTP MCP endpoint into n8n AI Agent and MCP Client Tool nodes to run scheduled niche scans, creator checks, and board digests into Slack, Notion, or Sheets.",
    answerFirst:
      "ContHunt connects to n8n through n8n built-in MCP Client Tool node using Streamable HTTP at https://mcp.conthunt.app/mcp — no custom scraper nodes or brittle third-party scraping glue required. Attach the MCP Client Tool to an n8n AI Agent node, schedule it on a cron trigger, and route structured short-form insights straight to Slack, Notion, Airtable, or email.",
    setupSteps: [
      {
        title: "Add an AI Agent + MCP Client Tool node in n8n",
        detail:
          "Create a workflow with a Schedule or Webhook trigger, connect an n8n AI Agent node (backed by your chosen LLM), and attach n8n MCP Client Tool node.",
      },
      {
        title: "Configure Streamable HTTP for ContHunt MCP",
        detail:
          "Set the MCP Client Tool transport to HTTP Streamable and point the endpoint URL to ContHunt hosted MCP server.",
        code: "https://mcp.conthunt.app/mcp",
      },
      {
        title: "Complete OAuth / Bearer credential setup",
        detail:
          "Authenticate the MCP Client Tool against ContHunt OAuth-protected resource endpoint (https://mcp.conthunt.app/.well-known/oauth-protected-resource) using your ContHunt account.",
      },
      {
        title: "Route outputs to Slack, Notion, or Google Sheets",
        detail:
          "Instruct the agent to read saved ContHunt boards first, run bounded keyword or creator checks, and output clean JSON for downstream n8n nodes (Slack digest, Notion database row, or Google Sheet).",
      },
    ],
    examplePrompts: [
      "Every Monday at 8 AM, search TikTok and Reels for \"AI productivity app\" from the last 7 days, pick the top 5 clips by views, and post a concise Slack digest with ContHunt links.",
      "Check 5 competitor handles via ContHunt creator lookup, flag any new video exceeding 3x median views, and log a new row in our Notion creative tracker.",
      "Read our ContHunt \"Weekly Winners\" board via query_saved_data and send a Friday creative summary email to our UGC editors.",
      "When a teammate drops a TikTok or Reel URL into a Slack channel, trigger n8n to run ContHunt analyze_video and reply in-thread with the hook and pacing breakdown.",
      "Check ContHunt credit balance via whoami before running a scheduled multi-platform search batch, and alert Slack if Hunt credits drop below 200.",
    ],
    capabilities: [
      {
        title: "No brittle scraper chains to maintain",
        detail:
          "Replace fragile multi-actor scraping pipelines across TikTok, Instagram, and YouTube with one maintained Streamable HTTP MCP server.",
      },
      {
        title: "Event-driven or scheduled creative intelligence",
        detail:
          "Trigger ContHunt lookups on a weekly cron schedule, a Slack slash command, a Notion status change, or a new client onboarding form.",
      },
      {
        title: "Guardrailed credit usage in automated loops",
        detail:
          "Have your n8n agent check `whoami` and `query_saved_data` before running fresh searches so scheduled workflows never burn credits on duplicate queries.",
      },
      {
        title: "Native n8n downstream formatting",
        detail:
          "Combine ContHunt short-form video intelligence with n8n native connectors for Slack, Discord, Notion, Airtable, HubSpot, and Google Sheets.",
      },
    ],
    faqs: [
      {
        question: "Does ContHunt have a separate native n8n community node, or does it use MCP?",
        answer:
          "ContHunt connects via n8n native MCP Client Tool node over Streamable HTTP (`https://mcp.conthunt.app/mcp`). You do not need to install an unverified third-party community node.",
      },
      {
        question: "Can I self-host n8n and still connect to ContHunt MCP?",
        answer:
          "Yes. Both n8n Cloud and self-hosted n8n instances running a version with Streamable HTTP MCP Client support can connect to https://mcp.conthunt.app/mcp.",
      },
      {
        question: "How do I avoid runaway credit spend in a scheduled n8n workflow?",
        answer:
          "Cap the number of queries in your agent system prompt, pass explicit date windows (such as last 7 days), read saved data with `query_saved_data` first, and avoid running `deep_search` inside high-frequency hourly loops.",
      },
      {
        question: "Can n8n save discovered videos back into ContHunt boards?",
        answer:
          "Yes. Your n8n agent can call ContHunt `boards` tool so automated weekly finds also appear in your visual ContHunt boards at agent.conthunt.app.",
      },
    ],
    relatedSlugs: ["zapier", "openclaw-agents", "mcp-tiktok", "mcp-instagram-reels"],
  },
  {
    slug: "zapier",
    name: "Zapier",
    category: "automation",
    seoTitle: "ContHunt + Zapier MCP: Short-Form Video Workflows",
    metaDescription:
      "Connect ContHunt hosted MCP server (mcp.conthunt.app/mcp) with Zapier Agents and MCP workflows to route TikTok, Reels, and Shorts research into Slack, Notion, and CRMs.",
    h1: "Connect ContHunt to Zapier Agents and MCP workflows.",
    eyebrow: "Automation · Zapier",
    summary:
      "Pair ContHunt hosted MCP server with Zapier Agents or MCP-enabled automation flows to turn short-form video trends and outlier checks into automated team alerts and content tickets.",
    answerFirst:
      "ContHunt integrates with Zapier through hosted remote MCP (`https://mcp.conthunt.app/mcp`) inside MCP-compatible Zapier Agents and AI workflow setups — rather than a legacy trigger-only Zapier connector. Once connected with OAuth, your workflow can query TikTok, Instagram Reels, and YouTube Shorts, inspect saved ContHunt boards, and pass findings into Zapier business apps (Slack, Notion, Asana, ClickUp, HubSpot, or Google Sheets).",
    setupSteps: [
      {
        title: "Open Zapier Agents or your MCP-capable Zapier workflow",
        detail:
          "Create a Zapier Agent (or an AI workflow supporting remote Streamable HTTP MCP servers) for your content or marketing team.",
      },
      {
        title: "Add ContHunt as a remote MCP tool server",
        detail:
          "Enter ContHunt hosted Streamable HTTP endpoint below and authenticate through the OAuth flow with your ContHunt account.",
        code: "https://mcp.conthunt.app/mcp",
      },
      {
        title: "Define the trigger and research scope",
        detail:
          "Trigger the agent on a weekly schedule, a new Slack message, or a new row in Airtable/Google Sheets, specifying exact platforms and date windows.",
      },
      {
        title: "Connect downstream Zapier actions",
        detail:
          "Send ContHunt structured findings (outlier clips, hook takeaways, and ContHunt workspace links) to Slack, Notion, ClickUp, Trello, or Google Docs.",
      },
    ],
    examplePrompts: [
      "When a strategist adds a new competitor handle to our Airtable tracker, run a ContHunt creator lookup and post the top 3 recent outlier videos to #creative-research in Slack.",
      "Every Friday morning, read our ContHunt \"Approved Hooks\" board via query_saved_data and create a summary doc in Google Docs for next week shoot.",
      "When a team member reacts to a TikTok link in Slack, analyze the video with ContHunt analyze_video and log the hook breakdown into our Notion swipe file.",
      "Search TikTok, Reels, and Shorts weekly for our core product keyword and email a digest of new breakout clips to the growth team.",
    ],
    capabilities: [
      {
        title: "No-code bridge into business apps",
        detail:
          "Move short-form research out of siloed tabs and straight into the Slack channels, Notion databases, and project boards your marketing team already checks.",
      },
      {
        title: "Natural-language research instructions",
        detail:
          "Use Zapier Agents to run scoped ContHunt queries and format concise creative briefs without writing custom API parsers.",
      },
      {
        title: "Cross-platform coverage in one connection",
        detail:
          "Query TikTok, Instagram Reels, and YouTube Shorts from a single ContHunt MCP setup instead of wiring separate platform scrapers.",
      },
      {
        title: "Synced visual swipe files",
        detail:
          "Keep ContHunt boards as the single source of truth while Zapier distributes summaries and tasks across your team tools.",
      },
    ],
    faqs: [
      {
        question: "Is ContHunt listed as a legacy Zapier app, or does it connect via MCP?",
        answer:
          "ContHunt connects via its hosted remote MCP server (`https://mcp.conthunt.app/mcp`) rather than a legacy polling-only Zapier app. Check Zapier current MCP client support in your Zapier plan; for visual self-hosted or cloud MCP orchestration today, n8n MCP Client Tool is also a popular pairing.",
      },
      {
        question: "Do I need an enterprise ContHunt tier for automated MCP workflows?",
        answer:
          "No. Hosted MCP access is included on Pro ($25/mo billed yearly / $29/mo monthly), Creator ($63/mo billed yearly / $79/mo monthly), and Research ($119/mo billed yearly / $149/mo monthly). Choose a tier whose monthly Hunt and AI credit allowances match your automation frequency.",
      },
      {
        question: "Can Zapier workflows trigger ContHunt Deep Search?",
        answer:
          "Yes, though Deep Search is best suited for lower-frequency, high-value weekly or campaign briefs rather than high-volume per-message triggers so your AI credits stay predictable.",
      },
      {
        question: "How does authentication work?",
        answer:
          "ContHunt uses standard OAuth sign-in via https://mcp.conthunt.app/.well-known/oauth-protected-resource — you never need to share account passwords.",
      },
    ],
    relatedSlugs: ["n8n", "openclaw-agents", "chatgpt", "claude"],
  },
  {
    slug: "openclaw-agents",
    name: "OpenClaw & Autonomous Agents",
    category: "automation",
    seoTitle: "ContHunt + OpenClaw & AI Agents: Hosted Video MCP",
    metaDescription:
      "Equip OpenClaw, OpenMausBot, Grok Bot, and custom autonomous AI agents with ContHunt hosted MCP server (mcp.conthunt.app/mcp) and official Agent Skill.",
    h1: "Equip OpenClaw and autonomous AI agents with short-form video intelligence.",
    eyebrow: "Automation · Autonomous Agents",
    summary:
      "Give OpenClaw, OpenMausBot, Grok Bot, and custom MCP-native autonomous agents live TikTok, Instagram Reels, and YouTube Shorts discovery plus ContHunt official Agent Skill for disciplined research.",
    answerFirst:
      "Connect ContHunt to OpenClaw or any MCP-compatible autonomous agent runtime by registering the Streamable HTTP server `https://mcp.conthunt.app/mcp` (or running `npx add-mcp https://mcp.conthunt.app/mcp --name conthunt`) and installing the official ContHunt Agent Skill from https://conthunt.app/docs/integrations/skill. The MCP server supplies the live tools, while the Skill teaches autonomous agents how to reuse saved SQL evidence, respect credit caps, and verify citations.",
    setupSteps: [
      {
        title: "Register the hosted MCP server in your agent runtime",
        detail:
          "Use the universal MCP installer or paste the Streamable HTTP URL directly into your OpenClaw / autonomous agent MCP config.",
        code: "npx add-mcp https://mcp.conthunt.app/mcp --name conthunt",
      },
      {
        title: "Install the ContHunt Agent Skill",
        detail:
          "Load the official ContHunt skill from https://conthunt.app/docs/integrations/skill so your autonomous agent automatically knows which ContHunt tool to pick (`query_saved_data` vs `search` vs `deep_search`) without repeating instructions every run.",
        code: "Add an MCP server named ContHunt at https://mcp.conthunt.app/mcp and sign in when asked.",
      },
      {
        title: "Complete one-time OAuth sign-in",
        detail:
          "Authorize the agent against the ContHunt workspace whose boards and monthly credit allowance it should use. ContHunt Research plan ($119/mo yearly) includes 14,000 Hunt credits, 33,500 AI credits, and 25 daily agents for heavy multi-niche autonomous schedules.",
      },
      {
        title: "Verify citations and credit discipline",
        detail:
          "Run a single bounded test job — search one niche, save 3 verified outliers to a board, and inspect the returned ContHunt workspace URLs before scheduling recurring autonomous runs.",
      },
    ],
    examplePrompts: [
      "Check saved ContHunt evidence via query_saved_data first; if we have no data from the last 14 days on \"AI receptionist demos\", run a 3-platform search and save the top 10 outliers to board \"Voice AI Hooks\".",
      "Monitor our 10 tracked competitor handles on TikTok and Reels, compare new clips against each account median views, and write a weekly markdown memo citing exact ContHunt board links.",
      "Delegate a ContHunt Deep Search across our \"Q4 UGC Swipe File\" board to identify which opening 3-second visual formats correlate with the highest share rates.",
      "Check whoami credit balances at the start of every weekly autonomous run and skip new discovery if Hunt credits are below 100.",
      "Analyze a 25-minute founder podcast episode with analyze_long_video and cross-reference winning TikTok hooks in the same niche to propose 5 Shorts cutdowns.",
    ],
    capabilities: [
      {
        title: "MCP Server + Agent Skill architecture",
        detail:
          "The hosted MCP server executes live searches, SQL reads, and Deep Search; the official ContHunt Skill encodes query discipline, citation rules, and retry safety for unattended agents.",
      },
      {
        title: "Built for multi-turn autonomous delegation",
        detail:
          "`deep_search` and `analyze_long_video` run as persistent hosted specialists with native thread/run handles so agents can poll, follow up, and read finished reports via `files` without duplicating paid runs.",
      },
      {
        title: "Verifiable ContHunt citations (zero hallucinated links)",
        detail:
          "Compact entity IDs (`video_...`, `chat_...`, `private_board_...`) map straight to persistent ContHunt UI URLs so humans can audit every clip an autonomous agent recommends.",
      },
      {
        title: "Scales from solo agent to 25 daily agents",
        detail:
          "Start testing on Pro ($25/mo yearly, 2 daily agents) or scale to Creator ($63/mo yearly, 5 daily agents) and Research ($119/mo yearly, 25 daily agents).",
      },
    ],
    faqs: [
      {
        question: "What is the difference between the ContHunt MCP server and the ContHunt Skill?",
        answer:
          "The MCP server (`https://mcp.conthunt.app/mcp`) provides the executable tools (search, creator, boards, SQL, video analysis, Deep Search). The Skill (`/docs/integrations/skill`) is the operating manual that teaches autonomous agents when to reuse saved SQL data, how to pick platforms and date controls, and how to verify citations.",
      },
      {
        question: "Which autonomous agent platforms work with ContHunt MCP?",
        answer:
          "Any runtime supporting remote Streamable HTTP MCP with OAuth — including OpenClaw, OpenMausBot, Grok Build, Grok Bot, Claude Code, Codex CLI, Gemini CLI, Cursor, and custom MCP SDK agents.",
      },
      {
        question: "How do autonomous agents avoid wasting credits on duplicate searches?",
        answer:
          "The ContHunt Skill instructs agents to inspect saved workspace evidence via `query_saved_data` first, set explicit caps and recent publication windows, and reuse existing `request_id` or Deep Search thread handles rather than re-running identical paid jobs.",
      },
      {
        question: "Can multiple autonomous agents share the same ContHunt boards?",
        answer:
          "Yes, when authorized against the same ContHunt account. Agents signed into separate ContHunt accounts keep their boards and credit pools isolated.",
      },
    ],
    relatedSlugs: ["claude-code", "codex", "n8n", "cursor"],
  },
] as const;

export const INTEGRATION_SLUGS: readonly string[] = INTEGRATION_PAGES.map(
  (item) => item.slug,
);

export function getIntegrationBySlug(
  slug: string,
): IntegrationPageSpec | undefined {
  return INTEGRATION_PAGES.find((item) => item.slug === slug);
}
