// Legacy bento ("Intelligence, not just search.") copy, verbatim from index.html (lines 705-878).
// Sample outputs in the Deep Research card are illustrative legacy mock copy, not measured data.
// Titles longer than two words are kept verbatim; the owner's brief asks for 1-2 word captions.

export type BentoSample = {
  label: string;
  text: string;
};

export type BentoItem = {
  title: string;
  body: string;
  iconId: string;
  /** Legacy tile size, for reference only. */
  legacySize: "wide" | "tall" | "small";
  samples: BentoSample[];
};

export type BentoContent = {
  heading: string;
  subhead: string;
  items: BentoItem[];
};

export const data: BentoContent = {
  heading: "Intelligence, not just search.",
  subhead: "Everything you need to reverse-engineer virality.",
  items: [
    {
      title: "Multi-Platform Aggregation",
      body: "Search keywords, hashtags, or creators across TikTok, YouTube Shorts, Instagram Reels, and LinkedIn simultaneously.",
      iconId: "lucide:globe",
      legacySize: "wide",
      samples: [],
    },
    {
      title: "Deep Research Agent",
      body: "Like NotebookLM for short-form. Our AI analyzes hooks, pacing, visuals, and script structure.",
      iconId: "lucide:scan-eye",
      legacySize: "tall",
      samples: [
        {
          label: "Analysis",
          text: "The video retains 80% of viewers at 3s due to the visual disruption effect.",
        },
        {
          label: "Script",
          text: "Wait, don't throw that away...",
        },
        {
          label: "Metrics",
          text: "Hook Score: 92/100 • Virality Index: 8.4x • Est. Reach: 2.1M",
        },
      ],
    },
    {
      title: "Niche Hunter",
      body: "Find low-competition, high-velocity topics tailored to your brand.",
      iconId: "lucide:radar",
      legacySize: "small",
      samples: [],
    },
    {
      title: "Velocity Metrics",
      body: "Identify videos that are growing faster than the creator's average.",
      iconId: "lucide:bar-chart-2",
      legacySize: "small",
      samples: [],
    },
  ],
};
