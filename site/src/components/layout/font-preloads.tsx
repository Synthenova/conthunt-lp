"use client";

/**
 * FontPreloads — a route's font preloads beyond the site-wide faces (src/lib/fonts.ts).
 *
 *   <FontPreloads faces={["switzer600", "boska400i"]} />
 *
 * A client component on purpose: its preload() runs while the route renders (React puts the
 * <link rel="preload"> in <head> of the server HTML), never from a prefetched RSC payload on
 * another page. Renders nothing.
 */
import { preload } from "react-dom";
import { FONT_FILES, type FontKey } from "@/lib/fonts";

export function FontPreloads({ faces }: { faces: FontKey[] }) {
  for (const face of faces) preload(FONT_FILES[face], { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return null;
}
