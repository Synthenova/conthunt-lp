"use client";

/**
 * PlanCards: the three plans (Pro, Creator, Research) as cards with a picture head: the featured plan dark, the others
 * light grey.
 *
 *   <PlanCards />                                    // /pricing: the full card (fuller wording, a note per row)
 *   <PlanCards variant="compact" />                  // Home
 *   <PlanCards variant="compact" footer={<Link/>} />  // footer: extra node on the right of the footnote row
 *
 * Place it outside the Letterbox: the row is `--wide` (80% of the window from 1280px; owner, 2026-10-19), so the
 * cards are wide and short and the head carries them.
 *
 * Anatomy (pricing rev 3, owner's card head). One idea per block, read top to bottom, each fact once:
 *   1. Head: a picture (397:225, 14px radius) 10px in from the card's edge, with the plan name huge and
 *      centred, the price bottom left, the tag pill ("Most popular", "Best value") top right and, when yearly
 *      is on, a green "Save N%" pill bottom right. Everything in it scales with its width (container query
 *      units), at the proportions of the owner's Figma frame.
 *   2. The start row (reference 1): the white CTA "Start free trial →" on the left, the trial in two short
 *      lines flush right: "7 days free," in green, then what you pay after ($79/mo, or $756/yr when yearly).
 *   3. A dotted rule, then Every month: hunt credits and AI credits side by side, figure over label (the full
 *      card adds a note under each).
 *   4. The feature ladder under `plan.includes`: Pro lists its base, Creator and Research what they add.
 *      Lead figures take the value weight; a `badge` is a small chip in the plan's hue.
 *   5. Who it is for (the blurb), a muted note pinned to the bottom.
 * Side by side (lg), each card is a subgrid of the row's grid, so heads, CTAs, allowances, lists and footer notes
 * line up across the three cards whatever wraps. The trial's allowance lives once, in the footnote.
 *
 * Head pictures: HEAD_IMAGE below, the owner's art (2026-10-18) in the plan's hue (purple, red, blue). A plan
 * without one gets a dark gradient in its hue with a soft sheen and grain; a scrim keeps the white type legible on either.
 * Fonts: the plan name is --font-plan (Panchang 800, standing in for Akira Expanded), the price and pills
 * the site sans.
 *
 * Look (owner, 2026-10-19): the featured plan (Creator) is the dark card and, side by side, 7% larger; Pro and
 * Research are light grey and 7% smaller, so the middle plan reads as the one to pick. `data-tone` sets the
 * card's text colours (CSS variables in pricing.module.css). Colour is kept for meaning: the head is the plan's
 * identity, green is the trial and the saving.
 * Motion: the cards rise in once (none with reduced motion); the price rolls digit by digit when billing
 * flips; the CTA is the one hover state. Billing comes from `useBilling()`.
 */
import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { FontPreloads } from "@/components/layout/font-preloads";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK, MOTION_REDUCED } from "@/lib/motion";
import { useBilling } from "./billing";
import {
  PLANS,
  TRIAL_DAYS,
  allowanceRows,
  formatInt,
  monthlyPrice,
  yearlySavingPct,
  yearlyTotal,
  type Billing,
  type Plan,
  type PlanFeature,
  type PlanId,
} from "./plans";
import styles from "./pricing.module.css";
import { RollingNumber } from "./rolling-number";

/**
 * The card head pictures, one per plan. Drop each file at `public/media/pricing/<id>-head.webp`
 * (e.g. public/media/pricing/creator-head.webp, about 800×454 or larger, 397:225) and set its path here,
 * e.g. `creator: "/media/pricing/creator-head.webp"`. It covers the head (object-fit: cover, 14px radius)
 * under the same scrim as the placeholder. `null` shows the placeholder gradient in the plan's hue.
 */
const HEAD_IMAGE: Record<PlanId, string | null> = {
  pro: "/media/pricing/pro-head.webp",
  creator: "/media/pricing/creator-head.webp",
  research: "/media/pricing/research-head.webp",
};

export interface PlanCardsProps {
  plans?: readonly Plan[];
  className?: string;
  /** "full" (default) for /pricing; "compact" for the Home section. */
  variant?: "full" | "compact";
  /** Footnote under the cards (the trial's smaller allowance; on the full variant, how hunt credits are spent). Default true. */
  footnote?: boolean;
  /** Extra node on the right of the footnote row (Home puts the calculator link here). */
  footer?: ReactNode;
  /** Heading level for the plan names: "h3" under a section h2 (default), "h2" under a page h1. */
  headingLevel?: "h2" | "h3";
}

type HeadingTag = "h2" | "h3";

export function PlanCards({
  plans = PLANS,
  className,
  variant = "full",
  footnote = true,
  footer,
  headingLevel = "h3",
}: PlanCardsProps) {
  const { billing } = useBilling();
  const root = useRef<HTMLDivElement>(null);
  const full = variant === "full";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-plan-wrap]", {
          y: 24,
          opacity: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: EASE.out,
          scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
        });
      });
      mm.add(MOTION_REDUCED, () => {
        gsap.set("[data-plan-wrap]", { opacity: 1, y: 0 });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn(styles.cards, className)}>
      {/* /pricing paints the plan names in its first viewport (lib/fonts.ts). */}
      {full && <FontPreloads faces={["panchang800"]} />}
      <div className={styles.grid}>
        {plans.map((plan) => (
          <div key={plan.id} data-plan-wrap className={styles.wrap}>
            <PlanCard plan={plan} billing={billing} full={full} Heading={headingLevel} />
          </div>
        ))}
      </div>
      {(footnote || footer) && (
        <div className={cn(styles.foot, "mt-8 flex flex-col gap-4 lg:mt-14 lg:flex-row lg:items-baseline lg:justify-between lg:gap-10")}>
          {footnote ? (
            <p className="max-w-[72ch] text-[13px] leading-[1.6] text-ink-2/75">
              The trial runs on a smaller allowance, and your plan starts when the {TRIAL_DAYS} days end.
              {full &&
                " Hunt credits pay for searches and tracking: a keyword search costs one per platform it queries, so 3 on TikTok, Reels and Shorts."}
            </p>
          ) : (
            <span />
          )}
          {footer}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ card

function PlanCard({ plan, billing, full, Heading }: { plan: Plan; billing: Billing; full: boolean; Heading: HeadingTag }) {
  const headingId = `${full ? "plan" : "plan-compact"}-${plan.id}`;
  const rows = allowanceRows(plan);

  return (
    <article
      aria-labelledby={headingId}
      data-featured={plan.featured}
      data-tone={plan.featured ? "dark" : "light"}
      className={cn(styles.card, "rounded-card")}
    >
      <PlanHead plan={plan} billing={billing} full={full} Heading={Heading} headingId={headingId} />

      {/* Start */}
      <div className={cn(styles.start, "mt-4")}>
        <PlanCta plan={plan} full={full} />
        <TrialLine plan={plan} billing={billing} />
      </div>

      {/* Every month */}
      <div className="mt-5">
        <div className={styles.dots} aria-hidden="true" />
        <p className="mt-4 text-[13px] font-medium text-(--fg-muted)">Every month</p>
        <dl className={cn(styles.stats, "mt-2")}>
          {rows.map((row) => (
            <div key={row.key} className={styles.stat}>
              <dt className="mt-0.5 text-[13px] text-(--fg-3)">{row.label}</dt>
              <dd className="text-[20px] font-semibold leading-[1.25] tabular-nums tracking-[-0.02em] text-(--fg)">
                {formatInt(row.value)}
              </dd>
              {full && row.note && <dd className="mt-1 text-[12px] leading-snug text-balance text-(--fg-faint)">{row.note}</dd>}
            </div>
          ))}
        </dl>
      </div>

      {/* What the plan adds */}
      <div className="mt-5">
        <p className="text-[13px] font-medium text-(--fg-muted)">{plan.includes}</p>
        <ul className="mt-3 flex flex-col gap-2">
          {plan.features.map((feature) => (
            <FeatureItem key={feature.text} feature={feature} plan={plan} full={full} />
          ))}
        </ul>
      </div>

      {/* Who it is for: pinned to the bottom */}
      <p className={cn(styles.blurb, "text-[13px] leading-[1.5] text-balance text-(--fg-faint)")}>{plan.blurb}</p>
    </article>
  );
}

/**
 * The picture head: art (the owner's image or the hue placeholder) under a scrim, the plan name as the card's
 * heading, the tag pill, the price and the saving. Screen readers get the name, the tag and one plain price
 * sentence; the visual price and the saving pill are hidden from them.
 */
function PlanHead({
  plan,
  billing,
  full,
  Heading,
  headingId,
}: {
  plan: Plan;
  billing: Billing;
  full: boolean;
  Heading: HeadingTag;
  headingId: string;
}) {
  const image = HEAD_IMAGE[plan.id];
  const price = monthlyPrice(plan, billing);
  const yearly = billing === "yearly";
  const saving = yearlySavingPct(plan);

  return (
    <div data-head data-hue={plan.hue} data-image={image ? "true" : undefined} className={styles.head}>
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 32vw, 480px"
          quality={75}
          loading={full ? "eager" : "lazy"}
          className={styles.headImage}
        />
      ) : (
        <span className={styles.art} aria-hidden="true" />
      )}
      <span className={styles.scrim} aria-hidden="true" />

      <Heading id={headingId} data-title className={styles.title}>
        {plan.name}
      </Heading>
      {plan.tag && <p className={cn(styles.pill, styles.tag)}>{plan.tag}</p>}

      <p className="sr-only">
        ${price} a month, billed {yearly ? `yearly, $${formatInt(yearlyTotal(plan))} a year (saves ${saving}%)` : "monthly"}.
      </p>
      <div aria-hidden="true" className={styles.headFoot}>
        <span className={styles.price}>
          <RollingNumber value={price} prefix="$" className={styles.amount} />
          <span className={styles.per}>/mo</span>
        </span>
        {yearly && (
          <span key={billing} className={cn(styles.pill, styles.save, styles.swap)}>
            Save {saving}%
          </span>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ parts

/**
 * The plan's glyph: a small tile of its card head (the hue placeholder) with its initial in the plan face.
 * It carries its own hue, so the calculator can use it outside a card.
 *
 *   <PlanGlyph plan={PRO} />            // 26px
 *   <PlanGlyph plan={PRO} size="lg" />  // 30px, the calculator's recommendation
 */
export function PlanGlyph({ plan, size = "md" }: { plan: Plan; size?: "md" | "lg" }) {
  return (
    <span
      aria-hidden="true"
      data-hue={plan.hue}
      className={cn(
        styles.glyph,
        "grid shrink-0 place-items-center",
        size === "lg" ? "size-[30px] rounded-[9px] text-[12px]" : "size-[26px] rounded-[8px] text-[11px]",
      )}
    >
      <span className={styles.art} />
      <span className="relative">{plan.name.charAt(0)}</span>
    </span>
  );
}

function PlanCta({ plan, full }: { plan: Plan; full: boolean }) {
  return (
    <Button href={plan.cta.href} variant="secondary" size="md" className={cn(styles.cta, "shrink-0", full && "h-12 text-[15px]")}>
      {plan.cta.label}
      <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5" aria-hidden="true" />
    </Button>
  );
}

/**
 * The card's one trial mention (green), and what the plan costs once the trial ends: two short lines on the
 * right of the start row, set flush right (owner, 2026-10-19), across from the CTA. On a 320px phone they stack
 * under the CTA, left-aligned (pricing.module.css `.start`).
 */
function TrialLine({ plan, billing }: { plan: Plan; billing: Billing }) {
  const after = billing === "yearly" ? `$${formatInt(yearlyTotal(plan))}/yr` : `$${plan.price.monthly}/mo`;
  return (
    <p key={billing} className={cn(styles.swap, "ml-auto min-w-0 text-right text-[13px] leading-[1.3]")}>
      <span className="flex items-center justify-end gap-1.5 whitespace-nowrap font-medium text-(--trial)">
        <Clock className="size-3.5" aria-hidden="true" />
        {plan.trialDays} days free,
      </span>
      <span className="mt-1 block whitespace-nowrap text-(--fg-3)">then {after}</span>
    </p>
  );
}

/** One rung of the ladder. A badge sits after the text, or at the start of the next line when it does not fit. */
function FeatureItem({ feature, plan, full }: { feature: PlanFeature; plan: Plan; full: boolean }) {
  const text = (
    <span className="min-w-0 text-pretty">
      {feature.lead && <span className="mr-1 font-semibold tabular-nums text-(--fg)">{feature.lead}</span>}
      {full ? (feature.full ?? feature.text) : feature.text}
    </span>
  );
  return (
    <li className="flex gap-2.5 text-[14px] leading-[1.4] text-(--fg-2)">
      <CheckGlyph />
      {feature.badge ? (
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {text}
          <span data-hue={plan.hue} className={styles.badge}>
            {feature.badge}
          </span>
        </span>
      ) : (
        text
      )}
    </li>
  );
}

function CheckGlyph() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="mt-[2px] size-4 shrink-0 text-(--fg-muted)"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}
