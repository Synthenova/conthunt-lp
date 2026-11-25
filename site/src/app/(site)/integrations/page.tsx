import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { JsonLd } from "@/components/seo/json-ld";
import { INTEGRATIONS_HUB, INTEGRATION_PAGES } from "@/content/seo-growth/integrations";
import { pageMetadata } from "@/lib/growth/metadata";
import { collectionHubGraph } from "@/lib/growth/schema";

export const metadata = pageMetadata({ title: INTEGRATIONS_HUB.seoTitle, description: INTEGRATIONS_HUB.metaDescription, path: "/integrations" });

export default function Page() {
  return (
    <GrowthPage title={INTEGRATIONS_HUB.h1} description={INTEGRATIONS_HUB.subtitle}>
      <JsonLd data={collectionHubGraph({ path: "/integrations", name: INTEGRATIONS_HUB.h1, description: INTEGRATIONS_HUB.metaDescription, breadcrumbName: "Integrations", items: INTEGRATION_PAGES.map((p) => ({ name: p.name, path: `/integrations/${p.slug}` })) })} />
      <LinkList items={INTEGRATION_PAGES.map((p) => ({ href: `/integrations/${p.slug}`, label: p.name, description: p.summary }))} />
      <a className="underline" href="/docs/integrations/mcp">Read the MCP setup guide</a>
    </GrowthPage>
  );
}
