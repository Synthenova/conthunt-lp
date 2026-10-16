/**
 * Blog category identities (docs/revamp/COLOR_SYSTEM.md, "Blog gallery and Resources"):
 * Product blue, Research purple, Playbooks pink, Guides green. Static class maps live in
 * lib/tones.ts, so every class below is emitted by Tailwind.
 */
import type { PostCategory } from "@/lib/blog";
import type { Hue } from "@/lib/tones";

export const CATEGORY_HUE: Record<PostCategory, Hue> = {
  Product: "blue",
  Research: "purple",
  Playbooks: "pink",
  Guides: "green",
};

/** Hue for a category string; anything unknown falls back to blue (the product's colour). */
export function categoryHue(category: string): Hue {
  return CATEGORY_HUE[category as PostCategory] ?? "blue";
}
