import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/posts";
import { ROUTES } from "@/lib/links";
import { readLegacyUrls } from "@/lib/seo/legacy-sitemap";
import { absoluteUrl } from "@/lib/seo/site";
import { listLiveBoards, nicheSlugFromBoard } from "@/lib/viral-now/api";
import { loadViralNowData } from "@/lib/viral-now/load";
import { INTEGRATION_PAGES } from "@/content/seo-growth/integrations";
import { COMPARISON_PAGES } from "@/content/seo-growth/comparisons";
import { USE_CASE_PAGES, GLOSSARY_TERMS } from "@/content/seo-growth/entities-and-hubs";
import { ANALYZER_PAGES, FREE_UTILITY_PAGES, GATED_TOOL_PAGES } from "@/content/seo-growth/analyzers-and-tools";
import { getPublicCreatorsDirectory, getPublicCreatorByHandle } from "@/lib/growth/viral-data";

/**
 * /sitemap.xml: the one sitemap for conthunt.app. It holds the canonical, indexable URLs only: this
 * app's pages (Home, Pricing, Support, Tools, Viral Now, Resources, every Resources article, and every legacy
 * article at its original `/blog/<slug>` URL) plus the legacy pages nginx still serves
 * (`/docs/**`, `/privacy`, `/terms`), read from the legacy build's own sitemap
 * (src/lib/seo/legacy-sitemap.ts). `/blog` itself redirects to `/resources`, so it is not listed.
 * `/preview/*` is excluded on purpose. Each Viral Now niche is `/viral-now/<slug>`.
 * The legacy RSS feed (/rss.xml) is unchanged.
 *
 * `lastModified` comes from the post dates (ISO `YYYY-MM-DD`, a valid W3C date). /resources takes
 * the newest post date. Home, Pricing, Support, Tools and Viral Now carry no `lastModified`: nothing records when
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
  const newest = posts.map((post) => post.updated).sort().at(-1);
  const owned = new Set(posts.map((post) => post.href));
  const legacy = readLegacyUrls()
    .filter((entry) => entry.path !== "/blog" && !owned.has(entry.path) && !entry.path.startsWith("/blog/"))
    .map((entry) => ({
      url: absoluteUrl(entry.path),
      ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
    }));
  // These routes are served by nginx, including when the legacy sitemap file is unavailable at runtime.
  for (const path of ["/docs", "/docs/integrations/skill", "/docs/integrations/mcp"]) {
    const url = absoluteUrl(path);
    if (!legacy.some((entry) => entry.url === url)) legacy.push({ url });
  }
  const niches = await nicheEntries();

  return [
    { url: absoluteUrl(ROUTES.home) },
    { url: absoluteUrl(ROUTES.pricing) },
    { url: absoluteUrl(ROUTES.support) },
    { url: absoluteUrl(ROUTES.tools) },
    { url: absoluteUrl(ROUTES.tiktokCalculator) },
    { url: absoluteUrl(ROUTES.instagramCalculator) },
    ...["/integrations", "/compare", "/data", "/data/viral-hooks", "/data/trending-hashtags", "/boards", "/creators", "/use-cases", "/glossary", "/newsletter", "/partners", "/viral-index", ...INTEGRATION_PAGES.map(p => `/integrations/${p.slug}`), ...COMPARISON_PAGES.map(p => `/compare/${p.slug}`), ...USE_CASE_PAGES.map(p => `/use-cases/${p.slug}`), ...GLOSSARY_TERMS.map(p => `/glossary/${p.slug}`), ...ANALYZER_PAGES.map(p => `/${p.slug}`), ...[...FREE_UTILITY_PAGES, ...GATED_TOOL_PAGES].map(p => `/tools/${p.slug}`), ...getPublicCreatorsDirectory().filter(c => c.indexable && c.videoCount >= 3 && getPublicCreatorByHandle(c.handle)).map(c => `/creators/${c.handle}`)].map(path => ({ url: absoluteUrl(path) })),
    { url: absoluteUrl("/about") },
    { url: absoluteUrl("/authors") },
    { url: absoluteUrl("/editorial") },
    { url: absoluteUrl(ROUTES.viralNow) },
    ...niches,
    { url: absoluteUrl(ROUTES.resources), ...(newest ? { lastModified: newest } : {}) },
    ...posts.map((post) => ({ url: absoluteUrl(post.href), lastModified: post.updated })),
    ...legacy,
  ];
}
