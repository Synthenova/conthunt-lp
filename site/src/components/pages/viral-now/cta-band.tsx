/**
 * CtaBand: the closing call to action under the boards. Deep search is the product's
 * crown jewel, so the page ends by pointing at it.
 */
import { RailSeam } from "@/components/layout/rails";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL, ROUTES } from "@/lib/links";
import { CTA_ID } from "./ids";

// SplitText clones an `id` on the split text into every line, so the section is named with an aria-label
// (the same words as the heading) and owns the one id, which the "Skip niche rows" link targets.
const CTA_TITLE = "Found your niche? Go deeper.";

export function CtaBand() {
  return (
    // tabIndex -1: the skip link moves focus here, so the next Tab lands on "Get started". It is not a tab stop itself.
    <section id={CTA_ID} aria-label={CTA_TITLE} tabIndex={-1} className="relative scroll-mt-24 outline-none">
      <RailSeam />
      <div className="mx-auto h-px w-[var(--letterbox)] bg-hairline" />
      <div className="letterbox py-[var(--section-pad-y)]">
        <SectionHeader
          as="h2"
          size="l"
          title={
            <>
              Found your niche? Go <Emphasis>deeper</Emphasis>.
            </>
          }
          sub="Deep search watches 500 to 1,000 videos in your niche and analyzes them in under five minutes. You get the hooks, formats and patterns behind the winners, backed by real video data."
          actions={
            <>
              <Button href={GET_STARTED_URL} size="lg" {...phAttrs("viral_band", "app")}>
                Get started
              </Button>
              <Button href={`${ROUTES.home}#how-it-works`} variant="ghost" size="lg">
                See how it works
              </Button>
            </>
          }
        />
      </div>
    </section>
  );
}
