import Link from "next/link";
import { notFound } from "next/navigation";
import { GrowthPage } from "@/components/growth/GrowthPage";
import { Faq } from "@/components/growth/Editorial";
import { JsonLd } from "@/components/seo/json-ld";
import { USE_CASE_PAGES, getUseCaseBySlug } from "@/content/seo-growth/entities-and-hubs";
import { pageMetadata } from "@/lib/growth/metadata";
import { detailPageGraph } from "@/lib/growth/schema";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return USE_CASE_PAGES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const p = getUseCaseBySlug((await params).slug);
  if (!p) notFound();
  return pageMetadata({ title: p.seoTitle, description: p.metaDescription, path: `/use-cases/${p.slug}` });
}
export default async function Page({ params }: Props) {
  const p = getUseCaseBySlug((await params).slug);
  if (!p) notFound();
  return (
    <GrowthPage title={p.h1} description={p.subtitle}>
      <JsonLd data={detailPageGraph({ path: `/use-cases/${p.slug}`, name: p.h1, description: p.metaDescription, parentName: "Use cases", parentPath: "/use-cases", breadcrumbName: p.name, faqs: p.faqs })} />
      <p>{p.answerFirst}</p>
      <h2 className="text-2xl font-medium">A research workflow</h2>
      <ol className="list-decimal space-y-3 pl-6">{p.workflowSteps.map((s) => <li key={s.title}><strong>{s.title}</strong><p className="text-ink-2">{s.detail}</p></li>)}</ol>
      <p>{p.mcpAngle}</p>
      <Faq items={p.faqs} />
      <Link className="underline" href="/use-cases">All use cases</Link>
    </GrowthPage>
  );
}
