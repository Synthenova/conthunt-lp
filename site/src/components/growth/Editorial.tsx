import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";

export function LinkList({items}: {items: readonly {href: string; label: string; description?: string}[]}) {
  return <ul className="grid gap-4 sm:grid-cols-2">{items.map(item => <li key={item.href} className="rounded-card border border-hairline bg-paper p-5"><Link className="text-lg font-medium underline underline-offset-4" href={item.href}>{item.label}</Link>{item.description && <p className="mt-2 text-sm text-ink-2">{item.description}</p>}</li>)}</ul>;
}
export function Faq({items}: {items: readonly {question: string; answer: string}[]}) {
  if (!items.length) return null;
  return <section className="space-y-4"><h2 className="text-2xl font-medium">Frequently asked questions</h2><JsonLd data={{"@context":"https://schema.org", "@type":"FAQPage", mainEntity:items.map(item => ({"@type":"Question",name:item.question,acceptedAnswer:{"@type":"Answer",text:item.answer}}))}}/>{items.map(item => <div key={item.question}><h3 className="font-medium">{item.question}</h3><p className="mt-1 text-ink-2">{item.answer}</p></div>)}</section>;
}
