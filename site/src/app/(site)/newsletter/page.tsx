import { GrowthPage } from "@/components/growth/GrowthPage";
import { NewsletterSignupCard } from "@/components/growth/NewsletterSignupCard";
import { HUB_COPY } from "@/content/seo-growth/entities-and-hubs";
import { pageMetadata } from "@/lib/growth/metadata";
export const metadata=pageMetadata({title:HUB_COPY.newsletter.seoTitle,description:HUB_COPY.newsletter.metaDescription,path:"/newsletter"});
export default function Page(){return <GrowthPage title="ContHunt newsletter" description="Updates and research from ContHunt."><NewsletterSignupCard/></GrowthPage>;}
