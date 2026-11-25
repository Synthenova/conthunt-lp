import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { GLOSSARY_TERMS, GLOSSARY_HUB } from "@/content/seo-growth/entities-and-hubs";
import { pageMetadata } from "@/lib/growth/metadata";
export const metadata=pageMetadata({title:GLOSSARY_HUB.seoTitle,description:GLOSSARY_HUB.metaDescription,path:"/glossary"});
export default function Page(){return <GrowthPage title={GLOSSARY_HUB.h1} description={GLOSSARY_HUB.subtitle}><LinkList items={GLOSSARY_TERMS.map(p=>({href:`/glossary/${p.slug}`,label:p.term,description:p.shortDefinition}))}/></GrowthPage>;}
