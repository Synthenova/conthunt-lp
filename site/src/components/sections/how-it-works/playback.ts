/**
 * Visibility-gated playback for the step visuals (research doc §10.5):
 * - the timeline starts the first time the element's top edge reaches the vertical middle
 *   of the viewport (`start: "mid"`, the default; rootMargin -50% on the bottom, so it is also
 *   true when the element is already past the middle). `start: "visible"` keeps the older
 *   rule: at least `threshold` (40%) in view, or filling most of a short viewport;
 * - after that it only advances while in view (a looping timeline therefore loops only
 *   while visible) and pauses when the tab is hidden or the visitor pressed pause;
 * - `data-live="true|false"` on the element lets CSS pause decorative loops offscreen;
 * - `rest()` marks the run finished (the timeline paused itself on its final frame), so
 *   coming back into view never resumes it. Replays build a fresh timeline.
 * - `onRearm` (optional) fires once when a resting element has fully left the viewport:
 *   the owner can build a fresh run that plays on the next visit ("loop only while in
 *   view", with the number of passes per visit capped by the owner).
 */
import type { gsap as GSAP } from "@/lib/gsap";
import { observeInView, onDocumentVisibility } from "@/lib/media";

type Timeline = ReturnType<typeof GSAP.timeline>;

export interface VisibilityPlayback {
  setUserPaused: (paused: boolean) => void;
  /** The timeline reached its resting frame: keep it paused from now on. */
  rest: () => void;
  /** Stop observing. The timeline itself is reverted by its gsap context. */
  stop: () => void;
}

const THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

export function playWhenVisible(
  el: HTMLElement,
  tl: Timeline,
  {
    threshold = 0.4,
    start = "mid",
    onStart,
    onRearm,
  }: { threshold?: number; start?: "mid" | "visible"; onStart?: () => void; onRearm?: () => void } = {},
): VisibilityPlayback {
  let visible = false;
  // "mid": nothing starts before the element's top edge has reached the middle of the viewport.
  let armed = start !== "mid";
  let started = false;
  let userPaused = false;
  let resting = false;
  let rearmed = false;

  const sync = () => {
    const run = visible && (armed || started) && !userPaused && !document.hidden && !resting;
    el.dataset.live = visible && !document.hidden ? "true" : "false";
    if (!run) {
      tl.pause();
      return;
    }
    if (!started) {
      started = true;
      onStart?.();
      tl.play(0);
    } else if (tl.progress() < 1 || tl.repeat() !== 0) {
      tl.resume();
    }
  };

  const stopIO = observeInView(
    el,
    (entry) => {
      const tallEnough = entry.intersectionRect.height >= window.innerHeight * 0.6;
      visible =
        entry.isIntersecting && (start === "mid" || entry.intersectionRatio >= threshold - 0.001 || tallEnough);
      sync();
      if (resting && !entry.isIntersecting && onRearm && !rearmed) {
        rearmed = true;
        onRearm();
      }
    },
    { threshold: THRESHOLDS },
  );
  const stopArm =
    start === "mid"
      ? observeInView(
          el,
          (entry) => {
            if (!entry.isIntersecting || armed) return;
            armed = true;
            sync();
          },
          { rootMargin: "0px 0px -50% 0px" },
        )
      : () => {};
  const stopVis = onDocumentVisibility(sync);

  return {
    setUserPaused(paused) {
      userPaused = paused;
      sync();
    },
    rest() {
      resting = true;
      tl.pause();
    },
    stop() {
      stopIO();
      stopArm();
      stopVis();
    },
  };
}

/** Write a number into a text node with tabular formatting. */
export function writeCount(el: Element | null, value: number): void {
  if (el) el.textContent = Math.round(value).toLocaleString("en-US");
}
