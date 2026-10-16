/**
 * BlogCard: cover on top, then mono meta, title and a two-line dim excerpt.
 * Shared by the home gallery, the /resources grid and the article "Keep reading" row.
 *
 *   <BlogCard post={post} />                              // gallery / grid card
 *   <BlogCard post={post} variant="grid" showDate />      // adds the date and a "Read" cue
 *   <BlogCard post={post} sizes="(min-width:1280px) 280px, 85vw" priority />
 *
 * The whole card is one link (stretched from the title), so the card stays one
 * tab stop. Hover or focus: the cover image scales to 1.03 and the fragment lifts
 * 4px (BlogCover reads `data-cover-host`), and the title underline slides in.
 * Server component; only the cover is a client island.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDate, formatReading, type PostSummary } from "@/lib/blog";
import { ROUTES } from "@/lib/links";
import { BlogCover } from "./cover/blog-cover";
import { toneInkText, toneMarkBg } from "@/lib/tones";
import { categoryHue } from "./category-hue";
import { CARD_LINK, CARD_RING, TEXT_SOFT } from "./inset";

export interface BlogCardProps {
  post: PostSummary;
  variant?: "gallery" | "grid";
  /** Show the publish date and a "Read" cue under the excerpt. */
  showDate?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function PostMeta({ post, className }: { post: PostSummary; className?: string }) {
  const hue = categoryHue(post.category);
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.02em] tabular-nums",
        TEXT_SOFT,
        className,
      )}
    >
      <span className={cn("inline-flex items-center gap-1.5", toneInkText[hue])}>
        <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", toneMarkBg[hue])} />
        {post.category}
      </span>
      <span aria-hidden="true" className="text-faint">
        ·
      </span>
      <span>{formatReading(post.readingMinutes)}</span>
    </p>
  );
}

export function BlogCard({ post, variant = "gallery", showDate = false, sizes, priority, className }: BlogCardProps) {
  return (
    <article
      data-cover-host
      data-blog-card
      className={cn("group/card relative flex flex-col gap-5 rounded-[20px]", CARD_RING, className)}
    >
      <BlogCover cover={post.cover} sizes={sizes} priority={priority} />
      <div className="flex flex-1 flex-col gap-3">
        <PostMeta post={post} />
        <h3
          className={cn(
            "text-balance font-semibold tracking-[-0.02em] text-ink",
            variant === "grid" ? "text-[20px] leading-[1.22]" : "text-[18px] leading-[1.25] md:text-[19px]",
          )}
        >
          <Link href={ROUTES.article(post.slug)} data-card-link className={CARD_LINK}>
            <span className="box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-[position:0_100%] bg-no-repeat pb-[2px] transition-[background-size] duration-500 ease-out group-hover/card:bg-[length:100%_1.5px] group-focus-within/card:bg-[length:100%_1.5px]">
              {post.title}
            </span>
          </Link>
        </h3>
        <p className="line-clamp-2 text-[15px] leading-[1.5] tracking-[-0.003em] text-ink-2/75">{post.excerpt}</p>
        {showDate && (
          <p
            className={cn(
              "mt-auto flex items-center justify-between pt-1 font-mono text-[11px] uppercase tracking-[0.02em] tabular-nums",
              TEXT_SOFT,
            )}
          >
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="inline-flex items-center gap-1 text-ink transition-transform duration-300 ease-out group-hover/card:translate-x-0.5">
              Read
              <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-out group-hover/card:-translate-y-px group-hover/card:translate-x-px" />
            </span>
          </p>
        )}
      </div>
    </article>
  );
}
