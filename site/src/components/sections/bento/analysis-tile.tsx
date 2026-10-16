"use client";

/**
 * AnalysisTile — the big first bento tile ("Every signal, pulled from one video").
 *
 * Rest: the featured TikTok plays muted on a calm surface tile, with a two-tone caption, a
 * "Hover me" / "Tap me" hint and four quiet data chips around the video (hook window, views,
 * re-rank, a score; all real values from bento-analysis.json), so the tile signals depth before
 * anyone hovers. Below 48rem only two chips show, tucked half behind the video.
 * Open (hover, tap on the tile or video, or Enter/Space on the hint): the video glides into its
 * slot and nine data panels are dealt out from behind it (q41dd layout), then numbers count up,
 * score bars fill, the sparkline draws and the real loudness envelope tracks the playing video.
 * Leaving reverses faster.
 *
 * Input model:
 * - Mouse/pen: resting on the tile for 160ms opens it (never while Lenis is still scrolling it
 *   under the cursor), pointer leave closes (a click re-opens after using close).
 * - Touch: a tap on the tile background or the video toggles; taps on panel content (scores,
 *   lenses, questions) never close it. A round close button sits on the video's corner.
 * - Keyboard: the hint opens and moves focus to the close button; Escape (or the close button)
 *   closes and returns focus to the hint; tabbing out of the tile closes it.
 * - Reduced motion: instant swap, final values, no loops.
 *
 *   <AnalysisTile />                 // all data comes from ./data (bento-analysis.json)
 *   <AnalysisTile className="mt-4" />
 *
 * Geometry lives in analysis-tile.module.css (container queries: desktop mosaic >= 48rem,
 * compact grid below 48rem, where the tile grows when opened). Animation is transform, opacity and
 * clip-path; the compact height change is a single layout snap at the start of the opening.
 */
import { memo, useCallback, useEffect, useId, useRef, useState } from "react";
import { MousePointer2, X } from "lucide-react";
import { useLenis } from "@/components/layout/smooth-scroll";
import { VideoTile } from "@/components/ui/video-tile";
import { cn } from "@/lib/cn";
import { EASE, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { observeInView, onceInView } from "@/lib/media";
import type { Hue } from "@/lib/tones";
import { MOTION_OK, prefersReducedMotion, useIsomorphicLayoutEffect, usePrefersReducedMotion } from "@/lib/motion";
import {
  AudioPanel,
  HookPanel,
  MetricsPanel,
  QualPanel,
  QuantPanel,
  RerankPanel,
  ScoresPanel,
  TrendPanel,
  ViralityPanel,
} from "./analysis-panels";
import styles from "./analysis-tile.module.css";
import {
  AUDIO_SOURCE_DURATION_S,
  HOOK,
  LOOP_SOURCE_OFFSET_S,
  METRICS,
  RERANK,
  SCENES,
  SCORES,
  TILE_ONE,
  VIDEO,
  VIEWS_PER_DAY,
  fmtCompact,
  fmtInt,
  fmtPct,
} from "./data";
import { TikTokGlyph } from "./glyphs";

/** Deal order alternates sides, like cards dealt from a shoe. */
const DEAL_ORDER = ["hook", "metrics", "rerank", "trend", "qual", "scores", "audio", "virality", "quant"] as const;
const TILT: Record<string, number> = { hook: -8, metrics: 7, virality: -4, trend: 5, qual: -7, scores: 8, audio: -6, rerank: 5, quant: 7 };
/** Panels further than this from the video start part-way out, so long compact deals stay tight. */
const MAX_DEAL_PX = 340;
const CLOSE_SIZE = 32;
const CLOSE_INSET = 8;
const NAV_OFFSET = 96;

const FORMAT: Record<string, (v: number) => string> = {
  int: fmtInt,
  pct: (v) => fmtPct(v),
  plain: (v) => String(Math.round(v)),
};

/** Layout position relative to `root`, ignoring transforms (offset chain). */
function layoutBox(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** The compact layout is the CSS default; the desktop container query sets `--compact: 0`. */
const isCompact = (tile: HTMLElement) => getComputedStyle(tile).getPropertyValue("--compact").trim() === "1";

/**
 * Hover intent: the pointer must rest on the tile this long before the deal starts, so sweeping
 * the cursor across the page never fires the nine-panel deal and its close tail. While Lenis is
 * still scrolling (the tile sliding under a stationary cursor) the open waits for it to settle.
 */
const HOVER_IN_MS = 160;
const HOVER_OUT_MS = 150;
const SCROLL_RECHECK_MS = 120;
/** Rest-state data chips (aria-hidden: the opened panels and the video label carry the same facts). */
const HOOK_SCENE = SCENES.find((sc) => sc.tag === "Hook") ?? SCENES[0];
const DEMO_SCORE = SCORES.find((sc) => sc.name === "Demo clarity") ?? SCORES[0];
const REST_CHIPS = [
  { key: "hook", side: "l", hue: "pink", label: "Hook", value: `0:00–0:0${HOOK_SCENE.end}`, sub: HOOK.type },
  { key: "views", side: "l", hue: "blue", label: "Views", value: fmtCompact(METRICS.views), sub: `${fmtCompact(VIEWS_PER_DAY)} a day` },
  { key: "rerank", side: "r", hue: "green", label: "Re-rank", value: `#${RERANK.before} → #${RERANK.lenses[0].rank}`, sub: `by ${RERANK.lenses[0].lens}, of ${RERANK.results}` },
  { key: "score", side: "r", hue: "purple", label: DEMO_SCORE.name, value: String(DEMO_SCORE.value), sub: "score of 100" },
] as const satisfies readonly { key: string; side: string; hue: Hue; label: string; value: string; sub: string }[];

/** Static class maps (Tailwind only emits classes it finds written out). */
const CHIP_INK: Record<Hue, string> = {
  pink: "text-pink-ink", purple: "text-purple-ink", blue: "text-blue-ink", green: "text-green-ink",
  yellow: "text-yellow-ink", orange: "text-orange-ink", red: "text-red-ink",
};
const CHIP_DOT: Record<Hue, string> = {
  pink: "bg-pink", purple: "bg-purple", blue: "bg-blue", green: "bg-green",
  yellow: "bg-yellow-deep", orange: "bg-orange-ink", red: "bg-red",
};

/** Static video overlay (module constant, so the memoised VideoTile never re-renders). */
const VIDEO_OVERLAY = (
  <div className="pointer-events-none absolute inset-0 text-white">
    {/* Rest-only labels: they fade as the video shrinks into its slot. */}
    <div data-vchrome className="absolute inset-0">
      {/* Scrims: the clip is mostly white, so the white labels sit on a solid 75% black band (their
          rows end at ~26px) that then fades out. Measured on the poster and the lightest frames:
          white-on-scrim is above 7:1 (plain 45% black gave about 3.5:1). */}
      <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/75 via-black/75 via-40% to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/75 via-black/75 via-40% to-transparent" />
      <div className="absolute left-3 top-3 flex items-center gap-1.5 text-[12px] font-medium leading-none">
        <TikTokGlyph className="size-3.5" />
        {VIDEO.creator}
      </div>
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between font-mono text-[11px] leading-none tabular-nums">
        <span>{fmtCompact(VIDEO.views)} views</span>
        <span>0:{String(VIDEO.durationS).padStart(2, "0")}</span>
      </div>
    </div>
    {/* One read-through as the analysis opens (light, not the accent). */}
    <div
      data-scan
      className="invisible absolute inset-x-0 top-0 h-[26%] border-b-[1.5px] border-white/90 bg-linear-to-b from-white/0 to-white/25 opacity-0"
    />
  </div>
);

/**
 * Only the Re-rank panel and the controls depend on `open`. Everything else is memoised, so the
 * open/close commit does not re-render ~300 static nodes (the audio panel alone has 96 bars).
 */
const MemoVideoTile = memo(VideoTile);
const Panels = {
  Hook: memo(HookPanel),
  Qual: memo(QualPanel),
  Audio: memo(AudioPanel),
  Trend: memo(TrendPanel),
  Metrics: memo(MetricsPanel),
  Scores: memo(ScoresPanel),
  Virality: memo(ViralityPanel),
  Quant: memo(QuantPanel),
};

export interface AnalysisTileProps {
  className?: string;
}

export function AnalysisTile({ className }: AnalysisTileProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hintRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<gsap.core.Timeline | null>(null);
  const contentRef = useRef<gsap.core.Timeline | null>(null);
  const resetRef = useRef<() => void>(() => {});
  const openRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const pointerTypeRef = useRef<string>("mouse");
  const hoverRef = useRef(false);
  const focusCloseRef = useRef(false);
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis();
  const mosaicId = useId();

  /* -------------------------------------------------- build the timelines */
  useGSAP(
    (_ctx, contextSafe) => {
      const tile = tileRef.current;
      const frame = frameRef.current;
      if (!tile || !frame || !contextSafe) return;
      const mosaic = tile.querySelector<HTMLElement>("[data-mosaic]");
      if (!mosaic) return;

      const build = contextSafe(() => {
        const wasOpen = openRef.current;
        // Rewind to the rest state before rebuilding, so a resize mid-animation never bakes a
        // half-hidden state into the new timeline's start values.
        mainRef.current?.progress(0).kill();
        contentRef.current?.progress(1).kill();
        tile.style.removeProperty("height");
        tile.style.removeProperty("--reveal");

        const q = <T extends Element = HTMLElement>(sel: string) => gsap.utils.toArray<T>(sel, tile);
        const video = tile.querySelector<HTMLElement>("[data-video]");
        const slot = tile.querySelector<HTMLElement>("[data-slot]");
        const close = closeRef.current;
        if (!video || !slot) return;
        const panels = DEAL_ORDER.map((n) => tile.querySelector<HTMLElement>(`[data-panel="${n}"]`)).filter(
          (el): el is HTMLElement => !!el && el.offsetParent !== null,
        );
        const ghosts = q("[data-ghost]");
        const chrome = q("[data-chrome]");
        const vchrome = q("[data-vchrome]");
        const scan = q("[data-scan]");
        const compact = isCompact(tile);

        gsap.set([video, ...panels, ...ghosts], { clearProps: "transform" });
        const rest = layoutBox(video, tile);
        const target = layoutBox(slot, tile);
        const cx = rest.x + rest.w / 2;
        const cy = rest.y + rest.h / 2;

        // The close button parks on the slot's top-right corner (where the video lands).
        if (close) {
          close.style.left = `${target.x + target.w - CLOSE_SIZE - CLOSE_INSET}px`;
          close.style.top = `${target.y + CLOSE_INSET}px`;
        }

        // Rest chips sit where CSS puts them; opening pulls each one halfway into the video.
        const chipPull = ghosts.map((g) => {
          const b = layoutBox(g, tile);
          return { x: (cx - (b.x + b.w / 2)) * 0.5, y: (cy - (b.y + b.h / 2)) * 0.25 };
        });

        const main = gsap.timeline({ paused: true });
        if (compact) {
          // Compact grows: snap the layout height once, then reveal the new area with clip-path.
          const restH = tile.offsetHeight;
          const openH = Math.max(restH, mosaic.offsetHeight);
          main.fromTo(tile, { height: restH }, { height: openH, duration: 0.001, ease: "none", immediateRender: false }, 0);
          main.fromTo(tile, { "--reveal": 0 }, { "--reveal": 1, duration: 0.8, ease: EASE.out, immediateRender: false }, 0);
          main.eventCallback("onComplete", () => ScrollTrigger.refresh());
          main.eventCallback("onReverseComplete", () => {
            tile.style.removeProperty("height"); // back to the CSS rest height exactly
            ScrollTrigger.refresh();
          });
        }
        main.to(chrome, { autoAlpha: 0, y: -6, duration: 0.24, ease: EASE.outFast }, 0);
        // The video's own labels would shrink to ~8px with it; the panels carry those facts.
        main.to(vchrome, { autoAlpha: 0, duration: 0.2, ease: "none" }, 0);
        main.to(
          ghosts,
          { autoAlpha: 0, x: (i: number) => chipPull[i].x, y: (i: number) => chipPull[i].y, scale: 0.86, duration: 0.32, ease: EASE.out },
          0,
        );
        main.to(
          video,
          { x: target.x - rest.x, y: target.y - rest.y, scale: target.w / rest.w, duration: 0.72, ease: EASE.out },
          0,
        );
        main.fromTo(scan, { yPercent: -100, autoAlpha: 1 }, { yPercent: 380, duration: 1, ease: "power1.inOut" }, 0.12);
        main.to(scan, { autoAlpha: 0, duration: 0.22, ease: "none" }, 0.9);
        panels.forEach((p, i) => {
          const b = layoutBox(p, tile);
          let dx = cx - (b.x + b.w / 2);
          let dy = cy - (b.y + b.h / 2);
          const dist = Math.hypot(dx, dy);
          if (dist > MAX_DEAL_PX) {
            dx *= MAX_DEAL_PX / dist;
            dy *= MAX_DEAL_PX / dist;
          }
          const at = 0.06 + i * 0.048;
          main.fromTo(
            p,
            { x: dx, y: dy, scale: 0.42, rotation: TILT[p.dataset.panel ?? ""] ?? 0 },
            { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.86, ease: "back.out(1.2)" },
            at,
          );
          main.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: "none" }, at);
        });

        // Inner content: count-ups, bars, sparkline, waveform. Played forward on each open.
        const counts = q("[data-count]");
        const bars = q("[data-bar]");
        const draws = q<SVGPathElement>("[data-draw]");
        const areas = q<SVGPathElement>("[data-area]");
        const waves = q("[data-wave]");
        const content = gsap.timeline({ paused: true });
        const base = 0.36;
        counts.forEach((el, i) => {
          const end = Number(el.dataset.count);
          const fmt = FORMAT[el.dataset.format ?? "plain"] ?? FORMAT.plain;
          const proxy = { v: 0 };
          content.to(
            proxy,
            { v: end, duration: 1.15, ease: "power3.out", onUpdate: () => void (el.textContent = fmt(proxy.v)) },
            base + Math.min(i, 12) * 0.02,
          );
        });
        bars.forEach((el, i) => {
          const final = Number(el.dataset.bar ?? 1);
          content.fromTo(el, { scaleX: 0 }, { scaleX: final, duration: 0.55, ease: EASE.out, immediateRender: false }, base + 0.12 + i * 0.055);
        });
        content.fromTo(draws, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.9, ease: "power2.inOut", immediateRender: false }, base + 0.1);
        content.fromTo(areas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "none", immediateRender: false }, base + 0.45);
        content.fromTo(
          waves,
          { scaleY: 0.15 },
          { scaleY: 1, duration: 0.45, ease: EASE.out, stagger: 0.008, immediateRender: false },
          base + 0.15,
        );

        resetRef.current = contextSafe(() => {
          counts.forEach((el) => {
            const fmt = FORMAT[el.dataset.format ?? "plain"] ?? FORMAT.plain;
            el.textContent = fmt(0);
          });
          gsap.set(bars, { scaleX: 0 });
          gsap.set(draws, { drawSVG: "0% 0%" });
          gsap.set(areas, { autoAlpha: 0 });
          gsap.set(waves, { scaleY: 0.15 });
        });

        mainRef.current = main;
        contentRef.current = content;
        if (wasOpen) {
          main.progress(1);
          content.progress(1);
        }
      });

      build();

      // Rebuild when the tile width changes or the mosaic's natural height changes (webfonts
      // re-wrapping text changes the compact open height).
      let raf = 0;
      let lastW = frame.offsetWidth;
      let lastH = mosaic.offsetHeight;
      const ro = new ResizeObserver(() => {
        const w = frame.offsetWidth;
        const h = mosaic.offsetHeight;
        if (w === lastW && h === lastH) return;
        lastW = w;
        lastH = h;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => build());
      });
      ro.observe(frame);
      ro.observe(mosaic);
      return () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
      };
    },
    { scope: tileRef },
  );

  /* ---------------------------------------- idle hints (pause off screen) */
  useGSAP(
    () => {
      const tile = tileRef.current;
      if (!tile) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const ring = tile.querySelector("[data-hint-ring]");
        const pulse = gsap.fromTo(
          ring,
          { scale: 0.5, autoAlpha: 0.55 },
          { scale: 1.9, autoAlpha: 0, duration: 1.1, ease: "power2.out", repeat: -1, repeatDelay: 1.5, paused: true },
        );
        const stopView = observeInView(tile, (e) => (e.isIntersecting ? pulse.play() : pulse.pause()), { threshold: 0 });
        // The chips breathe outward once (away from the video) the first time the tile is mostly in view.
        const ghosts = gsap.utils.toArray<HTMLElement>("[data-ghost]", tile);
        const stopOnce = onceInView(
          tile,
          () => {
            if (openRef.current) return;
            gsap.to(ghosts, {
              x: (_i: number, el: HTMLElement) => (el.dataset.side === "l" ? "-=10" : "+=10"),
              duration: 0.55,
              ease: EASE.out,
              yoyo: true,
              repeat: 1,
              delay: 0.25,
              stagger: 0.06,
            });
          },
          { threshold: 0.55 },
        );
        return () => {
          stopView();
          stopOnce();
        };
      });
    },
    { scope: tileRef },
  );

  /* ------------------------------------------------- open / close playback */
  // Layout effect: the swap starts in the same frame data-open flips (no painted frame where
  // the attribute and the panels disagree; matters most for the reduced-motion instant swap).
  useIsomorphicLayoutEffect(() => {
    const main = mainRef.current;
    const content = contentRef.current;
    const tile = tileRef.current;
    if (!main || !content || !tile) return;
    if (prefersReducedMotion()) {
      main.progress(open ? 1 : 0);
      if (open) content.progress(1);
      else if (isCompact(tile)) tile.style.removeProperty("height");
      if (isCompact(tile)) ScrollTrigger.refresh();
    } else if (open) {
      resetRef.current();
      main.timeScale(1).play();
      content.restart();
    } else {
      main.timeScale(1.75).reverse();
      content.pause();
    }
    // Keyboard opening moves focus onto the close control (visible as soon as data-open flips).
    if (open && focusCloseRef.current) {
      focusCloseRef.current = false;
      closeRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  /* --------------------------------- audio playhead follows the real video */
  useEffect(() => {
    const tile = tileRef.current;
    const video = videoRef.current;
    if (!open || !tile || !video) return;
    const played = tile.querySelector<HTMLElement>("[data-wave-played]");
    const head = tile.querySelector<HTMLElement>("[data-playhead]");
    if (!played || !head || played.offsetParent === null) return;
    const width = played.offsetWidth;
    const tick = () => {
      const p = Math.min(1, Math.max(0, (LOOP_SOURCE_OFFSET_S + video.currentTime) / AUDIO_SOURCE_DURATION_S));
      played.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`;
      head.style.transform = `translateX(${(p * width).toFixed(1)}px)`;
    };
    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [open]);

  /* ------------------------------------------------------------- handlers */
  const schedule = useCallback((next: boolean, ms: number) => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      openRef.current = next;
      setOpen(next);
    }, ms);
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  /**
   * Explicit close (Escape, close button, tap). Focus inside the tile goes back to the hint
   * BEFORE the mosaic turns inert, so it never falls to <body>. In the compact layout, if the
   * tile's top has scrolled away, bring it back so the collapse does not strand the reader.
   */
  const requestClose = () => {
    const tile = tileRef.current;
    if (!tile || !openRef.current) return;
    const active = document.activeElement;
    if (active && active !== hintRef.current && tile.contains(active)) hintRef.current?.focus({ preventScroll: true });
    schedule(false, 0);
    const top = tile.getBoundingClientRect().top;
    if (isCompact(tile) && top < 0) {
      if (lenis) lenis.scrollTo(tile, { offset: -NAV_OFFSET });
      else window.scrollTo({ top: window.scrollY + top - NAV_OFFSET });
    }
  };

  /** Hover intent: open only if the pointer is still inside and the page has stopped scrolling. */
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  const scheduleHoverOpen = useCallback((ms: number) => {
    window.clearTimeout(timerRef.current);
    const attempt = () => {
      if (!hoverRef.current || openRef.current) return;
      // Only the "smooth" (wheel-driven) state: Lenis can leave "native" set after a zero-delta
      // native scroll event, which would block the open indefinitely.
      if (lenisRef.current?.isScrolling === "smooth") {
        timerRef.current = window.setTimeout(attempt, SCROLL_RECHECK_MS);
        return;
      }
      openRef.current = true;
      setOpen(true);
    };
    timerRef.current = window.setTimeout(attempt, ms);
  }, []);

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    hoverRef.current = true;
    scheduleHoverOpen(HOVER_IN_MS);
  };
  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    hoverRef.current = false;
    schedule(false, HOVER_OUT_MS);
  };
  const onBlur = (e: React.FocusEvent) => {
    // Keyboard users tabbing out of the tile close it (unless the mouse is over it). Focus that
    // goes nowhere (relatedTarget null: a tap or click on non-focusable panel content, or the
    // window losing focus) is not "leaving", so it never closes the tile.
    if (!openRef.current || hoverRef.current) return;
    const next = e.relatedTarget as Node | null;
    if (next && !e.currentTarget.contains(next)) schedule(false, 0);
  };
  const onTileClick = (e: React.MouseEvent) => {
    // Taps/clicks on panel content or controls are interactions with that content, never a
    // toggle. Touch: the background and the video toggle. Mouse: hover already opens, so a
    // click only re-opens (after the close button was used while the pointer stayed inside).
    if ((e.target as Element).closest("[data-panel], button, a")) return;
    if (pointerTypeRef.current === "touch") {
      if (openRef.current) requestClose();
      else schedule(true, 0);
    } else if (!openRef.current) {
      schedule(true, 0);
    }
  };
  const onHintClick = (e: React.MouseEvent) => {
    if (openRef.current) return;
    // Keyboard activation (detail 0): hand focus to the close control once it is visible.
    if (e.detail === 0) focusCloseRef.current = true;
    schedule(true, 0);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && openRef.current) {
      e.stopPropagation();
      requestClose();
    }
  };

  return (
    <div ref={frameRef} className={cn(styles.frame, className)}>
      <div
        ref={tileRef}
        role="group"
        aria-label="Featured video analysis"
        data-open={open}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={(e) => (pointerTypeRef.current = e.pointerType)}
        onClick={onTileClick}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        // Neutral gray backdrop: a soft top-left to bottom-right linear gradient, like the tinted tiles beside it.
        className={cn(styles.tile, "group/tile rounded-tray bg-linear-to-br from-surface via-surface to-surface-2")}
      >
        {/* Caption (jreAl two-tone). On desktop its width is budgeted so it never meets the video. */}
        <div data-chrome className={cn(styles.caption, "pointer-events-none absolute left-5 top-5 z-[4] md:left-7 md:top-7")}>
          <h3 className="text-[clamp(1.25rem,1.05rem+0.6vw,1.625rem)] font-bold leading-[1.12] tracking-[-0.025em] text-ink">
            <span className="block">{TILE_ONE.caption}</span> <span className="block text-balance text-muted">{TILE_ONE.rest}</span>
          </h3>
        </div>
        <p
          data-chrome
          className="pointer-events-none absolute right-7 top-7 z-[4] hidden text-right font-mono text-[10.5px] uppercase leading-[1.4] tracking-[0.04em] text-ink/62 @min-[48rem]/bento-one:block"
        >
          <span className="block">{TILE_ONE.receipt[0]}</span>
          <span className="block">{TILE_ONE.receipt[1]}</span>
        </p>

        {/* Rest chips: real values around the video, quiet enough to stay behind the caption. */}
        {REST_CHIPS.map((chip) => (
          <div
            key={chip.key}
            data-ghost
            data-side={chip.side}
            aria-hidden="true"
            className={cn(styles.chip, chip.side === "l" ? styles.chipL : styles.chipR, styles[`chip_${chip.key}`])}
          >
            {/* GSAP transforms the outer box; the tilt and centring live on this inner card. */}
            <div className={cn(styles.chipCard, "rounded-2xl border border-hairline bg-paper px-3 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]")}>
              <p className={cn("flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] font-medium uppercase leading-[1.3] tracking-[0.03em]", CHIP_INK[chip.hue])}>
                <span className={cn("size-1.5 shrink-0 rounded-full", CHIP_DOT[chip.hue])} aria-hidden="true" />
                {chip.label}
              </p>
              <p className="mt-1 whitespace-nowrap text-[15px] font-semibold leading-tight tracking-[-0.01em] text-ink-2 tabular-nums">
                {chip.value}
              </p>
              <p className={cn(styles.chipSub, "mt-0.5 whitespace-nowrap text-[12px] leading-tight text-ink/62")}>{chip.sub}</p>
            </div>
          </div>
        ))}

        {/* Video (rest: centred; open: GSAP moves it onto [data-slot]) */}
        <div data-video className={styles.video}>
          <MemoVideoTile
            src={VIDEO.src}
            poster={VIDEO.poster}
            label={VIDEO.label}
            priority={3}
            videoRef={videoRef}
            className="w-full shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_-12px_rgba(0,0,0,0.28)] outline outline-1 -outline-offset-1 outline-black/10"
            overlay={VIDEO_OVERLAY}
          />
        </div>

        {/* Hint: the open control (rest only). While open it leaves the tab order. */}
        <button
          ref={hintRef}
          type="button"
          aria-expanded={open}
          aria-controls={mosaicId}
          tabIndex={open ? -1 : 0}
          onClick={onHintClick}
          className={cn(
            styles.hint,
            "absolute left-1/2 z-[5] flex -translate-x-1/2 items-center gap-2 rounded-full px-3 font-mono text-[12px] font-medium uppercase leading-none tracking-[0.06em] text-ink-2 transition-[opacity,color] duration-200 ease-out hover:text-ink",
            open && "pointer-events-none opacity-0",
          )}
        >
          <span className="relative flex size-4 items-center justify-center" aria-hidden="true">
            <span data-hint-ring className="absolute inset-0 rounded-full border border-ink/40" />
            <MousePointer2 className="relative size-3 fill-current text-pink" strokeWidth={1.5} />
          </span>
          <span className="pointer-coarse:hidden">Hover me</span>
          <span className="hidden pointer-coarse:inline">Tap me</span>
          <span className="sr-only">, show the full analysis of this video</span>
        </button>

        {/* Close: parks on the video slot's corner (position set in build). Visible while open. */}
        <button
          ref={closeRef}
          type="button"
          aria-controls={mosaicId}
          aria-label="Hide the analysis"
          onClick={requestClose}
          className={cn(
            "invisible absolute left-0 top-0 z-[6] flex size-8 scale-75 items-center justify-center rounded-full bg-paper text-ink opacity-0 shadow-[0_1px_2px_rgba(0,0,0,0.14),0_4px_12px_-2px_rgba(0,0,0,0.18)] transition-[opacity,scale] duration-200 ease-out",
            "before:absolute before:-inset-1.5 before:content-['']",
            "group-data-[open=true]/tile:visible group-data-[open=true]/tile:scale-100 group-data-[open=true]/tile:opacity-100 group-data-[open=true]/tile:delay-500",
          )}
        >
          <X className="size-4" strokeWidth={2} aria-hidden="true" />
        </button>

        {/* Mosaic */}
        <div id={mosaicId} data-mosaic className={styles.mosaic} inert={!open}>
          <div className={styles.col}>
            <Panels.Hook />
            <Panels.Qual />
            <Panels.Audio />
          </div>
          <div className={styles.col}>
            <RerankPanel open={open} reduced={reduced} />
            <div data-slot className={styles.slot} aria-hidden="true" />
            <Panels.Trend />
          </div>
          <div className={styles.col}>
            <Panels.Metrics />
            <Panels.Scores />
            <div className={styles.pair}>
              <Panels.Virality />
              <Panels.Quant />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
