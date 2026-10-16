/**
 * FAQ — `[ 08 / 08 ] · FAQ`. Retained copy, single-open accordion.
 *
 *   <FaqSection />                                              // home: all questions, first one open
 *   <FaqSection items={pickFaqs(["free-trial", "cancel"])} index={null} defaultOpen={null} />   // /pricing
 *   <FaqAccordion items={...} />                                // just the accordion, no frame
 *
 * Props
 *  - items:       FaqEntry[]  (default FAQ_ITEMS; build a subset with `pickFaqs([...ids])`)
 *  - index/total: eyebrow numbers (default 8 / 8). `index={null}` shows the label only ("FAQ").
 *  - title/muted: heading parts (default "Questions," + italic "answered.")
 *  - defaultOpen: index open on first render, or null (default 0)
 *  - outro:       show the closing "Still curious? Get started" line (default true)
 *  - sectionKey / id / className: forwarded to <Section>
 *
 * Wrap in <Rails> on the home page (the preview route does). The copy lives in
 * ./items.ts: retained legacy answers with two corrections plus three additions.
 */
import type { ReactNode } from "react";
import { Section } from "@/components/layout/section";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FaqLayout, Reveal } from "./island";
import { FAQ_ITEMS, pickFaqs, type FaqEntry } from "./items";

// Client components are not re-exported here: a re-export would put their code in the
// first-load JavaScript of every page that renders this section. Import them from their files.
export { FAQ_ITEMS, pickFaqs };
export type { FaqEntry };

export interface FaqSectionProps {
  items?: readonly FaqEntry[];
  index?: number | null;
  total?: number;
  title?: ReactNode;
  muted?: ReactNode;
  defaultOpen?: number | null;
  outro?: boolean;
  sectionKey?: string;
  id?: string;
  className?: string;
}

export default function FaqSection({
  items = FAQ_ITEMS,
  index = 8,
  total = 8,
  title = "Questions,",
  muted = <Emphasis>answered.</Emphasis>,
  defaultOpen = 0,
  outro = true,
  sectionKey = "faq",
  id,
  className,
}: FaqSectionProps) {
  const header = (
    <header className="flex flex-col gap-5">
      <Eyebrow index={index ?? undefined} total={total} label="FAQ" />
      <Reveal as="h2" className="display-l max-w-[10ch] lg:text-[48px]">
        {title} <span className="text-muted">{muted}</span>
      </Reveal>
    </header>
  );

  return (
    <Section sectionKey={sectionKey} id={id} className={className}>
      <FaqLayout header={header} items={items} defaultOpen={defaultOpen} outro={outro} />
    </Section>
  );
}
