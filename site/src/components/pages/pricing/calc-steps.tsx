"use client";

/**
 * Calculator steps 1 and 3, plus the assumptions panel.
 *
 * Both steps are memoized and take only stable callbacks, so dragging a slider in step 2 does not
 * re-render the choice cards, the tracking dial or the assumptions fields.
 */
import { Bot, Briefcase, ChevronDown, Crosshair, Eye, Radar, RotateCcw, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { memo, type ReactNode, type RefObject } from "react";
import { CREDITS_PER_VIDEO, PLANS, formatInt } from "@/components/sections/pricing/plans";
import { cn } from "@/lib/cn";
import { Choice, DialSlider, NumberField, Step } from "./calc-controls";
import {
  TRACKED_MAX,
  TRACKED_MIN,
  TRACKED_STEP,
  TRACKING_CREDITS_PER_ITEM,
  USE_CASES,
  type Assumptions,
  type UseCaseId,
} from "./calculator-model";
import styles from "./calculator.module.css";

const USE_CASE_ICONS: Record<UseCaseId, ReactNode> = {
  product: <ShoppingBag className="size-[18px]" aria-hidden="true" />,
  hooks: <Crosshair className="size-[18px]" aria-hidden="true" />,
  competitors: <Eye className="size-[18px]" aria-hidden="true" />,
  ugc: <Users className="size-[18px]" aria-hidden="true" />,
  radar: <Radar className="size-[18px]" aria-hidden="true" />,
  agency: <Briefcase className="size-[18px]" aria-hidden="true" />,
};

/** The largest plan, for the "largest plan" line. */
const LARGEST = PLANS[PLANS.length - 1];

const TRACKED_END_LABELS: readonly [number, string][] = [
  [TRACKED_MIN, String(TRACKED_MIN)],
  [75, "75"],
  [TRACKED_MAX, String(TRACKED_MAX)],
];
const trackedValueText = (v: number) => `${v} tracked items`;

/**
 * One column until the step is wide enough for two cards with readable text. Each card spends about 133px on its
 * icon, check box and padding, so 540px leaves a text column of 130px or more. The result column is 360px wide up
 * to 2xl (430px there); the step is then 532px at 1100, 560px at 1280 and 656px at 1440.
 */
const CHOICE_GRID = "grid grid-cols-1 gap-2.5 @min-[540px]:grid-cols-2";

// ----------------------------------------------------------------- step 1

export const UseCaseStep = memo(function UseCaseStep({
  selected,
  onToggle,
}: {
  selected: readonly UseCaseId[];
  onToggle: (id: UseCaseId, on: boolean) => void;
}) {
  return (
    <Step
      n={1}
      title="What are you researching?"
      hint="Pick all that apply. Each choice sets a starting point for the sliders below, and you can still move them."
    >
      {/* A container query, not a viewport one: at lg the column beside the result card is narrow, so two
          cards across would leave their text a word or two per line. */}
      <div className="@container">
        <div className={CHOICE_GRID} role="group" aria-label="Research use cases">
          {USE_CASES.map((u) => (
            <Choice
              key={u.id}
              checked={selected.includes(u.id)}
              onChange={(on) => onToggle(u.id, on)}
              icon={USE_CASE_ICONS[u.id]}
              label={u.label}
              hint={u.hint}
              meta={`${u.preset.deepSearches} × ${formatInt(u.preset.videosPerSearch)}`}
            />
          ))}
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] leading-snug text-ink-2/75">
        Tags show Deep Searches a month × videos in each.
      </p>
    </Step>
  );
});

// ----------------------------------------------------------------- step 3

export interface ExtrasStepProps {
  agents: boolean;
  tracking: boolean;
  trackedItems: number;
  trackingCredits: number;
  onAgents: (next: boolean) => void;
  onTracking: (next: boolean) => void;
  onTrackedItems: (n: number) => void;
  assumptions: Assumptions;
  assumptionsOpen: boolean;
  assumptionsRef: RefObject<HTMLDivElement | null>;
  onToggleAssumptions: () => void;
  onAssumptionsChange: (next: Partial<Assumptions>) => void;
  onAssumptionsReset: () => void;
}

export const ExtrasStep = memo(function ExtrasStep({
  agents,
  tracking,
  trackedItems,
  trackingCredits,
  onAgents,
  onTracking,
  onTrackedItems,
  assumptions,
  assumptionsOpen,
  assumptionsRef,
  onToggleAssumptions,
  onAssumptionsChange,
  onAssumptionsReset,
}: ExtrasStepProps) {
  return (
    <Step n={3} last title="Extras" hint="Switch on what you will use. Both draw on your plan's monthly credits.">
      <div className="@container">
        <div className={CHOICE_GRID} role="group" aria-label="Extras">
          <Choice
            checked={agents}
            onChange={onAgents}
            icon={<Bot className="size-[18px]" aria-hidden="true" />}
            label="MCP / AI agents"
            hint="Research from your own agent"
          />
          <Choice
            checked={tracking}
            onChange={onTracking}
            icon={<TrendingUp className="size-[18px]" aria-hidden="true" />}
            label="Tracking"
            hint="Daily numbers on public accounts"
          />
        </div>
      </div>

      <div className={styles.disclosure} data-open={tracking}>
        <div inert={!tracking}>
          <div className="mt-3 rounded-btn border border-hairline p-5 md:p-6">
            <DialSlider
              label="Accounts and videos tracked"
              readout={`${trackedItems} items · ${formatInt(trackingCredits)} hunt credits`}
              min={TRACKED_MIN}
              max={TRACKED_MAX}
              step={TRACKED_STEP}
              value={trackedItems}
              onChange={onTrackedItems}
              subdivisions={1}
              endLabels={TRACKED_END_LABELS}
              valueText={trackedValueText}
            />
            <p className="mt-3 text-[12px] leading-snug text-ink-2/75">
              {TRACKING_CREDITS_PER_ITEM} hunt credits per item for a 30-day window: one for the first refresh and one
              for each day after.
            </p>
          </div>
        </div>
      </div>

      <div ref={assumptionsRef} className="mt-8 scroll-mt-28">
        <button
          type="button"
          aria-expanded={assumptionsOpen}
          aria-controls="calc-assumptions"
          onClick={onToggleAssumptions}
          className="group/edit inline-flex items-center gap-2 text-left text-[14px] font-medium text-ink"
        >
          <span className="border-b border-ink/30 pb-px transition-colors duration-200 group-hover/edit:border-ink">
            Edit the assumptions behind the numbers
          </span>
          <ChevronDown
            className={cn("size-4 transition-transform duration-300", assumptionsOpen && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        <div id="calc-assumptions" className={styles.disclosure} data-open={assumptionsOpen}>
          <div>
            <AssumptionsPanel
              assumptions={assumptions}
              onChange={onAssumptionsChange}
              onReset={onAssumptionsReset}
              tabbable={assumptionsOpen}
            />
          </div>
        </div>
      </div>
    </Step>
  );
});

// -------------------------------------------------------------- assumptions

function AssumptionsPanel({
  assumptions,
  onChange,
  onReset,
  tabbable,
}: {
  assumptions: Assumptions;
  onChange: (next: Partial<Assumptions>) => void;
  onReset: () => void;
  tabbable: boolean;
}) {
  return (
    <div className="mt-4 rounded-btn border border-hairline bg-surface/60 p-5" inert={!tabbable}>
      {/* Three rows shared by the fields (label, input, hint), so the inputs line up whatever the labels wrap to. */}
      <div className="grid gap-4 sm:grid-cols-3 sm:grid-rows-[auto_auto_auto] sm:gap-y-1.5">
        <NumberField
          label="Minutes per video"
          unit="min"
          min={0.5}
          max={10}
          step={0.5}
          value={assumptions.minutesPerVideo}
          onChange={(minutesPerVideo) => onChange({ minutesPerVideo })}
          hint="To watch, note and compare by hand."
        />
        <NumberField
          label="Run time per Deep Search"
          unit="min"
          min={1}
          max={30}
          value={assumptions.runMinutes}
          onChange={(runMinutes) => onChange({ runMinutes })}
          hint="Subtracted from the time saved."
        />
        <NumberField
          label="Videos per keyword search"
          unit="videos"
          min={10}
          max={100}
          step={10}
          value={assumptions.videosPerKeywordSearch}
          onChange={(videosPerKeywordSearch) => onChange({ videosPerKeywordSearch })}
          hint="Sets how many hunt credits a run needs."
        />
      </div>
      <ul className="mt-4 flex flex-col gap-1.5 text-[12px] leading-snug text-ink-2/75">
        <li>
          AI credits use ContHunt&apos;s own planning estimate: {CREDITS_PER_VIDEO.toFixed(1)} credits per video, with a
          10% buffer included. Real use varies with video length, follow-up chat and re-runs.
        </li>
        <li>
          One keyword search runs on three platforms and costs 3 hunt credits, one per platform. Your hourly rate is
          set in the result.
        </li>
        <li>
          {LARGEST.name} is the largest plan, at {formatInt(LARGEST.allowance.huntCredits)} hunt credits and{" "}
          {formatInt(LARGEST.allowance.aiCredits)} AI credits a month.
        </li>
      </ul>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-ink underline decoration-ink/30 underline-offset-2 transition-colors duration-200 hover:decoration-ink"
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset to defaults
      </button>
    </div>
  );
}
