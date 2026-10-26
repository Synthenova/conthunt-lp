"use client";

/**
 * NicheRow: one Netflix-style row (title line, side-scroller of ranked cards, end-cap).
 *
 * Rows below the fold render a same-height skeleton and mount their cards when they come
 * within ~900px of the viewport, so the page never builds 600 cards at once. Rows that
 * mount after load fade their first cards in; rows that are server-rendered do not
 * animate (they are already visible).
 *
 * The server render holds only the first few cards of the first rows and the rest of the
 * snapshot streams in after hydration (see lib/viral-now/wire.ts). A row whose videos have not
 * all arrived keeps its final width with placeholder slots, so nothing shifts when they land.
 */
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RailSeam } from "@/components/layout/rails";
import { EASE, gsap } from "@/lib/gsap";
import { onceInView } from "@/lib/media";
import { prefersReducedMotion } from "@/lib/motion";
import { GET_STARTED_URL } from "@/lib/links";
import { countLabel } from "@/lib/viral-now/copy";
import { formatCount } from "@/lib/viral-now/format";
import { nicheLoaded, nicheSize, nicheViews } from "@/lib/viral-now/stats";
import type { ViralNowNiche, ViralNowVideo } from "@/lib/viral-now/types";
import { EAGER_ROWS } from "@/lib/viral-now/wire";
import { nicheHue } from "@/content/viral-now/niche-hues";
import { toneVars } from "@/lib/tones";
import { HScroller } from "./h-scroller";
import { useViralNow } from "./provider";
import { VideoCard } from "./video-card";
import styles from "./viral-now.module.css";

export interface NicheRowProps {
  niche: ViralNowNiche;
  /** Position in the page. Rows 0 and 1 render their cards on the server. */
  index: number;
  onSelect: (slug: string) => void;
  onOpen: (niche: ViralNowNiche, video: ViralNowVideo, trigger: HTMLElement) => void;
}

export function NicheRow({ niche, index, onSelect, onOpen }: NicheRowProps) {
  const { seedStatus, retrySeed, ensureFull } = useViralNow();
  const rootRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(index < EAGER_ROWS);
  const lateMount = useRef(false);

  const size = nicheSize(niche);
  const loaded = niche.videos.length;
  const complete = nicheLoaded(niche);

  useEffect(() => {
    const el = rootRef.current;
    if (mounted || !el) return;
    return onceInView(
      el,
      () => {
        lateMount.current = true;
        setMounted(true);
      },
      { rootMargin: "900px 0px" },
    );
  }, [mounted]);

  // A row on screen needs all its videos now. `source` and `loaded` are in the dependency list
  // because the first pass runs on an empty shell, before the live board has replaced it.
  useEffect(() => {
    if (mounted && !complete) ensureFull(niche.slug);
  }, [mounted, complete, ensureFull, niche.slug, niche.source, loaded]);

  // Cards that mount while scrolling rise in; the first screen of a server-rendered row does not move.
  const hasCards = loaded > 0;
  useEffect(() => {
    if (!mounted || !hasCards || !lateMount.current || prefersReducedMotion()) return;
    const items = bodyRef.current?.querySelectorAll("[data-snap]:not([aria-hidden])");
    if (!items || items.length === 0) return;
    const tween = gsap.from(Array.from(items).slice(0, 8), {
      opacity: 0,
      y: 22,
      duration: 0.7,
      ease: EASE.out,
      stagger: 0.05,
      clearProps: "opacity,transform",
    });
    return () => {
      tween.revert();
    };
  }, [mounted, hasCards]);

  const totalViews = nicheViews(niche);
  const failed = mounted && !hasCards && seedStatus === "error" && niche.source === "seed";
  const headingId = `vn-row-${niche.slug}`;

  return (
    <section ref={rootRef} aria-labelledby={headingId} data-niche={niche.slug} style={toneVars(nicheHue(niche.slug))}>
      {index > 0 && (
        <>
          <RailSeam />
          <div className={styles.rowRule} />
        </>
      )}
      <div className="letterbox flex items-end justify-between gap-6 pt-7">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id={headingId} className="flex items-center gap-2.5 text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-[3px] bg-[var(--tone-mark)]" />
            {niche.name}
          </h2>
          <span className="text-sm text-ink-2/70">{countLabel(niche, size, "row")}</span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {totalViews > 0 && (
            <span
              title="Total views across these videos"
              className="hidden font-mono text-xs tabular-nums tracking-[0.02em] text-ink-2/70 sm:inline"
            >
              {formatCount(totalViews)} views
            </span>
          )}
          <a
            href={`?niche=${niche.slug}`}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
              event.preventDefault();
              onSelect(niche.slug);
            }}
            aria-label={`See all ${size} ${niche.name} videos`}
            className="group/see inline-flex h-9 items-center gap-1.5 rounded-btn px-3 text-sm font-medium text-ink transition-colors duration-200 ease-out hover:bg-surface hover:text-[var(--tone-ink)]"
          >
            See all
            <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover/see:translate-x-0.5" strokeWidth={2} />
          </a>
        </div>
      </div>

      <div ref={bodyRef} className={styles.rowBody}>
        {mounted && hasCards ? (
          <HScroller as="ul" label={`${niche.name}, ranked videos`} arrows roving keepActiveClear className={styles.rowHs}>
            {niche.videos.map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                variant="row"
                eager={index === 0 && i < 4}
                early={i < 4}
                tabStop={i === 0}
                entrance={index === 0 && i < 6 ? i : undefined}
                onOpen={(v, trigger) => onOpen(niche, v, trigger)}
              />
            ))}
            {/* Empty slots for the videos still on their way, so the row is already its final width. */}
            {Array.from({ length: Math.max(size - loaded, 0) }, (_, i) => (
              <li key={`slot-${i}`} data-snap="" aria-hidden="true" className={styles.item} data-digits={loaded + i + 1 >= 10 ? "2" : "1"}>
                <span className={styles.skel} />
              </li>
            ))}
            <li data-snap="" className={`${styles.item}`} data-plain="true">
              <EndCap niche={niche} size={size} onSelect={onSelect} />
            </li>
          </HScroller>
        ) : failed ? (
          <div className="letterbox flex flex-col items-start gap-3 py-12">
            <p className="text-[15px] text-ink-2">These videos did not load.</p>
            <Button variant="secondary" size="sm" onClick={retrySeed}>
              Try again
            </Button>
          </div>
        ) : (
          <div className={`${styles.hs} ${styles.rowHs}`} aria-hidden="true">
            <div className={styles.scroller} style={{ overflow: "hidden" }}>
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className={styles.skel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function EndCap({ niche, size, onSelect }: { niche: ViralNowNiche; size: number; onSelect: (slug: string) => void }) {
  return (
    <div className={styles.endcap}>
      <div className="flex flex-col gap-3">
        <span className="eyebrow text-muted!">End of the board</span>
        <p className="text-[19px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
          Want the full {niche.label.toLowerCase()} picture?
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="secondary" size="sm" className="w-full bg-paper hover:bg-surface-2" onClick={() => onSelect(niche.slug)}>
          See all {size}
        </Button>
        <Button size="sm" className="w-full" href={GET_STARTED_URL}>
          Run a deep search
        </Button>
        <p className="pt-1 text-[12px] leading-snug text-muted">Deep search watches 500 to 1,000 videos in your niche.</p>
      </div>
    </div>
  );
}
