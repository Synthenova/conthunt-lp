"use client";

/**
 * Explorer: the interactive body of /viral-now.
 *
 * - `All` shows one Netflix-style row per niche; a single niche shows its full grid.
 * - The selection lives in the URL as `?niche=<slug>` (history.pushState, so there is no
 *   server round trip) and follows Back and Forward.
 * - Changing the selection fades the content out, swaps it, fades it in, and smooth-scrolls
 *   back to the top of the content when the visitor was scrolled below it.
 * - Opening a card shows the dialog for the list it came from. A dialog opened from a row follows
 *   that row while the rest of the snapshot streams in, so "Next" never stops at the preview.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { useLenis } from "@/components/layout/smooth-scroll";
import { EASE, gsap } from "@/lib/gsap";
import { capture } from "@/lib/analytics";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL } from "@/lib/links";
import { prefersReducedMotion } from "@/lib/motion";
import { EMPTY_BOARDS } from "@/lib/viral-now/copy";
import { nicheSize } from "@/lib/viral-now/stats";
import type { ViralNowNiche, ViralNowVideo } from "@/lib/viral-now/types";
import { NicheRow } from "./niche-row";
import { CTA_ID, PANEL_ID, tabId } from "./ids";
import { NicheSelector } from "./niche-selector";
import { NicheView } from "./niche-view";
import { useViralNow } from "./provider";
import { VideoDialog, type DialogState } from "./video-dialog";
import styles from "./viral-now.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function slugFromSearch(search: string, niches: ViralNowNiche[]): string | null {
  const slug = new URLSearchParams(search).get("niche");
  return slug && niches.some((n) => n.slug === slug) ? slug : null;
}

export function Explorer({ initialActive }: { initialActive: string | null }) {
  const { niches, asOfFor, ensureFull } = useViralNow();
  const lenis = useLenis();
  const [active, setActive] = useState<string | null>(initialActive);
  const [shown, setShown] = useState<string | null>(initialActive);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const activeRef = useRef(active);
  const stageRef = useRef<HTMLDivElement>(null);
  /** The `shown` value the entrance last ran for (initially the server-rendered one). */
  const animatedFor = useRef<string | null>(initialActive);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  /* -------------------------------------------------------------- URL state */

  const select = useCallback((slug: string | null) => {
    if (slug === activeRef.current) return;
    capture("viral_niche_selected", { niche: slug ?? "all" });
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("niche", slug);
    else url.searchParams.delete("niche");
    window.history.pushState(null, "", url);
    setActive(slug);
  }, []);

  useEffect(() => {
    const onPop = () => {
      const slug = slugFromSearch(window.location.search, niches);
      setActive(slug);
      capture("viral_niche_selected", { niche: slug ?? "all" });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [niches]);

  /* ------------------------------------------------- crossfade and scroll reset */

  const scrollToContent = useCallback(
    (smooth: boolean) => {
      const stage = stageRef.current;
      if (!stage) return;
      const bar = document.querySelector<HTMLElement>(`.${styles.selectorBar}`);
      const header = document.querySelector<HTMLElement>("header[data-hidden]");
      const stick = bar ? parseFloat(getComputedStyle(bar.parentElement ?? bar).getPropertyValue("--vn-stick")) || 72 : 72;
      const barHeight = bar ? bar.getBoundingClientRect().height : 60;
      const stageTop = stage.getBoundingClientRect().top + window.scrollY;
      // The navbar slides away on a long scroll down (from 240px of page depth) and stays away on a
      // scroll up, and the bar then sticks to the top edge. Aim for the bar's position after the scroll,
      // with a small gap beneath it.
      const gap = 8;
      const whenHidden = Math.max(stageTop - (barHeight + gap), 0);
      const hides = whenHidden >= 244 && (header?.dataset.hidden === "true" || whenHidden - window.scrollY > 48);
      const y = hides ? whenHidden : Math.max(whenHidden - stick, 0);
      if (Math.abs(window.scrollY - y) < 4) return;
      if (smooth && lenis) lenis.scrollTo(y, { duration: 0.9 });
      else window.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
    },
    [lenis],
  );

  useEffect(() => {
    if (active === shown) return;
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) {
      scrollToContent(false);
      const id = window.setTimeout(() => setShown(active), 0);
      return () => window.clearTimeout(id);
    }
    scrollToContent(true);
    const tween = gsap.to(stage, {
      opacity: 0,
      y: -8,
      duration: 0.16,
      ease: "power1.in",
      overwrite: true,
      onComplete: () => setShown(active),
    });
    return () => {
      tween.kill();
    };
  }, [active, shown, scrollToContent]);

  useIsoLayoutEffect(() => {
    // Nothing to animate for what the server rendered. Comparing with the last shown value (not a
    // "first run" flag) keeps React strict mode's second effect run from replaying the entrance.
    if (animatedFor.current === shown) return;
    animatedFor.current = shown;
    const stage = stageRef.current;
    if (!stage || prefersReducedMotion()) {
      if (stage) gsap.set(stage, { clearProps: "opacity,transform" });
      return;
    }
    const tween = gsap.fromTo(
      stage,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.55, ease: EASE.out, overwrite: true, clearProps: "opacity,transform" },
    );
    const cards = stage.querySelectorAll("[data-enter]");
    const stagger = cards.length
      ? gsap.from(Array.from(cards).slice(0, 24), {
          opacity: 0,
          y: 18,
          duration: 0.55,
          ease: EASE.out,
          stagger: 0.02,
          clearProps: "opacity,transform",
        })
      : null;
    return () => {
      tween.revert();
      stagger?.revert();
    };
  }, [shown]);

  const activeNiche = shown ? (niches.find((n) => n.slug === shown) ?? null) : null;

  useEffect(() => {
    if (shown) ensureFull(shown);
  }, [shown, ensureFull]);

  /* --------------------------------------------------------------- dialog */

  const openFromRow = useCallback((niche: ViralNowNiche, video: ViralNowVideo, trigger: HTMLElement) => {
    setDialog({ niche, list: niche.videos, index: Math.max(niche.videos.indexOf(video), 0), trigger });
  }, []);

  const openFromGrid = useCallback(
    (niche: ViralNowNiche, list: ViralNowVideo[], video: ViralNowVideo, trigger: HTMLElement) => {
      setDialog({ niche, list, index: Math.max(list.indexOf(video), 0), trigger });
    },
    [],
  );

  // A row dialog opened while the row held only its first cards: widen its list once the rest is here.
  const shownDialog = useMemo<DialogState | null>(() => {
    if (!dialog || dialog.list !== dialog.niche.videos) return dialog;
    const current = niches.find((n) => n.slug === dialog.niche.slug);
    if (!current || current === dialog.niche || current.videos.length <= dialog.list.length) return dialog;
    const keepsOrder = dialog.list.every((video, i) => current.videos[i]?.id === video.id);
    return keepsOrder ? { ...dialog, niche: current, list: current.videos } : dialog;
  }, [dialog, niches]);

  // "Skip niche rows": 20 rows of cards would otherwise sit between the niche bar and the closing call to action.
  // Lenis intercepts in-page anchors and leaves focus alone, so the jump (and the focus move) is done here.
  const skipRows = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById(CTA_ID);
      if (!target) return;
      event.preventDefault();
      target.focus({ preventScroll: true });
      if (lenis) lenis.scrollTo(target, { offset: -96 });
      else target.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    },
    [lenis],
  );

  const closeDialog = useCallback(() => setDialog(null), []);
  const changeIndex = useCallback((index: number) => setDialog((d) => (d ? { ...d, index } : d)), []);

  const announce = activeNiche
    ? `${activeNiche.name}, ${nicheSize(activeNiche)} videos`
    : `All niches, ${niches.length} rows of ranked videos`;

  return (
    <div className={styles.explorer}>
      <NicheSelector niches={niches} active={active} onSelect={select} />

      {/* Only the rows view has rows to skip. Hidden until it has keyboard focus (see `.skip`). */}
      {!activeNiche && niches.length > 0 && (
        <a href={`#${CTA_ID}`} className={styles.skip} onClick={skipRows}>
          Skip niche rows
        </a>
      )}

      <div ref={stageRef} id={PANEL_ID} role="tabpanel" aria-labelledby={tabId(shown)}>
        {niches.length === 0 ? (
          <div className="letterbox flex flex-col items-start gap-5 py-24">
            <p className="display-m max-w-[22ch]">{EMPTY_BOARDS.title}</p>
            <p className="body-l max-w-[48ch] text-ink-2/75">{EMPTY_BOARDS.body}</p>
            <Button href={GET_STARTED_URL} {...phAttrs("viral_explorer", "app")}>Get started</Button>
          </div>
        ) : activeNiche ? (
          <NicheView key={activeNiche.slug} niche={activeNiche} onOpen={openFromGrid} />
        ) : (
          niches.map((niche, index) => (
            <NicheRow key={niche.slug} niche={niche} index={index} onSelect={select} onOpen={openFromRow} />
          ))
        )}
      </div>

      <p className={styles.srOnly} aria-live="polite">
        {announce}
      </p>

      {shownDialog && (
        <VideoDialog state={shownDialog} asOf={asOfFor(shownDialog.niche)} onIndexChange={changeIndex} onClose={closeDialog} />
      )}
    </div>
  );
}
