import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import ViralNowPage from "@/components/pages/viral-now";
import { FontPreloads } from "@/components/layout/font-preloads";
import { ViralNowJsonLd } from "@/components/seo/viral-now-json-ld";
import { snapshotDescription } from "@/lib/viral-now/copy";
import { loadViralNowData, parseNicheParam } from "@/lib/viral-now/load";
import { pageMetadata } from "@/lib/seo/metadata";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// The index names the niches and leaves the week off. A niche has its own URL.
export async function generateMetadata(): Promise<Metadata> {
  const { niches } = loadViralNowData();
  return pageMetadata({
    title: "Short-form videos ranked by niche",
    description: snapshotDescription({ niches: niches.length, weekOf: null }),
    path: "/viral-now",
    image: false,
  });
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { niche } = await searchParams;
  const { niches } = loadViralNowData();
  const slug = parseNicheParam(niche, niches);
  if (slug) permanentRedirect(`/viral-now/${slug}`);
  return (
    <>
      {/* First viewport beyond the site faces: niche labels, rank numbers, the heading keyword (lib/fonts.ts). */}
      <FontPreloads faces={["switzer600", "switzer800", "boska400i"]} />
      <ViralNowJsonLd
        description={snapshotDescription({ niches: niches.length, weekOf: null })}
        niches={niches.map((item) => ({ name: item.name, slug: item.slug }))}
      />
      <ViralNowPage />
    </>
  );
}
