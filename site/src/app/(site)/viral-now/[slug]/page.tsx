import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ViralNowPage from "@/components/pages/viral-now";
import { FontPreloads } from "@/components/layout/font-preloads";
import { JsonLd } from "@/components/seo/json-ld";
import { snapshotDescription } from "@/lib/viral-now/copy";
import { creatorLabel } from "@/lib/viral-now/format";
import { loadNicheBoard, loadViralNowData } from "@/lib/viral-now/load";
import { pageMetadata } from "@/lib/seo/metadata";
import { viralNowNicheGraph } from "@/lib/seo/schema";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return loadViralNowData().niches.map((niche) => ({ slug: niche.slug }));
}

function describe(name: string, count: number, weekOf: string | null): string {
  return snapshotDescription({ niches: 1, weekOf, nicheName: name, count });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const board = await loadNicheBoard(slug);
  if (!board) return { title: "Page not found" };
  return pageMetadata({
    title: `${board.name} short-form videos`,
    description: describe(board.name, board.videos.length, board.week_of),
    path: `/viral-now/${board.slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = await loadNicheBoard(slug);
  if (!board) notFound();
  return (
    <>
      <FontPreloads faces={["switzer600", "switzer800", "boska400i"]} />
      <JsonLd
        data={viralNowNicheGraph({
          name: board.name,
          slug: board.slug,
          description: describe(board.name, board.videos.length, board.week_of),
          videos: board.videos.map((video) => ({
            rank: video.rank,
            title: video.title,
            url: video.url,
            platform: video.platform,
            creator: creatorLabel(video.creator),
          })),
        })}
      />
      <ViralNowPage niche={board.slug} />
    </>
  );
}
