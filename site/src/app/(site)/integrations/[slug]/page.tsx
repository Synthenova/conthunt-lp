import Link from "next/link";
import { notFound } from "next/navigation";
import { GrowthPage } from "@/components/growth/GrowthPage";
import { Faq } from "@/components/growth/Editorial";
import { Copy } from "@/components/growth/shared";
import { INTEGRATION_PAGES, getIntegrationBySlug } from "@/content/seo-growth/integrations";
import { pageMetadata } from "@/lib/growth/metadata";
type Props={params:Promise<{slug:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return INTEGRATION_PAGES.map(({slug})=>({slug}));}
export async function generateMetadata({params}:Props){const p=getIntegrationBySlug((await params).slug);if(!p)notFound();return pageMetadata({title:p.seoTitle,description:p.metaDescription,path:`/integrations/${p.slug}`});}
export default async function Page({params}:Props){const p=getIntegrationBySlug((await params).slug);if(!p)notFound();return <GrowthPage title={p.h1} description={p.summary}><p>{p.answerFirst}</p><section className="space-y-5"><h2 className="text-2xl font-medium">Setup</h2>{p.setupSteps.map(s=><div key={s.title}><h3 className="font-medium">{s.title}</h3><p className="text-ink-2">{s.detail}</p>{s.code && <><pre className="my-3 overflow-x-auto rounded-btn bg-surface p-4 text-sm">{s.code}</pre><Copy text={s.code} label="Copy setup"/></>}</div>)}</section><section className="space-y-3"><h2 className="text-2xl font-medium">What you can do</h2>{p.capabilities.map(c=><p key={c.title}><strong>{c.title}:</strong> {c.detail}</p>)}</section><Faq items={p.faqs}/><Link className="underline" href="/docs/integrations/mcp">Read the MCP setup guide</Link><p><Link className="underline" href="/integrations">All integrations</Link></p></GrowthPage>;}
