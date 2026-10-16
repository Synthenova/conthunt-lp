"use client";

/**
 * NicheSelector: the sticky "All + 20 niches" filter row.
 *
 * A single horizontally scrolling tablist with alpha-faded edges. The active pill is ink
 * on paper text; it moves between pills by animating the clip-path of an inverted copy of
 * the row, so only a compositor-friendly property changes. Keyboard: Tab enters the row on
 * the active pill, Arrow keys / Home / End move focus, Enter or Space selects.
 */
import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { EASE, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import type { ViralNowNiche } from "@/lib/viral-now/types";
import { nicheHue } from "@/content/viral-now/niche-hues";
import { toneVars } from "@/lib/tones";
import { HScroller, type HScrollerHandle } from "./h-scroller";
import { PANEL_ID, tabId } from "./ids";
import styles from "./viral-now.module.css";

export interface NicheSelectorProps {
  niches: ViralNowNiche[];
  active: string | null;
  onSelect: (slug: string | null) => void;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function NicheSelector({ niches, active, onSelect }: NicheSelectorProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HScrollerHandle>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pills = useRef(new Map<string, HTMLButtonElement>());
  const placed = useRef(false);

  const key = (slug: string | null) => slug ?? "__all";

  const place = useCallback(
    (animate: boolean) => {
      const track = trackRef.current;
      const overlay = overlayRef.current;
      const pill = pills.current.get(key(active));
      if (!track || !overlay || !pill) return;
      const left = pill.offsetLeft;
      const right = Math.max(track.offsetWidth - left - pill.offsetWidth, 0);
      const clipPath = `inset(0px ${right}px 0px ${left}px round 8px)`;
      if (!animate || prefersReducedMotion()) {
        gsap.killTweensOf(overlay);
        gsap.set(overlay, { clipPath });
      } else {
        gsap.to(overlay, { clipPath, duration: 0.55, ease: EASE.out, overwrite: true });
      }
      track.dataset.ready = "true";
    },
    [active],
  );

  // Move the highlight whenever the active pill changes (instant on the first placement).
  useIsoLayoutEffect(() => {
    place(placed.current);
    placed.current = true;
  }, [place]);

  // Keep the highlight aligned through resizes and webfont swaps; bring the active pill into view.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const resize = new ResizeObserver(() => place(false));
    resize.observe(track);
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) place(false);
    });
    return () => {
      cancelled = true;
      resize.disconnect();
    };
  }, [place]);

  useEffect(() => {
    const pill = pills.current.get(key(active));
    if (pill) scrollerRef.current?.revealChild(pill);
  }, [active]);

  // The bar sticks under the navbar, and to the top edge while the navbar is slid away (it hides on
  // scroll down). It follows the navbar's `data-hidden` and, because moving the sticky offset jumps
  // the bar, a short transform tween (FLIP) carries it between the two positions.
  useEffect(() => {
    const bar = barRef.current;
    const sentinel = sentinelRef.current;
    if (!bar || !sentinel) return;
    const header = document.querySelector<HTMLElement>("header[data-hidden]");
    let io: IntersectionObserver | null = null;

    // Hairline under the bar once it is stuck.
    const watchStuck = () => {
      io?.disconnect();
      const top = parseFloat(getComputedStyle(bar).top) || 0;
      io = new IntersectionObserver(
        ([entry]) => {
          bar.dataset.stuck = String(!entry.isIntersecting && entry.boundingClientRect.top < top);
        },
        { rootMargin: `-${Math.round(top) + 1}px 0px 0px 0px`, threshold: 0 },
      );
      io.observe(sentinel);
    };

    const follow = (animate: boolean) => {
      const hidden = header?.dataset.hidden === "true";
      if ((bar.dataset.navHidden === "true") === hidden) return;
      const before = bar.getBoundingClientRect().top;
      gsap.killTweensOf(bar);
      gsap.set(bar, { clearProps: "transform" });
      bar.dataset.navHidden = String(hidden);
      const shift = before - bar.getBoundingClientRect().top;
      watchStuck();
      if (animate && Math.abs(shift) > 1 && !prefersReducedMotion()) {
        gsap.fromTo(bar, { y: shift }, { y: 0, duration: 0.45, ease: EASE.out, clearProps: "transform" });
      }
    };

    watchStuck();
    follow(false);
    const watch = header ? new MutationObserver(() => follow(true)) : null;
    if (header) watch?.observe(header, { attributes: true, attributeFilter: ["data-hidden"] });
    return () => {
      io?.disconnect();
      watch?.disconnect();
      gsap.killTweensOf(bar);
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const order = [null, ...niches.map((n) => n.slug)];
    const focused = order.findIndex((slug) => pills.current.get(key(slug)) === document.activeElement);
    const current = focused >= 0 ? focused : order.indexOf(active);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % order.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + order.length) % order.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = order.length - 1;
    else return;
    event.preventDefault();
    const pill = pills.current.get(key(order[next]));
    if (pill) {
      pill.focus({ preventScroll: true });
      scrollerRef.current?.revealChild(pill);
    }
  };

  const total = niches.length;

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1, marginBottom: -1 }} />
      <div ref={barRef} className={styles.selectorBar} data-stuck="false" data-nav-hidden="false">
        <HScroller ref={scrollerRef} className={styles.selectorHs} arrows wheel>
          <div
            ref={trackRef}
            className={styles.track}
            role="tablist"
            aria-label={`Niches, ${total} available`}
            aria-orientation="horizontal"
            onKeyDown={onKeyDown}
          >
            <button
              ref={(el) => {
                if (el) pills.current.set(key(null), el);
                else pills.current.delete(key(null));
              }}
              type="button"
              role="tab"
              id={tabId(null)}
              aria-selected={active === null}
              aria-controls={PANEL_ID}
              tabIndex={active === null ? 0 : -1}
              data-active={active === null ? "true" : "false"}
              className={`${styles.pill} ${styles.pillAll}`}
              onClick={() => onSelect(null)}
            >
              <LayoutGrid className="size-4" strokeWidth={2} aria-hidden="true" />
              All
            </button>
            {niches.map((niche) => (
              <button
                key={niche.slug}
                ref={(el) => {
                  if (el) pills.current.set(key(niche.slug), el);
                  else pills.current.delete(key(niche.slug));
                }}
                type="button"
                role="tab"
                id={tabId(niche.slug)}
                aria-selected={active === niche.slug}
                aria-controls={PANEL_ID}
                tabIndex={active === niche.slug ? 0 : -1}
                data-active={active === niche.slug ? "true" : "false"}
                className={styles.pill}
                style={toneVars(nicheHue(niche.slug))}
                onClick={() => onSelect(niche.slug)}
              >
                <PillThumb niche={niche} />
                <span className={styles.pillSwatch} aria-hidden="true" />
                {niche.label}
              </button>
            ))}
            {/* Inverted copy of the row; its clip-path reveals the active pill. Decorative only. */}
            <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
              <span className={`${styles.pill} ${styles.pillAll}`}>
                <LayoutGrid className="size-4" strokeWidth={2} />
                All
              </span>
              {niches.map((niche) => (
                <span key={niche.slug} className={styles.pill} data-tone="" style={toneVars(nicheHue(niche.slug))}>
                  <PillThumb niche={niche} />
                  <span className={styles.pillSwatch} aria-hidden="true" />
                  {niche.label}
                </span>
              ))}
            </div>
          </div>
        </HScroller>
      </div>
    </>
  );
}

function PillThumb({ niche }: { niche: ViralNowNiche }) {
  // The rank 1 poster. A snapshot niche has its summary before its videos have arrived.
  const url = niche.videos[0]?.poster.url ?? niche.summary?.cover ?? null;
  return (
    <span className={styles.pillThumb} aria-hidden="true">
      {url && <Image src={url} alt="" fill sizes="20px" unoptimized loading="lazy" draggable={false} className="object-cover" />}
    </span>
  );
}
