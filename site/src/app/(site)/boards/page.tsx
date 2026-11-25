import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { getPublicBoardsDirectory } from "@/lib/growth/viral-data";
import { pageMetadata } from "@/lib/growth/metadata";
export const metadata=pageMetadata({title:"Public video boards",description:"Explore curated public video collections by niche.",path:"/boards"});
export default function Page(){const boards=getPublicBoardsDirectory().filter(b=>b.indexable);return <GrowthPage title="Public video boards" description="Curated collections from a dated snapshot. Each listed niche has at least five videos."><LinkList items={boards.map(b=>({href:`/viral-now/${b.niche}`,label:b.name,description:`${b.itemCount} videos in snapshot · updated ${b.updatedDate.slice(0,10)}`}))}/></GrowthPage>;}
