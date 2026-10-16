// Legacy "Get Started" 3-step section and deep-dive video, from index.html (lines 880-1031).
// Step 2 visual is the scripted code simulation in public/step2-animation.js (sequences are in hero-legacy.ts).
// Step 1 visual is public/Scene-1.json (lottie, loops). Step 3 visual is the deep-dive video below.
// Value "MISSING" = the legacy page has no value for this field.

export type GetStartedVisual = {
  kind: "lottie" | "code-simulation" | "video";
  path: string;
};

export type GetStartedStep = {
  number: "01" | "02" | "03";
  title: string;
  body: string;
  visual: GetStartedVisual;
};

export type GetStartedContent = {
  eyebrow: string;
  steps: GetStartedStep[];
  cta: {
    label: string;
    /** The legacy CTA button has no href and no click handler. */
    href: string;
  };
  deepDiveVideo: {
    path: string;
    /** Path as written in the legacy HTML src attribute. */
    urlEncodedPath: string;
    sizeBytes: number;
    poster: string;
    muted: boolean;
    loop: boolean;
    playsInline: boolean;
  };
};

export const data: GetStartedContent = {
  eyebrow: "Get Started",
  steps: [
    {
      number: "01",
      title: "Define Parameters",
      body: "Communicate your needs with the agent and watch it spin up niche keywords based on your requests, along with the mainstream ones.",
      visual: { kind: "lottie", path: "public/Scene-1.json" },
    },
    {
      number: "02",
      title: "Content Search Engine",
      body: "Scan thousands of videos across platforms in minutes, filtering out noise and flagging high-potential content.",
      visual: { kind: "code-simulation", path: "public/step2-animation.js" },
    },
    {
      number: "03",
      title: "Deep Dive",
      body: "Start talking to the video. Get a full breakdown of why it worked, generate similar scripts and set up scouting alerts.",
      visual: { kind: "video", path: "public/conthunt agent - zoom.mp4" },
    },
  ],
  cta: {
    label: "GET STARTED",
    href: "MISSING",
  },
  deepDiveVideo: {
    path: "public/conthunt agent - zoom.mp4",
    urlEncodedPath: "public/conthunt%20agent%20-%20zoom.mp4",
    sizeBytes: 30942365,
    poster: "MISSING",
    muted: true,
    loop: true,
    playsInline: true,
  },
};
