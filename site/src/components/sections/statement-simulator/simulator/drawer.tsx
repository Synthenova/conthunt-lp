"use client";

/**
 * Video drawer (ContentDrawer, simulator-spec §8). Opens when a tile is clicked.
 *
 * A real card (SIM-UI.md §2: nothing shimmers once the data is real) shows its poster, creator,
 * caption, platform and the four "Video metrics", then the run's analysis of the video when the card
 * carries it (DATA.md §2): "Research findings" (one row per research question, present or absent
 * with the probability, like the rubric badge), HOOK and SUMMARY, and a short "Open ContHunt" block
 * for the rest (transcript, scenes, timeline). A card without `analysis` keeps the static block.
 * A skeleton tile keeps the skeleton layout, with the app's own labels: "Video metrics",
 * "Research Findings" (rows with "NN% support"), the analysis sections HOOK, CTA, KEY TOPICS,
 * ON-SCREEN TEXT, SUMMARY and the collapsibles Metadata, Transcript & Text, Characters, Scenes,
 * Visuals & Audio, Timeline.
 */
import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, Check, ChevronRight, Eye, Heart, MessageCircle, Minus, Share2, X } from "lucide-react";
import type { SimPlatform, SimVideoAnalysis, SimVideoCard, SimVideoMetrics } from "@/content/simulator/types";
import { GET_STARTED_URL } from "@/lib/links";
import { cn } from "@/lib/cn";
import { formatCount, PLATFORM_LABEL } from "./format";
import { PlatformIcon } from "./platform-icon";
import { scrollAreaOverflow, scrollAreaProps } from "./scroll";
import styles from "./sim.module.css";

export interface DrawerTile {
  railKey: string;
  id: string;
  badge: string | null;
  platform?: SimPlatform;
  /** The tile's card; the drawer shows it unless `skeleton` is set. */
  card?: SimVideoCard | null;
  skeleton?: boolean;
}

const ANALYSIS = ["Hook", "CTA", "Key topics", "On-screen text", "Summary"] as const;
const COLLAPSIBLES = ["Metadata", "Transcript & Text", "Characters", "Scenes", "Visuals & Audio", "Timeline"] as const;
const METRICS = [
  { label: "Views", key: "views", Icon: Eye },
  { label: "Likes", key: "likes", Icon: Heart },
  { label: "Comments", key: "comments", Icon: MessageCircle },
  { label: "Shares", key: "shares", Icon: Share2 },
] as const satisfies ReadonlyArray<{ label: string; key: keyof SimVideoMetrics; Icon: unknown }>;

/**
 * Focus that belongs to no control: the body, the page's `<main id="main" tabIndex={-1}>` (a mouse
 * click on plain content focuses it), or another tabIndex=-1 container around the drawer, such as
 * the simulator frame. Focus resting there counts as "nowhere", so closing the drawer still returns
 * focus to the tile that opened it.
 */
function isResting(el: Element | null, panel: HTMLElement | null): boolean {
  if (!el || el === document.body || el === document.documentElement) return true;
  if (el.id === "main") return true;
  return !!panel && el !== panel && el.contains(panel);
}

/** A static skeleton bar (the drawer's one sweep runs over the poster placeholder, while open). */
function Bar({ w, h = 7, className }: { w: number | string; h?: number; className?: string }) {
  return <span aria-hidden className={cn(styles.shimmer, "block rounded-[4px] bg-surface", className)} style={{ width: w, height: h }} />;
}

const OPEN_CONTHUNT =
  "mt-2.5 inline-flex h-7 items-center gap-1 rounded-[8px] bg-ink px-2.5 text-[13px] font-medium text-paper outline-none transition-colors duration-150 hover:bg-ink-2 focus-visible:shadow-[0_0_0_2px_var(--accent)]";

function OpenContHunt() {
  return (
    <a href={GET_STARTED_URL} target="_blank" rel="noopener noreferrer" className={OPEN_CONTHUNT}>
      Open ContHunt
      <ArrowUpRight aria-hidden className="size-3.5" />
    </a>
  );
}

/** The run's analysis of one video: research findings, hook and summary (real text, no shimmer). */
function Analysis({ analysis }: { analysis: SimVideoAnalysis }) {
  return (
    <>
      {analysis.checks.length ? (
        <section aria-label="Research findings">
          <p className="mb-2 mt-5 text-[13px] font-semibold text-ink">Research findings</p>
          <ul className="flex flex-col gap-1">
            {analysis.checks.map((c) => {
              const present = c.status === "present";
              const pct = c.probability != null ? `${Math.round(c.probability * 100)}%` : null;
              return (
                <li key={c.parameter} className="flex items-center gap-2 rounded-[8px] px-2 py-1.5 shadow-[inset_0_0_0_1px_var(--hairline)]">
                  {present ? (
                    <Check aria-hidden className="size-3.5 shrink-0 text-growth" strokeWidth={2.4} />
                  ) : (
                    <Minus aria-hidden className="size-3.5 shrink-0 text-muted" strokeWidth={2.4} />
                  )}
                  <span className={cn("min-w-0 flex-1 text-[13px] leading-snug", present ? "text-ink" : "text-muted")}>{c.parameter}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-[6px] px-1.5 py-0.5 font-mono text-[12px] tabular-nums",
                      present ? "bg-ink text-paper" : "bg-surface text-ink-2",
                    )}
                  >
                    {present ? "Present" : "Absent"}
                    {pct ? ` ${pct}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <div className="mt-5 flex flex-col gap-3.5">
        {analysis.hook ? (
          <div>
            <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-muted">Hook</p>
            <p className="mt-1 text-[13.5px] leading-snug text-ink-2">{analysis.hook}</p>
          </div>
        ) : null}
        {analysis.summary ? (
          <div>
            <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-muted">Summary</p>
            <p className="mt-1 text-[13.5px] leading-snug text-ink-2">{analysis.summary}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-5 rounded-[10px] px-3 py-3 shadow-[inset_0_0_0_1px_var(--hairline)]">
        <p className="text-[13px] leading-snug text-muted">Transcript, scenes and timeline for every video in the run.</p>
        <OpenContHunt />
      </div>
    </>
  );
}

export interface VideoDrawerProps {
  tile: DrawerTile | null;
  onClose: () => void;
  /** The frame owns the wheel (see ./scroll.ts). The phone sheet always scrolls. */
  ownsWheel: boolean;
  /**
   * "side": the app's right-hand sheet inside the 1280 canvas (desktop).
   * "sheet": a bottom sheet at 1:1 over the visible pan window (phones), so it is never off-screen.
   */
  variant?: "side" | "sheet";
}

export function VideoDrawer({ tile, onClose, ownsWheel, variant = "side" }: VideoDrawerProps) {
  const open = tile != null;
  const sheet = variant === "sheet";
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrimRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLElement | null>(null);
  const drag = useRef<{ y: number; dy: number; id: number } | null>(null);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  // Keep the last tile rendered while the drawer slides out.
  const [shown, setShown] = useState<DrawerTile | null>(tile);
  if (tile && tile !== shown) setShown(tile);

  // Focus the Close button on open; on close, hand focus back to the tile that opened the drawer
  // (unless the user has already moved focus somewhere else, for example to a tab).
  useEffect(() => {
    if (open) {
      const active = document.activeElement;
      returnRef.current = active instanceof HTMLElement && !isResting(active, panelRef.current) ? active : null;
      closeRef.current?.focus({ preventScroll: true });
      return;
    }
    const back = returnRef.current;
    returnRef.current = null;
    if (!back?.isConnected) return;
    const now = document.activeElement;
    const inside = now && (panelRef.current?.contains(now) || now === scrimRef.current);
    if (!isResting(now, panelRef.current) && !inside) return;
    back.focus({ preventScroll: true });
  }, [open]);

  const current = tile ?? shown;
  const card = current && !current.skeleton ? current.card : null;
  const creator = card ? card.author_name || card.creator_handle : null;
  const caption = card ? card.title || card.primary_text || "No Title" : null;

  // Phone sheet: drag the header down to dismiss.
  const dragHandlers = sheet
    ? {
        onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
          if ((e.target as Element).closest("button")) return;
          drag.current = { y: e.clientY, dy: 0, id: e.pointerId };
          e.currentTarget.setPointerCapture(e.pointerId);
        },
        onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
          const d = drag.current;
          const panel = panelRef.current;
          if (!d || !panel || d.id !== e.pointerId) return;
          d.dy = Math.max(0, e.clientY - d.y);
          panel.style.transition = "none";
          panel.style.transform = `translateY(${d.dy}px)`;
        },
        onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
          const d = drag.current;
          const panel = panelRef.current;
          drag.current = null;
          if (!d || !panel) return;
          e.currentTarget.releasePointerCapture(e.pointerId);
          panel.style.transition = "";
          panel.style.transform = "";
          if (d.dy > 72) onClose();
        },
        onPointerCancel: () => {
          drag.current = null;
          if (panelRef.current) {
            panelRef.current.style.transition = "";
            panelRef.current.style.transform = "";
          }
        },
      }
    : {};

  const body = scrollAreaProps(sheet || ownsWheel);

  return (
    <>
      <button
        ref={scrimRef}
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 z-30 transition-opacity duration-300 ease-out",
          sheet ? "rounded-[18px] bg-ink/[0.22]" : "rounded-[14px] bg-ink/[0.06]",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="Video details"
        inert={!open}
        className={cn(
          "absolute z-40 flex flex-col bg-paper transition-transform duration-[380ms] ease-out",
          sheet
            ? "inset-x-0 bottom-0 h-[86%] rounded-t-[18px] shadow-[0_-1px_0_var(--hairline),0_-20px_44px_-26px_rgb(15_15_15/0.4)]"
            : "bottom-0 right-0 top-0 w-[432px] rounded-r-[14px] shadow-[-1px_0_0_var(--hairline),-24px_0_48px_-28px_rgb(15_15_15/0.28)]",
          open ? "pointer-events-auto translate-x-0 translate-y-0" : sheet ? "translate-y-[calc(100%+16px)]" : "translate-x-[calc(100%+24px)]",
        )}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            // preventDefault also stops a surrounding modal <dialog> (Full Control) from closing.
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }
        }}
      >
        {/* The header and body mount on first open: the closed drawer adds no skeleton markup. */}
        {shown ? (
          <>
            {sheet ? (
              <span aria-hidden className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-ink/15" />
            ) : null}
            <header
              className={cn(
                "flex shrink-0 items-center gap-2 border-b",
                sheet ? "h-[52px] touch-none pl-4 pr-1.5" : "h-[52px] pl-4 pr-2.5",
              )}
              {...dragHandlers}
            >
              {current?.platform ? <PlatformIcon platform={current.platform} size={14} className="text-ink-2" /> : null}
              {card ? (
                <span className="min-w-0 truncate text-[13.5px] font-semibold text-ink">{creator ?? "Video"}</span>
              ) : (
                <Bar w={120} h={9} />
              )}
              {current?.platform ? (
                <span className="font-mono text-[12px] text-muted">{PLATFORM_LABEL[current.platform]}</span>
              ) : null}
              {current?.badge ? (
                <span className="ml-auto rounded-[6px] bg-ink px-1.5 py-1 font-mono text-[12.5px] leading-none text-paper tabular-nums">
                  {current.badge}
                </span>
              ) : (
                <span className="ml-auto" />
              )}
              <button
                ref={closeRef}
                type="button"
                aria-label="Close"
                onClick={onClose}
                className={cn(
                  "grid place-items-center text-muted outline-none transition-colors duration-150 hover:bg-surface hover:text-ink",
                  "focus-visible:shadow-[0_0_0_2px_var(--accent)]",
                  sheet ? "size-11 rounded-[12px]" : "size-7 rounded-[8px]",
                )}
              >
                <X aria-hidden className={sheet ? "size-5" : "size-4"} />
              </button>
            </header>

            <div
              {...body}
              style={sheet ? { overscrollBehavior: "contain" } : body.style}
              className={cn(
                styles.noScrollbar,
                styles.fadeBottom,
                "min-h-0 flex-1 px-4 pb-6 pt-4",
                scrollAreaOverflow(sheet || ownsWheel),
              )}
            >
              {card ? (
                <>
                  <div className="flex gap-3.5">
                    {/* MediaSpotlight */}
                    <span className="relative h-[204px] w-[115px] shrink-0 overflow-hidden rounded-[12px] bg-surface">
                      {card.thumbnail_url ? (
                        <Image src={card.thumbnail_url} alt="" fill sizes="115px" unoptimized className="object-cover" />
                      ) : null}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-4 text-[13.5px] leading-snug text-ink-2">{caption}</p>
                      <p className="mb-2 mt-4 text-[13px] font-semibold text-ink">Video metrics</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {METRICS.map(({ label, key, Icon }) => (
                          <div key={label} className="rounded-[8px] bg-surface/70 px-2 py-1.5">
                            <p className="flex items-center gap-1 text-[12px] text-muted">
                              <Icon aria-hidden className="size-3" />
                              {label}
                            </p>
                            <p className="mt-0.5 font-mono text-[13.5px] tabular-nums text-ink">{formatCount(card.metrics[key])}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {card.analysis ? (
                    <Analysis analysis={card.analysis} />
                  ) : (
                    <div className="mt-5 rounded-[10px] px-3 py-3 shadow-[inset_0_0_0_1px_var(--hairline)]">
                      <p className="text-[13px] font-semibold text-ink">Full analysis in ContHunt</p>
                      <p className="mt-1 text-[13px] leading-snug text-muted">
                        Research findings, hook, transcript, scenes and timeline for every video in the run.
                      </p>
                      <OpenContHunt />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex gap-3.5">
                    {/* MediaSpotlight */}
                    <span aria-hidden className={cn(styles.shimmer, "relative h-[204px] w-[115px] shrink-0 rounded-[12px] bg-surface")}>
                      {open ? <span className={styles.sweep} /> : null}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Bar w="90%" h={9} />
                      <Bar w="64%" h={9} className="mt-2" />
                      <p className="mb-2 mt-4 text-[13px] font-semibold text-ink">Video metrics</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {METRICS.map(({ label, Icon }) => (
                          <div key={label} className="rounded-[8px] bg-surface/70 px-2 py-1.5">
                            <p className="flex items-center gap-1 text-[12px] text-muted">
                              <Icon aria-hidden className="size-3" />
                              {label}
                            </p>
                            <Bar w={38} h={9} className="mt-1 bg-surface-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mb-2 mt-5 text-[13px] font-semibold text-ink">Research Findings</p>
                  <div className="flex flex-col gap-1">
                    {[0.78, 0.64, 0.7].map((w, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-[8px] px-2 py-2 shadow-[inset_0_0_0_1px_var(--hairline)]">
                        <ChevronRight aria-hidden className="size-3.5 shrink-0 text-faint" />
                        <Bar w={`${w * 100}%`} />
                        <span className="ml-auto shrink-0 rounded-full bg-surface px-1.5 py-0.5 font-mono text-[11.5px] text-muted">
                          <span className="inline-block w-5 rounded-[3px] bg-surface-2 align-middle" style={{ height: 6 }} /> support
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-col gap-3.5">
                    {ANALYSIS.map((label) => (
                      <div key={label}>
                        <p className="font-mono text-[11.5px] uppercase tracking-[0.04em] text-muted">{label}</p>
                        {label === "Key topics" ? (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {[54, 72, 46, 64].map((w, j) => (
                              <Bar key={j} w={w} h={18} className="rounded-full" />
                            ))}
                          </div>
                        ) : (
                          <div className="mt-1.5 flex flex-col gap-1.5">
                            <Bar w="96%" />
                            <Bar w={label === "CTA" ? "48%" : "72%"} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 border-t">
                    {COLLAPSIBLES.map((label) => {
                      const isOpen = !!openRows[label];
                      return (
                        <div key={label} className="border-b">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setOpenRows((r) => ({ ...r, [label]: !r[label] }))}
                            className="flex h-9 w-full items-center justify-between px-1 text-[13.5px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
                          >
                            {label}
                            <ChevronRight aria-hidden className={cn("size-3.5 text-muted transition-transform duration-200", isOpen ? "rotate-90" : "")} />
                          </button>
                          {isOpen ? (
                            <div className={cn(styles.reveal, "flex flex-col gap-1.5 px-1 pb-3")}>
                              <Bar w="92%" />
                              <Bar w="80%" />
                              <Bar w="58%" />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
