/** Share image for `/resources` (the article index): the shared index plate with the page headline. */
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/seo/og-assets";
import { renderOgCard } from "@/lib/seo/og-card";

export const alt = "ContHunt Resources: short-form research, explained";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    eyebrow: "Resources",
    title: "Short-form research, explained.",
    subtitle: "Playbooks, guides and research on short-form video.",
    plate: "/blog/plates/_index-1600.webp",
    background: "#DFE1E2",
  });
}
