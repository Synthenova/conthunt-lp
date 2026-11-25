import { CompanyPage } from "@/components/pages/company-page";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "Editorial Standards", description: "How the ContHunt editorial team verifies platform documentation, separates public video observations from private analytics, and handles article updates.", path: "/editorial" });

export default function Editorial() {
  return <CompanyPage label="Editorial" title="Editorial standards" intro="Our aim is to make ContHunt articles practical, clear and easy to verify.">
    <section><h2>Our standards</h2><p>We aim to answer the reader’s question directly, use specific examples, keep titles and content aligned, and update articles when the underlying guidance changes.</p></section>
    <section><h2>Sources and review</h2><p>When articles include external facts or platform policies, we try to ground them in official documentation, platform help centers, first-party product data or ContHunt’s own analysis.</p></section>
    <section><h2>Corrections and updates</h2><p>When a page needs correction, we update the source content. For significant updates, we also refresh the visible updated date and supporting material where relevant. If you spot a problem, contact <a href="mailto:support@conthunt.app">support@conthunt.app</a>.</p></section>
    <section><h2>Our team</h2><p>Read about our <a href="/authors">authors</a> and <a href="/about">ContHunt</a>.</p></section>
  </CompanyPage>;
}
