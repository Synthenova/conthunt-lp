/** Share image for `/viral-now` (also used by the `?niche=` views, which share one canonical URL). */
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-assets";
import { renderOgCard } from "@/lib/seo/og-card";

export const alt = "ContHunt Viral Now: top short-form videos across 20 niches";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    eyebrow: "Viral Now",
    title: "The top viral short-form videos in 20 niches.",
    subtitle: "TikTok, Instagram Reels and YouTube Shorts, ranked by ContHunt.",
    plate: "/blog/plates/ugc-ad-formats-that-sell-a-field-guide-1600.webp",
    background: "#E5CEB9",
  });
}
