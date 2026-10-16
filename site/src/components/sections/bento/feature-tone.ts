/**
 * Feature-tile hues (docs/revamp/COLOR_SYSTEM.md, Bento): one identity hue per tile, a soft tinted
 * backdrop, a glow blob that brightens while the tile is active, and a tinted fragment card.
 * Class strings are written out in full because Tailwind only emits classes it finds in source.
 * `active` state comes from the tile's `data-active` attribute (`group/tile`), so fragments read
 * it with `group-data-[active=true]/tile:`.
 */
import type { Hue } from "@/lib/tones";
import type { FeatureKey } from "./data";

export interface FeatureTone {
  hue: Hue;
  /** Tile backdrop (soft tint only, never a base fill). */
  backdrop: string;
  /** Glow blob: opacity .22 at rest, .36 active (yellow .30 / .45); the transform scale is part of the string. */
  blob: string;
  /** Fragment card border. */
  border: string;
  /** Coloured shadow under the fragment card, faded in by opacity while the tile is active. */
  glow: string;
}

export const FEATURE_TONE: Record<FeatureKey, FeatureTone> = {
  platforms: {
    hue: "pink",
    backdrop: "bg-pink-soft",
    blob: "bg-pink opacity-[.22] group-data-[active=true]/tile:opacity-[.36]",
    border: "border-pink/20",
    glow: "shadow-glow shadow-pink/25",
  },
  research: {
    hue: "purple",
    backdrop: "bg-purple-soft",
    blob: "bg-purple opacity-[.22] group-data-[active=true]/tile:opacity-[.36]",
    border: "border-purple/20",
    glow: "shadow-glow shadow-purple/25",
  },
  niche: {
    hue: "yellow",
    backdrop: "bg-yellow-soft",
    blob: "bg-yellow opacity-30 group-data-[active=true]/tile:opacity-45",
    border: "border-yellow-deep/30",
    glow: "shadow-glow shadow-yellow/30",
  },
  velocity: {
    hue: "green",
    backdrop: "bg-green-soft",
    blob: "bg-green opacity-[.22] group-data-[active=true]/tile:opacity-[.36]",
    border: "border-green/20",
    glow: "shadow-glow shadow-green/25",
  },
};

/** Shared glow shadow for a fragment card: put as the card's first child, the card must be `relative`. */
export const GLOW_BASE =
  "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-out group-data-[active=true]/tile:opacity-100";
