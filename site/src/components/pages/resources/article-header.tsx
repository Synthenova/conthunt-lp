/**
 * ArticleHeader: breadcrumb, mono meta, title (Display M), excerpt, byline and the
 * full-width BlogCover. Server component; only the copy-link button is a client island.
 */
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { BlogCover } from "@/components/sections/blog/cover/blog-cover";
import { RAIL_INSET, TEXT_SOFT } from "@/components/sections/blog/inset";
import { cn } from "@/lib/cn";
import { formatDate, formatReading, type PostSummary } from "@/lib/blog";
import { ROUTES } from "@/lib/links";
import { toneInkText, toneMarkBg } from "@/lib/tones";
import { categoryHue } from "@/components/sections/blog/category-hue";
import { CopyButton } from "./copy-button";

export function ArticleHeader({ post }: { post: PostSummary }) {
  return (
    <Section
      sectionKey="article-header"
      padding="none"
      className="pb-12 pt-[calc(var(--nav-h)+2.5rem)] md:pb-16 md:pt-[calc(var(--nav-h)+4rem)]"
    >
      <div className={RAIL_INSET}>
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[11px] font-medium uppercase tracking-[0.03em] text-ink-2/75">
            <li>
              <Link href={ROUTES.resources} className="transition-colors duration-200 ease-out hover:text-ink">
                Resources
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3" />
            </li>
            <li>
              <Link
                href={`${ROUTES.resources}?c=${post.category}`}
                className={cn("inline-flex items-center gap-1.5 transition-colors duration-200 ease-out hover:brightness-90", toneInkText[categoryHue(post.category)])}
              >
                <span aria-hidden="true" className={cn("size-1.5 rounded-full", toneMarkBg[categoryHue(post.category)])} />
                {post.category}
              </Link>
            </li>
          </ol>
        </nav>

        <p
          className={cn(
            "mt-8 flex flex-wrap items-center gap-x-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.02em] tabular-nums md:mt-10",
            TEXT_SOFT,
          )}
        >
          <span className="text-ink-2">{formatReading(post.readingMinutes)}</span>
          <span aria-hidden="true" className="text-faint">
            ·
          </span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>

        <h1 className="display-m mt-5 max-w-[30ch] text-balance md:mt-6">{post.title}</h1>
        <p className="body-l mt-5 max-w-[60ch] text-ink-2/80">{post.excerpt}</p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-paper shadow-[0_0_0_1px_rgba(15,15,15,0.08)]">
              <Image src="/brand/icon-ink.png" alt="" width={18} height={18} className="size-[18px]" />
            </span>
            <p className="text-[14px] leading-tight tracking-[-0.005em]">
              <span className="block font-medium text-ink">{post.author}</span>
              <span className="block text-ink-2/75">Research notes on short-form video</span>
            </p>
          </div>
          <CopyButton icon="link" label="Copy link" className="bg-surface" />
        </div>
      </div>

      <BlogCover
        cover={post.cover}
        selfHost
        priority
        sizes="(min-width: 1280px) 60vw, (min-width: 768px) 80vw, 100vw"
        className="mt-10 md:mt-12"
        style={{ borderRadius: 24 }}
      />
    </Section>
  );
}
