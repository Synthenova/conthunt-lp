"use client";

/**
 * AsciiBand — the framed hero band of the MCP section. Hosts the ASCII globe canvas behind
 * its children and wires pointer input to the engine.
 *
 * Children mark two regions with data attributes (measured on resize, never per frame):
 * - `[data-globe-anchor]`: the box the globe is fitted into (centre + radius).
 * - `[data-globe-quiet]`: copy blocks; the background field is attenuated under them
 *   (to 22% with a 56px feather). `data-globe-quiet="0"` sets a custom floor (0 = clear) with
 *   a tight 24px feather, e.g. for a small label.
 *
 * The band carries `data-active="true|false"` (visible, tab shown, motion allowed) so CSS
 * loops inside it can pause: `group-data-[active=false]/band:[animation-play-state:paused]`.
 *
 * A successful copy in the section (`MCP_COPY_EVENT`) sends a ripple out from the globe.
 *
 * Behaviour: decodes in when first visible, ~30fps while visible, paused offscreen and on a
 * hidden tab. Hover scrambles nearby glyphs and tints them pink, purple and blue by distance, click sends a ripple, drag on
 * the globe spins and tilts it. Reduced motion draws one still frame and ignores the pointer.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { observeInView, onDocumentVisibility } from "@/lib/media";
import { usePrefersReducedMotion } from "@/lib/motion";
import { AsciiGlobeEngine, type GlobeAnchor, type QuietRect } from "./ascii-engine";
import { MCP_COPY_EVENT } from "./events";

export interface AsciiBandProps {
  children: ReactNode;
  className?: string;
  /** Globe radius as a fraction of the anchor box's smaller side / 2. Default 0.8. */
  globeScale?: number;
}

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  return {
    ink: cs.getPropertyValue("--ink").trim() || "#0f0f0f",
    palette: [
      cs.getPropertyValue("--pink").trim() || "#f0448c",
      cs.getPropertyValue("--purple").trim() || "#8a55f7",
      cs.getPropertyValue("--blue").trim() || "#2f54eb",
      cs.getPropertyValue("--green").trim() || "#16a05a",
    ] as [string, string, string, string],
  };
}

export function AsciiBand({ children, className, globeScale = 0.8 }: AsciiBandProps) {
  const bandRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const band = bandRef.current;
    const canvas = canvasRef.current;
    if (!band || !canvas) return;

    let engine: AsciiGlobeEngine;
    try {
      engine = new AsciiGlobeEngine(canvas, {
        fontFamily: getComputedStyle(canvas).fontFamily || "monospace",
        colors: readColors(),
      });
    } catch {
      return; // no 2D canvas: the band still reads without the field
    }

    let visible = false;
    let hidden = document.hidden;
    const sync = () => {
      band.dataset.active = String(visible && !hidden && !reduced);
      if (reduced) {
        engine.renderStatic();
        return;
      }
      if (visible && !hidden) engine.play();
      else engine.pause();
    };

    const layout = () => {
      const b = band.getBoundingClientRect();
      if (b.width < 2 || b.height < 2) return;
      const a = band.querySelector<HTMLElement>("[data-globe-anchor]")?.getBoundingClientRect();
      const quiet: QuietRect[] = Array.from(band.querySelectorAll<HTMLElement>("[data-globe-quiet]"), (el) => {
        const q = el.getBoundingClientRect();
        const floor = Number(el.dataset.globeQuiet);
        return {
          x: q.left - b.left,
          y: q.top - b.top,
          w: q.width,
          h: q.height,
          floor: Number.isFinite(floor) && el.dataset.globeQuiet !== "" ? floor : undefined,
          feather: el.dataset.globeQuiet !== "" ? 24 : undefined,
        };
      });
      const anchor: GlobeAnchor = a
        ? {
            cx: a.left - b.left + a.width / 2,
            cy: a.top - b.top + a.height / 2,
            r: (Math.min(a.width, a.height) / 2) * globeScale,
          }
        : { cx: b.width / 2, cy: b.height / 2, r: (Math.min(b.width, b.height) / 2) * globeScale };
      engine.resize(b.width, b.height, anchor, quiet);
      if (reduced) engine.renderStatic();
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(band);

    // Webfont swap changes glyph metrics: rebuild once fonts settle.
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      engine.setFontFamily(getComputedStyle(canvas).fontFamily || "monospace");
      layout();
    });

    const stopView = observeInView(
      band,
      (entry) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "80px 0px" },
    );
    const stopVis = onDocumentVisibility((h) => {
      hidden = h;
      sync();
    });

    // Pointer input (skipped under reduced motion).
    const local = (e: PointerEvent) => {
      const b = band.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top] as const;
    };
    let down: { x: number; y: number; id: number; drag: boolean } | null = null;
    let cursor = "";
    const setCursor = (c: string) => {
      if (c !== cursor) {
        cursor = c;
        band.style.cursor = c;
      }
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = local(e);
      engine.pointerMove(x, y);
      const interactive = (e.target as HTMLElement).closest("a,button,[data-globe-ignore]");
      setCursor(down?.drag ? "grabbing" : !interactive && engine.hitGlobe(x, y) ? "grab" : "");
    };
    const onLeave = () => {
      engine.pointerLeave();
      setCursor("");
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("a,button,[data-globe-ignore]")) return;
      const [x, y] = local(e);
      const drag = engine.pointerDown(x, y);
      down = { x, y, id: e.pointerId, drag };
      if (drag) {
        e.preventDefault(); // no text selection while spinning
        band.setPointerCapture(e.pointerId);
        setCursor("grabbing");
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      const [x, y] = local(e);
      if (Math.hypot(x - down.x, y - down.y) < 6) engine.ripple(x, y);
      if (down.drag && band.hasPointerCapture(down.id)) band.releasePointerCapture(down.id);
      engine.pointerUp();
      down = null;
      setCursor(engine.hitGlobe(x, y) ? "grab" : "");
    };

    // A copy anywhere in the section answers with a ripple from the globe's centre.
    const onCopy = () => {
      if (reduced || !visible || hidden) return;
      const a = band.querySelector<HTMLElement>("[data-globe-anchor]")?.getBoundingClientRect();
      if (!a) return;
      const b = band.getBoundingClientRect();
      engine.ripple(a.left - b.left + a.width / 2, a.top - b.top + a.height / 2);
    };
    window.addEventListener(MCP_COPY_EVENT, onCopy);

    if (!reduced) {
      band.addEventListener("pointermove", onMove);
      band.addEventListener("pointerleave", onLeave);
      band.addEventListener("pointerdown", onDown);
      band.addEventListener("pointerup", onUp);
      band.addEventListener("pointercancel", onUp);
    }
    sync();

    return () => {
      alive = false;
      ro.disconnect();
      stopView();
      stopVis();
      window.removeEventListener(MCP_COPY_EVENT, onCopy);
      band.removeEventListener("pointermove", onMove);
      band.removeEventListener("pointerleave", onLeave);
      band.removeEventListener("pointerdown", onDown);
      band.removeEventListener("pointerup", onUp);
      band.removeEventListener("pointercancel", onUp);
      band.style.cursor = "";
      engine.destroy();
    };
  }, [reduced, globeScale]);

  return (
    <div ref={bandRef} data-active="false"
      className={cn("group/band relative isolate touch-pan-y", className)}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 size-full font-mono"
      />
      {children}
    </div>
  );
}
