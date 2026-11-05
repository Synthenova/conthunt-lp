import { pricingGraph } from "@/lib/seo/schema";
import { JsonLd } from "./json-ld";

export function PricingJsonLd() {
  return <JsonLd data={pricingGraph()} />;
}
