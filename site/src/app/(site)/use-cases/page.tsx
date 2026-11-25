import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { USE_CASE_PAGES, USE_CASES_HUB } from "@/content/seo-growth/entities-and-hubs";
import { pageMetadata } from "@/lib/growth/metadata";
export const metadata=pageMetadata({title:USE_CASES_HUB.seoTitle,description:USE_CASES_HUB.metaDescription,path:"/use-cases"});
export default function Page(){return <GrowthPage title={USE_CASES_HUB.h1} description={USE_CASES_HUB.subtitle}><LinkList items={USE_CASE_PAGES.map(p=>({href:`/use-cases/${p.slug}`,label:p.name,description:p.subtitle}))}/></GrowthPage>;}
