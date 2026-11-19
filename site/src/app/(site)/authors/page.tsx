import { CompanyPage } from "@/components/pages/company-page";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({ title: "Authors", description: "Meet the ContHunt editorial team.", path: "/authors" });

const authors = [
  ["Zach Sanders", "Head of Growth"],
  ["Alex", "Content Creator"],
  ["Elena", "Head of Marketing"],
  ["Lamrin", "Lead Engineer"],
  ["Maya", "Social Media Analyst"],
];

export default function Authors() {
  return <CompanyPage label="Authors" title="Meet the team" intro="ContHunt’s editorial team covers content research, short-form video and the technology behind the product.">
    <section><h2>Our authors</h2><ul>{authors.map(([name, role]) => <li key={name}><strong>{name}</strong> · {role}</li>)}</ul></section>
    <section><h2>How we work</h2><p>Our team covers different topics across ContHunt. Read our <a href="/editorial">editorial standards</a> and learn <a href="/about">about ContHunt</a>.</p></section>
  </CompanyPage>;
}
