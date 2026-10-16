"use client";

/**
 * HeroBoard — the interactive hero: text column (H1, prompt box with
 * mode chips and the pause control, whose ring shows the cycle clock; subtext
 * chips, CTAs, sound toggle), the triangular split-flap board (plus one or two
 * static columns on wide windows) and the connector beam. Structure renders once;
 * the HeroEngine animates it.
 *
 * Props: `glyphs` (platform → 24×24 SVG path, from icons.ts on the server) and
 * `strip` (the platforms strip, rendered by the server component).
 */
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { preload } from "react-dom";
import { ArrowDown, ArrowRight, CornerDownLeft, Pause, Play, ScanSearch, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { GET_STARTED_URL } from "@/lib/links";
import { MOTION_OK, MOTION_REDUCED } from "@/lib/motion";
import { CardBack, ChartDefs, Face } from "./card-parts";
import { CountChip } from "./count-chip";
import {
  BOARD_CARDS,
  COLUMNS,
  COMPACT_SLOT_COUNT,
  HERO_POSTER_SIZES,
  HERO_STATS,
  PROMPT_SETS,
  STATIC_COLUMNS,
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
 * it), so it is shown as a toggle already switched on and does nothing: a styled span, not a
 * control (hero-rev4). Submit always goes to GET_STARTED_URL?q=<prompt>.
 */
const DEEP_HINT = "500 videos · < 5 min";

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
              <Face
                card={card}
                glyphs={glyphs}
                eager
                responsive
                wideOnly={i >= COMPACT_SLOT_COUNT}
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
  const sound = useFlapSound(synth);
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
    <div ref={rootRef} className={cn("relative flex flex-col lg:min-h-[max(100svh,680px)]", s.root)}>
      <ChartDefs />

      {/* ------------------------------------------------ text column */}
      {/* From 1024px the column is a three-row grid (1fr · auto · 1fr, hero.module.css .textInner):
          the prompt box is the middle row, so its centre sits on the hero's centre line whatever
          the heights of the groups above and below it (hero-rev3 A). The board's lead card is
          placed on the same line (engine.ts layout). */}
      <div className={cn("flex flex-1 items-center pt-[88px] lg:items-stretch lg:pt-0", s.textCol)}>
        <div className={cn("w-full max-w-[640px] py-6 lg:max-w-none lg:py-0", s.textInner)}>
          <div className={s.textTop}>
            {/* The {" "} text nodes between the line masks give the heading real word breaks
                ("Search & analyze viral social videos" for search engines and screen readers). They
                sit between block boxes, so they render nothing. */}
            <h1 className={cn("text-ink", s.h1)}>
              <span className={s.lineMask}>
                <span className={s.lineInner} style={{ "--d": "0.05s" } as React.CSSProperties}>
                  Search &amp;
                </span>
              </span>{" "}
              <span className={s.lineMask}>
                <span className={s.lineInner} style={{ "--d": "0.13s" } as React.CSSProperties}>
                  analyze{" "}
                  <Emphasis scale={1.1} weight={500} className={s.viral}>
                    viral
                  </Emphasis>
                </span>
              </span>{" "}
              <span className={s.lineMask}>
                <span className={s.lineInner} style={{ "--d": "0.21s" } as React.CSSProperties}>
                  social videos
                </span>
              </span>
            </h1>

            {/* The offer (hero-rev3 B, OWNER_DECISIONS C18): the prompt box's lead-in, the hook that
                gets a visitor to type their niche. Above body copy, below the H1; never a badge. */}
            <p
              id="hero-offer"
              className={cn("text-ink", s.offer, s.riseT)}
              style={{ "--d": "0.24s" } as React.CSSProperties}
            >
              <span>
                Your first Deep Search is <span className={s.offerOnUs}>on us.</span>
              </span>
              {/* "Try it" (hero-rev8): a real affordance for the prompt box below it. Focusing the
                  textarea runs the box's own focus behaviour (rotation pauses, the example is
                  inserted and selected). preventScroll: the box is right there. */}
              <button
                type="button"
                aria-label="Try it: focus the prompt"
                onClick={() => taRef.current?.focus({ preventScroll: true })}
                className={s.offerCta}
              >
                Try it
                <ArrowDown aria-hidden="true" className={s.offerArrow} strokeWidth={2.2} />
              </button>
            </p>
          </div>

          {/* Prompt box */}
          <form
            ref={boxRef}
            action={GET_STARTED_URL}
            method="get"
            onSubmit={submit}
            className={cn(
              "group/box relative rounded-[16px] bg-paper px-4 pb-3 pt-3.5 transition-shadow duration-300 ease-out",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]",
              // Neutral active state (no blue): a firmer 1px ink ring and a deeper, softer lift. A click
              // keeps it quiet; keyboard arrival (data-focus="key", set in onFocus) adds a clear ink ring
              // (about 5:1 on the white box) so the field stays findable without a coloured outline.
              "focus-within:shadow-[0_0_0_1px_rgba(15,15,15,0.18),0_2px_4px_rgba(0,0,0,0.05),0_16px_40px_-4px_rgba(0,0,0,0.11)]",
              "data-[focus=key]:focus-within:shadow-[0_0_0_1px_rgba(15,15,15,0.7),0_0_0_4px_rgba(15,15,15,0.09),0_2px_4px_rgba(0,0,0,0.05),0_16px_40px_-4px_rgba(0,0,0,0.11)]",
              s.promptBox,
              s.riseT,
            )}
            style={{ "--d": "0.28s" } as React.CSSProperties}
          >
            <label htmlFor="hero-q" className="sr-only">
              Describe the videos you want to find
            </label>
            <div className="relative text-[16px] leading-[1.45] tracking-[-0.01em] text-ink md:text-[17px]">
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
            <p id="hero-q-example" className="sr-only" aria-live="off">
              Example prompt: {currentPrompt}
            </p>

            {/* The row must fit the narrowest prompt box (≈ 248px inside at 320px, 368px at 1024px):
                the chip's icon steps aside where the text column is tightest. */}
            <div className="mt-3 flex min-w-0 items-center gap-2">
              {/* Deep Search: a toggle shown switched ON that does nothing (hero-rev4). A span, not a
                  button: no role, no tab stop, no hover change, no tap cue from the delegated sound
                  bindings. Same look as the Deep Research chip in the How it works composer. Screen
                  readers get the mode once, through the textarea's description (#hero-mode). */}
              <span
                aria-hidden="true"
                className="inline-flex h-8 min-w-0 cursor-default select-none items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-accent/10 px-2.5 text-[12.5px] font-semibold tracking-[-0.005em] text-accent"
              >
                <ScanSearch className="size-3.5 max-[359px]:hidden lg:max-[1279px]:hidden" strokeWidth={2.2} />
                Deep Search
              </span>
              <span id="hero-mode" className="sr-only">
                Deep Search mode
              </span>

              <div className="relative ml-auto flex h-9 shrink-0 items-center gap-2">
                <div
                  className={cn(
                    "flex items-center transition-opacity duration-200",
                    editing && "pointer-events-none opacity-0",
                  )}
                >
                  {/* Stop / resume the 6 s rotation (prompts, board and loops). WCAG 2.2.2. The ring
                      fills with the real cycle clock and freezes with it (engine.ts renderRing). */}
                  <button
                    type="button"
                    tabIndex={editing ? -1 : 0}
                    aria-label={paused ? "Resume example rotation" : "Pause example rotation"}
                    aria-describedby="hero-example-pos"
                    title={paused ? "Resume" : "Pause"}
                    onClick={togglePaused}
                    onKeyDown={onExampleKey}
                    className="relative grid size-9 place-items-center rounded-full text-ink/62 outline-offset-[3px] focus-visible:outline-2 focus-visible:outline-ink transition-[background-color,color,scale] duration-200 ease-out before:absolute before:-inset-1 before:content-[''] hover:bg-surface hover:text-ink active:scale-[0.96] sm:size-8"
                  >
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 32 32" className={s.cycleRing}>
                      <circle cx={16} cy={16} r={15} className={s.cycleTrack} />
                      <circle ref={ringRef} cx={16} cy={16} r={15} pathLength={1} className={s.cycleFill} />
                    </svg>
                    <Pause
                      aria-hidden="true"
                      className={cn("absolute size-3.5 transition-[opacity,scale,filter] duration-300 ease-out", paused ? "scale-25 opacity-0 blur-[4px]" : "opacity-100")}
                      strokeWidth={2.4}
                    />
                    <Play
                      aria-hidden="true"
                      className={cn("absolute size-3.5 translate-x-px transition-[opacity,scale,filter] duration-300 ease-out", paused ? "opacity-100" : "scale-25 opacity-0 blur-[4px]")}
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
                    "pointer-events-none absolute right-11 flex items-center gap-1.5 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted transition-opacity duration-200",
                    editing ? "opacity-100" : "opacity-0",
                  )}
                >
                  <CornerDownLeft className="size-3" strokeWidth={2.2} />
                  {DEEP_HINT}
                </span>
                <button
                  type="submit"
                  aria-label="Try your niche"
                  title="Try your niche"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-paper transition-[background-color,scale] duration-200 ease-out hover:bg-ink-2 active:scale-[0.96]"
                >
                  <ArrowRight className="size-4" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </form>

          <div className={s.textBottom}>
            <p
              className={cn("body-l mt-[var(--gap-y)] max-w-[34rem] text-ink-2 [text-wrap:pretty]", s.riseT, s.sub)}
              style={{ "--d": "0.4s" } as React.CSSProperties}
            >
              Search through <CountChip {...HERO_STATS.platforms} /> across{" "}
              <CountChip {...HERO_STATS.niches} delay={0.1} /> and over <CountChip {...HERO_STATS.videos} delay={0.2} />{" "}
              updated daily.
            </p>

            <div
              className={cn("mt-[var(--cta-gap)] flex flex-wrap items-center gap-x-4 gap-y-3", s.rise)}
              style={{ "--d": "0.5s" } as React.CSSProperties}
            >
              <Button href={GET_STARTED_URL} size="lg" className="pr-6">
                Get started
                <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover/button:translate-x-0.5" />
              </Button>
              {/* The site-wide sound setting (the navbar toggle shows the same state). The name is the
                  visible word "Sound"; aria-pressed and the icon carry on/off (WCAG 2.5.3). */}
              <button
                type="button"
                aria-pressed={sound.on}
                title={sound.on ? "Sound on" : "Sound off"}
                onClick={sound.toggle}
                className="group inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-ink/62 transition-[background-color,color] duration-200 ease-out hover:bg-surface hover:text-ink"
              >
                <span className="relative grid size-4 place-items-center">
                  <VolumeX
                    aria-hidden="true"
                    className={cn("absolute size-4 transition-[opacity,scale,filter] duration-300", sound.on ? "scale-25 opacity-0 blur-[4px]" : "opacity-100")}
                  />
                  <Volume2
                    aria-hidden="true"
                    className={cn("absolute size-4 text-ink transition-[opacity,scale,filter] duration-300", sound.on ? "opacity-100" : "scale-25 opacity-0 blur-[4px]")}
                  />
                </span>
                {/* Visually hidden (not removed) where the CTA row is tight, so the name never goes empty. */}
                <span className="lg:max-[1279px]:sr-only">Sound</span>
              </button>
            </div>
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
          {/* The pulse's glow is clipped to the run between the box's border and the card's edge
              (the engine sizes this rect), so it never paints over either. */}
          <clipPath id="ch-hero-run">
            <rect data-c="clip" />
          </clipPath>
        </defs>
        {/* No port dots: the line begins on the prompt box's outer border and ends on the lead
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
            <div key={ci} className={cn(s.col, ci === 3 && s.colWide)}>
              {ci === 0 && (
                <p className={s.hint} aria-hidden="true">
                  <span className={s.hintHover}>Hover a card</span>
                  <span className={s.hintTouch}>Tap a card</span> to see why it scored
                </p>
              )}
              {col.map((i) => (
                <Slot key={i} i={i} glyphs={glyphs} tabbable={activeSlot === i} handlers={handlers} />
              ))}
            </div>
          ))}
          {/* Wide windows only (hero.module.css .colStatic): the lowest tier, posters only, one column
              from 21:20 stages and a second from 7:5. These cards sit outside the engine, so they
              never flap, tick or turn. */}
          {STATIC_COLUMNS.map((cards, ci) => (
            <div key={ci} className={cn(s.col, ci === 0 ? s.colStatic : s.colStatic2)} aria-hidden="true">
              {cards.map((card) => (
                <div key={card.rank} className={cn(s.slot, s.slotStatic)}>
                  <Face card={card} glyphs={glyphs} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {strip && <div className="relative lg:absolute lg:inset-x-0 lg:bottom-0">{strip}</div>}
    </div>
  );
}
