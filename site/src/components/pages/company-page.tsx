import type { ReactNode } from "react";
import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";
import { PageEyebrow } from "@/components/sections/pricing/mono-label";
import { SectionHeader } from "@/components/ui/section-header";

export function CompanyPage({ label, title, intro, children }: { label: string; title: string; intro: string; children: ReactNode }) {
  return (
    <Rails>
      <Section sectionKey={`${label.toLowerCase()}-intro`} padding="none" className="pb-[calc(var(--section-pad-y)*0.5)] pt-[calc(var(--nav-h)+clamp(3rem,7vw,6rem))]">
        <PageEyebrow className="mb-5">{label}</PageEyebrow>
        <SectionHeader as="h1" title={title} headingClassName="max-w-none" />
        <p className="body-l mt-6 max-w-[60ch] text-ink-2">{intro}</p>
      </Section>
      <Section sectionKey={`${label.toLowerCase()}-details`} padding="bottom">
        <div className="max-w-[75ch] space-y-10 text-[16px] leading-[1.7] text-ink-2 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-ink [&_a]:font-medium [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </Section>
    </Rails>
  );
}
