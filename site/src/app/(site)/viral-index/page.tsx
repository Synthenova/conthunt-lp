import { GrowthPage } from "@/components/growth/GrowthPage";
import { ViralIndexDashboard } from "@/components/growth/ViralIndexDashboard";
import { JsonLd } from "@/components/seo/json-ld";
import { getViralityIndexSnapshot } from "@/lib/growth/viral-data";
import { pageMetadata } from "@/lib/growth/metadata";
export const metadata=pageMetadata({title:"Short-form virality index",description:"Explore ContHunt's dated short-form virality snapshot across TikTok, Instagram Reels, and YouTube Shorts with public breakout ratios and view counts.",path:"/viral-index"});
export default function Page(){const snapshot=getViralityIndexSnapshot();return <GrowthPage title="Short-form virality index" description="A selected, dated breakout sample; it is not live or representative of all videos."><JsonLd data={{"@context":"https://schema.org","@type":"Dataset",name:"Short-form virality snapshot",description:"Selected public video snapshot",dateModified:snapshot.snapshotDate,url:"https://conthunt.app/viral-index"}}/><ViralIndexDashboard snapshot={snapshot}/></GrowthPage>;}
