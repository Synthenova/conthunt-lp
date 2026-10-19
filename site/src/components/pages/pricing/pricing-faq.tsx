"use client";

/**
 * PricingFaq: the fine print for the pricing page, one answer open at a time.
 *
 * The shared FAQ section does not expose an `items` prop, so this is a small
 * page-local list. Every answer is built from `plans.ts` or from copy the app itself
 * ships (trial wording), so nothing here is invented. Only the three paid plans are mentioned,
 * always in `PLANS` order (cheapest first), so a rename or a swap of the names needs no edit here.
 */
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Section } from "@/components/layout/section";
import {
  CREDITS_PER_VIDEO,
  PLANS,
  PLATFORM_UNITS_PER_KEYWORD_SEARCH,
  TRIAL_DAYS,
  type Plan,
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

/** "A, B and C", one entry per plan in `PLANS` order. */
const forEachPlan = (describe: (plan: Plan) => string): string => {
  const parts = PLANS.map(describe);
  return parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
};

/** The entry plan: the base of the "5x" and "20x" steps. */
const ENTRY = PLANS[0];
const huntMultiple = (plan: Plan): number => Math.round(plan.allowance.huntCredits / ENTRY.allowance.huntCredits);

const ITEMS: Item[] = [
  {
    q: "What happens after the 1-week trial?",
    a: (
      <>
        {forEachPlan((p) => p.name)} all start with a {TRIAL_DAYS}-day free trial. When the {TRIAL_DAYS} days end, the
        plan you picked begins, billed yearly or monthly as you chose.
      </>
    ),
  },
  {
    q: "Is the trial the full allowance?",
    a: (
      <>
        No, it runs on a smaller one.{" "}
        {PLANS.map((p) => `${p.name} gets ${formatInt(p.trial.huntCredits)} hunt credits and ${formatInt(p.trial.aiCredits)} AI credits.`).join(" ")}{" "}
        The full monthly allowance begins with your plan.
      </>
    ),
  },
  {
    q: "What are hunt credits and AI credits?",
    a: (
      <>
        Hunt credits pay for finding videos: searching and tracking spend one pool. A search costs one hunt credit per
        platform it queries, so a keyword across TikTok, Instagram Reels and YouTube Shorts costs{" "}
        {PLATFORM_UNITS_PER_KEYWORD_SEARCH}. Tracking costs one per tracked item per refresh. AI credits pay for everything
        model-backed: video analysis, Deep Search, chat and insights. As a planning estimate, one video costs about{" "}
        {CREDITS_PER_VIDEO.toFixed(1)} AI credits, so {formatInt(ENTRY.allowance.aiCredits)} credits cover about{" "}
        {formatInt(approx(videosForCredits(ENTRY.allowance.aiCredits)))} videos. Real use varies with video length and
        follow-up questions.
      </>
    ),
  },
  {
    q: "Do bigger plans give me more for the money?",
    a: (
      <>
        Yes. At monthly prices, each dollar buys about{" "}
        {forEachPlan((p) => `${creditsPerDollar(p)} AI credits on ${p.name}`)}. Hunt credits scale the same way:{" "}
        {PLANS.slice(1)
          .map((p, i) => `${p.name} has ${huntMultiple(p)}x${i === 0 ? ` the hunt credits of ${ENTRY.name}` : ""}`)
          .join(" and ")}
        .
      </>
    ),
  },
  {
    q: "How is yearly billing charged?",
    a: (
      <>
        Once a year:{" "}
        {forEachPlan((p) => `$${formatInt(yearlyTotal(p))} for ${p.name} ($${p.price.yearly} a month)`)}. Monthly plans are{" "}
        {forEachPlan((p) => `$${p.price.monthly}`)}. Yearly saves {forEachPlan((p) => `$${yearlySavingUsd(p)}`)} a year.
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
