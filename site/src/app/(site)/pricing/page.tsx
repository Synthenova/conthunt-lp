import PricingPage from "@/components/pages/pricing";
import { FontPreloads } from "@/components/layout/font-preloads";
import { PricingJsonLd } from "@/components/seo/pricing-json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

// The route has its own opengraph-image file, so `image: false` leaves og:image and twitter:image to it.
export const metadata = pageMetadata({
  title: "Pro, Creator and Research plans",
  description: "ContHunt plans: Pro, Creator and Research, each with a 1-week free trial. Yearly billing saves more.",
  path: "/pricing",
  image: false,
});

export default function Page() {
  return (
    <>
      {/* First viewport beyond the site faces: plan names and the heading keyword (lib/fonts.ts). */}
      <FontPreloads faces={["switzer600", "boska400i"]} />
      <PricingJsonLd />
      <PricingPage />
    </>
  );
}
