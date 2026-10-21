"use client";

/**
 * PricingCalculator: "How much will you research?" (ref dxwbn, built light).
 *
 * Left: three numbered steps (use cases, research volume, extras) plus an editable
 * assumptions panel. Right: the time you get back, then the recommended plan with its
 * real allowance, price and CTA.
 *
 * The result column is sticky from lg up on any viewport at least 700px tall. It never scrolls inside
 * itself. On a short viewport (700 to 879px) the work calendar is dropped and the footnote is one line;
 * heavier states (tracking on, over the largest plan) trim the calendar sooner; "See why" opens as a
 * popover instead of growing the column (see use-result-tier.ts). A column that still does not fit under
 * the navbar rides up under it so its bottom edge (price, toggle, CTA) stays on screen; past
 * STICKY_MIN_TOP it flows with the page instead. Below lg, or in that case, a bottom dock keeps the
 * headline numbers in view. The dock has no height of its own and only shows once the sliders have
 * scrolled into view, so a hidden dock leaves no band at the foot of the tray.
 *
 * Honesty rules: every limit is the plan's real allowance (`plans.ts`: hunt credits and AI credits), credits per
 * video follow the app's own planning estimate, and time saved uses assumptions the
 * user can edit. See `calculator-model.ts` for where each number comes from.
 *
 * The Yearly/Monthly choice comes from the shared <BillingProvider> so the cards and
 * the calculator always agree.
 */
import { Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Letterbox } from "@/components/layout/letterbox";
import { Section } from "@/components/layout/section";
import { useLenis } from "@/components/layout/smooth-scroll";
import { BillingToggle, useBilling } from "@/components/sections/pricing/billing";
import {
  estimateAiCredits,
  formatInt,
  monthlyPrice,
  videosForCredits,
  yearlySavingPct,
  yearlySavingUsd,
  yearlyTotal,
  type Plan,
} from "@/components/sections/pricing/plans";
import { MonoLabel, PageEyebrow } from "@/components/sections/pricing/mono-label";
import { PlanGlyph } from "@/components/sections/pricing/plan-cards";
import { RollingNumber } from "@/components/sections/pricing/rolling-number";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/cn";
import { CONTACT_URL, GET_STARTED_URL } from "@/lib/links";
import { useInView } from "@/lib/media";
import { DialSlider, Step } from "./calc-controls";
import { CountUp, UsageBar, WorkCalendar } from "./calc-readouts";
import { ExtrasStep, UseCaseStep } from "./calc-steps";
import {
  DEEP_SEARCH_MAX,
  DEEP_SEARCH_MIN,
  DEFAULT_ASSUMPTIONS,
  DEFAULT_INPUTS,
  FIT_LABEL,
  VIDEO_STOPS,
  blendUseCases,
  computeTime,
  computeUsage,
  formatHours,
  recommend,
  watchLine,
  type Assumptions,
  type CalcInputs,
  type Recommendation,
  type TimeSaved,
  type Usage,
  type UseCaseId,
} from "./calculator-model";
import styles from "./calculator.module.css";
import { STICKY_GAP, STICKY_MIN_TOP, STICKY_TOP, useResultTier, type ResultTier } from "./use-result-tier";

const DEFAULT_SELECTED: UseCaseId[] = ["hooks"];


// Slider props that never change live here, so the memoized DialSlider skips re-rendering (and re-writing
// its ~40 tick transforms) when a different control moves.
const DEEP_END_LABELS: readonly [number, string][] = [
  [DEEP_SEARCH_MIN, String(DEEP_SEARCH_MIN)],
  [6, "6"],
  [DEEP_SEARCH_MAX, String(DEEP_SEARCH_MAX)],
];
const deepValueText = (v: number) => `${v} Deep Searches per month`;
const videosValueText = (v: number) => `${v} videos per Deep Search`;
const videoStopLabel = (v: number) => formatInt(v);

export function PricingCalculator() {
  const { billing } = useBilling();
  const [selected, setSelected] = useState<UseCaseId[]>(DEFAULT_SELECTED);
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS);
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const [rateText, setRateText] = useState(String(DEFAULT_ASSUMPTIONS.hourlyRate));
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const assumptionsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const headlineRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  // The dock hides while the big hours figure is on screen, not merely the column: a flowing column can
  // sit half in view with its headline already scrolled away.
  const headlineInView = useInView(headlineRef, { rootMargin: "-72px 0px -24px 0px" });
  // ... and it waits until the sliders have risen into the upper part of the screen, so it never sits
  // on top of step 1 as the tray first scrolls in.
  const controlsInView = useInView(controlsRef, { rootMargin: "0px 0px -35% 0px" });
  const tier = useResultTier();
  const [unstick, setUnstick] = useState(false);
  const [stickyTop, setStickyTop] = useState(STICKY_TOP);

  const usage = useMemo(() => computeUsage(inputs, assumptions), [inputs, assumptions]);
  const rec = useMemo(() => recommend(inputs, usage), [inputs, usage]);
  const time = useMemo(() => computeTime(inputs, usage, rec.coverage, assumptions), [inputs, usage, rec.coverage, assumptions]);

  const patch = useCallback((next: Partial<CalcInputs>) => setInputs((prev) => ({ ...prev, ...next })), []);
  const onDeepSearches = useCallback((deepSearches: number) => patch({ deepSearches }), [patch]);
  const onVideosPerSearch = useCallback((videosPerSearch: number) => patch({ videosPerSearch }), [patch]);
  const onTrackedItems = useCallback((trackedItems: number) => patch({ trackedItems }), [patch]);

  const onAgents = useCallback((agents: boolean) => patch({ agents }), [patch]);
  const onTracking = useCallback((tracking: boolean) => patch({ tracking }), [patch]);

  // Reads the latest selection from a ref so the callback stays stable (UseCaseStep is memoized).
  const selectedRef = useRef(selected);
  const toggleUseCase = useCallback((id: UseCaseId, on: boolean) => {
    const next = on ? [...selectedRef.current, id] : selectedRef.current.filter((s) => s !== id);
    selectedRef.current = next;
    setSelected(next);
    if (next.length > 0) setInputs((prev) => blendUseCases(next, prev));
  }, []);

  const onToggleAssumptions = useCallback(() => setAssumptionsOpen((o) => !o), []);
  const onAssumptionsChange = useCallback(
    (next: Partial<Assumptions>) => setAssumptions((a) => ({ ...a, ...next })),
    [],
  );

  const setRate = (text: string) => {
    const clean = text.replace(/\D/g, "").slice(0, 4);
    setRateText(clean);
    setAssumptions((a) => ({ ...a, hourlyRate: clean === "" ? 0 : Number(clean) }));
  };

  const resetAssumptions = useCallback(() => {
    setAssumptions(DEFAULT_ASSUMPTIONS);
    setRateText(String(DEFAULT_ASSUMPTIONS.hourlyRate));
  }, []);

  const openAssumptions = () => {
    setAssumptionsOpen(true);
    const el = assumptionsRef.current;
    if (!el) return;
    // Leave the page where it is when the link is already comfortably on screen.
    const { top } = el.getBoundingClientRect();
    if (top > 120 && top < window.innerHeight * 0.45) return;
    if (lenis) lenis.scrollTo(el, { offset: -120 });
    else el.scrollIntoView({ block: "center" });
  };

  const scrollToResult = () => {
    const el = resultRef.current;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -100 });
    else el.scrollIntoView({ block: "start" });
  };

  // A sticky column that does not fit under the navbar rides up under it instead (negative slack), so its
  // bottom edge, with the price, toggle and CTA, stays on screen. Past STICKY_MIN_TOP it lets go of the
  // viewport and flows with the page; the dock then keeps the headline numbers in view.
  useEffect(() => {
    const el = resultRef.current;
    if (!el) return;
    const measure = () => {
      if (tier === "flow") {
        setUnstick(false);
        setStickyTop(STICKY_TOP);
        return;
      }
      const room = window.innerHeight - el.offsetHeight - STICKY_GAP;
      setUnstick(room < STICKY_MIN_TOP);
      setStickyTop(Math.min(STICKY_TOP, Math.max(room, STICKY_MIN_TOP)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [tier]);

  const docked = tier === "flow" || unstick;
  const dockVisible = controlsInView && !headlineInView;
  // Rows of the work calendar that fit beside the rest of the column. Sticky columns on short or busy
  // viewports drop it; the "you'd still be watching on ..." line under it carries the same idea.
  // A column that flows with the page (phones, tablets) has room for the full two rows.
  const calendarWeeks = tier === "flow" ? 2 : tier === "compact" ? 0 : rec.overMax ? 0 : inputs.tracking ? 1 : 2;

  const price = monthlyPrice(rec.plan, billing);

  return (
    <Section
      sectionKey="pricing-calculator"
      id="calculator"
      letterbox={false}
      padding="bottom"
      // The plans section above already ends in padding, so this one starts short. Together with the scroll
      // margin, /pricing#calculator lands with the heading just under the navbar and the first step in view.
      className="scroll-mt-14 pt-[calc(var(--section-pad-y)*0.35)]"
    >
      <Letterbox>
        <PageEyebrow className="mb-5">Calculator</PageEyebrow>
        <SectionHeader
          title={
            <>
              How <Emphasis>much</Emphasis> will you research?
            </>
          }
          muted={<span className="block">See the hours you get back.</span>}
          headingClassName="max-w-none"
        />
        <p className="body-l mt-5 max-w-[52ch] text-ink-2/75">
          Tell us what you do. We size a plan against its real limits and work out the time it frees up.
        </p>
      </Letterbox>

      <p className="sr-only" role="status">
        Recommended plan: {rec.plan.name}, ${price} a month, billed {billing === "yearly" ? "yearly" : "monthly"}. About{" "}
        {formatHours(time.hoursSaved)} hours saved every month.
      </p>

      <div className={cn(styles.tray, "mt-10 rounded-tray bg-surface p-2 md:mt-12 md:p-3")}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,430px)]">
          {/* ---------------------------------------------------------- inputs */}
          <div className="min-w-0 max-w-full rounded-card bg-paper p-5 md:p-9">
            <UseCaseStep selected={selected} onToggle={toggleUseCase} />

            <div ref={controlsRef}>
            <Step
              n={2}
              title="How much research per month?"
              hint="One Deep Search watches and scores a batch of videos for a single question."
            >
              <div className="rounded-btn border border-hairline p-5 md:p-6">
                <DialSlider
                  label="Deep Searches per month"
                  readout={`${inputs.deepSearches} ${inputs.deepSearches === 1 ? "run" : "runs"}`}
                  min={DEEP_SEARCH_MIN}
                  max={DEEP_SEARCH_MAX}
                  value={inputs.deepSearches}
                  onChange={onDeepSearches}
                  subdivisions={3}
                  endLabels={DEEP_END_LABELS}
                  valueText={deepValueText}
                />
                <div className="my-7 h-px bg-hairline" aria-hidden="true" />
                <DialSlider
                  label="Videos per Deep Search"
                  readout={`${formatInt(inputs.videosPerSearch)} videos`}
                  value={inputs.videosPerSearch}
                  stops={VIDEO_STOPS}
                  stopLabel={videoStopLabel}
                  onChange={onVideosPerSearch}
                  subdivisions={8}
                  valueText={videosValueText}
                />
                <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-hairline pt-4">
                  <p className="font-mono text-[13px] text-ink-2">
                    <span className="mr-1 text-ink-2/75">≈</span>
                    <span className="font-medium text-ink">
                      <CountUp value={usage.videos} duration={0.6} />
                    </span>{" "}
                    videos analyzed
                  </p>
                  <p className="font-mono text-[11px] text-ink-2/75">
                    {formatInt(usage.aiCredits)} AI credits · {formatInt(usage.searchUnits)} hunt credits
                  </p>
                </div>
              </div>
            </Step>

            <ExtrasStep
              agents={inputs.agents}
              tracking={inputs.tracking}
              trackedItems={inputs.trackedItems}
              trackingCredits={usage.trackingCredits}
              onAgents={onAgents}
              onTracking={onTracking}
              onTrackedItems={onTrackedItems}
              assumptions={assumptions}
              assumptionsOpen={assumptionsOpen}
              assumptionsRef={assumptionsRef}
              onToggleAssumptions={onToggleAssumptions}
              onAssumptionsChange={onAssumptionsChange}
              onAssumptionsReset={resetAssumptions}
            />
            </div>
          </div>

          {/* ---------------------------------------------------------- result */}
          <div ref={resultRef} className={cn(styles.result, "min-w-0 max-w-full")} data-unstick={unstick} style={{ top: stickyTop }}>
            <TimeSavedCard
              time={time}
              assumptions={assumptions}
              rateText={rateText}
              onRate={setRate}
              onEdit={openAssumptions}
              tier={tier}
              coverage={rec.coverage}
              calendarWeeks={calendarWeeks}
              headlineRef={headlineRef}
            />
            <PlanResultCard rec={rec} usage={usage} inputs={inputs} billing={billing} tier={tier} />
          </div>
        </div>

        {/* Dock for when the result column is not sticky (phones, tablets, desktop windows under 700px
            tall, or a state too tall to fit): keeps the headline numbers in view while the sliders move.
            The outer box has no height, so a hidden dock leaves no empty band at the foot of the tray. */}
        {docked && (
          <div className="pointer-events-none sticky bottom-3 z-20 h-0">
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 transition-[opacity,transform] duration-300 ease-out",
                dockVisible ? "pointer-events-auto" : "translate-y-3 opacity-0",
              )}
              inert={!dockVisible}
            >
              <div className="flex items-center justify-between gap-3 rounded-btn border border-ink bg-paper px-4 py-3 shadow-float">
                <p className="min-w-0 leading-tight">
                  <span className="block font-mono text-[15px] font-medium tabular-nums text-ink">
                    ≈ {formatHours(time.hoursSaved)} h saved a month
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-2">
                    {rec.plan.name} · ${price}/mo
                  </span>
                </p>
                <Button size="sm" variant="primary" onClick={scrollToResult}>
                  See plan
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// ------------------------------------------------------------- time saved card

function TimeSavedCard({
  time,
  assumptions,
  rateText,
  onRate,
  onEdit,
  tier,
  coverage,
  calendarWeeks,
  headlineRef,
}: {
  time: TimeSaved;
  assumptions: Assumptions;
  rateText: string;
  onRate: (text: string) => void;
  onEdit: () => void;
  tier: ResultTier;
  coverage: number;
  calendarWeeks: number;
  headlineRef: RefObject<HTMLDivElement | null>;
}) {
  const compact = tier === "compact";
  const partial = coverage < 1;
  return (
    <div className={cn("rounded-card bg-paper", compact ? "p-4" : "p-5")}>
      <MonoLabel>Time you get back{partial ? ` · ${Math.floor(coverage * 100)}% of your usage` : ""}</MonoLabel>
      <div ref={headlineRef} className={cn("flex items-end gap-3", compact ? "mt-2" : "mt-2.5")}>
        <p
          // text-size first: tailwind-merge drops an earlier `leading-*` when a later `text-[Npx]` follows.
          className={cn(compact ? "text-[56px]" : "text-[64px]", "font-bold leading-[0.88] tracking-[-0.035em] text-green-ink")}
        >
          <span className="mr-1 text-[0.5em] font-medium text-ink-2/60" aria-hidden="true">
            ≈
          </span>
          <CountUp value={time.hoursSaved} format={formatHours} duration={1} />
        </p>
        <p className="pb-1 text-[15px] font-medium leading-[1.15] text-ink-2">
          hours saved
          <br />
          every month
        </p>
      </div>
      <p className="mt-3 text-[15px] leading-snug text-ink-2">
        ≈{" "}
        <span className="font-semibold text-ink">
          $<CountUp value={time.valueUsd} duration={1} />
        </span>{" "}
        of your time, at{" "}
        <label className="inline-flex items-baseline gap-0.5 rounded-chip border-b border-ink/40 px-1 font-mono text-ink transition-colors duration-200 focus-within:border-ink hover:border-ink">
          <span className="sr-only">Your hourly rate in dollars</span>
          <span aria-hidden="true">$</span>
          {/* h-6 min-w-6 give the field a 24px target; the negative margin keeps the line height as it was. */}
          <input
            inputMode="numeric"
            value={rateText}
            onChange={(e) => onRate(e.target.value)}
            style={{ width: `${Math.max(2, rateText.length) + 0.4}ch` }}
            className="-my-1 h-6 min-w-6 bg-transparent text-center text-[14px] tabular-nums text-ink outline-none"
          />
        </label>
        /hr.
      </p>

      {/* The calendar is the first thing to go when space is short; the line under it carries the same idea. */}
      {calendarWeeks > 0 && (
        <div className="mt-4">
          <WorkCalendar
            workdays={time.workdays}
            runMinutes={time.runs * assumptions.runMinutes}
            maxWeeks={calendarWeeks}
          />
        </div>
      )}
      <p className={cn("text-[14px] font-medium leading-snug text-ink", compact ? "mt-3" : "mt-2.5")}>
        {watchLine(time.workdays, compact)}
      </p>

      <p className={cn("border-t border-hairline text-[12px] leading-[1.5] text-ink-2/75", compact ? "mt-2.5 pt-2.5" : "mt-3 pt-3")}>
        {compact ? (
          <>
            Assumes {assumptions.minutesPerVideo} min a video, {assumptions.runMinutes} min a run. An estimate.{" "}
          </>
        ) : (
          <>
            Assumes {assumptions.minutesPerVideo} min per video by hand and {assumptions.runMinutes} min of run time
            per Deep Search. An estimate, not a promise.{" "}
          </>
        )}
        <button
          type="button"
          onClick={onEdit}
          // p-2 -m-2: a 16px larger hit area that leaves the text where it sits.
          className="-m-2 rounded-chip p-2 font-medium text-ink underline decoration-ink/30 underline-offset-2 transition-colors duration-200 hover:decoration-ink"
        >
          Edit
        </button>
      </p>
    </div>
  );
}

// ------------------------------------------------------------ plan result card

function PlanResultCard({
  rec,
  usage,
  inputs,
  billing,
  tier,
}: {
  rec: Recommendation;
  usage: Usage;
  inputs: CalcInputs;
  billing: "yearly" | "monthly";
  tier: ResultTier;
}) {
  const [whyOpen, setWhyOpen] = useState(false);
  const headRef = useRef<HTMLDivElement>(null);
  const whyButtonRef = useRef<HTMLButtonElement>(null);
  const { plan } = rec;
  const allowance = plan.allowance;
  const price = monthlyPrice(plan, billing);
  const yearly = billing === "yearly";
  const compact = tier === "compact";

  // "See why" is a popover: Escape or a click outside closes it.
  useEffect(() => {
    if (!whyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setWhyOpen(false);
      whyButtonRef.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (headRef.current && !headRef.current.contains(e.target as Node)) setWhyOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [whyOpen]);

  return (
    // Pricing Rev 5: the same language as the plan cards. A neutral paper card; the plan's glyph tile is its one
    // identity colour, beside the name in ink.
    <div
      className={cn(
        "rounded-card bg-paper shadow-[0_0_0_1px_rgb(15_15_15/0.07),0_1px_2px_rgb(15_15_15/0.05),0_6px_12px_-6px_rgb(15_15_15/0.08)]",
        compact ? "p-4" : "p-5",
      )}
    >
      <div ref={headRef} className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <MonoLabel>We recommend</MonoLabel>
            <h3
              key={plan.id}
              className={cn(
                styles.swapIn,
                "mt-2 flex items-center gap-2.5 text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink",
              )}
            >
              <PlanGlyph plan={plan} size="lg" />
              {plan.name}
            </h3>
          </div>
          <button
            ref={whyButtonRef}
            type="button"
            aria-expanded={whyOpen}
            aria-controls="calc-why"
            onClick={() => setWhyOpen((o) => !o)}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-chip bg-surface px-2.5 text-[12px] font-medium text-ink transition-colors duration-200 hover:bg-surface-2"
          >
            <Info className="size-3.5" aria-hidden="true" />
            {whyOpen ? "Hide why" : "See why"}
          </button>
        </div>

        <div
          id="calc-why"
          role="region"
          aria-label="Why this plan"
          data-open={whyOpen}
          inert={!whyOpen}
          className={cn(
            styles.popover,
            "absolute inset-x-0 top-full z-20 mt-2 flex flex-col gap-3 rounded-btn border border-ink bg-paper p-4 text-[13px] leading-[1.55] text-ink-2 shadow-float",
          )}
        >
          <p>
            <WhyText rec={rec} usage={usage} />
          </p>
          <p className="border-t border-hairline pt-3 text-[12px] leading-[1.5] text-ink-2/75">
            <TrialNote plan={plan} videosPerSearch={inputs.videosPerSearch} />
          </p>
        </div>
      </div>

      {/* The price alone with "/mo" beside it, one billing line, and the green saving chip when yearly is on. */}
      <p className="sr-only">
        ${price} a month, billed {yearly ? `yearly, $${formatInt(yearlyTotal(plan))} a year (saves ${yearlySavingPct(plan)}%, $${yearlySavingUsd(plan)})` : "monthly"}.
      </p>
      <div aria-hidden="true" className={cn("flex items-baseline-last gap-2.5", compact ? "mt-3" : "mt-4")}>
        <RollingNumber
          value={price}
          prefix="$"
          className={cn(compact ? "text-[40px]" : "text-[44px]", "font-bold leading-none tracking-[-0.04em] text-ink")}
          duration={600}
          stagger={50}
        />
        <span className="text-[13px] leading-[1.25] text-ink-2/75">/mo</span>
      </div>
      <div aria-hidden="true" key={billing} className={cn(styles.rise, "mt-2 flex h-5 items-center gap-2 text-[13px] text-ink-2/75")}>
        <span>{yearly ? `$${formatInt(yearlyTotal(plan))} billed yearly` : "Billed monthly"}</span>
        {yearly && (
          <Badge tone="green" className="text-[10.5px]">
            Save {yearlySavingPct(plan)}%
          </Badge>
        )}
      </div>

      {/* The toggle and the CTA sit right under the price and above the usage bars. */}
      <div className={cn("flex flex-col gap-2.5", compact ? "mt-3" : "mt-4")}>
        <BillingToggle
          size="sm"
          ariaLabel="Billing period for this recommendation"
          // Under 360px the track is too narrow for "Yearly + Save up to N%" beside "Monthly", so the chip goes
          // (the card still says what yearly saves, one line below the price).
          className="w-full justify-between [&>button]:flex-1 [&>button]:justify-center max-[359px]:[&>button:first-child>span:last-child]:hidden"
        />
        <Button href={GET_STARTED_URL} size="md" className="w-full">
          Start your 1-week free trial
        </Button>
      </div>

      <div
        className={cn("flex flex-col gap-2.5 border-t border-hairline", compact ? "mt-3 pt-3" : "mt-4 pt-4")}
        role="group"
        aria-labelledby="calc-usage-label"
      >
        <MonoLabel id="calc-usage-label">Expected monthly usage</MonoLabel>
        <UsageBar label="AI credits" used={usage.aiCredits} cap={allowance.aiCredits} primary />
        <UsageBar
          label="Hunt credits"
          used={usage.huntCredits}
          cap={allowance.huntCredits}
          note={
            inputs.tracking
              ? `${formatInt(usage.searchUnits)} searches + ${formatInt(usage.trackingCredits)} tracking`
              : undefined
          }
        />
      </div>

      {rec.overMax && (
        <p className="mt-3 flex items-start gap-2 rounded-chip bg-decline/10 px-3 py-2 text-[12px] leading-snug text-ink">
          <span aria-hidden="true" className="mt-[5px] size-1.5 shrink-0 rounded-full bg-decline" />
          <span>
            {rec.coverage < 1
              ? `${plan.name} covers about ${Math.floor(rec.coverage * 100)}% of this: your ${FIT_LABEL[rec.fit.binding]} run out around day ${Math.max(1, Math.floor(30 * rec.coverage))}.`
              : `${plan.name} holds this, but it uses ${Math.round(rec.fit.max * 100)}% of your ${FIT_LABEL[rec.fit.binding]} and leaves little room for follow-ups.`}{" "}
            <a href={CONTACT_URL} className="font-medium underline underline-offset-2">
              Talk to us about volume
            </a>
            .
          </span>
        </p>
      )}
    </div>
  );
}

function WhyText({ rec, usage }: { rec: Recommendation; usage: Usage }) {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const { plan, fit, below, above, headroom } = rec;
  const room = pct(headroom);
  const first = FIT_LABEL[fit.binding];

  if (rec.overMax) {
    return (
      <>
        Your usage needs {pct(fit.max)} of {plan.name}&apos;s {first}, the first limit you would reach. {plan.name} is our
        largest plan,{" "}
        {rec.coverage < 1
          ? `so it covers about ${Math.floor(rec.coverage * 100)}% of this each month.`
          : `so it holds this, with less than ${room} left for follow-up chat and re-runs.`}
      </>
    );
  }
  if (!below) {
    return (
      <>
        {plan.name} covers this with room to spare. The first limit you would reach is {first}, at {pct(fit.max)} of the
        allowance ({formatInt(usage[fit.binding])} of {formatInt(plan.allowance[fit.binding])}). We keep at least{" "}
        {room} free for follow-up chat and re-runs.
        {above && above.fit.max < 0.5 && ` ${above.plan.name} would sit at ${pct(above.fit.max)}, more than you need.`}
      </>
    );
  }
  const belowFirst = FIT_LABEL[below.fit.binding];
  return (
    <>
      {rec.belowTight
        ? `${below.plan.name} would run at ${pct(below.fit.max)} of its ${belowFirst}. We keep at least ${room} free for follow-up chat and re-runs, so we step up to ${plan.name}, where this is ${pct(fit.max)}.`
        : `${below.plan.name} cannot hold this: it would need ${pct(below.fit.max)} of its ${belowFirst}. ${plan.name} holds it at ${pct(fit.max)}.`}
      {headroom > 0.15 && " With agents selected we keep extra room, because agents ask follow-ups on their own."}
    </>
  );
}

/** What the 7-day trial covers (app `_TRIALS`), so the user is not surprised. */
function TrialNote({ plan, videosPerSearch }: { plan: Plan; videosPerSearch: number }) {
  const credits = plan.trial.aiCredits;
  const trialVideos = videosForCredits(credits);
  const perRun = estimateAiCredits(videosPerSearch);
  const fits = Math.floor(credits / perRun);
  let advice: string;
  if (fits >= 1) {
    advice = `Enough for ${fits} Deep ${fits === 1 ? "Search" : "Searches"} of ${formatInt(videosPerSearch)} videos.`;
  } else {
    const smaller = [...VIDEO_STOPS].reverse().find((s) => estimateAiCredits(s) <= credits);
    advice = smaller
      ? `A Deep Search of ${formatInt(videosPerSearch)} is bigger than that, so start with ${formatInt(smaller)}.`
      : "Start with a smaller run.";
  }
  return (
    <>
      The trial runs on a smaller allowance: {formatInt(plan.trial.huntCredits)} hunt credits and {formatInt(credits)} AI
      credits, about {formatInt(trialVideos)} videos. {advice}
    </>
  );
}
