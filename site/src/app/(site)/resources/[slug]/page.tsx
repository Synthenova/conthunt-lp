import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceArticle } from "@/components/pages/resources";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import { getPost, getPostSlugs } from "@/lib/blog/posts";
import { postSeoTitle } from "@/lib/blog/seo";
import { ROUTES } from "@/lib/links";
import { DESCRIPTION_MAX, SITE_NAME, clamp } from "@/lib/seo/site";

type Props = { params: Promise<{ slug: string }> };

/** Only the posts in content/blog exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

/**
 * <title>, og:title and twitter:title use the short search title (60 characters or fewer; see
 * `src/lib/blog/seo.ts`). The share image and its per-post alt text come from the sibling
 * `opengraph-image.tsx`, which is why no `images` are listed here.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const url = ROUTES.article(post.slug);
  const title = postSeoTitle(post);
  const description = clamp(post.excerpt, DESCRIPTION_MAX);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      locale: "en_US",
      title,
      description,
      url,
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [post.author],
      section: post.category,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return (
    <>
      <ArticleJsonLd post={post} />
      <ResourceArticle slug={slug} />
    </>
  );
}
