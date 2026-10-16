/**
 * AllArticlesCard: the sixth gallery card. The shared `_index` plate with a large
 * arrow, the category counts as filter links, and "Read all articles" below.
 * Links to /resources. Same card anatomy as BlogCard so the row stays even.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CoverSpec, PostCategory } from "@/lib/blog";
import { ROUTES } from "@/lib/links";
import { BlogCover } from "./cover/blog-cover";
import { CARD_LINK, CARD_RING, TEXT_SOFT } from "./inset";

export interface AllArticlesCardProps {
  cover: CoverSpec;
  total: number;
  categories: { category: PostCategory; count: number }[];
  sizes?: string;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function AllArticlesCard({ cover, total, categories, sizes, className }: AllArticlesCardProps) {
  return (
    <article
      data-cover-host
      data-blog-card
      className={cn("group/card relative flex flex-col gap-5 rounded-[20px]", CARD_RING, className)}
    >
      <div className="@container relative">
        <BlogCover cover={cover} sizes={sizes} label={false} />
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="flex h-full flex-col justify-between p-[6%]">
            <div className="pointer-events-auto relative flex flex-wrap gap-1.5">
              {categories.map(({ category, count }) => (
                <Link
                  key={category}
                  href={`${ROUTES.resources}?c=${category}`}
                  className="inline-flex h-6 items-center gap-1.5 rounded-full max-md:h-8 bg-paper/70 px-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.02em] tabular-nums text-ink-2 shadow-[0_0_0_1px_rgba(15,15,15,0.06)] backdrop-blur-md transition-[background-color,color] duration-200 ease-out hover:bg-ink hover:text-paper"
                >
                  {category}
                  <span className="opacity-70">{pad(count)}</span>
                </Link>
              ))}
            </div>
            <div className="flex items-end justify-between">
              <span className="rounded-full bg-paper/70 px-3 py-1.5 font-mono text-[11px] font-medium uppercase tabular-nums tracking-[0.02em] text-ink-2 shadow-[0_0_0_1px_rgba(15,15,15,0.06)] backdrop-blur-md">
                {pad(total)} articles
              </span>
              <span className="grid size-[clamp(3.25rem,6.2cqw,4.5rem)] place-items-center rounded-full bg-ink text-paper transition-transform group-hover/card:bg-grad-spectrum-ink group-focus-within/card:bg-grad-spectrum-ink duration-500 ease-out group-hover/card:scale-105 group-focus-within/card:scale-105">
                <ArrowUpRight
                  className="size-[44%] transition-transform duration-500 ease-out group-hover/card:-translate-y-[3px] group-hover/card:translate-x-[3px] group-focus-within/card:-translate-y-[3px] group-focus-within/card:translate-x-[3px]"
                  strokeWidth={1.6}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <p
          className={cn(
            "font-mono text-[11px] font-medium uppercase leading-none tracking-[0.02em] tabular-nums",
            TEXT_SOFT,
          )}
        >
          <span className="text-ink-2">Resources</span> <span aria-hidden="true" className="text-faint">·</span> {categories.length} categories
        </p>
        <h3 className="text-balance text-[18px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink md:text-[19px]">
          <Link href={ROUTES.resources} data-card-link className={CARD_LINK}>
            <span className="box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-[position:0_100%] bg-no-repeat pb-[2px] transition-[background-size] duration-500 ease-out group-hover/card:bg-[length:100%_1.5px] group-focus-within/card:bg-[length:100%_1.5px]">
              Read all articles
            </span>
          </Link>
        </h3>
        <p className="line-clamp-2 text-[15px] leading-[1.5] tracking-[-0.003em] text-ink-2/75">
          Hooks, formats, trends and tooling, from the team behind Deep Search.
        </p>
      </div>
    </article>
  );
}
