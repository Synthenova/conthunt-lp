import { CompanyPage } from "@/components/pages/company-page";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "About ContHunt", description: "Learn what ContHunt does and who operates it.", path: "/about" });

export default function About() {
  return <CompanyPage label="About" title="About ContHunt" intro="ContHunt helps creators and marketers research short-form video content.">
    <section><h2>What we do</h2><p>ContHunt brings public videos and analysis together to help users explore topics, study competitors, and find patterns for their content research.</p></section>
    <section><h2>Who operates ContHunt</h2><p>ContHunt is operated by Synthenova Enterprises LLP, based in Chennai, India.</p></section>
    <section><h2>Contact and information</h2><p>Contact us at <a href="mailto:support@conthunt.app">support@conthunt.app</a>. Read about our <a href="/authors">authors</a>, <a href="/editorial">editorial standards</a>, <a href="/privacy">privacy policy</a> and <a href="/terms">terms of service</a>.</p></section>
  </CompanyPage>;
}
