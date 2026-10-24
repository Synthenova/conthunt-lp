"use client";

/**
 * VideoDialog: the detail view for one video, as a native modal <dialog>.
 *
 * Native `showModal()` gives the focus trap, Esc handling and an inert page behind it;
 * closing plays a short exit animation first, then restores focus to the card that opened
 * it. Left and right arrow keys (and the buttons) step through the list the card came from.
 *
 * Content: playable media (loop, or the original through a renewed signed URL) or the poster
 * with an outbound link; title, creator, metrics, score and where the video stands on each
 * part of the score (derived from the niche on screen); the saved analysis when there is
 * one; and the "Analyze videos like this" call to action.
 */
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Play, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { useLenis } from "@/components/layout/smooth-scroll";
import { Button } from "@/components/ui/button";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { capture } from "@/lib/analytics";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL } from "@/lib/links";
import { MOTION_OK, MOTION_REDUCED, prefersReducedMotion } from "@/lib/motion";
import { fetchAnalysis, isPlayable } from "@/lib/viral-now/api";
import { countsCaption } from "@/lib/viral-now/copy";
import {
  creatorLabel,
  formatCount,
  formatDuration,
  formatLongDate,
  formatPercent,
  initialsOf,
  ordinal,
} from "@/lib/viral-now/format";
import { platformInfo } from "@/lib/viral-now/glyphs";
import { freshVideoUrl, refreshVideoUrl, useAssetUrl } from "@/lib/viral-now/media-store";
import { rankSourceNote, SEED_INGREDIENTS, type IngredientKey } from "@/lib/viral-now/ranking";
import {
  engagementRate,
  ingredientStandings,
  nicheStats,
  viewsPerDay,
  viewsVsMedian,
  type IngredientStanding,
} from "@/lib/viral-now/stats";
import type { ViralNowAnalysis, ViralNowNiche, ViralNowVideo } from "@/lib/viral-now/types";
import { PlatformGlyph } from "./parts";
import styles from "./viral-now.module.css";

export interface DialogState {
  niche: ViralNowNiche;
  /** The list the card came from (a row, or the sorted and filtered grid). */
  list: ViralNowVideo[];
  index: number;
  /** The card that opened the dialog, to give focus back to. */
  trigger: HTMLElement | null;
}

export interface VideoDialogProps {
  state: DialogState;
  /** ISO timestamp for "views per day" math. */
  asOf: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export function VideoDialog({ state, asOf, onIndexChange, onClose }: VideoDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const lenis = useLenis();

  const { niche, list, index, trigger } = state;
  const video = list[index];
  const openedId = video?.id;
  const openedPlatform = video?.platform;
  const openedRank = video?.rank;
  const nicheSlug = niche.slug;

  useEffect(() => {
    if (!openedId || !openedPlatform || openedRank == null) return;
    capture("viral_video_opened", { niche: nicheSlug, platform: openedPlatform, rank: openedRank });
  }, [openedId, openedPlatform, openedRank, nicheSlug]);

  /* ------------------------------------------------------------- open and close */

  useEffect(() => {
    const dialog = dialogRef.current;
    const sheet = sheetRef.current;
    if (!dialog) return;
    // The fixed navbar hides while this modal owns the screen: globals.css keys `[data-site-nav]` off `data-modal-open`
    // on <html> (set after showModal(), cleared on the dialog's `close` event and in cleanup, FOUNDATION.md section 8).
    const html = document.documentElement;
    const clearModalFlag = () => html.removeAttribute("data-modal-open");
    dialog.addEventListener("close", clearModalFlag);
    if (!dialog.open) dialog.showModal();
    html.setAttribute("data-modal-open", "");
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });
    if (sheet && !prefersReducedMotion()) {
      gsap.fromTo(
        sheet,
        { y: 28, opacity: 0, scale: 0.985 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: EASE.out, clearProps: "transform,opacity" },
      );
    }
    return () => {
      dialog.removeEventListener("close", clearModalFlag);
      clearModalFlag();
      if (sheet) gsap.killTweensOf(sheet);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const previousPadding = html.style.paddingRight;
    // Hiding the page scrollbar would widen the page by its width and shift everything behind the
    // backdrop; padding the root by the same amount keeps the layout exactly where it was. Measure
    // before Lenis stops, because a stopped Lenis already hides the scrollbar.
    const scrollbar = window.innerWidth - html.clientWidth;
    lenis?.stop();
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousOverflow;
      html.style.paddingRight = previousPadding;
      lenis?.start();
    };
  }, [lenis]);

  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const dialog = dialogRef.current;
    const sheet = sheetRef.current;
    const finish = () => {
      dialog?.close();
      onClose();
      // Give focus back to the card of the video that was showing (or the one that opened the dialog).
      // If live boards replaced the rows while the dialog was open, both are gone: fall back to the
      // card with the same rank in that niche's row, then to the row's first card.
      const current = document.querySelector<HTMLElement>(`[data-video-id="${CSS.escape(list[index].id)}"]`);
      if (current) {
        current.focus({ preventScroll: false });
      } else if (trigger?.isConnected) {
        trigger.focus({ preventScroll: true });
      } else {
        const cards = document.querySelectorAll<HTMLElement>(`section[data-niche="${CSS.escape(niche.slug)}"] button[data-video-id]`);
        (cards[Math.min(list[index].rank, cards.length) - 1] ?? cards[0])?.focus({ preventScroll: true });
      }
    };
    if (!dialog || !sheet || prefersReducedMotion()) {
      finish();
      return;
    }
    dialog.dataset.closing = "true";
    gsap.to(sheet, { y: 18, opacity: 0, scale: 0.985, duration: 0.22, ease: "power2.in", onComplete: finish });
  }, [onClose, trigger, list, index, niche.slug]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const next = index + dir;
      if (next >= 0 && next < list.length) onIndexChange(next);
    },
    [index, list.length, onIndexChange],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "VIDEO" || target.tagName === "INPUT") return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  const onFrameClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) requestClose();
  };

  /* ------------------------------------------------------------------ derived */

  const stats = useMemo(() => nicheStats(niche), [niche]);
  const asOfMs = useMemo(() => Date.parse(asOf), [asOf]);
  const standings = useMemo(() => ingredientStandings(video, niche.videos, asOfMs), [video, niche.videos, asOfMs]);
  const analysis = useAnalysis(video);
  const info = platformInfo(video.platform);
  const who = creatorLabel(video.creator);
  const vsMedian = viewsVsMedian(video, stats);
  const perDay = viewsPerDay(video, asOfMs);
  const rate = engagementRate(video.metrics);
  const posted = formatLongDate(video.posted_at);
  const duration = formatDuration(video.duration_seconds);

  const detailRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-vn-bar]", { scaleX: 0, duration: 0.9, ease: EASE.out, stagger: 0.07, delay: 0.25 });
        gsap.from("[data-vn-arc]", { strokeDashoffset: ARC, duration: 1.1, ease: EASE.out, delay: 0.2 });
        gsap.from("[data-vn-in]", { opacity: 0, y: 10, duration: 0.5, ease: EASE.out, stagger: 0.05, clearProps: "opacity,transform" });
      });
      mm.add(MOTION_REDUCED, () => undefined);
    },
    { scope: detailRef, dependencies: [video.id] },
  );

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div className={styles.frame} onClick={onFrameClick}>
        <div ref={sheetRef} className={styles.sheet} data-lenis-prevent="">
          <div className={styles.stage}>
            <DialogMedia
              key={video.id}
              video={video}
              watchLabel={info ? `Watch on ${info.label}` : "Watch the original"}
              onOutbound={() => capture("viral_outbound_clicked", { platform: video.platform, niche: niche.slug, rank: video.rank })}
            />
          </div>

          <div ref={detailRef} className={styles.detail}>
            <div className={styles.detailScroll} data-lenis-prevent="">
              <div className="flex items-center justify-between gap-3" data-vn-in="">
                <p className="eyebrow min-w-0 truncate text-ink-2/70!">
                  <span className="text-ink">#{video.rank}</span> in <span className="sm:hidden">{niche.label}</span>
                  <span className="hidden sm:inline">{niche.name}</span>
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="mr-1 whitespace-nowrap font-mono text-xs tabular-nums tracking-[0.02em] text-ink-2/75">
                    {index + 1} / {list.length}
                  </span>
                  <button type="button" className={styles.iconBtn} onClick={() => step(-1)} disabled={index === 0} aria-label="Previous video">
                    <ChevronLeft className="size-5" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => step(1)}
                    disabled={index === list.length - 1}
                    aria-label="Next video"
                  >
                    <ChevronRight className="size-5" strokeWidth={2} />
                  </button>
                  <button type="button" className={styles.iconBtn} onClick={requestClose} aria-label="Close" data-autofocus="">
                    <X className="size-5" strokeWidth={2} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4" data-vn-in="">
                <h2 id={titleId} className="text-[26px] font-bold leading-[1.1] tracking-[-0.03em] text-ink text-balance md:text-[30px]">
                  {video.title}
                </h2>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-surface font-mono text-xs font-semibold tracking-[0.02em] text-ink-2"
                  >
                    {initialsOf(video.creator.name, video.creator.handle)}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
                      {video.creator.name ?? who}
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-ink-2/70">
                      <PlatformGlyph platform={video.platform} className="size-3" />
                      <span className="truncate">{who}</span>
                      {posted && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="whitespace-nowrap">{posted}</span>
                        </>
                      )}
                      {duration && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="whitespace-nowrap font-mono text-xs tabular-nums">{duration}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.metricGrid} data-vn-in="">
                <Metric label="Views" value={formatCount(video.metrics.views)} note={vsMedian ? `${vsMedian.multiple.toFixed(1)}× niche median` : undefined} />
                <Metric label="Likes" value={formatCount(video.metrics.likes)} />
                <Metric label="Comments" value={formatCount(video.metrics.comments)} />
                <Metric label="Shares" value={formatCount(video.metrics.shares)} />
                <Metric label="Engagement" value={formatPercent(rate)} note="reactions per view" />
                <Metric label="Views per day" value={formatCount(perDay === null ? null : Math.round(perDay))} note="since posting" />
              </div>
              {video.source === "seed" && (
                <p className="-mt-3 font-mono text-[11px] tracking-[0.02em] text-ink-2/70" data-vn-in="">
                  {countsCaption(asOf)}
                </p>
              )}

              {video.score !== null && (
                <section className="flex flex-col gap-4" aria-label="Score" data-vn-in="">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={video.score} />
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Score {video.score.toFixed(1)} out of 100</p>
                      <p className="text-[13px] leading-snug text-ink-2/70">{rankSourceNote(video.source, video.rank, niche.name)}</p>
                    </div>
                  </div>
                  <Ingredients standings={standings} weighted={video.source === "seed"} />
                </section>
              )}

              <Analysis analysis={analysis.analysis} loading={analysis.loading} />
            </div>

            <div className={styles.detailFooter}>
              <Button href={GET_STARTED_URL} size="md" className="min-w-0 flex-1 sm:flex-none" {...phAttrs("viral_dialog", "app")}>
                Analyze videos like this
                <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover/button:translate-x-0.5" strokeWidth={2} />
              </Button>
              {video.url && (
                <Button
                  href={video.url}
                  newTab
                  variant="secondary"
                  size="md"
                  aria-label={info?.openLabel ?? "Open original"}
                  className="w-11 px-0 sm:w-auto sm:px-5"
                  onClick={() =>
                    capture("viral_outbound_clicked", { platform: video.platform, niche: niche.slug, rank: video.rank })
                  }
                >
                  <span className="hidden sm:inline">{info?.openLabel ?? "Open original"}</span>
                  <ExternalLink className="size-4" strokeWidth={2} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ pieces */

function Metric({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="eyebrow text-ink-2/70!">{label}</span>
      <span className="font-sans text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">{value}</span>
      {note && <span className="truncate font-mono text-[10.5px] tracking-[0.01em] text-ink-2/70">{note}</span>}
    </div>
  );
}

const RADIUS = 24;
const ARC = 2 * Math.PI * RADIUS;

function ScoreRing({ score }: { score: number }) {
  return (
    <svg viewBox="0 0 56 56" className="size-14 shrink-0 -rotate-90" role="img" aria-label={`Score ${score.toFixed(1)} out of 100`}>
      <circle cx="28" cy="28" r={RADIUS} fill="none" stroke="var(--surface-2)" strokeWidth="5" />
      <circle
        data-vn-arc=""
        cx="28"
        cy="28"
        r={RADIUS}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={ARC}
        strokeDashoffset={ARC * (1 - score / 100)}
      />
    </svg>
  );
}

const INGREDIENT_VALUE: Record<IngredientKey, (value: number) => string> = {
  reach: (v) => `${formatCount(v)} views`,
  engagement: (v) => formatPercent(v),
  velocity: (v) => `${formatCount(Math.round(v))} a day`,
  recency: (v) => (v < 1 ? "under a day old" : `${Math.round(v)} ${Math.round(v) === 1 ? "day" : "days"} old`),
};

function Ingredients({ standings, weighted }: { standings: IngredientStanding[]; weighted: boolean }) {
  return (
    <div className="flex flex-col gap-3.5">
      <p className="eyebrow text-ink-2/70!">Where it stands in this niche</p>
      <ul className="flex flex-col gap-3.5">
        {SEED_INGREDIENTS.map((ingredient) => {
          const standing = standings.find((s) => s.key === ingredient.key);
          if (!standing || standing.value === null || standing.place === null) return null;
          return (
            <li key={ingredient.key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold tracking-[-0.005em] text-ink">
                  {ingredient.label}
                  {weighted && <span className="ml-2 font-mono text-[11px] font-medium tabular-nums text-ink-2/70">{ingredient.weight}% of score</span>}
                </span>
                <span className="font-mono text-xs tabular-nums tracking-[0.01em] text-ink-2/70">
                  {INGREDIENT_VALUE[ingredient.key](standing.value)}
                  <span className="text-ink-2/70"> · {ordinal(standing.place)} of {standing.of}</span>
                </span>
              </div>
              <div className={styles.ingredientBar} aria-hidden="true">
                <span data-vn-bar="" style={{ transform: `scaleX(${Math.max(standing.fill, 0.04)})` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Analysis({ analysis, loading }: { analysis: ViralNowAnalysis | null; loading: boolean }) {
  if (loading) {
    return (
      <section className="flex flex-col gap-3" aria-busy="true" aria-label="Analysis loading" data-vn-in="">
        <span className="eyebrow text-ink-2/70!">Analysis</span>
        <span className="h-4 w-4/5 rounded bg-surface" />
        <span className="h-4 w-3/5 rounded bg-surface" />
      </section>
    );
  }
  if (!analysis) {
    return (
      <section className="flex flex-col gap-3 rounded-btn bg-surface p-4" data-vn-in="">
        <span className="eyebrow text-ink-2/70!">What a deep search adds</span>
        <p className="text-[14px] leading-snug text-ink-2">
          For every video it watches, ContHunt writes down the hook, the devices that hold attention and a pattern you can reuse.
        </p>
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-4" aria-label="Analysis" data-vn-in="">
      <span className="eyebrow text-ink-2/70!">Analysis</span>
      {analysis.hook && (
        <Block label={analysis.hook_type ? `Hook, ${analysis.hook_type.toLowerCase()}` : "Hook"} text={analysis.hook} />
      )}
      {analysis.summary && <Block label="Summary" text={analysis.summary} />}
      {analysis.retention.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-ink">Why people keep watching</span>
          <ul className="flex flex-col gap-1 text-[14px] leading-snug text-ink-2">
            {analysis.retention.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
      {analysis.pattern && <Block label="Pattern to reuse" text={analysis.pattern} />}
      {analysis.emotion && <Block label="Emotional driver" text={analysis.emotion} />}
      {analysis.cta && <Block label="Call to action" text={analysis.cta} />}
    </section>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <p className="text-[14px] leading-snug text-ink-2">{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------- media */

function DialogMedia({
  video,
  watchLabel,
  onOutbound,
}: {
  video: ViralNowVideo;
  watchLabel: string;
  onOutbound: () => void;
}) {
  const { url: poster, onError } = useAssetUrl(video, "poster");
  const [src, setSrc] = useState<string | null>(null);
  const canPlay = isPlayable(video.video);
  const withAudio = video.video.source !== "local";
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!canPlay || reduced) return;
    let cancelled = false;
    void freshVideoUrl(video).then((url) => {
      if (!cancelled && url) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [video, canPlay, reduced]);

  return (
    <>
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(min-width: 760px) 430px, 100vw"
          unoptimized
          priority
          draggable={false}
          onError={onError}
          className={styles.stageMedia}
        />
      )}
      {src && (
        <video
          className={styles.stageMedia}
          src={src}
          poster={poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          controls={withAudio}
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          aria-label={`Playing ${video.title}`}
          onError={() => {
            setSrc(null);
            void refreshVideoUrl(video).then((url) => setSrc(url));
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        {src && !withAudio ? (
          <span className="rounded-chip bg-black/60 px-2 py-1 font-mono text-[11px] tracking-[0.02em] text-white">Loop preview, no audio</span>
        ) : (
          <span />
        )}
      </div>
      {!src && video.url && (
        // The poster's own play button. The text link to the original lives in the footer, so the same
        // destination is not offered twice in words.
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={watchLabel}
          title={watchLabel}
          onClick={onOutbound}
          className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink shadow-float transition-transform duration-200 ease-out hover:scale-105 active:scale-[0.96]"
        >
          <Play className="ml-0.5 size-6 fill-current" strokeWidth={2} />
        </a>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- analysis */

function useAnalysis(video: ViralNowVideo): { analysis: ViralNowAnalysis | null; loading: boolean } {
  const [fetched, setFetched] = useState<Record<string, ViralNowAnalysis | null>>({});
  const live = video.source === "live" && video.board_slug !== null;
  const known = video.id in fetched;

  useEffect(() => {
    if (video.analysis || !live || known || !video.board_slug) return;
    let cancelled = false;
    fetchAnalysis(video.board_slug, video.id)
      .then((result) => {
        if (!cancelled) setFetched((prev) => ({ ...prev, [video.id]: result }));
      })
      .catch(() => {
        if (!cancelled) setFetched((prev) => ({ ...prev, [video.id]: null }));
      });
    return () => {
      cancelled = true;
    };
  }, [video, live, known]);

  return {
    analysis: video.analysis ?? fetched[video.id] ?? null,
    loading: !video.analysis && live && !known,
  };
}

