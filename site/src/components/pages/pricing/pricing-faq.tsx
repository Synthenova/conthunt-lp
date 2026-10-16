"use client";

/**
 * PricingFaq: the fine print for the pricing page, one answer open at a time.
 *
 * The shared FAQ section does not expose an `items` prop, so this is a small
 * page-local list. Every answer is built from `plans.ts` or from copy the app itself
 * ships (trial wording), so nothing here is invented. Only the three paid plans are mentioned.
 */
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Section } from "@/components/layout/section";
import {
  CREATOR,
  CREDITS_PER_VIDEO,
  type Plan,
  PRO,
  RESEARCH,
  approx,
  formatInt,
  videosForCredits,
  yearlySavingUsd,
  yearlyTotal,
} from "@/components/sections/pricing/plans";
import { PageEyebrow } from "@/components/sections/pricing/mono-label";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/cn";
import { GET_STARTED_URL } from "@/lib/links";
import styles from "./calculator.module.css";

interface Item {
  q: string;
  a: ReactNode;
}

/** AI credits one dollar buys at the monthly price, rounded. */
const creditsPerDollar = (plan: Plan): number =>
  Math.round(plan.allowance.aiCredits / plan.price.monthly);

const ITEMS: Item[] = [
  {
    q: "What happens after the 1-week trial?",
    a: (
      <>
        {CREATOR.name}, {PRO.name} and {RESEARCH.name} all start with a 7-day free trial. When the 7 days end, the plan
        you picked begins, billed yearly or monthly as you chose.
      </>
    ),
  },
  {
    q: "Is the trial the full allowance?",
    a: (
      <>
        No, it runs on a smaller one. {CREATOR.name} gets {CREATOR.trial.searches} searches and{" "}
        {formatInt(CREATOR.trial.aiCredits)} AI credits. {PRO.name} gets {PRO.trial.searches} searches and{" "}
        {formatInt(PRO.trial.aiCredits)} AI credits. {RESEARCH.name} gets {RESEARCH.trial.searches} searches and{" "}
        {formatInt(RESEARCH.trial.aiCredits)} AI credits. Tracking credits begin with your plan.
      </>
    ),
  },
  {
    q: "What counts as a search, and what is an AI credit?",
    a: (
      <>
        A search is one platform queried, so a keyword across TikTok, Instagram Reels and YouTube Shorts counts as 3. AI
        credits pay for everything model-backed: video analysis, Deep Search, chat and insights. As a planning estimate,
        one video costs about {CREDITS_PER_VIDEO.toFixed(1)} credits, so {formatInt(CREATOR.allowance.aiCredits)} credits
        cover about {formatInt(approx(videosForCredits(CREATOR.allowance.aiCredits)))} videos. Real use varies with video
        length and follow-up questions.
      </>
    ),
  },
  {
    q: "Do bigger plans give me more for the money?",
    a: (
      <>
        Yes. At monthly prices, each dollar buys about {creditsPerDollar(CREATOR)} AI credits on {CREATOR.name},{" "}
        {creditsPerDollar(PRO)} on {PRO.name} and {creditsPerDollar(RESEARCH)} on {RESEARCH.name}. Searches and tracking
        credits grow the same way.
      </>
    ),
  },
  {
    q: "How is yearly billing charged?",
    a: (
      <>
        Once a year: ${formatInt(yearlyTotal(CREATOR))} for {CREATOR.name} (${CREATOR.price.yearly} a month),{" "}
        ${formatInt(yearlyTotal(PRO))} for {PRO.name} (${PRO.price.yearly} a month) and ${formatInt(yearlyTotal(RESEARCH))}{" "}
        for {RESEARCH.name} (${RESEARCH.price.yearly} a month). Monthly plans are ${CREATOR.price.monthly},{" "}
        ${PRO.price.monthly} and ${RESEARCH.price.monthly}. Yearly saves ${yearlySavingUsd(CREATOR)}, ${yearlySavingUsd(PRO)} and{" "}
        ${yearlySavingUsd(RESEARCH)} a year.
      </>
    ),
  },
  {
    q: "Which platforms does it cover?",
    a: <>Searches run on TikTok, Instagram Reels and YouTube Shorts.</>,
  },
];

export function PricingFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section sectionKey="pricing-faq">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <PageEyebrow className="mb-5">Pricing FAQ</PageEyebrow>
          <SectionHeader
            size="m"
            title={
              <>
                The fine print, in <Emphasis>plain</Emphasis> English.
              </>
            }
            headingClassName="max-w-[14ch]"
          />
          <div className="mt-8">
            <Button href={GET_STARTED_URL}>Get started</Button>
          </div>
        </div>

        <ul className="border-t border-hairline">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className="border-b border-hairline">
                <h3>
                  <button
                    type="button"
                    id={`pfaq-btn-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`pfaq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group/q flex w-full items-center justify-between gap-6 py-5 pr-1 text-left"
                  >
                    <span className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-ink">{item.q}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full bg-surface text-ink transition-[transform,background-color] duration-300 ease-out group-hover/q:bg-surface-2",
                        isOpen && "rotate-45",
                      )}
                    >
                      <Plus className="size-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={`pfaq-${i}`}
                  role="region"
                  aria-labelledby={`pfaq-btn-${i}`}
                  className={styles.disclosure}
                  data-open={isOpen}
                >
                  <div inert={!isOpen}>
                    <p className="max-w-[60ch] pb-6 pr-8 text-[15px] leading-[1.6] text-ink-2">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
