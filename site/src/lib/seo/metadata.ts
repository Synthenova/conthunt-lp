/**
 * `pageMetadata()` builds the complete per-route `Metadata` for a marketing page.
 *
 * Why a helper: Next shallow-merges metadata per top-level key, so a page that sets only
 * `title` and `description` silently inherits the ROOT layout's whole `openGraph` object
 * (home title, home URL `https://conthunt.app`). A page that sets its own `openGraph` loses
 * the root's `siteName` and images. Setting every social key in one place avoids both.
 *
 * Usage in a route:
 *
 *   export const metadata = pageMetadata({
 *     title: "Pricing",
 *     description: "...",
 *     path: "/pricing",
 *   });
 *
 * Pass `image: false` when the route has a file-based `opengraph-image` (that file then
 * supplies og:image and twitter:image); otherwise the shared banner is used.
 */
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, clamp, DESCRIPTION_MAX, fullTitle } from "./site";

export interface PageMetadataInput {
  /** Page title WITHOUT the brand suffix. The suffix is added when the result stays within 60 characters. */
  title: string;
  /** Meta description, 160 characters or fewer (clamped as a last resort). */
  description: string;
  /** Site-relative path, used for the canonical URL and og:url, for example "/pricing". */
  path: string;
  /** `false` when the route supplies its own opengraph-image file. Default: the shared banner. */
  image?: boolean;
}

export function pageMetadata({ title, description, path, image = true }: PageMetadataInput): Metadata {
  const seoTitle = fullTitle(title);
  const desc = clamp(description, DESCRIPTION_MAX);
  return {
    title: { absolute: seoTitle },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      title: seoTitle,
      description: desc,
      url: path,
      ...(image ? { images: [DEFAULT_OG_IMAGE] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: desc,
      ...(image ? { images: [DEFAULT_OG_IMAGE.url] } : {}),
    },
  };
}
