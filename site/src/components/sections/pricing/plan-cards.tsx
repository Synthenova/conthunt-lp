"use client";

/**
 * PlanCards: the three plans (Creator, Pro, Research) as 3D cards.
 *
 *   <PlanCards />                                    // /pricing: the full card (fuller wording, a note per limit)
 *   <PlanCards variant="compact" />                  // Home
 *   <PlanCards variant="compact" footer={<Link/>} />  // footer: extra node on the right of the footnote row
 *
 * Anatomy (pricing Rev 4, docs/revamp/sections/pricing-rev2.md). One idea per card, read top to bottom, each fact once:
 *   1. Glyph, plan name and, on the right, its tag ("Most popular", "Best value").
 *   2. Who it is for (the blurb).
 *   3. The price (rolling digits) with the list price struck quietly beside "/mo".
 *   4. How it is billed, plus the green "Save N%" chip when yearly is on.
 *   5. The CTA, and under it the one trial line: "7 days free" in green, then what you pay after.
 *   6. Every month: searches, AI credits, tracking credits (the plans differ in volume, so this is the spec).
 *   7. The feature ladder: Creator lists its base, Pro and Research only what they add.
 * The trial's allowance and the currency live once, in the footnote under the row.
 *
 * Look (pricing Rev 5, "neutral premium"): the cards belong to the page, which is ink on near-white. Creator and
 * Research are paper with a hairline and a short shadow, ink type, neutral checks and an outline CTA. Pro is the
 * one ink card (near-black, not indigo) with a white CTA: the only filled action in the row. Colour is kept for
 * meaning: the small glyph tile is each plan's identity (pink, the spectrum, blue), green is the trial and the
 * saving, and a thin spectrum beam travels round Pro's edge.
 *
 * Motion (use-card-tilt.ts): with a mouse, each card tilts toward the pointer and its layers sit at different
 * depths. On Pro a soft light and a glare follow the pointer and its ring catches that light; a slow glint crosses
 * it every 8 seconds and the beam circles its edge (both paused off screen). Touch, reduced motion and keyboard
 * focus get a flat card.
 * Billing comes from `useBilling()`; the price rolls digit by digit; the cards rise in once.
 */
import { ArrowRight, Clock, Sparkles, Telescope, Zap, type LucideIcon } from "lucide-react";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { phAttrs } from "@/lib/attribution";
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
  type PlanId,
} from "./plans";
import styles from "./pricing.module.css";
import { RollingNumber } from "./rolling-number";
import { useCardTilt } from "./use-card-tilt";

export interface PlanCardsProps {
  plans?: readonly Plan[];
  className?: string;
  /** "full" (default) for /pricing; "compact" for the Home section. */
  variant?: "full" | "compact";
  /** Footnote under the cards (currency, list prices, trial allowance). Default true. */
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
  useEqualBlurbs(root);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-plan-wrap]", {
          y: 28,
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
    <div ref={root} className={className}>
      <div className="grid gap-4 md:gap-5 lg:grid-cols-3 lg:items-stretch lg:gap-4 xl:gap-5">
        {plans.map((plan) => (
          <div key={plan.id} data-plan-wrap className="@container flex min-w-0 max-w-full">
            <PlanCard plan={plan} billing={billing} full={full} Heading={headingLevel} placement={full ? "pricing_page" : "pricing_home"} />
          </div>
        ))}
      </div>
      {(footnote || footer) && (
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between md:gap-10">
          {footnote ? (
            <p className="max-w-[72ch] text-[13px] leading-[1.6] text-ink-2/75">
              Prices in USD; struck prices are list prices. The trial runs on a smaller allowance, and your plan starts
              when the {TRIAL_DAYS} days end.
              {full && " A search counts each platform it queries: one keyword on TikTok, Reels and Shorts is 3."}{" "}
              Tracking is experimental.
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

/**
 * Side by side, every row of the three cards lines up (price with price, spec with spec). The blurb is the
 * one block whose height depends on the copy and the width (Research's wraps to three lines at 1280), so
 * in the three-column layout each blurb takes the height of the tallest. `lg:min-h-[2lh]` covers the common
 * case before this runs. Layout values only (offsetHeight), so a tilted card measures flat.
 */
function useEqualBlurbs(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const blurbs = Array.from(el.querySelectorAll<HTMLElement>("[data-blurb]"));
    if (blurbs.length < 2) return;
    const wide = window.matchMedia(THREE_UP);
    let raf = 0;
    let lastWidth = -1;
    let live = true;
    const sync = (force = false) => {
      raf = 0;
      if (!live) return;
      const width = el.offsetWidth;
      if (!force && width === lastWidth) return;
      lastWidth = width;
      for (const b of blurbs) b.style.minHeight = "";
      if (!wide.matches) return;
      const tallest = Math.max(...blurbs.map((b) => b.offsetHeight));
      for (const b of blurbs) b.style.minHeight = `${tallest}px`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(() => sync());
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    const onMedia = () => sync(true);
    wide.addEventListener("change", onMedia);
    void document.fonts?.ready.then(() => sync(true));
    sync(true);
    return () => {
      live = false;
      ro.disconnect();
      wide.removeEventListener("change", onMedia);
      if (raf) cancelAnimationFrame(raf);
      for (const b of blurbs) b.style.minHeight = "";
    };
  }, [root]);
}

/** Matches the grid's `lg:grid-cols-3`. */
const THREE_UP = "(min-width: 1024px)";

// ------------------------------------------------------------------ theme

/** Class sets for text on the two surfaces. White at these opacities holds AA on the night card. */
const LIGHT = {
  name: "text-ink",
  sub: "text-ink-2/75",
  body: "text-ink-2",
  value: "text-ink",
  strike: "text-ink-2/75 decoration-ink-2/60",
} as const;

const DARK = {
  name: "text-white",
  sub: "text-white/72",
  body: "text-white/85",
  value: "text-white",
  strike: "text-white/72 decoration-white/60",
} as const;

const GLYPH: Record<PlanId, LucideIcon> = { creator: Sparkles, pro: Zap, research: Telescope };

/** Depth of each floating layer in px (translateZ at full hover). The price floats furthest. */
const Z = { head: 22, price: 34, cta: 16, body: 8 } as const;

// ------------------------------------------------------------------ card

function PlanCard({
  plan,
  billing,
  full,
  Heading,
  placement,
}: {
  plan: Plan;
  billing: Billing;
  full: boolean;
  Heading: HeadingTag;
  placement: "pricing_home" | "pricing_page";
}) {
  const ref = useRef<HTMLElement>(null);
  useCardTilt(ref);
  // The featured plan is the ink card.
  const dark = plan.featured;
  const t = dark ? DARK : LIGHT;
  const headingId = `${full ? "plan" : "plan-compact"}-${plan.id}`;
  const rows = allowanceRows(plan);

  return (
    <article
      ref={ref}
      aria-labelledby={headingId}
      data-hue={plan.hue}
      data-dark={dark}
      data-featured={plan.featured}
      data-live="true"
      className={cn(styles.card, "flex w-full min-w-0 max-w-full flex-col rounded-card")}
    >
      {dark && <InkSurface />}

      <div className={cn(styles.body, "relative z-[1] flex flex-1 flex-col")}>
        {/* Identity, price, start */}
        <div className={styles.lead}>
          <div data-z={Z.head}>
            <div className={cn(styles.head, "flex min-h-[26px] items-center gap-2.5")}>
              <PlanGlyph plan={plan} />
              <Heading id={headingId} className={cn("text-[19px] font-semibold leading-none tracking-[-0.02em]", t.name)}>
                {plan.name}
              </Heading>
              <PlanTag plan={plan} />
            </div>
            <p data-blurb className={cn("mt-3 text-[14px] leading-[1.45] text-pretty lg:min-h-[2lh]", t.sub)}>
              {plan.blurb}
            </p>
          </div>

          <div data-z={Z.price} className="mt-5">
            <PriceLine plan={plan} billing={billing} full={full} dark={dark} />
          </div>

          <div data-z={Z.cta} className="mt-5">
            <PlanCta plan={plan} billing={billing} full={full} placement={placement} />
            <TrialLine plan={plan} billing={billing} dark={dark} />
          </div>
        </div>

        {/* What you get */}
        <div data-z={Z.body} className={styles.details}>
          <p className={cn("text-[13px] font-medium", t.sub)}>Every month</p>
          <dl className="mt-1.5">
            {rows.map((row) => (
              <div key={row.key} className={styles.specRow}>
                <dt className={cn("text-[14px]", t.body)}>{row.label}</dt>
                <dd className={cn("text-[14px] font-semibold tabular-nums tracking-[-0.01em]", t.value)}>
                  {formatInt(row.value)}
                </dd>
                {full && row.note && <dd className={cn("text-[12.5px] leading-snug", t.sub)}>{row.note}</dd>}
              </div>
            ))}
          </dl>

          <p className={cn("mt-5 text-[13px] font-medium", t.sub)}>{plan.includes}</p>
          <ul className="mt-2.5 flex flex-col gap-2">
            {plan.features.map((feature, i) => (
              <li key={feature.text} className={cn("flex gap-2.5 text-[14px] leading-[1.4]", t.body)}>
                <CheckGlyph index={i} />
                <span>
                  {feature.lead && <span className={cn("mr-1 font-semibold tabular-nums", t.value)}>{feature.lead}</span>}
                  {full ? (feature.full ?? feature.text) : feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/**
 * The ink card's layers. Behind the content, in one clipped layer: the ink with its top light, the shimmer glint,
 * the pointer light and the pointer glare. Above it, the 1px ring: a hairline with a spectrum beam that travels
 * round the edge, a rim light that follows the pointer and the shimmer crossing it. The light cards have none of
 * this: paper, a hairline and a shadow.
 */
function InkSurface() {
  return (
    <>
      <div className={styles.surface} aria-hidden="true">
        <div className={styles.ink} />
        <div className={styles.pass} />
        <div className={styles.rest} />
        <div className={styles.sheen} data-sheen />
        <div className={styles.glare} data-glare />
      </div>
      <div className={styles.ring} aria-hidden="true">
        <div className={styles.beam} />
        <div className={styles.rim} data-rim />
        <div className={styles.ringLight} />
      </div>
    </>
  );
}

// ------------------------------------------------------------------ parts

/**
 * The plan's glyph: a small hue tile with a white icon, the spectrum on Pro. It is the plan's one identity colour
 * (pricing Rev 5) and carries its own hue, so the calculator can use it outside a card.
 *
 *   <PlanGlyph plan={PRO} />            // 26px, on the cards
 *   <PlanGlyph plan={PRO} size="lg" />  // 30px, the calculator's recommendation
 */
export function PlanGlyph({ plan, size = "md" }: { plan: Plan; size?: "md" | "lg" }) {
  const Icon = GLYPH[plan.id];
  return (
    <span
      aria-hidden="true"
      data-hue={plan.hue}
      data-featured={plan.featured}
      className={cn(
        styles.glyph,
        "grid shrink-0 place-items-center text-white",
        size === "lg" ? "size-[30px] rounded-[9px]" : "size-[26px] rounded-[8px]",
      )}
    >
      <Icon className={size === "lg" ? "size-4" : "size-3.5"} strokeWidth={2.2} />
    </span>
  );
}

/** "Most popular" (a white hairline pill on the ink card) or "Best value" (a quiet ink outline), in the header row. */
function PlanTag({ plan }: { plan: Plan }) {
  if (!plan.tag) return null;
  return (
    <span
      data-tone={plan.featured ? "featured" : "value"}
      className={cn(
        styles.tag,
        "ml-auto inline-flex h-[22px] shrink-0 items-center whitespace-nowrap rounded-[6px] px-2 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.06em]",
      )}
    >
      {plan.tag}
    </span>
  );
}

/**
 * The price with the struck list price and "/mo" stacked beside it, then one billing line. Screen readers get
 * one plain sentence; the visual pieces are hidden from them.
 */
function PriceLine({ plan, billing, full, dark }: { plan: Plan; billing: Billing; full: boolean; dark: boolean }) {
  const t = dark ? DARK : LIGHT;
  const price = monthlyPrice(plan, billing);
  const yearly = billing === "yearly";
  const saving = yearlySavingPct(plan);
  return (
    <>
      <p className="sr-only">
        ${price} a month, billed {yearly ? `yearly (saves ${saving}%)` : "monthly"}.
        {plan.listPrice ? ` List price $${plan.listPrice} a month.` : ""}
      </p>
      <div aria-hidden="true" className="flex items-baseline-last gap-2.5">
        <RollingNumber
          value={price}
          prefix="$"
          className={cn(
            "font-bold leading-none tracking-[-0.04em]",
            full ? "text-[54px] @[20rem]:text-[60px]" : "text-[52px] @[20rem]:text-[56px]",
            t.name,
          )}
        />
        <span className="flex flex-col text-[13px] leading-[1.25]">
          {plan.listPrice ? <s className={cn("tabular-nums", t.strike)}>${plan.listPrice}</s> : null}
          <span className={t.sub}>/mo</span>
        </span>
      </div>
      <div aria-hidden="true" key={billing} className={cn(styles.swap, "mt-2.5 flex h-5 items-center gap-2 text-[13px]")}>
        <span className={t.sub}>{yearly ? "Billed yearly" : "Billed monthly"}</span>
        {yearly && <SaveChip dark={dark} pct={saving} />}
      </div>
    </>
  );
}

/** "Save N%": green, shown with yearly billing (owner, pricing Rev 3). Same chip as the toggle's "Save up to N%". */
function SaveChip({ dark, pct }: { dark: boolean; pct: number }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap rounded-[6px] px-1.5 font-mono text-[10.5px] font-medium uppercase leading-none tracking-[0.06em] tabular-nums",
        dark ? "bg-green/20 text-green-glow ring-1 ring-inset ring-green-glow/30" : "bg-green-soft text-green-ink",
      )}
    >
      Save {pct}%
    </span>
  );
}

function PlanCta({
  plan,
  billing,
  full,
  placement,
}: {
  plan: Plan;
  billing: Billing;
  full: boolean;
  placement: "pricing_home" | "pricing_page";
}) {
  return (
    <Button
      href={plan.cta.href}
      variant="secondary"
      size="md"
      className={cn(styles.cta, "w-full", full && "h-12 text-[15px]")}
      {...phAttrs(placement, "app", { plan: plan.id, billing })}
    >
      {plan.featured && <span className={styles.ctaSweep} aria-hidden="true" />}
      {plan.cta.label}
      <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5" aria-hidden="true" />
    </Button>
  );
}

/** The card's one trial mention (green), and what the plan costs once the trial ends. */
function TrialLine({ plan, billing, dark }: { plan: Plan; billing: Billing; dark: boolean }) {
  const after = billing === "yearly" ? `$${formatInt(yearlyTotal(plan))}/yr` : `$${plan.price.monthly}/mo`;
  return (
    <p key={billing} className={cn(styles.swap, "mt-3 flex items-center justify-center gap-1.5 text-[13px] leading-none")}>
      <Clock className={cn("size-3.5", dark ? "text-green-glow" : "text-green-ink")} aria-hidden="true" />
      <span className={cn("font-medium", dark ? "text-green-glow" : "text-green-ink")}>{plan.trialDays} days free,</span>
      <span className={dark ? DARK.sub : LIGHT.sub}>then {after}</span>
    </p>
  );
}

function CheckGlyph({ index }: { index: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="mt-[2px] size-4 shrink-0 text-[var(--check)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ ["--i" as string]: index }}
    >
      <path pathLength={1} className={styles.checkPath} d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}
