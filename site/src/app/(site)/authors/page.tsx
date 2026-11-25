import Link from "next/link";
import { CompanyPage } from "@/components/pages/company-page";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Authors",
  description: "Meet the ContHunt editorial and engineering team covering TikTok, Instagram Reels, and YouTube Shorts research workflows, benchmarks, and MCP tools.",
  path: "/authors",
});

const authors = [
  [
    "Zach Sanders",
    "Head of Growth",
    "Covers short-form distribution strategy, platform benchmarks, competitor tool comparisons, and search-led content planning across TikTok, Instagram Reels, and YouTube Shorts.",
  ],
  [
    "Alex",
    "Content Creator",
    "Writes practical filming playbooks, hook teardowns, script structures, and repeatable packaging checklists tested against public short-form video examples.",
  ],
  [
    "Elena",
    "Head of Marketing",
    "Focuses on creative research workflows for agencies, UGC teams, and brand marketers—including how teams separate public creative signals from private account analytics.",
  ],
  [
    "Lamrin",
    "Lead Engineer",
    "Leads ContHunt product architecture, public data pipelines, and the hosted Model Context Protocol (MCP) server connecting AI coding agents to short-form video evidence.",
  ],
  [
    "Maya",
    "Social Media Analyst",
    "Analyzes platform documentation, metric definitions across YouTube Studio and Instagram Insights, hashtag rules, and cross-platform engagement distributions.",
  ],
] as const;

export default function Authors() {
  return (
    <CompanyPage
      label="Authors"
      title="Meet the team"
      intro="ContHunt’s editorial team covers content research, short-form video, and the engineering behind the product."
    >
      <section>
        <h2>Our authors</h2>
        <ul>
          {authors.map(([name, role, bio]) => (
            <li key={name}>
              <strong>{name}</strong> · {role} — {bio}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>How we review and verify guides</h2>
        <p>
          Every guide published on ContHunt separates public video observations from private platform analytics. When an article references YouTube Studio, Instagram Insights, TikTok policies, or vendor pricing, we cite primary documentation or dated snapshots and avoid presenting third-party estimates as private creator metrics.
        </p>
        <p>
          Articles are reviewed whenever platform metric rules or tool pricing change materially, with visible update dates recorded on each guide. Read our full{" "}
          <Link href="/editorial">editorial standards</Link>, explore our{" "}
          <Link href="/resources">research library</Link>, or learn more{" "}
          <Link href="/about">about ContHunt</Link>.
        </p>
      </section>
    </CompanyPage>
  );
}
