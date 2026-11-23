import Link from "next/link";
import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";
import { PageEyebrow } from "@/components/sections/pricing/mono-label";
import { SectionHeader } from "@/components/ui/section-header";
import { EngagementCalculator } from "@/components/pages/tools/engagement-calculator";
import { ROUTES } from "@/lib/links";
import type { PlatformBenchmarkDataset } from "@/lib/tools/benchmarks";

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolFormulaItem {
  name: string;
  formula: string;
  whenToUse: string;
}

export interface ToolRelatedLink {
  label: string;
  href: string;
  description: string;
}

export interface CalculatorPageContent {
  eyebrow: string;
  h1: string;
  intro: string;
  siblingTool: { label: string; href: string };
  dataset: PlatformBenchmarkDataset;
  formulas: ToolFormulaItem[];
  goodRateHeading: string;
  goodRateIntro: string;
  goodRateBullets: string[];
  faqs: ToolFaqItem[];
  relatedLinks: ToolRelatedLink[];
}

export function CalculatorPageLayout({ content }: { content: CalculatorPageContent }) {
  const { dataset } = content;
  const isTikTok = dataset.platform === "tiktok";
  const platformName = isTikTok ? "TikTok" : "Instagram";

  const nicheRows = dataset.niches.filter((n) => n.isNicheSpecific);

  return (
    <Rails>
      {/* Hero */}
      <Section
        sectionKey={`tool-${dataset.platform}-hero`}
        padding="none"
        className="pb-[calc(var(--section-pad-y)*0.35)] pt-[calc(var(--nav-h)+clamp(2.5rem,6vw,4.5rem))]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted">
            <Link href={ROUTES.home} className="hover:text-ink">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={ROUTES.tools} className="hover:text-ink">
              Tools
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{platformName} Engagement Rate Calculator</span>
          </nav>

          <Link
            href={content.siblingTool.href}
            className="rounded-chip border border-hairline bg-surface px-3 py-1.5 font-mono text-xs text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Switch to {content.siblingTool.label} →
          </Link>
        </div>

        <PageEyebrow className="mt-5 mb-4">{content.eyebrow}</PageEyebrow>
        <SectionHeader as="h1" title={content.h1} headingClassName="max-w-none" />
        <p className="body-l mt-5 max-w-[68ch] text-ink-2">{content.intro}</p>
      </Section>

      {/* Interactive Calculator */}
      <Section sectionKey={`tool-${dataset.platform}-app`} padding="none" className="pb-[calc(var(--section-pad-y)*0.65)]">
        <EngagementCalculator dataset={dataset} />
      </Section>

      {/* Formulas & What Is a Good Engagement Rate */}
      <Section
        sectionKey={`tool-${dataset.platform}-guide`}
        padding="none"
        className="border-t border-hairline py-[calc(var(--section-pad-y)*0.6)]"
      >
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <div>
              <PageEyebrow className="mb-3">Formulas</PageEyebrow>
              <h2 className="text-2xl font-medium text-ink sm:text-3xl">
                {platformName} engagement rate formulas explained
              </h2>
            </div>
            <div className="space-y-4">
              {content.formulas.map((item) => (
                <div key={item.name} className="rounded-btn border border-hairline bg-paper p-4">
                  <h3 className="text-base font-medium text-ink">{item.name}</h3>
                  <p className="mt-2 rounded-chip bg-surface px-3 py-2 font-mono text-xs text-ink">
                    {item.formula}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.whenToUse}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-6">
            <div>
              <PageEyebrow className="mb-3">Benchmarks</PageEyebrow>
              <h2 className="text-2xl font-medium text-ink sm:text-3xl">{content.goodRateHeading}</h2>
            </div>
            <p className="text-base leading-relaxed text-ink-2">{content.goodRateIntro}</p>
            <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-ink-2">
              {content.goodRateBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>

            {/* Real Viral Now Summary Card */}
            <div className="rounded-btn border border-hairline bg-surface p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">
                Live ContHunt Viral Now snapshot · week of {dataset.weekOf}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3 font-mono">
                <div>
                  <div className="text-xs text-muted">Sample size</div>
                  <div className="mt-0.5 text-lg font-semibold text-ink">{dataset.totalPlatformVideos} clips</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Median public ER</div>
                  <div className="mt-0.5 text-lg font-semibold text-ink">
                    {dataset.overallMedianPublicErPct.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted">Median Like/View</div>
                  <div className="mt-0.5 text-lg font-semibold text-ink">
                    {dataset.overallMedianLikeToViewPct.toFixed(2)}%
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Viral Now tracks top-performing public short-form videos across 20 niches — not random low-view posts. Matching or beating these medians means your {isTikTok ? "video" : "Reel"} engages at breakout levels.
              </p>
            </div>
          </div>
        </div>

        {/* Niche Benchmark Table (only shows niches with >= 5 real platform clips, so zero fabricated numbers) */}
        {nicheRows.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-medium text-ink sm:text-2xl">
              {platformName} engagement rate medians by niche (Viral Now public dataset)
            </h2>
            <p className="mt-2 max-w-[72ch] text-sm text-ink-2">
              Computed directly from ContHunt&apos;s public Viral Now dataset (week of {dataset.weekOf}) for niches with at least 5 {platformName} clips.{" "}
              {isTikTok
                ? "Public ER includes likes, comments, and shares divided by views (saves are private on TikTok)."
                : "Public ER includes likes and comments divided by views (shares and saves are private on Instagram)."}
            </p>
            <div className="mt-4 overflow-x-auto rounded-btn border border-hairline bg-paper">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-hairline bg-surface font-mono text-xs text-muted">
                    <th className="px-4 py-3 font-medium">Niche</th>
                    <th className="px-4 py-3 font-medium">Clips (n)</th>
                    <th className="px-4 py-3 font-medium">Median Public ER</th>
                    <th className="px-4 py-3 font-medium">75th Pct ER</th>
                    <th className="px-4 py-3 font-medium">Median Like/View</th>
                    {isTikTok && <th className="px-4 py-3 font-medium">Median Share/View</th>}
                    <th className="px-4 py-3 font-medium">Board</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {nicheRows.map((row) => (
                    <tr key={row.slug} className="hover:bg-surface/40">
                      <td className="px-4 py-2.5 font-medium text-ink">{row.name}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted">{row.platformSampleSize}</td>
                      <td className="px-4 py-2.5 font-mono font-medium text-ink">
                        {row.medianPublicErPct.toFixed(2)}%
                      </td>
                      <td className="px-4 py-2.5 font-mono text-ink-2">{row.p75PublicErPct.toFixed(2)}%</td>
                      <td className="px-4 py-2.5 font-mono text-ink-2">
                        {row.medianLikeToViewPct.toFixed(2)}%
                      </td>
                      {isTikTok && (
                        <td className="px-4 py-2.5 font-mono text-ink-2">
                          {row.medianShareToViewPct != null ? `${row.medianShareToViewPct.toFixed(2)}%` : "—"}
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-xs">
                        <Link
                          href={`${ROUTES.viralNow}/${row.slug}`}
                          className="font-medium text-blue-ink underline underline-offset-2 hover:text-ink"
                        >
                          View clips →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      {/* FAQ */}
      <Section
        sectionKey={`tool-${dataset.platform}-faq`}
        padding="none"
        className="border-t border-hairline py-[calc(var(--section-pad-y)*0.6)]"
      >
        <PageEyebrow className="mb-3">FAQ</PageEyebrow>
        <h2 className="text-2xl font-medium text-ink sm:text-3xl">
          Frequently asked questions about {platformName} engagement rate
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {content.faqs.map((faq) => (
            <div key={faq.question} className="rounded-btn border border-hairline bg-paper p-5">
              <h3 className="text-base font-medium text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-2">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Related Resources */}
      <Section
        sectionKey={`tool-${dataset.platform}-related`}
        padding="bottom"
        className="border-t border-hairline pt-[calc(var(--section-pad-y)*0.5)]"
      >
        <PageEyebrow className="mb-3">Keep researching</PageEyebrow>
        <h2 className="text-xl font-medium text-ink sm:text-2xl">Related tools &amp; guides</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {content.relatedLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-btn border border-hairline bg-paper p-5 transition-colors hover:border-ink/40"
            >
              <div className="text-base font-medium text-ink group-hover:text-blue-ink">{item.label} →</div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{item.description}</p>
            </Link>
          ))}
        </div>
      </Section>
    </Rails>
  );
}
