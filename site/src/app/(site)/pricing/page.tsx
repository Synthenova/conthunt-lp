import PricingPage from "@/components/pages/pricing";
import { FontPreloads } from "@/components/layout/font-preloads";
import { pageMetadata } from "@/lib/seo/metadata";

// The route has its own opengraph-image file, so `image: false` leaves og:image and twitter:image to it.
export const metadata = pageMetadata({
  title: "Pricing",
  description: "ContHunt plans: Creator, Pro and Research, each with a 1-week free trial. Yearly billing saves more.",
  path: "/pricing",
  image: false,
});

export default function Page() {
  return (
    <>
      {/* First viewport beyond the site faces: plan names and the heading keyword (lib/fonts.ts). */}
      <FontPreloads faces={["switzer600", "boska400i"]} />
      <PricingPage />
    </>
  );
}
