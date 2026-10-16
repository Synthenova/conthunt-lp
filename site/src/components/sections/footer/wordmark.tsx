"use client";

/**
 * Wordmark — the footer's brand moment: the real ContHunt wordmark
 * (public/brand/wordmark-ink.png, never redrawn) at full width, with four
 * stacked, offset, blurred copies tinted in the sunset cascade (yellow, pink,
 * purple, pale blue; docs/revamp/COLOR_SYSTEM.md, Footer) cascading down behind it, like the
 * CebbF layered glow. Each copy is a div masked by the same mark: a lossless WebP of the PNG
 * (public/brand/wordmark-ink-mask.webp, identical alpha, 11 KB instead of 28 KB; every page
 * fetches it at load).
 *
 * One line at every width: the whole PNG spans the footer's content box (aspect ratio fixed, so
 * it scales with the viewport and never wraps or overflows), and the cascade offsets are a
 * share of the mark's height while the blur scales in vw, so the steps keep their proportions
 * from 320px to 2560px. (Phones used a CONT / HUNT stack before the verifier asked for one line.)
 *
 * Motion (all transform / opacity / clip-path):
 *  - Entrance, once, when the wordmark scrolls into view: the ink rises through
 *    a clip, and the color layers fan out downward from behind it.
 *  - Fine pointer: the layers follow the cursor (±12px at the deepest layer,
 *    each with its own lag via gsap.quickTo) and settle after 1.4s idle or when
 *    the pointer leaves the footer. A hairline crosshair tracks the cursor over
 *    the wordmark with a small coordinate label; over the crosshair "O" it
 *    reads LOCKED and a ring closes in. (The mark itself is a reticle.)
 *  - Coarse pointer (touch): a slow, offscreen-paused sideways drift instead.
 *  - Reduced motion: completely static, final state.
 */
import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { EASE, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { onceInView } from "@/lib/media";
import { MOTION_OK } from "@/lib/motion";

/** Wordmark PNG intrinsic size. */
const W = 2208;
const H = 358;
/** Where the crosshair "O" sits inside the PNG (fractions of width / height). */
const O_CENTER = { x: 0.2075, y: 0.5 };

interface Layer {
  /** CSS color, mixed toward white so the cascade stays soft. */
  color: string;
  /** Blur radius, vw (floor applies). */
  blur: number;
  /** Vertical offset as a percentage of the wordmark height. */
  top: number;
  /** Layer opacity. */
  alpha: number;
  /** Pointer parallax amplitude, px. */
  amp: number;
}

const LAYERS: readonly Layer[] = [
  { color: "color-mix(in oklab, var(--yellow) 80%, white)", blur: 0.2, top: 5.5, alpha: 0.95, amp: 4 },
  { color: "color-mix(in oklab, var(--pink) 58%, white)", blur: 0.26, top: 12, alpha: 0.92, amp: 6.5 },
  { color: "color-mix(in oklab, var(--purple) 60%, white)", blur: 0.6, top: 20, alpha: 0.88, amp: 9 },
  { color: "color-mix(in oklab, var(--blue) 34%, white)", blur: 1.5, top: 30, alpha: 0.85, amp: 12 },
];

/**
 * Edge feather of the white face: half the feather of the nearest color layer
 * (gold: blur max(2px, 0.2vw)), so the face sits in the same soft focus as its shadows.
 */
const FACE_FEATHER = { vw: LAYERS[0].blur / 2 };

/** Blur sizing per layout. `vw` multiplies the layer's blur; `floor` is the minimum in px. */
interface Scale {
  vw: number;
  floor: number;
  faceFloor: number;
}
/** Letters are as large as the viewport allows at full width. */
const LINE_SCALE: Scale = { vw: 1, floor: 2, faceFloor: 1 };

/** Mask of the whole PNG (the line). */
const MASK_FULL: CSSProperties = {
  WebkitMaskImage: "url(/brand/wordmark-ink-mask.webp)",
  maskImage: "url(/brand/wordmark-ink-mask.webp)",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
};

const FINE_POINTER = `${MOTION_OK} and (hover: hover) and (pointer: fine)`;
const COARSE_POINTER = `${MOTION_OK} and (pointer: coarse)`;

/**
 * Face of the mark, drawn above the color cascade:
 *  - "white": the PNG used as a mask over a paper-white fill (owner's pick to try).
 *  - "ink":   the original black PNG.
 *  - "none":  no face; the gold layer reads as the letters (the look the owner liked).
 */
export type WordmarkFace = "white" | "ink" | "none";

/** The four stacked color layers, behind the face. `rowDelay` shifts the whole cascade for the second stack row. */
function Cascade({ mask, scale, rowDelay = 0 }: { mask: CSSProperties; scale: Scale; rowDelay?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 isolate z-0">
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          data-layer
          data-layer-index={i}
          data-delay={rowDelay + i * 0.12}
          className="absolute inset-x-0 h-full will-change-transform"
          style={{ top: `${layer.top}%`, opacity: layer.alpha, zIndex: LAYERS.length - i }}
        >
          {/* parallax (gsap x/y) > blur > mask: CSS applies filter before mask, so the blur must sit above the masked element. */}
          <div data-layer-inner data-layer-index={i} className="absolute inset-0 will-change-transform">
            <div className="absolute inset-0" style={{ filter: `blur(max(${scale.floor}px, ${(layer.blur * scale.vw).toFixed(3)}vw))` }}>
              <div className="absolute inset-0" style={{ ...mask, backgroundColor: layer.color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Wordmark({ className, face = "white" }: { className?: string; face?: WordmarkFace }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      // The crosshair needs a fine pointer; touch devices get the slow drift below.
      const box = root.querySelector<HTMLElement>("[data-line] [data-box]");
      const inks = gsap.utils.toArray<HTMLElement>("[data-ink]", root);
      const outers = gsap.utils.toArray<HTMLElement>("[data-layer]", root);
      const inners = gsap.utils.toArray<HTMLElement>("[data-layer-inner]", root);
      if (!box || !inks.length) return;
      const ampOf = (el: HTMLElement) => LAYERS[Number(el.dataset.layerIndex)].amp;
      const mm = gsap.matchMedia();

      // Entrance (any pointer, motion allowed). Started by an IntersectionObserver at
      // ~88% of the viewport, not a ScrollTrigger: the footer sits below the pinned scene
      // and async-height sections, and a stale trigger start could leave the wordmark
      // hidden at the bottom of the page. Both layouts are tweened; the one hidden by CSS
      // (display: none) simply plays unseen.
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ paused: true });
        inks.forEach((ink) => {
          tl.from(ink, { clipPath: "inset(100% 0 0 0)", duration: 1, ease: EASE.out, clearProps: "clipPath" }, Number(ink.dataset.delay ?? 0));
        });
        outers.forEach((outer) => {
          const layer = LAYERS[Number(outer.dataset.layerIndex)];
          const boxH = outer.closest<HTMLElement>("[data-box]")?.offsetHeight ?? 0;
          tl.from(outer, { y: -(boxH * layer.top) / 100, opacity: 0, duration: 1.25, ease: EASE.out }, 0.15 + Number(outer.dataset.delay ?? 0));
        });
        return onceInView(root, () => tl.play(), { rootMargin: "0px 0px -12% 0px" });
      });

      // Fine pointer: parallax + crosshair.
      mm.add(FINE_POINTER, () => {
        const footer = root.closest("footer") ?? root;
        const reticle = root.querySelector<HTMLElement>("[data-reticle]");
        const vLine = root.querySelector<HTMLElement>("[data-v]");
        const hLine = root.querySelector<HTMLElement>("[data-h]");
        const tag = root.querySelector<HTMLElement>("[data-tag]");
        const ring = root.querySelector<HTMLElement>("[data-ring]");

        const lag = (el: HTMLElement) => 0.9 + Number(el.dataset.layerIndex) * 0.16;
        const xTo = inners.map((el) => gsap.quickTo(el, "x", { duration: lag(el), ease: "power3.out" }));
        const yTo = inners.map((el) => gsap.quickTo(el, "y", { duration: lag(el), ease: "power3.out" }));

        const rx = [vLine, tag, ring].map((el) => (el ? gsap.quickTo(el, "x", { duration: 0.28, ease: "power3.out" }) : null));
        const ry = [hLine, tag, ring].map((el) => (el ? gsap.quickTo(el, "y", { duration: 0.28, ease: "power3.out" }) : null));

        if (ring) gsap.set(ring, { scale: 1.9, opacity: 0 });

        let idle = 0;
        let visible = false;
        let locked = false;
        let lastLabel = "";

        const settle = () => {
          inners.forEach((_, i) => {
            xTo[i](0);
            yTo[i](0);
          });
        };

        const showReticle = (on: boolean) => {
          if (!reticle || visible === on) return;
          visible = on;
          gsap.to(reticle, { opacity: on ? 1 : 0, duration: 0.25, ease: "power2.out", overwrite: "auto" });
          if (!on) setLocked(false);
        };

        function setLocked(on: boolean) {
          if (locked === on) return;
          locked = on;
          if (ring) gsap.to(ring, { scale: on ? 1 : 1.9, opacity: on ? 1 : 0, duration: 0.35, ease: EASE.out, overwrite: "auto" });
        }

        const onMove = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          inners.forEach((el, i) => {
            xTo[i](nx * ampOf(el));
            yTo[i](ny * ampOf(el) * 0.6);
          });
          window.clearTimeout(idle);
          idle = window.setTimeout(settle, 1400);

          // Crosshair over the wordmark box.
          const r = box.getBoundingClientRect();
          const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 24 && e.clientY <= r.bottom + 24;
          showReticle(inside);
          if (!inside) return;
          const px = e.clientX - r.left;
          const py = e.clientY - r.top;
          rx.forEach((to) => to?.(px));
          ry.forEach((to) => to?.(py));
          const dist = Math.hypot(px - O_CENTER.x * r.width, py - O_CENTER.y * r.height);
          const isLocked = dist < r.height * 0.5;
          setLocked(isLocked);
          if (tag) {
            tag.toggleAttribute("data-locked", isLocked);
            const label = isLocked ? "LOCKED" : `X ${(px / r.width).toFixed(2)}  Y ${(py / r.height).toFixed(2)}`;
            if (label !== lastLabel) {
              tag.textContent = label;
              lastLabel = label;
            }
          }
        };
        const onLeave = () => {
          window.clearTimeout(idle);
          settle();
          showReticle(false);
        };

        footer.addEventListener("pointermove", onMove as EventListener, { passive: true });
        footer.addEventListener("pointerleave", onLeave);
        return () => {
          window.clearTimeout(idle);
          footer.removeEventListener("pointermove", onMove as EventListener);
          footer.removeEventListener("pointerleave", onLeave);
        };
      });

      // Touch: slow drift while on screen.
      mm.add(COARSE_POINTER, () => {
        const drift = gsap.timeline({ paused: true });
        inners.forEach((el) => {
          const i = Number(el.dataset.layerIndex);
          drift.fromTo(
            el,
            { x: -LAYERS[i].amp * 0.8 },
            { x: LAYERS[i].amp * 0.8, duration: 3.2 + i * 0.7, ease: "sine.inOut", repeat: -1, yoyo: true },
            0,
          );
        });
        const st = ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onToggle: (self) => drift.paused(!self.isActive) });
        return () => {
          st.kill();
          drift.kill();
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className={className}>
      {/* The whole mark on one line, at every width. */}
      <div data-line className="block">
        <div data-box className="relative" style={{ aspectRatio: `${W} / ${H}` }}>
          {/* Color cascade, behind the ink. */}
          <Cascade mask={MASK_FULL} scale={LINE_SCALE} />

          {face === "ink" ? (
            <div data-ink className="relative z-10">
              <Image
                src="/brand/wordmark-ink.png"
                alt="ContHunt"
                width={W}
                height={H}
                sizes="100vw"
                quality={90}
                className="block h-auto w-full select-none"
                draggable={false}
              />
            </div>
          ) : (
            <div data-ink role="img" aria-label="ContHunt" className="absolute inset-0 z-10">
              {face === "white" && (
                // blur > mask: CSS applies filter before mask, so the feather wraps the masked face.
                <div className="absolute inset-0" style={{ filter: `blur(max(${LINE_SCALE.faceFloor}px, ${FACE_FEATHER.vw}vw))` }}>
                  <div className="absolute inset-0" style={{ ...MASK_FULL, backgroundColor: "var(--paper)" }} />
                </div>
              )}
            </div>
          )}

          {/* Crosshair (fine pointer only; shown while the cursor is over the mark). */}
          <div
            data-reticle
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 hidden opacity-0 [@media(hover:hover)_and_(pointer:fine)]:block motion-reduce:hidden"
          >
            <div data-v className="absolute left-0 top-0 h-full w-px bg-pink/55" />
            <div data-h className="absolute left-0 top-0 h-px w-full bg-pink/55" />
            <div data-ring className="absolute left-0 top-0 size-0">
              <span className="absolute left-0 top-0 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink" />
            </div>
            <div data-tag className="absolute left-0 top-0 ml-4 mt-3 whitespace-pre rounded-[4px] bg-ink px-2 py-1 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-paper transition-colors duration-200 data-[locked]:bg-accent">
              X 0.00  Y 0.00
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
