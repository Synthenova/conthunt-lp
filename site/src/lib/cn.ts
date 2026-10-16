import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know our token names and custom @utility classes so
 * conflicting classes collapse correctly, e.g. `cn("rounded-btn", "rounded-card")`
 * keeps `rounded-card`, and `cn("display-l", "display-m")` keeps `display-m`.
 */
const twMerge = extendTailwindMerge<"ch-type">({
  extend: {
    theme: {
      color: [
        "bg",
        "surface",
        "surface-2",
        "paper",
        "ink",
        "ink-2",
        "muted",
        "faint",
        "hairline",
        "accent",
        "breakout",
        "breakout-glow",
        "growth",
        "decline",
      ],
      radius: ["chip", "btn", "card", "tray"],
      shadow: ["float"],
      ease: ["out-fast"],
      font: ["serif-italic"],
    },
    classGroups: {
      "ch-type": ["display-xl", "display-l", "display-m", "statement", "body-l", "eyebrow"],
    },
  },
});

/** Merge class names; later Tailwind classes win over earlier conflicting ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
