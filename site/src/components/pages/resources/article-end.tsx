/**
 * ArticleEnd: the closing CTA band ("Get started") and three related posts.
 * Server component.
 */
import { Section } from "@/components/layout/section";
import { BlogCard } from "@/components/sections/blog/blog-card";
import { RAIL_INSET } from "@/components/sections/blog/inset";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { PostSummary } from "@/lib/blog";
import { ROUTES } from "@/lib/links";
import { CtaBand } from "./cta-band";

export function ArticleCta({ post }: { post: PostSummary }) {
  return (
    <CtaBand
      cover={post.cover}
      eyebrow="Deep Search"
      title={
        <>
          Ask your own <Emphasis>question</Emphasis>.
        </>
      }
      body="Describe what you need to know. ContHunt searches TikTok, Instagram Reels and YouTube Shorts, watches 500 to 1,000 videos in under five minutes, and returns a cited answer."
      secondary={
        post.slug !== "how-deep-search-works"
          ? { href: ROUTES.article("how-deep-search-works"), label: "How it works" }
          : undefined
      }
    />
  );
}

export function ArticleEnd({ post, related }: { post: PostSummary; related: PostSummary[] }) {
  return (
    <Section sectionKey="article-end" padding="none" className="pb-[var(--section-pad-y)] pt-4 md:pt-8">
      <ArticleCta post={post} />

      <div className={`mt-[clamp(4rem,8vw,7rem)] flex items-end justify-between gap-6 ${RAIL_INSET}`}>
        <div className="flex flex-col gap-4">
          <Eyebrow label="Keep reading" />
          <h2 className="display-m">
            More from the <Emphasis>notebook</Emphasis>
          </h2>
        </div>
        <Button href={ROUTES.resources} variant="secondary" size="sm" className="hidden sm:inline-flex">
          All articles
        </Button>
      </div>
      <div className={`mt-10 grid gap-x-6 gap-y-12 md:grid-cols-3 ${RAIL_INSET}`}>
        {related.map((p) => (
          <BlogCard
            key={p.slug}
            post={p}
            variant="grid"
            showDate
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 26vw, 90vw"
          />
        ))}
      </div>
      <div className={`mt-10 sm:hidden ${RAIL_INSET}`}>
        <Button href={ROUTES.resources} variant="secondary" size="md" className="w-full">
          All articles
        </Button>
      </div>
    </Section>
  );
}
