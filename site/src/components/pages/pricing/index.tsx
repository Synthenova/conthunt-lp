/**
 * /pricing page body (server component).
 *
 *   1. Page header (h1 with one Boska keyword) + Yearly/Monthly toggle
 *   2. PlanCards, full variant (allowance sheet and capacity strip; Home uses the compact one)
 *   3. The calculator (#calculator): use cases, volume, extras, time saved, recommended plan
 *   4. Testimonials marquee (retained, imported from the testimonials section)
 *   5. A short pricing FAQ (page-local: the shared FAQ section has no `items` prop)
 *
 * One <BillingProvider> wraps cards and calculator, so the Yearly/Monthly choice is shared.
 * Everything between the navbar and the footer sits inside <Rails>, like Home.
 */
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
          className="pb-[calc(var(--section-pad-y)*0.5)] pt-[calc(var(--nav-h)+clamp(3rem,7vw,6rem))]"
        >
          {/* Heading on its own row at full width; the toggle sits with the sub line below it. */}
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
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <p className="body-l max-w-[52ch] text-ink-2/75">
              Three plans, each with a 1-week free trial. And a calculator that turns Deep Searches into hours back.
            </p>
            <BillingToggle surface="pricing" className="self-start lg:self-auto" />
          </div>
          <PlanCards className="mt-12 md:mt-14" headingLevel="h2" />
        </Section>
        <PricingCalculator />
        <TestimonialsSection />
        <PricingFaq />
      </Rails>
    </BillingProvider>
  );
}
