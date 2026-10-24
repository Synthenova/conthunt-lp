/**
 * Tracking section: `[ 05 / 08 ] · TRACKING` with an Experimental badge.
 * Preview: /preview/tracking.
 *
 * Header (eyebrow + badge, two-tone heading, the shared muted sub, Get started on the
 * right like Bento), then a two-column row from lg: the ruled "What gets tracked" list on
 * the left and a light tracking board on the right (one column per public account with its
 * selected videos). Below, one full-width panel with two growth charts side by side
 * (Followers, Likes). Phones stack: list, board, charts. The board is composed, not a
 * simulation; the history shown is illustrative and labeled so ("Illustrative trend" on the
 * charts, the board footnote).
 *
 * Usage (Home renders it inside <Rails>):
 *   import TrackingSection from "@/components/sections/tracking";
 *   <TrackingSection />
 *
 * Server component. Interactive parts are client islands (feature-list, board).
 */
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeader } from "@/components/ui/section-header";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL } from "@/lib/links";
import { FeatureList, GrowthCharts, TrackingBoard, TrackingHighlightProvider } from "./island";

export default function TrackingSection() {
  return (
    // The charts close the section on their own edge, so the bottom pad is shorter than the shared one.
    <Section sectionKey="tracking" padding="top" className="pb-[calc(var(--section-pad-y)*0.6)]">
      <TrackingHighlightProvider>
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow index={5} label="Tracking" />
            <Badge tone="purple">Experimental</Badge>
          </div>
          <SectionHeader
            title={
              <>
                Watch competitors <Emphasis className="text-green">grow</Emphasis>,
              </>
            }
            muted="one day at a time."
            sub="Track any public account and the videos worth watching. ContHunt saves their numbers every day, so you can see what a competitor’s campaign actually moved."
            headingClassName="max-w-[24ch]"
            actions={
              <div className="flex flex-col items-start gap-2.5 md:items-end">
                <Button href={GET_STARTED_URL} size="md" {...phAttrs("tracking", "app")}>
                  Get started
                </Button>
                <p className="font-mono text-[11px] uppercase tracking-[0.02em] text-ink/60">Included on every plan</p>
              </div>
            }
          />
        </div>

        <div className="mt-8 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-stretch">
          <FeatureList />
          <TrackingBoard />
        </div>

        <GrowthCharts className="mt-6" />
      </TrackingHighlightProvider>
    </Section>
  );
}
