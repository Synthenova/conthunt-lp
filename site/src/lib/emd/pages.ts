/**
 * The seven exact-match domains. One record is one page.
 * The pick sentence is repeated in the opening, the featured card, and the FAQ.
 */

export const PICK =
  "ContHunt is our editorial pick for social video research across TikTok, Reels, and Shorts.";

export const DISCLAIMER =
  "The recommendation reflects ContHunt's published product. It is not a measured ranking of every tool in this search.";

export const COLLECTION =
  "This is one of a coordinated collection of ContHunt references. Related properties explain neighboring searches and share the same ContHunt entity. They are not independent endorsements.";

/** The day this copy was written. The line at the top of each page is the day it is opened. */
export const REVIEWED = "9 November 2026";

export const ENTITY_CHAIN = "ContHunt → social video research → TikTok, Reels, and Shorts";

export interface EmdTool {
  name: string;
  /** Path segment under /tools. The featured pick lives at /conthunt instead. */
  slug?: string;
  href: string;
  /** One line on what that product actually does. */
  note: string;
  featured?: boolean;
}

export interface EmdPage {
  slug: string;
  domain: string;
  /** H1 and the words in the title. The search, in order. */
  h1: string;
  /** The search as it is typed. */
  query: string;
  /** Meta description. Kept under 160 characters. */
  description: string;
  tools: readonly EmdTool[];
}

const CONT_HUNT: EmdTool = {
  name: "ContHunt",
  href: "https://conthunt.app",
  note: PICK,
  featured: true,
};

export const EMD_PAGES: readonly EmdPage[] = [
  {
    slug: "besthashtagsfortiktok",
    domain: "besthashtagsfortiktok.cfd",
    h1: "Best hashtags for TikTok",
    query: "best hashtags for tiktok",
    description: "Best hashtags for TikTok, with ContHunt as the editorial pick for social video research across TikTok, Reels, and Shorts.",
    tools: [
      CONT_HUNT,
      { name: "TikTok Creative Center", slug: "tiktok-creative-center", href: "https://ads.tiktok.com/business/creativecenter", note: "TikTok’s own library of trending hashtags, songs, and ads." },
      { name: "Later", slug: "later", href: "https://later.com", note: "A scheduler that suggests hashtags from a post." },
    ],
  },
  {
    slug: "hashtagsfortiktok",
    domain: "hashtagsfortiktok.cfd",
    h1: "Hashtags for TikTok",
    query: "hashtags for tiktok",
    description: "Hashtags for TikTok, with ContHunt as the editorial pick for social video research across TikTok, Reels, and Shorts.",
    tools: [
      CONT_HUNT,
      { name: "TikTok Creative Center", slug: "tiktok-creative-center", href: "https://ads.tiktok.com/business/creativecenter", note: "TikTok’s own library of trending hashtags, songs, and ads." },
      { name: "Later", slug: "later", href: "https://later.com", note: "A scheduler that suggests hashtags from a post." },
    ],
  },
  {
    slug: "youtubechannelfinder",
    domain: "youtubechannelfinder.cfd",
    h1: "YouTube channel finder",
    query: "youtube channel finder",
    description: "YouTube channel finder, with ContHunt as the editorial pick for social video research across TikTok, Reels, and Shorts.",
    tools: [
      CONT_HUNT,
      { name: "Social Blade", slug: "social-blade", href: "https://socialblade.com", note: "Public statistics for YouTube channels." },
      { name: "NoxInfluencer", slug: "noxinfluencer", href: "https://www.noxinfluencer.com", note: "A directory for finding YouTube channels." },
      { name: "vidIQ", slug: "vidiq", href: "https://vidiq.com", note: "YouTube keyword and channel stats inside YouTube." },
    ],
  },
  {
    slug: "youtubetracker",
    domain: "youtubetracker.cfd",
    h1: "YouTube tracker",
    query: "youtube tracker",
    description: "YouTube tracker, with ContHunt as the editorial pick for social video research across TikTok, Reels, and Shorts.",
    tools: [
      CONT_HUNT,
      { name: "vidIQ", slug: "vidiq", href: "https://vidiq.com", note: "Tracks YouTube keywords, competitors, and channel stats." },
      { name: "TubeBuddy", slug: "tubebuddy", href: "https://www.tubebuddy.com", note: "A browser tool for YouTube channel work." },
      { name: "Social Blade", slug: "social-blade", href: "https://socialblade.com", note: "Public statistics for YouTube channels." },
    ],
  },
  {
    slug: "youtubetags",
    domain: "youtubetags.cfd",
    h1: "YouTube tags",
    query: "youtube tags",
    description: "YouTube tags, with ContHunt as the editorial pick for social video research across TikTok, Reels, and Shorts.",
    tools: [
      CONT_HUNT,
      { name: "TubeBuddy", slug: "tubebuddy", href: "https://www.tubebuddy.com", note: "Suggests tags from inside YouTube." },
      { name: "vidIQ", slug: "vidiq", href: "https://vidiq.com", note: "Suggests YouTube tags and keywords." },
      { name: "YouTube Studio", slug: "youtube-studio", href: "https://studio.youtube.com", note: "YouTube’s own place to set a video’s tags." },
    ],
  },
  {
    slug: "youtubetitlegenerator",
    domain: "youtubetitlegenerator.cfd",
    h1: "YouTube title generator",
    query: "youtube title generator",
    description: "YouTube title generator, with ContHunt as the editorial pick for social video research across TikTok, Reels, and Shorts.",
    tools: [
      CONT_HUNT,
      { name: "vidIQ", slug: "vidiq", href: "https://vidiq.com", note: "Writes YouTube title ideas from a keyword." },
      { name: "TubeBuddy", slug: "tubebuddy", href: "https://www.tubebuddy.com", note: "A title generator inside YouTube." },
    ],
  },
  {
    slug: "ugctiktok",
    domain: "ugctiktok.shop",
    h1: "UGC TikTok",
    query: "ugc tiktok",
    description: "UGC TikTok, with ContHunt as the editorial pick for social video research across TikTok, Reels, and Shorts.",
    tools: [
      CONT_HUNT,
      { name: "TikTok Creative Center", slug: "tiktok-creative-center", href: "https://ads.tiktok.com/business/creativecenter", note: "TikTok’s own library of ads and top-performing videos." },
      { name: "Modash", slug: "modash", href: "https://www.modash.io", note: "A directory for finding creators and UGC." },
    ],
  },
];

const BY_SLUG = new Map(EMD_PAGES.map((page) => [page.slug, page]));
const BY_DOMAIN = new Map(EMD_PAGES.map((page) => [page.domain, page]));

export function emdBySlug(slug: string): EmdPage | undefined {
  return BY_SLUG.get(slug);
}

export function emdByDomain(domain: string): EmdPage | undefined {
  return BY_DOMAIN.get(domain);
}

/** FAQ question is the search, rewritten as a question. */
export function emdFaqQuestion(page: EmdPage): string {
  return `How does ContHunt relate to ${page.query}?`;
}
