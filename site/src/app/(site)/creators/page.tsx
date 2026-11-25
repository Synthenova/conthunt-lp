import { GrowthPage } from "@/components/growth/GrowthPage";
import { LinkList } from "@/components/growth/Editorial";
import { getPublicCreatorsDirectory,getPublicCreatorByHandle } from "@/lib/growth/viral-data";
import { pageMetadata } from "@/lib/growth/metadata";
export const metadata=pageMetadata({title:"Creators in the public snapshot",description:"Curated creator profiles based on a limited public video snapshot.",path:"/creators"});
export default function Page(){const creators=getPublicCreatorsDirectory().filter(c=>c.indexable && c.videoCount>=3 && getPublicCreatorByHandle(c.handle));return <GrowthPage title="Creators in the public snapshot" description="Profiles are based on selected public videos, not complete account histories or live lookup."><LinkList items={creators.map(c=>({href:`/creators/${c.handle}`,label:`@${c.handle}`,description:`${c.videoCount} videos in snapshot`}))}/></GrowthPage>;}
