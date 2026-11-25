import type { ReactNode } from "react";
import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";

export function GrowthPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <Rails><Section sectionKey="growth-page" padding="none" className="pb-[var(--section-pad-y)] pt-[calc(var(--nav-h)+clamp(3rem,7vw,5.5rem))]">
    <div className="mx-auto max-w-4xl space-y-8"><header className="space-y-4"><h1 className="text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1><p className="body-l max-w-[70ch] text-ink-2">{description}</p></header>{children}</div>
  </Section></Rails>;
}
