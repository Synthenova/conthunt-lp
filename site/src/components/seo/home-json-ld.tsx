import { homeGraph } from "@/lib/seo/schema";
import { JsonLd } from "./json-ld";

/**
 * Organization + WebSite + SoftwareApplication structured data for the home page.
 * Include once, anywhere in the Home server component tree:
 *
 *   import { HomeJsonLd } from "@/components/seo/home-json-ld";
 *   ...
 *   <HomeJsonLd />
 */
export function HomeJsonLd() {
  return <JsonLd data={homeGraph()} />;
}
