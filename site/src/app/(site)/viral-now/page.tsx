import type { Metadata } from "next";
import ViralNowPage from "@/components/pages/viral-now";
import { FontPreloads } from "@/components/layout/font-preloads";
import { snapshotDescription } from "@/lib/viral-now/copy";
import { loadViralNowData, parseNicheParam } from "@/lib/viral-now/load";
import { pageMetadata } from "@/lib/seo/metadata";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// The page fills from the live boards. The description names the niches and leaves the week
// off, so it does not claim the bundled snapshot's week.
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { niche } = await searchParams;
  const { niches } = loadViralNowData();
  const slug = parseNicheParam(niche, niches);
  const active = slug ? niches.find((n) => n.slug === slug) : undefined;
  // The route has its own opengraph-image file (`image: false`). The canonical stays /viral-now for every niche.
  return pageMetadata({
    title: active ? `${active.name} · Viral Now` : "Viral Now",
    description: snapshotDescription({
      niches: niches.length,
      weekOf: null,
      nicheName: active?.name,
      count: active?.videos.length,
    }),
    path: "/viral-now",
    image: false,
  });
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { niche } = await searchParams;
  const { niches } = loadViralNowData();
  return (
    <>
      {/* First viewport beyond the site faces: niche labels, rank numbers, the heading keyword (lib/fonts.ts). */}
      <FontPreloads faces={["switzer600", "switzer800", "boska400i"]} />
      <ViralNowPage niche={parseNicheParam(niche, niches)} />
    </>
  );
}
