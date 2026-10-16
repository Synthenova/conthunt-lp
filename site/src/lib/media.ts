/**
 * Media helpers: one global video playback manager plus IntersectionObserver utilities.
 *
 * Video manager (PLAN §2 Video):
 * - Every autoplaying <video> registers with `videoManager.register(el, opts)`
 *   (VideoTile does this for you via `useManagedVideo`).
 * - A shared IntersectionObserver (rootMargin 200px) tracks visibility.
 * - At most VIDEO_CAP.desktop (6) / VIDEO_CAP.mobile (3) videos play at once;
 *   the rest are paused. Ties go to higher `priority`, then larger visible ratio.
 * - Everything pauses while `document.hidden`.
 * - Under prefers-reduced-motion nothing autoplays (posters stay) unless the
 *   video opted in with `allowReducedMotion`.
 * - `videoManager.hold(el, true)` pins a video paused (user pressed pause);
 *   `videoManager.boost(el, true)` raises it above everything (e.g. on hover).
 *
 * IntersectionObserver helpers share one observer per option set:
 *   const stop = observeInView(el, (entry) => ..., { rootMargin: "0px 0px -10% 0px" });
 *   const stop = onceInView(el, () => start(), { threshold: 0.1 });
 *   const inView = useInView(ref, { rootMargin: "200px", once: false });
 */
import { useEffect, useState, type CSSProperties, type RefObject } from "react";
import { REDUCED_MOTION_QUERY } from "./motion";

export const VIDEO_CAP = { desktop: 6, mobile: 3 } as const;
export const MOBILE_MEDIA_QUERY = "(max-width: 767px), (pointer: coarse)";
const VIDEO_ROOT_MARGIN = "200px 0px";

export interface ManagedVideoOptions {
  /** Higher wins when more videos are visible than the cap allows. Default 0. */
  priority?: number;
  /** Autoplay even when the user prefers reduced motion. Default false. */
  allowReducedMotion?: boolean;
}

interface ManagedVideo {
  el: HTMLVideoElement;
  priority: number;
  allowReducedMotion: boolean;
  visible: boolean;
  ratio: number;
  held: boolean;
  boosted: boolean;
  failures: number;
}

class VideoPlaybackManager {
  private videos = new Map<HTMLVideoElement, ManagedVideo>();
  private io: IntersectionObserver | null = null;
  private frame = 0;

  private ensureObserver(): IntersectionObserver | null {
    if (this.io) return this.io;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null;
    this.io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = this.videos.get(entry.target as HTMLVideoElement);
          if (!v) continue;
          v.visible = entry.isIntersecting;
          v.ratio = entry.intersectionRatio;
        }
        this.schedule();
      },
      { rootMargin: VIDEO_ROOT_MARGIN, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    document.addEventListener("visibilitychange", this.schedule);
    window.matchMedia(MOBILE_MEDIA_QUERY).addEventListener("change", this.schedule);
    window.matchMedia(REDUCED_MOTION_QUERY).addEventListener("change", this.schedule);
    return this.io;
  }

  /** Current concurrent-playback cap for this device. */
  get cap(): number {
    if (typeof window === "undefined") return VIDEO_CAP.desktop;
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches ? VIDEO_CAP.mobile : VIDEO_CAP.desktop;
  }

  /** Number of managed videos currently playing (debug/QA). */
  get playingCount(): number {
    let n = 0;
    for (const v of this.videos.values()) if (!v.el.paused) n++;
    return n;
  }

  /** Snapshot of every managed video (debug/QA). */
  debug() {
    return [...this.videos.values()].map(({ el, ...v }) => ({ ...v, src: el.currentSrc || el.src, paused: el.paused }));
  }

  /** Start managing a video. Returns an unregister function. */
  register(el: HTMLVideoElement, opts: ManagedVideoOptions = {}): () => void {
    const io = this.ensureObserver();
    this.videos.set(el, {
      el,
      priority: opts.priority ?? 0,
      allowReducedMotion: opts.allowReducedMotion ?? false,
      visible: false,
      ratio: 0,
      held: false,
      boosted: false,
      failures: 0,
    });
    io?.observe(el);
    return () => this.unregister(el);
  }

  unregister(el: HTMLVideoElement): void {
    if (!this.videos.has(el)) return;
    this.io?.unobserve(el);
    this.videos.delete(el);
    if (!el.paused) el.pause();
    this.schedule();
  }

  /** Keep a video paused regardless of visibility (user-controlled pause). */
  hold(el: HTMLVideoElement, held: boolean): void {
    const v = this.videos.get(el);
    if (!v) return;
    v.held = held;
    this.schedule();
  }

  /** Temporarily rank a video above all others (e.g. while hovered). */
  boost(el: HTMLVideoElement, boosted: boolean): void {
    const v = this.videos.get(el);
    if (!v) return;
    v.boosted = boosted;
    this.schedule();
  }

  setPriority(el: HTMLVideoElement, priority: number): void {
    const v = this.videos.get(el);
    if (!v) return;
    v.priority = priority;
    this.schedule();
  }

  /** Batch reconciliation into one frame. */
  schedule = (): void => {
    if (typeof window === "undefined" || this.frame) return;
    this.frame = window.requestAnimationFrame(() => {
      this.frame = 0;
      this.reconcile();
    });
  };

  private reconcile(): void {
    const hidden = document.hidden;
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const candidates = hidden
      ? []
      : [...this.videos.values()]
          .filter((v) => v.visible && !v.held && (!reduced || v.allowReducedMotion || v.boosted))
          .sort(
            (a, b) =>
              Number(b.boosted) - Number(a.boosted) || b.priority - a.priority || b.ratio - a.ratio,
          );
    const winners = new Set(candidates.slice(0, this.cap).map((v) => v.el));
    for (const v of this.videos.values()) {
      if (winners.has(v.el)) {
        if (v.el.paused) {
          v.el.muted = true; // autoplay policy: must be muted
          v.el.play().then(
            () => {
              v.failures = 0;
            },
            (err: unknown) => {
              // AbortError = interrupted by our own pause(); ignore. Anything else
              // (decoder busy, transient network) gets a few spaced retries.
              if ((err as { name?: string })?.name === "AbortError" || v.failures >= 3) return;
              v.failures++;
              window.setTimeout(this.schedule, 400 * v.failures);
            },
          );
        }
      } else if (!v.el.paused) {
        v.el.pause();
      }
    }
  }
}

/** The one shared manager. Import this; do not instantiate another. */
export const videoManager = new VideoPlaybackManager();

// Dev-only handle for QA scripts: window.__chVideoManager.playingCount / .cap / .debug()
if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as unknown as { __chVideoManager?: VideoPlaybackManager }).__chVideoManager = videoManager;
}

/** Register a <video> ref with the manager for the component's lifetime. */
export function useManagedVideo(
  ref: RefObject<HTMLVideoElement | null>,
  { priority = 0, allowReducedMotion = false, enabled = true }: ManagedVideoOptions & { enabled?: boolean } = {},
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    return videoManager.register(el, { priority, allowReducedMotion });
  }, [ref, priority, allowReducedMotion, enabled]);
}

/* ------------------------------------------------- IntersectionObserver pool */

type InViewCallback = (entry: IntersectionObserverEntry) => void;

interface Pool {
  io: IntersectionObserver;
  callbacks: Map<Element, Set<InViewCallback>>;
}

const pools = new Map<string, Pool>();

function poolKey(opts: IntersectionObserverInit): string {
  const t = Array.isArray(opts.threshold) ? opts.threshold.join(",") : String(opts.threshold ?? 0);
  return `${opts.rootMargin ?? "0px"}|${t}`;
}

/**
 * Call `cb` on every intersection change of `el`. Observers are shared per
 * (rootMargin, threshold) pair. Returns a cleanup function. `root` is not
 * supported (always the viewport).
 */
export function observeInView(
  el: Element,
  cb: InViewCallback,
  opts: Omit<IntersectionObserverInit, "root"> = {},
): () => void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return () => {};
  const key = poolKey(opts);
  let pool = pools.get(key);
  if (!pool) {
    const callbacks = new Map<Element, Set<InViewCallback>>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) callbacks.get(entry.target)?.forEach((fn) => fn(entry));
      },
      { rootMargin: opts.rootMargin, threshold: opts.threshold },
    );
    pool = { io, callbacks };
    pools.set(key, pool);
  }
  const { io, callbacks } = pool;
  let set = callbacks.get(el);
  if (!set) {
    set = new Set();
    callbacks.set(el, set);
    io.observe(el);
  }
  set.add(cb);
  return () => {
    const s = callbacks.get(el);
    if (!s) return;
    s.delete(cb);
    if (s.size === 0) {
      callbacks.delete(el);
      io.unobserve(el);
    }
  };
}

/** Call `cb` once, the first time `el` intersects. Returns a cleanup function. */
export function onceInView(
  el: Element,
  cb: InViewCallback,
  opts: Omit<IntersectionObserverInit, "root"> = {},
): () => void {
  let stop: () => void = () => {};
  stop = observeInView(
    el,
    (entry) => {
      if (!entry.isIntersecting) return;
      stop();
      cb(entry);
    },
    opts,
  );
  return () => stop();
}

/**
 * React hook: is the element in view? With `once`, it latches to true.
 * Returns false on the server and before the first observation.
 */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { rootMargin = "0px", threshold = 0, once = false }: { rootMargin?: string; threshold?: number | number[]; once?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);
  const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : String(threshold);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = thresholdKey.includes(",") ? thresholdKey.split(",").map(Number) : Number(thresholdKey);
    if (once) return onceInView(el, () => setInView(true), { rootMargin, threshold: t });
    return observeInView(el, (entry) => setInView(entry.isIntersecting), { rootMargin, threshold: t });
  }, [ref, rootMargin, thresholdKey, once]);
  return inView;
}

/** Call `cb(hidden)` whenever the tab visibility changes. Returns cleanup. */
export function onDocumentVisibility(cb: (hidden: boolean) => void): () => void {
  if (typeof document === "undefined") return () => {};
  const handler = () => cb(document.hidden);
  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}

/**
 * A video's poster painted as the element's CSS background instead of its `poster`
 * attribute. It looks the same (a <video> without frames is transparent, and the first
 * frame covers it), but a CSS image is fetched only when its element is styled: inside a
 * `content-visibility: auto` section that has not rendered yet it stays unrequested,
 * where a `poster` attribute is fetched as soon as the HTML is parsed.
 *
 *   <video style={posterStyle(src)} … />                 // object-fit: cover
 *   <video style={posterStyle(src, "contain")} … />
 */
export function posterStyle(src: string | undefined, fit: "cover" | "contain" = "cover"): CSSProperties | undefined {
  if (!src) return undefined;
  return { background: `url("${src}") center / ${fit} no-repeat` };
}
