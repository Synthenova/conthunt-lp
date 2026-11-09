import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceArticle } from "@/components/pages/resources";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import { getBlogSlugs, getPost } from "@/lib/blog/posts";
import { postSeoTitle } from "@/lib/blog/seo";
import { markdownAlternate } from "@/lib/seo/metadata";
import { DESCRIPTION_MAX, SITE_NAME, clamp } from "@/lib/seo/site";

type Props = { params: Promise<{ slug: string }> };

/** Legacy posts keep `/blog/<slug>`. Anything else, including a Resources slug, is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

/**
 * Same article screen as `/resources/[slug]`. The canonical URL stays `/blog/<slug>`.
 * `<title>` uses the short search title. The share image comes from the sibling opengraph image.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || post.section !== "blog") notFound();
  const url = post.href;
  const title = postSeoTitle(post);
  const description = clamp(post.excerpt, DESCRIPTION_MAX);
  return {
    title: { absolute: title },
    description,
    alternates: markdownAlternate(url),
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
  if (!post || post.section !== "blog") notFound();
  return (
    <>
      <ArticleJsonLd post={post} />
      <ResourceArticle slug={slug} />
    </>
  );
}
