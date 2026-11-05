import { viralNowGraph, type ViralNowNicheForSchema } from "@/lib/seo/schema";
import { JsonLd } from "./json-ld";

export function ViralNowJsonLd({ description, niches }: { description: string; niches: ViralNowNicheForSchema[] }) {
  return <JsonLd data={viralNowGraph(description, niches)} />;
}
