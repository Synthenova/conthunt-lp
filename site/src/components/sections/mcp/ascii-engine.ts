/**
 * ASCII globe engine for the MCP band (no React, no GSAP: one canvas, one rAF loop).
 *
 * The ContHunt mark (public/brand/icon-ink.png) is a globe seen from its pole: the equator
 * is the outer ring, broken where the vertical meridian crosses it; a latitude at 46° is
 * the inner ring (radius ≈ 0.69 of the outer, as in the mark), broken where the
 * horizontal meridian crosses it; the two meridians make the cross, and a four-point star
 * sits on the pole. The breaks live in globe coordinates, so the same object reads as the
 * mark from the pole and as a stylised globe when tilted. The engine decodes in as the
 * mark, tilts back into a slowly spinning globe, and every cycle winds back into the mark.
 *
 * Rendering:
 * - A character grid (mono, about 6×12 CSS px cells) sized to the canvas, DPR-aware (≤ 2).
 * - Glyphs are pre-rendered once into an atlas (row 0 = ink, then three ink→hue mix steps for
 *   each palette hue: pink, purple, blue, green), then blitted with drawImage. No fillText per frame.
 * - Front lines pick their glyph from the projected tangent (- / | \), crossings become +,
 *   back lines are dotted (.) like hidden lines in a technical drawing. Arcs thin out
 *   toward each break, like the mark's tapered strokes.
 * - The sphere's body is shaded with a density ramp (lit from the upper left) once the
 *   globe tilts; the pole star uses the heavy end of the ramp ( * # % @ ).
 * - A topographic contour field (smooth value noise) drifts behind everything and fades
 *   under the copy.
 * - Pointer energy: cells near the cursor scramble and tint by distance band (nearest pink,
 *   then purple, then blue; the click ripple is green), then decay (damped
 *   under the copy so text stays readable). Clicks send a ripple ring. Dragging spins and
 *   tilts the globe with inertia.
 * - About 30fps, paused by the host when offscreen or hidden. `renderStatic()` draws the
 *   mark as one still frame for reduced motion.
 */

const RAMP = " .:-=+*#%@";
/** Body shading, light → dense. Kept apart from the line glyphs so lines stay legible. */
const BODY = ".,:;=";
/** Pole star, outer tip → centre. */
const STAR = "+*#%@";
const SCRAMBLE = "!<>_/\\[]{}=+*^?#%&$01";
const LINE_GLYPHS = "-/|\\+.:o";
const GLYPHS = Array.from(new Set((RAMP.slice(1) + BODY + STAR + SCRAMBLE + LINE_GLYPHS).split(""))).join("");

/** ink → hue strength of the three tint rows kept per palette hue. */
const TINTS = [0.55, 0.8, 1] as const;
/** Hover bands by pointer energy: nearest = palette[0] (pink), then purple, then blue. Ripples use palette[3] (green). */
/** Atlas rows: ink, then TINTS.length rows per palette hue. */
const ATLAS_ROWS = 1 + 4 * TINTS.length;
const BAND_PINK = 0.55;
const BAND_PURPLE = 0.28;
const RIPPLE_HUE = 3;
const FRAME_MS = 1000 / 30;

const PHI_MARK = Math.PI / 2; // pole view: the mark
const PHI_GLOBE = (30 * Math.PI) / 180; // oblique resting view
const OMEGA = 0.32; // rad/s resting spin
const GLOBE_HOLD = 9.5; // s spinning before winding back to the mark
const MARK_HOLD = 2.4; // s holding the mark
const TO_MARK_DUR = 2.6; // s (winds up to half a turn, so it lands the right way up)
const INTRO_DUR = 1.25; // s decode reveal

const DEG = Math.PI / 180;
/** Each break in the mark spans ±21° around its axis (measured on icon-ink.png). */
const MARK_GAP = 21 * DEG;
/** Arcs thin out over this angle before a break. */
const MARK_TAPER = 15 * DEG;
/** Inner arcs: radius cos(46°) ≈ 0.69 of the outer ring, as in the mark. */
const MARK_INNER_LAT = 46 * DEG;
/** Star arm length, as a fraction of the globe radius. */
const STAR_ARM = 0.38;
/**
 * Star shape exponent: |u|^p + |v|^p ≤ arm^p. 0.5 is a true astroid, which a 6×12px cell
 * grid reduces to a dot; 0.62 keeps four distinct points and a body about three rows thick.
 */
const STAR_P = 0.62;

type Mode = "intro" | "mark" | "toMark" | "globe" | "user";

export interface GlobeAnchor {
  /** Globe centre and radius in CSS px, relative to the canvas. */
  cx: number;
  cy: number;
  r: number;
}

export interface QuietRect {
  /** Area (CSS px, canvas-relative) where the background field is attenuated (the copy). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Field multiplier inside the rect. Default 0.22. */
  floor?: number;
  /** Fade distance outside the rect, px. Default 56. */
  feather?: number;
}

export interface EngineColors {
  ink: string;
  /** Pink, purple, blue, green (any CSS color the canvas can parse as rgb/hex). */
  palette: [string, string, string, string];
}

interface Ripple {
  x: number;
  y: number;
  t0: number;
}

/* ------------------------------------------------------------------ maths */

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function hash3(x: number, y: number, z: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function valueNoise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const c000 = hash3(xi, yi, zi);
  const c100 = hash3(xi + 1, yi, zi);
  const c010 = hash3(xi, yi + 1, zi);
  const c110 = hash3(xi + 1, yi + 1, zi);
  const c001 = hash3(xi, yi, zi + 1);
  const c101 = hash3(xi + 1, yi, zi + 1);
  const c011 = hash3(xi, yi + 1, zi + 1);
  const c111 = hash3(xi + 1, yi + 1, zi + 1);
  const x00 = c000 + (c100 - c000) * u;
  const x10 = c010 + (c110 - c010) * u;
  const x01 = c001 + (c101 - c001) * u;
  const x11 = c011 + (c111 - c011) * u;
  const y0 = x00 + (x10 - x00) * v;
  const y1 = x01 + (x11 - x01) * v;
  return y0 + (y1 - y0) * w;
}

/** Deterministic PRNG for the surface data points. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseColor(input: string): [number, number, number] {
  const s = input.trim();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const rgb = s.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const [r, g, b] = rgb[1].split(/[ ,/]+/).map((p) => parseFloat(p));
    return [r || 0, g || 0, b || 0];
  }
  return [15, 15, 15];
}

/**
 * Visibility of an arc at parameter `a` near the breaks centred on `at` and `at + π`:
 * 0 inside a break, easing to 1 over MARK_TAPER beyond it. Pure.
 */
function gapWeight(a: number, at: number): number {
  let d = (a - at) % Math.PI;
  if (d < 0) d += Math.PI;
  d = Math.min(d, Math.PI - d);
  return smoothstep(MARK_GAP, MARK_GAP + MARK_TAPER, d);
}

/* ------------------------------------------------------------- the engine */

/** Circles on the unit sphere, in globe-local coords (Y = polar axis). */
interface LineDef {
  kind: "lat" | "lon";
  /** Latitude (rad) for "lat", longitude (rad) of the great circle for "lon". */
  angle: number;
  strength: number;
  /**
   * Latitude rings only: parameter angle (mod π) where the ring breaks. A ring point is
   * (sin a, ·, cos a), so 0 = where it crosses the X = 0 meridian, π/2 = the Z = 0 one.
   */
  gapAt?: number;
}

const LINES: LineDef[] = [
  // outer arcs: the equator, broken where the vertical meridian crosses it
  { kind: "lat", angle: 0, strength: 1, gapAt: 0 },
  // inner arcs: broken where the horizontal meridian crosses them
  { kind: "lat", angle: MARK_INNER_LAT, strength: 0.95, gapAt: Math.PI / 2 },
  { kind: "lat", angle: -MARK_INNER_LAT, strength: 0.95, gapAt: Math.PI / 2 },
  // the cross (pole view: lon 0 is vertical, lon 90 horizontal)
  { kind: "lon", angle: 0, strength: 1 },
  { kind: "lon", angle: 90 * DEG, strength: 1 },
];

export class AsciiGlobeEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private atlas: HTMLCanvasElement;
  private fontFamily: string;
  private colors: EngineColors;

  // geometry (CSS px)
  private w = 0;
  private h = 0;
  private dpr = 1;
  private fontSize = 10;
  private cw = 6;
  private ch = 12;
  private cols = 0;
  private rows = 0;
  private ox = 0;
  private oy = 0;
  private slotW = 0;
  private slotH = 0;
  private glyphIndex = new Map<string, number>();
  private anchor: GlobeAnchor = { cx: 0, cy: 0, r: 0 };
  private quiet: QuietRect[] = [];

  // per-cell buffers
  private A = new Float32Array(0); // alpha
  private G = new Uint8Array(0); // glyph slot
  private O = new Uint8Array(0); // line orientation (0 none, 1-4)
  private E = new Float32Array(0); // pointer energy
  private K = new Uint8Array(0); // 1 where the strongest energy came from a ripple (green), else pointer
  private rnd = new Float32Array(0); // stable per-cell random
  private reveal = new Float32Array(0); // intro reveal threshold
  private fieldMask = new Float32Array(0);
  private quietMask = new Float32Array(0); // 1 in the open, low under the copy (damps pointer energy)
  private height = new Float32Array(0); // field height map (per frame)

  // surface data points (unit sphere)
  private points: { x: number; y: number; z: number; phase: number }[] = [];

  // animation state
  private mode: Mode = "intro";
  private modeT0 = 0;
  private phi = PHI_MARK;
  private phiVel = 0;
  private theta = 0;
  private spin = 0;
  private toMark = { theta0: 0, delta: 0, v0: 0, phi0: 0 };
  private introT0 = -1;
  private time = 0;
  private lastNow = 0;
  private lastFrame = 0;
  private raf = 0;
  private running = false;

  // pointer
  private px = -9999;
  private py = -9999;
  private pointerInside = false;
  private pointerMovedAt = 0;
  private dragging = false;
  private dragLastX = 0;
  private dragLastY = 0;
  private dragLastT = 0;
  private dragVel = 0;
  private releasedAt = -1;
  private ripples: Ripple[] = [];

  constructor(canvas: HTMLCanvasElement, opts: { fontFamily: string; colors: EngineColors }) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.atlas = document.createElement("canvas");
    this.fontFamily = opts.fontFamily;
    this.colors = opts.colors;
    const rand = mulberry32(7);
    for (let i = 0; i < 16; i++) {
      const lat = Math.asin(rand() * 1.7 - 0.85);
      const lon = rand() * Math.PI * 2;
      this.points.push({
        x: Math.cos(lat) * Math.sin(lon),
        y: Math.sin(lat),
        z: Math.cos(lat) * Math.cos(lon),
        phase: rand() * Math.PI * 2,
      });
    }
  }

  /* ---------------------------------------------------------- setup */

  setColors(colors: EngineColors) {
    this.colors = colors;
    this.buildAtlas();
  }

  setFontFamily(family: string) {
    this.fontFamily = family;
    this.measure();
    this.buildAtlas();
    this.allocate();
  }

  resize(w: number, h: number, anchor: GlobeAnchor, quiet: QuietRect[]) {
    this.w = Math.max(1, Math.round(w));
    this.h = Math.max(1, Math.round(h));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.anchor = anchor;
    this.quiet = quiet;
    this.fontSize = this.w < 520 ? 9 : 10;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.measure();
    this.buildAtlas();
    this.allocate();
  }

  private font() {
    return `500 ${this.fontSize}px ${this.fontFamily}`;
  }

  private measure() {
    this.ctx.font = this.font();
    this.cw = Math.max(4, this.ctx.measureText("0").width);
    this.ch = Math.round(this.fontSize * 1.22);
    this.cols = Math.max(1, Math.floor(this.w / this.cw));
    this.rows = Math.max(1, Math.floor(this.h / this.ch));
    this.ox = (this.w - this.cols * this.cw) / 2;
    this.oy = (this.h - this.rows * this.ch) / 2;
  }

  private buildAtlas() {
    const dpr = this.dpr;
    this.slotW = Math.ceil(this.cw * dpr) + 2;
    this.slotH = Math.ceil(this.ch * dpr) + 2;
    const a = this.atlas;
    a.width = this.slotW * GLYPHS.length;
    a.height = this.slotH * ATLAS_ROWS;
    const g = a.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, a.width, a.height);
    g.font = `500 ${this.fontSize * dpr}px ${this.fontFamily}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const ink = parseColor(this.colors.ink);
    const hues = this.colors.palette.map(parseColor);
    for (let m = 0; m < ATLAS_ROWS; m++) {
      const c =
        m === 0
          ? ink
          : ink.map((v, k) => Math.round(v + (hues[Math.floor((m - 1) / TINTS.length)][k] - v) * TINTS[(m - 1) % TINTS.length]));
      g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      for (let i = 0; i < GLYPHS.length; i++) {
        g.fillText(GLYPHS[i], i * this.slotW + this.slotW / 2, m * this.slotH + this.slotH / 2 + 0.5);
      }
    }
    this.glyphIndex.clear();
    for (let i = 0; i < GLYPHS.length; i++) this.glyphIndex.set(GLYPHS[i], i);
  }

  private allocate() {
    const n = this.cols * this.rows;
    this.A = new Float32Array(n);
    this.G = new Uint8Array(n);
    this.O = new Uint8Array(n);
    this.E = new Float32Array(n);
    this.K = new Uint8Array(n);
    this.rnd = new Float32Array(n);
    this.reveal = new Float32Array(n);
    this.fieldMask = new Float32Array(n);
    this.quietMask = new Float32Array(n);
    this.height = new Float32Array(n);
    const { cx, cy, r } = this.anchor;
    const maxD = Math.hypot(Math.max(cx, this.w - cx), Math.max(cy, this.h - cy)) || 1;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const i = row * this.cols + col;
        const x = this.ox + (col + 0.5) * this.cw;
        const y = this.oy + (row + 0.5) * this.ch;
        this.rnd[i] = hash3(col, row, 91);
        const d = Math.hypot(x - cx, y - cy);
        this.reveal[i] = 0.62 * (d / maxD) + 0.38 * this.rnd[i];
        // background field mask: quiet under the copy, soft at the edges, absent inside the globe
        let m = 1;
        for (const q of this.quiet) {
          const dx = Math.max(q.x - x, 0, x - (q.x + q.w));
          const dy = Math.max(q.y - y, 0, y - (q.y + q.h));
          m *= (q.floor ?? 0.22) + (1 - (q.floor ?? 0.22)) * smoothstep(0, q.feather ?? 56, Math.hypot(dx, dy));
        }
        this.quietMask[i] = Math.max(0.2, m);
        m *= smoothstep(0, this.h * 0.14, y) * smoothstep(0, this.h * 0.14, this.h - y);
        m *= smoothstep(0, this.w * 0.06, x) * smoothstep(0, this.w * 0.06, this.w - x);
        m *= smoothstep(r * 1.02, r * 1.22, d);
        this.fieldMask[i] = m;
      }
    }
  }

  /* -------------------------------------------------------- pointer */

  pointerMove(x: number, y: number) {
    if (this.dragging) {
      const now = performance.now();
      const dx = x - this.dragLastX;
      const dy = y - this.dragLastY;
      const dt = Math.max(1, now - this.dragLastT) / 1000;
      this.theta += dx * 0.011;
      this.phi = clamp(this.phi - dy * 0.007, 0.08, PHI_MARK);
      this.dragVel = this.dragVel * 0.6 + ((dx * 0.011) / dt) * 0.4;
      this.dragLastX = x;
      this.dragLastY = y;
      this.dragLastT = now;
    }
    this.px = x;
    this.py = y;
    this.pointerInside = true;
    this.pointerMovedAt = this.time;
  }

  pointerLeave() {
    this.pointerInside = false;
  }

  /** True when (x, y) is on the globe (the host uses it for the grab cursor). */
  hitGlobe(x: number, y: number): boolean {
    const { cx, cy, r } = this.anchor;
    return Math.hypot(x - cx, y - cy) <= r * 1.04;
  }

  /** Starts a drag when on the globe. Returns true if a drag started. */
  pointerDown(x: number, y: number): boolean {
    if (!this.hitGlobe(x, y)) return false;
    this.dragging = true;
    this.dragLastX = x;
    this.dragLastY = y;
    this.dragLastT = performance.now();
    this.dragVel = 0;
    this.phiVel = 0;
    this.mode = "user";
    this.modeT0 = this.time;
    return true;
  }

  pointerUp() {
    if (!this.dragging) return;
    this.dragging = false;
    this.spin = clamp(this.dragVel, -9, 9);
    this.releasedAt = this.time;
  }

  ripple(x: number, y: number) {
    this.ripples.push({ x, y, t0: this.time });
    if (this.ripples.length > 4) this.ripples.shift();
  }

  /* ------------------------------------------------------- lifecycle */

  play() {
    if (this.running) return;
    this.running = true;
    this.lastNow = performance.now();
    if (this.introT0 < 0) {
      this.introT0 = this.time;
      this.mode = "intro";
      this.modeT0 = this.time;
    }
    const loop = (now: number) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      if (now - this.lastFrame < FRAME_MS - 2) return;
      this.lastFrame = now;
      const dt = Math.min(0.066, (now - this.lastNow) / 1000);
      this.lastNow = now;
      this.time += dt;
      this.step(dt);
      this.draw(false);
    };
    this.raf = requestAnimationFrame(loop);
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** One still frame (reduced motion): the mark, no field drift, no pointer energy. */
  renderStatic() {
    this.pause();
    this.mode = "mark";
    this.phi = PHI_MARK;
    this.theta = 0;
    this.time = 3;
    this.E.fill(0);
    this.ripples = [];
    this.draw(true);
  }

  destroy() {
    this.pause();
    this.ripples = [];
  }

  /* ---------------------------------------------------------- motion */

  private setMode(mode: Mode) {
    this.mode = mode;
    this.modeT0 = this.time;
  }

  private step(dt: number) {
    const t = this.time - this.modeT0;
    switch (this.mode) {
      case "intro": {
        this.phi = PHI_MARK;
        this.theta = 0;
        if (t > INTRO_DUR + 1.1) this.setMode("globe");
        break;
      }
      case "mark": {
        this.phi = PHI_MARK;
        this.spin = 0;
        if (t > MARK_HOLD) this.setMode("globe");
        break;
      }
      case "toMark": {
        const u = clamp(t / TO_MARK_DUR, 0, 1);
        const { theta0, delta, v0, phi0 } = this.toMark;
        // Hermite: starts at the current spin speed, lands exactly on the mark with zero speed.
        const D = TO_MARK_DUR;
        this.theta = theta0 + delta * (3 * u * u - 2 * u * u * u) + v0 * D * (u - 2 * u * u + u * u * u);
        this.phi = phi0 + (PHI_MARK - phi0) * easeInOutCubic(u);
        if (u >= 1) {
          this.theta = theta0 + delta;
          this.phiVel = 0;
          this.setMode("mark");
        }
        break;
      }
      case "user": {
        if (!this.dragging) {
          // inertia, then hand back to the resting spin
          this.spin += (OMEGA - this.spin) * (1 - Math.exp(-dt * 1.4));
          this.theta += this.spin * dt;
          if (this.time - this.releasedAt > 1.4) this.setMode("globe");
        }
        break;
      }
      case "globe": {
        // critically damped spring toward the resting tilt; spin eases up to speed
        const k = 5;
        const c = 2 * Math.sqrt(k);
        this.phiVel += (k * (PHI_GLOBE - this.phi) - c * this.phiVel) * dt;
        this.phi += this.phiVel * dt;
        this.spin += (OMEGA - this.spin) * (1 - Math.exp(-dt * 0.9));
        this.theta += this.spin * dt;
        if (t > GLOBE_HOLD && !this.pointerInside) {
          // The breaks make the mark only half-turn symmetric, so land on a multiple of π.
          const half = Math.PI;
          const minAhead = Math.max(0.35, this.spin * TO_MARK_DUR * 0.45);
          const target = Math.ceil((this.theta + minAhead) / half) * half;
          this.toMark = { theta0: this.theta, delta: target - this.theta, v0: this.spin, phi0: this.phi };
          this.setMode("toMark");
        }
        break;
      }
    }
  }

  /* ---------------------------------------------------------- render */

  private put(i: number, glyph: string, alpha: number) {
    if (alpha > this.A[i]) {
      this.A[i] = alpha;
      this.G[i] = this.glyphIndex.get(glyph) ?? 0;
    }
  }

  private cellAt(x: number, y: number): number {
    const col = Math.floor((x - this.ox) / this.cw);
    const row = Math.floor((y - this.oy) / this.ch);
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return -1;
    return row * this.cols + col;
  }

  /** Splats one projected line sample with an orientation-aware glyph. */
  private splatLine(x: number, y: number, tx: number, ty: number, z: number, strength: number) {
    const i = this.cellAt(x, y);
    if (i < 0) return;
    if (z < -0.02) {
      // hidden line: sparse dots, faint
      if (this.rnd[i] > 0.62) return;
      this.put(i, ".", strength * (0.12 + 0.1 * (1 + z)));
      return;
    }
    let ang = (Math.atan2(-ty, tx) * 180) / Math.PI;
    if (ang < 0) ang += 180;
    const o = ang < 22.5 || ang >= 157.5 ? 1 : ang < 67.5 ? 2 : ang < 112.5 ? 3 : 4;
    // depth cue: lines brighten toward the viewer and thin out at the limb
    const alpha = strength * (0.22 + 0.7 * Math.min(1, z * 1.15));
    const prev = this.O[i];
    if (prev && prev !== o && this.A[i] > 0.3 && alpha > 0.3) {
      this.A[i] = Math.max(this.A[i], alpha);
      this.G[i] = this.glyphIndex.get("+") ?? 0;
      return;
    }
    if (alpha > this.A[i]) {
      this.O[i] = o;
      this.A[i] = alpha;
      this.G[i] = this.glyphIndex.get(o === 1 ? "-" : o === 2 ? "/" : o === 3 ? "|" : "\\") ?? 0;
    }
  }

  private draw(still: boolean) {
    const { ctx, cols, rows } = this;
    const n = cols * rows;
    this.A.fill(0);
    this.O.fill(0);
    const time = this.time;
    const { cx, cy, r } = this.anchor;

    // 1. Background field: drifting topographic contours of a smooth noise height map.
    //    Contour cells pick their glyph from the local tangent, like the globe's lines.
    const drift = still ? 0 : time;
    const H = this.height;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        if (this.fieldMask[i] < 0.02) {
          H[i] = 0;
          continue;
        }
        const nx = (col + drift * 0.6) * 0.058;
        const ny = row * 0.116;
        H[i] = 0.7 * valueNoise3(nx, ny, drift * 0.05) + 0.3 * valueNoise3(nx * 2.1 + 5, ny * 2.1, drift * 0.08 + 9);
      }
    }
    const LEVELS = 9;
    for (let row = 1; row < rows - 1; row++) {
      for (let col = 1; col < cols - 1; col++) {
        const i = row * cols + col;
        const m = this.fieldMask[i];
        if (m < 0.02) continue;
        const v = H[i] * LEVELS;
        const f = v - Math.round(v);
        // gradient in levels per cell (central differences)
        const gx = (H[i + 1] - H[i - 1]) * 0.5 * LEVELS;
        const gy = (H[i + cols] - H[i - cols]) * 0.5 * LEVELS;
        const g = Math.hypot(gx, gy);
        if (g < 1e-4) continue;
        const dist = Math.abs(f) / g; // distance to the contour, in cells
        if (dist > 0.5) continue;
        // tangent (-gy, gx) in pixel space → glyph
        let ang = (Math.atan2(-gx * this.ch, -gy * this.cw) * 180) / Math.PI;
        if (ang < 0) ang += 180;
        const glyph = ang < 22.5 || ang >= 157.5 ? "-" : ang < 67.5 ? "/" : ang < 112.5 ? "|" : "\\";
        // every fourth level is an index contour, drawn stronger (as on a survey map)
        const level = Math.round(v);
        const a = (level % 4 === 0 ? 0.3 : 0.13) * (1 - dist * 0.8) * m;
        this.put(i, glyph, a);
      }
    }

    // 2. Wireframe lines (splatted, orientation-aware), with the mark's breaks.
    const phi = this.phi;
    const theta = this.theta;
    const cT = Math.cos(theta);
    const sT = Math.sin(theta);
    const cP = Math.cos(phi);
    const sP = Math.sin(phi);
    const project = (X: number, Y: number, Z: number) => {
      const x1 = X * cT + Z * sT;
      const z1 = -X * sT + Z * cT;
      const y2 = Y * cP - z1 * sP;
      const z2 = Y * sP + z1 * cP;
      return [cx + x1 * r, cy - y2 * r, z2] as const;
    };
    const step = Math.min(this.cw, this.ch) * 0.45;
    for (const line of LINES) {
      const s = line.strength;
      const rad = line.kind === "lat" ? Math.cos(line.angle) : 1;
      const samples = Math.max(48, Math.ceil((2 * Math.PI * r * rad) / step));
      let prev: readonly [number, number, number] | null = null;
      for (let k = 0; k <= samples; k++) {
        const a = (k / samples) * Math.PI * 2;
        let X: number;
        let Y: number;
        let Z: number;
        if (line.kind === "lat") {
          X = rad * Math.sin(a);
          Y = Math.sin(line.angle);
          Z = rad * Math.cos(a);
        } else {
          X = Math.cos(a) * Math.sin(line.angle);
          Y = Math.sin(a);
          Z = Math.cos(a) * Math.cos(line.angle);
        }
        const p = project(X, Y, Z);
        const w = line.gapAt === undefined ? 1 : gapWeight(a, line.gapAt);
        if (prev && w > 0.04) this.splatLine(p[0], p[1], p[0] - prev[0], p[1] - prev[1], p[2], s * w);
        prev = p;
      }
    }

    // Silhouette: the mark's two outer arcs (broken top and bottom) frame the globe in
    // every pose. From the pole it coincides with the equator.
    if (r > 4) {
      const samples = Math.ceil((2 * Math.PI * r) / step);
      for (let k = 0; k < samples; k++) {
        const a = (k / samples) * Math.PI * 2;
        const w = gapWeight(a, Math.PI / 2);
        if (w < 0.04) continue;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        this.splatLine(x, y, -Math.sin(a), Math.cos(a), 0.5, 0.8 * w);
      }
    }

    // 3. The four-point star on the visible pole. Each cell near the pole is projected back
    //    onto the front of the sphere, so the star foreshortens with the globe. Its shape is
    //    |u|^p + |v|^p ≤ arm^p in the pole's (X, Z) plane; heavier ramp glyphs sit toward
    //    its centre, and the thin tips give way to the line glyphs.
    if (r > 4) {
      const pole = project(0, 1, 0);
      const facing = pole[2];
      if (facing > 0.15) {
        const sk = Math.pow(STAR_ARM, STAR_P);
        const reach = STAR_ARM * r + this.cw;
        // Snap the star's centre to the centre of the pole's cell, so its rows sit
        // symmetrically about the cross instead of half a row off it.
        const sx = this.ox + (Math.floor((pole[0] - this.ox) / this.cw) + 0.5) * this.cw - pole[0];
        const sy = this.oy + (Math.floor((pole[1] - this.oy) / this.ch) + 0.5) * this.ch - pole[1];
        const c0 = Math.max(0, Math.floor((pole[0] - reach - this.ox) / this.cw));
        const c1 = Math.min(cols - 1, Math.ceil((pole[0] + reach - this.ox) / this.cw));
        const r0 = Math.max(0, Math.floor((pole[1] - reach - this.oy) / this.ch));
        const r1 = Math.min(rows - 1, Math.ceil((pole[1] + reach - this.oy) / this.ch));
        for (let row = r0; row <= r1; row++) {
          for (let col = c0; col <= c1; col++) {
            const x1 = (this.ox + (col + 0.5) * this.cw - sx - cx) / r;
            const y2 = -(this.oy + (row + 0.5) * this.ch - sy - cy) / r;
            const q = 1 - x1 * x1 - y2 * y2;
            if (q <= 0) continue;
            const z2 = Math.sqrt(q);
            // undo the tilt, then the spin
            const Y = y2 * cP + z2 * sP;
            if (Y <= 0) continue;
            const z1 = -y2 * sP + z2 * cP;
            const u = x1 * cT - z1 * sT;
            const v = x1 * sT + z1 * cT;
            const depth = 1 - (Math.pow(Math.abs(u), STAR_P) + Math.pow(Math.abs(v), STAR_P)) / sk;
            if (depth < 0.1) continue;
            const i = row * cols + col;
            const a = (0.5 + 0.45 * depth) * (0.35 + 0.65 * facing);
            if (depth < 0.2 && a <= this.A[i]) continue;
            this.A[i] = Math.max(this.A[i], a);
            this.G[i] = this.glyphIndex.get(STAR[Math.min(STAR.length - 1, Math.floor(depth * STAR.length * 1.15))]) ?? 0;
          }
        }
      }
    }

    // Body and data points appear as the globe tilts away from the mark, so the mark
    // itself stays as clean as the logo.
    const body = 1 - smoothstep(PHI_GLOBE + 0.12, PHI_MARK - 0.12, phi);

    // Surface data points: saved videos, pulsing softly on the front face.
    if (body > 0.05) {
      for (const pt of this.points) {
        const p = project(pt.x, pt.y, pt.z);
        if (p[2] < 0.12) continue;
        const i = this.cellAt(p[0], p[1]);
        if (i < 0) continue;
        const pulse = still ? 0.6 : 0.5 + 0.5 * Math.sin(time * 1.6 + pt.phase);
        if (this.A[i] > 0.45) continue; // never break a line
        this.A[i] = 0;
        this.put(i, "o", (0.3 + 0.35 * pulse) * (0.4 + 0.6 * p[2]) * body);
      }
    }

    // The sphere's body: a density ramp lit from the upper left, filling only empty cells
    // so every line keeps its glyph. Sparse on the dark side, which gives it volume.
    if (r > 4 && body > 0.05) {
      const L = [-0.48, 0.56, 0.68];
      const c0 = Math.max(0, Math.floor((cx - r - this.ox) / this.cw));
      const c1 = Math.min(cols - 1, Math.ceil((cx + r - this.ox) / this.cw));
      const r0 = Math.max(0, Math.floor((cy - r - this.oy) / this.ch));
      const r1 = Math.min(rows - 1, Math.ceil((cy + r - this.oy) / this.ch));
      const top = BODY.length - 1;
      for (let row = r0; row <= r1; row++) {
        for (let col = c0; col <= c1; col++) {
          const i = row * cols + col;
          if (this.A[i] > 0.02) continue;
          const x = (this.ox + (col + 0.5) * this.cw - cx) / r;
          const y = -(this.oy + (row + 0.5) * this.ch - cy) / r;
          const q = 1 - x * x - y * y;
          if (q <= 0.004) continue;
          const lam = Math.max(0, x * L[0] + y * L[1] + Math.sqrt(q) * L[2]);
          const shade = Math.pow(lam, 1.5);
          if (this.rnd[i] > 0.1 + 0.72 * shade) continue;
          const g = BODY[Math.min(top, Math.floor(shade * top + this.rnd[i] * 0.6))];
          this.A[i] = (0.06 + 0.12 * shade) * body;
          this.G[i] = this.glyphIndex.get(g) ?? 0;
        }
      }
    }

    // 4. Pointer energy (hover halo, ripples), decaying back to rest.
    if (!still) {
      const decay = 0.9;
      const E = this.E;
      for (let i = 0; i < n; i++) E[i] *= decay;
      if (this.pointerInside || this.dragging) {
        const moving = time - this.pointerMovedAt < 0.12;
        const amp = moving || this.dragging ? 1 : 0.55;
        const sigma = 30;
        const reach = sigma * 2.6;
        const c0 = Math.max(0, Math.floor((this.px - reach - this.ox) / this.cw));
        const c1 = Math.min(cols - 1, Math.ceil((this.px + reach - this.ox) / this.cw));
        const r0 = Math.max(0, Math.floor((this.py - reach - this.oy) / this.ch));
        const r1 = Math.min(rows - 1, Math.ceil((this.py + reach - this.oy) / this.ch));
        for (let row = r0; row <= r1; row++) {
          for (let col = c0; col <= c1; col++) {
            const dx = this.ox + (col + 0.5) * this.cw - this.px;
            const dy = this.oy + (row + 0.5) * this.ch - this.py;
            const i = row * cols + col;
            const v = amp * Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma)) * this.quietMask[i];
            if (v > E[i]) {
              E[i] = v;
              this.K[i] = 0;
            }
          }
        }
      }
      if (this.ripples.length) {
        const speed = 420;
        const width = 22;
        this.ripples = this.ripples.filter((rp) => time - rp.t0 < 1.4);
        for (const rp of this.ripples) {
          const age = time - rp.t0;
          const rad = age * speed;
          const amp = 0.95 * (1 - age / 1.4);
          const rr0 = Math.max(0, Math.floor((rp.y - rad - width - this.oy) / this.ch));
          const rr1 = Math.min(rows - 1, Math.ceil((rp.y + rad + width - this.oy) / this.ch));
          for (let row = rr0; row <= rr1; row++) {
            const dy = this.oy + (row + 0.5) * this.ch - rp.y;
            for (let col = 0; col < cols; col++) {
              const dx = this.ox + (col + 0.5) * this.cw - rp.x;
              const ring = Math.abs(Math.sqrt(dx * dx + dy * dy) - rad);
              if (ring > width) continue;
              const i = row * cols + col;
              const v = amp * (1 - ring / width) * this.quietMask[i];
              if (v > E[i]) {
                E[i] = v;
                this.K[i] = 1;
              }
            }
          }
        }
      }
    }

    // 5. Intro decode: noise resolves into the mark from the centre out.
    let introP = 1;
    if (!still && this.mode === "intro") introP = clamp((time - this.modeT0) / INTRO_DUR, 0, 1.2);

    // 6. Blit.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const dpr = this.dpr;
    const sw = this.slotW;
    const sh = this.slotH;
    const scrambleBase = this.glyphIndex.get(SCRAMBLE[0]) ?? 0;
    const scrambleIdx = SCRAMBLE.split("").map((c) => this.glyphIndex.get(c) ?? scrambleBase);
    let lastAlpha = -1;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        let a = this.A[i];
        let g = this.G[i];
        let mix = 0;
        let hue = 0;
        const e = still ? 0 : this.E[i];
        if (e > 0.04) {
          // Nearest cells reach the full tint at near-full opacity; the halo decays through the bands to ink.
          if (a > 0.02) {
            a = a + (1 - a) * Math.min(1, e * 1.1);
            if (Math.random() < e * 0.5) g = scrambleIdx[(Math.random() * scrambleIdx.length) | 0];
          } else if (e > 0.14) {
            a = 0.08 + 0.72 * Math.pow(e, 1.25);
            g = Math.random() < e * 0.85 ? scrambleIdx[(Math.random() * scrambleIdx.length) | 0] : this.glyphIndex.get(".") ?? 0;
          }
          mix = smoothstep(0.1, 0.55, e);
          hue = this.K[i] ? RIPPLE_HUE : e >= BAND_PINK ? 0 : e >= BAND_PURPLE ? 1 : 2;
        }
        if (introP < 1.2 && a > 0.02) {
          const th = this.reveal[i];
          if (introP < th - 0.14) continue;
          if (introP < th) {
            g = scrambleIdx[(Math.random() * scrambleIdx.length) | 0];
            a *= 0.55;
          }
        }
        if (a < 0.03) continue;
        const q = Math.round(Math.min(1, a) * 32) / 32;
        if (q !== lastAlpha) {
          ctx.globalAlpha = q;
          lastAlpha = q;
        }
        const m = mix > 0 ? 1 + hue * TINTS.length + Math.min(TINTS.length - 1, Math.floor(mix * TINTS.length)) : 0;
        const dx = Math.round((this.ox + col * this.cw) * dpr + (this.cw * dpr - sw) / 2);
        const dy = Math.round((this.oy + row * this.ch) * dpr + (this.ch * dpr - sh) / 2);
        ctx.drawImage(this.atlas, g * sw, m * sh, sw, sh, dx, dy, sw, sh);
      }
    }
    ctx.globalAlpha = 1;
  }
}
