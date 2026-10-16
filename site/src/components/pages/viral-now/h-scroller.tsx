"use client";

/**
 * HScroller: the horizontal side-scroller used by the niche rows and the niche selector.
 *
 * - Native `overflow-x: auto` with scroll snapping, so touch and trackpads keep their own
 *   momentum. Mouse users can also drag (pointer events, with a GSAP Inertia glide that
 *   lands on a snap point) and use the hover arrows.
 * - Alpha edge blur: a mask-image fade on both ends plus a thin `backdrop-filter: blur(6px)`
 *   strip under each fade. The fades switch off at the start and end of the track.
 * - The first item lines up with the letterbox left edge (`--hs-pad`), and the track
 *   bleeds to the viewport edges.
 *
 * Children are the scroller's items. Mark each snap target with `data-snap`.
 *
 * Options
 *   arrows        hover arrows (desktop pointers only).
 *   wheel         map notched mouse-wheel input to sideways scrolling while the pointer is over the
 *                 scroller and it can still move that way (trackpads and the page keep their own scroll).
 *   roving        one `[data-roving]` item is a tab stop (the last focused); Arrow keys, Home and End
 *                 move focus along the row, and Tab leaves it.
 *   keepActiveClear  while a card (`button[data-active="true"]`) sits in an edge fade, that fade and
 *                 its blur strip switch off so the hovered or focused card stays readable.
 *
 *   <HScroller as="ul" label="Comedy top 30" arrows className={styles.rowHs}>
 *     <li data-snap>...</li>
 *   </HScroller>
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { cn } from "@/lib/cn";
import { EASE, gsap } from "@/lib/gsap";
import { observeInView } from "@/lib/media";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./viral-now.module.css";

if (typeof window !== "undefined") gsap.registerPlugin(InertiaPlugin);

export interface HScrollerHandle {
  /** The scrolling element. */
  el: HTMLElement | null;
  /** Scroll so `left` is the scrollLeft, animated unless reduced motion is on. */
  scrollToLeft: (left: number, animate?: boolean) => void;
  /** Bring one child fully into view, centered when it is off screen. */
  revealChild: (child: HTMLElement, animate?: boolean) => void;
}

export interface HScrollerProps {
  as?: "div" | "ul";
  /** Accessible name of the scroller. */
  label?: string;
  /** Hover arrows (desktop pointers only). */
  arrows?: boolean;
  /** Map notched mouse-wheel input to sideways scrolling over this scroller. */
  wheel?: boolean;
  /** Roving tab stop over `[data-roving]` items, with Arrow, Home and End keys. */
  roving?: boolean;
  /** Clear the edge fade under a hovered or focused card. */
  keepActiveClear?: boolean;
  className?: string;
  scrollerClassName?: string;
  children: ReactNode;
}

export const HScroller = forwardRef<HScrollerHandle, HScrollerProps>(function HScroller(
  { as: Tag = "div", label, arrows = false, wheel = false, roving = false, keepActiveClear = false, className, scrollerClassName, children },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  /** Where the running programmatic scroll is heading, so repeated arrow clicks add up. */
  const targetRef = useRef<number | null>(null);
  const blurLRef = useRef<HTMLSpanElement>(null);
  const blurRRef = useRef<HTMLSpanElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0, lastX: 0, lastT: 0, v: 0, id: -1 });
  const suppressClick = useRef(false);

  /** Switch an edge fade off while the hovered or focused card sits inside it. */
  const syncActiveClear = useCallback(() => {
    const el = scrollerRef.current;
    const root = rootRef.current;
    if (!el || !root || !keepActiveClear) return;
    const card = el.querySelector<HTMLElement>('button[data-active="true"]');
    let left = "false";
    let right = "false";
    if (card) {
      const box = el.getBoundingClientRect();
      const rect = card.getBoundingClientRect();
      const fadeL = blurLRef.current?.offsetWidth ?? 0;
      const fadeR = blurRRef.current?.offsetWidth ?? 0;
      if (rect.left < box.left + fadeL) left = "true";
      if (rect.right > box.right - fadeR) right = "true";
    }
    if (root.dataset.clearL !== left) root.dataset.clearL = left;
    if (root.dataset.clearR !== right) root.dataset.clearR = right;
  }, [keepActiveClear]);

  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    const root = rootRef.current;
    if (!el || !root) return;
    const max = el.scrollWidth - el.clientWidth;
    const start = String(el.scrollLeft <= 2);
    const end = String(max <= 2 || el.scrollLeft >= max - 2);
    if (root.dataset.start !== start) root.dataset.start = start;
    if (root.dataset.end !== end) root.dataset.end = end;
    syncActiveClear();
  }, [syncActiveClear]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !keepActiveClear) return;
    let frame = 0;
    const run = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncActiveClear();
      });
    };
    const watch = new MutationObserver(run);
    watch.observe(el, { subtree: true, attributes: true, attributeFilter: ["data-active"] });
    return () => {
      watch.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [keepActiveClear, syncActiveClear]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncEdges();
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const resize = new ResizeObserver(onScroll);
    resize.observe(el);
    const mutate = new MutationObserver(onScroll);
    mutate.observe(el, { childList: true });
    syncEdges();
    return () => {
      el.removeEventListener("scroll", onScroll);
      resize.disconnect();
      mutate.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [syncEdges]);

  // Backdrop filters are the costly part of a row: only keep them while the row is near the viewport.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return observeInView(
      root,
      (entry) => {
        root.dataset.visible = String(entry.isIntersecting);
      },
      { rootMargin: "300px 0px" },
    );
  }, []);

  const stopMotion = useCallback(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
    targetRef.current = null;
    if (rootRef.current) delete rootRef.current.dataset.moving;
  }, []);

  useEffect(() => stopMotion, [stopMotion]);

  /** scrollLeft values (one per snap target) at which each target sits at the start padding. */
  const snapPositions = useCallback((): number[] => {
    const el = scrollerRef.current;
    if (!el) return [];
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const max = el.scrollWidth - el.clientWidth;
    return Array.from(el.children)
      .filter((child): child is HTMLElement => child instanceof HTMLElement && child.hasAttribute("data-snap"))
      .map((child) => Math.min(Math.max(child.offsetLeft - pad, 0), max));
  }, []);

  const animateTo = useCallback(
    (target: number, animate = true, duration = 0.75) => {
      const el = scrollerRef.current;
      const root = rootRef.current;
      if (!el || !root) return;
      stopMotion();
      if (!animate || prefersReducedMotion()) {
        el.scrollLeft = target;
        return;
      }
      root.dataset.moving = "true";
      targetRef.current = target;
      tweenRef.current = gsap.to(el, {
        scrollLeft: target,
        duration,
        ease: EASE.out,
        overwrite: true,
        onComplete: stopMotion,
        onInterrupt: () => {
          delete root.dataset.moving;
        },
      });
    },
    [stopMotion],
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      const el = scrollerRef.current;
      if (!el) return;
      const positions = snapPositions();
      const max = el.scrollWidth - el.clientWidth;
      // Start from where the running scroll is heading, so quick repeated clicks add up.
      const left = targetRef.current ?? el.scrollLeft;
      const desired = Math.min(Math.max(left + dir * el.clientWidth * 0.82, 0), max);
      let best = positions.reduce((a, b) => (Math.abs(b - desired) < Math.abs(a - desired) ? b : a), positions[0] ?? desired);
      if (dir > 0 && best <= left + 4) best = positions.find((p) => p > left + 4) ?? max;
      if (dir < 0 && best >= left - 4) best = [...positions].reverse().find((p) => p < left - 4) ?? 0;
      animateTo(Math.min(Math.max(best, 0), max));
    },
    [animateTo, snapPositions],
  );

  /** Bring one child clear of the faded edges: centered when off screen, a short nudge when merely inside a fade. */
  const revealSlot = useCallback(
    (child: HTMLElement, animate = true) => {
      const el = scrollerRef.current;
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      const box = el.getBoundingClientRect();
      const rect = child.getBoundingClientRect();
      // The child's edges in scroll coordinates (offsetLeft is relative to a nearer positioned parent).
      const left = rect.left - box.left + el.scrollLeft;
      const right = left + rect.width;
      const base = targetRef.current ?? el.scrollLeft;
      const view = el.clientWidth;
      const safe = Math.min(140, view * 0.12);
      if (left >= base + safe && right <= base + view - safe) return;
      const clamp = (value: number) => Math.min(Math.max(value, 0), max);
      // Land on a snap point where the row has them, otherwise the browser's snapping would shift the
      // result again once the scroll ends and could drop the item back into the fade.
      const snaps = snapPositions();
      const nearest = (want: number) => (snaps.length ? snaps.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a)) : want);
      if (right < base || left > base + view) animateTo(clamp(nearest(left - (view - rect.width) / 2)), animate);
      else if (left < base + safe) {
        const want = left - safe;
        animateTo(clamp(snaps.length ? ([...snaps].reverse().find((p) => p <= want) ?? 0) : want), animate, 0.45);
      } else {
        const want = right - view + safe;
        animateTo(clamp(snaps.length ? (snaps.find((p) => p >= want) ?? max) : want), animate, 0.45);
      }
    },
    [animateTo, snapPositions],
  );

  useImperativeHandle(
    ref,
    () => ({
      get el() {
        return scrollerRef.current;
      },
      scrollToLeft: (left, animate = true) => animateTo(left, animate),
      revealChild: revealSlot,
    }),
    [animateTo, revealSlot],
  );

  /* ------------------------------------------------------------ mouse wheel (opt in) */

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !wheel) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.shiftKey) return;
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      // Only notched mouse wheels: trackpads send small continuous deltas and keep scrolling the page.
      if (event.deltaMode === 0 && Math.abs(event.deltaY) < 50) return;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 1) return;
      const delta = event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY;
      const from = targetRef.current ?? el.scrollLeft;
      if ((delta < 0 && from <= 1) || (delta > 0 && from >= max - 1)) return;
      event.preventDefault();
      event.stopPropagation();
      animateTo(Math.min(Math.max(from + delta * 1.4, 0), max), true, 0.4);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [wheel, animateTo]);

  /* ---------------------------------------------------------------- mouse drag */

  const glide = useCallback(
    (velocity: number) => {
      const el = scrollerRef.current;
      const root = rootRef.current;
      if (!el || !root) return;
      const max = el.scrollWidth - el.clientWidth;
      const positions = snapPositions();
      const proxy = { x: el.scrollLeft };
      const snapTo = (natural: number) =>
        positions.length
          ? positions.reduce((a, b) => (Math.abs(b - natural) < Math.abs(a - natural) ? b : a), positions[0])
          : natural;
      root.dataset.moving = "true";
      tweenRef.current = gsap.to(proxy, {
        inertia: {
          x: { velocity, min: 0, max, end: snapTo },
          resistance: 650,
          duration: { min: 0.35, max: 1.5 },
        },
        onUpdate: () => {
          el.scrollLeft = proxy.x;
        },
        onComplete: stopMotion,
        onInterrupt: () => {
          delete root.dataset.moving;
        },
      });
    },
    [snapPositions, stopMotion],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const el = scrollerRef.current;
    if (!el || el.scrollWidth <= el.clientWidth + 1) return;
    stopMotion();
    drag.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startLeft: el.scrollLeft,
      lastX: event.clientX,
      lastT: performance.now(),
      v: 0,
      id: event.pointerId,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    const el = scrollerRef.current;
    const root = rootRef.current;
    if (!d.active || !el || !root) return;
    const dx = event.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      el.setPointerCapture(d.id);
      root.dataset.dragging = "true";
    }
    el.scrollLeft = d.startLeft - dx;
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.v = d.v * 0.6 + ((event.clientX - d.lastX) / dt) * 1000 * 0.4;
    d.lastX = event.clientX;
    d.lastT = now;
  };

  const endDrag = () => {
    const d = drag.current;
    const el = scrollerRef.current;
    const root = rootRef.current;
    if (!d.active || !el || !root) return;
    d.active = false;
    if (!d.moved) return;
    if (el.hasPointerCapture(d.id)) el.releasePointerCapture(d.id);
    delete root.dataset.dragging;
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);
    const stale = performance.now() - d.lastT > 90;
    const velocity = stale || prefersReducedMotion() ? 0 : -d.v;
    if (Math.abs(velocity) < 60) {
      const positions = snapPositions();
      if (positions.length) {
        const target = positions.reduce((a, b) => (Math.abs(b - el.scrollLeft) < Math.abs(a - el.scrollLeft) ? b : a), positions[0]);
        animateTo(target);
      }
      return;
    }
    glide(velocity);
  };

  const rovingItems = (): HTMLElement[] =>
    scrollerRef.current ? Array.from(scrollerRef.current.querySelectorAll<HTMLElement>("[data-roving]")) : [];

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (!roving) return;
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-roving]");
    if (!target || target.tabIndex === 0) return;
    for (const item of rovingItems()) item.tabIndex = item === target ? 0 : -1;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // Alt + arrow keys page the row without leaving the focused card.
    if (event.altKey) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
      return;
    }
    if (!roving || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const current = (event.target as HTMLElement).closest<HTMLElement>("[data-roving]");
    if (!current) return;
    const items = rovingItems();
    const index = items.indexOf(current);
    if (index < 0) return;
    let next = index;
    if (event.key === "ArrowRight") next = Math.min(index + 1, items.length - 1);
    else if (event.key === "ArrowLeft") next = Math.max(index - 1, 0);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    const target = items[next];
    if (target === current) return;
    target.focus({ preventScroll: true });
    // Bring the whole slot (numeral gutter included) into view.
    revealSlot(target.closest<HTMLElement>("[data-snap]") ?? target);
  };

  const ScrollerTag = Tag as "div";

  return (
    <div ref={rootRef} className={cn(styles.hs, className)} data-start="true" data-end="false">
      <ScrollerTag
        ref={scrollerRef as React.RefObject<HTMLDivElement>}
        className={cn(styles.scroller, scrollerClassName)}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        onDragStart={(event) => event.preventDefault()}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
      >
        {children}
      </ScrollerTag>
      <span ref={blurLRef} className={styles.blur} data-side="l" aria-hidden="true" />
      <span ref={blurRRef} className={styles.blur} data-side="r" aria-hidden="true" />
      {arrows && (
        <>
          <button type="button" className={styles.arrow} data-side="l" aria-label="Scroll left" tabIndex={-1} onClick={() => go(-1)}>
            <ChevronLeft className="size-5" strokeWidth={2} />
          </button>
          <button type="button" className={styles.arrow} data-side="r" aria-label="Scroll right" tabIndex={-1} onClick={() => go(1)}>
            <ChevronRight className="size-5" strokeWidth={2} />
          </button>
        </>
      )}
    </div>
  );
});
