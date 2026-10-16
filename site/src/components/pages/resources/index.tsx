/**
 * /resources (blog index) and /resources/[slug] (article) page bodies.
 *
 *   ResourcesPage            default export, used by src/app/(site)/resources/page.tsx
 *   ResourceArticle({slug})  used by src/app/(site)/resources/[slug]/page.tsx
 *
 * Both are server components that read the posts through `@/lib/blog/posts`
 * and wrap their sections in <Rails>, like Home does.
 */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Rails } from "@/components/layout/rails";
import { getAllPosts, getCategoryCounts, getFeaturedPosts, getPost, getRelatedPosts } from "@/lib/blog/posts";
import { ArticleBody } from "./article-body";
import { ArticleEnd } from "./article-end";
import { ArticleHeader } from "./article-header";
import { ArticleToc } from "./article-toc";
import { CtaBand } from "./cta-band";
import { ResourcesBrowser, ResourcesBrowserFallback } from "./resources-browser";
import { ResourcesHeader } from "./resources-header";
import { Section } from "@/components/layout/section";
import { Emphasis } from "@/components/ui/emphasis";
import { ROUTES } from "@/lib/links";
import { ArticleFoot } from "./article-foot";

export default function ResourcesPage() {
  const posts = getAllPosts();
  const featuredSlug = getFeaturedPosts()[0]?.slug ?? posts[0].slug;
  const categories = getCategoryCounts();
  return (
    <Rails>
      <ResourcesHeader latest={posts[0]} total={posts.length} categories={categories.length} />
      <Suspense fallback={<ResourcesBrowserFallback posts={posts} featuredSlug={featuredSlug} />}>
        <ResourcesBrowser posts={posts} featuredSlug={featuredSlug} />
      </Suspense>
      <Section sectionKey="resources-cta" padding="none" className="pb-[var(--section-pad-y)]">
        <CtaBand
          cover={getFeaturedPosts()[0]?.cover ?? posts[0].cover}
          eyebrow="Deep Search"
          title={
            <>
              Read the method. <Emphasis>Paste</Emphasis> it.
            </>
          }
          body="Every guide here starts from a prompt you can paste. Give one to ContHunt and Deep Search watches 500 to 1,000 videos on TikTok, Instagram Reels and YouTube Shorts in under five minutes, then answers with citations."
          secondary={{ href: ROUTES.article("how-deep-search-works"), label: "How it works" }}
        />
      </Section>
    </Rails>
  );
}

export function ResourceArticle({ slug }: { slug: string }) {
  const post = getPost(slug);
  if (!post) notFound();
  const related = getRelatedPosts(slug, 3);

  return (
    <>
      {/* JSON-LD (BlogPosting + BreadcrumbList) is rendered by [slug]/page.tsx via <ArticleJsonLd>. */}
      <Rails>
        <ArticleHeader post={post} />
        <Section
          sectionKey="article"
          padding="none"
          className="pb-[clamp(4rem,8vw,7rem)] pt-4 md:pt-6"
          innerClassName="relative"
        >
          <ArticleToc items={post.toc} category={post.category} />
          <ArticleBody markdown={post.body} />
          <ArticleFoot post={post} />
        </Section>
        <ArticleEnd post={post} related={related} />
      </Rails>
    </>
  );
}
