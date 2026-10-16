// Legacy hero copy, app-frame simulation and the Lottie/code simulation, for reference only.
// Sources: index.html lines 4-49 (head meta), 499-590 (hero + app frame), 2162-2220 (Lottie + hero scripts),
// public/step2-animation.js (code simulation), public/main_lottie.json and public/Scene-1.json (structure only).
// Lottie files were read as JSON; they were NOT rendered. They have no layer names and no text layers,
// so what they depict cannot be read from the JSON alone; see docs/revamp/content/legacy-inventory.md.
// Value "MISSING" = the legacy page has no value for this field.

export type LottieStructure = {
  canvas: string;
  fps: number;
  outPointFrames: number;
  durationSeconds: number;
  topLevelLayers: { precomp: number; null: number; shape: number };
  pathShapes: number;
  embeddedImages: string;
  dominantFills: string;
  layerNames: "MISSING";
  textLayers: 0;
};

export type CodeSequence = {
  status: string;
  lines: string[];
};

export type HeroLegacyContent = {
  headline: {
    lead: string;
    changingWords: string[];
    changingWordInitial: string;
    /** Timing from the legacy script: first change after 2000 ms, then a 3000 ms hold after each scramble. */
    changingWordTiming: { firstChangeMs: number; holdMs: number; scrambleTickMs: number };
  };
  subtext: string;
  actions: {
    viewDemoLabel: string;
    viewDemoBehavior: string;
    getStarted: { label: string; href: string; behavior: string };
  };
  appFrame: {
    searchPill: string;
    sidebarTabs: string[];
    replayLabel: string;
  };
  simulation: {
    mainLottie: {
      path: string;
      playback: string;
      structure: LottieStructure;
      depicts: "MISSING";
    };
    scene1Lottie: {
      path: string;
      playback: string;
      structure: LottieStructure;
      depicts: "MISSING";
      legacyComment: string;
    };
    codeSimulation: {
      path: string;
      initialStatus: string;
      /** Legacy appends "..." to each status when it is shown. */
      statusSuffix: string;
      sequences: CodeSequence[];
    };
  };
  head: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
};

export const data: HeroLegacyContent = {
  headline: {
    lead: "Third eye for your",
    changingWords: ["marketing", "ecommerce", "content idea", "brand growth"],
    changingWordInitial: "marketing",
    changingWordTiming: { firstChangeMs: 2000, holdMs: 3000, scrambleTickMs: 30 },
  },
  subtext:
    "Aggregates viral videos across all social media platforms, analyzes every frame and uncovers niche gold before it trends.",
  actions: {
    viewDemoLabel: "View Demo",
    viewDemoBehavior: "Scrolls to the simulated app frame.",
    getStarted: {
      label: "GET STARTED",
      href: "https://agent.conthunt.app",
      behavior: "Set by JavaScript (window.location.href), not an anchor href.",
    },
  },
  appFrame: {
    searchPill: "organic skin care",
    sidebarTabs: ["search", "boards", "settings", "ai"],
    replayLabel: "Replay",
  },
  simulation: {
    mainLottie: {
      path: "public/main_lottie.json",
      playback:
        "Not looping. Plays once when at least 50% visible. A Replay button appears on completion.",
      structure: {
        canvas: "675x443",
        fps: 60,
        outPointFrames: 794.4,
        durationSeconds: 13.24,
        topLevelLayers: { precomp: 58, null: 47, shape: 19 },
        pathShapes: 680,
        embeddedImages:
          "10 embedded PNGs: three strips (315x66, 165x66, 681x66), one 107x164, six 254x388",
        dominantFills: "#FFFFFF (454), #000000 (31), #828282 (12), others in grays",
        layerNames: "MISSING",
        textLayers: 0,
      },
      depicts: "MISSING",
    },
    scene1Lottie: {
      path: "public/Scene-1.json",
      playback: "Loops with autoplay in the Get Started step 1 box.",
      structure: {
        canvas: "640x360",
        fps: 60,
        outPointFrames: 243,
        durationSeconds: 4.05,
        topLevelLayers: { precomp: 136, null: 40, shape: 2 },
        pathShapes: 226,
        embeddedImages: "One 1x1 placeholder PNG only",
        dominantFills: "#BABABA (131 fills), #757575 (4), #000000 (3), grays",
        layerNames: "MISSING",
        textLayers: 0,
      },
      depicts: "MISSING",
      legacyComment: "Lottie Animation for Search",
    },
    codeSimulation: {
      path: "public/step2-animation.js",
      initialStatus: "Initializing search...",
      statusSuffix: "...",
      sequences: [
        {
          status: "Parsing search parameters",
          lines: [
            "const query = {",
            "  topic: 'organic skincare',",
            "  format: 'viral ad video',",
            "  minViews: 500000,",
            "  minComments: 300",
            "};",
            "// Expanded to 847 keywords",
          ],
        },
        {
          status: "Scanning TikTok, Reels, Shorts",
          lines: [
            "const platforms = ['tiktok', 'instagram', 'youtube'];",
            "const results = await scanAll(platforms, query);",
            "",
            "console.log('Found', results.length, 'videos');",
            "// Scanned 24,847 videos",
          ],
        },
        {
          status: "Filtering viral content",
          lines: [
            "const viral = results.filter(v => {",
            "  return v.views > 500000 &&",
            "         v.comments > 300 &&",
            "         v.velocity > 10000;",
            "});",
            "// 127 high-potential matches",
          ],
        },
        {
          status: "Analyzing hook patterns",
          lines: [
            "const analyzed = await analyzeHooks(viral);",
            "const top = analyzed",
            "  .sort((a, b) => b.score - a.score)",
            "  .slice(0, 12);",
            "",
            "// Report ready: 12 videos identified",
          ],
        },
      ],
    },
  },
  head: {
    title: "ContHunt | Analyze Viral Videos",
    description:
      "Find viral short-form videos from TikTok, Instagram, YouTube & analyze with AI. Discover virality patterns, copy winning UGC ADs, download shorts reels.",
    keywords:
      "content research, viral video analysis, TikTok analytics, content intelligence, social media research, content strategy, trend analysis",
    ogImage: "https://conthunt.app/banner.png",
  },
};
