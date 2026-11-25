import { GrowthPage } from "@/components/growth/GrowthPage";
import { NewsletterSignupCard } from "@/components/growth/NewsletterSignupCard";
import { JsonLd } from "@/components/seo/json-ld";
import { HUB_COPY } from "@/content/seo-growth/entities-and-hubs";
import { pageMetadata } from "@/lib/growth/metadata";
import { simpleWebPageGraph } from "@/lib/growth/schema";

export const metadata = pageMetadata({ title: HUB_COPY.newsletter.seoTitle, description: HUB_COPY.newsletter.metaDescription, path: "/newsletter" });

export default function Page() {
  return (
    <GrowthPage title="ContHunt newsletter" description="Updates and research from ContHunt.">
      <JsonLd data={simpleWebPageGraph({ path: "/newsletter", name: HUB_COPY.newsletter.h1, description: HUB_COPY.newsletter.metaDescription, breadcrumbName: "Newsletter" })} />
      <NewsletterSignupCard />
    </GrowthPage>
  );
}
