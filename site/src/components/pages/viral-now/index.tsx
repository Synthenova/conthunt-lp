/**
 * /viral-now page body: "Viral now." header, the sticky niche selector, Netflix-style rows
 * (All) or the 30-video grid (one niche), and a closing call to action.
 *
 * Server component. The first paint is niche shells. The client provider fills those rows
 * from the live public boards after hydration.
 *
 *   <ViralNowPage niche="fitness-gym" />   // opens on one niche; omit for the rows
 *
 * Data contract and fallback order: docs/revamp/specs/viral-now-spec.md. Components:
 *   provider.tsx   data context (seed, then live overlay)      header-parts.tsx  status line, facts
 *   explorer.tsx   URL state, crossfade, dialog control        niche-selector.tsx  sticky filter row
 *   niche-row.tsx  one Netflix row (lazy mounted)              niche-view.tsx     the 30-video grid
 *   video-card.tsx poster card with hover preview              video-dialog.tsx   native modal dialog
 *   h-scroller.tsx side-scroller with edge blur and drag       ranking-explainer.tsx  "How ranking works"
 *
 * Copy that depends on the data source (snapshot, live, trending) lives in lib/viral-now/copy.ts.
 */
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { loadViralNowData, loadViralNowInitial } from "@/lib/viral-now/load";
import { CtaBand } from "./cta-band";
import { Explorer } from "./explorer";
import { Facts, StatusLine, Subline } from "./header-parts";
import { GlyphSprite } from "./parts";
import { ViralNowProvider } from "./provider";
import { RankingExplainer } from "./ranking-explainer";

export interface ViralNowPageProps {
  /** Niche slug to open on, for example "fitness-gym". Unknown or missing slugs show the rows. */
  niche?: string | null;
}

export default function ViralNowPage({ niche = null }: ViralNowPageProps) {
  const initialActive = niche && loadViralNowData().niches.some((n) => n.slug === niche) ? niche : null;
  // Only what the first paint shows goes into the HTML; the rest of the snapshot streams in (see lib/viral-now/wire.ts).
  const initial = loadViralNowInitial(initialActive);

  return (
    <ViralNowProvider initial={initial}>
      <GlyphSprite />
      <div className="letterbox pb-7 pt-[clamp(16px,3vw,44px)] md:pb-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 md:mb-6">
          <StatusLine />
          <Facts />
        </div>
        <SectionHeader
          as="h1"
          title={
            <>
              Viral <Emphasis>now</Emphasis>.
            </>
          }
          sub={<Subline />}
          actions={<RankingExplainer />}
        />
      </div>

      <Explorer initialActive={initialActive} />
      <HowBoardsWork />
      <CtaBand />
    </ViralNowProvider>
  );
}

/** Crawlable explanation under the boards. The header popover stays the short version. */
function HowBoardsWork() {
  return (
    <section aria-labelledby="vn-how" className="letterbox pb-4 pt-12 md:pt-16">
      <h2 id="vn-how" className="max-w-[22ch] text-[22px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
        How these boards are ranked
      </h2>
      <div className="mt-5 flex max-w-[62ch] flex-col gap-4">
        <p className="body-l text-ink-2/80">
          Written by the ContHunt team. Each row is one niche. A niche holds up to 30 public short videos from TikTok, Reels, and Shorts.
        </p>
        <p className="body-l text-ink-2/75">
          Videos are ranked inside that niche, not against the whole site. A fitness video is only compared with other fitness videos. A creator can take at most three spots on one board.
        </p>
        <p className="body-l text-ink-2/75">
          Snapshot boards use a fixed blend. Live boards are refreshed on a daily pass and scored from each video&apos;s saved analysis plus its reach. A niche without a live board keeps the snapshot.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-[17px] leading-relaxed text-ink-2/80">
          <li>Reach is 45 percent of a snapshot score. Views sit on a log scale, so one giant video does not flatten the niche.</li>
          <li>Engagement is 25 percent. That is likes, comments, and shares per view.</li>
          <li>Velocity is 20 percent. That is views per day since the video was posted.</li>
          <li>Recency is 10 percent. It keeps the board on the week it covers.</li>
        </ul>
        <p className="body-l text-ink-2/75">
          Those four weights are for the snapshot only. A live board does not reuse that split. The status line tells you which source you are on. A snapshot also names the week it was taken. Counts on a snapshot stay as they were that day.
        </p>
        <p className="body-l text-ink-2/75">
          Open a video for the counts and the rank inside its niche. The order on the row is the rank. It is not the order a platform used on its own page.
        </p>
        <p className="body-l text-ink-2/75">
          When a niche is the one you care about, deep search is the next step. It reads a much larger set from that niche and returns the hooks, formats, and patterns. The boards here are the short list, not that pass.
        </p>
        <p className="body-l text-ink-2/75">
          Open a niche for the full grid. The row is the short list you can scroll. The grid is the same ranking, with more of that niche on screen at once.
        </p>
      </div>
    </section>
  );
}
