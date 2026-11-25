import { GrowthPage } from "@/components/growth/GrowthPage";
import { AccountAnalyzer } from "@/components/growth/AccountAnalyzer";
import { getPublicCreatorsDirectory, getPublicHooksData } from "@/lib/growth/viral-data";
import { pageMetadata } from "@/lib/growth/metadata";

const description = "Analyze Instagram Reels account metrics by entering recent posts or browsing ContHunt's dated snapshot of selected breakout Reels creators.";
export const metadata = pageMetadata({ title: "Instagram Reels account analyzer", description, path: "/analyze-instagram-reels-account" });
export default function Page() {
  const creators = getPublicCreatorsDirectory().filter(c => c.indexable && c.platforms.includes("instagram"));
  return <GrowthPage title="Instagram Reels account analyzer" description={description}>
    <p className="text-sm text-ink-2">The public snapshot was generated {getPublicHooksData().snapshotDate.slice(0,10)}; it is limited and is not a live account lookup. If an account is absent, enter three to five recent posts manually. The sample contains selected breakout videos and is not representative of all posts.</p>
    <AccountAnalyzer platform="instagram" indexedCreators={creators}/>
  </GrowthPage>;
}
