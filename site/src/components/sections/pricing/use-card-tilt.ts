"use client";

/**
 * useCardTilt: pointer-driven 3D tilt, depth parallax and a light sheen for a plan card.
 *
 *   const ref = useRef<HTMLElement>(null);
 *   useCardTilt(ref);
 *   <article ref={ref}>
 *     <div data-par="10" />            // background layer: drifts against the pointer, flat (2D)
 *     <div data-sheen />               // radial light that follows the pointer (transform only)
 *     <div data-glare />               // diagonal band that slides with the pointer (transform only)
 *     <div data-rim />                 // rim light inside a masked ring: follows the pointer along the edge
 *     <div data-z="36">price</div>     // floats toward the viewer: translateZ + a little parallax
 *   </article>
 *
 * How it works: three springs (pointer x, pointer y, hover amount) run in one requestAnimationFrame
 * loop that only exists while the card is moving. Every frame writes transforms only (the card's
 * rotateX / rotateY and its layers), never layout properties. The loop stops when the springs
 * settle, so an idle card costs nothing. The rect is measured once per pointer enter.
 *
 * Off by default for: touch and pen (only `pointerType === "mouse"` counts), `hover: none`
 * devices, `prefers-reduced-motion: reduce`, and a card that holds keyboard focus
 * (`:focus-visible` inside it). In those cases the card just stays flat.
 *
 * It also keeps `data-live="true"` on the card while it is on screen, so decorative CSS
 * animations (the Pro ring sweep) can pause when the card is off screen.
 */
import { useEffect, type RefObject } from "react";

/** Largest tilt in degrees on either axis. */
const MAX_TILT = 6;
const PERSPECTIVE = 1100;
/** How far the whole card rises toward the viewer (px) and how much it grows, at full hover. */
const LIFT = 6;
const SCALE_UP = 0.01;
/**
 * Spring constants: damping ratio about 0.8 (22 / (2 * sqrt(190))). Hover is not a flick, so the card follows
 * the pointer closely and settles with at most a hair of overshoot (apple-design: damping 0.8 to 1.0).
 */
const STIFFNESS = 190;
const DAMPING = 22;
const REST = 0.0006;

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";

interface Spring {
  v: number;
  x: number;
  target: number;
}

const step = (s: Spring, dt: number) => {
  const a = STIFFNESS * (s.target - s.x) - DAMPING * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
};

const settled = (s: Spring) => Math.abs(s.v) < REST && Math.abs(s.target - s.x) < REST;

export function useCardTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    // Pointer events live on the card's un-rotated wrapper, so the hit area never moves while the card tilts.
    const host = card.parentElement ?? card;

    const parLayers = Array.from(card.querySelectorAll<HTMLElement>("[data-par]")).map((el) => ({
      el,
      depth: Number(el.dataset.par) || 0,
    }));
    const zLayers = Array.from(card.querySelectorAll<HTMLElement>("[data-z]")).map((el) => ({
      el,
      depth: Number(el.dataset.z) || 0,
    }));
    const sheen = card.querySelector<HTMLElement>("[data-sheen]");
    const glare = card.querySelector<HTMLElement>("[data-glare]");
    const rim = card.querySelector<HTMLElement>("[data-rim]");
    let sheenPx = 0;
    let rimPx = 0;

    const nx: Spring = { v: 0, x: 0, target: 0 };
    const ny: Spring = { v: 0, x: 0, target: 0 };
    const hover: Spring = { v: 0, x: 0, target: 0 };

    /** The card's own layout box in viewport px (the host may be taller: side cards have a block margin). */
    let rect: { left: number; top: number; width: number; height: number } | null = null;
    const measure = () => {
      const r = host.getBoundingClientRect();
      // offsetWidth/Height ignore the tilt transform, so a mid-spring measure is still the flat size.
      const top = r.top + (parseFloat(getComputedStyle(card).marginTop) || 0);
      return { left: r.left, top, width: card.offsetWidth, height: card.offsetHeight };
    };
    let raf = 0;
    let last = 0;
    let listening = false;

    const apply = () => {
      // The spring may overshoot below zero while settling. A floating layer must never dip behind the
      // card surface (z < 0), so the hover amount is clamped for everything that depends on depth.
      const h = Math.max(0, hover.x);
      const rx = -ny.x * MAX_TILT;
      const ry = nx.x * MAX_TILT;
      card.style.transform =
        `perspective(${PERSPECTIVE}px) translate3d(0, ${(-LIFT * h).toFixed(2)}px, 0) ` +
        `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) scale(${(1 + SCALE_UP * h).toFixed(4)})`;
      for (const { el, depth } of parLayers) {
        el.style.transform = `translate3d(${(-nx.x * depth).toFixed(2)}px, ${(-ny.x * depth).toFixed(2)}px, 0)`;
      }
      for (const { el, depth } of zLayers) {
        const z = depth * h;
        el.style.transform = `translate3d(${(nx.x * depth * 0.12).toFixed(2)}px, ${(ny.x * depth * 0.12).toFixed(2)}px, ${z.toFixed(2)}px)`;
      }
      if (sheen && rect) {
        const size = sheenPx;
        const x = (nx.x * 0.5 + 0.5) * rect.width - size / 2;
        const y = (ny.x * 0.5 + 0.5) * rect.height - size / 2;
        sheen.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        sheen.style.opacity = String(Math.min(1, h * 1.2).toFixed(3));
      }
      if (glare && rect) {
        const span = rect.width * 1.6;
        glare.style.transform = `translate3d(${((nx.x * 0.5 + 0.5) * span - rect.width * 0.8).toFixed(1)}px, 0, 0) rotate(18deg)`;
        glare.style.opacity = String(Math.min(1, h * 1.2).toFixed(3));
      }
      if (rim && rect) {
        // The rim light sits under the pointer; the ring's mask shows only the 1px edge it touches.
        const x = (nx.x * 0.5 + 0.5) * rect.width - rimPx / 2;
        const y = (ny.x * 0.5 + 0.5) * rect.height - rimPx / 2;
        rim.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        rim.style.opacity = String(Math.min(1, h * 1.2).toFixed(3));
      }
    };

    const clear = () => {
      card.style.transform = "";
      card.style.willChange = "";
      for (const { el } of parLayers) el.style.transform = "";
      for (const { el } of zLayers) el.style.transform = "";
      if (sheen) {
        sheen.style.transform = "";
        sheen.style.opacity = "";
      }
      if (glare) {
        glare.style.transform = "";
        glare.style.opacity = "";
      }
      if (rim) {
        rim.style.transform = "";
        rim.style.opacity = "";
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
      last = now;
      step(nx, dt);
      step(ny, dt);
      step(hover, dt);
      apply();
      if (settled(nx) && settled(ny) && settled(hover) && hover.target === 0) {
        raf = 0;
        clear();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      card.style.willChange = "transform";
      raf = requestAnimationFrame(frame);
    };

    const focused = () => host.matches(":has(:focus-visible)");

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || focused()) return;
      rect = measure();
      sheenPx = sheen ? sheen.offsetWidth : 0;
      rimPx = rim ? rim.offsetWidth : 0;
      hover.target = 1;
      onMove(e);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (focused()) {
        onLeave();
        return;
      }
      if (!rect) rect = measure();
      // The rect is measured while the card is at rest or mid-spring; a stale value only shifts the
      // light by a few px, and it is refreshed on every enter and scroll.
      nx.target = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
      ny.target = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1));
      hover.target = 1;
      wake();
    };

    const onLeave = () => {
      nx.target = 0;
      ny.target = 0;
      hover.target = 0;
      rect = measure();
      wake();
    };

    const onScroll = () => {
      rect = null;
    };

    const enable = () => {
      if (listening) return;
      listening = true;
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    const disable = () => {
      if (!listening) return;
      listening = false;
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      nx.x = ny.x = hover.x = nx.v = ny.v = hover.v = 0;
      nx.target = ny.target = hover.target = 0;
      clear();
    };

    const fine = window.matchMedia(FINE_POINTER);
    const reduced = window.matchMedia(REDUCED);
    const sync = () => (fine.matches && !reduced.matches ? enable() : disable());
    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);

    // Off-screen cards pause their decorative animations (data-live) and drop any running spring.
    const io = new IntersectionObserver(
      ([entry]) => {
        card.dataset.live = entry.isIntersecting ? "true" : "false";
        if (!entry.isIntersecting && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
          nx.x = ny.x = hover.x = nx.v = ny.v = hover.v = 0;
          nx.target = ny.target = hover.target = 0;
          clear();
        }
      },
      { rootMargin: "80px" },
    );
    io.observe(card);

    return () => {
      io.disconnect();
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      disable();
    };
  }, [ref]);
}
