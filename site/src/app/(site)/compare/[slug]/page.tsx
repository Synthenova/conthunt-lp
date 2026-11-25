import Link from "next/link";
import { notFound } from "next/navigation";
import { GrowthPage } from "@/components/growth/GrowthPage";
import { Faq } from "@/components/growth/Editorial";
import { JsonLd } from "@/components/seo/json-ld";
import { COMPARISON_PAGES, getComparisonBySlug } from "@/content/seo-growth/comparisons";
import { pageMetadata } from "@/lib/growth/metadata";
import { detailPageGraph } from "@/lib/growth/schema";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return COMPARISON_PAGES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const p = getComparisonBySlug((await params).slug);
  if (!p) notFound();
  return pageMetadata({ title: p.seoTitle, description: p.metaDescription, path: `/compare/${p.slug}` });
}
export default async function Page({ params }: Props) {
  const p = getComparisonBySlug((await params).slug);
  if (!p) notFound();
  return (
    <GrowthPage title={p.h1} description={p.verdictSummary}>
      <JsonLd data={detailPageGraph({ path: `/compare/${p.slug}`, name: p.h1, description: p.metaDescription, parentName: "Compare", parentPath: "/compare", breadcrumbName: `${p.leftName} vs ${p.rightName}`, faqs: p.faqs })} />
      <p className="text-sm text-ink-2">Updated {p.updated}. Check current pricing and features with each provider.</p>
      <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr><th>Feature</th><th>{p.leftName}</th><th>{p.rightName}</th><th>ContHunt</th></tr></thead><tbody>{p.comparisonRows.map((r) => <tr key={r.dimension} className="border-t border-hairline align-top"><th className="py-3 pr-4">{r.dimension}</th><td className="p-3">{r.left}</td><td className="p-3">{r.right}</td><td className="p-3">{r.conthunt}</td></tr>)}</tbody></table></div>
      <p>{p.pricingNote}</p>
      <p>{p.whereContHuntFits}</p>
      <Faq items={p.faqs} />
      <Link className="underline" href="/compare">All comparisons</Link>
    </GrowthPage>
  );
}
