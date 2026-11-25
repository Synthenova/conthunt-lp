import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { GrowthPage } from "@/components/growth/GrowthPage";
import { Faq } from "@/components/growth/Editorial";
import { GLOSSARY_TERMS, getGlossaryTermBySlug } from "@/content/seo-growth/entities-and-hubs";
import { pageMetadata } from "@/lib/growth/metadata";
type Props={params:Promise<{slug:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return GLOSSARY_TERMS.map(({slug})=>({slug}));}
export async function generateMetadata({params}:Props){const p=getGlossaryTermBySlug((await params).slug);if(!p)notFound();return pageMetadata({title:p.seoTitle,description:p.metaDescription,path:`/glossary/${p.slug}`});}
export default async function Page({params}:Props){const p=getGlossaryTermBySlug((await params).slug);if(!p)notFound();return <GrowthPage title={p.term} description={p.shortDefinition}><JsonLd data={{"@context":"https://schema.org","@type":"DefinedTerm",name:p.term,description:p.shortDefinition,url:`https://conthunt.app/glossary/${p.slug}`,inDefinedTermSet:"https://conthunt.app/glossary"}}/><p>{p.deepDive}</p>{p.formula && <p><strong>Formula:</strong> {p.formula}</p>}<p>{p.benchmarkContext}</p><p>{p.example}</p><Faq items={p.faqs}/><Link className="underline" href="/glossary">All glossary</Link></GrowthPage>;}
