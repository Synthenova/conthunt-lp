/**
 * /pricing page body (server component).
 *
 *   1. Page header (h1 with one Boska keyword) + Yearly/Monthly toggle
 *   2. PlanCards, full variant, outside the letterbox at `--wide` (fuller feature wording and a note under each
 *      Every-month allowance; Home uses the compact one)
 *   3. The calculator (#calculator): use cases, volume, extras, time saved, recommended plan
 *   4. Testimonials marquee (retained, imported from the testimonials section)
 *   5. A short pricing FAQ (page-local: the shared FAQ section has no `items` prop)
 *
 * One <BillingProvider> wraps cards and calculator, so the Yearly/Monthly choice is shared.
 * Everything between the navbar and the footer sits inside <Rails>, like Home.
 */
import { Letterbox } from "@/components/layout/letterbox";
import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";
import { BillingProvider, BillingToggle } from "@/components/sections/pricing/billing";
import { PageEyebrow } from "@/components/sections/pricing/mono-label";
import { PlanCards } from "@/components/sections/pricing/plan-cards";
import TestimonialsSection from "@/components/sections/testimonials";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { PricingCalculator } from "./calculator";
import { PricingFaq } from "./pricing-faq";

export default function PricingPage() {
  return (
    <BillingProvider>
      <Rails>
        <Section
          sectionKey="pricing-plans"
          id="plans"
          padding="none"
          letterbox={false}
          className="pb-[calc(var(--section-pad-y)*0.5)] pt-[calc(var(--nav-h)+clamp(3rem,7vw,6rem))]"
        >
          {/* Heading on its own row at full width; the toggle sits with the sub line below it. The cards
              leave the letterbox for `--wide`, the calculator tray's width; the heading keeps the column. */}
          <Letterbox>
            <PageEyebrow className="mb-5">Pricing</PageEyebrow>
            <SectionHeader
              as="h1"
              title="Pay for the research,"
              muted={
                <span className="block">
                  <Emphasis>keep</Emphasis> the hours.
                </span>
              }
              headingClassName="max-w-none"
            />
          </Letterbox>
          {/* The intro row spans the card row (`--wide`) so the toggle ends on the cards' right edge, and pads its
              left side back to the letterbox rail so the line starts under the heading. */}
          <div className="mx-auto mt-6 flex w-(--wide) flex-col gap-6 pl-[calc((var(--wide)_-_var(--letterbox))/2)] lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <p className="body-l max-w-[52ch] text-ink-2/75">
              Three plans, each with a 1-week free trial. And a calculator that turns Deep Searches into hours back.
            </p>
            <BillingToggle className="self-start lg:self-auto" />
          </div>
          <PlanCards className="mt-12 md:mt-14 lg:mt-16" headingLevel="h2" />
        </Section>
        <PricingCalculator />
        <TestimonialsSection />
        <PricingFaq />
      </Rails>
    </BillingProvider>
  );
}
