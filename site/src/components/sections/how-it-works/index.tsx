/**
 * Home section 02 · How it works (owner brief §3; spec docs/revamp/sections/how-it-works.md).
 *
 *   Heading   "Splits your question. Watches 500+ videos. Ranks what wins." with
 *             verb pills that link to (and track) the three steps.
 *   01        You ask: a composer types a brief; "Try a brief" swaps the scenario
 *             for every step below.
 *   02        It plans: Q/P split, keyword fan-out, platform lanes, relevance gate
 *             (the X-reference adaptation; loops only while in view, pausable).
 *   03        It watches and ranks: poster wall through a scan line, Flip re-rank,
 *             Score/Views sort, cited answer.
 *   Outro     a text band (the retained "Get started" copy and the CTA), then the
 *             deep-dive recording beside the follow-up chat (watch it | keep asking).
 *
 * Server component; the interactive parts are client islands sharing HiwProvider.
 *
 *   <HowItWorksSection />
 *   <HowItWorksSection initialScenario="skincare" showOutro={false} />
 */
import { Section } from "@/components/layout/section";
import { Emphasis } from "@/components/ui/emphasis";
import { cn } from "@/lib/cn";
import { OUTRO, type ScenarioId } from "./content";
// The island's CSS ships with the page (its components load with the island).
import "./hiw.module.css";
import { DeepDive, FollowUp, HiwHeading, HiwProvider, HiwSteps } from "./island";

export interface HowItWorksSectionProps {
  /** Anchor id. Default "how-it-works". */
  id?: string;
  /** Eyebrow number. Default 2 (PLAN §2: [ 02 / 08 ]). */
  index?: number;
  /** Eyebrow total. Default 8. */
  total?: number;
  /** Brief shown first: "pets" (default), "kitchen" or "skincare". */
  initialScenario?: ScenarioId;
  /** Render the "keep talking" outro with the deep-dive video and CTA. Default true. */
  showOutro?: boolean;
  className?: string;
}

export default function HowItWorksSection({
  id,
  index = 2,
  total = 8,
  initialScenario,
  showOutro = true,
  className,
}: HowItWorksSectionProps) {
  return (
    // The outro ends on the chat composer, so the bottom pad is shorter than the shared one.
    <Section sectionKey="how-it-works" id={id} padding="top" className={cn("pb-[calc(var(--section-pad-y)*0.5)]", className)}>
      <HiwProvider initialScenario={initialScenario}>
        <HiwHeading index={index} total={total} />
        <HiwSteps className="mt-8" outro={showOutro ? <HiwOutro /> : undefined} />
      </HiwProvider>
    </Section>
  );
}

function HiwOutro() {
  return (
    <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-5">
      {/* Band: label + a two-line title across the full width (it wraps naturally on phones). */}
      <div className="lg:col-span-12">
        <p className="flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.04em]">
          <span className="text-pink-ink">→</span>
          <span className="text-ink/62">{OUTRO.label}</span>
        </p>
        <h3 className="mt-3 text-[clamp(1.625rem,1.35rem+0.9vw,2.125rem)] font-bold leading-[1.08] tracking-[-0.03em] text-ink">
          <span className="block lg:whitespace-nowrap">
            Then keep <Emphasis>asking</Emphasis>.
          </span>
          <span className="block text-muted lg:whitespace-nowrap">Every reply cites its videos.</span>
        </h3>
      </div>
      {/* Watch it | keep asking: the real recording beside the follow-up chat. */}
      <DeepDive id="hiw-demo" caption={OUTRO.videoCaption} className="lg:col-span-7 lg:self-start" />
      <FollowUp className="lg:col-span-5" />
    </div>
  );
}
