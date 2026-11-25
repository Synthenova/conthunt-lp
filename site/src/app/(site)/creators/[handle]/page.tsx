import { notFound } from "next/navigation";
import { GrowthPage } from "@/components/growth/GrowthPage";
import { JsonLd } from "@/components/seo/json-ld";
import { getPublicCreatorByHandle, getPublicCreatorsDirectory, getPublicHooksData } from "@/lib/growth/viral-data";
import { pageMetadata } from "@/lib/growth/metadata";
import { detailPageGraph } from "@/lib/growth/schema";

type Props = { params: Promise<{ handle: string }> };
function lookup(handle: string) {
  const c = getPublicCreatorByHandle(handle);
  return c && c.indexable && c.videoCount >= 3 ? c : null;
}
export const dynamic = "force-dynamic";
export function generateStaticParams() { return getPublicCreatorsDirectory().filter((c) => lookup(c.handle)).map((c) => ({ handle: c.handle })); }
export async function generateMetadata({ params }: Props) {
  const c = lookup((await params).handle);
  if (!c) notFound();
  return pageMetadata({ title: `@${c.handle} public video snapshot`, description: `Selected public short-form videos for @${c.handle} in ContHunt's dated snapshot, with sample counts and median public views.`, path: `/creators/${c.handle}` });
}
export default async function Page({ params }: Props) {
  const c = lookup((await params).handle);
  if (!c) notFound();
  return (
    <GrowthPage title={`@${c.handle}`} description="Selected public videos in a dated snapshot; this is not a complete account history or live profile.">
      <JsonLd data={detailPageGraph({ path: `/creators/${c.handle}`, name: `@${c.handle} public video snapshot`, description: `Selected public short-form videos for @${c.handle} in ContHunt's dated snapshot.`, parentName: "Creators", parentPath: "/creators", breadcrumbName: `@${c.handle}` })} />
      <p>Snapshot generated {getPublicHooksData().snapshotDate.slice(0, 10)}.</p>
      <p>{c.videoCount} indexed videos · median {c.medianViews?.toLocaleString() ?? "unavailable"} views in this sample.</p>
      <a className="underline" href={c.bestVideo.url}>View highest-viewed indexed video</a>
    </GrowthPage>
  );
}
