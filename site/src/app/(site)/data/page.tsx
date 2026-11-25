import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { HUB_COPY } from "@/content/seo-growth/entities-and-hubs";
import { pageMetadata } from "@/lib/growth/metadata";
export const metadata=pageMetadata({title:HUB_COPY.dataHub.seoTitle,description:HUB_COPY.dataHub.metaDescription,path:"/data"});
export default function Page(){return <GrowthPage title={HUB_COPY.dataHub.h1} description="Explore dated snapshots of public video metadata. These are selected samples, not a live or representative feed."><LinkList items={[{href:"/data/viral-hooks",label:"Public video hooks"},{href:"/data/trending-hashtags",label:"Hashtags in the snapshot"},{href:"/viral-index",label:"Virality index"}]}/></GrowthPage>;}
