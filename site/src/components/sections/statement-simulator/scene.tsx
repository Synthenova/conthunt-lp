"use client";

/**
 * StatementSimulatorScene: the page's one pinned scroll-jack (PLAN §2 Motion).
 *
 * Desktop and tablet with motion (>= 768px), one ScrollTrigger timeline, pinned on an inner stage
 * (never on the <section data-section>, so the Rails keep their direct children):
 *   0.0 - 3.6   words light up 15% -> 100% in reading order; each chip scales 0.6 -> 1 with a
 *               small rotate as its neighbour lights up. The clip-credit hint fades in at the end.
 *   4.2 - 6.8   Flip: the statement lines re-flow from the centred giant text into a left-aligned
 *               headline at 0.8x (J7ZHKO). The simulator swings in from the right edge and parks
 *               about half visible (36-56%, a fixed gap right of the headline) at about the old
 *               letterbox size (0.92 of it), rotateY -6deg.
 *   6.8 - 10.0  the simulator slides left to the centre, straightens and grows into the full-size
 *               frame (zooming into the app); the headline exits left.
 *   9.0 - 10.4  the slim row above the frame (eyebrow, run caption, Full Control, Get started)
 *               rises in; the frame becomes interactive at LIVE_T and the pin holds it until
 *               TIMELINE_T.
 * Landed geometry (OWNER_DECISIONS D5, docs/revamp/sections/simulator-fullsize.md): the frame is
 * `--sim-full-w` wide (globals.css; Full Control opens larger, at 90% of the viewport), centred under a 44px
 * row. It is the one element below the hero that leaves the 60vw letterbox. Layout always holds the landed
 * geometry; every earlier state is a transform of it (x, y, scale, rotateY).
 * While the landed frame owns the screen, `data-immersive` on <html> slides the navbar away
 * (globals.css); it comes back as soon as the scene unpins in either direction.
 * Until it lands the simulator is `inert` (no off-screen tab stops); a "Skip to the live demo"
 * control is the section's only tab stop and jumps to the landed state. "Full Control" (from
 * 1024px) opens the same simulator in a modal dialog (./simulator/full-view.tsx); its Close / Esc is
 * the way back to the page.
 * Phones: no pin, scrubbed word reveal, then the simulator fades and slides up (letterbox width).
 * Reduced motion: no pin, no scrub, everything static (CSS final states, the same full-size frame).
 */
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Flip } from "@/lib/gsap-flip";
import { posterStyle, useManagedVideo } from "@/lib/media";
import { useLenis } from "@/components/layout/smooth-scroll";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { GET_STARTED_URL } from "@/lib/links";
import { cn } from "@/lib/cn";
import type { DeepSearchSimulatorProps, SimDeepSearch } from "@/content/simulator/types";
import { formatCount, PLATFORM_LABEL, workerElapsed } from "./simulator/format";
import { PlatformIcon } from "./simulator/platform-icon";
import { DeepSearchSimulator } from "./simulator";
import { FullControlButton } from "./simulator/full-view";
import { useRuns } from "./simulator/runs";
import { buildStatement, statementText } from "./statement-copy";
import styles from "./scene.module.css";

export interface StatementChip {
  n: number;
  label: string;
  creator: string;
  views: number;
  video: string;
  poster: string;
  platform: string;
  caption?: string;
}

export interface StatementSimulatorSceneProps {
  simulator: DeepSearchSimulatorProps;
  chips: StatementChip[];
  /** Eyebrow index and total, `[ 01 / 08 ] · DEEP SEARCH`. */
  index?: number;
  total?: number;
}

const DESKTOP = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
const MOBILE = "(max-width: 767px) and (prefers-reduced-motion: no-preference)";
/** The pinned timeline's length in timeline seconds (the last 0.5 holds the landed frame). */
const TIMELINE_T = 10.9;
/** Timeline time at which the frame has landed and becomes interactive. */
const LIVE_T = 10.05;
/** Progress at which the frame has landed and becomes interactive. */
const LIVE_AT = LIVE_T / TIMELINE_T;
/** From here on the growing frame and the row reach the navbar's band, so the navbar steps aside. */
const IMMERSIVE_AT = 8.6 / TIMELINE_T;

function Chip({ chip, onHover }: { chip: StatementChip; onHover: (n: number | null) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useManagedVideo(ref, { priority: 1 });
  return (
    <span
      data-token="chip"
      className={styles.chip}
      onPointerEnter={() => onHover(chip.n)}
      onPointerLeave={() => onHover(null)}
    >
      <span className={styles.chipLift}>
        <span data-chip-inner className={styles.chipInner}>
          <video
            ref={ref}
            src={chip.video}
            style={posterStyle(chip.poster)}
            muted
            playsInline
            loop
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden
          />
        </span>
      </span>
    </span>
  );
}

/**
 * Credit line under the statement: names the hovered clip's source (statement-chips.json). It sits
 * outside the text, so it never covers a word or a clip. Hover-capable devices get a quiet hint.
 * Every part stays >= 4.5:1 on the page background (11px mono).
 */
function ChipCredit({ chip, ref }: { chip: StatementChip | null; ref: RefObject<HTMLParagraphElement | null> }) {
  const platform = chip ? (["tiktok", "instagram", "youtube"] as const).find((p) => p === chip.platform) : undefined;
  return (
    <p ref={ref} aria-hidden className={styles.credit}>
      {chip ? (
        <span key={chip.n} className={styles.creditInner}>
          <span className="text-ink-2/75">{chip.label}</span>
          <span className="text-ink-2/75">/</span>
          {platform ? <PlatformIcon platform={platform} size={11} className="text-ink-2" /> : null}
          <span className="text-ink-2">{chip.creator}</span>
          <span className="text-ink-2/75">/</span>
          <span className="text-ink-2/75">
            {formatCount(chip.views)} views{platform ? ` on ${PLATFORM_LABEL[platform]}` : ""}
          </span>
        </span>
      ) : (
        <span key="hint" className={styles.creditHint}>
          Hover a clip to see its source
        </span>
      )}
    </p>
  );
}

/**
 * "In action. Real Deep Search results added. 300 videos watched and ranked in 17m 38s." for the tab on screen:
 * the count (the run's approved budget) and time (its worker's elapsed) follow the active search, so the caption
 * never contradicts the transcript.
 * Subscribes to tab changes itself, so a tab switch re-renders only this line.
 */
function RunCaption({
  searches,
  initialId,
  subscribe,
  className,
}: {
  searches: SimDeepSearch[];
  initialId?: string;
  subscribe: (listener: (id: string) => void) => () => void;
  className?: string;
}) {
  const [id, setId] = useState(initialId);
  useEffect(() => subscribe(setId), [subscribe]);
  const run = searches.find((s) => s.id === id) ?? searches[0];
  const videos = run?.approved_budget.videos ?? 500;
  const elapsed = run ? workerElapsed(run.messages) : null;
  return (
    <p className={cn("min-w-0 font-medium tracking-[-0.012em] text-ink", className)}>
      <span className="font-semibold">In action.</span>{" "}
      <span className="text-muted">
        Real Deep Search results added. {videos} videos watched and ranked{elapsed ? ` in ${elapsed}` : ""}.
      </span>
    </p>
  );
}

export function StatementSimulatorScene({ simulator, chips, index = 1, total = 8 }: StatementSimulatorSceneProps) {
  // Tabs loaded on demand, as the simulator sees them (the caption follows them).
  const runs = useRuns(simulator.searches);
  const lines = buildStatement();
  const chipByN = new Map(chips.map((c) => [c.n, c]));

  const stageRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const creditRef = useRef<HTMLParagraphElement>(null);
  const simInnerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const pendingFocus = useRef(false);
  const liveRef = useRef(true);
  const [live, setLive] = useState(true);
  const [hoverChip, setHoverChip] = useState<number | null>(null);
  const [version, setVersion] = useState(0);
  const lenis = useLenis();

  // The inline simulator never re-renders for scene state (chip hovers, the live flag); the
  // caption listens for tab changes on its own.
  const activeTab = useRef<string | undefined>(undefined);
  const tabListeners = useRef(new Set<(id: string) => void>());
  const onTab = useCallback((id: string) => {
    activeTab.current = id;
    for (const listener of tabListeners.current) listener(id);
  }, []);
  const subscribeTab = useCallback((listener: (id: string) => void) => {
    const listeners = tabListeners.current;
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  const readTab = useCallback(() => activeTab.current, []);
  const sim = useMemo(() => <DeepSearchSimulator {...simulator} onActiveSearchChange={onTab} />, [simulator, onTab]);

  // Rebuild the timeline when the width changes or webfonts land: Flip records word positions.
  useEffect(() => {
    let width = window.innerWidth;
    let t: number | undefined;
    const onResize = () => {
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      window.clearTimeout(t);
      t = window.setTimeout(() => setVersion((v) => v + 1), 220);
    };
    window.addEventListener("resize", onResize);
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) setVersion((v) => v + 1);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // After "Skip to the live demo", focus moves into the frame as soon as it is interactive.
  useEffect(() => {
    if (!live || !pendingFocus.current) return;
    pendingFocus.current = false;
    simInnerRef.current?.querySelector<HTMLElement>('[role="region"]')?.focus({ preventScroll: true });
  }, [live]);

  const skipToDemo = () => {
    const st = triggerRef.current;
    if (!st) return;
    pendingFocus.current = true;
    const target = st.end - 2;
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else window.scrollTo({ top: target });
  };

  useGSAP(
    () => {
      const setLiveOnce = (next: boolean) => {
        if (liveRef.current === next) return;
        liveRef.current = next;
        setLive(next);
      };
      const mm = gsap.matchMedia();

      mm.add(DESKTOP, () => {
        const stage = stageRef.current;
        const statement = statementRef.current;
        const frame = frameRef.current;
        const head = headRef.current;
        const simInner = simInnerRef.current;
        if (!stage || !statement || !frame || !head || !simInner) return;
        const tokenEls = gsap.utils.toArray<HTMLElement>("[data-token]", statement);
        const lineEls = gsap.utils.toArray<HTMLElement>("[data-line]", statement);
        const credit = creditRef.current;
        const html = document.documentElement;
        setLiveOnce(false);

        // Layout holds the landed, full-size frame; every earlier state is a transform of it.
        // Layout values only (offsetLeft/offsetTop ignore transforms), so refreshes mid-scroll stay right.
        const frameLeft = () => simInner.getBoundingClientRect().left;
        const frameWidth = () => frame.offsetWidth;
        // The park size is about the old inline frame: the letterbox (80vw below 1280px, 60vw from
        // there), capped so the old head + frame fit the height, at 0.92.
        const parkWidth = () => {
          const vw = window.innerWidth;
          const letterbox = vw >= 1280 ? vw * 0.6 : vw * 0.8;
          return Math.min(letterbox, (window.innerHeight - 194) * 1.6) * 0.92;
        };
        const parkScale = () => Math.min(1, parkWidth() / Math.max(1, frameWidth()));
        const offRight = () => window.innerWidth - frameLeft() + 48;
        // While it parks and travels the frame is centred on the stage (where the headline sits);
        // it settles into the landed spot under the row as it grows.
        const parkY = () => stage.offsetHeight / 2 - (frame.offsetTop + frame.offsetHeight / 2);
        // J7ZHKO: the frame parks a fixed gap right of the layout-B headline, showing 36-56% of itself.
        const peek = () => {
          const vw = window.innerWidth;
          const fw = parkWidth();
          const headlineRight = statement.offsetLeft + statement.offsetWidth;
          const left = gsap.utils.clamp(vw - fw * 0.56, vw - fw * 0.36, headlineRight + Math.max(56, vw * 0.065));
          return left - frameLeft();
        };

        // The frame is one composited layer while it swings in at the park scale. The hint comes
        // off before it grows, so the text re-rasters as it scales up instead of stretching a
        // small bitmap, and the landed frame is crisp.
        let travelling = false;
        const setTravel = (next: boolean) => {
          if (travelling === next) return;
          travelling = next;
          frame.style.willChange = next ? "transform" : "";
        };
        let immersive = false;
        const setImmersive = (next: boolean) => {
          if (immersive === next) return;
          immersive = next;
          if (next) html.setAttribute("data-immersive", "");
          else html.removeAttribute("data-immersive");
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=240%",
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setLiveOnce(self.progress > LIVE_AT);
              setTravel(self.progress > 0.38 && self.progress < 7 / TIMELINE_T);
              setImmersive(self.isActive && self.progress > IMMERSIVE_AT);
            },
            onLeave: () => {
              setLiveOnce(true);
              setTravel(false);
              setImmersive(false);
            },
            onLeaveBack: () => setImmersive(false),
          },
        });
        triggerRef.current = tl.scrollTrigger ?? null;

        // 1. Reading-order reveal.
        const n = tokenEls.length;
        tokenEls.forEach((el, i) => {
          const at = (i / Math.max(1, n - 1)) * 3;
          if (el.dataset.token === "chip") {
            const inner = el.querySelector("[data-chip-inner]");
            if (inner) {
              tl.fromTo(
                inner,
                { opacity: 0.3, scale: 0.6, rotate: -8 },
                { opacity: 1, scale: 1, rotate: 0, duration: 0.7, ease: "ch.out" },
                Math.max(0, at - 0.1),
              );
            }
          } else {
            tl.fromTo(el, { opacity: 0.15 }, { opacity: 1, duration: 0.6 }, at);
          }
        });

        // The credit hint appears once every clip is lit (so it never precedes the clips), then
        // leaves before the statement morphs.
        if (credit) {
          tl.fromTo(credit, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, immediateRender: true }, 2.8);
          tl.to(credit, { autoAlpha: 0, duration: 0.5 }, 3.9);
        }

        // 2. Flip the five lines from the centred statement into the left headline. Lines never
        //    re-wrap on desktop, so each moves as one unit and no words cross mid-flight.
        //    Nested directly in the master timeline so reverting it reverts the Flip too.
        const state = Flip.getState(lineEls);
        gsap.set(statement, { attr: { "data-layout": "b" } });
        tl.add(Flip.from(state, { duration: 2.6, ease: "ch.inOut", scale: true }), 4.2);

        // Hinged on its left edge: x places the visible left edge and scale never moves it.
        gsap.set(frame, { transformPerspective: 1800, transformOrigin: "0% 50%" });
        // Same ease and span as the Flip: the frame's left edge then stays right of the shrinking
        // headline's right edge at every viewport width (no overlap mid-flight).
        tl.fromTo(
          frame,
          { x: offRight, y: parkY, scale: parkScale, rotationY: -6 },
          { x: peek, duration: 2.6, ease: "ch.inOut", immediateRender: true },
          4.2,
        );
        tl.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 1.2, immediateRender: true }, 4.4);

        // 3. Simulator to the centre, growing into the full-size frame; headline out to the left.
        //    x keeps the headline's ease and span (still no overlap); the zoom starts a beat later
        //    and lands with it, so the frame first travels, then opens up into the app.
        tl.to(frame, { x: 0, rotationY: 0, duration: 3.2, ease: "ch.inOut" }, 6.8);
        tl.to(frame, { y: 0, scale: 1, duration: 2.9, ease: "ch.inOut" }, 7.1);
        tl.to(
          statement,
          {
            x: () => -(statement.offsetLeft + statement.offsetWidth + 64),
            opacity: 0,
            duration: 3.2,
            ease: "ch.inOut",
          },
          6.8,
        );
        tl.fromTo(head, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.4, ease: "ch.out" }, 9);
        tl.to({}, { duration: TIMELINE_T - 10.4 }, 10.4);

        return () => {
          // Belt and braces: never let a stale Flip transform survive into the next measurement.
          gsap.set(lineEls, { clearProps: "transform" });
          frame.style.willChange = "";
          setImmersive(false);
          triggerRef.current = null;
          setLiveOnce(true);
        };
      });

      mm.add(MOBILE, () => {
        const statement = statementRef.current;
        const simInner = simInnerRef.current;
        if (!statement || !simInner) return;
        const tokenEls = gsap.utils.toArray<HTMLElement>("[data-token]", statement);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: statement, start: "top 82%", end: "bottom 42%", scrub: 0.6 },
        });
        tokenEls.forEach((el, i) => {
          const at = i / Math.max(1, tokenEls.length - 1);
          const inner = el.dataset.token === "chip" ? el.querySelector("[data-chip-inner]") : null;
          if (inner) tl.fromTo(inner, { opacity: 0.3, scale: 0.6, rotate: -8 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.25, ease: "ch.out" }, at);
          else tl.fromTo(el, { opacity: 0.15 }, { opacity: 1, duration: 0.2 }, at);
        });
        gsap.fromTo(
          simInner,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.9, ease: "ch.out", scrollTrigger: { trigger: simInner, start: "top 88%", once: true } },
        );
      });

      ScrollTrigger.refresh();
    },
    { dependencies: [version], revertOnUpdate: true },
  );

  return (
    <div ref={stageRef} className={styles.stage}>
      {!live ? (
        <button type="button" className={styles.skip} onClick={skipToDemo}>
          Skip to the live demo
        </button>
      ) : null}
      <div className={styles.statementWrap}>
        <h2 ref={statementRef} data-anim className={styles.statement}>
          <span className="sr-only">{statementText(lines)}</span>
          <span aria-hidden>
            {lines.map((line, li) => (
              <span key={li} data-line className={styles.line}>
                {line.map((token, i) => {
                  const space = i < line.length - 1 ? " " : "";
                  if (token.kind === "chip") {
                    const chip = chipByN.get(token.n);
                    return chip ? (
                      <span key={i}>
                        <Chip chip={chip} onHover={setHoverChip} />
                        {space}
                      </span>
                    ) : null;
                  }
                  return (
                    <span key={i}>
                      <span data-token="word" className={cn(styles.word, token.italic ? styles.italic : "")}>
                        {token.text}
                      </span>
                      {space}
                    </span>
                  );
                })}
                {/* Joins lines with a space when they flow inline (phones). */}
                {li < lines.length - 1 ? " " : null}
              </span>
            ))}
          </span>
        </h2>
        <ChipCredit ref={creditRef} chip={hoverChip != null ? (chipByN.get(hoverChip) ?? null) : null} />
      </div>

      <div className={styles.simWrap}>
        {/* Inert until it lands: no invisible, off-screen tab stops during the scroll-jack. */}
        <div ref={simInnerRef} className={styles.simInner} data-live={live || undefined} inert={!live}>
          {/* The slim row above the frame: eyebrow + run caption left, Full Control + Get started
              right (phones: eyebrow over the caption, no actions). */}
          <div ref={headRef} className={styles.head}>
            <div className={styles.headText}>
              <Eyebrow index={index} total={total} label="ContHunt app" className="shrink-0" />
              <RunCaption
                searches={runs}
                initialId={simulator.activeSearchId}
                subscribe={subscribeTab}
                className={styles.caption}
              />
            </div>
            <div className={styles.headActions}>
              <FullControlButton simulator={simulator} activeSearchId={readTab} className="max-lg:hidden" />
              <Button href={GET_STARTED_URL} size="sm">
                Get started
              </Button>
            </div>
          </div>
          <div ref={frameRef} className={styles.frame}>
            {sim}
          </div>
        </div>
      </div>
    </div>
  );
}
