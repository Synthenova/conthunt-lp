/**
 * Server-only brand marks from simple-icons (CC0 data; trademarks belong to their
 * owners). Imported only by the server component (index.tsx) so the 5 MB
 * simple-icons module never reaches the client bundle; the client receives the
 * three card glyph paths as a prop.
 */
import {
  siInstagram,
  siPinterest,
  siReddit,
  siSnapchat,
  siTiktok,
  siX,
  siYoutube,
  type SimpleIcon,
} from "simple-icons";
import type { GlyphMap } from "./data";

/**
 * Platforms strip ("COVERING"): the retained legacy marquee list
 * (src/content/site/platforms.ts), per OWNER_DECISIONS C2. LinkedIn is in the
 * legacy list but simple-icons no longer ships its mark (removed at LinkedIn's
 * request) and logos are never hand-drawn, so it is omitted.
 */
export const COVERED_PLATFORMS: { name: string; icon: SimpleIcon }[] = [
  { name: "TikTok", icon: siTiktok },
  { name: "YouTube", icon: siYoutube },
  { name: "Instagram", icon: siInstagram },
  { name: "Reddit", icon: siReddit },
  { name: "X", icon: siX },
  { name: "Pinterest", icon: siPinterest },
  { name: "Snapchat", icon: siSnapchat },
];

/** Card glyphs keyed by the `platform` field of hero-prompts.json. */
export const PLATFORM_GLYPHS: GlyphMap = {
  tiktok: siTiktok.path,
  instagram: siInstagram.path,
  youtube: siYoutube.path,
};
