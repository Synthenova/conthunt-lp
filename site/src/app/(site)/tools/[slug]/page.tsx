import { notFound } from "next/navigation";
import { GrowthPage } from "@/components/growth/GrowthPage";
import { GatedResearchTool, type ResearchToolKind } from "@/components/growth/GatedResearchTool";
import { YoutubeShortsErCalculator, ViralOutlierScoreCalculator, ShortFormCpmRpmCalculator, ViralHookGenerator } from "@/components/growth/FreeUtilityTools";
import { FREE_UTILITY_PAGES, GATED_TOOL_PAGES, HOOK_TEMPLATES } from "@/content/seo-growth/analyzers-and-tools";
import { pageMetadata } from "@/lib/growth/metadata";

type Props = { params: Promise<{ slug: string }> };
const gatedKinds: Record<string, ResearchToolKind> = { "tiktok-hook-transcript-extractor": "hook-extractor", "instagram-reels-script-breakdown": "reels-breakdown", "youtube-shorts-outlier-finder": "shorts-outlier" };
const descriptions: Record<string, string> = {
  "youtube-shorts-engagement-rate-calculator": "Calculate like-to-view and comment-to-view ratios for a YouTube Short and compare with a dated sample.",
  "viral-outlier-score-calculator": "Compare a video's views with an account median using figures you enter.",
  "short-form-cpm-rpm-calculator": "Estimate creator payouts and sponsor value from your own views, RPM and CPM assumptions.",
  "viral-hook-generator": "Explore deterministic hook templates by niche and style.",
};
const gatedDescription = "Enter a public video URL to see an illustrative output format. This page does not analyze the video; use ContHunt for research.";
export const dynamicParams = false;
export function generateStaticParams() { return [...FREE_UTILITY_PAGES, ...GATED_TOOL_PAGES].map(({slug}) => ({slug})); }
export async function generateMetadata({params}: Props) {
  const {slug} = await params; const item = [...FREE_UTILITY_PAGES, ...GATED_TOOL_PAGES].find(p => p.slug === slug); if (!item) notFound();
  return pageMetadata({ title: item.seoTitle, description: gatedKinds[slug] ? gatedDescription : descriptions[slug], path: `/tools/${slug}` });
}
export default async function Page({params}: Props) {
  const {slug} = await params; const item = [...FREE_UTILITY_PAGES, ...GATED_TOOL_PAGES].find(p => p.slug === slug); if (!item) notFound();
  const kind = gatedKinds[slug];
  return <GrowthPage title={slug === "youtube-shorts-engagement-rate-calculator" ? "YouTube Shorts engagement calculator" : item.h1} description={kind ? gatedDescription : descriptions[slug]}>
    {kind ? <GatedResearchTool kind={kind}/> : slug === "youtube-shorts-engagement-rate-calculator" ? <YoutubeShortsErCalculator/> : slug === "viral-outlier-score-calculator" ? <ViralOutlierScoreCalculator/> : slug === "short-form-cpm-rpm-calculator" ? <ShortFormCpmRpmCalculator/> : <ViralHookGenerator templates={HOOK_TEMPLATES.map(({niche,style,template}) => ({niche,style,template}))}/>}
    <p className="text-sm text-ink-2">Calculations use your inputs or the dated public sample shown; they are not predictions. Live research is available in the ContHunt workspace.</p>
  </GrowthPage>;
}
