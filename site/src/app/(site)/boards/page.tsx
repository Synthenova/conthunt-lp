import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicBoardsDirectory } from "@/lib/growth/viral-data";
import { pageMetadata } from "@/lib/growth/metadata";
import { collectionHubGraph } from "@/lib/growth/schema";

const DESC = "Browse curated public short-form video boards by niche across TikTok, Instagram Reels, and YouTube Shorts from ContHunt's dated snapshot.";
export const metadata = pageMetadata({ title: "Public video boards", description: DESC, path: "/boards" });

export default function Page() {
  const boards = getPublicBoardsDirectory().filter((b) => b.indexable);
  return (
    <GrowthPage title="Public video boards" description="Curated collections from a dated snapshot. Each listed niche has at least five videos.">
      <JsonLd data={collectionHubGraph({ path: "/boards", name: "Public video boards", description: DESC, breadcrumbName: "Boards", items: boards.map((b) => ({ name: b.name, path: `/viral-now/${b.niche}` })) })} />
      <LinkList items={boards.map((b) => ({ href: `/viral-now/${b.niche}`, label: b.name, description: `${b.itemCount} videos in snapshot · updated ${b.updatedDate.slice(0, 10)}` }))} />
    </GrowthPage>
  );
}
