"use client";

/**
 * Liquid ramp (hero rev 14): the owner's Pencil `liquid-ramp.glsl` effect, ported to one small WebGL1
 * core with two faces. No dependency; the GLSL and the port notes are in liquid-ramp-glsl.ts.
 *
 *   <LiquidRampFill params={DEEP_SEARCH_CHIP} />
 *     A canvas that covers its parent (absolute inset-0). The parent positions and clips it
 *     (`relative overflow-hidden rounded-…`). Cover = 1 everywhere.
 *
 *   <LiquidRampText params={VIRAL} className="font-swash …">viral</LiquidRampText>
 *     An inline-block word. The real DOM text stays for layout, selection, SEO and screen readers,
 *     with transparent ink; an aria-hidden canvas laid over it paints the shader through the glyphs.
 *     The mask is the word drawn into a 2D canvas with the DOM node's computed font (family from
 *     next/font, size, weight, style, letter-spacing) at the canvas DPR, after document.fonts.load.
 *     The canvas grows past the text box to the glyphs' ink bounds, so swash overhangs never clip,
 *     while the pattern stays normalised on the text box (= Pencil's u_resolution for the node).
 *     The mask is redrawn on resize, DPR change and font load only, never per frame.
 *
 * Shared behaviour:
 *   - animates only while on screen (IntersectionObserver, 64px margin) and with the tab visible;
 *   - prefers-reduced-motion: one static frame (t = 0), live if the setting changes;
 *   - ResizeObserver + DPR watch, DPR capped at 2, frame rate capped at ~60fps;
 *   - webglcontextlost: stops and shows the fallback; webglcontextrestored: rebuilds and resumes;
 *   - unmount releases the WebGL context (WEBGL_lose_context), not just its objects;
 *   - `paused` (optional): holds the current frame, and the clock, until it is false again (the hero's
 *     pause control, WCAG 2.2.2);
 *   - no WebGL: the fill shows `params.fallback` (a static gradient) as its background, the text a
 *     static gradient through `background-clip: text`. Both are also the SSR / first-paint look.
 *
 * Presets (SPEC section 6, the owner's Pencil uniforms): VIRAL, DEEP_SEARCH_CHIP. u_bevel = 0 in
 * both, so Pencil's depth uniform has no effect and is not a param.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { LIQUID_RAMP_FRAGMENT, LIQUID_RAMP_VERTEX } from "./liquid-ramp-glsl";

/** The shader's uniforms (Pencil labels in brackets) plus the no-WebGL look. */
export type LiquidRampParams = {
  /** [Ramp Loop] < 0.5: ping-pong fold over 5 ramp steps; >= 0.5: sawtooth over 6 (wraps to c0). */
  rampLoop: number;
  /** [Seed] offsets the noise field. */
  seed: number;
  /** [Bands] colour bands across the field. */
  bands: number;
  /** [Waves] noise frequency. */
  waves: number;
  /** [Warp] domain-warp strength. */
  warp: number;
  /** [Flow] how far the field drifts over one loop. */
  flow: number;
  /** [Loop] seconds per animation cycle. */
  loop: number;
  /** [Color 1..6] sRGB hex, #RRGGBB. */
  colors: readonly [string, string, string, string, string, string];
  /** CSS background-image used without WebGL (and before the first frame). */
  fallback: string;
};

/** "viral" in the hero H1 (Pencil's effect on the Bilbo Swash Caps word). */
export const VIRAL = {
  rampLoop: 0.19,
  seed: 2.7,
  bands: 4,
  waves: 0.3,
  warp: 0,
  flow: 2.65,
  loop: 10.5,
  colors: ["#FF0000", "#FF0AAD", "#990AFF", "#330AFF", "#0A91FF", "#0A91FF"],
  fallback: "linear-gradient(100deg, #0A91FF 0%, #330AFF 30%, #990AFF 50%, #FF0AAD 72%, #FF0000 100%)",
} as const satisfies LiquidRampParams;

/** The icon-only Deep Search chip in the hero prompt box. */
export const DEEP_SEARCH_CHIP = {
  rampLoop: 0.26,
  seed: 2.7,
  bands: 0.3,
  waves: 0.414,
  warp: 1.325,
  flow: 5,
  loop: 14.16,
  colors: ["#5E0A0A", "#660000", "#E00000", "#C94D4D", "#A10030", "#F05656"],
  fallback: "linear-gradient(135deg, #E00000 0%, #C94D4D 45%, #A10030 75%, #660000 100%)",
} as const satisfies LiquidRampParams;

const MAX_DPR = 2;
/** Skip rAF ticks closer than this (ms): ~60fps on 120/144Hz screens. */
const FRAME_MS = 1000 / 60 - 2;
/** Reduced motion paints this one frame (seconds into the loop). */
const STATIC_TIME = 0;
/** Mask padding around the glyph ink bounds, CSS px (antialiasing). */
const INK_PAD = 2;
/** Fallback-gradient padding around the DOM word (em), so `background-clip: text` covers the swashes. */
const FALLBACK_PAD = { x: 0.2, y: 0.35 };

const CONTEXT_ATTRS: WebGLContextAttributes = {
  alpha: true,
  premultipliedAlpha: true,
  antialias: false,
  depth: false,
  stencil: false,
  preserveDrawingBuffer: false,
  powerPreference: "low-power",
};

/* ------------------------------------------------------------------ core */

/** One layout pass, in canvas (device) px. box/origin default to the whole canvas. */
type RampLayout = {
  width: number;
  height: number;
  box?: readonly [number, number];
  origin?: readonly [number, number];
  /** Cover mask (alpha); null = cover 1 everywhere. */
  mask?: TexImageSource | null;
};

type Renderer = {
  setLayout(layout: RampLayout): void;
  draw(time: number): void;
  dispose(): void;
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1, 7), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  if (process.env.NODE_ENV !== "production") console.warn("[liquid-ramp]", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

/** Program, full-screen triangle, uniforms and the (lazy) cover texture for one context. */
function createRenderer(gl: WebGLRenderingContext, params: LiquidRampParams): Renderer | null {
  const vs = compile(gl, gl.VERTEX_SHADER, LIQUID_RAMP_VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, LIQUID_RAMP_FRAGMENT);
  const program = gl.createProgram();
  const fail = () => {
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  };
  if (!vs || !fs || !program) return fail();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== "production") console.warn("[liquid-ramp]", gl.getProgramInfoLog(program));
    return fail();
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  gl.uniform1f(u("u_rampLoop"), params.rampLoop);
  gl.uniform1f(u("u_seed"), params.seed);
  gl.uniform1f(u("u_bands"), params.bands);
  gl.uniform1f(u("u_waves"), params.waves);
  gl.uniform1f(u("u_warp"), params.warp);
  gl.uniform1f(u("u_flow"), params.flow);
  gl.uniform1f(u("u_loop"), params.loop);
  params.colors.forEach((hex, i) => gl.uniform3fv(u(`u_c${i}`), hexToRgb(hex)));
  gl.uniform1i(u("u_content"), 0);
  gl.uniform1f(u("u_useCover"), 0);

  const uResolution = u("u_resolution");
  const uBox = u("u_box");
  const uOrigin = u("u_boxOrigin");
  const uUseCover = u("u_useCover");
  const uTime = u("u_time");
  let texture: WebGLTexture | null = null;

  return {
    setLayout({ width, height, box = [width, height], origin = [0, 0], mask = null }) {
      const canvas = gl.canvas;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResolution, width, height);
      gl.uniform2f(uBox, box[0], box[1]);
      gl.uniform2f(uOrigin, origin[0], origin[1]);
      if (mask) {
        if (!texture) {
          texture = gl.createTexture();
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        // Row 0 = canvas bottom, like gl_FragCoord. Only alpha is read, so no premultiply.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      }
      gl.uniform1f(uUseCover, mask ? 1 : 0);
    },
    draw(time) {
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

type RampOptions = {
  canvas: HTMLCanvasElement;
  /** Resize + visibility target. */
  observe: Element;
  params: LiquidRampParams;
  /**
   * Size the canvas (and build the mask) for a DPR; null = not measurable yet. An async layout
   * checks `current()` after its awaits and before it touches the DOM: false means a newer pass
   * (or stop) superseded it, and it must return null without side effects.
   */
  layout: (dpr: number, current: () => boolean) => RampLayout | null | Promise<RampLayout | null>;
  /** true once a frame is on the canvas; false when WebGL is missing or lost. */
  onGl: (on: boolean) => void;
  /** Re-layout when a web font finishes loading (the text mask). */
  watchFonts?: boolean;
  /** Read on start and on every sync(): true holds the frame and the clock. */
  paused?: () => boolean;
};

type RampControl = {
  /** Re-read `paused` (call after it changes). */
  sync(): void;
  stop(): void;
};

/**
 * Give the context back once its canvas has really left the document. Deleting the GL objects does
 * not free the context itself, and Chrome keeps only 16 live: each client-side return to Home would
 * add two, until the oldest (a "Get started" ring's, metal-ring.tsx) is evicted. The check runs after the
 * commit, so StrictMode's simulated unmount, which keeps and reuses the same canvas, is left alone.
 */
function releaseContext(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
  queueMicrotask(() => {
    if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
  });
}

/** Start the renderer + scheduler on a canvas. */
function startLiquidRamp({ canvas, observe, params, layout, onGl, watchFonts, paused }: RampOptions): RampControl {
  const gl = canvas.getContext("webgl", CONTEXT_ATTRS) as WebGLRenderingContext | null;
  let renderer = gl ? createRenderer(gl, params) : null;
  if (!gl || !renderer) {
    onGl(false);
    return {
      sync: () => {},
      stop: () => {
        renderer?.dispose();
        if (gl) releaseContext(canvas, gl);
      },
    };
  }

  const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
  const t0 = performance.now();
  let inView = false;
  let laidOut = false;
  let lost = false;
  let disposed = false;
  let raf = 0;
  let last = 0;
  let pass = 0;
  // Pause hold: the clock stops at heldAt and resumes where it stopped (heldMs is the time spent held).
  let heldAt = 0;
  let heldMs = 0;

  const elapsed = () => (heldAt || performance.now()) - heldMs - t0;
  const clock = () => (reduced.matches ? STATIC_TIME : (elapsed() / 1000) % params.loop);
  const paint = () => renderer?.draw(clock());
  const running = () => laidOut && !lost && inView && !document.hidden && !reduced.matches && !heldAt;
  const frame = (ts: number) => {
    // Re-checked every tick: a cancel from an event dispatched in the same frame can miss the queued callback.
    if (!running()) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
    if (ts - last < FRAME_MS) return;
    last = ts;
    paint();
  };
  const update = () => {
    const run = running();
    if (run && !raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  const relayout = async () => {
    const id = ++pass;
    const current = () => id === pass && !disposed && !lost;
    const next = await layout(Math.min(window.devicePixelRatio || 1, MAX_DPR), current);
    if (!current() || !renderer || !next) return;
    renderer.setLayout(next);
    laidOut = true;
    paint();
    onGl(true);
    update();
  };
  const onRelayout = () => void relayout();
  const sync = () => {
    const hold = paused?.() ?? false;
    if (hold && !heldAt) heldAt = performance.now();
    else if (!hold && heldAt) {
      heldMs += performance.now() - heldAt;
      heldAt = 0;
    }
    update();
  };
  sync();
  const onReduced = () => {
    paint();
    update();
  };

  // DPR changes (zoom, moving the window to another screen) do not always resize the element.
  let dprQuery: MediaQueryList | null = null;
  const watchDpr = () => {
    dprQuery?.removeEventListener("change", onDpr);
    dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    dprQuery.addEventListener("change", onDpr);
  };
  function onDpr() {
    watchDpr();
    onRelayout();
  }

  const onLost = (e: Event) => {
    e.preventDefault(); // allows webglcontextrestored
    lost = true;
    laidOut = false;
    renderer = null; // its GL objects died with the context
    update();
    onGl(false);
  };
  const onRestored = () => {
    lost = false;
    renderer = createRenderer(gl, params);
    if (renderer) onRelayout();
  };

  const ro = new ResizeObserver(onRelayout); // fires once on observe: the first layout
  ro.observe(observe);
  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      update();
    },
    { rootMargin: "64px" },
  );
  io.observe(observe);
  document.addEventListener("visibilitychange", update);
  reduced.addEventListener("change", onReduced);
  watchDpr();
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);
  if (watchFonts) document.fonts.addEventListener("loadingdone", onRelayout);

  const stop = () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", update);
    reduced.removeEventListener("change", onReduced);
    dprQuery?.removeEventListener("change", onDpr);
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", onRestored);
    if (watchFonts) document.fonts.removeEventListener("loadingdone", onRelayout);
    renderer?.dispose();
    renderer = null;
    releaseContext(canvas, gl);
  };
  return { sync, stop };
}

/** Starts the ramp from an effect and keeps `paused` live without restarting it. */
function usePausedSync(paused: boolean) {
  const pausedRef = useRef(paused);
  const controlRef = useRef<RampControl | null>(null);
  useEffect(() => {
    pausedRef.current = paused;
    controlRef.current?.sync();
  }, [paused]);
  return { pausedRef, controlRef };
}

/* ------------------------------------------------------------------ fill */

export type LiquidRampFillProps = {
  /** Default DEEP_SEARCH_CHIP. */
  params?: LiquidRampParams;
  className?: string;
  style?: CSSProperties;
  /** Hold the current frame (the hero's pause control). */
  paused?: boolean;
};

/**
 * Shader fill for a rounded chip or panel: an aria-hidden canvas at absolute inset-0. Put it first
 * inside a `relative overflow-hidden rounded-…` parent and the content above it (relative / z-index).
 */
export function LiquidRampFill({ params = DEEP_SEARCH_CHIP, className, style, paused = false }: LiquidRampFillProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const paramsKey = JSON.stringify(params);
  const { pausedRef, controlRef } = usePausedSync(paused);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const control = startLiquidRamp({
      canvas,
      observe: canvas,
      params: JSON.parse(paramsKey) as LiquidRampParams,
      layout: (dpr) => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        return w && h ? { width: Math.max(1, Math.round(w * dpr)), height: Math.max(1, Math.round(h * dpr)) } : null;
      },
      onGl: () => {},
      paused: () => pausedRef.current,
    });
    controlRef.current = control;
    return () => {
      control.stop();
      controlRef.current = null;
    };
  }, [paramsKey, pausedRef, controlRef]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 block size-full", className)}
      style={{ backgroundImage: params.fallback, ...style }}
    />
  );
}

/* ------------------------------------------------------------------ text */

export type LiquidRampTextProps = {
  /** The word. One line (white-space: nowrap). */
  children: string;
  /** Default VIRAL. */
  params?: LiquidRampParams;
  /** Wrapper classes: font family, size, letter-spacing, line-height, alignment. */
  className?: string;
  style?: CSSProperties;
  /** Hold the current frame (the hero's pause control). */
  paused?: boolean;
};

type TextNodes = {
  wrap: HTMLSpanElement;
  ink: HTMLSpanElement;
  probe: HTMLSpanElement;
  canvas: HTMLCanvasElement;
  mask: HTMLCanvasElement;
};

function setMaskFont(ctx: CanvasRenderingContext2D, font: string, spacing: number): boolean {
  ctx.font = font;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#fff";
  if (!("letterSpacing" in ctx)) return false;
  ctx.letterSpacing = `${spacing}px`;
  return true;
}

/**
 * Measure the DOM word, size + place the canvas over its ink bounds and draw the mask. Everything
 * after the font wait is synchronous and runs only while the pass is `current`, so a superseded pass
 * (say, a DPR change during the font load) never leaves the canvas box out of step with the texture.
 */
async function layoutTextMask(
  dpr: number,
  current: () => boolean,
  text: string,
  { wrap, ink, probe, canvas, mask }: TextNodes,
): Promise<RampLayout | null> {
  const font = (cs: CSSStyleDeclaration) => `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  try {
    await document.fonts.load(font(getComputedStyle(ink)), text);
  } catch {
    // Draw with whichever face is available; loadingdone re-runs this when the real one lands.
  }
  if (!current()) return null;
  const cs = getComputedStyle(ink);
  const boxW = wrap.clientWidth;
  const boxH = wrap.clientHeight;
  const ctx = mask.getContext("2d");
  if (!boxW || !boxH || !ctx) return null;

  const spacing = parseFloat(cs.letterSpacing) || 0; // "normal" → 0
  // Text origin in the wrapper (CSS px): the ink span's content-box left, and the baseline, read
  // from a 0x0 inline-block probe whose bottom edge sits on the baseline.
  const x = ink.offsetLeft + (parseFloat(cs.paddingLeft) || 0);
  const y = probe.offsetTop + probe.offsetHeight;

  const native = setMaskFont(ctx, font(cs), spacing);
  const m = ctx.measureText(text);
  const advance = native ? m.width : [...text].reduce((sum, ch) => sum + ctx.measureText(ch).width + spacing, 0);
  const x0 = Math.floor(Math.min(0, x - m.actualBoundingBoxLeft) - INK_PAD);
  const y0 = Math.floor(Math.min(0, y - m.actualBoundingBoxAscent) - INK_PAD);
  const x1 = Math.ceil(Math.max(boxW, x + Math.max(m.actualBoundingBoxRight, advance)) + INK_PAD);
  const y1 = Math.ceil(Math.max(boxH, y + m.actualBoundingBoxDescent) + INK_PAD);
  const cssW = x1 - x0;
  const cssH = y1 - y0;
  const width = Math.max(1, Math.round(cssW * dpr));
  const height = Math.max(1, Math.round(cssH * dpr));
  const sx = width / cssW;
  const sy = height / cssH;

  Object.assign(canvas.style, { left: `${x0}px`, top: `${y0}px`, width: `${cssW}px`, height: `${cssH}px` });

  mask.width = width; // resets the 2D state
  mask.height = height;
  setMaskFont(ctx, font(cs), spacing);
  ctx.setTransform(sx, 0, 0, sy, -x0 * sx, -y0 * sy);
  if (native) {
    ctx.fillText(text, x, y);
  } else {
    let cx = x;
    for (const ch of text) {
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + spacing;
    }
  }

  return {
    width,
    height,
    box: [boxW * sx, boxH * sy],
    origin: [-x0 * sx, (y1 - boxH) * sy], // box bottom-left, from the canvas bottom
    mask,
  };
}

/**
 * A word painted by the shader. Renders an inline-block span (position: relative) whose box is the
 * word's own line box, so it slots into a heading like any inline word; the canvas overhangs it
 * without affecting layout. `data-liquid-ramp="gl" | "fallback"` tells which look is on screen.
 */
export function LiquidRampText({ children, params = VIRAL, className, style, paused = false }: LiquidRampTextProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gl, setGl] = useState(false);
  const paramsKey = JSON.stringify(params);
  const { pausedRef, controlRef } = usePausedSync(paused);

  useEffect(() => {
    const wrap = wrapRef.current;
    const ink = inkRef.current;
    const probe = probeRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !ink || !probe || !canvas) return;
    const nodes: TextNodes = { wrap, ink, probe, canvas, mask: document.createElement("canvas") };
    const control = startLiquidRamp({
      canvas,
      observe: wrap,
      params: JSON.parse(paramsKey) as LiquidRampParams,
      layout: (dpr, current) => layoutTextMask(dpr, current, children, nodes),
      onGl: setGl,
      watchFonts: true,
      paused: () => pausedRef.current,
    });
    controlRef.current = control;
    return () => {
      control.stop();
      controlRef.current = null;
    };
  }, [children, paramsKey, pausedRef, controlRef]);

  // Inline padding + equal negative margin: layout-neutral, but it widens the background area so the
  // fallback gradient reaches the swash overhangs.
  const inkStyle: CSSProperties = {
    color: "transparent",
    padding: `${FALLBACK_PAD.y}em ${FALLBACK_PAD.x}em`,
    margin: `0 -${FALLBACK_PAD.x}em`,
    ...(gl ? null : { backgroundImage: params.fallback, WebkitBackgroundClip: "text", backgroundClip: "text" }),
  };

  return (
    <span
      ref={wrapRef}
      data-liquid-ramp={gl ? "gl" : "fallback"}
      className={cn("relative inline-block whitespace-nowrap", className)}
      style={style}
    >
      <span ref={inkRef} style={inkStyle}>
        {children}
        <span ref={probeRef} aria-hidden className="inline-block h-0 w-0 align-baseline" />
      </span>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute block select-none"
        style={{ visibility: gl ? "visible" : "hidden" }}
      />
    </span>
  );
}
