import Link from "next/link";
import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";
import { PageEyebrow } from "@/components/sections/pricing/mono-label";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeader } from "@/components/ui/section-header";
import { GET_STARTED_URL, ROUTES } from "@/lib/links";
import { pageMetadata } from "@/lib/seo/metadata";
import { toolsHubGraph } from "@/lib/seo/schema";
import { loadPlatformBenchmarks } from "@/lib/tools/benchmarks";

const DESCRIPTION =
  "Free TikTok and Instagram engagement rate and outlier calculators — instant ratios, batch 3-10 post averages, CSV export, and real Viral Now niche benchmarks.";

export const metadata = pageMetadata({
  title: "Free Creator Tools & Engagement Calculators",
  description: DESCRIPTION,
  path: ROUTES.tools,
});

export default function ToolsHubPage() {
  const tiktok = loadPlatformBenchmarks("tiktok");
  const instagram = loadPlatformBenchmarks("instagram");

  const tools = [
    {
      name: "TikTok Engagement Rate Calculator",
      path: ROUTES.tiktokCalculator,
      badge: `${tiktok.totalPlatformVideos} public TikTok clips benchmarked`,
      description:
        "Calculate TikTok engagement rate by views and followers, like-to-view, save-to-view, share-to-view, and breakout outlier multiplier against real Viral Now niche medians.",
      highlights: [
        "Single video + batch (3–10 videos) mode",
        "Includes Saves/Bookmarks and Shares",
        `Real niche medians across 20 Viral Now categories (week of ${tiktok.weekOf})`,
        "1-click summary copy & CSV export",
      ],
    },
    {
      name: "Instagram Engagement Rate Calculator",
      path: ROUTES.instagramCalculator,
      badge: `${instagram.totalPlatformVideos} public Instagram Reels benchmarked`,
      description:
        "Measure Instagram Reels engagement rate by views (reach) and followers, track saves and shares from Insights, detect outlier Reels, and compare against public Viral Now benchmarks.",
      highlights: [
        "Single Reel + batch (3–10 Reels) mode",
        "Full Insights ER + public-comparable ER side-by-side",
        "Outlier multiplier against your account median",
        "1-click summary copy & CSV export",
      ],
    },
  ];

  return (
    <>
      <JsonLd data={toolsHubGraph(tools.map(({ name, path, description }) => ({ name, path, description })))} />
      <Rails>
        <Section
          sectionKey="tools-hub-hero"
          padding="none"
          className="pb-[calc(var(--section-pad-y)*0.45)] pt-[calc(var(--nav-h)+clamp(3rem,7vw,5.5rem))]"
        >
          <PageEyebrow className="mb-4">Free tools</PageEyebrow>
          <SectionHeader as="h1" title="Free creator calculators." headingClassName="max-w-none" />
          <p className="body-l mt-5 max-w-[62ch] text-ink-2">
            Instant, no-login calculators for short-form video teams. Every benchmark comes directly from ContHunt&apos;s public{" "}
            <Link href={ROUTES.viralNow} className="font-medium text-ink underline underline-offset-2">
              Viral Now
            </Link>{" "}
            dataset — zero made-up averages, zero paywalls.
          </p>
        </Section>

        <Section sectionKey="tools-hub-cards" padding="bottom">
          <div className="grid gap-6 md:grid-cols-2">
            {tools.map((tool) => (
              <div
                key={tool.path}
                className="flex flex-col justify-between rounded-card border border-hairline bg-paper p-6 shadow-float sm:p-8"
              >
                <div>
                  <span className="inline-block rounded-chip bg-surface px-3 py-1 font-mono text-xs text-ink-2">
                    {tool.badge}
                  </span>
                  <h2 className="mt-4 text-2xl font-medium text-ink">{tool.name}</h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{tool.description}</p>
                  <ul className="mt-5 list-disc space-y-1.5 pl-5 text-sm text-ink-2">
                    {tool.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4">
                  <Link
                    href={tool.path}
                    className="inline-flex items-center justify-center rounded-btn bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-90"
                  >
                    Open calculator →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 rounded-card border border-hairline bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="max-w-2xl space-y-1">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">Full research workflow</p>
              <h2 className="text-xl font-medium text-ink">
                Need automated outlier tracking across TikTok, Reels &amp; Shorts?
              </h2>
              <p className="text-sm text-ink-2">
                ContHunt searches public short-form videos across all three platforms, breaks down winning hooks and formats, and tracks competitor accounts daily.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href={ROUTES.viralNow}
                className="rounded-btn border border-hairline bg-paper px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2"
              >
                Explore Viral Now
              </Link>
              <a
                href={`${GET_STARTED_URL}?utm_source=free-tool&utm_medium=hub&utm_campaign=tools-hub`}
                data-ch-placement="free_tool_cta"
                className="rounded-btn bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90"
              >
                Start 7-day free trial →
              </a>
            </div>
          </div>
        </Section>
      </Rails>
    </>
  );
}
