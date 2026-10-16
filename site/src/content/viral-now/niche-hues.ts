/**
 * Viral Now niche hues (docs/revamp/COLOR_SYSTEM.md, "Viral Now"). The 20 niches use the full
 * hue scale, one of the palette's named exceptions to the three-hues-per-view rule.
 * Keyed by niche slug (content/viral-now/niches.json). Orange carries the warm categories.
 */
import type { Hue } from "@/lib/tones";

export const NICHE_HUES: Record<string, Hue> = {
  "beauty-skincare": "pink",
  "fashion-style": "pink",
  "parenting-family": "pink",
  "fitness-gym": "red",
  sports: "red",
  "cars-motors": "red",
  "food-recipes": "orange",
  "home-diy": "orange",
  "comedy-skits": "yellow",
  "tiktok-shop-finds": "yellow",
  "education-science": "yellow",
  "personal-finance": "green",
  "pets-animals": "green",
  "wellness-mindset": "green",
  "tech-gadgets": "blue",
  travel: "blue",
  "business-creator": "blue",
  gaming: "purple",
  "dance-music": "purple",
  "lifestyle-vlogs": "purple",
};

/** Hue for a niche slug; an unknown slug falls back to blue. */
export function nicheHue(slug: string): Hue {
  return NICHE_HUES[slug] ?? "blue";
}
