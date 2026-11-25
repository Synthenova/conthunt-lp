import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { INTEGRATIONS_HUB, INTEGRATION_PAGES } from "@/content/seo-growth/integrations";
import { pageMetadata } from "@/lib/growth/metadata";
export const metadata = pageMetadata({title:INTEGRATIONS_HUB.seoTitle,description:INTEGRATIONS_HUB.metaDescription,path:"/integrations"});
export default function Page() { return <GrowthPage title={INTEGRATIONS_HUB.h1} description={INTEGRATIONS_HUB.subtitle}><LinkList items={INTEGRATION_PAGES.map(p=>({href:`/integrations/${p.slug}`,label:p.name,description:p.summary}))}/><a className="underline" href="/docs/integrations/mcp">Read the MCP setup guide</a></GrowthPage>; }
