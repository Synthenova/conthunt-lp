/**
 * Step 02 timeline (research doc §10.4, slowed adaptation). One pass:
 *
 *   0.0  prompt card fades in            1.4  spine to Q draws, Q rows rise
 *   0.6  prompt pulse                    2.2  spine to P draws, P rows rise
 *   3.2  Q → keyword fan draws, keyword chips land in their slots
 *   4.0  keywords merge into one run     4.1  run splits into 3 platform lanes
 *   4.1  relevance gate opens (it stays hidden until there is something to gate)
 *   4.6  watch phase (4.0 s): counters, clock, gate sweep, lane + P bars
 *   8.6  "Plan locked"
 *
 * Pacing (design review): the first visibility plays two passes. The locked frame
 * holds 4.4 s, a 0.6 s crossfade resets, the second pass runs, and the stage then
 * rests on the locked frame (Replay restarts one pass). A pass never loops forever
 * next to the text people are reading.
 *
 * Only transform, opacity, clip-path and stroke-dashoffset (DrawSVG) are animated.
 * Every selection is guarded: below some widths a layer (the Q fan) is not drawn,
 * and GSAP must not be handed empty targets. The returned timeline is paused;
 * playback.ts decides when it runs.
 */
import { DrawSVGPlugin, EASE, gsap } from "@/lib/gsap";
import { formatClock } from "./thumbs";

type Timeline = ReturnType<typeof gsap.timeline>;
type Targets = Element | Element[] | null;

export interface PlanTimelineOptions {
  found: number;
  passed: number;
  lanes: number[];
  /** Planning + collection time shown on the stage clock, in seconds. */
  clockTo: number;
  /** Passes to play before resting on the locked frame (2 on first view, 1 on Replay). */
  passes: number;
  status: (text: string, done?: boolean) => void;
  /** Called when the last pass reaches the locked frame. */
  onRest: () => void;
}

/** Build + watch: the moment the plan locks. */
export const PLAN_PASS = 8.6;
/** How long the locked frame holds before the next pass. */
export const PLAN_HOLD = 4.4;
/** Crossfade back to the start frame between passes. */
export const PLAN_XFADE = 0.6;
const WATCH_START = 4.6;
const WATCH = 4.0;
const GATE_OPEN = WATCH_START - 0.5;

/** Inverse of power1.inOut, so gate rings light exactly when the sweep reaches them. */
function sweepTime(f: number): number {
  const p = Math.min(1, Math.max(0, f));
  return p < 0.5 ? Math.sqrt(p / 2) : 1 - Math.sqrt((1 - p) / 2);
}

const present = (t: Targets): t is Element | Element[] => (Array.isArray(t) ? t.length > 0 : t !== null);

export function buildPlanTimeline(root: HTMLElement, opts: PlanTimelineOptions): Timeline {
  gsap.registerPlugin(DrawSVGPlugin);
  const all = <T extends Element = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
  const one = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s);
  const draw = (s: string) => all<SVGPathElement>(`[data-draw="${s}"]`);

  const dyn = all("[data-dyn]");
  const prompt = one("[data-plan-prompt]");
  const qRows = all('[data-row^="q"]');
  const pRows = all('[data-row^="p"]');
  const chips = all("[data-chip]");
  const lanes = all("[data-lane]");
  const laneBars = all("[data-lane-bar]");
  const laneCounts = all("[data-lane-count]");
  const pBars = all("[data-p-bar]");
  const node = all("[data-merge-node]");
  const gate = all("[data-gate-block]");
  const gateWait = all("[data-gate-wait]");
  const gateColor = one("[data-gate-color]");
  const gateLine = one("[data-gate-line]");
  const grid = one("[data-gate-grid]");
  const rings = all("[data-gate-ring]");
  const foundEls = all("[data-found]");
  const passedEls = all("[data-passed]");
  const clockEls = all("[data-plan-clock]");

  const laneMax = Math.max(...opts.lanes, 1);
  const counters = { found: 0, passed: 0, clock: 0 };
  const laneValues = opts.lanes.map(() => ({ v: 0 }));
  const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
  const write = () => {
    foundEls.forEach((el) => (el.textContent = fmt(counters.found)));
    passedEls.forEach((el) => (el.textContent = fmt(counters.passed)));
    clockEls.forEach((el) => (el.textContent = formatClock(counters.clock)));
    laneCounts.forEach((el, i) => (el.textContent = fmt(laneValues[i]?.v ?? 0)));
  };

  // Start state for the first frame (the default markup is the finished frame).
  write();
  opts.status("Queued");

  const passes = Math.max(1, Math.round(opts.passes));
  const tl = gsap.timeline({
    paused: true,
    repeat: passes - 1,
    defaults: { ease: EASE.out },
  });
  const passIndex = () => Math.min(passes - 1, Math.floor((tl.totalTime() + 0.001) / tl.duration()));

  const rise = { y: 8, autoAlpha: 0 };
  const shown = { y: 0, autoAlpha: 1, duration: 0.45 };
  const drawFrom = { drawSVG: "0% 0%" };
  const drawTo = (duration: number, extra: gsap.TweenVars = {}) => ({ drawSVG: "0% 100%", duration, ease: "power2.out", ...extra });
  const from = (t: Targets, a: gsap.TweenVars, b: gsap.TweenVars, at: number) => {
    if (present(t)) tl.fromTo(t, a, b, at);
  };
  const lines = (kind: string, duration: number, at: number, extra: gsap.TweenVars = {}) =>
    from(draw(kind), drawFrom, drawTo(duration, extra), at);

  if (present(dyn)) tl.set(dyn, { autoAlpha: 1 }, 0);
  tl.call(
    () => {
      counters.found = 0;
      counters.passed = 0;
      counters.clock = 0;
      laneValues.forEach((lane) => (lane.v = 0));
      write();
      opts.status("Reading intent");
    },
    [],
    0.01,
  );

  if (prompt) {
    tl.fromTo(prompt, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 0);
    tl.to(prompt, { scale: 1.02, duration: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0.6);
  }

  // Intent split: questions, then parameters.
  tl.call(() => opts.status("Writing research questions"), [], 1.4);
  lines("spine-q", 0.6, 1.4);
  lines("tick-q", 0.3, 1.85, { stagger: 0.12 });
  from(qRows, rise, { ...shown, stagger: 0.12 }, 1.9);
  tl.call(() => opts.status("Choosing parameters to score"), [], 2.2);
  lines("spine-p", 0.6, 2.2);
  lines("tick-p", 0.3, 2.55, { stagger: 0.1 });
  from(pRows, rise, { ...shown, stagger: 0.1 }, 2.6);

  // Fan-out into keyword searches (the Q fan only exists when the panels sit side by side).
  tl.call(() => opts.status("Spinning up keyword searches"), [], 3.2);
  lines("fan", 0.6, 3.2, { stagger: 0.04 });
  from(chips, rise, { ...shown, stagger: 0.12 }, 3.35);
  lines("merge", 0.45, 4.0, { stagger: 0.04 });
  from(node, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, transformOrigin: "50% 50%" }, 4.2);
  lines("split", 0.4, 4.25, { stagger: 0.06 });
  from(lanes, { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.1 }, 4.3);

  // The gate opens when there is something to gate: until then a quiet "waiting" note.
  from(gateWait, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, GATE_OPEN - 0.1);
  from(gate, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5 }, GATE_OPEN);

  // Watch and gate.
  tl.call(() => opts.status("Searching 3 platforms"), [], WATCH_START)
    .call(() => opts.status("Gating for relevance"), [], WATCH_START + 1.1)
    .to(counters, { found: opts.found, duration: WATCH, ease: "power2.out", onUpdate: write }, WATCH_START)
    .to(counters, { passed: opts.passed, duration: WATCH - 0.4, ease: "power2.out", onUpdate: write }, WATCH_START + 0.4)
    .to(counters, { clock: opts.clockTo, duration: WATCH, ease: "none", onUpdate: write }, WATCH_START);
  laneValues.forEach((lane, i) => {
    tl.to(lane, { v: opts.lanes[i], duration: 1.6, ease: "power2.out", onUpdate: write }, WATCH_START + i * 0.15);
  });
  from(
    laneBars,
    { scaleX: 0 },
    { scaleX: (i: number) => (opts.lanes[i] ?? 0) / laneMax, duration: 1.6, ease: "power2.out", stagger: 0.15, transformOrigin: "0% 50%" },
    WATCH_START,
  );
  if (gateColor && gateLine) {
    tl.fromTo(gateColor, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: WATCH, ease: "power1.inOut" }, WATCH_START)
      .fromTo(gateLine, { xPercent: 0, x: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, WATCH_START - 0.1)
      .fromTo(gateLine, { xPercent: 0 }, { xPercent: 100, duration: WATCH, ease: "power1.inOut", immediateRender: false }, WATCH_START);
  }
  if (grid && rings.length) {
    const width = grid.offsetWidth || 1;
    rings.forEach((ring) => {
      const tile = ring.parentElement as HTMLElement;
      const f = (tile.offsetLeft + tile.offsetWidth / 2) / width;
      tl.fromTo(ring, { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 0.35 }, WATCH_START + 0.12 + sweepTime(f) * WATCH);
    });
  }
  from(
    pBars,
    { scaleX: 0 },
    { scaleX: (_: number, el: HTMLElement) => Number(el.dataset.value ?? 1), duration: 0.8, ease: "power2.out", stagger: 0.15, transformOrigin: "0% 50%" },
    5.0,
  );

  // Lock. On the last pass the stage rests here; otherwise hold, crossfade, go again.
  tl.call(
    () => {
      opts.status("Plan locked", true);
      if (passIndex() >= passes - 1) {
        tl.pause();
        opts.onRest();
      }
    },
    [],
    PLAN_PASS,
  );
  if (present(dyn)) tl.to(dyn, { autoAlpha: 0, duration: PLAN_XFADE, ease: "power1.inOut" }, PLAN_PASS + PLAN_HOLD);
  tl.set({}, {}, PLAN_PASS + PLAN_HOLD + PLAN_XFADE);

  return tl;
}
