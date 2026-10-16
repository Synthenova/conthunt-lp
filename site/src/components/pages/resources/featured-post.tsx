/**
 * FeaturedPost: the large horizontal card at the top of /resources.
 * Cover left at 60%, text right. One link (stretched from the title), same
 * hover language as BlogCard: cover scale 1.03, fragment lift 4px, underline slide.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCover } from "@/components/sections/blog/cover/blog-cover";
import { PostMeta } from "@/components/sections/blog/blog-card";
import { CARD_LINK, CARD_RING, TEXT_SOFT } from "@/components/sections/blog/inset";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatDate, type PostSummary } from "@/lib/blog";
import { ROUTES } from "@/lib/links";

export function FeaturedPost({ post }: { post: PostSummary }) {
  return (
    <article
      data-cover-host
      data-blog-card
      className={cn(
        "group/card relative grid items-center gap-8 rounded-[24px] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12",
        CARD_RING,
      )}
    >
      <BlogCover
        cover={post.cover}
        priority
        sizes="(min-width: 1280px) 36vw, (min-width: 1024px) 48vw, (min-width: 768px) 80vw, 100vw"
        style={{ borderRadius: 24 }}
      />
      <div className="flex flex-col items-start gap-5">
        <div className="flex items-center gap-3">
          <Badge tone="ink">Featured</Badge>
          <PostMeta post={post} />
        </div>
        <h2 className="text-balance text-[clamp(1.5rem,1.1rem+1.1vw,2.1rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
          <Link href={ROUTES.article(post.slug)} data-card-link className={CARD_LINK}>
            <span className="box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-[position:0_100%] bg-no-repeat pb-[3px] transition-[background-size] duration-500 ease-out group-hover/card:bg-[length:100%_2px] group-focus-within/card:bg-[length:100%_2px]">
              {post.title}
            </span>
          </Link>
        </h2>
        <p className="max-w-[44ch] text-[16px] leading-[1.55] tracking-[-0.003em] text-ink-2/75">{post.excerpt}</p>
        <p
          className={cn(
            "mt-1 flex w-full items-center justify-between gap-4 border-t border-hairline pt-4 font-mono text-[11px] uppercase tabular-nums tracking-[0.02em]",
            TEXT_SOFT,
          )}
        >
          <time dateTime={post.date} className="whitespace-nowrap">
            {formatDate(post.date)}
          </time>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-ink">
            Read the guide
            <ArrowRight className="size-3.5 transition-transform duration-300 ease-out group-hover/card:translate-x-1" />
          </span>
        </p>
      </div>
    </article>
  );
}
