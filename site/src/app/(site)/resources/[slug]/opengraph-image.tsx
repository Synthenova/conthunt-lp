/**
 * Static per-post Open Graph image (1200x630): the post's cover plate with a frosted
 * title card, the category and reading time, and the ContHunt wordmark.
 * Rendered at build time for every slug (generateStaticParams).
 *
 * `generateImageMetadata` gives each post its own `og:image:alt` (and the matching
 * `twitter:image:alt`). A plain `export const alt` is one string for the whole route, so it
 * cannot describe a different image per slug; the metadata function can.
 *
 * Satori (next/og) cannot decode WebP, so the plate is converted to JPEG with sharp. The shared
 * renderer in `src/lib/seo/og-card.tsx` does that and loads Switzer, and it imports `sharp` and
 * `next/og` lazily so Next's static-paths worker (which loads this module only to call
 * `generateStaticParams`) never pulls in the native binding or the Satori/resvg wasm.
 */
import { formatReading } from "@/lib/blog";
import { getPost, getPostSlugs } from "@/lib/blog/posts";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-assets";
import { renderOgCard } from "@/lib/seo/og-card";

type Params = { slug: string };

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

/** One image per post. The id is fixed; the alt text and size are what vary or matter. */
export async function generateImageMetadata({ params }: { params: Promise<Params> | Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  return [
    {
      id: "cover",
      alt: post
        ? `${post.title} (ContHunt ${post.category} article, ${formatReading(post.readingMinutes)})`
        : "ContHunt resources article",
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function OpengraphImage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  return renderOgCard({
    eyebrow: post ? `${post.category}  ·  ${formatReading(post.readingMinutes)}` : "Resources",
    title: post?.title ?? "ContHunt resources",
    plate: post ? post.cover.plate1600 : "/blog/plates/_index-1600.webp",
    background: post?.cover.dominant,
  });
}
