/**
 * Search-result titles for articles.
 *
 * An article's on-page headline can run past the 60 characters a search result shows (and the
 * root layout appends " · ContHunt"), so each post may carry a shorter title for `<title>`,
 * og:title and twitter:title. The H1, the cards and the BlogPosting `headline` keep the full title.
 *
 * Add an entry here when a new post's title plus " · ContHunt" is longer than 60 characters.
 * Without an entry, `postSeoTitle` falls back to the full title, then to a word-boundary cut.
 *
 * Pure module (no `server-only`), so it is safe to import from anywhere.
 */
import { TITLE_MAX, clamp, fullTitle } from "@/lib/seo/site";

/** slug -> short title WITHOUT the brand suffix. Each value is 49 characters or fewer. */
const SEO_TITLES: Record<string, string> = {
  "competitor-content-tracking-what-to-measure-daily": "Track competitor content: what to measure daily",
  "how-deep-search-works": "How Deep Search works: 500 to 1,000 videos",
  "reading-virality-beyond-views": "Reading virality: the metrics beyond views",
  "research-tiktok-hooks-before-you-brief-a-creator": "Research TikTok hooks before you brief a creator",
  "the-3-second-rule-a-hook-taxonomy": "The 3-second rule: a short-form hook taxonomy",
  "ugc-ad-formats-that-sell-a-field-guide": "UGC ad formats that sell, with brief templates",
};

/** The complete `<title>`: 60 characters or fewer, with the brand suffix when it fits. */
export function postSeoTitle(post: { slug: string; title: string }): string {
  const base = SEO_TITLES[post.slug] ?? post.title;
  const full = fullTitle(base);
  return full.length <= TITLE_MAX ? full : clamp(base, TITLE_MAX);
}
