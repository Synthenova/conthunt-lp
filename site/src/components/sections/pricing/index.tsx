/**
 * Home section 04: quick pricing (`[ 04 / 08 ] · PRICING`).
 *
 * Three compact plan cards from `plans.ts` (who it is for, price, CTA with the one trial line,
 * the monthly allowance and the feature ladder, so the plans compare in one view; pricing rev 3),
 * outside the letterbox at `--wide` (owner, 2026-10-19; the heading keeps the column, the toggle ends on the cards'
 * right edge), yearly by default, a Yearly/Monthly toggle with a computed "Save up to N%" chip,
 * a 7-day free trial on every plan, and a link on to /pricing#calculator.
 *
 * Reusable exports for other pages:
 *   PlanCards (variant "full" | "compact"), BillingProvider, BillingToggle, useBilling,
 *   RollingNumber, MonoLabel, PLANS (+ helpers from ./plans)
 * The /pricing page wraps PlanCards and its calculator in one BillingProvider so
 * both follow the same Yearly/Monthly choice.
 */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Letterbox } from "@/components/layout/letterbox";
import { Section } from "@/components/layout/section";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/lib/links";
// The island's CSS ships with the page (its components load with the island).
import "./pricing.module.css";
import { BillingProvider, BillingToggle, PlanCards } from "./island";

// Client components are not re-exported here: a re-export would put their code in the
// first-load JavaScript of every page that renders this section. Import them from their files.
export { MonoLabel, PageEyebrow } from "./mono-label";
export * from "./plans";

export default function PricingSection() {
  return (
    <Section sectionKey="pricing" letterbox={false}>
      <BillingProvider>
        <Letterbox>
          {/* The toggle sits in its own row, not in the header's `actions` slot: `actions` shares the
              heading's row and squeezes it to about 550px, which broke the heading mid-line. */}
          <SectionHeader
            index={4}
            total={8}
            label="Pricing"
            title={
              <>
                Start with a free <Emphasis className="text-green">week</Emphasis>.
              </>
            }
            muted={<span className="block">Then pick your pace.</span>}
            headingClassName="max-w-none"
          />
        </Letterbox>
        {/* The intro row spans the card row (`--wide`) so the toggle ends on the cards' right edge, and pads its left
            side back to the letterbox rail so the line starts under the heading. */}
        <div className="mx-auto mt-6 flex w-(--wide) flex-col gap-6 pl-[calc((var(--wide)_-_var(--letterbox))/2)] lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <p className="body-l max-w-[52ch] text-ink-2/75">
            Every plan has Deep Search, MCP access and competitor tracking. Pick the one that matches how much you research.
          </p>
          <BillingToggle className="self-start lg:self-auto" />
        </div>

        <PlanCards
          variant="compact"
          className="mt-12 md:mt-14 lg:mt-16"
          footer={
            <Link
              href={`${ROUTES.pricing}#calculator`}
              className="group/link inline-flex shrink-0 items-center gap-2 text-[15px] font-medium text-ink"
            >
              <span className="border-b border-ink/30 pb-px transition-colors duration-200 group-hover/link:border-ink">
                Not sure? Try the pricing calculator
              </span>
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover/link:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          }
        />
      </BillingProvider>
    </Section>
  );
}
