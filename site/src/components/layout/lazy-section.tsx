"use client";

/**
 * LazySection — server-rendered now, hydrated when the reader gets near it.
 *
 * The server HTML carries the full section (SEO, no-JS and the first paint are
 * unchanged). On the client, React does not hydrate the subtree at load: the wrapper
 * keeps the server DOM untouched (an empty `dangerouslySetInnerHTML`, the standard
 * partial-hydration shell) until one of these happens:
 *
 * - the section comes within `rootMargin` of the viewport (default: 75% of a viewport;
 *   it hydrates in the next idle slot, at most 300ms later);
 * - the reader engages with the page (first scroll, wheel, touch or key press), after
 *   which <OffscreenSections> hydrates pending islands in idle time, nearest first;
 * - a pointer or keyboard focus enters the section.
 *
 * Then the wrapper swaps the server DOM for the live React tree in one synchronous commit
 * (no paint in between, so nothing visibly changes) and the section's effects and GSAP
 * set-up run. Focus inside the section is carried over to the same element.
 *
 * A client-side navigation to the page (no server DOM) renders the section at once.
 *
 * With `code`, the island's client components are not in the page's first-load JavaScript:
 * they load with the island (./island-code.tsx). Waking then first fetches that chunk (the
 * server DOM stays meanwhile), and the swap runs once it has arrived. Approaching the section
 * starts the fetch at once; the swap still waits for an idle slot.
 *
 *   <LazySection code="bento"><BentoSection /></LazySection>
 *
 * The wrapper is `display: contents`, so layout and the Rails CSS see the <section>
 * itself (globals.css matches `.rails > [data-island] > [data-section]`). Requires
 * <OffscreenSections /> on the page.
 */
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { loadIslandCode, type IslandKey } from "./island-code";
import { activateIsland, registerIsland, type IslandHandle } from "./offscreen-sections";

const noopSubscribe = () => () => {};
/** True on the server and during hydration, false for a client-only mount. */
const useHydrating = () => useSyncExternalStore(noopSubscribe, () => false, () => true);
const KEEP_SERVER_DOM = { __html: "" };
const WRAPPER_STYLE = { display: "contents" } as const;

/** Child-index path from `root` to the focused element, if focus is inside it. */
function focusPath(root: HTMLElement): number[] | null {
  const active = document.activeElement;
  if (!active || active === root || !root.contains(active)) return null;
  const path: number[] = [];
  for (let node: Element | null = active; node && node !== root; node = node.parentElement) {
    const parent: Element | null = node.parentElement;
    if (!parent) return null;
    path.unshift(Array.prototype.indexOf.call(parent.children, node));
  }
  return path;
}

function restoreFocus(root: HTMLElement | null, path: number[] | null) {
  if (!root || !path) return;
  let node: Element | undefined = root;
  for (const i of path) {
    node = node?.children[i];
    if (!node) return;
  }
  (node as HTMLElement).focus?.({ preventScroll: true });
}

export interface LazySectionProps {
  children: ReactNode;
  /** IntersectionObserver margin that triggers hydration. Default "75% 0px". */
  rootMargin?: string;
  /** The island whose client code loads with it (./island-code.tsx). */
  code?: IslandKey;
}

export function LazySection({ children, rootMargin = "75% 0px", code }: LazySectionProps) {
  const hydrating = useHydrating();
  // Captured on the first render: defer only when there is server DOM to keep.
  const [deferred, setDeferred] = useState(hydrating);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = ref.current;
    if (!deferred || !wrapper) return;

    let disposed = false;
    const swap = () => {
      if (disposed) return;
      // Focus is read at swap time: it may have moved while the code was loading.
      const path = ref.current ? focusPath(ref.current) : null;
      flushSync(() => setDeferred(false));
      restoreFocus(ref.current, path);
    };
    const island: IslandHandle = {
      wrapper: () => ref.current,
      load: () => loadIslandCode(code),
      activate: () => {
        const loading = loadIslandCode(code);
        if (!loading) return swap();
        return loading.then(swap);
      },
    };
    const unregister = registerIsland(island);
    const wake = () => activateIsland(island);
    // Approaching: hydrate in the next idle slot (at most 300ms away), so a section that is
    // near the viewport at load does not stack its set-up onto the hydration task.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId = 0;
    const wakeSoon = () => {
      if (idleId) return;
      // The island's code (if any) starts loading now; the swap waits for an idle slot.
      loadIslandCode(code)?.catch(() => {});
      idleId = w.requestIdleCallback ? w.requestIdleCallback(wake, { timeout: 300 }) : window.setTimeout(wake, 50);
    };

    const section = wrapper.firstElementChild;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && wakeSoon(), { rootMargin });
    if (section) io.observe(section);
    wrapper.addEventListener("pointerover", wake, { passive: true });
    wrapper.addEventListener("focusin", wake);

    return () => {
      disposed = true;
      if (idleId) {
        if (w.cancelIdleCallback) w.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
      io.disconnect();
      wrapper.removeEventListener("pointerover", wake);
      wrapper.removeEventListener("focusin", wake);
      unregister();
    };
  }, [deferred, rootMargin, code]);

  // `data-island` reads "pending" in the server HTML and until hydration, then "live".
  if (deferred && typeof window !== "undefined") {
    return <div key="server" ref={ref} data-island="pending" style={WRAPPER_STYLE} dangerouslySetInnerHTML={KEEP_SERVER_DOM} suppressHydrationWarning />;
  }
  return (
    <div key="live" ref={ref} data-island={deferred ? "pending" : "live"} style={WRAPPER_STYLE}>
      {children}
    </div>
  );
}
