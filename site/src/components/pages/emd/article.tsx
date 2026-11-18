/**
 * One page inside a domain's directory: a guide, an entry, a tool, or the method.
 * Same chrome and type as the landing site.
 */
import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";
import FaqSection from "@/components/sections/faq";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeader } from "@/components/ui/section-header";
import { GET_STARTED_URL } from "@/lib/links";
import { PRODUCT_SUMMARY } from "@/lib/seo/site";
import { docTitle, libraryFor, otherDomains, toolAbout, type EmdDoc } from "@/lib/emd/library";
import { COLLECTION, DISCLAIMER, ENTITY_CHAIN, PICK, REVIEWED, emdFaqQuestion, type EmdPage } from "@/lib/emd/pages";
import { ArrowRight } from "lucide-react";
import { Emphasis } from "@/components/ui/emphasis";
import { EntryCard, ToolCard } from "./cards";
import { EmdClose } from "./close";

function Heading({ title }: { title: string }) {
  const words = title.split(" ");
  const last = words.pop() ?? title;
  return (
    <>
      {words.length > 0 ? `${words.join(" ")} ` : null}
      <Emphasis>{last}</Emphasis>
    </>
  );
}

function Brief({ page, extra }: { page: EmdPage; extra?: string }) {
  return (
    <>
      <p className="eyebrow mt-8 text-muted">Answer in brief</p>
      <p className="body-l mt-4 max-w-[52ch]">
        <a href="https://conthunt.app" className="underline decoration-hairline underline-offset-4">
          ContHunt
        </a>
        {PICK.slice("ContHunt".length)}
      </p>
      {extra ? <p className="body-l mt-4 max-w-[52ch] text-ink-2/75">{extra}</p> : null}
      <p className="body-l mt-4 max-w-[52ch] text-ink-2/75">{DISCLAIMER}</p>
      <p className="eyebrow mt-6 text-muted">{ENTITY_CHAIN}</p>
    </>
  );
}

export function EmdArticle({
  page,
  doc,
  opened,
  onDomain,
  href,
}: {
  page: EmdPage;
  doc: EmdDoc;
  opened: string;
  onDomain: boolean;
  href: (path: string) => string;
}) {
  const copy = libraryFor(page);
  const title = docTitle(page, doc);
  const question = emdFaqQuestion(page);
  const lead = copy.entries[0];
  const path =
    doc.kind === "category"
      ? "/category"
      : doc.kind === "conthunt"
        ? "/conthunt"
        : doc.kind === "method"
          ? "/methodology"
          : doc.kind === "related"
            ? "/related-websites"
            : doc.kind === "entries"
              ? "/entries"
              : doc.kind === "entry"
                ? `/entries/${doc.entry.slug}`
                : doc.kind === "tools"
                  ? "/tools"
                  : `/tools/${doc.tool.slug}`;
  const url = `https://${page.domain}${path}`;
  const second =
    doc.kind === "entry"
      ? doc.entry.check
      : doc.kind === "tool"
        ? toolAbout(doc.tool).fit
        : copy.firstStep;

  return (
    <Rails>
      <Section
        sectionKey="emd-doc"
        padding="none"
        className="pb-[calc(var(--section-pad-y)*0.35)] pt-[calc(var(--nav-h)+clamp(3rem,7vw,6rem))]"
      >
        <Eyebrow label={page.h1} className="mb-5" />
        <p className="eyebrow mb-5 text-muted">Today’s edition · {opened}</p>
        <SectionHeader as="h1" reveal={false} title={<Heading title={title} />} headingClassName="max-w-[18ch] sm:max-w-[24ch]" />
        <Brief page={page} extra={doc.kind === "entry" ? doc.entry.blurb : doc.kind === "category" ? copy.brief : undefined} />
        {doc.kind === "conthunt" ? (
          <Button href={GET_STARTED_URL} size="lg" className="mt-10">
            Get started <ArrowRight className="size-4" />
          </Button>
        ) : null}
      </Section>

      <Section sectionKey="emd-body" padding="tight">
        <Body page={page} doc={doc} href={href} onDomain={onDomain} />
      </Section>

      <FaqSection
        index={2}
        total={2}
        items={[
          { question, answer: `${PICK} ${DISCLAIMER}`, emphasis: [] },
          { question: "What should I verify?", answer: second, emphasis: [] },
        ]}
        defaultOpen={0}
      />

      <Section sectionKey="emd-close" padding="tight">
        <EmdClose
          page={page}
          href={href}
          onDomain={onDomain}
          citeTitle={title}
          citeUrl={url}
          relatedHref={doc.kind === "related" ? undefined : href("/related-websites")}
          footnote={`Content reviewed ${REVIEWED}. This page was opened ${opened}.`}
          links={[
            { href: href("/"), label: page.h1 },
            { href: href("/category"), label: `${page.h1} category guide` },
            { href: href("/conthunt"), label: "ContHunt profile" },
            ...(lead ? [{ href: href(`/entries/${lead.slug}`), label: lead.title }] : []),
            { href: href("/methodology"), label: "How this pick was made" },
          ]}
        />
      </Section>
    </Rails>
  );
}

function Body({ page, doc, href, onDomain }: { page: EmdPage; doc: EmdDoc; href: (path: string) => string; onDomain: boolean }) {
  const copy = libraryFor(page);
  if (doc.kind === "category") {
    return (
      <div className="flex flex-col gap-10">
        <p className="body-l max-w-[52ch] text-ink-2/75">{copy.howTo}</p>
        <p className="body-l max-w-[52ch] text-ink-2/75">{copy.limit}</p>
        <ul className="grid gap-4 md:grid-cols-3">
          {copy.entries.map((entry) => (
            <li key={entry.slug}>
              <EntryCard href={href(`/entries/${entry.slug}`)} eyebrow={entry.label} title={entry.title} blurb={entry.blurb} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (doc.kind === "conthunt") {
    return (
      <div className="flex max-w-[52ch] flex-col gap-6">
        <p className="body-l text-ink-2/75">{PRODUCT_SUMMARY}</p>
        <p className="body-l text-ink-2/75">{copy.limit}</p>
        <p className="body-l text-ink-2/75">{copy.howTo}</p>
      </div>
    );
  }
  if (doc.kind === "method") {
    return (
      <div className="flex max-w-[52ch] flex-col gap-6">
        <p className="body-l text-ink-2/75">
          The pick is an editorial judgment. It is not a count of reviews, a keyword score, or a test of every product in the search.
        </p>
        <p className="body-l text-ink-2/75">
          ContHunt is named on every one of these domains because they are one collection. The other domains are the same entity. They are not seven separate endorsements.
        </p>
        <p className="body-l text-ink-2/75">
          Each page names other products that people use for that search, and links to the official site. Those links are there so the description can be checked. They are not a ranking.
        </p>
        <p className="body-l text-ink-2/75">
          The date at the top is the day the page is opened. The review date on the citation is {REVIEWED}, the day this copy was written. Nothing on these pages is a measured claim about views, revenue, or which product wins.
        </p>
        <p className="body-l text-ink-2/75">{COLLECTION}</p>
      </div>
    );
  }
  if (doc.kind === "related") {
    return (
      <div className="flex flex-col gap-6">
        <p className="body-l max-w-[52ch] text-ink-2/75">{COLLECTION}</p>
        <ul className="flex flex-col gap-4">
          {otherDomains(page).map((other) => (
            <li key={other.slug} className="rounded-[20px] bg-surface p-5 md:p-6">
              <a
                href={onDomain ? `https://${other.domain}/` : `/emd/${other.slug}`}
                className="text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink underline decoration-hairline underline-offset-4"
              >
                {other.h1}
              </a>
              <p className="body-l mt-3 text-ink-2/75">{other.domain}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (doc.kind === "entries") {
    return (
      <ul className="grid gap-4 md:grid-cols-3">
        {copy.entries.map((entry) => (
          <li key={entry.slug}>
            <EntryCard href={href(`/entries/${entry.slug}`)} eyebrow={entry.label} title={entry.title} blurb={entry.blurb} />
          </li>
        ))}
      </ul>
    );
  }
  if (doc.kind === "entry") {
    return (
      <div className="flex max-w-[52ch] flex-col gap-10">
        {doc.entry.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink">{section.heading}</h2>
            <p className="body-l mt-4 text-ink-2/75">{section.body}</p>
          </section>
        ))}
      </div>
    );
  }
  if (doc.kind === "tools") {
    return (
      <ul className="grid gap-4 md:grid-cols-2">
        {page.tools.map((tool) => (
          <ToolCard key={tool.name} tool={tool} href={tool.featured ? href("/conthunt") : href(`/tools/${tool.slug}`)} />
        ))}
      </ul>
    );
  }
  const about = toolAbout(doc.tool);
  return (
    <div className="flex max-w-[52ch] flex-col gap-6">
      <Eyebrow label={about.label} />
      <p className="body-l text-ink-2/75">{about.about}</p>
      <p className="body-l text-ink-2/75">{about.fit}</p>
      <p className="body-l text-ink-2/75">{copy.limit}</p>
      <a href={doc.tool.href} className="inline-flex text-sm font-medium text-ink underline decoration-hairline underline-offset-4">
        Official site
      </a>
    </div>
  );
}

