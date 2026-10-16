"use client";

/**
 * FeatureGrid — the four retained bento items under the big tile.
 *
 * Container-query layout (by the grid's own width, not the viewport):
 * - >= 46rem: 3 columns. Multi-platform spans 2, Deep research is tall on the right,
 *   Niche hunter and Velocity sit under Multi-platform.
 * - 36–46rem: 2 columns. Multi-platform spans 2; Deep research is tall on the left.
 * - below: one column.
 */
import { cn } from "@/lib/cn";
import { FEATURES } from "./data";
import { FeatureTile } from "./feature-tile";
import { NicheFragment } from "./fragment-niche";
import { PlatformsFragment } from "./fragment-platforms";
import { ResearchFragment } from "./fragment-research";
import { VelocityFragment } from "./fragment-velocity";

export function FeatureGrid({ className }: { className?: string }) {
  return (
    <div className={cn("@container/features", className)}>
      <div className="grid grid-cols-1 gap-4 @min-[36rem]/features:grid-cols-2 @min-[46rem]/features:grid-cols-3 @min-[46rem]/features:auto-rows-[minmax(21rem,auto)]">
        <FeatureTile feature={FEATURES.platforms} className="@min-[36rem]/features:col-span-2">
          {(active) => <PlatformsFragment active={active} />}
        </FeatureTile>
        <FeatureTile
          feature={FEATURES.research}
          className="@min-[36rem]/features:row-span-2 @min-[46rem]/features:col-start-3 @min-[46rem]/features:row-start-1"
        >
          {(active) => <ResearchFragment active={active} />}
        </FeatureTile>
        <FeatureTile feature={FEATURES.niche}>{(active) => <NicheFragment active={active} />}</FeatureTile>
        <FeatureTile feature={FEATURES.velocity}>{(active) => <VelocityFragment active={active} />}</FeatureTile>
      </div>
    </div>
  );
}
