import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/posts";
import { ROUTES } from "@/lib/links";
import { readLegacyUrls } from "@/lib/seo/legacy-sitemap";
import { absoluteUrl } from "@/lib/seo/site";
import { listLiveBoards, nicheSlugFromBoard } from "@/lib/viral-now/api";
import { loadViralNowData } from "@/lib/viral-now/load";

/**
 * /sitemap.xml: the one sitemap for conthunt.app. It holds the canonical, indexable URLs only: this
 * app's pages (Home, Pricing, Support, Viral Now, Resources, every Resources article, and every legacy
 * article at its original `/blog/<slug>` URL) plus the legacy pages nginx still serves
 * (`/docs/**`, `/privacy`, `/terms`), read from the legacy build's own sitemap
 * (src/lib/seo/legacy-sitemap.ts). `/blog` itself redirects to `/resources`, so it is not listed.
 * `/preview/*` is excluded on purpose. Each Viral Now niche is `/viral-now/<slug>`.
 * The legacy RSS feed (/rss.xml) is unchanged.
 *
 * `lastModified` comes from the post dates (ISO `YYYY-MM-DD`, a valid W3C date). /resources takes
 * the newest post date. Home, Pricing, Support and Viral Now carry no `lastModified`: nothing records when
 * they last changed, and a wrong date is worse than none.
 */
function day(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
}

/** One sitemap row per niche. The live board date wins. The snapshot week is the fallback. */
async function nicheEntries(): Promise<MetadataRoute.Sitemap> {
  const niches = loadViralNowData().niches;
  const refreshed = new Map<string, string>();
  try {
    const boards = await listLiveBoards({ revalidate: 3600, timeoutMs: 8_000 });
    for (const board of boards) {
      const slug = nicheSlugFromBoard(board.slug);
      const date = day(board.last_refreshed_at ?? board.updated_at);
      if (date) refreshed.set(slug, date);
    }
  } catch {
    // The snapshot week still dates the row.
  }
  return niches.map((niche) => {
    const lastModified = refreshed.get(niche.slug) ?? day(niche.week_of);
    return {
      url: absoluteUrl(`${ROUTES.viralNow}/${niche.slug}`),
      ...(lastModified ? { lastModified } : {}),
    };
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts(); // newest first
  const newest = posts[0]?.date;
  const owned = new Set(posts.map((post) => post.href));
  const legacy = readLegacyUrls()
    .filter((entry) => entry.path !== "/blog" && !owned.has(entry.path) && !entry.path.startsWith("/blog/"))
    .map((entry) => ({
      url: absoluteUrl(entry.path),
      ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
    }));
  const niches = await nicheEntries();

  return [
    { url: absoluteUrl(ROUTES.home) },
    { url: absoluteUrl(ROUTES.pricing) },
    { url: absoluteUrl(ROUTES.support) },
    { url: absoluteUrl(ROUTES.viralNow) },
    ...niches,
    { url: absoluteUrl(ROUTES.resources), ...(newest ? { lastModified: newest } : {}) },
    ...posts.map((post) => ({ url: absoluteUrl(post.href), lastModified: post.date })),
    ...legacy,
  ];
}
