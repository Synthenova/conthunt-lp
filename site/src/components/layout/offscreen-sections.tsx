"use client";

/**
 * OffscreenSections — keeps Home's below-the-fold sections cheap until the reader
 * gets near them, without changing what they look like.
 *
 * Two mechanisms work together:
 *
 * - `content-visibility: auto` (the `.rails-cv` rule in globals.css). The browser skips
 *   style, layout and paint for sections far from the viewport, and their CSS
 *   animations idle there. Until a section first renders it is sized by its `--cis`
 *   placeholder.
 * - <LazySection> islands (./lazy-section.tsx). The server HTML is complete (SEO, no-JS
 *   and first paint are unchanged), but React hydrates the section, and its GSAP set-up
 *   runs, only when it comes within about one viewport, or in idle time after the
 *   reader first scrolls, swipes or presses a key.
 *
 * This component is the coordinator:
 *
 * 1. Every section's real height is watched. When one lands or changes, ScrollTrigger
 *    is refreshed (debounced), so every trigger below it measures real geometry.
 * 2. After the first scroll, wheel, touch or key press (or at once when the URL has a
 *    #hash), it works through the page in idle time, nearest first: it hydrates each
 *    pending island, then renders each still-skipped section once, so the browser
 *    remembers its real height (`contain-intrinsic-block-size: auto`). Scrolling back
 *    up, or a smooth anchor jump, then never resizes the page under the reader.
 *
 * 3. Before a same-page #anchor scroll (and on load with a #hash), it hydrates every
 *    pending island above the target at once, so a pin-spacer that a section adds on
 *    hydration (the statement scene) is in place before the scroll target is measured.
 *    If some of those islands' code (./island-code.tsx) has not arrived yet, the click is
 *    held until it has, then replayed.
 * 4. On the first interaction it also starts fetching every island's code chunk, so the
 *    islands are ready by the time the reader reaches them.
 *
 *   <Rails className="rails-cv">
 *     <LazySection rootMargin="25% 0px"><StatementSimulatorSection /></LazySection>
 *     <LazySection><HowItWorksSection /></LazySection>
 *     …
 *   </Rails>
 *
 * Mounted once by <SiteChrome> (every public page; the footer is an island too). It
 * re-scans on every route change. Renders nothing.
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { prefetchIslandCode } from "./island-code";

const SECTION_SELECTOR =
  ".rails-cv > [data-section], .rails-cv > [data-island] > [data-section], [data-island] > footer[data-section=\"footer\"]";
const REFRESH_DEBOUNCE_MS = 160;

/* ------------------------------------------------------------ island registry */

export interface IslandHandle {
  /** The island's wrapper (display: contents); its first element child is the section. */
  wrapper: () => HTMLElement | null;
  /**
   * Hydrates the island (one synchronous flushSync swap). Returns a promise when the island's
   * code is still loading: the swap then runs once it has arrived.
   */
  activate: () => void | Promise<void>;
  /** Null when the island's code is ready; otherwise a promise for it. */
  load?: () => Promise<unknown> | null;
}

const pending = new Set<IslandHandle>();
const listeners = new Set<() => void>();

/** Called by <LazySection> while it still shows server HTML. Returns an unregister function. */
export function registerIsland(island: IslandHandle): () => void {
  pending.add(island);
  return () => {
    pending.delete(island);
  };
}

const notify = () => listeners.forEach((fn) => fn());

/**
 * Hydrates one island now (or as soon as its code has arrived) and then tells the coordinator
 * (new section element, new geometry). Returns the wait, if there is one.
 */
export function activateIsland(island: IslandHandle): Promise<void> | void {
  if (!pending.delete(island)) return;
  const done = island.activate();
  if (!done) return notify();
  return done.then(notify, () => {
    // The code failed to load (offline?): keep the server HTML and let a later wake retry.
    if (island.wrapper()?.isConnected) pending.add(island);
  });
}

/* ------------------------------------------------------------------ helpers */

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
const distance = (el: Element) => Math.abs(docTop(el) - (window.scrollY + window.innerHeight / 2));

/* -------------------------------------------------------------- coordinator */

/** Pending islands whose section starts above `target`. */
function islandsAbove(target: Element): IslandHandle[] {
  const top = docTop(target);
  return [...pending].filter((island) => {
    const el = island.wrapper()?.firstElementChild;
    return !!el && el !== target && !el.contains(target) && docTop(el) < top;
  });
}

/**
 * Hydrates, at once, every pending island whose section starts above `target`. When some of
 * their code is still loading, it returns a promise and hydrates them all once it has arrived.
 */
function activateIslandsAbove(target: Element): Promise<void> | null {
  const loads = islandsAbove(target)
    .map((island) => island.load?.() ?? null)
    .filter((p): p is Promise<unknown> => !!p);
  if (!loads.length) {
    islandsAbove(target).forEach((island) => activateIsland(island));
    return null;
  }
  const run = () => {
    islandsAbove(target).forEach((island) => activateIsland(island));
  };
  return Promise.all(loads).then(run, run);
}

function hashTarget(hash: string): Element | null {
  if (!hash || hash === "#") return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

export function OffscreenSections() {
  const pathname = usePathname();

  useEffect(() => {
    const w = window as IdleWindow;

    /* 1. Real heights → one debounced ScrollTrigger.refresh(). */
    const heights = new WeakMap<Element, number>();
    let refreshTimer = 0;
    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), REFRESH_DEBOUNCE_MS);
    };
    const ro = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const h = Math.round(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
        const prev = heights.get(entry.target);
        heights.set(entry.target, h);
        if (prev !== undefined && prev !== h) changed = true;
      }
      if (changed) scheduleRefresh();
    });

    /* Rendered-at-least-once bookkeeping (the browser then remembers the real height). */
    const rendered = new WeakSet<Element>();
    const onState = (e: Event) => {
      if (!(e as Event & { skipped?: boolean }).skipped) rendered.add(e.target as Element);
    };
    const tracked = new WeakSet<Element>();
    let sections: HTMLElement[] = [];
    const scan = () => {
      sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
      for (const el of sections) {
        if (tracked.has(el)) continue;
        tracked.add(el);
        ro.observe(el);
        el.addEventListener("contentvisibilityautostatechange", onState);
      }
    };
    scan();
    // An island swapped its server DOM for a live tree: track the new section element.
    const onIsland = () => {
      scan();
      scheduleRefresh();
    };
    listeners.add(onIsland);

    /* 2. After the reader engages: hydrate pending islands, then render skipped sections once. */
    let idleId = 0;
    let rafId = 0;
    let disposed = false;
    const idle = (cb: () => void) =>
      w.requestIdleCallback ? w.requestIdleCallback(cb, { timeout: 1500 }) : window.setTimeout(cb, 100);
    const cancelIdle = (id: number) => (w.cancelIdleCallback ? w.cancelIdleCallback(id) : window.clearTimeout(id));

    const step = () => {
      if (disposed) return;
      // Hydrate first (nearest island), one per idle slot.
      const islands = [...pending]
        .map((island) => ({ island, el: island.wrapper()?.firstElementChild ?? null }))
        .filter((x): x is { island: IslandHandle; el: Element } => !!x.el)
        .sort((a, b) => distance(a.el) - distance(b.el));
      if (islands.length) {
        // An island whose code is still on the way swaps in when it arrives; carry on meanwhile.
        activateIsland(islands[0].island);
        idleId = idle(step);
        return;
      }
      // Then render each never-rendered section once, so its real height is remembered.
      const next = sections.filter((el) => el.isConnected && !rendered.has(el)).sort((a, b) => distance(a) - distance(b))[0];
      if (!next) return;
      rendered.add(next);
      next.style.contentVisibility = "visible";
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          next.style.removeProperty("content-visibility");
          idleId = idle(step);
        });
      });
    };

    const events = ["scroll", "wheel", "touchstart", "keydown"] as const;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      events.forEach((type) => window.removeEventListener(type, start));
      prefetchIslandCode();
      idleId = idle(step);
    };

    /* 3. Same-page anchors: hydrate the islands above the target before Lenis measures it. */
    const replaying = new WeakSet<HTMLAnchorElement>();
    const onAnchorClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || a.origin !== window.location.origin || a.pathname !== window.location.pathname) return;
      const target = hashTarget(a.hash);
      if (!target) return;
      if (replaying.has(a)) {
        replaying.delete(a);
        islandsAbove(target).forEach((island) => activateIsland(island));
        return;
      }
      const wait = activateIslandsAbove(target);
      if (!wait) return;
      // Hold the jump until the islands above have their code (and pin-spacers), then replay it.
      e.preventDefault();
      e.stopImmediatePropagation();
      wait.then(() => {
        if (disposed || !a.isConnected) return;
        replaying.add(a);
        a.click();
      });
    };
    window.addEventListener("click", onAnchorClick, { capture: true });

    const initial = hashTarget(window.location.hash);
    if (initial) {
      // Sections above may have grown (a pin-spacer): land on the target again.
      const land = () => {
        if (!disposed) rafId = requestAnimationFrame(() => initial.scrollIntoView({ block: "start" }));
      };
      const wait = activateIslandsAbove(initial);
      if (wait) wait.then(land);
      else land();
      start();
    } else events.forEach((type) => window.addEventListener(type, start, { passive: true }));

    return () => {
      disposed = true;
      listeners.delete(onIsland);
      ro.disconnect();
      window.clearTimeout(refreshTimer);
      cancelIdle(idleId);
      cancelAnimationFrame(rafId);
      events.forEach((type) => window.removeEventListener(type, start));
      window.removeEventListener("click", onAnchorClick, { capture: true });
      sections.forEach((el) => {
        el.removeEventListener("contentvisibilityautostatechange", onState);
        el.style.removeProperty("content-visibility");
      });
    };
  }, [pathname]);

  return null;
}
