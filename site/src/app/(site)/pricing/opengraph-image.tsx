/** Share image for `/pricing`. No prices on the card, so it never goes stale when plans change. */
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-assets";
import { renderOgCard } from "@/lib/seo/og-card";

export const alt = "ContHunt Pricing: Pro, Creator and Research plans, each with a 1-week free trial";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    eyebrow: "Pricing",
    title: "Pay for the research, keep the hours.",
    subtitle: "Three plans. Every plan starts with a 1-week free trial.",
    plate: "/blog/plates/finding-winning-products-from-short-form-signals-1600.webp",
    background: "#F1E7D8",
  });
}
