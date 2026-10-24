"use client";

/**
 * Step 01's brief picker: three pills that swap the scenario for the whole section
 * and rerun the walkthrough (the composer retypes, the plan and rank stages replay).
 * Lives in the step's text column, above the "Pick a brief" hint. Real buttons with
 * aria-pressed, so the site's delegated "select" sound cue applies.
 *
 *   <BriefPicker className="mt-5" />
 */
import { capture } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { SCENARIO_ORDER, SCENARIOS } from "./content";
import { useHiw } from "./hiw-context";

export function BriefPicker({ className }: { className?: string }) {
  const { scenario, pickScenario } = useHiw();

  return (
    <div role="group" aria-label="Try a brief" className={cn("flex flex-wrap gap-1.5 min-[1440px]:-mr-6", className)}>
      {SCENARIO_ORDER.map((id) => {
        const active = id === scenario.id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => {
              pickScenario(id);
              capture("hiw_scenario_selected", { scenario: id });
            }}
            className={cn(
              // 36px visual, 44px hit area (the ::after expander).
              "relative h-9 rounded-chip px-2.5 text-[13px] font-medium after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
              "transition-[background-color,color,scale] duration-200 ease-out active:scale-[0.96]",
              active ? "bg-pink-ink text-white" : "bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}
          >
            {SCENARIOS[id].chip}
          </button>
        );
      })}
    </div>
  );
}
