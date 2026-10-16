"use client";

/**
 * ResourcesBrowser: the interactive body of /resources.
 *
 *  - Category chips (All + categories, with counts) and a text search. A sliding ink
 *    pill follows the active chip. The category lives in the URL as `?c=`
 *    (replaceState, so no history spam and no server round trip).
 *  - "/" focuses the search field.
 *  - On "All" with no search, the featured post leads as a large horizontal card and
 *    the grid shows the rest, newest first. Any filter drops the featured card and
 *    the grid shows every match.
 *  - Grid: 3 columns desktop, 2 tablet, 1 mobile. Cards reorder with a layout
 *    animation; the first reveal on scroll is staggered.
 *
 * `ResourcesBrowser` reads the URL (needs a Suspense boundary); `ResourcesBrowserView`
 * is the same UI with controlled props, used as the static fallback.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, m } from "motion/react";
import { LazyMotionConfig } from "@/components/ui/lazy-motion";
import { Search, X } from "lucide-react";
import { Section } from "@/components/layout/section";
import { useLenis } from "@/components/layout/smooth-scroll";
import { BlogCard } from "@/components/sections/blog/blog-card";
import { RAIL_INSET, TEXT_SOFT } from "@/components/sections/blog/inset";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type PostCategory, type PostSummary } from "@/lib/blog";
import { cn } from "@/lib/cn";
import { toneVars } from "@/lib/tones";
import { categoryHue } from "@/components/sections/blog/category-hue";
import { MOTION_OK, prefersReducedMotion } from "@/lib/motion";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { FeaturedPost } from "./featured-post";
import { GridTopicTile } from "./grid-topic-tile";

export type CategoryFilter = "All" | PostCategory;

export interface ResourcesBrowserProps {
  /** Every post, newest first. */
  posts: PostSummary[];
  /** The post to feature on "All". */
  featuredSlug: string;
}

const parseCategory = (raw: string | null): CategoryFilter => {
  const hit = CATEGORIES.find((c) => c.toLowerCase() === raw?.toLowerCase());
  return hit ?? "All";
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Lower-case and straighten curly quotes, so a typed `'` finds a title that holds a `’`. */
const norm = (s: string) => s.toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');

/**
 * Where the closing topic tile sits: it fills the cells the last row leaves empty. A complete row
 * (a multiple of 3 at `lg`) needs no filler. At two columns the tile spans the row it starts, or a
 * whole new row when the count is even. Tailwind needs the full class names, hence the lookups.
 */
const TILE_LG = { 1: "lg:col-span-1", 2: "lg:col-span-2" } as const;
const TILE_MD = { narrow: "md:col-span-1", wide: "md:col-span-2" } as const;

/**
 * The chip row. From `lg` the chips wrap beside the search field. Below `lg` the row is one
 * horizontal scroller (so the second row never drifts away from the rail), with an edge
 * fade on whichever side still has chips, and the active chip scrolls into view.
 */
function Chips({
  value,
  onChange,
  counts,
  total,
}: {
  value: CategoryFilter;
  onChange: (c: CategoryFilter) => void;
  counts: Record<string, number>;
  total: number;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState({ l: 0, r: 0 });
  const options: { value: CategoryFilter; count: number }[] = [
    { value: "All", count: total },
    ...CATEGORIES.filter((c) => counts[c]).map((c) => ({ value: c as CategoryFilter, count: counts[c] })),
  ];

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      const l = el.scrollLeft > 2 ? 28 : 0;
      const r = max > 2 && el.scrollLeft < max - 2 ? 28 : 0;
      setFade((f) => (f.l === l && f.r === r ? f : { l, r }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  // Keep the active chip in view when the category changes (chip tap or `?c=` link).
  useEffect(() => {
    const el = scroller.current;
    const active = el?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!el || !active || el.scrollWidth <= el.clientWidth + 2) return;
    const target = active.offsetLeft - (el.clientWidth - active.offsetWidth) / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [value]);

  return (
    <LayoutGroup id="resources-chips">
      <div
        ref={scroller}
        role="group"
        aria-label="Filter by category"
        data-lenis-prevent-touch
        style={{ "--fl": `${fade.l}px`, "--fr": `${fade.r}px` } as React.CSSProperties}
        className={cn(
          // One row at every width. The 4px of padding (undone by -mx-1) keeps the focus rings inside the scroller;
          // below 1280px the search field gives way first (it flexes), and a longer chip list scrolls with the fade.
          "-mx-1 flex gap-1.5 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "[mask-image:linear-gradient(to_right,transparent,#000_var(--fl),#000_calc(100%-var(--fr)),transparent)]",
        )}
      >
        {options.map((o) => {
          const active = o.value === value;
          // "All" stays ink; a category takes its hue's soft pill and ink text (COLOR_SYSTEM.md).
          const tone = o.value === "All" ? null : toneVars(categoryHue(o.value));
          return (
            <button
              key={o.value}
              style={tone ?? undefined}
              type="button"
              aria-pressed={active}
              // WCAG 2.5.3: the name opens with the visible text, "All 09", then adds the unit.
              aria-label={`${o.value} ${pad(o.count)} ${o.count === 1 ? "article" : "articles"}`}
              onClick={() => onChange(o.value)}
              className={cn(
                "relative inline-flex h-10 shrink-0 items-center gap-2 rounded-btn px-4 text-[14px] font-medium tracking-[-0.01em]",
                "transition-[color,background-color,scale] duration-200 ease-out active:scale-[0.96]",
                active ? (tone ? "text-[var(--tone-ink)]" : "text-paper") : "text-ink-2 hover:bg-surface",
              )}
            >
              {active && (
                <m.span
                  layoutId="chip-pill"
                  className={cn("absolute inset-0 rounded-btn", tone ? "bg-[var(--tone-soft)]" : "bg-ink")}
                  transition={{ type: "spring", duration: 0.4, bounce: 0 }}
                />
              )}
              <span className="relative" aria-hidden="true">
                {o.value}
              </span>{" "}
              <span
                aria-hidden="true"
                className={cn(
                  "relative font-mono text-[11px] tabular-nums",
                  active ? (tone ? "text-[var(--tone-ink)]" : "text-paper/70") : "text-ink-2/75",
                )}
              >
                {pad(o.count)}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function ResourcesBrowserView({
  posts,
  featuredSlug,
  category,
  onCategory,
}: ResourcesBrowserProps & { category: CategoryFilter; onCategory: (c: CategoryFilter) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const counts: Record<string, number> = {};
  for (const p of posts) counts[p.category] = (counts[p.category] ?? 0) + 1;

  const q = norm(query.trim());
  const filtered = posts.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      (!q || norm(`${p.title} ${p.excerpt} ${p.category}`).includes(q)),
  );
  const showFeatured = category === "All" && !q;
  const featured = showFeatured ? posts.find((p) => p.slug === featuredSlug) : undefined;
  const grid = featured ? filtered.filter((p) => p.slug !== featured.slug) : filtered;
  // The count line must describe the order on screen. With the featured card on top, that order is
  // "featured first, then the rest newest first" (the featured post is not always the newest). Without
  // it (a search or a category), every match is in date order.
  const countLine = featured
    ? `${pad(posts.length)} articles, featured first, then newest`
    : filtered.length === posts.length
      ? `${pad(posts.length)} articles, newest first`
      : `${pad(filtered.length)} of ${pad(posts.length)} articles`;
  const tileLg = (3 - (grid.length % 3)) as 1 | 2;
  const showTile = grid.length > 0 && grid.length % 3 !== 0;
  const lenis = useLenis();
  const topics = [
    { value: "All", count: posts.length },
    ...CATEGORIES.filter((c) => counts[c]).map((c) => ({ value: c as string, count: counts[c] })),
  ];

  // Tile pick: filter, then glide back up to the chip row so the change is visible.
  const pickTopic = (next: string) => {
    onCategory(next as CategoryFilter);
    const bar = document.getElementById("resources-filters");
    if (!bar) return;
    if (lenis) lenis.scrollTo(bar, { offset: -120 });
    else bar.scrollIntoView({ block: "start", behavior: "auto" });
  };

  // "/" jumps to the search field (unless you are already typing somewhere).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // First reveal: cards below the fold rise in once, staggered by batch.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        ScrollTrigger.batch("[data-grid-card]", {
          start: "top 94%",
          once: true,
          onEnter: (batch) =>
            gsap.from(batch, { y: 28, opacity: 0, duration: 0.7, stagger: 0.08, clearProps: "opacity,transform", overwrite: true }),
        });
      });
    },
    { scope: root },
  );

  const reset = useCallback(() => {
    setQuery("");
    onCategory("All");
  }, [onCategory]);

  return (
    <LazyMotionConfig>
      <Section
        sectionKey="resources-list"
        padding="none"
        className="pb-[clamp(4rem,8vw,7rem)] pt-4 md:pt-8"
        innerClassName={RAIL_INSET}
      >
        <div ref={root}>
          <div id="resources-filters" className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Chips value={category} onChange={onCategory} counts={counts} total={posts.length} />
            <div className="@container relative w-full lg:w-auto lg:max-w-64 lg:min-w-40 lg:flex-1">
              <label htmlFor="resources-search" className="sr-only">
                Search articles
              </label>
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-2/75"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <input
                id="resources-search"
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setQuery("");
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Search articles"
                autoComplete="off"
                // The "/" hint needs room: under 200px (the field at 1280) it goes, and so does its padding, so the
                // placeholder still reads in full. With text in the field the clear button always needs the room.
                className={cn(
                  "h-10 w-full appearance-none rounded-btn bg-surface pl-10 text-[14px] text-ink outline-none transition-shadow duration-200 ease-out placeholder:text-ink-2/75 focus:shadow-[0_0_0_2px_var(--accent)] [&::-webkit-search-cancel-button]:hidden",
                  query ? "pr-10" : "pr-3 @min-[200px]:pr-10",
                )}
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-chip text-ink-2/75 transition-colors duration-200 ease-out hover:bg-surface-2 hover:text-ink"
                >
                  <X className="size-3.5" strokeWidth={2} />
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-[6px] bg-paper px-1.5 py-0.5 font-mono text-[11px] text-ink-2/75 shadow-[0_0_0_1px_rgba(15,15,15,0.08)] lg:@min-[200px]:block">
                  /
                </kbd>
              )}
            </div>
          </div>

          <p
            className={cn("mt-5 font-mono text-[11px] uppercase tabular-nums tracking-[0.02em]", TEXT_SOFT)}
            aria-live="polite"
          >
            {countLine}
          </p>

          <AnimatePresence initial={false} mode="popLayout">
            {featured && (
              <m.div
                key="featured"
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.2, 0.715, 0.205, 0.99] }}
                className="mt-8 md:mt-10"
              >
                <FeaturedPost post={featured} />
              </m.div>
            )}
          </AnimatePresence>

          <m.div
            layout
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="mt-[clamp(2.5rem,5vw,4.5rem)] grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3 xl:gap-x-6"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {grid.map((p) => (
                <m.div
                  key={p.slug}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                  className="h-full"
                >
                  <div data-grid-card className="h-full">
                    <BlogCard
                      post={p}
                      variant="grid"
                      showDate
                      className="h-full"
                      sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 26vw, (min-width: 768px) 40vw, 90vw"
                    />
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
            {showTile && (
              <GridTopicTile
                key="topic-tile"
                options={topics}
                value={category}
                onPick={pickTopic}
                className={cn(TILE_MD[grid.length % 2 === 0 ? "wide" : "narrow"], TILE_LG[tileLg])}
              />
            )}
          </m.div>

          {grid.length === 0 && !featured && (
            <div className="mt-10 flex flex-col items-start gap-4 rounded-card bg-surface p-8" role="status">
              <p className="text-[18px] font-semibold tracking-[-0.02em] text-ink">
                No articles match{q ? ` “${query.trim()}”` : " this filter"}.
              </p>
              <p className="text-[15px] text-ink-2/75">Try a different word, or clear the filters.</p>
              <Button variant="primary" size="sm" onClick={reset}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </Section>
    </LazyMotionConfig>
  );
}

/** Static fallback for the Suspense boundary: the "All" view with inert chips. */
export function ResourcesBrowserFallback(props: ResourcesBrowserProps) {
  return <ResourcesBrowserView {...props} category="All" onCategory={() => undefined} />;
}

/**
 * URL-driven: `?c=Research` selects a category and the chips write it back with
 * router.replace (no history entries). Local state is the source of truth for the UI,
 * so chips respond instantly; the URL follows. `pending` stops a late URL commit from an
 * earlier click from overwriting a newer choice, while real external navigation
 * (a link to /resources?c=Guides) still syncs in.
 */
export function ResourcesBrowser(props: ResourcesBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const fromUrl = parseCategory(params.get("c"));
  const [category, setCategory] = useState<CategoryFilter>(fromUrl);
  const pending = useRef<CategoryFilter | null>(null);
  const clear = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (pending.current !== null) {
      if (fromUrl === pending.current) pending.current = null;
      return;
    }
    setCategory(fromUrl);
  }, [fromUrl]);

  useEffect(() => () => window.clearTimeout(clear.current), []);

  const choose = useCallback(
    (next: CategoryFilter) => {
      pending.current = next;
      setCategory(next);
      window.clearTimeout(clear.current);
      clear.current = window.setTimeout(() => {
        pending.current = null;
      }, 1500);
      router.replace(next === "All" ? pathname : `${pathname}?c=${encodeURIComponent(next)}`, { scroll: false });
    },
    [router, pathname],
  );

  return <ResourcesBrowserView {...props} category={category} onCategory={choose} />;
}
