/** ArticleFoot: closing byline row under the article body. */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RAIL_INSET, TEXT_SOFT } from "@/components/sections/blog/inset";
import { cn } from "@/lib/cn";
import { formatDate, type PostSummary } from "@/lib/blog";
import { ROUTES } from "@/lib/links";
import { CopyButton } from "./copy-button";

export function ArticleFoot({ post }: { post: PostSummary }) {
  return (
    <div className={cn("mt-[clamp(3rem,6vw,5rem)]", RAIL_INSET)}>
      <div className="flex max-w-[44rem] flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
        <p className={cn("font-mono text-[11px] font-medium uppercase tabular-nums tracking-[0.02em]", TEXT_SOFT)}>
          <span className="text-ink-2">{post.author}</span> <span className="text-faint">·</span>{" "}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
        <div className="flex items-center gap-1">
          <CopyButton icon="link" label="Copy link" />
          <Link
            href={ROUTES.resources}
            className="group/back inline-flex h-8 items-center gap-2 rounded-chip px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.02em] text-ink-2 transition-[background-color,color] duration-200 ease-out hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft
              className="size-[15px] transition-transform duration-300 ease-out group-hover/back:-translate-x-0.5"
              strokeWidth={1.8}
            />
            All articles
          </Link>
        </div>
      </div>
    </div>
  );
}
