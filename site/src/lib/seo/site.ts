/**
 * Site-wide SEO constants and URL helpers. Pure module: safe on server and client.
 *
 * The origin comes from `src/lib/links.ts` (SITE_URL) so there is one place to change it.
 * Limits follow common SERP truncation: titles 60 characters, descriptions 160.
 */
import { SITE_URL } from "@/lib/links";

export { SITE_URL };

export const SITE_NAME = "ContHunt";

/** Brand suffix the root layout's title template appends ("%s · ContHunt"). */
export const TITLE_SUFFIX = ` · ${SITE_NAME}`;

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

/**
 * Default share image: `public/og-default.jpg`, 1200x630, ~114KB, a centre crop of the legacy
 * `public/banner.png` (1202x630, 646KB), which stays in place for the legacy page.
 */
export const DEFAULT_OG_IMAGE = { url: "/og-default.jpg", width: 1200, height: 630, alt: "ContHunt" } as const;

/** The deep-search product in one sentence. Kept truthful: three platforms, 500 to 1,000 videos. */
export const PRODUCT_SUMMARY =
  "ContHunt is a short-form video research tool. Deep Search takes one question, searches TikTok, Instagram Reels and YouTube Shorts, watches 500 to 1,000 videos in under five minutes and returns a ranked answer backed by the video data.";

/** Absolute URL for a site path. The home page has no trailing slash, matching Next's canonical output. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  if (path === "/" || path === "") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * The full `<title>` for a page title under the root template: "Title · ContHunt" when that fits in
 * 60 characters, otherwise the title alone. Pass the result as `title: { absolute }`.
 */
export function fullTitle(title: string): string {
  const withBrand = `${title}${TITLE_SUFFIX}`;
  return withBrand.length <= TITLE_MAX ? withBrand : title;
}

/** Shortens `text` to `max` characters at a word boundary with an ellipsis. Last-resort guard only. */
export function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–—]+$/, "")}…`;
}
