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
      <CtaBand />
    </ViralNowProvider>
  );
}
