import { GrowthPage } from "@/components/growth/GrowthPage";
import { JsonLd } from "@/components/seo/json-ld";
import { HUB_COPY } from "@/content/seo-growth/entities-and-hubs";
import { pageMetadata } from "@/lib/growth/metadata";
import { simpleWebPageGraph } from "@/lib/growth/schema";

export const metadata = pageMetadata({ title: HUB_COPY.partners.seoTitle, description: HUB_COPY.partners.metaDescription, path: "/partners" });

export default function Page() {
  const p = HUB_COPY.partners;
  return (
    <GrowthPage title={p.h1} description={p.subtitle}>
      <JsonLd data={simpleWebPageGraph({ path: "/partners", name: p.h1, description: p.metaDescription, breadcrumbName: "Partners" })} />
      <p>{p.transparencyNotice}</p>
      <ul className="grid gap-4 sm:grid-cols-2">{p.partnerCategories.map((c) => <li className="rounded-card border border-hairline p-5" key={c.id}><h2 className="text-xl font-medium">{c.name}</h2><p>{c.summary}</p><p className="text-sm text-ink-2">{c.statusLabel}</p></li>)}</ul>
    </GrowthPage>
  );
}
