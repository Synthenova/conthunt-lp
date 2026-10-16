"use client";

/**
 * BlogGallery: the home "Resources" gallery. Six cards (five featured posts plus
 * "Read all articles"), three per view on desktop, with round arrows in the header.
 *
 * - One native scroller (`scroll-snap`), so touch swipe and trackpads just work.
 *   Arrows page by the number of whole cards in view (3 desktop, 2 tablet, 1 mobile)
 *   with a 0.6s `ch.out` GSAP tween on scrollLeft. Mouse drag is handled here too.
 * - Arrows dim at the ends with `aria-disabled` (not `disabled`), so a keyboard user who reaches the
 *   end keeps focus on the button; a press there does nothing but says so in the live region.
 *   Two dots show on mobile (cards 1 to 3, cards 4 to 6). Below lg the right rail fades out the
 *   peeking next card (see PEEK_FADE) instead of hard-clipping it.
 * - Cards fade up once on first view. Reduced motion: no entrance, instant paging.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { CoverSpec, PostCategory, PostSummary } from "@/lib/blog";
import { AllArticlesCard } from "./all-articles-card";
import { BlogCard } from "./blog-card";
import { TEXT_SOFT } from "./inset";

export interface BlogGalleryProps {
  posts: PostSummary[];
  total: number;
  categories: { category: PostCategory; count: number }[];
  indexCover: CoverSpec;
}

const SIZES = "(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 40vw, 80vw";

/**
 * Card width: n cards per view. The percentage resolves against the scroller's content
 * box (the rail inset is padding), and the gap grows with the breakpoint (1rem, 1.25rem, 1.5rem).
 */
const CELL =
  "shrink-0 basis-[calc((100%-(var(--n)-1)*1rem)/var(--n))] md:basis-[calc((100%-(var(--n)-1)*1.25rem)/var(--n))] xl:basis-[calc((100%-(var(--n)-1)*1.5rem)/var(--n))]";

/**
 * Cards sit flush on the rails. The scroller bleeds 12px past each rail (negative margin,
 * equal padding and scroll-padding) so the focus ring (6px offset + 2px outline) and the
 * hover lift are not clipped by the overflow box. 12px is less than the card gap, so no
 * sliver of the neighboring card shows in the bleed.
 */
const TRACK_BLEED = "-mx-3 px-3 scroll-px-3";

/**
 * Below lg the next card peeks past the last whole card (n = 1.15 / 2.15). The scroller's own edge is
 * 12px outside the rail (TRACK_BLEED), so a hard clip there would cut the peek past the rail. The
 * mask ends the peek AT the rail instead (transparent at rail, solid 32px in) and leaves the bleed
 * dead. It only applies while there is a next page, so the last card keeps a crisp right edge, and
 * only below lg, where n = 3 and nothing peeks.
 */
const PEEK_FADE =
  "max-[1023px]:[mask-image:linear-gradient(to_right,#000_calc(100%_-_44px),transparent_calc(100%_-_12px))]";

/** Snap only at page starts: every card on mobile, even cards on tablet, every third on desktop. */
const snapClass = (i: number) =>
  cn(
    "snap-start",
    i % 2 !== 0 && "min-[640px]:max-[1023px]:snap-align-none",
    i % 3 !== 0 && "min-[1024px]:snap-align-none",
  );

/**
 * `disabled` is `aria-disabled`: the button stays focusable (a keyboard user who pages to the end
 * keeps their place), the click does nothing, and the muted look and the missing hover state say so.
 */
function ArrowButton({
  dir,
  disabled,
  onClick,
  onBlocked,
  controls,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  onBlocked: () => void;
  controls: string;
}) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={disabled ? onBlocked : onClick}
      aria-disabled={disabled ? "true" : undefined}
      aria-label={dir === "prev" ? "Previous articles" : "Next articles"}
      aria-controls={controls}
      className={cn(
        "group/arrow relative grid size-11 place-items-center rounded-full bg-surface text-ink",
        "transition-[background-color,color,opacity,scale] duration-200 ease-out",
        "after:absolute after:-inset-1 after:content-['']",
        disabled ? "cursor-default opacity-35" : "hover:bg-ink hover:text-paper active:scale-[0.96]",
      )}
    >
      <Icon
        className={cn(
          "size-[18px] transition-transform duration-300 ease-out",
          !disabled && (dir === "prev" ? "group-hover/arrow:-translate-x-0.5" : "group-hover/arrow:translate-x-0.5"),
        )}
        strokeWidth={1.8}
      />
    </button>
  );
}

export function BlogGallery({ posts, total, categories, indexCover }: BlogGalleryProps) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [nav, setNav] = useState({ index: 0, canPrev: false, canNext: true });
  const [dragging, setDragging] = useState(false);
  // A press on a dimmed arrow says why nothing moved (the tick re-announces a repeated press).
  const [endNote, setEndNote] = useState<{ text: string; tick: number; index: number } | null>(null);
  const cardCount = posts.length + 1;

  const metrics = useCallback(() => {
    const el = scroller.current;
    if (!el) return null;
    const cards = Array.from(el.children) as HTMLElement[];
    const n = parseFloat(getComputedStyle(el).getPropertyValue("--n")) || 3;
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : el.clientWidth;
    const max = el.scrollWidth - el.clientWidth;
    return { el, step, max, pageSize: Math.max(1, Math.floor(n)) };
  }, []);

  const sync = useCallback(() => {
    const m = metrics();
    if (!m) return;
    const index = Math.round(m.el.scrollLeft / m.step);
    const canPrev = m.el.scrollLeft > 4;
    const canNext = m.el.scrollLeft < m.max - 4;
    setNav((s) => (s.index === index && s.canPrev === canPrev && s.canNext === canNext ? s : { index, canPrev, canNext }));
  }, [metrics]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    sync();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [sync]);

  /** Tween scrollLeft with snapping suspended so the two do not fight. */
  const scrollToX = useCallback(
    (x: number) => {
      const m = metrics();
      if (!m) return;
      const target = Math.max(0, Math.min(m.max, x));
      gsap.killTweensOf(m.el);
      if (prefersReducedMotion()) {
        m.el.style.scrollSnapType = "";
        m.el.scrollLeft = target;
        return;
      }
      m.el.style.scrollSnapType = "none";
      gsap.to(m.el, {
        scrollLeft: target,
        duration: 0.6,
        ease: EASE.out,
        onComplete: () => {
          m.el.style.scrollSnapType = "";
        },
      });
    },
    [metrics],
  );

  const page = useCallback(
    (dir: 1 | -1) => {
      const m = metrics();
      if (!m) return;
      const size = m.step * m.pageSize;
      const current = Math.round(m.el.scrollLeft / size);
      scrollToX((current + dir) * size);
    },
    [metrics, scrollToX],
  );

  // Mouse drag (touch uses native scrolling).
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let drag: { x: number; left: number; moved: boolean } | null = null;
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: el.scrollLeft, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) {
        drag.moved = true;
        gsap.killTweensOf(el);
        el.style.scrollSnapType = "none";
        el.setPointerCapture(e.pointerId);
        setDragging(true);
      }
      if (drag.moved) el.scrollLeft = drag.left - dx;
    };
    const up = (e: PointerEvent) => {
      if (!drag) return;
      const { moved, x, left } = drag;
      drag = null;
      if (!moved) return;
      setDragging(false);
      // Swallow the click that follows a drag so cards do not navigate. The browser fires that click
      // straight after pointerup (and not at all when the press and release targets differ), so the
      // guard is disarmed on a timer: a stale one would eat the next real click.
      const swallow = (ev: Event) => ev.preventDefault();
      el.addEventListener("click", swallow, { capture: true, once: true });
      window.setTimeout(() => el.removeEventListener("click", swallow, { capture: true }), 60);
      const m = metrics();
      if (!m) return;
      const size = m.step * m.pageSize;
      const dx = e.clientX - x;
      const start = Math.round(left / size);
      const dir = Math.abs(dx) > 60 ? (dx < 0 ? 1 : -1) : 0;
      scrollToX((start + dir) * size);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [metrics, scrollToX]);

  // Cards rise in once, staggered, when the row first scrolls into view.
  useGSAP(
    () => {
      const el = scroller.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(Array.from(el.children), {
          y: 28,
          opacity: 0,
          duration: 0.7,
          stagger: 0.08,
          clearProps: "opacity,transform",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    },
    { scope: root },
  );

  const blocked = useCallback(
    (dir: "prev" | "next") =>
      setEndNote((n) => ({
        text: dir === "next" ? "You are at the last article." : "You are at the first article.",
        tick: (n?.tick ?? 0) + 1,
        index: nav.index,
      })),
    [nav.index],
  );
  // The note only holds while the gallery stays where it was pressed; paging clears it, so the live
  // region goes back to "Showing article n of N".
  const note = endNote && endNote.index === nav.index ? endNote : null;
  const pageBy = (dir: 1 | -1) => {
    setEndNote(null);
    page(dir);
  };

  const dotPage = nav.index >= 3 ? 1 : 0;
  const first = Math.min(nav.index + 1, cardCount);

  return (
    <div ref={root}>
      {/* Home sections share one left edge: the header and the cards sit flush on the rails. */}
      <div>
        <SectionHeader
          index={7}
          total={8}
          label="Resources"
          title="Learn from what"
          muted={
            <>
              we already <Emphasis>ran</Emphasis>.
            </>
          }
          sub="Guides on hooks, formats, trends and tooling, for teams that brief creators."
          headingClassName="max-w-[24ch]"
          className="max-md:gap-0"
          actions={
            // below md the dots under the track page the gallery, so the arrows would only repeat them
            <div className="hidden items-center gap-3 md:flex">
              <ArrowButton
                dir="prev"
                disabled={!nav.canPrev}
                onClick={() => pageBy(-1)}
                onBlocked={() => blocked("prev")}
                controls="blog-gallery-track"
              />
              <ArrowButton
                dir="next"
                disabled={!nav.canNext}
                onClick={() => pageBy(1)}
                onBlocked={() => blocked("next")}
                controls="blog-gallery-track"
              />
            </div>
          }
        />
      </div>

      <div
        id="blog-gallery-track"
        ref={scroller}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured articles"
        className={cn(
          "mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain py-2 md:mt-12 md:gap-5 xl:gap-6",
          TRACK_BLEED,
          nav.canNext && PEEK_FADE,
          "[--n:1.15] min-[640px]:[--n:2.15] min-[1024px]:[--n:3]",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "min-[1024px]:cursor-grab",
          dragging && "cursor-grabbing select-none [&_a]:pointer-events-none",
        )}
      >
        {posts.map((post, i) => (
          <div key={post.slug} className={cn(CELL, snapClass(i))}>
            <BlogCard post={post} sizes={SIZES} />
          </div>
        ))}
        <div className={cn(CELL, snapClass(posts.length))}>
          <AllArticlesCard cover={indexCover} total={total} categories={categories} sizes={SIZES} />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between md:hidden">
        <div className="-ml-1.5 flex items-center" role="group" aria-label="Gallery pages">
          {[0, 1].map((p) => (
            <button
              key={p}
              type="button"
              aria-label={p === 0 ? "Show articles 1 to 3" : "Show articles 4 to 6"}
              aria-current={dotPage === p}
              onClick={() => {
                const m = metrics();
                if (m) scrollToX(p * 3 * m.step);
              }}
              className="grid h-11 min-w-8 place-items-center"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full bg-ink transition-[width,opacity] duration-300 ease-out",
                  dotPage === p ? "w-6 opacity-100" : "w-1.5 opacity-20",
                )}
              />
            </button>
          ))}
        </div>
        <p className={cn("font-mono text-[11px] uppercase tabular-nums tracking-[0.02em]", TEXT_SOFT)}>
          {String(first).padStart(2, "0")} / {String(cardCount).padStart(2, "0")}
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {note ? <span key={note.tick}>{note.text}</span> : `Showing article ${first} of ${cardCount}`}
      </p>
    </div>
  );
}
