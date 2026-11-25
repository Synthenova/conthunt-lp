import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { JsonLd } from "@/components/seo/json-ld";
import { USE_CASE_PAGES, USE_CASES_HUB } from "@/content/seo-growth/entities-and-hubs";
import { pageMetadata } from "@/lib/growth/metadata";
import { collectionHubGraph } from "@/lib/growth/schema";

export const metadata = pageMetadata({ title: USE_CASES_HUB.seoTitle, description: USE_CASES_HUB.metaDescription, path: "/use-cases" });

export default function Page() {
  return (
    <GrowthPage title={USE_CASES_HUB.h1} description={USE_CASES_HUB.subtitle}>
      <JsonLd data={collectionHubGraph({ path: "/use-cases", name: USE_CASES_HUB.h1, description: USE_CASES_HUB.metaDescription, breadcrumbName: "Use cases", items: USE_CASE_PAGES.map((p) => ({ name: p.name, path: `/use-cases/${p.slug}` })) })} />
      <LinkList items={USE_CASE_PAGES.map((p) => ({ href: `/use-cases/${p.slug}`, label: p.name, description: p.subtitle }))} />
    </GrowthPage>
  );
}
