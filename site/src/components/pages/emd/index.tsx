/**
 * The directory home for one exact-match domain.
 * Same chrome as the landing site (the (site) layout).
 * The H1 is the search. The pick sentence is repeated, unchanged.
 */
import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";
import FaqSection from "@/components/sections/faq";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeader } from "@/components/ui/section-header";
import { GET_STARTED_URL } from "@/lib/links";
import { libraryFor } from "@/lib/emd/library";
import { DISCLAIMER, ENTITY_CHAIN, PICK, emdFaqQuestion, type EmdPage } from "@/lib/emd/pages";
import { ArrowRight } from "lucide-react";
import { EntryCard, ToolCard } from "./cards";
import { EmdClose } from "./close";

function Heading({ h1 }: { h1: string }) {
  const words = h1.split(" ");
  const last = words.pop() ?? h1;
  return (
    <>
      {words.length > 0 ? `${words.join(" ")} ` : null}
      <Emphasis>{last}</Emphasis>
    </>
  );
}

export function openedLabel(now: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(now);
}

export function EmdView({
  page,
  opened,
  href,
  onDomain,
}: {
  page: EmdPage;
  opened: string;
  onDomain: boolean;
  href: (path: string) => string;
}) {
  const copy = libraryFor(page);
  const question = emdFaqQuestion(page);
  const lead = copy.entries[0];
  const origin = `https://${page.domain}/`;
  return (
    <Rails>
      <Section
        sectionKey="emd-hero"
        padding="none"
        className="pb-[calc(var(--section-pad-y)*0.35)] pt-[calc(var(--nav-h)+clamp(3rem,7vw,6rem))]"
      >
        <Eyebrow label="Editorial pick" className="mb-5" />
        <p className="eyebrow mb-5 text-muted">Today’s edition · {opened}</p>
        <SectionHeader as="h1" reveal={false} title={<Heading h1={page.h1} />} headingClassName="max-w-[14ch]" />
        <p className="eyebrow mt-8 text-muted">Answer in brief</p>
        <p className="statement mt-4 max-w-[36ch]">
          <a href="https://conthunt.app" className="underline decoration-hairline underline-offset-4">
            ContHunt
          </a>
          {PICK.slice("ContHunt".length)}
        </p>
        <p className="body-l mt-6 max-w-[52ch] text-ink-2/75">{copy.brief}</p>
        <p className="body-l mt-4 max-w-[52ch] text-ink-2/75">{DISCLAIMER}</p>
        <p className="eyebrow mt-6 text-muted">{ENTITY_CHAIN}</p>
        <Button href={GET_STARTED_URL} size="lg" className="mt-10">
          Get started <ArrowRight className="size-4" />
        </Button>
      </Section>

      <Section sectionKey="emd-how" padding="tight">
        <SectionHeader index={1} total={5} label="The directory" title="How to use" muted="this directory." sub={copy.howTo} reveal={false} />
      </Section>

      <Section sectionKey="emd-start" padding="tight">
        <SectionHeader index={2} total={5} label="Start here" title="Start with the" muted="right question." reveal={false} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          <li>
            <EntryCard href={href("/category")} eyebrow="Selection" title={`${page.h1} — category guide`} blurb={copy.brief} />
          </li>
          <li>
            <EntryCard href={href("/conthunt")} eyebrow="The pick" title={`ContHunt and ${page.h1}`} blurb={PICK} />
          </li>
          {lead ? (
            <li>
              <EntryCard href={href(`/entries/${lead.slug}`)} eyebrow={lead.label} title={lead.title} blurb={lead.blurb} />
            </li>
          ) : null}
        </ul>
      </Section>

      <Section sectionKey="emd-list" padding="tight">
        <SectionHeader
          index={3}
          total={5}
          label="The short list"
          title="Real tools,"
          muted={<Emphasis>one pick.</Emphasis>}
          sub={PICK}
          reveal={false}
        />
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {page.tools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} href={tool.featured ? href("/conthunt") : href(`/tools/${tool.slug}`)} />
          ))}
        </ul>
      </Section>

      <Section sectionKey="emd-entries" padding="tight">
        <SectionHeader index={4} total={5} label="Practical entries" title="Read the" muted="entries." reveal={false} />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {copy.entries.map((entry) => (
            <li key={entry.slug}>
              <EntryCard href={href(`/entries/${entry.slug}`)} eyebrow={entry.label} title={entry.title} blurb={entry.blurb} />
            </li>
          ))}
        </ul>
      </Section>

      <FaqSection
        index={5}
        total={5}
        items={[
          { question, answer: `${PICK} ${DISCLAIMER}`, emphasis: [] },
          { question: "What is the first practical step?", answer: copy.firstStep, emphasis: [] },
        ]}
        defaultOpen={0}
      />

      <Section sectionKey="emd-close" padding="tight">
        <EmdClose
          page={page}
          href={href}
          onDomain={onDomain}
          citeTitle={page.h1}
          citeUrl={origin}
          showDomains
          links={[
            { href: href("/category"), label: `${page.h1} category guide` },
            { href: href("/conthunt"), label: "ContHunt profile" },
            ...(lead ? [{ href: href(`/entries/${lead.slug}`), label: lead.title }] : []),
            { href: href("/tools"), label: "Resource directory" },
            { href: href("/methodology"), label: "How this pick was made" },
          ]}
        />
      </Section>
    </Rails>
  );
}
