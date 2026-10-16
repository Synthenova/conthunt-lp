/**
 * HeroEngine — the imperative controller behind the hero board.
 *
 * React renders the static structure once (first prompt set, SSR-complete). The
 * engine owns everything that moves, so a 6-second cycle never re-renders React:
 *
 *   prompt rolls → a pulse leaves the prompt box's outer border, runs the whole connector
 *   and stops at the lead card's left edge → split-flap wave, column by column. (No
 *   outline, ring or flash on the lead card, and no submit-button press: hero-rev4.)
 *
 * Each card is a real split-flap: a top half (new face), a bottom half (old
 * face) and a hinged flap whose front is the old top and whose back is the new
 * bottom. Intermediate flaps run through spare posters (70 ms each) before the
 * final flap (160 ms, gravity ease, small settle). A turned card (hover/focus/
 * tap) does not flap: it pops and its radar morphs in place.
 *
 * Reduced motion: no flaps, no beam, no loops. The board starts held on its
 * first set (the "user" pause, set by HeroBoard); Resume opts in to a crossfade
 * every 8 s. The card back swaps without 3D rotation.
 *
 * Pause reasons (any one stops the clock): offscreen, hidden tab, prompt-box
 * hover, keyboard focus inside the prompt box, the typed-text state, and the
 * visitor's own pause button ("user", which also parks the video loops).
 *
 * Video bytes (PLAN §2 Video): the rank 1–3 loops are the hero's heaviest
 * asset, so they load only when they can pay off. Before the visitor's first
 * scroll, pointer or key input, only the first two sets may load, within
 * VIDEO_BUDGET_BYTES. After three cycles without input, no new loop loads (the
 * posters keep flipping). Data saver, phones (< 768px) and reduced motion get
 * posters only.
 */
import { EASE, gsap } from "@/lib/gsap";
import { observeInView, onDocumentVisibility, videoManager } from "@/lib/media";
import { gradId } from "./card-parts";
import {
  BOARD_CARDS,
  COLUMNS,
  CYCLE_SECONDS,
  CYCLE_SECONDS_REDUCED,
  HERO_POSTER_SIZES,
  PROMPT_SETS,
  TREND_LABEL,
  backKeywords,
  chartGeometry,
  describeCard,
  formatViews,
  heroPosterSrcSet,
  paramValues,
  radarPoints,
  type GlyphMap,
  type HeroCard,
} from "./data";
import type { FlapSynth } from "./flap-sound";

/* ------------------------------------------------------------------ types */

interface FaceRefs {
  el: HTMLElement;
  img: HTMLImageElement;
  score: HTMLElement;
  views: HTMLElement;
  glyph: SVGPathElement;
  area: SVGPathElement;
  line: SVGPathElement;
  proj: SVGGElement;
  projLine: SVGPathElement;
  projArea: SVGPathElement;
  dot: HTMLElement;
  trendText: HTMLElement;
  card: HeroCard | null;
  chart: boolean;
}

interface BackRefs {
  el: HTMLElement;
  score: HTMLElement;
  trend: HTMLElement;
  poly: SVGPolygonElement;
  values: SVGTextContentElement[];
  list: HTMLElement[];
  kw: HTMLElement;
  rank: HTMLElement;
  card: HeroCard;
  vals: number[];
}

interface Slot {
  i: number;
  el: HTMLElement;
  /** The visually hidden <button> that carries the card's name, pressed state and keyboard focus. */
  hit: HTMLElement;
  lift: HTMLElement;
  flipper: HTMLElement;
  ring: HTMLElement;
  rest: FaceRefs;
  video: HTMLVideoElement | null;
  videoUnreg: (() => void) | null;
  mech: HTMLElement;
  flap: HTMLElement;
  top: FaceRefs;
  bottom: FaceRefs;
  flapA: FaceRefs;
  flapB: FaceRefs;
  sh: { top: HTMLElement; cast: HTMLElement; front: HTMLElement; back: HTMLElement };
  back: BackRefs;
  card: HeroCard;
  flipped: boolean;
  busy: gsap.core.Animation | null;
  /** The score chip counting over to its new value after a landing. */
  tick: gsap.core.Tween | null;
}

interface ConnectorRefs {
  svg: SVGSVGElement;
  base: SVGPathElement;
  beam: SVGPathElement;
  orbPos: SVGGElement;
  orb: SVGGElement;
  /** Clips the pulse's glow to the run between the box's border and the card's edge. */
  clip: SVGRectElement;
}

export interface EngineOptions {
  /** Positioned wrapper that the connector SVG covers (coordinates are relative to it). */
  root: HTMLElement;
  /** The board element (receives data-reduced). */
  board: HTMLElement;
  promptStack: HTMLElement;
  promptBox: HTMLElement;
  /** The progress ring around the pause button (a circle with pathLength 1). */
  progressRing: SVGCircleElement | null;
  connector: ConnectorRefs | null;
  glyphs: GlyphMap;
  synth: FlapSynth;
  reduced: boolean;
  startIndex: number;
  onIndex: (i: number) => void;
  /** Byte size of each hero loop (`card.video` → bytes), measured on the server. */
  videoBytes?: Record<string, number>;
}

/* --------------------------------------------------------------- helpers */

const STAGGER = 0.065; // seconds between cards in the wave (spec: 55–80 ms)
const FLAP_FAST = 0.07; // intermediate flap
const FLAP_FINAL = 0.16; // landing flap
const BEAM_SECONDS = 0.7; // the pulse's run from the prompt box's border to the lead card's edge
const ORB_R = 3.4; // radius of the pulse's lit core (hero.module.css / hero-board.tsx keep it in step)
const TRAIL_PX = 64; // length of the lit trail behind the pulse's head

/** Loop bytes allowed before the visitor's first input (PLAN budget: 1.5 MB). */
const VIDEO_BUDGET_BYTES = 1_500_000;
/** Prompt sets whose loops may load before the first input. */
const EAGER_VIDEO_SETS = 2;
/** Cycles without input after which no new loop loads. */
const IDLE_VIDEO_CYCLES = 3;
/** Size assumed for a loop the server could not measure (PLAN tile ceiling). */
const ASSUMED_VIDEO_BYTES = 400_000;
const PHONE_QUERY = "(max-width: 767px)";
const INPUT_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"] as const;

function q<T extends Element>(root: Element, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`hero: missing ${sel}`);
  return el;
}

type HalfName = "top" | "bottom" | "front" | "back";

/**
 * The split-flap halves are hidden copies of the resting face (four per card). They are not in
 * the server HTML, where they were 40 extra copies of the board; the engine clones each one from
 * the resting face on setup. A half keeps its chart only where the wave shows it (the lower half
 * and the flap front), its poster loads lazily, and it never carries the loop video.
 */
function ensureHalfFace(mech: HTMLElement, which: HalfName, rest: HTMLElement): HTMLElement {
  const half = q<HTMLElement>(mech, `[data-half="${which}"]`);
  const existing = half.querySelector<HTMLElement>("[data-face]");
  if (existing) return existing;
  // Copy through an inert <template> (its images never load), so the poster is set up before it
  // can fetch: `loading="lazy"` first, then sizes, srcset and src last. A plain cloneNode copies
  // `src` before `srcset`, which fetched the 360px file next to the 240px one on phones, and it
  // sets an <img>'s attributes before the image joins its <picture>, so a column-4 copy fetched
  // the poster its hidden column never shows.
  const tpl = document.createElement("template");
  tpl.innerHTML = rest.outerHTML;
  const draft = tpl.content.firstElementChild as HTMLElement;
  for (const v of draft.querySelectorAll("video")) v.remove();
  draft.dataset.chart = which === "bottom" || which === "front" ? "on" : "off";
  const img = draft.querySelector("img");
  if (img) {
    const source = (["sizes", "srcset", "src"] as const).map((name) => [name, img.getAttribute(name)] as const);
    for (const [name] of source) img.removeAttribute(name);
    img.removeAttribute("fetchpriority");
    img.loading = "lazy";
    for (const [name, value] of source) if (value !== null) img.setAttribute(name, value);
  }
  const face = document.importNode(draft, true);
  half.prepend(face);
  return face;
}

function faceRefs(el: HTMLElement, card: HeroCard, chart: boolean): FaceRefs {
  return {
    el,
    img: q(el, '[data-f="img"]'),
    score: q(el, '[data-f="score"]'),
    views: q(el, '[data-f="views"]'),
    glyph: q(el, '[data-f="glyph"]'),
    area: q(el, '[data-f="area"]'),
    line: q(el, '[data-f="line"]'),
    proj: q(el, '[data-f="proj"]'),
    projLine: q(el, '[data-f="projLine"]'),
    projArea: q(el, '[data-f="projArea"]'),
    dot: q(el, '[data-f="dot"]'),
    trendText: q(el, '[data-f="trendText"]'),
    card,
    chart,
  };
}

function wordsHtml(text: string): string {
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `<span data-w class="__W__"><span data-wi class="__WI__">${esc(w)}</span></span>`)
    .join(" ");
}

/** HTML for one prompt layer. Class names come from the CSS module. */
export function promptLayerHtml(text: string, cls: { layer: string; w: string; wi: string }): string {
  return `<div data-layer class="${cls.layer}">${wordsHtml(text)
    .replaceAll("__W__", cls.w)
    .replaceAll("__WI__", cls.wi)}</div>`;
}

/* ------------------------------------------------------------ placement */

/** How far the board may move to meet the prompt box, so the triangle stays inside the stage. */
const BOARD_DY_LIMIT = 72;

/** Vertical board offset that centres the lead card (at `natural`) on the prompt box centre. */
function placementOffset(boxCentre: number, natural: number): number {
  return Math.max(-BOARD_DY_LIMIT, Math.min(BOARD_DY_LIMIT, Math.round(boxCentre - natural)));
}

/**
 * Top of `el` relative to `root` from layout offsets. CSS transforms are ignored on
 * purpose: the text column's page-load rise (translateY 14px) must not skew the
 * board placement or the connector while it plays.
 */
function offsetTopIn(el: HTMLElement, root: HTMLElement): number {
  let y = 0;
  let e: HTMLElement | null = el;
  while (e && e !== root) {
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return e === root ? y : el.getBoundingClientRect().top - root.getBoundingClientRect().top;
}

/**
 * Inline script that places the board before the first paint (desktop only),
 * with the same maths as HeroEngine.layout(). It runs as the parser reaches it,
 * after the text column and before the board, and writes the offset into a
 * <style> in <head>, which React's hydration skips. The engine's inline value
 * overrides it after hydration (same number, so nothing moves).
 *
 * Why: the board used to wait at opacity 0 until hydration placed it, so its
 * posters never counted for LCP and the first flap wave became a late LCP.
 * Lead card centre before the offset = stage centre = --nav-h + (root height −
 * --nav-h − --strip-h) / 2 (the stage spans the root between the navbar and the
 * platforms strip, and column 1 is centred in it).
 */
export function prePaintPlacementScript(columnsClass: string): string {
  return `(function(){try{var s=document.currentScript,r=s&&s.parentElement;if(!r||!matchMedia("(min-width: 1024px)").matches)return;var f=r.querySelector("form");if(!f)return;var c=getComputedStyle(r),n=parseFloat(c.getPropertyValue("--nav-h"))||88,p=parseFloat(c.getPropertyValue("--strip-h"))||64,y=0,e=f;while(e&&e!==r){y+=e.offsetTop;e=e.offsetParent}if(e!==r)return;var m=n+(r.offsetHeight-n-p)/2,L=${BOARD_DY_LIMIT},d=Math.max(-L,Math.min(L,Math.round(y+f.offsetHeight/2-m))),t=document.createElement("style");t.setAttribute("data-hero-placement","");t.textContent="."+CSS.escape(${JSON.stringify(columnsClass)})+"{--board-dy:"+d+"px}";document.head.appendChild(t)}catch(_){}})();`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ engine */

export class HeroEngine {
  private o: EngineOptions;
  private slots: Slot[] = [];
  private index: number;
  private cycle: gsap.core.Timeline | null = null;
  private clock: gsap.core.Tween | null = null;
  private progress = { p: 0 };
  private pauses = new Set<string>();
  private loaded = new Set<number>();
  private preloadBin: HTMLImageElement[] = [];
  private cleanups: (() => void)[] = [];
  private layerClasses: { layer: string; w: string; wi: string };
  private destroyed = false;
  /** Video gate: input seen yet, input seen this cycle, cycles without input, loops already requested. */
  private interacted = false;
  private inputThisCycle = false;
  private idleCycles = 0;
  private videoSrcs = new Set<string>();
  private videoBytesUsed = 0;

  constructor(o: EngineOptions, layerClasses: { layer: string; w: string; wi: string }) {
    this.o = o;
    this.index = o.startIndex;
    this.layerClasses = layerClasses;
    o.board.toggleAttribute("data-reduced", o.reduced);
    this.collect();
    this.loaded.add(this.index);
    this.bind();
  }

  /* ------------------------------------------------------------ setup */

  private collect() {
    const board = BOARD_CARDS[this.index];
    const els = Array.from(this.o.board.querySelectorAll<HTMLElement>("[data-slot]"));
    this.slots = els.map((el) => {
      const i = Number(el.dataset.slot);
      const card = board[i];
      const front = q<HTMLElement>(el, "[data-front]");
      const mech = q<HTMLElement>(front, "[data-mech]");
      const backEl = q<HTMLElement>(el, "[data-back]");
      const restEl = q<HTMLElement>(front, '[data-layer="rest"] > [data-face], [data-layer="rest"][data-face]');
      const slot: Slot = {
        i,
        el,
        hit: q(el, "[data-hit]"),
        lift: q(el, "[data-lift]"),
        flipper: q(el, "[data-flipper]"),
        ring: q(el, "[data-ring]"),
        rest: faceRefs(restEl, card, true),
        video: front.querySelector<HTMLVideoElement>("video"),
        videoUnreg: null,
        mech,
        flap: q(mech, "[data-flap]"),
        top: faceRefs(ensureHalfFace(mech, "top", restEl), card, true),
        bottom: faceRefs(ensureHalfFace(mech, "bottom", restEl), card, true),
        flapA: faceRefs(ensureHalfFace(mech, "front", restEl), card, true),
        flapB: faceRefs(ensureHalfFace(mech, "back", restEl), card, true),
        sh: {
          top: q(mech, '[data-sh="top"]'),
          cast: q(mech, '[data-sh="cast"]'),
          front: q(mech, '[data-sh="front"]'),
          back: q(mech, '[data-sh="back"]'),
        },
        back: {
          el: backEl,
          score: q(backEl, '[data-b="score"]'),
          trend: q(backEl, '[data-b="trend"]'),
          poly: q(backEl, '[data-b="poly"]'),
          values: Array.from(backEl.querySelectorAll<SVGTextContentElement>('[data-b^="v"]')),
          list: Array.from(backEl.querySelectorAll<HTMLElement>('[data-b^="pv"]')),
          kw: q(backEl, '[data-b="kw"]'),
          rank: q(backEl, '[data-b="rank"]'),
          card,
          vals: paramValues(card),
        },
        card,
        flipped: false,
        busy: null,
        tick: null,
      };
      return slot;
    });
    this.slots.sort((a, b) => a.i - b.i);
    // If we were re-created mid-session (motion preference changed), the DOM
    // may still show the SSR set: paint everything to the current index.
    for (const s of this.slots) {
      const c = board[s.i];
      s.card = c;
      this.paintFace(s.rest, c, true);
      this.clearDraw(s);
      this.paintBack(s, c);
      s.hit.textContent = describeCard(c);
    }
  }

  private bind() {
    const { root, promptBox } = this.o;
    // Offscreen / hidden tab: pause the clock and CSS loops.
    this.cleanups.push(
      observeInView(root, (e) => this.setPaused("offscreen", !e.isIntersecting), { threshold: 0 }),
      onDocumentVisibility((hidden) => this.setPaused("hidden", hidden)),
    );
    // Hovering the prompt box, or keyboard focus anywhere inside it (input,
    // mode chips, pause button, submit), pauses rotation (spec).
    const enter = () => this.setPaused("box-hover", true);
    const leave = () => this.setPaused("box-hover", false);
    // Keyboard focus only: a mouse click on a mode chip should not freeze the rotation.
    const focusIn = (e: FocusEvent) => {
      if ((e.target as Element | null)?.matches?.(":focus-visible")) this.setPaused("box-focus", true);
    };
    const focusOut = (e: FocusEvent) => {
      if (!promptBox.contains(e.relatedTarget as Node | null)) this.setPaused("box-focus", false);
    };
    promptBox.addEventListener("pointerenter", enter);
    promptBox.addEventListener("pointerleave", leave);
    promptBox.addEventListener("focusin", focusIn);
    promptBox.addEventListener("focusout", focusOut);
    this.cleanups.push(() => {
      promptBox.removeEventListener("pointerenter", enter);
      promptBox.removeEventListener("pointerleave", leave);
      promptBox.removeEventListener("focusin", focusIn);
      promptBox.removeEventListener("focusout", focusOut);
    });
    if (promptBox.querySelector(":focus-visible")) this.pauses.add("box-focus");
    // Any scroll, pointer or key input opens the video gate and resets the idle count.
    const onInput = () => {
      this.inputThisCycle = true;
      this.idleCycles = 0;
      if (this.interacted) return;
      this.interacted = true;
      // The current set may have been held to posters: let its loops in now.
      for (const s of this.slots) if (!s.busy) this.setVideo(s, s.card);
    };
    const opts = { passive: true, capture: true } as const;
    for (const type of INPUT_EVENTS) window.addEventListener(type, onInput, opts);
    this.cleanups.push(() => {
      for (const type of INPUT_EVENTS) window.removeEventListener(type, onInput, opts);
    });
    // Connector geometry follows layout.
    if (this.o.connector) {
      const ro = new ResizeObserver(() => this.layout());
      ro.observe(root);
      ro.observe(promptBox);
      this.cleanups.push(() => ro.disconnect());
      if (document.fonts?.ready) void document.fonts.ready.then(() => !this.destroyed && this.layout());
    }
    // Video: fade in once actually playing.
    for (const s of this.slots) {
      const v = s.video;
      if (!v) continue;
      const on = () => v.setAttribute("data-on", "");
      const off = () => v.removeAttribute("data-on");
      v.addEventListener("playing", on);
      v.addEventListener("emptied", off);
      this.cleanups.push(() => {
        v.removeEventListener("playing", on);
        v.removeEventListener("emptied", off);
      });
    }
  }

  start() {
    this.layout();
    if (this.o.reduced) {
      for (const s of this.slots) this.setVideo(s, s.card);
      if (this.o.connector) gsap.set(this.o.connector.base, { drawSVG: "100%" });
      this.startClock();
      return;
    }
    // Intro: the connector draws in from the box's border, the pulse runs it, the board shuffles
    // into the first result set ("the search just ran"), then the clock starts.
    const intro = gsap.timeline({ delay: 0.35 });
    const c = this.o.connector;
    if (c && this.connectorVisible()) {
      intro.fromTo(c.base, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.6, ease: EASE.inOut }, 0);
    }
    intro.add(() => {
      this.cycle = this.runCycle(this.index, this.index, true);
    }, c && this.connectorVisible() ? 0.6 : 0.1);
    this.cycle = intro;
    this.startClock();
  }

  destroy() {
    this.destroyed = true;
    this.clock?.kill();
    this.cycle?.kill();
    for (const s of this.slots) {
      s.busy?.kill();
      s.tick?.kill();
      s.videoUnreg?.();
      gsap.killTweensOf([s.flipper, s.lift, s.flap, s.ring, s.rest.line, s.rest.area, s.rest.dot, s.rest.proj]);
      gsap.set([s.flipper, s.lift, s.el], { clearProps: "transform,zIndex" });
      s.mech.style.visibility = "hidden";
      s.el.removeAttribute("data-flipped");
    }
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    this.preloadBin = [];
  }

  /* --------------------------------------------------------- public API */

  /** Jump to a prompt (Left / Right on the pause button). */
  goTo(i: number) {
    if (i === this.index) return;
    this.go(i);
  }

  get current() {
    return this.index;
  }

  setPaused(reason: string, on: boolean) {
    if (on) this.pauses.add(reason);
    else this.pauses.delete(reason);
    const stopLoops = this.pauses.has("offscreen") || this.pauses.has("hidden") || this.pauses.has("user");
    this.o.root.style.setProperty("--hero-loop", stopLoops ? "paused" : "running");
    this.o.root.toggleAttribute("data-paused", this.pauses.has("user"));
    if (!this.clock) return;
    if (this.pauses.size) this.clock.pause();
    else this.clock.resume();
  }

  /**
   * The visitor's pause button (WCAG 2.2.2): stops the rotation, the CSS loops
   * and the rank 1–3 video loops (they fall back to their posters). Hover
   * turns, example switching (arrow keys on the button) and typing keep working.
   */
  setUserPaused(on: boolean) {
    this.setPaused("user", on);
    for (const s of this.slots) {
      if (!s.video || !s.videoUnreg) continue;
      if (on) s.video.removeAttribute("data-on");
      videoManager.hold(s.video, on);
    }
  }

  /** Hover / focus / tap: turn a card to its "why it scored" back. */
  turn(slotIndex: number, on: boolean) {
    const s = this.slots.find((x) => x.i === slotIndex);
    if (!s || s.flipped === on) return;
    s.flipped = on;
    s.el.toggleAttribute("data-flipped", on);
    s.hit.setAttribute("aria-pressed", on ? "true" : "false");
    if (on && s.back.card !== s.card) this.paintBack(s, s.card);
    // Edge cards (column 4 bleeds off-screen) slide fully into view as they turn.
    const shift = on ? this.edgeShift(s) : { x: 0, y: 0 };
    s.el.style.zIndex = on ? "6" : "5";
    if (this.o.reduced) {
      gsap.set(s.lift, { x: shift.x, y: shift.y });
      if (!on) s.el.style.zIndex = "";
      return;
    }
    gsap.to(s.flipper, { rotationY: on ? 180 : 0, duration: 0.6, ease: EASE.out, overwrite: "auto" });
    gsap.to(s.lift, {
      x: shift.x,
      y: shift.y,
      duration: 0.5,
      ease: EASE.out,
      overwrite: "auto",
      onComplete: () => {
        if (!s.flipped) s.el.style.zIndex = "";
      },
    });
  }

  /**
   * A turned card keeps exactly its own box (hero-rev7: no scale, so the back is flush with the grid).
   * The one exception is a card the viewport or the stage's fade clips (column 4 bleeds off the right
   * edge and overruns the top and bottom): it slides just far enough to be read (20 to 24px margins).
   * A card that is fully visible never moves.
   */
  private edgeShift(s: Slot): { x: number; y: number } {
    const r = s.el.getBoundingClientRect(); // the static home box
    const root = this.o.root.getBoundingClientRect();
    const board = this.o.board.getBoundingClientRect();
    const maxRight = root.right - 20;
    const minLeft = board.left + 12;
    const minTop = Math.max(board.top, root.top) + 24;
    const maxBottom = board.bottom - 24;
    const visTop = Math.max(board.top, root.top);
    let x = 0;
    let y = 0;
    if (r.right > root.right) x = maxRight - r.right;
    else if (r.left < board.left) x = minLeft - r.left;
    if (r.top < visTop) y = minTop - r.top;
    else if (r.bottom > board.bottom) y = maxBottom - r.bottom;
    return { x: Math.round(x), y: Math.round(y) };
  }

  toggle(slotIndex: number) {
    const s = this.slots.find((x) => x.i === slotIndex);
    if (s) this.turn(slotIndex, !s.flipped);
  }

  /* -------------------------------------------------------------- clock */

  private startClock() {
    this.clock?.kill();
    this.progress.p = 0;
    let preloaded = false;
    const next = () => (this.index + 1) % PROMPT_SETS.length;
    this.clock = gsap.to(this.progress, {
      p: 1,
      duration: this.o.reduced ? CYCLE_SECONDS_REDUCED : CYCLE_SECONDS,
      ease: "none",
      onUpdate: () => {
        this.renderRing();
        if (!preloaded && this.progress.p > 0.6) {
          preloaded = true;
          this.preload(next());
        }
      },
      onComplete: () => {
        // A full cycle with no input counts toward the video idle cap.
        this.idleCycles = this.inputThisCycle ? 0 : this.idleCycles + 1;
        this.inputThisCycle = false;
        this.go(next());
      },
    });
    this.renderRing();
    if (this.pauses.size) this.clock.pause();
  }

  /**
   * The ring around the pause button shows the real cycle clock: it fills over the 6 s
   * cycle (8 s crossfade under reduced motion), restarts with each prompt and freezes
   * with the clock whenever any pause reason holds it (the button, box hover or focus,
   * typing, offscreen, hidden tab).
   */
  private renderRing() {
    const ring = this.o.progressRing;
    if (!ring) return;
    // Quantised to 1/1000 of the circle, so a frozen ring writes nothing.
    const offset = String(Math.round((1 - this.progress.p) * 1000) / 1000);
    if (ring.style.strokeDashoffset !== offset) ring.style.strokeDashoffset = offset;
  }

  private go(i: number) {
    this.finishCycle();
    const from = this.index;
    this.index = i;
    this.o.onIndex(i);
    this.preload(i);
    this.cycle = this.o.reduced ? this.reducedCycle(i) : this.runCycle(from, i, false);
    this.startClock();
  }

  /** Snap any running cycle to its end state (manual jumps mid-wave). */
  private finishCycle() {
    if (!this.cycle) return;
    this.cycle.kill();
    this.cycle = null;
    const board = BOARD_CARDS[this.index];
    // Prompt: keep only the newest layer, fully shown.
    const layers = Array.from(this.o.promptStack.querySelectorAll<HTMLElement>("[data-layer]"));
    layers.slice(0, -1).forEach((l) => l.remove());
    const last = layers[layers.length - 1];
    if (last) {
      gsap.killTweensOf(last.querySelectorAll("[data-wi]"));
      gsap.set(last.querySelectorAll("[data-wi]"), { clearProps: "transform,opacity" });
      gsap.set(last, { clearProps: "opacity" });
    }
    const c = this.o.connector;
    if (c) {
      gsap.killTweensOf([c.beam, c.orb]);
      gsap.set(c.orb, { opacity: 0 });
      gsap.set(c.beam, { drawSVG: "0% 0%", opacity: 0 });
    }
    for (const s of this.slots) {
      const target = board[s.i];
      if (s.busy) {
        s.busy.kill();
        s.busy = null;
      }
      if (s.card !== target || s.rest.card !== target) {
        s.card = target;
        if (s.flipped) this.paintBack(s, target);
        this.land(s, target, false);
      }
    }
  }

  /* ------------------------------------------------------- the cycle */

  private visibleSlots(): Slot[] {
    // One layout read per wave. Hidden columns (mobile) are display:none, and cards wholly
    // outside the viewport (the board sits below the fold on phones) land without the flap:
    // nobody sees the wave there, and skipping it keeps the phone's main thread free.
    const vh = window.innerHeight;
    return COLUMNS.flat()
      .map((i) => this.slots.find((s) => s.i === i))
      .filter((s): s is Slot => {
        if (!s || s.el.offsetParent === null) return false;
        const r = s.el.getBoundingClientRect();
        return r.bottom > 0 && r.top < vh;
      });
  }

  private connectorVisible(): boolean {
    const c = this.o.connector;
    return !!c && c.svg.getBoundingClientRect().width > 0;
  }

  private runCycle(from: number, to: number, intro: boolean): gsap.core.Timeline {
    const tl = gsap.timeline();
    const board = BOARD_CARDS[to];
    if (!intro) tl.add(this.rollPrompt(PROMPT_SETS[to].prompt), 0);
    tl.add(() => this.holdVideos(), intro ? 0 : 0.3);

    let contact: number;
    if (this.connectorVisible()) {
      tl.add(this.beam(), intro ? 0 : 0.28);
      contact = (intro ? 0 : 0.28) + BEAM_SECONDS;
    } else {
      contact = intro ? 0.15 : 0.5;
    }

    const visible = this.visibleSlots();
    const pool = this.sparePool(from, to);
    visible.forEach((s, k) => {
      tl.add(() => this.arrive(s, board[s.i], pool), contact + k * STAGGER);
    });
    // Hidden slots (mobile) stay in sync without animation.
    tl.add(() => {
      for (const s of this.slots) {
        if (!visible.includes(s) && s.card !== board[s.i]) {
          s.card = board[s.i];
          this.land(s, s.card, false);
        }
      }
    }, contact);
    return tl;
  }

  private reducedCycle(to: number): gsap.core.Timeline {
    const tl = gsap.timeline();
    const board = BOARD_CARDS[to];
    tl.add(this.fadePrompt(PROMPT_SETS[to].prompt), 0);
    tl.add(() => {
      for (const s of this.slots) {
        const card = board[s.i];
        if (s.card === card) continue;
        s.card = card;
        if (s.flipped) this.paintBack(s, card);
        // Crossfade: paint the new face into the two static halves over the old face.
        this.paintFace(s.top, card, true);
        this.paintFace(s.bottom, card, true);
        gsap.set([s.sh.top, s.sh.cast], { opacity: 0 });
        gsap.set(s.flap, { autoAlpha: 0 });
        s.mech.style.visibility = "visible";
        gsap.fromTo(
          s.mech,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            ease: "none",
            onComplete: () => {
              this.land(s, card, false);
              gsap.set(s.mech, { clearProps: "opacity" });
              gsap.set(s.flap, { clearProps: "opacity,visibility" });
            },
          },
        );
      }
    }, 0.1);
    return tl;
  }

  private sparePool(from: number, to: number): HeroCard[] {
    const ids = new Set([from, to].filter((i) => this.loaded.has(i)));
    if (!ids.size) ids.add(from);
    return [...ids].flatMap((i) => PROMPT_SETS[i].cards);
  }

  /** The wave reaches one card. */
  private arrive(s: Slot, card: HeroCard, pool: HeroCard[]) {
    const old = s.card;
    s.card = card;
    s.hit.textContent = describeCard(card);
    if (s.busy) {
      s.busy.kill();
      s.busy = null;
    }
    if (s.flipped) {
      s.busy = this.pop(s, card);
      return;
    }
    const n = s.i === 0 ? 2 : Math.random() < 0.55 ? 2 : 1;
    const spares = shuffle(pool.filter((c) => c !== card && c !== old)).slice(0, n);
    s.busy = this.flapSequence(s, old, card, spares);
  }

  /* ---------------------------------------------------- split-flap card */

  private flapSequence(s: Slot, from: HeroCard, to: HeroCard, spares: HeroCard[]): gsap.core.Timeline {
    const steps = [from, ...spares, to];
    // The chip on the landing face still shows the previous number; land()
    // ticks it over to the new score, like a board's digit drum settling.
    const prevScore = steps[steps.length - 2].score;
    const tl = gsap.timeline({ onComplete: () => this.land(s, to, true, prevScore) });
    tl.add(() => {
      s.mech.style.visibility = "visible";
    }, 0);
    let t = 0;
    for (let k = 1; k < steps.length; k++) {
      const A = steps[k - 1];
      const B = steps[k];
      const last = k === steps.length - 1;
      const first = k === 1;
      const d = last ? FLAP_FINAL : FLAP_FAST;
      tl.add(() => {
        this.paintFace(s.top, B, false);
        this.paintFace(s.bottom, A, first);
        this.paintFace(s.flapA, A, first);
        this.paintFace(s.flapB, B, false);
        if (last) s.top.score.textContent = String(A.score);
      }, t);
      tl.fromTo(
        s.flap,
        { rotationX: 0 },
        { rotationX: -180, duration: d, ease: last ? "power2.in" : "power1.in", immediateRender: false },
        t,
      );
      // Light: the falling flap darkens, the revealed top brightens, the old
      // bottom catches the flap's shadow, the landing back lightens.
      tl.fromTo(s.sh.front, { opacity: 0 }, { opacity: 0.4, duration: d * 0.5, ease: "none", immediateRender: false }, t);
      tl.fromTo(s.sh.back, { opacity: 0.45 }, { opacity: 0, duration: d * 0.5, ease: "power1.out", immediateRender: false }, t + d * 0.5);
      tl.fromTo(s.sh.top, { opacity: 0.32 }, { opacity: 0, duration: d, ease: "none", immediateRender: false }, t);
      tl.fromTo(s.sh.cast, { opacity: 0 }, { opacity: 1, duration: d, ease: "power1.in", immediateRender: false }, t);
      // Sound: one soft "navigate" per landing; the fast intermediate flaps are silent.
      if (last) tl.add(() => this.o.synth.clack(s.i === 0 ? 1 : 0.85), t + d);
      t += d;
      if (last) {
        // Settle: the flap kisses the stop and rebounds a few degrees.
        tl.to(s.flap, { rotationX: -171, duration: 0.05, ease: "power1.out" }, t);
        tl.to(s.flap, { rotationX: -180, duration: 0.07, ease: "power2.in" }, t + 0.05);
        t += 0.12;
      } else {
        t += 0.008;
      }
    }
    return tl;
  }

  /** Final state of a card: rest face painted, chart drawn, score ticked, video swapped. */
  private land(s: Slot, card: HeroCard, animate: boolean, fromScore?: number) {
    s.tick?.kill();
    s.tick = null;
    this.paintFace(s.rest, card, true);
    if (!s.flipped && s.back.card !== card) this.paintBack(s, card);
    s.mech.style.visibility = "hidden";
    gsap.set(s.flap, { rotationX: 0 });
    gsap.set([s.sh.top, s.sh.cast, s.sh.front, s.sh.back], { opacity: 0 });
    const { line, area, dot, proj } = s.rest;
    gsap.killTweensOf([line, area, dot, proj]);
    if (animate && !this.o.reduced) {
      // The actual line draws first; the dotted projection wipes on from the end dot after it.
      gsap.fromTo(line, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.75, ease: EASE.out });
      gsap.fromTo(area, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.12, ease: "none" });
      gsap.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.4, delay: 0.55, ease: EASE.out });
      gsap.fromTo(
        proj,
        { clipPath: "inset(-60% 100% -10% 0%)", opacity: 1 },
        { clipPath: "inset(-60% 0% -10% 0%)", duration: 0.45, delay: 0.62, ease: "power1.out" },
      );
      if (fromScore !== undefined && fromScore !== card.score) s.tick = this.tickScore(s.rest.score, fromScore, card.score);
    } else {
      this.clearDraw(s);
    }
    this.setVideo(s, card);
    s.busy = null;
  }

  private clearDraw(s: Slot) {
    const { line, area, dot, proj } = s.rest;
    gsap.set(line, { clearProps: "strokeDasharray,strokeDashoffset" });
    gsap.set(area, { opacity: 1 });
    gsap.set(dot, { scale: 1 });
    gsap.set(proj, { clearProps: "clipPath,opacity" });
  }

  /** Count the score chip from the previous card's number to the new one (two digits, tabular). */
  private tickScore(el: HTMLElement, from: number, to: number): gsap.core.Tween {
    const o = { v: from };
    el.textContent = String(from);
    return gsap.to(o, {
      v: to,
      duration: 0.45,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(o.v));
      },
      onComplete: () => {
        el.textContent = String(to);
      },
    });
  }

  /** A turned card hit by the wave: pop, ring, radar morph; the front updates unseen. */
  private pop(s: Slot, card: HeroCard): gsap.core.Timeline {
    const tl = gsap.timeline();
    tl.fromTo(s.flipper, { scale: 1 }, { scale: 1.06, duration: 0.13, ease: "power2.out" }, 0);
    tl.to(s.flipper, { scale: 1, duration: 0.45, ease: EASE.out }, 0.13);
    tl.fromTo(s.ring, { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.08, duration: 0.65, ease: EASE.out }, 0);
    tl.add(() => this.o.synth.clack(0.85), 0);
    tl.add(this.morphBack(s, card), 0.04);
    this.land(s, card, false);
    s.busy = tl;
    tl.eventCallback("onComplete", () => {
      s.busy = null;
    });
    return tl;
  }

  /* --------------------------------------------------------- painting */

  private paintFace(f: FaceRefs, card: HeroCard, chart: boolean) {
    if (f.card !== card) {
      if (f.img.getAttribute("src") !== card.poster) {
        if (f.img.hasAttribute("srcset")) f.img.srcset = heroPosterSrcSet(card.poster);
        f.img.src = card.poster;
        // A poster that is not decoded yet (slow network, a jump to an
        // unloaded set) would leave the previous image on screen under the new
        // numbers. Show the neutral surface until it arrives instead.
        if (!f.img.complete) {
          const img = f.img;
          img.style.opacity = "0";
          const show = () => {
            if (img.complete) img.style.opacity = "";
          };
          img.addEventListener("load", show, { once: true });
          img.addEventListener("error", () => (img.style.opacity = ""), { once: true });
        } else if (f.img.style.opacity) {
          f.img.style.opacity = "";
        }
      }
      f.el.dataset.trend = card.trend;
      f.views.textContent = formatViews(card.views);
      f.trendText.textContent = TREND_LABEL[card.trend];
      f.glyph.setAttribute("d", this.o.glyphs[card.platform] ?? this.o.glyphs.tiktok ?? "");
      const g = chartGeometry(card);
      f.area.setAttribute("d", g.area);
      f.area.setAttribute("fill", `url(#${gradId(card.trend)})`);
      f.line.setAttribute("d", g.line);
      f.projLine.setAttribute("d", g.projLine);
      f.projArea.setAttribute("d", g.projArea);
      f.projArea.setAttribute("fill", `url(#${gradId(card.trend)})`);
      f.dot.style.left = `${g.endX}%`;
      f.dot.style.top = `${g.endY}%`;
      f.card = card;
    }
    // Outside the cache check: the landing flap borrows the chip for one beat.
    const score = String(card.score);
    if (f.score.textContent !== score) f.score.textContent = score;
    if (f.chart !== chart) {
      f.el.dataset.chart = chart ? "on" : "off";
      f.chart = chart;
    }
  }

  private paintBack(s: Slot, card: HeroCard) {
    const b = s.back;
    b.card = card;
    b.vals = paramValues(card);
    b.el.dataset.trend = card.trend;
    b.score.textContent = String(card.score);
    b.trend.textContent = TREND_LABEL[card.trend];
    b.rank.textContent = `#${card.rank}`;
    b.poly.setAttribute("points", radarPoints(b.vals));
    b.values.forEach((t, i) => (t.textContent = String(b.vals[i])));
    b.list.forEach((t, i) => (t.textContent = String(b.vals[i])));
    this.paintKeywords(b, card);
  }

  private paintKeywords(b: BackRefs, card: HeroCard) {
    b.kw.replaceChildren(
      ...backKeywords(card).map((k) => {
        const span = document.createElement("span");
        span.textContent = k;
        return span;
      }),
    );
  }

  private morphBack(s: Slot, card: HeroCard): gsap.core.Timeline {
    const b = s.back;
    const from = b.vals.slice();
    const to = paramValues(card);
    const fromScore = Number(b.score.textContent) || card.score;
    b.card = card;
    b.vals = to;
    b.el.dataset.trend = card.trend;
    b.trend.textContent = TREND_LABEL[card.trend];
    b.rank.textContent = `#${card.rank}`;
    const proxy = { k: 0 };
    const tl = gsap.timeline();
    tl.to(proxy, {
      k: 1,
      duration: 0.7,
      ease: EASE.out,
      onUpdate: () => {
        const cur = from.map((f, i) => f + (to[i] - f) * proxy.k);
        b.poly.setAttribute("points", radarPoints(cur));
        b.values.forEach((t, i) => (t.textContent = String(Math.round(cur[i]))));
        b.list.forEach((t, i) => (t.textContent = String(Math.round(cur[i]))));
        b.score.textContent = String(Math.round(fromScore + (card.score - fromScore) * proxy.k));
      },
    });
    tl.to(b.kw, { opacity: 0, y: -3, duration: 0.14, ease: "power1.in" }, 0);
    tl.add(() => this.paintKeywords(b, card), 0.14);
    tl.fromTo(b.kw, { opacity: 0, y: 3 }, { opacity: 1, y: 0, duration: 0.3, ease: EASE.out, immediateRender: false }, 0.15);
    return tl;
  }

  /* ----------------------------------------------------------- media */

  /** May this card's loop load now? See "Video bytes" in the header. Loops already requested always may. */
  private videoAllowed(src: string): boolean {
    if (!src) return false;
    if (this.videoSrcs.has(src)) return true;
    if (this.o.reduced || window.matchMedia(PHONE_QUERY).matches) return false;
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false;
    const bytes = this.o.videoBytes?.[src] ?? ASSUMED_VIDEO_BYTES;
    const ok = this.interacted
      ? this.idleCycles < IDLE_VIDEO_CYCLES
      : this.index < EAGER_VIDEO_SETS && this.videoBytesUsed + bytes <= VIDEO_BUDGET_BYTES;
    if (ok) {
      this.videoSrcs.add(src);
      this.videoBytesUsed += bytes;
    }
    return ok;
  }

  private setVideo(s: Slot, card: HeroCard) {
    const v = s.video;
    if (!v) return;
    const src = this.videoAllowed(card.video ?? "") ? card.video! : "";
    if ((v.getAttribute("src") ?? "") !== src) {
      v.removeAttribute("data-on");
      if (src) v.src = src;
      else {
        v.removeAttribute("src");
        v.load();
      }
    }
    // Register lazily (only once a source exists); re-created engines re-register.
    if (src && !s.videoUnreg) s.videoUnreg = videoManager.register(v, { priority: s.i === 0 ? 3 : 2 });
    if (!src && s.videoUnreg) {
      s.videoUnreg();
      s.videoUnreg = null;
    }
    if (s.videoUnreg) {
      // Stay on the poster while the visitor has paused the hero.
      videoManager.hold(v, this.pauses.has("user"));
      videoManager.schedule();
    }
  }

  /** Before a wave: loops fade back to their posters so the flaps start clean. */
  private holdVideos() {
    for (const s of this.slots) {
      if (!s.video || s.flipped) continue;
      s.video.removeAttribute("data-on");
      videoManager.hold(s.video, true);
    }
  }

  private preload(i: number) {
    if (this.loaded.has(i)) return;
    this.loaded.add(i);
    for (const c of PROMPT_SETS[i].cards) {
      const img = new Image();
      img.decoding = "async";
      // The same candidate the slots pick (one size for every slot, data.ts).
      img.sizes = HERO_POSTER_SIZES;
      img.srcset = heroPosterSrcSet(c.poster);
      img.src = c.poster;
      img.decode?.().catch(() => {});
      this.preloadBin.push(img);
    }
  }

  /* -------------------------------------------------------- connector */

  layout() {
    const c = this.o.connector;
    if (!c || !this.connectorVisible()) return;
    const lead = this.slots.find((s) => s.i === 0);
    if (!lead) return;
    const root = this.o.root;
    const r = root.getBoundingClientRect();
    const box = this.o.promptBox.getBoundingClientRect();
    // Line the lead card's centre up with the prompt box (owner sketch), within
    // limits so the triangle stays inside the stage. The lead card sits at the
    // stage's vertical centre before the offset (column 1 is centred in the
    // columns, which span the stage), so nothing depends on the current
    // transform. The pre-paint script in hero-board.tsx uses the same maths, so
    // the first paint is already placed and hydration changes nothing.
    // Vertical geometry comes from layout offsets relative to the root (see offsetTopIn).
    const cols = lead.el.closest<HTMLElement>("[data-columns]");
    const lr = lead.el.getBoundingClientRect();
    const board = this.o.board;
    const natural = offsetTopIn(board, root) + board.offsetHeight / 2;
    const boxCentre = offsetTopIn(this.o.promptBox, root) + this.o.promptBox.offsetHeight / 2;
    // A 1–2px drift (a late webfont swap re-wrapping the subtext) keeps the applied offset, so the
    // board never twitches after the first paint; the connector follows whatever is applied.
    const ideal = placementOffset(boxCentre, natural);
    const applied = cols ? parseFloat(getComputedStyle(cols).getPropertyValue("--board-dy")) : NaN;
    const dy = Number.isFinite(applied) && Math.abs(applied - ideal) <= 2 ? applied : ideal;
    if (cols && cols.style.getPropertyValue("--board-dy") !== `${dy}px`) cols.style.setProperty("--board-dy", `${dy}px`);
    if (!board.hasAttribute("data-placed")) board.setAttribute("data-placed", "");
    // hero-rev3 A: the prompt box and the lead card share the hero's centre line, so the connector
    // is one level run along it. hero-rev4: it starts on the box's OUTER border (the box's 1px
    // hairline ring sits just outside its layout edge, so the line begins one pixel past it) and
    // ends exactly on the lead card's left edge: no dots, no overlap into either, no seam. If the
    // offset is clamped (a degenerate window), it bends into a gentle S instead.
    const x1 = Math.round(box.right - r.left) + 1;
    const bx = Math.round(lr.left - r.left);
    const by = natural + dy;
    const y1 = boxCentre;
    const dx = Math.max(24, bx - x1);
    const level = Math.abs(by - y1) < 1;
    // A level run sits on a pixel row (the half pixel), so the 1px hairline stays crisp.
    const ly = Math.round(by) + 0.5;
    const d = level ? `M ${x1} ${ly} L ${bx} ${ly}` : `M ${x1} ${y1} C ${x1 + dx * 0.55} ${y1} ${bx - dx * 0.55} ${by} ${bx} ${by}`;
    c.base.setAttribute("d", d);
    c.beam.setAttribute("d", d);
    // The pulse's glow never paints over the box or the card: it is clipped to the run between them.
    const top = Math.min(y1, by) - 30;
    c.clip.setAttribute("x", String(x1));
    c.clip.setAttribute("y", String(top));
    c.clip.setAttribute("width", String(Math.max(0, bx - x1)));
    c.clip.setAttribute("height", String(Math.abs(by - y1) + 60));
  }

  /**
   * One pulse: a lit head (the orb) with a short trail along the connector, from the prompt
   * box's border to the lead card's edge, where it simply stops (a very quick fade). The
   * split-flap wave starts as it arrives (runCycle: BEAM_SECONDS).
   */
  private beam(): gsap.core.Timeline {
    const c = this.o.connector!;
    this.layout();
    const path = c.base;
    const L = path.getTotalLength();
    const tl = gsap.timeline();
    if (L < 2) return tl;
    // The head's centre travels from one core radius in (so the dot touches the box's border) to
    // one radius short (so it touches the card's edge): the whole run, edge to edge.
    const head0 = ORB_R;
    const head1 = L - ORB_R;
    const trail = Math.min(TRAIL_PX, L * 0.45);
    const proxy = { t: 0 };
    const place = () => {
      const pos = head0 + (head1 - head0) * proxy.t;
      const p = path.getPointAtLength(pos);
      c.orbPos.setAttribute("transform", `translate(${p.x} ${p.y})`);
      const tail = Math.max(0, pos - trail);
      gsap.set(c.beam, { drawSVG: `${(tail / L) * 100}% ${(pos / L) * 100}%` });
    };
    tl.add(() => {
      proxy.t = 0;
      place();
    }, 0);
    tl.set([c.beam, c.orb], { opacity: 1 }, 0);
    tl.fromTo(c.orb, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" }, 0);
    tl.to(proxy, { t: 1, duration: BEAM_SECONDS, ease: "power2.inOut", onUpdate: place }, 0);
    // The end: the pulse is already on the card's edge; it only fades out, quickly, in place.
    tl.to(c.orb, { opacity: 0, duration: 0.14, ease: "power1.out" }, BEAM_SECONDS);
    tl.to(c.beam, { opacity: 0, duration: 0.14, ease: "power1.out" }, BEAM_SECONDS);
    return tl;
  }

  /* ----------------------------------------------------------- prompt */

  private newLayer(text: string): HTMLElement {
    const tpl = document.createElement("template");
    tpl.innerHTML = promptLayerHtml(text, this.layerClasses);
    return tpl.content.firstElementChild as HTMLElement;
  }

  private rollPrompt(text: string): gsap.core.Timeline {
    const stack = this.o.promptStack;
    const layers = Array.from(stack.querySelectorAll<HTMLElement>("[data-layer]"));
    layers.slice(0, -1).forEach((l) => l.remove());
    const old = layers[layers.length - 1];
    const next = this.newLayer(text);
    stack.appendChild(next);
    const tl = gsap.timeline({ onComplete: () => old?.remove() });
    if (old) {
      tl.to(old.querySelectorAll("[data-wi]"), {
        yPercent: -110,
        rotationX: 65,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        stagger: 0.012,
      }, 0);
    }
    tl.fromTo(
      next.querySelectorAll("[data-wi]"),
      { yPercent: 110, rotationX: -65, opacity: 0 },
      { yPercent: 0, rotationX: 0, opacity: 1, duration: 0.6, ease: EASE.out, stagger: 0.02 },
      0.12,
    );
    return tl;
  }

  private fadePrompt(text: string): gsap.core.Timeline {
    const stack = this.o.promptStack;
    const layers = Array.from(stack.querySelectorAll<HTMLElement>("[data-layer]"));
    layers.slice(0, -1).forEach((l) => l.remove());
    const old = layers[layers.length - 1];
    const next = this.newLayer(text);
    stack.appendChild(next);
    const tl = gsap.timeline({ onComplete: () => old?.remove() });
    // Sequential (out, then in): overlapping lines of text read as a smudge.
    if (old) tl.to(old, { opacity: 0, duration: 0.22, ease: "none" }, 0);
    tl.fromTo(next, { opacity: 0 }, { opacity: 1, duration: 0.32, ease: "none" }, old ? 0.22 : 0);
    return tl;
  }
}
