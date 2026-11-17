import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";
import { PageEyebrow } from "@/components/sections/pricing/mono-label";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { CONTACT, MESSAGE_CHECKLIST, SUPPORT_MAILTO, TOPICS, type Paragraph } from "./content";

const LINK = "font-medium text-ink underline underline-offset-2";
const BODY = "max-w-[60ch] text-[15px] leading-[1.6] text-ink-2";

function Text({ runs, className }: { runs: Paragraph; className?: string }) {
  return (
    <p className={className}>
      {runs.map((run, i) =>
        typeof run === "string" ? (
          run
        ) : (
          <a key={i} href={run.href} className={LINK}>
            {run.text}
          </a>
        ),
      )}
    </p>
  );
}

export default function SupportPage() {
  return (
    <Rails>
      <Section
        sectionKey="support-contact"
        id="contact"
        padding="none"
        className="pb-[calc(var(--section-pad-y)*0.5)] pt-[calc(var(--nav-h)+clamp(3rem,7vw,6rem))]"
      >
        <PageEyebrow className="mb-5">Support</PageEyebrow>
        <SectionHeader
          as="h1"
          title="Questions about ContHunt?"
          muted={
            <span className="block">
              <Emphasis>Email</Emphasis> us.
            </span>
          }
          headingClassName="max-w-none"
        />
        {CONTACT.map((runs, i) => (
          <Text key={i} runs={runs} className="body-l mt-6 max-w-[52ch] text-ink-2/75" />
        ))}
        <div className="mt-8">
          <Button href={SUPPORT_MAILTO}>Email support</Button>
        </div>
      </Section>

      <Section sectionKey="support-topics" id="topics">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <PageEyebrow className="mb-5">What to include</PageEyebrow>
            <SectionHeader as="h2" size="m" title="Help us help you faster." headingClassName="max-w-[14ch]" />
            <ul className="mt-8 flex list-disc flex-col gap-2 pl-5 text-[15px] leading-[1.6] text-ink-2">
              {MESSAGE_CHECKLIST.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <ul className="border-t border-hairline">
            {TOPICS.map((topic) => (
              <li key={topic.id} id={topic.id} className="flex flex-col gap-3 border-b border-hairline py-6">
                <h3 className="text-[17px] font-medium leading-snug tracking-[-0.01em] text-ink">{topic.title}</h3>
                {topic.body.map((runs, i) => (
                  <Text key={i} runs={runs} className={BODY} />
                ))}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </Rails>
  );
}
