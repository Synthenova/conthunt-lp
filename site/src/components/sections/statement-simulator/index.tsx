/**
 * Home section 1.5-2: "statement-simulator".
 *
 * The giant "Stop scrolling…" statement with inline video squircles (G1o2H), then the page's one
 * pinned scroll-jack (J7ZHKO -> H4IoP) that brings in a live Deep Search simulator.
 * Preview: /preview/statement-simulator. Brief: docs/revamp/sections/statement-simulator.md.
 *
 *   <StatementSimulatorSection />                         // placeholder data
 *   <StatementSimulatorSection simulator={realProps} />   // owner data, see ./README.md
 *
 * Server component. The pin is applied to an inner stage inside the scene, never to this
 * <section data-section>, so the Rails keep their direct children (FOUNDATION §6).
 */
import chipsJson from "@/content/media/statement-chips.json";
import { placeholderSimulatorProps } from "@/content/simulator/placeholder";
import type { DeepSearchSimulatorProps } from "@/content/simulator/types";
import { Section } from "@/components/layout/section";
import { StatementSimulatorScene } from "./island";
import type { StatementChip } from "./scene";
// The island's CSS ships with the page (its components load with the island).
import "./simulator/sim.module.css";
import "./simulator/tile.module.css";
import styles from "./scene.module.css";

export interface StatementSimulatorSectionProps {
  /** Simulator data. Defaults to the placeholder (one designed deep search; tabs 2 and 3 render as finished sample runs, see ./simulator/sample-runs.ts). */
  simulator?: DeepSearchSimulatorProps;
  /** Eyebrow numbering, `[ 01 / 08 ] · DEEP SEARCH`. */
  index?: number;
  total?: number;
}

const CHIPS: StatementChip[] = chipsJson.map((c) => ({
  n: c.n,
  label: c.label,
  creator: c.creator,
  views: c.views,
  video: c.video,
  poster: c.poster,
  platform: c.platform,
  caption: c.caption,
}));

export default function StatementSimulatorSection({
  simulator = placeholderSimulatorProps,
  index = 1,
  total = 8,
}: StatementSimulatorSectionProps) {
  return (
    <Section
      sectionKey="statement-simulator"
      letterbox={false}
      padding="none"
      className={styles.section}
      aria-label="Deep Search demo"
    >
      <StatementSimulatorScene simulator={simulator} chips={CHIPS} index={index} total={total} />
    </Section>
  );
}

// Client components are not re-exported here: a re-export would put their code in the
// first-load JavaScript of every page that renders this section. Import them from their files.
