import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/posts";
import { ROUTES } from "@/lib/links";
import { absoluteUrl } from "@/lib/seo/site";

/**
 * /sitemap.xml: the canonical, indexable URLs only (Home, Pricing, Viral Now, Resources and every
 * article). `/preview/*` is excluded on purpose, and so are the `/viral-now?niche=` views, which
 * canonicalise to `/viral-now`.
 *
 * `lastModified` comes from the post dates (ISO `YYYY-MM-DD`, a valid W3C date). /resources takes
 * the newest post date. Home, Pricing and Viral Now carry no `lastModified`: nothing records when
 * they last changed, and a wrong date is worse than none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts(); // newest first
  const newest = posts[0]?.date;

  return [
    { url: absoluteUrl(ROUTES.home) },
    { url: absoluteUrl(ROUTES.pricing) },
    { url: absoluteUrl(ROUTES.viralNow) },
    { url: absoluteUrl(ROUTES.resources), ...(newest ? { lastModified: newest } : {}) },
    ...posts.map((post) => ({ url: absoluteUrl(ROUTES.article(post.slug)), lastModified: post.date })),
  ];
}
