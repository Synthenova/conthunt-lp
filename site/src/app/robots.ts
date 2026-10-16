import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

/**
 * /robots.txt: every crawler (search and AI) may fetch everything except the isolated section
 * previews at `/preview/*`.
 *
 * There is no explicit `Allow: /`. Allowing everything is the default, and the line is worse than
 * redundant: robots.txt parsers that apply the first matching rule (Python's `urllib.robotparser`,
 * several SEO crawlers) would match `Allow: /` before `Disallow: /preview/` and let the previews
 * through. With only the Disallow line, first-match and longest-match parsers agree.
 *
 * `/v1/*` (the backend proxy) is deliberately NOT blocked: the Viral Now boards load from it, and
 * a crawler that renders the page needs those requests.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", disallow: ["/preview/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
