/**
 * Same share image as a Resources article, for a legacy post at `/blog/<slug>`.
 */
import { formatReading } from "@/lib/blog";
import { getBlogSlugs, getPost } from "@/lib/blog/posts";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-assets";
import { renderOgCard } from "@/lib/seo/og-card";

type Params = { slug: string };

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateImageMetadata({ params }: { params: Promise<Params> | Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  return [
    {
      id: "cover",
      alt: post
        ? `${post.title} (ContHunt ${post.category} article, ${formatReading(post.readingMinutes)})`
        : "ContHunt article",
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
    title: post?.title ?? "ContHunt",
    plate: post ? post.cover.plate1600 : "/blog/plates/_index-1600.webp",
    background: post?.cover.dominant,
  });
}
