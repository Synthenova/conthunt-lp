"use client";

/**
 * FaqLayout — the two-column frame of the FAQ section and the small client
 * state it needs: the "which question am I on" readout shares the accordion's
 * open index.
 *
 * ≥1024px: a 240px heading column left (sticky), the accordion (about 62–68%)
 * at the right. "Questions," at 48px is 226px wide, so it fits the column.
 * <1024px: stacked. The server-rendered `header` arrives as a prop, so the
 * heading and eyebrow stay server components.
 *
 * The tick bar in the readout is a pointer shortcut: click a tick to open that
 * question (keyboard users already have Arrow/Home/End on the accordion itself,
 * so the bar is aria-hidden and out of the tab order). Hovering a tick previews
 * its number in the readout line.
 */
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { capture } from "@/lib/analytics";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL } from "@/lib/links";
import { FaqAccordion } from "./accordion";
import { ArrowLink } from "./arrow-link";
import type { FaqEntry } from "./items";

const pad = (n: number) => String(n).padStart(2, "0");

function Readout({ count, open, onSelect }: { count: number; open: number | null; onSelect: (index: number) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? open;
  return (
    <div className="mt-10 hidden flex-col gap-3 lg:flex" aria-hidden="true">
      <div className="-mx-0.5 flex items-center" onPointerLeave={() => setHover(null)}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => onSelect(i)}
            onPointerEnter={() => setHover(i)}
            className="group/tick flex h-6 w-7 cursor-pointer items-center justify-center rounded-[4px] px-0.5 outline-none"
          >
            <span
              className={cn(
                "h-[3px] w-full origin-center rounded-full transition-[background-color,transform] duration-300 ease-out group-hover/tick:scale-y-150",
                open === i ? "scale-y-150 bg-ink" : "bg-hairline group-hover/tick:bg-ink/40",
              )}
            />
          </button>
        ))}
      </div>
      <p className="font-mono text-[11px] font-medium uppercase tabular-nums tracking-[0.02em] text-ink-2/75">
        {shown === null ? "All closed" : `Q ${pad(shown + 1)} / ${pad(count)}`}
      </p>
      <p className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.02em] text-ink-2/75 [@media(hover:hover)]:flex">
        <kbd className="rounded-[4px] border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink">↑</kbd>
        <kbd className="rounded-[4px] border border-hairline bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink">↓</kbd>
        <span>between questions</span>
      </p>
    </div>
  );
}

export interface FaqLayoutProps {
  header: ReactNode;
  items: readonly FaqEntry[];
  defaultOpen: number | null;
  /** Render the closing "Still curious?" line. */
  outro: boolean;
}

export function FaqLayout({ header, items, defaultOpen, outro }: FaqLayoutProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const onOpenChange = (next: number | null) => {
    setOpen(next);
    const id = next === null ? undefined : items[next]?.id;
    if (id) capture("faq_opened", { faq_id: id });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
      <div className="lg:sticky lg:top-[calc(var(--nav-h)+32px)] lg:self-start">
        {header}
        <Readout count={items.length} open={open} onSelect={onOpenChange} />
      </div>
      <div className="min-w-0">
        <FaqAccordion items={items} open={open} onOpenChange={onOpenChange} />
        {outro && (
          <p className="mt-8 flex flex-wrap items-center gap-x-2 text-[15px] text-ink-2/75">
            <span>Still curious?</span>
            <ArrowLink href={GET_STARTED_URL} external {...phAttrs("faq", "app")}>
              Get started
            </ArrowLink>
          </p>
        )}
      </div>
    </div>
  );
}
