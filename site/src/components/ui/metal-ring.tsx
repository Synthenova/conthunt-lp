"use client";

/**
 * MetalRing: the liquid-metal ring (and optional halo) of the "Get started" buttons, one small WebGL1
 * canvas per button. No dependency; the GLSL and the look notes are in metal-ring-glsl.ts.
 *
 *   <Button …>{label}<MetalRing ringPx={2} radius={14} glow /></Button>
 *
 * Put it last inside the button (which is `relative`): an aria-hidden, pointer-events-none canvas
 * laid over the button's border box, `pad` CSS px larger on every side when the halo needs room. It
 * is out of flow, so the button keeps its size, label, fill, hover, active scale and focus outline,
 * and scales with it. The canvas stays hidden until its first frame is drawn (onGl(true)), so the
 * plain button shows until then, and again whenever WebGL is missing or lost.
 *
 * Same scheduler as liquid-ramp.tsx:
 *   - animates only while on screen (IntersectionObserver, 64px margin) and with the tab visible;
 *   - prefers-reduced-motion: one still frame, repainted on every resize, live if the setting changes;
 *   - ResizeObserver (device-pixel box where supported, so the backing store matches the screen
 *     exactly) + DPR watch, DPR capped at 2, frame rate capped at ~60fps;
 *   - ringPx / radius / glow changes (the hero's unit follows the window) update uniforms, no restart;
 *   - webglcontextlost: stops and hides; webglcontextrestored: rebuilds and resumes;
 *   - unmount releases the WebGL context (WEBGL_lose_context), not just its objects.
 */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { METAL_RING_FRAGMENT, METAL_RING_LOOP, METAL_RING_VERTEX } from "./metal-ring-glsl";

const MAX_DPR = 2;
/** Skip rAF ticks closer than this (ms): ~60fps on 120/144Hz screens. */
const FRAME_MS = 1000 / 60 - 2;
/** Reduced motion paints this one moment (seconds). */
const STATIC_TIME = 3;
/** Canvas margin around the button, CSS px: room for the halo, or for the outer edge's antialiasing. */
const GLOW_PAD = 24;
const EDGE_PAD = 1;

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

/** Ring geometry in CSS px. */
type RingShape = { ringPx: number; radius: number; glow: boolean };

/** One layout pass: the canvas backing store (device px) and its CSS box. */
type RingLayout = { width: number; height: number; cssWidth: number; cssHeight: number };

type Renderer = {
  setGeometry(layout: RingLayout, shape: RingShape): void;
  draw(time: number): void;
  dispose(): void;
};

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  if (process.env.NODE_ENV !== "production") console.warn("[metal-ring]", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

/**
 * Point `t` (0..1, clockwise from the top centre) on a rounded rect's outline, from its centre, y up.
 * hw/hh: half size, r: corner radius (all device px).
 */
function outlinePoint(t: number, hw: number, hh: number, r: number): [number, number] {
  const sx = Math.max(0, hw - r);
  const sy = Math.max(0, hh - r);
  const arc = (Math.PI / 2) * r;
  // Straight edges and corners in order; a corner is [centre x, centre y, start angle].
  const parts: ([number, number, number, number, number] | [number, number, number])[] = [
    [0, hh, 1, 0, sx], // top, rightwards
    [sx, sy, Math.PI / 2],
    [hw, sy, 0, -1, 2 * sy], // right, downwards
    [sx, -sy, 0],
    [sx, -hh, -1, 0, 2 * sx], // bottom, leftwards
    [-sx, -sy, -Math.PI / 2],
    [-hw, -sy, 0, 1, 2 * sy], // left, upwards
    [-sx, sy, Math.PI],
    [-sx, hh, 1, 0, sx], // top, back to the centre
  ];
  const length = 4 * sx + 4 * sy + 4 * arc;
  let rest = (t - Math.floor(t)) * length;
  for (const part of parts) {
    if (part.length === 5) {
      const [x, y, dx, dy, len] = part;
      if (rest <= len) return [x + dx * rest, y + dy * rest];
      rest -= len;
    } else {
      const [cx, cy, a0] = part;
      if (rest <= arc) {
        const a = a0 - (r > 0 ? rest / r : 0);
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      }
      rest -= arc;
    }
  }
  return [0, hh];
}

/** Halo along the outline at `time` (seconds, unwrapped): [position 0..1, strength 0..1]. */
function haloAt(time: number): [number, number] {
  const pos = 0.6 + 0.024 * time + 0.05 * Math.sin(0.41 * time) + 0.02 * Math.sin(1.23 * time + 1.3);
  return [pos - Math.floor(pos), 0.75 + 0.25 * Math.sin(0.83 * time + 0.4)];
}

/** Program, full-canvas triangle and uniforms for one context. */
function createRenderer(gl: WebGLRenderingContext): Renderer | null {
  gl.getExtension("OES_standard_derivatives"); // fwidth() for the stripe edges; the shader degrades without it
  const vs = compile(gl, gl.VERTEX_SHADER, METAL_RING_VERTEX);
  const fs = compile(gl, gl.FRAGMENT_SHADER, METAL_RING_FRAGMENT);
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
    if (process.env.NODE_ENV !== "production") console.warn("[metal-ring]", gl.getProgramInfoLog(program));
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
  const uResolution = u("u_resolution");
  const uHalf = u("u_half");
  const uRadius = u("u_radius");
  const uRing = u("u_ring");
  const uUnit = u("u_unit");
  const uPx = u("u_px");
  const uTime = u("u_time");
  const uGlow = u("u_glow");
  // Halo path (the ring's centre line) and on/off, from the last geometry.
  let path: [number, number, number] = [0, 0, 0];
  let glow = false;

  return {
    setGeometry({ width, height, cssWidth, cssHeight }, { ringPx, radius, glow: withGlow }) {
      const canvas = gl.canvas;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      gl.viewport(0, 0, width, height);
      const pad = withGlow ? GLOW_PAD : EDGE_PAD;
      const sx = width / cssWidth;
      const sy = height / cssHeight;
      const s = (sx + sy) / 2;
      const hw = (Math.max(0, cssWidth - 2 * pad) / 2) * sx;
      const hh = (Math.max(0, cssHeight - 2 * pad) / 2) * sy;
      const r = Math.min(radius * s, hw, hh);
      const ring = Math.max(0.5, ringPx * s);
      gl.uniform2f(uResolution, width, height);
      gl.uniform2f(uHalf, hw, hh);
      gl.uniform1f(uRadius, r);
      gl.uniform1f(uRing, ring);
      gl.uniform1f(uUnit, Math.max(1, 2 * hh));
      gl.uniform1f(uPx, s);
      const inset = ring / 2;
      path = [Math.max(0, hw - inset), Math.max(0, hh - inset), Math.max(0, r - inset)];
      glow = withGlow;
    },
    draw(time) {
      gl.uniform1f(uTime, time % METAL_RING_LOOP);
      if (glow) {
        const [at, strength] = haloAt(time);
        const [x, y] = outlinePoint(at, ...path);
        gl.uniform3f(uGlow, x, y, strength);
      } else {
        gl.uniform3f(uGlow, 0, 0, 0);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}

type RingOptions = {
  canvas: HTMLCanvasElement;
  /** Read on every layout: the current ring geometry. */
  shape: () => RingShape;
  /** true once a frame is on the canvas; false when WebGL is missing or lost. */
  onGl: (on: boolean) => void;
};

type RingControl = {
  /** Re-read `shape` and repaint (call after it changes). */
  update(): void;
  /** Paint the current frame again (after the canvas is shown). */
  repaint(): void;
  stop(): void;
};

/**
 * Give the context back once its canvas has really left the document (Chrome keeps only 16 live).
 * The check runs after the commit, so StrictMode's simulated unmount, which keeps and reuses the same
 * canvas, is left alone.
 */
function releaseContext(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
  queueMicrotask(() => {
    if (!canvas.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
  });
}

/** Start the renderer + scheduler on a canvas. */
function startMetalRing({ canvas, shape, onGl }: RingOptions): RingControl {
  const gl = canvas.getContext("webgl", CONTEXT_ATTRS) as WebGLRenderingContext | null;
  let renderer = gl ? createRenderer(gl) : null;
  if (!gl || !renderer) {
    onGl(false);
    return {
      update: () => {},
      repaint: () => {},
      stop: () => {
        renderer?.dispose();
        if (gl) releaseContext(canvas, gl);
      },
    };
  }

  const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
  const t0 = performance.now();
  // Last observed canvas box: CSS px (fractional) and, where the browser reports it, device px.
  let box: { css: [number, number]; device: [number, number] | null } | null = null;
  let inView = false;
  let laidOut = false;
  let lost = false;
  let disposed = false;
  let raf = 0;
  let last = 0;

  const clock = () => (reduced.matches ? STATIC_TIME : (performance.now() - t0) / 1000);
  const paint = () => renderer?.draw(clock());
  const running = () => laidOut && !lost && !disposed && inView && !document.hidden && !reduced.matches;
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
  const relayout = () => {
    if (!box || !renderer || lost || disposed) return;
    const [cssWidth, cssHeight] = box.css;
    if (!cssWidth || !cssHeight) return;
    const dpr = window.devicePixelRatio || 1;
    const cap = Math.min(dpr, MAX_DPR);
    const scaled: [number, number] = [Math.max(1, Math.round(cssWidth * cap)), Math.max(1, Math.round(cssHeight * cap))];
    // The device box is exact (no resampling), but only usable uncapped and when it agrees with
    // CSS px x DPR (DevTools' DPR emulation reports it in CSS px).
    const device = box.device;
    const exact = device && dpr <= MAX_DPR && Math.abs(device[0] - scaled[0]) < 2 && Math.abs(device[1] - scaled[1]) < 2;
    const [width, height] = exact ? device : scaled;
    renderer.setGeometry({ width, height, cssWidth, cssHeight }, shape());
    laidOut = true;
    paint();
    onGl(true);
    update();
  };
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
    if (box) box.device = null; // stale until the observer reports the new device box
    relayout();
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
    renderer = createRenderer(gl);
    relayout();
  };

  // Fires once on observe: the first layout.
  const ro = new ResizeObserver(([entry]) => {
    const css = entry.contentBoxSize?.[0];
    const device = entry.devicePixelContentBoxSize?.[0];
    box = {
      css: css ? [css.inlineSize, css.blockSize] : [entry.contentRect.width, entry.contentRect.height],
      device: device ? [device.inlineSize, device.blockSize] : null,
    };
    relayout();
  });
  try {
    ro.observe(canvas, { box: "device-pixel-content-box" });
  } catch {
    ro.observe(canvas); // Safari: CSS px x DPR
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      update();
    },
    { rootMargin: "64px" },
  );
  io.observe(canvas);
  document.addEventListener("visibilitychange", update);
  reduced.addEventListener("change", onReduced);
  watchDpr();
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

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
    renderer?.dispose();
    renderer = null;
    releaseContext(canvas, gl);
  };
  const repaint = () => {
    if (laidOut && !lost && !disposed) paint();
  };
  return { update: relayout, repaint, stop };
}

/* ------------------------------------------------------------- component */

export type MetalRingProps = {
  /** Ring thickness, CSS px. */
  ringPx: number;
  /** Outer corner radius, CSS px (the button's own border-radius). */
  radius: number;
  /** The halo travelling along the ring. */
  glow: boolean;
  /** Called with true once the ring is on screen, false when WebGL is missing or lost. */
  onGl?: (on: boolean) => void;
  className?: string;
};

export function MetalRing({ ringPx, radius, glow, onGl, className }: MetalRingProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(false);
  const shapeRef = useRef<RingShape>({ ringPx, radius, glow });
  const controlRef = useRef<RingControl | null>(null);
  const onGlRef = useRef(onGl);
  const pad = glow ? GLOW_PAD : EDGE_PAD;

  useEffect(() => {
    onGlRef.current = onGl;
  }, [onGl]);

  useEffect(() => {
    shapeRef.current = { ringPx, radius, glow };
    controlRef.current?.update();
  }, [ringPx, radius, glow]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const control = startMetalRing({
      canvas,
      shape: () => shapeRef.current,
      onGl: (next) => {
        setOn(next);
        onGlRef.current?.(next);
      },
    });
    controlRef.current = control;
    return () => {
      control.stop();
      controlRef.current = null;
    };
  }, []);

  // The first frame was drawn while the canvas was hidden; draw it again now that it shows (it is
  // the only frame under reduced motion).
  useEffect(() => {
    if (on) controlRef.current?.repaint();
  }, [on]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute block select-none", className)}
      style={{
        left: -pad,
        top: -pad,
        width: `calc(100% + ${2 * pad}px)`,
        height: `calc(100% + ${2 * pad}px)`,
        visibility: on ? "visible" : "hidden",
      }}
    />
  );
}
