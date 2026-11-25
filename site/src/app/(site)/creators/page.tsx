import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicCreatorsDirectory, getPublicCreatorByHandle } from "@/lib/growth/viral-data";
import { pageMetadata } from "@/lib/growth/metadata";
import { collectionHubGraph } from "@/lib/growth/schema";

const DESC = "Explore curated creator profiles from ContHunt's dated public short-form video snapshot, with indexed video counts and median public views.";
export const metadata = pageMetadata({ title: "Creators in the public snapshot", description: DESC, path: "/creators" });

export default function Page() {
  const creators = getPublicCreatorsDirectory().filter((c) => c.indexable && c.videoCount >= 3 && getPublicCreatorByHandle(c.handle));
  return (
    <GrowthPage title="Creators in the public snapshot" description="Profiles are based on selected public videos, not complete account histories or live lookup.">
      <JsonLd data={collectionHubGraph({ path: "/creators", name: "Creators in the public snapshot", description: DESC, breadcrumbName: "Creators", items: creators.map((c) => ({ name: `@${c.handle}`, path: `/creators/${c.handle}` })) })} />
      <LinkList items={creators.map((c) => ({ href: `/creators/${c.handle}`, label: `@${c.handle}`, description: `${c.videoCount} videos in snapshot` }))} />
    </GrowthPage>
  );
}
