"use client";

/**
 * GridTopicTile: the closing tile of the /resources grid. It fills the cells the last row of
 * articles leaves empty (1 or 2 at three columns), so the grid ends square, and it is useful
 * at the bottom of a long list: switch topic without scrolling back up to the chips. Picking a
 * row filters the list and glides back to the filter bar.
 *
 * A tray, not a card: no cover, no meta. It stacks the rows in one column, and lays them out in
 * two when the tile is wide enough to span two grid columns (container query, so it follows its
 * own width rather than the viewport). The active topic is inked like the chips above.
 */
import { ArrowRight } from "lucide-react";
import { Emphasis } from "@/components/ui/emphasis";
import { cn } from "@/lib/cn";
import { TEXT_SOFT } from "@/components/sections/blog/inset";

export interface TopicOption {
  value: string;
  count: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function GridTopicTile({
  options,
  value,
  onPick,
  className,
}: {
  options: TopicOption[];
  value: string;
  onPick: (value: string) => void;
  className?: string;
}) {
  return (
    <aside aria-label="Browse by topic" data-grid-card className={cn("@container h-full", className)}>
      <div className="flex h-full min-h-[19rem] flex-col gap-5 rounded-[20px] bg-surface p-5 md:p-6">
        <div className="flex flex-col gap-3">
          <p className={cn("font-mono text-[11px] font-medium uppercase leading-none tabular-nums tracking-[0.02em]", TEXT_SOFT)}>
            <span className="text-ink-2">Library</span> <span className="text-faint">·</span> {pad(options[0]?.count ?? 0)} articles
          </p>
          <h3 className="text-[22px] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            Browse by <Emphasis>topic</Emphasis>
          </h3>
        </div>
        <ul className="m-0 grid list-none gap-1 p-0 @lg:grid-cols-2 @lg:gap-x-4">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  aria-pressed={active}
                  aria-label={`${o.value} ${pad(o.count)} ${o.count === 1 ? "article" : "articles"}`}
                  onClick={() => onPick(o.value)}
                  className={cn(
                    "group/topic flex h-11 w-full items-center justify-between rounded-btn px-3.5 text-left text-[15px] font-medium tracking-[-0.01em]",
                    "transition-[background-color,color,scale] duration-200 ease-out active:scale-[0.98]",
                    active ? "bg-ink text-paper" : "text-ink hover:bg-paper",
                  )}
                >
                  <span aria-hidden="true">{o.value}</span>{" "}
                  <span aria-hidden="true" className="flex items-center gap-2">
                    <span className={cn("font-mono text-[11px] tabular-nums", active ? "text-paper/70" : "text-ink-2/75")}>
                      {pad(o.count)}
                    </span>
                    <ArrowRight
                      className={cn(
                        "size-3.5 -translate-x-1 opacity-0 transition-[opacity,translate] duration-200 ease-out group-hover/topic:translate-x-0 group-hover/topic:opacity-100",
                        active && "translate-x-0 opacity-100",
                      )}
                      strokeWidth={1.8}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
