"use client";

/**
 * ArticleToc: table of contents plus reading progress for an article.
 *
 *   <ArticleToc items={post.toc} />
 *
 * - ≥1280px: a sticky list in the left gutter (outside the rails). The active
 *   section is marked by a rail indicator that glides between items.
 * - <1280px: a collapsed "On this page" card above the article.
 * - A 2px progress bar is fixed to the top of the viewport and a "% read" counter
 *   sits under the list. Both follow `#article-body` (ScrollTrigger, transform only).
 * - Links are plain `#id` anchors, so Lenis scrolls to them with the navbar offset.
 *
 * Render it inside a `relative` wrapper that spans the article body.
 */
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { MOTION_OK, MOTION_REDUCED, prefersReducedMotion } from "@/lib/motion";
import { RAIL_INSET, TEXT_SOFT } from "@/components/sections/blog/inset";
import { cn } from "@/lib/cn";
import { categoryHue } from "@/components/sections/blog/category-hue";
import { toneBaseBg } from "@/lib/tones";
import type { TocItem } from "@/lib/blog";

function TocList({
  items,
  activeId,
  onPick,
  listRef,
}: {
  items: TocItem[];
  activeId: string;
  onPick: (id: string) => void;
  listRef?: React.RefObject<HTMLOListElement | null>;
}) {
  return (
    <ol ref={listRef} className="relative m-0 list-none p-0">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id} data-toc-id={item.id}>
            <a
              href={`#${item.id}`}
              onClick={() => onPick(item.id)}
              aria-current={active ? "location" : undefined}
              className={cn(
                "block py-[7px] pr-1 text-[13px] leading-[1.35] tracking-[-0.005em] transition-colors duration-200 ease-out",
                item.depth === 3 ? "pl-8 text-[12.5px]" : "pl-4",
                active ? "font-medium text-ink" : "text-ink-2/75 hover:text-ink",
              )}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function ArticleToc({ items, category }: { items: TocItem[]; category?: string }) {
  const markerBg = toneBaseBg[categoryHue(category ?? "")];
  const root = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  // Which section is "current": the last heading that has crossed 30% of the viewport.
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      const line = window.innerHeight * 0.3;
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = els[els.length - 1].id;
      setActiveId((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  // The rail indicator glides to the active item.
  useEffect(() => {
    const marker = markerRef.current;
    const list = listRef.current;
    if (!marker || !list) return;
    const li = list.querySelector<HTMLElement>(`[data-toc-id="${CSS.escape(activeId)}"]`);
    if (!li) return;
    const vars = { y: li.offsetTop + 6, scaleY: Math.max(1, li.offsetHeight - 12) };
    if (prefersReducedMotion()) gsap.set(marker, vars);
    else gsap.to(marker, { ...vars, duration: 0.45, ease: EASE.out, overwrite: true });
  }, [activeId]);

  // Reading progress: scrubbed to the article body.
  useGSAP(
    () => {
      const body = document.getElementById("article-body");
      if (!body || !barRef.current) return;
      const mm = gsap.matchMedia();
      const run = () => {
        ScrollTrigger.create({
          trigger: body,
          start: "top 75%",
          end: "bottom 45%",
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(barRef.current, { scaleX: p });
            if (fillRef.current) gsap.set(fillRef.current, { scaleX: p });
            if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100));
          },
        });
      };
      mm.add(MOTION_OK, run);
      mm.add(MOTION_REDUCED, run);
    },
    { scope: root },
  );

  if (!items.length) return null;

  return (
    <div ref={root}>
      <div
        ref={barRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0 bg-ink"
      />

      {/* below xl: collapsed card above the article */}
      <div className={cn("mb-10 xl:hidden", RAIL_INSET)}>
        <details
          className="group/toc rounded-[16px] bg-surface p-1.5"
          open={open}
          onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-[10px] px-3.5 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.03em] text-ink-2/80 marker:hidden [&::-webkit-details-marker]:hidden">
            <span>
              On this page <span className="text-ink-2/75">· {items.length}</span>
            </span>
            <ChevronDown
              className="size-4 transition-transform duration-300 ease-out group-open/toc:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="rounded-[10px] bg-paper px-2 py-2">
            <TocList items={items} activeId={activeId} onPick={() => setOpen(false)} />
          </div>
        </details>
      </div>

      {/* ≥ xl: sticky gutter column */}
      <aside
        aria-label="On this page"
        className="absolute bottom-0 right-[calc(100%+2.5rem)] top-0 hidden w-[184px] xl:block 2xl:w-[224px]"
      >
        <div className="sticky top-[120px] max-h-[calc(100vh-160px)] overflow-y-auto pr-1 [scrollbar-width:none]" data-lenis-prevent-wheel>
          <p className="mb-4 pl-4 font-mono text-[11px] font-medium uppercase tracking-[0.03em] text-ink-2/75">On this page</p>
          <div className="relative">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-hairline" />
            <span
              ref={markerRef}
              aria-hidden="true"
              className={cn("absolute left-0 top-0 h-px w-[2px] origin-top rounded-full will-change-transform", markerBg)}
            />
            <TocList items={items} activeId={activeId} onPick={setActiveId} listRef={listRef} />
          </div>
          <div className="mt-6 pl-4">
            <div className="relative h-px w-full bg-hairline">
              <span ref={fillRef} className="absolute inset-0 origin-left scale-x-0 bg-ink" />
            </div>
            <p className={cn("mt-2.5 font-mono text-[11px] font-medium uppercase tabular-nums tracking-[0.03em]", TEXT_SOFT)}>
              <span ref={pctRef}>0</span>% read
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
