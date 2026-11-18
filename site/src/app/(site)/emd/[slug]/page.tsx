import { EmdView, openedLabel } from "@/components/pages/emd";
import { FontPreloads } from "@/components/layout/font-preloads";
import { libraryFor } from "@/lib/emd/library";
import { loadEmd } from "@/lib/emd/load";
import { emdMeta } from "@/lib/emd/meta";
import { DISCLAIMER, PICK, emdFaqQuestion } from "@/lib/emd/pages";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { page, onDomain } = await loadEmd(slug);
  return emdMeta(page, onDomain, "/", page.h1, page.description);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { page, onDomain, href } = await loadEmd(slug);
  const copy = libraryFor(page);
  const question = emdFaqQuestion(page);
  const opened = openedLabel(new Date());
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: `${PICK} ${DISCLAIMER}` } },
          { "@type": "Question", name: "What is the first practical step?", acceptedAnswer: { "@type": "Answer", text: copy.firstStep } },
        ],
      },
      {
        "@type": "ItemList",
        itemListElement: page.tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          url: tool.href,
        })),
      },
    ],
  };

  return (
    <>
      <FontPreloads faces={["switzer600", "boska400i"]} />
      <EmdView page={page} opened={opened} onDomain={onDomain} href={href} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
