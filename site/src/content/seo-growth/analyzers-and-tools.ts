/**
 * Content specifications for public account analyzers (Move #2), login-gated creator tools (Move #3),
 * and free no-signup calculators & viral hook generator templates (Move #4).
 * All sample previews are explicitly labeled as illustrative examples with no invented real-creator claims.
 */

export type AnalyzerPlatform = "tiktok" | "instagram" | "youtube";

export interface ToolFaq {
  readonly question: string;
  readonly answer: string;
}

export interface HowItWorksStep {
  readonly step: number;
  readonly title: string;
  readonly detail: string;
}

export interface MetricExplainer {
  readonly name: string;
  readonly formula: string;
  readonly whyItMatters: string;
}

export interface AnalyzerPageSpec {
  readonly slug: string;
  readonly platform: AnalyzerPlatform;
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly subtitle: string;
  readonly answerFirst: string;
  readonly howItWorks: readonly HowItWorksStep[];
  readonly metricsExplained: readonly MetricExplainer[];
  readonly faqs: readonly ToolFaq[];
}

export interface SamplePreviewField {
  readonly label: string;
  readonly value: string;
}

export interface GatedToolSamplePreview {
  readonly disclaimer: string;
  readonly inputExample: string;
  readonly outputTitle: string;
  readonly fields: readonly SamplePreviewField[];
  readonly takeaway: string;
}

export interface GatedToolPageSpec {
  readonly slug: string;
  readonly platform: AnalyzerPlatform;
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly subtitle: string;
  readonly samplePreview: GatedToolSamplePreview;
  readonly freeAccountBenefits: readonly string[];
  readonly faqs: readonly ToolFaq[];
}

export interface FormulaNote {
  readonly name: string;
  readonly formula: string;
  readonly explanation: string;
}

export interface FreeUtilityPageSpec {
  readonly slug: string;
  readonly seoTitle: string;
  readonly metaDescription: string;
  readonly h1: string;
  readonly subtitle: string;
  readonly answerFirst: string;
  readonly formulaNotes: readonly FormulaNote[];
  readonly faqs: readonly ToolFaq[];
}

export type HookNiche =
  | "SaaS & B2B"
  | "Ecommerce & DTC"
  | "Creator & Education"
  | "Fitness & Health"
  | "Finance & Career"
  | "UGC & Product Demo"
  | "Faceless & Storytelling";

export type HookStyle =
  | "Contrarian"
  | "Curiosity Gap"
  | "Proof-First"
  | "Mistake / Warning"
  | "List / Framework"
  | "Pattern Interrupt";

export interface HookTemplate {
  readonly id: string;
  readonly niche: HookNiche;
  readonly style: HookStyle;
  readonly template: string;
  readonly exampleFill: string;
  readonly visualCue: string;
  readonly bestPlatform: "TikTok" | "Instagram Reels" | "YouTube Shorts" | "All short-form";
}

export const ANALYZER_PAGES: readonly AnalyzerPageSpec[] = [
  {
    slug: "analyze-tiktok-account",
    platform: "tiktok",
    seoTitle: "Free TikTok Account Analyzer & Outlier Tool | ContHunt",
    metaDescription:
      "Audit any public TikTok account: calculate median views, spot 3x+ outlier videos, compare like/comment/share ratios, and uncover repeatable content formats.",
    h1: "Analyze any public TikTok account in seconds.",
    subtitle:
      "Look past vanity follower counts and one-off viral spikes. Benchmark an account median views, surface true breakout outliers, and see which topics actually earn shares and comments.",
    answerFirst:
      "A reliable TikTok account audit measures median views across recent posts rather than follower count or simple averages. Because TikTok distributes clips primarily through the For You feed, comparing each video against the creator median baseline immediately exposes which hooks and topics earned outsized algorithmic reach (3x+ outliers) versus normal baseline posts.",
    howItWorks: [
      {
        step: 1,
        title: "Enter a public TikTok handle or paste recent post stats",
        detail:
          "Input any public @username to inspect recent public video performance, or paste recent clip numbers directly to run an instant outlier and engagement audit.",
      },
      {
        step: 2,
        title: "Compute median baseline and outlier multipliers",
        detail:
          "ContHunt separates median views from mean views so a single 2M-view spike does not distort the rest of the grid, then scores every clip by its view multiplier and public engagement rate.",
      },
      {
        step: 3,
        title: "Open standout clips in ContHunt for hook & transcript breakdown",
        detail:
          "Take the highest-scoring outlier videos into agent.conthunt.app (or via ContHunt MCP) to inspect the opening 3-second hook, pacing structure, and repeatable creative angles.",
      },
    ],
    metricsExplained: [
      {
        name: "Median Views (Baseline Reach)",
        formula: "Middle value of the last 10–30 public videos sorted by views",
        whyItMatters:
          "Shows what the account reliably gets on an average upload without letting one lucky viral hit inflate expectations during competitor research or creator vetting.",
      },
      {
        name: "Outlier Multiplier",
        formula: "Single Video Views ÷ Account Median Views",
        whyItMatters:
          "Flags clips that beat the creator normal reach by 3x, 5x, or 10x — pinpointing the exact topic, hook, or format worth studying.",
      },
      {
        name: "Public Engagement Rate by Views",
        formula: "((Likes + Comments + Shares) ÷ Views) × 100",
        whyItMatters:
          "Normalizes engagement for cold For You Page reach so a 5,000-follower creator and a 500,000-follower brand can be compared fairly.",
      },
      {
        name: "Share-to-View Ratio",
        formula: "(Shares ÷ Views) × 100",
        whyItMatters:
          "Shares are one of the strongest public proxy signals for organic distribution velocity and relatability on TikTok.",
      },
      {
        name: "Posting Consistency & Hit Rate",
        formula: "(Videos >= 3x Median ÷ Total Recent Videos) × 100",
        whyItMatters:
          "Distinguishes creators with a repeatable creative system from accounts coasting on a single six-month-old pinned viral clip.",
      },
    ],
    faqs: [
      {
        question: "Why use median views instead of average views when analyzing a TikTok account?",
        answer:
          "Short-form view distributions are heavily skewed. If an account has nine videos at 4,000 views and one pinned viral video at 900,000 views, the average is 93,600 views while the median is 4,000 views. Median views reflect reality and make outlier detection accurate.",
      },
      {
        question: "Can this analyzer audit private TikTok accounts or hidden bookmark counts?",
        answer:
          "No. ContHunt only analyzes public TikTok profiles and publicly visible metrics (views, likes, comments, shares, captions, and publish dates). Private accounts and creator-only analytics like retention curves are inaccessible.",
      },
      {
        question: "What counts as a strong TikTok outlier score?",
        answer:
          "A 3x outlier (3 times the account median views) is a reliable signal that the hook or topic broke beyond the core audience. Clips above 5x–10x deserve full script and visual-opening inspection.",
      },
      {
        question: "How do agencies use TikTok account analysis before hiring UGC creators?",
        answer:
          "Agencies check median views, hit rate, and share-to-view ratio on recent organic uploads rather than relying on follower counts or media kits. A small creator with a high 3x hit rate often outperforms a dormant 200K-follower account.",
      },
      {
        question: "How do I track a TikTok competitor continuously over time?",
        answer:
          "Start a 7-day free trial in agent.conthunt.app (plans start at $25/mo billed yearly / $29/mo monthly) to track competitor profiles automatically, save winning clips to boards, and query trends via hosted MCP.",
      },
    ],
  },
  {
    slug: "analyze-instagram-reels-account",
    platform: "instagram",
    seoTitle: "Free Instagram Reels Account Analyzer | ContHunt",
    metaDescription:
      "Audit any public Instagram Reels account: benchmark median Reel views, identify 3x+ breakout Reels, compare comment/share triggers, and diagnose format performance.",
    h1: "Analyze any public Instagram Reels account without guessing.",
    subtitle:
      "Separate Reels that actually broke into Explore and Reels feeds from posts propped up by existing followers — using median view baselines, outlier multipliers, and comment-to-view signals.",
    answerFirst:
      "Auditing an Instagram Reels account effectively requires looking at Reels-only median views, view-to-follower ratio, and comment/share ratios across recent posts. Because Instagram blends follower distribution with non-follower Reels recommendations, videos exceeding both the account follower count and 3x median Reel views reveal the creative formats driving net-new discovery.",
    howItWorks: [
      {
        step: 1,
        title: "Select a public Instagram account focused on Reels",
        detail:
          "Enter a public Instagram handle or recent Reels metrics to evaluate video performance separately from static carousels and Stories.",
      },
      {
        step: 2,
        title: "Benchmark Reel median views and view-to-follower ratio",
        detail:
          "See how consistently the account reaches non-followers on the Reels tab and automatically highlight clips performing 3x+ above the creator recent baseline.",
      },
      {
        step: 3,
        title: "Deconstruct winning Reels hooks and CTAs in ContHunt",
        detail:
          "Send top-performing Reels into agent.conthunt.app to break down text-on-screen hooks, audio pacing, and comment-keyword CTAs (such as DM automation prompts) before writing your next brief.",
      },
    ],
    metricsExplained: [
      {
        name: "Median Reel Views",
        formula: "Middle view count across the account last 10–30 public Reels",
        whyItMatters:
          "Establishes realistic baseline distribution on Instagram Reels without distortion from pinned Reels or paid boosted posts.",
      },
      {
        name: "View-to-Follower Ratio",
        formula: "(Reel Views ÷ Account Followers) × 100",
        whyItMatters:
          "Reels scoring over 100% view-to-follower ratio prove the clip broke beyond existing followers into cold Reels/Explore traffic.",
      },
      {
        name: "Reel Outlier Score",
        formula: "Single Reel Views ÷ Account Median Reel Views",
        whyItMatters:
          "Highlights which specific hook, visual angle, or topic resonated disproportionately with Instagram recommendation engine.",
      },
      {
        name: "Comment-to-View Ratio",
        formula: "(Comments ÷ Reel Views) × 100",
        whyItMatters:
          "Flags Reels powered by strong debate prompts or DM-automation keyword triggers (e.g., comment GUIDE for the link), helping you spot conversion-oriented formats.",
      },
      {
        name: "Like-to-View Ratio",
        formula: "(Likes ÷ Reel Views) × 100",
        whyItMatters:
          "Provides a fast sanity check on creative resonance across accounts where shares or saves are not publicly displayed.",
      },
    ],
    faqs: [
      {
        question: "Why can an Instagram account have 100K followers but only 2,000 views per Reel?",
        answer:
          "Older Instagram accounts often accumulated followers from static photos, giveaways, or inactive audiences years ago. Checking median Reel views and view-to-follower ratio exposes dormant reach immediately.",
      },
      {
        question: "Does Instagram expose public save counts on competitor Reels?",
        answer:
          "No. Instagram hides bookmark/save counts from public viewers (only the account owner sees saves in Instagram Insights). Public audits rely on views, likes, comments, and shares where available.",
      },
      {
        question: "How do comment-keyword CTAs affect Instagram Reels engagement rate?",
        answer:
          "Reels using comment-to-DM prompts often show unusually high comment-to-view ratios. Inspecting comment ratio alongside views helps you tell whether high engagement came from genuine discussion or a lead-magnet funnel.",
      },
      {
        question: "Can I analyze static Instagram carousel posts with this tool?",
        answer:
          "This analyzer is designed specifically for Instagram Reels video metrics where public view counts allow fair cross-account comparison.",
      },
      {
        question: "How do I save winning competitor Reels into a swipe file?",
        answer:
          "Create a ContHunt workspace at agent.conthunt.app (7-day free trial) to search Instagram Reels by topic, save clips to organized boards, and run AI script breakdowns or MCP queries.",
      },
    ],
  },
  {
    slug: "analyze-youtube-shorts-account",
    platform: "youtube",
    seoTitle: "Free YouTube Shorts Channel Analyzer | ContHunt",
    metaDescription:
      "Analyze any public YouTube Shorts channel: isolate Shorts median views, spot 3x+ outlier Shorts, check like-to-view ratios, and find repeatable Shorts series.",
    h1: "Analyze any public YouTube Shorts channel for repeatable winners.",
    subtitle:
      "Separate Shorts performance from long-form uploads, calculate true Shorts median views, and pinpoint the exact hooks and topics breaking out on the Shorts shelf.",
    answerFirst:
      "Analyzing a YouTube Shorts channel requires isolating Shorts uploads from long-form videos so differing view baselines do not skew the math. Comparing each Short against the channel median Shorts views reveals true 3x+ outlier topics, while like-to-view and comment-to-view ratios distinguish high-retention formats from passive swipe traffic.",
    howItWorks: [
      {
        step: 1,
        title: "Enter a public YouTube channel handle or Shorts metrics",
        detail:
          "Look up any public YouTube channel to focus strictly on vertical Shorts performance without long-form upload noise.",
      },
      {
        step: 2,
        title: "Measure Shorts median baseline and outlier multipliers",
        detail:
          "Spot which Shorts broke past the channel normal shelf ceiling (e.g., 10K plateau to 250K+ breakout) and check their engagement ratios.",
      },
      {
        step: 3,
        title: "Break down outlier Shorts hooks and loops in ContHunt",
        detail:
          "Open the top Shorts inside agent.conthunt.app or via ContHunt YouTube Shorts MCP to inspect the first 3 seconds, pacing cadence, and loop structure.",
      },
    ],
    metricsExplained: [
      {
        name: "Shorts Median Views",
        formula: "Middle view count across the channel last 10–30 public Shorts",
        whyItMatters:
          "YouTube Shorts frequently cluster around seed-test tiers (e.g., 1K, 10K, 50K). Median views show the channel real floor.",
      },
      {
        name: "Shorts Outlier Multiplier",
        formula: "Single Short Views ÷ Channel Median Shorts Views",
        whyItMatters:
          "Isolates Shorts that crossed YouTube view-vs-swiped-away and average-percentage-viewed thresholds to enter wider recommendation waves.",
      },
      {
        name: "Like-to-View Ratio",
        formula: "(Likes ÷ Views) × 100",
        whyItMatters:
          "Public YouTube Shorts do not show share counts; like-to-view ratio is the cleanest public signal for viewer satisfaction alongside views.",
      },
      {
        name: "Comment-to-View Ratio",
        formula: "(Comments ÷ Views) × 100",
        whyItMatters:
          "High comment ratios reveal topics that spark debate, questions, or follow-up part-2 demand — a strong signal for repeatable series.",
      },
      {
        name: "View-to-Subscriber Ratio",
        formula: "(Short Views ÷ Subscribers) × 100",
        whyItMatters:
          "Shows whether a small or faceless channel is winning cold Shorts feed distribution purely on packaging and retention.",
      },
    ],
    faqs: [
      {
        question: "Why should YouTube Shorts be analyzed separately from long-form videos?",
        answer:
          "YouTube Shorts and long-form videos run on separate discovery feeds with completely different view distributions, retention mechanics, and monetization (RPM). Blending them into one channel average hides true Shorts outliers.",
      },
      {
        question: "Can a YouTube Shorts analyzer show private Viewed vs. Swiped Away metrics?",
        answer:
          "No. Viewed vs. Swiped Away and Average Percentage Viewed (APV) are private YouTube Studio metrics visible only to the channel owner. Public analysis uses views, outlier multipliers, likes, comments, and video structure.",
      },
      {
        question: "Why do many YouTube Shorts stall around 1,000 or 10,000 views?",
        answer:
          "YouTube tests Shorts in progressive seed audiences. Clips that clear the initial swipe-away and completion benchmarks graduate to larger pools, creating visible step-changes in view counts — which outlier multipliers spot immediately.",
      },
      {
        question: "Does ContHunt compare YouTube Shorts performance against TikTok and Reels?",
        answer:
          "Yes. Inside agent.conthunt.app and ContHunt hosted MCP (mcp.conthunt.app/mcp), you can search one topic across YouTube Shorts, TikTok, and Instagram Reels together to spot cross-platform gaps.",
      },
      {
        question: "Can I analyze long-form YouTube videos to find Shorts clip ideas?",
        answer:
          "Yes. ContHunt includes long-video analysis (`analyze_long_video` via MCP and inside the app) so you can inspect a full podcast or tutorial and identify high-potential Shorts moments.",
      },
    ],
  },
] as const;

export const GATED_TOOL_PAGES: readonly GatedToolPageSpec[] = [
  {
    slug: "tiktok-hook-transcript-extractor",
    platform: "tiktok",
    seoTitle: "TikTok Hook & Transcript Extractor | ContHunt",
    metaDescription:
      "Extract spoken transcripts, opening 3-second visual hooks, pacing beats, and CTA structures from any public TikTok video inside ContHunt.",
    h1: "Extract TikTok hooks, transcripts, and beat structure in one workflow.",
    subtitle:
      "Stop pausing TikToks every half-second to transcribe lines into a spreadsheet. Sign in to ContHunt to extract spoken hooks, visual openers, pacing shifts, and CTAs from any public TikTok — or batch-analyze winners via Deep Search.",
    samplePreview: {
      disclaimer:
        "Illustrative sample preview showing the structured output format returned after signing in to ContHunt (example data below is illustrative, not a live creator report).",
      inputExample: "https://www.tiktok.com/@example_creator/video/0000000000000000000",
      outputTitle: "Illustrative TikTok Hook & Transcript Breakdown",
      fields: [
        {
          label: "0:00–0:03 Visual Hook",
          value: "Tight overhead desk shot holding a physical product comparison side by side with bold 4-word on-screen text.",
        },
        {
          label: "Spoken Opening Line",
          value: "Stop paying for three separate subscriptions when one workflow replaces the busywork.",
        },
        {
          label: "Hook Pattern Classification",
          value: "Contrarian cost-cut + immediate visual proof (zero throat-clearing intro).",
        },
        {
          label: "Body Pacing & Proof Beats",
          value: "Beat 1 (0:03–0:11): Names the exact pain point. Beat 2 (0:11–0:24): Live screen/product demo with 2-second cut cadence. Beat 3 (0:24–0:32): Side-by-side outcome.",
        },
        {
          label: "Closing CTA Mechanism",
          value: "Soft curiosity CTA directing viewers to check the pinned comment for the checklist.",
        },
      ],
      takeaway:
        "Signed-in ContHunt users can save analyzed TikToks straight to a board, query transcripts via SQL, or connect Claude/Cursor via MCP to turn extracted hooks into original scripts.",
    },
    freeAccountBenefits: [
      "7-day free trial across Pro, Creator, and Research plans (1,000–2,000 Hunt credits and 1,500–4,000 AI credits during trial).",
      "Analyze individual public TikTok URLs for spoken transcript, visual opening hook, pacing, and conversion angle.",
      "Save analyzed TikToks into visual swipe-file boards for editors, founders, and UGC creators.",
      "Run multi-video Deep Search investigations across a whole niche instead of one URL at a time.",
      "Connect hosted MCP (https://mcp.conthunt.app/mcp) to pull extracted hooks straight into Claude, Cursor, or Codex.",
    ],
    faqs: [
      {
        question: "Why does the TikTok Hook & Transcript Extractor require signing in?",
        answer:
          "Running multimodal video analysis (transcribing audio, inspecting visual opening frames, and mapping pacing beats) consumes model-backed AI credits. Signing into agent.conthunt.app gives you a 7-day free trial with real AI credits and saves every analysis to your workspace.",
      },
      {
        question: "Does ContHunt only extract spoken text, or does it read visual hooks too?",
        answer:
          "It analyzes both. Many top TikToks succeed because of on-screen text overlays, props, or sudden visual motion in the first 2 seconds — not just spoken words.",
      },
      {
        question: "How many AI credits does analyzing one TikTok video take?",
        answer:
          "ContHunt planning estimate is 7 AI credits per analyzed short video (actual usage varies slightly with video length and follow-up chat questions).",
      },
      {
        question: "Can I extract hooks from TikTok videos inside Claude or Cursor automatically?",
        answer:
          "Yes. Once signed in, connect ContHunt hosted MCP server at https://mcp.conthunt.app/mcp and ask your agent to call `video` and `analyze_video` on any public TikTok link.",
      },
    ],
  },
  {
    slug: "instagram-reels-script-breakdown",
    platform: "instagram",
    seoTitle: "Instagram Reels Script Breakdown Tool | ContHunt",
    metaDescription:
      "Break down any public Instagram Reel into opening visual hook, on-screen text, spoken script, retention beats, and comment/DM CTA inside ContHunt.",
    h1: "Turn any public Instagram Reel into a beat-by-beat script breakdown.",
    subtitle:
      "Deconstruct why top Reels hold attention and trigger comments or shares. Sign in to ContHunt to unpack the exact hook, visual rhythm, and CTA architecture behind standout Instagram Reels.",
    samplePreview: {
      disclaimer:
        "Illustrative sample preview showing the output structure inside ContHunt (example data below is illustrative, not a live brand Reel).",
      inputExample: "https://www.instagram.com/reel/EXAMPLE_SHORTCODE/",
      outputTitle: "Illustrative Instagram Reels Script Breakdown",
      fields: [
        {
          label: "Opening Text Overlay (0:00–0:02)",
          value: "3 landing page fixes that cut bounce rate in one afternoon",
        },
        {
          label: "Visual Pattern Interrupt",
          value: "Walk-and-talk cut immediately to screen recording zoom on a real headline rewrite.",
        },
        {
          label: "Retention Structure",
          value: "Numbered 3-point sprint with visual re-hook every 6–8 seconds and crisp captions positioned above the Reel UI safe zone.",
        },
        {
          label: "Share / Save Trigger",
          value: "Compact before-and-after checklist shown for 2 seconds, encouraging viewers to pause or bookmark.",
        },
        {
          label: "Conversion CTA",
          value: "Comment CHECKLIST and I will send the template — paired with pinned first comment.",
        },
      ],
      takeaway:
        "Inside agent.conthunt.app, you can group analyzed Reels into client or campaign boards and hand editors a clean creative brief instead of raw links.",
    },
    freeAccountBenefits: [
      "Deconstruct public Instagram Reels into structured hook, body, visual-cut, and CTA beats.",
      "Compare Reels side by side with TikTok and YouTube Shorts in the same niche.",
      "Organize winning Reels into reusable boards and query your saved swipe file via SQL.",
      "Start with a 7-day free trial (1,500 AI credits on Pro trial; 4,000 AI credits on Creator/Research trial).",
      "Pull Reels breakdowns directly into Claude, ChatGPT, Cursor, or Codex over hosted MCP.",
    ],
    faqs: [
      {
        question: "Can this tool break down Reels from any public Instagram account?",
        answer:
          "Yes, as long as the Instagram account and Reel are public. Private accounts and ephemeral Stories are not supported.",
      },
      {
        question: "How is a script breakdown better than a plain transcript?",
        answer:
          "Plain transcripts miss why a Reel worked: silent visual hooks, bold on-screen captions, B-roll timing, and pause-worthy frames often drive saves and shares more than narration alone.",
      },
      {
        question: "Can I compare 20 winning Reels in my niche at once instead of one by one?",
        answer:
          "Yes. Save a search or creator set to a board and run ContHunt Deep Search to synthesize recurring hook formats, objections, and CTA patterns across the entire set.",
      },
      {
        question: "Is hosted MCP access included if I want Claude to rewrite scripts from my Reels board?",
        answer:
          "Yes. Every paid ContHunt plan (starting at Pro $25/mo yearly / $29/mo monthly) includes hosted MCP access at https://mcp.conthunt.app/mcp.",
      },
    ],
  },
  {
    slug: "youtube-shorts-outlier-finder",
    platform: "youtube",
    seoTitle: "YouTube Shorts Outlier Finder (Free Preview) | ContHunt",
    metaDescription:
      "Find high-multiplier YouTube Shorts outliers by topic or channel inside ContHunt. Compare breakout Shorts against TikTok and Reels winners in one workspace.",
    h1: "Find breakout YouTube Shorts outliers before your niche saturates.",
    subtitle:
      "Stop copying average uploads from giant channels. Sign in to ContHunt to surface YouTube Shorts outperforming their channel baseline — and spot winning TikTok and Reels angles you can adapt first.",
    samplePreview: {
      disclaimer:
        "Illustrative sample preview demonstrating ContHunt outlier screening layout (metrics shown below are illustrative examples, not live channel data).",
      inputExample: "Topic: personal finance automation · Window: last 30 days · Platform: YouTube Shorts",
      outputTitle: "Illustrative YouTube Shorts Outlier Screening Output",
      fields: [
        {
          label: "Illustrative Breakout Signal",
          value: "184,000 views on a channel with 19,500 median Shorts views (9.4x outlier multiplier).",
        },
        {
          label: "Opening Hook Angle",
          value: "Visual bank-dashboard breakdown paired with a specific dollar-leak framing in the first 2 seconds.",
        },
        {
          label: "Engagement Profile",
          value: "6.8% like-to-view ratio and elevated question density in comments asking for step-by-step setup.",
        },
        {
          label: "Cross-Platform Gap Check",
          value: "Similar format already trending across 12 TikTok clips, with only 2 comparable YouTube Shorts published in the last 30 days.",
        },
        {
          label: "Next Action in Workspace",
          value: "Save to board, inspect pacing with analyze_video, or launch Deep Search across Shorts + TikTok.",
        },
      ],
      takeaway:
        "Sign in to agent.conthunt.app to run live keyword searches, inspect competitor Shorts channels, and run Deep Search across all three vertical video platforms.",
    },
    freeAccountBenefits: [
      "Search public YouTube Shorts, TikTok, and Instagram Reels in one query (1 Hunt credit per platform).",
      "Inspect any public YouTube channel recent uploads via creator lookup to isolate repeatable winners.",
      "Combine short-form outlier search with `analyze_long_video` to mine long YouTube interviews for Shorts angles.",
      "Save breakout Shorts to boards and run SQL queries over your historical research at zero extra search cost.",
      "Start with a 7-day free trial — plans start at $25/mo billed yearly ($29/mo monthly) with hosted MCP included.",
    ],
    faqs: [
      {
        question: "What makes a YouTube Short an outlier?",
        answer:
          "An outlier Short significantly beats the uploading channel median Shorts views — typically 3x or higher. Studying outliers from mid-sized channels reveals topics and hooks that win purely on viewer retention rather than subscriber size.",
      },
      {
        question: "How is ContHunt different from YouTube-only outlier tools like 1of10?",
        answer:
          "1of10 specializes in YouTube packaging and AI thumbnail generation. ContHunt searches YouTube Shorts alongside TikTok and Instagram Reels so you can spot formats breaking out on TikTok/Reels early and adapt them to Shorts — plus includes hosted MCP from $25/mo yearly.",
      },
      {
        question: "Can I calculate an outlier score for free without an account?",
        answer:
          "Yes. Use our free no-signup Viral Outlier Score Calculator on conthunt.app whenever you already have a video view count and recent channel post numbers on hand.",
      },
      {
        question: "Does ContHunt work for faceless YouTube Shorts channels?",
        answer:
          "Yes. Faceless Shorts operators use ContHunt to find high-velocity storytelling hooks, visual pacing structures, and under-served cross-platform topics.",
      },
    ],
  },
] as const;

export const FREE_UTILITY_PAGES: readonly FreeUtilityPageSpec[] = [
  {
    slug: "youtube-shorts-engagement-rate-calculator",
    seoTitle: "YouTube Shorts Engagement Rate Calculator | ContHunt",
    metaDescription:
      "Calculate YouTube Shorts engagement rate by views or subscribers, like-to-view ratio, comment-to-view ratio, and outlier multiplier — free, no login required.",
    h1: "YouTube Shorts engagement rate & outlier calculator.",
    subtitle:
      "Measure YouTube Shorts engagement rate by views and subscribers, break down like-to-view and comment-to-view ratios, and check your outlier multiplier against recent channel median views — no signup required.",
    answerFirst:
      "The standard public YouTube Shorts engagement rate formula is ((Likes + Comments) ÷ Views) × 100. Because YouTube Shorts distributes primarily to non-subscribers through the Shorts feed and does not publicly display share counts, dividing likes and comments by views gives the fairest benchmark across channels of any size.",
    formulaNotes: [
      {
        name: "Public Shorts Engagement Rate by Views",
        formula: "((Likes + Comments) ÷ Views) × 100",
        explanation:
          "The cleanest apples-to-apples metric for comparing public Shorts across small and large channels because YouTube does not publicly expose share counts.",
      },
      {
        name: "Like-to-View Ratio",
        formula: "(Likes ÷ Views) × 100",
        explanation:
          "Fast indicator of whether viewers who stayed past the swipe-away hook actively approved the payoff.",
      },
      {
        name: "Comment-to-View Ratio",
        formula: "(Comments ÷ Views) × 100",
        explanation:
          "Captures discussion, curiosity, or polarising takes — Shorts with elevated comment ratios often signal strong sequel or series demand.",
      },
      {
        name: "Shorts Engagement Rate by Subscribers",
        formula: "((Likes + Comments) ÷ Subscribers) × 100",
        explanation:
          "Useful when auditing creator partnerships or checking whether a channel audience is active versus dormant.",
      },
      {
        name: "Shorts Outlier Multiplier",
        formula: "Single Short Views ÷ Channel Median Shorts Views (last 10 Shorts)",
        explanation:
          "Identifies whether a Short broke out of the channel normal seed-test ceiling (3x+ = breakout outlier).",
      },
    ],
    faqs: [
      {
        question: "What is the formula for YouTube Shorts engagement rate?",
        answer:
          "For public benchmarking, divide total public interactions by views: ((Likes + Comments) ÷ Views) × 100. If you are inspecting your own channel in YouTube Studio, you can also include private Shares in the numerator.",
      },
      {
        question: "Why are YouTube Shorts engagement rates often lower than TikTok engagement rates?",
        answer:
          "YouTube Shorts public math excludes shares (which TikTok displays publicly), and YouTube Shorts viewers often swipe continuously without tapping like as frequently as TikTok users. Always compare Shorts against Shorts benchmarks — not TikTok medians.",
      },
      {
        question: "Does a high like-to-view ratio guarantee a Short will go viral?",
        answer:
          "No. YouTube Shorts distribution weights Viewed vs. Swiped Away and Average Percentage Viewed heavily. A high like-to-view ratio confirms audience satisfaction among people who watched, while views and outlier multiplier show whether the hook cleared feed retention.",
      },
      {
        question: "Should I evaluate YouTube Shorts by views or by subscribers?",
        answer:
          "Evaluate creative quality by views first, because most Shorts views come from non-subscribers on the Shorts shelf. Use engagement by subscribers only when vetting sponsorship reach.",
      },
    ],
  },
  {
    slug: "viral-outlier-score-calculator",
    seoTitle: "Viral Outlier Score Calculator (Free) | ContHunt",
    metaDescription:
      "Compute any video true viral outlier multiplier using account median views (not distorted averages) across TikTok, Instagram Reels, and YouTube Shorts — free, no signup.",
    h1: "Viral outlier score calculator for TikTok, Reels, and Shorts.",
    subtitle:
      "Paste one video view count plus 5–10 recent posts from the same creator to calculate the true median baseline, outlier multiplier (1x–10x+), and whether a clip is worth replicating.",
    answerFirst:
      "An outlier score divides a single video views by the creator median views across recent uploads (Video Views ÷ Account Median Views). Using the median rather than the arithmetic average prevents one older mega-viral post from hiding genuinely strong 3x–5x creative winners.",
    formulaNotes: [
      {
        name: "Account Median Baseline",
        formula: "Middle value of the creator last 5–10 recent video views (sorted ascending)",
        explanation:
          "Resistant to distortion from pinned viral videos or boosted ad posts; reflects what the creator normally gets.",
      },
      {
        name: "Viral Outlier Multiplier",
        formula: "Target Video Views ÷ Account Median Views",
        explanation:
          "Under 1.5x = normal baseline; 1.5x–2.9x = above average; 3.0x–4.9x = clear breakout outlier; 5.0x–9.9x = strong viral outlier; 10x+ = extreme breakout format.",
      },
      {
        name: "Mean vs. Median Distortion Ratio",
        formula: "Account Mean Views ÷ Account Median Views",
        explanation:
          "When this ratio exceeds 2.0x, the creator grid is heavily skewed by one or two viral spikes — proving why mean-based calculators mislead strategists.",
      },
      {
        name: "Follower-Normalized Reach Factor",
        formula: "Target Video Views ÷ Account Followers",
        explanation:
          "Checks whether the outlier genuinely reached cold non-follower audiences (values above 1.0x indicate net-new discovery beyond the follower base).",
      },
    ],
    faqs: [
      {
        question: "Why is a 3x outlier on a 10K-view account more useful than a 1x post on a 1M-view celebrity account?",
        answer:
          "A celebrity getting 1M views on a 1M-median account won mostly because of built-in fame. A smaller creator jumping from 10K median views to 90K views (9x outlier) won because the topic, hook, or format compelled cold viewers to stop scrolling.",
      },
      {
        question: "How many recent videos should I include in the baseline calculation?",
        answer:
          "Include 7 to 10 recent normal uploads from the same format (for example, Reels only or Shorts only). Exclude pinned videos older than 60 days and obviously paid/spark-ad posts if you can spot them.",
      },
      {
        question: "Does this outlier formula work on TikTok, Instagram Reels, and YouTube Shorts?",
        answer:
          "Yes. Median-based outlier multipliers normalize for platform scale and account size across all three short-form feeds.",
      },
      {
        question: "How can I find outlier videos automatically instead of typing numbers by hand?",
        answer:
          "Inside agent.conthunt.app (or via ContHunt MCP at https://mcp.conthunt.app/mcp), you can search niches across TikTok, Reels, and Shorts, inspect creator histories, and surface high-multiplier winners automatically.",
      },
    ],
  },
  {
    slug: "short-form-cpm-rpm-calculator",
    seoTitle: "Short-Form CPM, RPM & Payout Calculator | ContHunt",
    metaDescription:
      "Estimate YouTube Shorts RPM, TikTok Creator Rewards earnings, UGC brand deal CPMs, and required views to hit revenue targets — transparent, editable assumptions, no login.",
    h1: "Short-form CPM, RPM & creator revenue calculator.",
    subtitle:
      "Model ad-share RPM, UGC retainer CPMs, and sponsor deal pricing across TikTok, Instagram Reels, and YouTube Shorts — with fully editable assumptions instead of made-up promises.",
    answerFirst:
      "CPM (Cost Per Mille) measures what an advertiser or brand pays per 1,000 impressions or views: (Campaign Cost ÷ Views) × 1,000. RPM (Revenue Per Mille) measures what a creator keeps per 1,000 qualified views: (Net Creator Earnings ÷ Views) × 1,000. Because real-world short-form RPM varies widely by audience country, niche, watch length, and monetization program, reliable planning requires modeling low, realistic, and high scenarios.",
    formulaNotes: [
      {
        name: "Effective CPM (Brand / Advertiser Side)",
        formula: "(Total Spend or Creator Fee ÷ Total Views) × 1,000",
        explanation:
          "Lets UGC agencies and DTC brands compare organic creator retainers directly against paid Meta or TikTok ad CPMs.",
      },
      {
        name: "Creator RPM (Platform Payout Side)",
        formula: "(Estimated Net Earnings ÷ Qualified Views) × 1,000",
        explanation:
          "Estimates platform ad-share or creator-fund payouts. Note that TikTok Creator Rewards typically requires 60+ second original videos and counts qualified views rather than raw views.",
      },
      {
        name: "Views Required to Hit Target Revenue",
        formula: "(Target Revenue ÷ RPM) × 1,000",
        explanation:
          "Translates a monthly income goal into concrete view volume so creators can decide whether ad-share alone is viable or if sponsors/products are needed.",
      },
      {
        name: "Blended Sponsorship + Performance Bonus",
        formula: "Base Fee + ((Views ÷ 1,000) × Performance CPM)",
        explanation:
          "Models modern UGC performance retainers (base fee plus per-1,000-view bonus, optionally capped) used by consumer apps and SaaS teams.",
      },
    ],
    faqs: [
      {
        question: "What is the difference between CPM and RPM in short-form video?",
        answer:
          "CPM is the gross price per 1,000 views paid by a brand or advertiser. RPM is the net amount per 1,000 views earned by the creator after platform revenue shares and non-qualified views are accounted for.",
      },
      {
        question: "Why does the same 1,000,000 views earn wildly different amounts across creators?",
        answer:
          "Audience geography (Tier-1 markets like US/UK/Canada vs lower-CPM regions), niche advertiser demand (B2B/finance/software vs broad entertainment), video length (60s+ eligibility on TikTok Creator Rewards), and monetization model (ad-share vs direct sponsor/UGC fee) all swing payouts by 10x or more.",
      },
      {
        question: "Are the preset CPM/RPM ranges in this calculator guaranteed platform rates?",
        answer:
          "No. Platforms do not publish fixed RPM tables and rates shift seasonally (for example, Q4 vs Q1). Treat presets purely as editable planning baselines and plug in your own observed dashboard RPM whenever available.",
      },
      {
        question: "How do consumer apps and SaaS brands structure UGC creator CPM deals?",
        answer:
          "Many teams combine a modest per-video base fee with a view-based CPM bonus (often capped per video) so creators are rewarded for producing true outlier hooks rather than low-effort volume.",
      },
    ],
  },
  {
    slug: "viral-hook-generator",
    seoTitle: "Free Viral Hook Generator (24 Templates) | ContHunt",
    metaDescription:
      "Generate scroll-stopping opening hooks for TikTok, Instagram Reels, and YouTube Shorts from 24 structured templates across 7 niches and 6 hook styles — free, no signup.",
    h1: "Viral short-form hook generator & template library.",
    subtitle:
      "Pick your niche, hook style, topic, and target audience to generate crisp first-3-second openings paired with matching visual cues — built from repeatable short-form structures.",
    answerFirst:
      "A high-retention short-form hook does two jobs inside the first 2 to 3 seconds: it qualifies the exact viewer (so the algorithm learns who should see the clip) and opens an unmistakable curiosity or proof loop (visual + spoken) that makes swiping away feel costly.",
    formulaNotes: [
      {
        name: "Visual + Verbal Alignment Rule",
        formula: "Visual Context (0:00) + Spoken Tension (0:00–0:03) + On-Screen Text (<= 8 words)",
        explanation:
          "Strong hooks pair what viewers see in frame one with a tight spoken line and scannable on-screen text rather than opening with greetings like Hey guys.",
      },
      {
        name: "Specificity Multiplier",
        formula: "Replace vague adjectives (better, faster) with concrete constraints (time, steps, mistake, audience)",
        explanation:
          "Specific hooks filter out wrong viewers and raise completion rates among the exact buyers or followers you want.",
      },
      {
        name: "3-Variation Testing Rule",
        formula: "Keep one body script fixed → film 3 distinct 3-second opening hooks",
        explanation:
          "Testing multiple openings against the same core video lets you isolate whether the hook or the body caused a retention drop.",
      },
    ],
    faqs: [
      {
        question: "How long should a TikTok, Reels, or YouTube Shorts hook be?",
        answer:
          "Aim for 1 to 3 seconds (roughly 6 to 14 spoken words). By second 3, viewers should already understand the topic, stakes, and why staying until the end pays off.",
      },
      {
        question: "Should I use the exact same hook wording on TikTok, Reels, and Shorts?",
        answer:
          "Often yes for the spoken line, while adjusting on-screen text placement for each platform UI safe zone and tightening the very first half-second on YouTube Shorts where swipe-away speed is unforgiving.",
      },
      {
        question: "How do I know which hooks are actually working in my niche right now?",
        answer:
          "Templates give you fast starting angles, but real feed evidence wins. Use ContHunt Viral Now public boards or sign in to agent.conthunt.app to search live breakout clips in your exact niche and dissect their first 3 seconds.",
      },
      {
        question: "Can I feed real competitor hooks into an AI assistant to generate variations?",
        answer:
          "Yes. Connect ContHunt hosted MCP (https://mcp.conthunt.app/mcp) to Claude, ChatGPT, or Cursor so your assistant drafts variations grounded in verified high-outlier videos rather than generic clichés.",
      },
    ],
  },
] as const;

export const HOOK_NICHES: readonly HookNiche[] = [
  "SaaS & B2B",
  "Ecommerce & DTC",
  "Creator & Education",
  "Fitness & Health",
  "Finance & Career",
  "UGC & Product Demo",
  "Faceless & Storytelling",
] as const;

export const HOOK_STYLES: readonly HookStyle[] = [
  "Contrarian",
  "Curiosity Gap",
  "Proof-First",
  "Mistake / Warning",
  "List / Framework",
  "Pattern Interrupt",
] as const;

export const HOOK_TEMPLATES: readonly HookTemplate[] = [
  {
    id: "hook-01",
    niche: "SaaS & B2B",
    style: "Contrarian",
    template: "Everyone tells [audience] to fix [common focus], when [real bottleneck] is actually costing you [outcome].",
    exampleFill: "Everyone tells SaaS founders to post more content, when weak first-3-second hooks are actually costing you 80% of your reach.",
    visualCue: "Start mid-screen-recording highlighting a sharp retention drop graph.",
    bestPlatform: "All short-form",
  },
  {
    id: "hook-02",
    niche: "SaaS & B2B",
    style: "Proof-First",
    template: "Here is the exact [workflow/asset] we built to take [metric] from [before] to [after] without [painful step].",
    exampleFill: "Here is the exact onboarding checklist we built to cut support tickets in half without adding a single sales call.",
    visualCue: "Show the live workflow or dashboard in frame one before cutting to face-cam.",
    bestPlatform: "Instagram Reels",
  },
  {
    id: "hook-03",
    niche: "SaaS & B2B",
    style: "Mistake / Warning",
    template: "If you are a [role] still doing [manual habit] in 2026, watch what happens when you switch to [method].",
    exampleFill: "If you are a growth marketer still copying TikTok links into spreadsheets in 2026, watch what happens when you wire MCP to Claude.",
    visualCue: "Split screen: cluttered spreadsheet on top, clean automated output below.",
    bestPlatform: "TikTok",
  },
  {
    id: "hook-04",
    niche: "SaaS & B2B",
    style: "List / Framework",
    template: "I audited [number] [category] [pages/videos/funnels] — here are the only 3 patterns that actually convert.",
    exampleFill: "I audited 40 B2B software launch Reels — here are the only 3 opening patterns that actually drove comments.",
    visualCue: "Quick 0.5-second flash of the audit board or swipe file behind bold title text.",
    bestPlatform: "All short-form",
  },
  {
    id: "hook-05",
    niche: "Ecommerce & DTC",
    style: "Pattern Interrupt",
    template: "Do not buy another [product category] until you check this one [detail/ingredient/spec].",
    exampleFill: "Do not buy another magnesium supplement until you flip the bottle and check this one label line.",
    visualCue: "Hand snaps the bottle around to the nutrition label in close-up focus.",
    bestPlatform: "TikTok",
  },
  {
    id: "hook-06",
    niche: "Ecommerce & DTC",
    style: "Proof-First",
    template: "Watch what happens to [problem area] after [short timeframe] of using [product] vs [old alternative].",
    exampleFill: "Watch what happens to stainless steel grease after 15 seconds with this foam vs standard dish soap.",
    visualCue: "Side-by-side physical test running immediately at second zero.",
    bestPlatform: "All short-form",
  },
  {
    id: "hook-07",
    niche: "Ecommerce & DTC",
    style: "Curiosity Gap",
    template: "We almost killed this [product feature] during prototyping — then customers told us why it is the only reason they reorder.",
    exampleFill: "We almost cut this magnetic travel cap during prototyping — then customers told us why it is the only reason they reorder.",
    visualCue: "Founder holding prototype next to finished unit in workshop or warehouse.",
    bestPlatform: "Instagram Reels",
  },
  {
    id: "hook-08",
    niche: "Ecommerce & DTC",
    style: "Contrarian",
    template: "The reason your [product category] feels [common complaint] has nothing to do with [assumed cause].",
    exampleFill: "The reason your linen sheets feel scratchy has nothing to do with thread count.",
    visualCue: "Macro texture shot pulling fabric tight under bright natural light.",
    bestPlatform: "YouTube Shorts",
  },
  {
    id: "hook-09",
    niche: "Creator & Education",
    style: "Mistake / Warning",
    template: "This one habit in the first [X] seconds is quietly killing your [platform] reach.",
    exampleFill: "This one habit in the first 2 seconds is quietly killing your YouTube Shorts retention.",
    visualCue: "Freeze-frame on a classic throat-clearing opener with a red X stamp.",
    bestPlatform: "YouTube Shorts",
  },
  {
    id: "hook-10",
    niche: "Creator & Education",
    style: "List / Framework",
    template: "Steal this 3-part [script/outline] formula whenever you need to turn [boring topic] into a clip people actually save.",
    exampleFill: "Steal this 3-part teardown formula whenever you need to turn dry industry news into a Reel people actually save.",
    visualCue: "Three numbered cards appearing in sync with spoken cadence.",
    bestPlatform: "Instagram Reels",
  },
  {
    id: "hook-11",
    niche: "Creator & Education",
    style: "Curiosity Gap",
    template: "Ever notice how [top niche creators] never start a video by saying [common opener]? Look at what they do instead.",
    exampleFill: "Ever notice how breakout educational creators never start by saying Hey guys? Look at the frame they open on instead.",
    visualCue: "Picture-in-picture zoom on a real visual hook breakdown.",
    bestPlatform: "All short-form",
  },
  {
    id: "hook-12",
    niche: "Creator & Education",
    style: "Proof-First",
    template: "Why did this [small channel/account] pull [multiplier] its normal views with [simple twist]?",
    exampleFill: "Why did this 4,000-follower account pull 9x its normal views with a zero-budget whiteboard clip?",
    visualCue: "Highlight the outlier multiplier badge right beside the video frame.",
    bestPlatform: "TikTok",
  },
  {
    id: "hook-13",
    niche: "Fitness & Health",
    style: "Contrarian",
    template: "Stop doing [popular exercise/habit] for [goal] — this [simpler alternative] hits it twice as cleanly.",
    exampleFill: "Stop cranking out 100 crunches for core strength — this 30-second hollow-body progression hits it twice as cleanly.",
    visualCue: "Immediate gym demo comparing wrong posture on left vs clean form on right.",
    bestPlatform: "All short-form",
  },
  {
    id: "hook-14",
    niche: "Fitness & Health",
    style: "List / Framework",
    template: "If you only have [time constraint] and [equipment constraint], run this exact [number]-move routine.",
    exampleFill: "If you only have 20 minutes and one pair of dumbbells, run this exact 4-move upper body circuit.",
    visualCue: "Timer overlay ticking down over fast 1-second previews of all four moves.",
    bestPlatform: "Instagram Reels",
  },
  {
    id: "hook-15",
    niche: "Fitness & Health",
    style: "Mistake / Warning",
    template: "If your [body part] hurts during [movement], check where your [anchor point] is sitting right now.",
    exampleFill: "If your front shoulder pinches during dips, check where your elbows are tracking right now.",
    visualCue: "Slow-motion side angle with a clear arrow pointing to joint alignment.",
    bestPlatform: "YouTube Shorts",
  },
  {
    id: "hook-16",
    niche: "Finance & Career",
    style: "Pattern Interrupt",
    template: "Before you say yes to [common financial/career offer], ask this one 9-word question.",
    exampleFill: "Before you accept a job offer with equity, ask this one 9-word question about preference stack.",
    visualCue: "Close-up typing the exact question into an email reply box.",
    bestPlatform: "TikTok",
  },
  {
    id: "hook-17",
    niche: "Finance & Career",
    style: "Curiosity Gap",
    template: "Here is the math nobody shows you when comparing [Option A] vs [Option B] over [timeframe].",
    exampleFill: "Here is the math nobody shows you when comparing a $25/mo SaaS subscription vs hiring a freelance researcher over 12 months.",
    visualCue: "Clean two-column whiteboard or spreadsheet math revealing line by line.",
    bestPlatform: "YouTube Shorts",
  },
  {
    id: "hook-18",
    niche: "Finance & Career",
    style: "Mistake / Warning",
    template: "Three subtle lines on your [resume/invoice/contract] that immediately cost you [money/interviews].",
    exampleFill: "Three subtle lines in your freelance proposal that immediately trigger discount requests.",
    visualCue: "Highlighter dragging across a sample document in tight overhead framing.",
    bestPlatform: "Instagram Reels",
  },
  {
    id: "hook-19",
    niche: "UGC & Product Demo",
    style: "Pattern Interrupt",
    template: "Okay, I was genuinely ready to return [product] until I tested it on [hardest edge case].",
    exampleFill: "Okay, I was genuinely ready to return this portable espresso maker until I tested it on a 6 AM road trip.",
    visualCue: "Handheld natural-light selfie angle holding the product mid-action.",
    bestPlatform: "TikTok",
  },
  {
    id: "hook-20",
    niche: "UGC & Product Demo",
    style: "Proof-First",
    template: "Three problems [product] solved for me this week that I did not even know were annoying me.",
    exampleFill: "Three desk-cable problems this under-mount tray solved for me this week that I did not realize were wrecking my setup.",
    visualCue: "Rapid 3-cut before-and-after montage inside the first 2.5 seconds.",
    bestPlatform: "Instagram Reels",
  },
  {
    id: "hook-21",
    niche: "UGC & Product Demo",
    style: "Contrarian",
    template: "You do not need a [expensive version] to get [desired result] — watch this [budget/faster alternative].",
    exampleFill: "You do not need a $2,000 camera rig to film clean product demos — watch this $30 clamp and window light setup.",
    visualCue: "Reveal the budget setup first, then snap straight to the crisp final footage.",
    bestPlatform: "All short-form",
  },
  {
    id: "hook-22",
    niche: "Faceless & Storytelling",
    style: "Curiosity Gap",
    template: "In [year], [company/person] made one quiet decision that looked crazy — until [unexpected payoff].",
    exampleFill: "In 2014, a tiny logistics team cut half their routes — and accidentally invented the fastest delivery model in Europe.",
    visualCue: "Archival map or timeline zoom with kinetic 3-word captions.",
    bestPlatform: "YouTube Shorts",
  },
  {
    id: "hook-23",
    niche: "Faceless & Storytelling",
    style: "Pattern Interrupt",
    template: "Look closely at [specific object/detail in frame] — almost everyone misses why it is shaped like that.",
    exampleFill: "Look closely at the tiny notch on an airplane window — almost everyone misses the safety job it does at 35,000 feet.",
    visualCue: "Tight red circle zoom onto the exact physical detail at frame zero.",
    bestPlatform: "YouTube Shorts",
  },
  {
    id: "hook-24",
    niche: "Faceless & Storytelling",
    style: "List / Framework",
    template: "The [subject] iceberg gets weirder the deeper you go — starting at level one.",
    exampleFill: "The short-form algorithm iceberg gets weirder the deeper you go — starting at watch-time loops.",
    visualCue: "Vertical iceberg graphic scrolling smoothly downward as narration begins.",
    bestPlatform: "TikTok",
  },
] as const;

export function getAnalyzerBySlug(slug: string): AnalyzerPageSpec | undefined {
  return ANALYZER_PAGES.find((item) => item.slug === slug);
}

export function getGatedToolBySlug(
  slug: string,
): GatedToolPageSpec | undefined {
  return GATED_TOOL_PAGES.find((item) => item.slug === slug);
}

export function getFreeUtilityBySlug(
  slug: string,
): FreeUtilityPageSpec | undefined {
  return FREE_UTILITY_PAGES.find((item) => item.slug === slug);
}
