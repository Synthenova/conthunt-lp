import { GrowthPage } from "@/components/growth/GrowthPage";
import { AccountAnalyzer } from "@/components/growth/AccountAnalyzer";
import { getPublicCreatorsDirectory, getPublicHooksData } from "@/lib/growth/viral-data";
import { pageMetadata } from "@/lib/growth/metadata";

const description = "Analyze public TikTok account metrics by entering recent posts or browsing ContHunt's dated snapshot of selected breakout TikTok creators.";
export const metadata = pageMetadata({ title: "TikTok account analyzer", description, path: "/analyze-tiktok-account" });
export default function Page() {
  const creators = getPublicCreatorsDirectory().filter(c => c.indexable && c.platforms.includes("tiktok"));
  return <GrowthPage title="TikTok account analyzer" description={description}>
    <p className="text-sm text-ink-2">The public snapshot was generated {getPublicHooksData().snapshotDate.slice(0,10)}; it is limited and is not a live account lookup. If an account is absent, enter three to five recent posts manually. The sample contains selected breakout videos and is not representative of all posts.</p>
    <AccountAnalyzer platform="tiktok" indexedCreators={creators}/>
  </GrowthPage>;
}
