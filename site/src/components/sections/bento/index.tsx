/**
 * Bento — home section 03 · FEATURES (refs jreAl + q41dd; spec docs/revamp/sections/bento.md).
 *
 *   <BentoSection />                          // home, inside <Rails>
 *   <BentoSection showHeader={false} />       // tiles only (e.g. another page supplies a header)
 *   <BentoSection index={3} total={8} />      // eyebrow numbering override
 *
 * Server component. Interactive islands: AnalysisTile (the big "Every signal" tile with the
 * data explosion) and FeatureGrid's tiles. Both are also exported for reuse.
 */
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL } from "@/lib/links";
// The island's CSS ships with the page (its components load with the island).
import "./analysis-tile.module.css";
import { AnalysisTile, FeatureGrid } from "./island";
import { SECTION } from "./data";

// Client components are not re-exported here: a re-export would put their code in the
// first-load JavaScript of every page that renders this section. Import them from their files.

export interface BentoSectionProps {
  /** Render the eyebrow + heading block. Default true. */
  showHeader?: boolean;
  /** Eyebrow number. Default 3 (PLAN §2). */
  index?: number;
  /** Eyebrow total. Default 8. */
  total?: number;
  /** Anchor id. Default "bento". */
  id?: string;
  className?: string;
}

export default function BentoSection({ showHeader = true, index = SECTION.index, total = 8, id, className }: BentoSectionProps) {
  return (
    <Section sectionKey="bento" id={id} className={className}>
      {showHeader && (
        <SectionHeader
          index={index}
          total={total}
          label={SECTION.label}
          title={
            <>
              <Emphasis>{SECTION.keyword}</Emphasis>
              {SECTION.titleRest}
            </>
          }
          muted={SECTION.muted}
          sub={SECTION.sub}
          actions={
            <Button href={GET_STARTED_URL} size="md" {...phAttrs("bento", "app")}>
              Get started
            </Button>
          }
          className="mb-10 md:mb-14"
        />
      )}
      <AnalysisTile />
      <FeatureGrid className="mt-4" />
    </Section>
  );
}
