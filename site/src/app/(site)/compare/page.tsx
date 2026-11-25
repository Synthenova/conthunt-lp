import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { COMPARISONS_HUB, COMPARISON_PAGES } from "@/content/seo-growth/comparisons";
import { pageMetadata } from "@/lib/growth/metadata";
export const metadata=pageMetadata({title:COMPARISONS_HUB.seoTitle,description:COMPARISONS_HUB.metaDescription,path:"/compare"});
export default function Page(){return <GrowthPage title={COMPARISONS_HUB.h1} description={COMPARISONS_HUB.subtitle}><p>{COMPARISONS_HUB.methodologyNote}</p><LinkList items={COMPARISON_PAGES.map(p=>({href:`/compare/${p.slug}`,label:`${p.leftName} vs ${p.rightName}`}))}/></GrowthPage>;}
