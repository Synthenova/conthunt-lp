"use client";

/**
 * HeroBoard — the interactive hero: text column (H1 with the shader-painted "viral", prompt box
 * with the Deep Search chip and the pause control, whose ring shows the cycle clock; the offer line,
 * the subtitle with its count chips, "Get started"), the triangular split-flap board (up to five
 * whole columns; how many show is the hero row's column count, hero.module.css "the hero row model",
 * hero-rev14) and the connector beam. Structure renders once; the HeroEngine animates it.
 *
 * Props: `glyphs` (platform → 24×24 SVG path, from icons.ts on the server) and
 * `strip` (the platforms strip, rendered by the server component).
 */
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { preload } from "react-dom";
import { ArrowRight, Brain, CornerDownLeft, Pause, Play } from "lucide-react";
import { DEEP_SEARCH_CHIP, LiquidRampFill, LiquidRampText, VIRAL } from "@/components/ui/liquid-ramp";
import { MetalButton } from "@/components/ui/metal-button";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { GET_STARTED_URL } from "@/lib/links";
import { MOTION_OK, MOTION_REDUCED } from "@/lib/motion";
import { CardBack, ChartDefs, Face } from "./card-parts";
import { CountChip } from "./count-chip";
import {
  BOARD_CARDS,
  COLUMNS,
  COLUMN_HIDDEN_MEDIA,
  HERO_POSTER_SIZES,
  HERO_STATS,
  PROMPT_SETS,
  columnOf,
  describeCard,
  heroPosterSrcSet,
  type GlyphMap,
} from "./data";
import { HeroEngine, prePaintPlacementScript, promptLayerHtml } from "./engine";
import { FlapSynth, useFlapSound } from "./flap-sound";
import s from "./hero.module.css";

const LAYER_CLASSES = { layer: s.promptLayer, w: s.w, wi: s.wi };
const INITIAL_LAYER = { __html: promptLayerHtml(PROMPT_SETS[0].prompt, LAYER_CLASSES) };
const PLACEMENT_SCRIPT = { __html: prePaintPlacementScript(s.columns) };
const FIRST = BOARD_CARDS[0];

const noopSubscribe = () => () => {};
/**
 * True while the server renders and the client hydrates, false for a client-only
 * mount (a client-side navigation to Home). The pre-paint script is rendered only
 * in server HTML: a script that React creates on the client never runs (and React
 * warns about it), and there the engine places the board in a layout effect anyway.
 */
const useServerHtml = () => useSyncExternalStore(noopSubscribe, () => false, () => true);

/**
 * The prompt box's mode. Deep Search is the only mode the site offers (we want visitors to try
 * it), so it is shown as an indicator that is always on and does nothing: a chip, not a control
 * (hero-rev4; icon only since rev 14). Submit always goes to GET_STARTED_URL?q=<prompt>. This text,
 * what the free first Deep Search is (50 videos across 5 searches; owner, 2026-10-16, hero-rev3
 * Rev 10), is the chip's tooltip and shows beside the submit button while typing.
 */
const DEEP_HINT = "50 videos · 5 searches";

interface SlotHandlers {
  turn: (i: number, on: boolean) => void;
  toggle: (i: number) => void;
  move: (from: number, dir: 1 | -1) => void;
}

/* ------------------------------------------------------------------- slot */

const Slot = memo(function Slot({
  i,
  glyphs,
  tabbable,
  handlers,
}: {
  i: number;
  glyphs: GlyphMap;
  tabbable: boolean;
  handlers: React.RefObject<SlotHandlers>;
}) {
  const card = FIRST[i];
  const lastPointer = useRef<string>("mouse");

  return (
    <div
      data-slot={i}
      data-lead={i === 0 ? "" : undefined}
      className={s.slot}
      onPointerDown={(e: PointerEvent) => {
        lastPointer.current = e.pointerType;
      }}
      onPointerEnter={(e: PointerEvent) => e.pointerType === "mouse" && handlers.current.turn(i, true)}
      onPointerLeave={(e: PointerEvent) => e.pointerType === "mouse" && handlers.current.turn(i, false)}
      onClick={(e) => e.detail > 0 && lastPointer.current !== "mouse" && handlers.current.toggle(i)}
      onFocus={(e) => (e.target as Element).matches(":focus-visible") && handlers.current.turn(i, true)}
      onBlur={(e) => {
        // Focus moving inside the card (the slot to its loop video, or back) is not leaving it.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) handlers.current.turn(i, false);
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlers.current.toggle(i);
        } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          handlers.current.move(i, 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          handlers.current.move(i, -1);
        } else if (e.key === "Escape") {
          handlers.current.turn(i, false);
        }
      }}
    >
      {/* The card's one semantic control (WCAG 2.5.3): a visually hidden native button whose own text is
          the description, so its name is its content and nothing can mismatch the visible chips. Focus,
          Enter and Space turn the card, as hover does; the visual below is decorative. */}
      <button type="button" data-hit="" className="sr-only" tabIndex={tabbable ? 0 : -1} aria-pressed="false">
        {describeCard(card)}
      </button>
      <div data-lift="" className={s.lift} aria-hidden="true">
        <div data-flipper="" className={s.flipper}>
          <div data-front="" className={s.front}>
            <div data-layer="rest" className="absolute inset-0">
              {/* Columns 3–5 can be hidden (the row's column count; the stacked layout hides 4 and 5): their
                  posters are lazy, and a lazy image in a display:none column is never fetched, whatever
                  the engine assigns to it. Exact at any scrollbar width or window height; the <picture>
                  media query (COLUMN_HIDDEN_MEDIA) stays as a second guard for the first parse. */}
              <Face
                card={card}
                glyphs={glyphs}
                eager={columnOf(i) < 2}
                responsive
                hiddenMedia={COLUMN_HIDDEN_MEDIA[columnOf(i)]}
                media={
                  i < 3 ? (
                    <video
                      className={s.video}
                      muted
                      playsInline
                      loop
                      preload="none"
                      disablePictureInPicture
                      disableRemotePlayback
                      aria-hidden="true"
                    />
                  ) : null
                }
              />
            </div>
            {/* Split-flap mechanism (hidden at rest). Each half's face is cloned from the resting
                face by the engine on setup (engine.ts, ensureHalfFace), so the server HTML carries
                one face per card instead of five. */}
            <div data-mech="" className={s.mech} aria-hidden="true">
              <div data-half="top" className={cn(s.half, s.halfTop)}>
                <span data-sh="top" className={s.shade} />
              </div>
              <div data-half="bottom" className={cn(s.half, s.halfBottom)}>
                <span data-sh="cast" className={s.castShade} />
              </div>
              <span className={s.split} />
              <div data-flap="" className={s.flap}>
                <div data-half="front" className={s.flapFront}>
                  <span data-sh="front" className={s.shade} />
                </div>
                <div data-half="back" className={s.flapBack}>
                  <span data-sh="back" className={s.shade} />
                </div>
              </div>
            </div>
          </div>
          <CardBack card={card} />
        </div>
        <span data-ring="" className={s.ring} />
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------- cta */

/**
 * "Get started" (hero-rev14): MetalButton at the frame's 201×66 (hero.module.css .cta), its 3px ring
 * and 14px radius in the text column's unit like everything else. The ring takes those in CSS px,
 * so they are read from --tu before the first paint (a return to Home mounts the ring at once, from
 * its cache) and re-read when the row resizes (u follows the window). No halo: the frame shows none.
 */
function HeroCta() {
  const ref = useRef<HTMLDivElement>(null);
  const [tu, setTu] = useState(16);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const v = parseFloat(getComputedStyle(el).getPropertyValue("--tu"));
      if (v > 0) setTu(v);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn(s.ctaRow, s.rise)} style={{ "--d": "0.5s" } as React.CSSProperties}>
      {/* The liquid-metal ring (metal-button.tsx), worn here, on the 404 and on the closing band. */}
      <MetalButton href={GET_STARTED_URL} className={s.cta} metal={{ ringPx: tu * 0.1875, radius: tu * 0.875, glow: false }}>
        Get started
        <ArrowRight aria-hidden="true" className={s.ctaIcon} />
      </MetalButton>
    </div>
  );
}

/* ------------------------------------------------------------------ board */

export interface HeroBoardProps {
  glyphs: GlyphMap;
  strip?: ReactNode;
  /** Byte size of each hero loop (`card.video` → bytes), measured on the server (video-bytes.ts). */
  videoBytes?: Record<string, number>;
}

export function HeroBoard({ glyphs, strip, videoBytes }: HeroBoardProps) {
  // The lead poster is the desktop LCP: fetch it first there. Below 1024px the board sits
  // under the fold, so the lead is an ordinary image (no media match, no high priority).
  // Same srcset and sizes as its <img>, so React folds the image's own preload into this one.
  preload(FIRST[0].poster, {
    as: "image",
    imageSrcSet: heroPosterSrcSet(FIRST[0].poster),
    imageSizes: HERO_POSTER_SIZES,
    fetchPriority: "high",
    media: "(min-width: 1024px)",
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLFormElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const connRef = useRef<SVGSVGElement>(null);
  const engineRef = useRef<HeroEngine | null>(null);
  const indexRef = useRef(0);

  const [synth] = useState(() => new FlapSynth());
  useFlapSound(synth);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState(false);
  /** True while the box holds the untouched example that focus inserted (it wraps balanced, like the overlay). */
  const [pristine, setPristine] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [paused, setPausedState] = useState(false);
  const pausedRef = useRef(false);
  /** Set once the visitor uses Pause/Resume; until then reduced motion holds the board by default. */
  const pauseChosenRef = useRef(false);
  const exampleAtFocus = useRef("");
  const serverHtml = useServerHtml();

  /* Engine lifetime: one per motion preference (matchMedia reverts on change). */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ ok: MOTION_OK, reduced: MOTION_REDUCED }, (ctx) => {
        const root = rootRef.current;
        const board = boardRef.current;
        const stack = stackRef.current;
        const box = boxRef.current;
        const svg = connRef.current;
        if (!root || !board || !stack || !box) return;
        const pick = <T extends Element>(sel: string) => svg?.querySelector<T>(sel) ?? null;
        const connector =
          svg && pick("[data-c=base]")
            ? {
                svg,
                base: pick<SVGPathElement>("[data-c=base]")!,
                beam: pick<SVGPathElement>("[data-c=beam]")!,
                orbPos: pick<SVGGElement>("[data-c=orbPos]")!,
                orb: pick<SVGGElement>("[data-c=orb]")!,
                clip: pick<SVGRectElement>("[data-c=clip]")!,
              }
            : null;
        const reduced = !!ctx.conditions?.reduced;
        // Build the engine in its own task, right after hydration, instead of inside the
        // hydration commit: its set-up (cloning the flap halves, painting, measuring) is the
        // largest piece of work on load, and phones count every long task. The board is
        // already placed by the pre-paint script and the intro waits 0.35s, so nothing moves.
        let engine: HeroEngine | null = null;
        let cancelled = false;
        const boot = () => {
          if (cancelled) return;
          ctx.add(() => {
            const e = new HeroEngine(
              {
                root,
                board,
                promptStack: stack,
                promptBox: box,
                progressRing: ringRef.current,
                connector,
                glyphs,
                synth,
                reduced,
                startIndex: indexRef.current,
                videoBytes,
                onIndex: (i) => {
                  indexRef.current = i;
                  setIndex(i);
                },
              },
              LAYER_CLASSES,
            );
            // Reduced motion: the prompt and board hold still on the current set until the visitor
            // presses Resume (which opts in to the crossfade). Their own choice always wins.
            if (!pauseChosenRef.current && pausedRef.current !== reduced) {
              pausedRef.current = reduced;
              setPausedState(reduced);
            }
            engineRef.current = e;
            e.start();
            // Dev-only QA handle (slow motion: __chHero.gsap.globalTimeline.timeScale(0.1)).
            if (process.env.NODE_ENV !== "production") {
              (window as unknown as { __chHero?: unknown }).__chHero = { engine: e, gsap };
            }
            // Keep pause reasons that outlive a re-creation.
            if (document.activeElement === taRef.current) e.setPaused("focus", true);
            if (pausedRef.current) e.setUserPaused(true);
            engine = e;
          });
        };
        const w = window as Window & {
          requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
          cancelIdleCallback?: (id: number) => void;
        };
        const idleId = w.requestIdleCallback ? w.requestIdleCallback(boot, { timeout: 250 }) : window.setTimeout(boot, 16);
        return () => {
          cancelled = true;
          if (w.cancelIdleCallback) w.cancelIdleCallback(idleId);
          else window.clearTimeout(idleId);
          engine?.destroy();
          if (engineRef.current === engine) engineRef.current = null;
        };
      });
    },
    { scope: rootRef },
  );

  /* Card handlers (stable through a ref so memoised slots never re-render). */
  const handlers = useRef<SlotHandlers>({
    turn: (i, on) => engineRef.current?.turn(i, on),
    toggle: (i) => engineRef.current?.toggle(i),
    move: (from, dir) => {
      const board = boardRef.current;
      if (!board) return;
      const order = COLUMNS.flat()
        .map((i) => board.querySelector<HTMLElement>(`[data-slot="${i}"]`))
        .filter((el): el is HTMLElement => !!el && el.offsetParent !== null);
      const at = order.findIndex((el) => Number(el.dataset.slot) === from);
      const next = order[(at + dir + order.length) % order.length];
      if (!next) return;
      setActiveSlot(Number(next.dataset.slot));
      next.querySelector<HTMLElement>("[data-hit]")?.focus();
    },
  });

  /* Rotation controls */
  const togglePaused = useCallback(() => {
    const next = !pausedRef.current;
    pauseChosenRef.current = true;
    pausedRef.current = next;
    setPausedState(next);
    engineRef.current?.setUserPaused(next);
  }, []);

  /* Left / Right (and Home / End) on the pause button switch examples (the former pager's job). */
  const onExampleKey = useCallback((e: KeyboardEvent) => {
    const n = PROMPT_SETS.length;
    const at = indexRef.current;
    const to =
      e.key === "ArrowRight" ? (at + 1) % n : e.key === "ArrowLeft" ? (at - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    engineRef.current?.goTo(to);
  }, []);

  /* Prompt box */
  const currentPrompt = PROMPT_SETS[index].prompt;

  /* Last input modality on the page, so the box can tell a click into the field from a Tab into it
     (a textarea matches :focus-visible either way). */
  const lastInput = useRef<"pointer" | "key">("key");
  useEffect(() => {
    const pointer = () => {
      lastInput.current = "pointer";
    };
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key.length > 1 || e.key === " ") lastInput.current = "key";
    };
    window.addEventListener("pointerdown", pointer, { capture: true, passive: true });
    window.addEventListener("keydown", key, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", pointer, { capture: true });
      window.removeEventListener("keydown", key, { capture: true });
    };
  }, []);

  const onFocus = useCallback(() => {
    boxRef.current?.setAttribute("data-focus", lastInput.current);
    setEditing(true);
    engineRef.current?.setPaused("focus", true);
    if (!value) {
      const example = PROMPT_SETS[engineRef.current?.current ?? indexRef.current].prompt;
      exampleAtFocus.current = example;
      setValue(example);
      setPristine(true);
      // Select the example: type to replace it, or press Enter to run it.
      requestAnimationFrame(() => {
        const ta = taRef.current;
        if (ta && document.activeElement === ta) ta.select();
      });
    }
  }, [value]);

  const onBlur = useCallback(() => {
    boxRef.current?.removeAttribute("data-focus");
    setEditing(false);
    setPristine(false);
    engineRef.current?.setPaused("focus", false);
    const untouched = !value.trim() || value === exampleAtFocus.current;
    if (untouched) setValue("");
    engineRef.current?.setPaused("typed", !untouched);
  }, [value]);

  const submit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const q = (value.trim() || PROMPT_SETS[indexRef.current].prompt).slice(0, 500);
      const url = new URL(GET_STARTED_URL);
      url.searchParams.set("q", q);
      window.location.assign(url.toString());
    },
    [value],
  );

  return (
    <div ref={rootRef} className={cn("relative flex flex-col lg:min-h-svh", s.root)}>
      <ChartDefs />

      {/* ------------------------------------------------ text column */}
      {/* From 1024px the column is a three-row grid (1fr · auto · 1fr, hero.module.css .textInner):
          the prompt box is the middle row, so its centre sits on the hero's centre line whatever
          the heights of the groups above (the H1) and below it (offer, subtitle, CTA) (hero-rev3 A).
          The board's lead card is placed on the same line (engine.ts layout). Every size is the
          owner's 1080p frame in the column's unit, --tu (hero-rev14). */}
      <div className={cn("flex flex-1 items-center pt-[88px] lg:items-stretch lg:pt-0", s.textCol)}>
        <div className={cn("w-full max-w-[640px] py-6 lg:max-w-none lg:py-0", s.textInner)}>
          <div className={s.textTop}>
            {/* Three fixed lines. The {" "} text nodes between the line masks give the heading real
                word breaks ("Search & analyze viral social videos" for search engines and screen
                readers); they sit between block boxes, so they render nothing. "viral" keeps a real
                DOM word under its shader canvas (liquid-ramp.tsx), held by the pause control. */}
            <h1 className={cn("text-ink", s.h1)}>
              <span className={s.lineMask}>
                <span className={s.lineInner} style={{ "--d": "0.05s" } as React.CSSProperties}>
                  Search &amp;
                </span>
              </span>{" "}
              <span className={cn(s.lineMask, s.lineMaskViral)}>
                <span className={s.lineInner} style={{ "--d": "0.13s" } as React.CSSProperties}>
                  analyze{" "}
                  <LiquidRampText params={VIRAL} paused={paused} className={s.viral}>
                    viral
                  </LiquidRampText>
                </span>
              </span>{" "}
              <span className={s.lineMask}>
                <span className={s.lineInner} style={{ "--d": "0.21s" } as React.CSSProperties}>
                  social videos
                </span>
              </span>
            </h1>
          </div>

          {/* Prompt box (sizes, shadow and focus states: hero.module.css .promptBox) */}
          <form
            ref={boxRef}
            action={GET_STARTED_URL}
            method="get"
            onSubmit={submit}
            className={cn("group/box relative", s.promptBox, s.riseT)}
            style={{ "--d": "0.28s" } as React.CSSProperties}
          >
            <label htmlFor="hero-q" className="sr-only">
              Describe the videos you want to find
            </label>
            <div className={s.promptArea}>
              <div className="relative">
                <div
                  ref={stackRef}
                  aria-hidden="true"
                  className={cn(s.promptStack, "transition-opacity duration-150", (editing || value) && "opacity-0")}
                  dangerouslySetInnerHTML={INITIAL_LAYER}
                />
                <textarea
                  ref={taRef}
                  id="hero-q"
                  name="q"
                  rows={2}
                  value={value}
                  spellCheck={false}
                  autoComplete="off"
                  maxLength={500}
                  aria-describedby="hero-offer hero-mode hero-q-example"
                  data-typed={value ? "" : undefined}
                  data-example={pristine ? "" : undefined}
                  className={s.textarea}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setPristine(false);
                  }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
              </div>
            </div>
            <p id="hero-q-example" className="sr-only" aria-live="off">
              Example prompt: {currentPrompt}
            </p>

            <div className={s.controls}>
              {/* Deep Search (hero-rev14): an icon-only chip on the liquid-ramp fill, always on and not a
                  control (hero-rev4: no role of a button, no tab stop, no hover change, no tap cue
                  from the delegated sound bindings). An image named "Deep Search", with what the
                  free search holds as its tooltip and description; the textarea's description
                  (#hero-mode) names the mode for screen readers. */}
              <span role="img" aria-label="Deep Search" title={DEEP_HINT} className={s.deepChip}>
                <LiquidRampFill params={DEEP_SEARCH_CHIP} paused={paused} />
                <Brain aria-hidden="true" className={cn("relative", s.ctlIcon)} strokeWidth={2} />
              </span>
              <span id="hero-mode" className="sr-only">
                Deep Search mode
              </span>

              <div className={s.ctlGroup}>
                <div
                  className={cn(
                    "flex items-center transition-opacity duration-200",
                    editing && "pointer-events-none opacity-0",
                  )}
                >
                  {/* Stop / resume the 6 s rotation (prompts, board, loops and the shaders). WCAG 2.2.2.
                      The ring fills with the real cycle clock and freezes with it (engine.ts renderRing). */}
                  <button
                    type="button"
                    tabIndex={editing ? -1 : 0}
                    aria-label={paused ? "Resume example rotation" : "Pause example rotation"}
                    aria-describedby="hero-example-pos"
                    title={paused ? "Resume" : "Pause"}
                    onClick={togglePaused}
                    onKeyDown={onExampleKey}
                    className={cn(
                      "relative grid place-items-center rounded-full text-ink/62 outline-offset-[3px] focus-visible:outline-2 focus-visible:outline-ink transition-[background-color,color,scale] duration-200 ease-out before:absolute before:-inset-1 before:content-[''] hover:bg-surface hover:text-ink active:scale-[0.96]",
                      s.pauseBtn,
                    )}
                  >
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32" className={s.cycleRing}>
                      <circle cx={16} cy={16} r={15} className={s.cycleTrack} />
                      <circle ref={ringRef} cx={16} cy={16} r={15} pathLength={1} className={s.cycleFill} />
                    </svg>
                    <Pause
                      aria-hidden="true"
                      className={cn("absolute transition-[opacity,scale,filter] duration-300 ease-out", s.ctlIcon, paused ? "scale-25 opacity-0 blur-[4px]" : "opacity-100")}
                      strokeWidth={2.4}
                    />
                    <Play
                      aria-hidden="true"
                      className={cn("absolute transition-[opacity,scale,filter] duration-300 ease-out", s.ctlIcon, s.playIcon, paused ? "opacity-100" : "scale-25 opacity-0 blur-[4px]")}
                      strokeWidth={2.4}
                    />
                  </button>
                  <span id="hero-example-pos" className="sr-only">
                    Example {index + 1} of {PROMPT_SETS.length}. Left and Right arrow keys switch examples.
                  </span>
                </div>
                <span
                  aria-hidden={!editing}
                  className={cn(
                    "pointer-events-none absolute flex items-center whitespace-nowrap font-mono uppercase tracking-[0.04em] text-muted transition-opacity duration-200",
                    s.typeHint,
                    editing ? "opacity-100" : "opacity-0",
                  )}
                >
                  <CornerDownLeft strokeWidth={2.2} />
                  {DEEP_HINT}
                </span>
                <button
                  type="submit"
                  aria-label="Try your niche"
                  title="Try your niche"
                  className={cn(
                    "grid shrink-0 place-items-center rounded-full bg-ink text-paper transition-[background-color,scale] duration-200 ease-out hover:bg-ink-2 active:scale-[0.96]",
                    s.submitBtn,
                  )}
                >
                  <ArrowRight className={s.submitIcon} strokeWidth={2} />
                </button>
              </div>
            </div>
          </form>

          <div className={s.textBottom}>
            {/* The offer (hero-rev14): one line under the prompt box, from its corner's end (hero.module.css
                .offer). It is the textarea's description (#hero-offer, aria-describedby). "try it now" is a
                real button for that box: focusing the textarea runs the box's own focus behaviour
                (rotation pauses, the example is inserted and selected). preventScroll: the box is right
                above. Text in the same face, no pill. */}
            <p id="hero-offer" className={cn(s.riseT, s.offer)} style={{ "--d": "0.34s" } as React.CSSProperties}>
              First search is free,{" "}
              <button
                type="button"
                aria-label="Try it now: focus the prompt"
                onClick={() => taRef.current?.focus({ preventScroll: true })}
                className={s.offerCta}
              >
                try it now
              </button>
              .
            </p>

            {/* The subtitle (hero-rev14): the owner's three lines (hero.module.css .sub). Two no-wrap
                segments and a last line of its own keep exactly three lines from 1024px; below it the
                words wrap naturally, each chip staying with the word that introduces it. */}
            <p className={cn(s.riseT, s.sub)} style={{ "--d": "0.4s" } as React.CSSProperties}>
              <span className={s.subSeg}>
                Claim your superpower. Search{" "}
                <span className="whitespace-nowrap">
                  through <CountChip {...HERO_STATS.platforms} />
                </span>
              </span>{" "}
              <span className={s.subSeg}>
                <span className="whitespace-nowrap">
                  over <CountChip {...HERO_STATS.niches} delay={0.1} />
                </span>{" "}
                <span className="whitespace-nowrap">
                  and <CountChip {...HERO_STATS.videos} delay={0.2} />
                </span>{" "}
                updated daily.
              </span>{" "}
              <span className={s.subLine}>
                Save around <CountChip {...HERO_STATS.hours} delay={0.3} /> every week.
              </span>
            </p>

            <HeroCta />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ connector */}
      <svg ref={connRef} className={s.connector} aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="ch-hero-orb">
            <stop offset="0%" style={{ stopColor: "var(--accent)", stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
          </radialGradient>
          {/* The pulse's glow is clipped to the run between the box's right edge and the card's edge
              (the engine sizes this rect), so it never paints over either. */}
          <clipPath id="ch-hero-run">
            <rect data-c="clip" />
          </clipPath>
        </defs>
        {/* No port dots: the line begins on the prompt box's right edge and ends on the lead
            card's left edge (engine.ts layout), a clean butt joint at both ends. */}
        <path data-c="base" className="fill-none stroke-ink/25" strokeWidth={1} />
        <path data-c="beam" className="fill-none stroke-accent" strokeWidth={1.5} opacity={0} />
        <g clipPath="url(#ch-hero-run)">
          <g data-c="orbPos">
            <g data-c="orb" opacity={0}>
              <circle r={12} fill="url(#ch-hero-orb)" />
              <circle r={3.4} className="fill-accent" />
              <circle r={1.4} className="fill-white" />
            </g>
          </g>
        </g>
      </svg>

      {/* ------------------------------------------------ board */}
      {/* Visible from the first paint, already lined up with the prompt box (engine.ts
          prePaintPlacementScript): the lead poster is the LCP, and hydration moves nothing.
          Without scripts the board simply sits at its natural height. */}
      {serverHtml ? <script dangerouslySetInnerHTML={PLACEMENT_SCRIPT} /> : null}
      <div
        ref={boardRef}
        role="group"
        aria-label="Example results for the prompt above, ranked by search score. Arrow keys move between cards; Enter turns a card to show why it scored."
        className={cn(s.stage, s.board, s.riseSlow)}
      >
        <div data-columns="" className={s.columns}>
          {COLUMNS.map((col, ci) => (
            <div key={ci} className={s.col}>
              {ci === 0 && (
                <p className={s.hint} aria-hidden="true">
                  <span className={s.hintHover}>Hover me</span>
                  <span className={s.hintTouch}>Tap me</span>
                  <svg className={s.hintArrow} viewBox="0 0 16 16" focusable="false">
                    <path d="M8 2v10M3.5 8.5 8 13l4.5-4.5" />
                  </svg>
                </p>
              )}
              {col.map((i) => (
                <Slot key={i} i={i} glyphs={glyphs} tabbable={activeSlot === i} handlers={handlers} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {strip && <div className="relative lg:absolute lg:inset-x-0 lg:bottom-0">{strip}</div>}
    </div>
  );
}
