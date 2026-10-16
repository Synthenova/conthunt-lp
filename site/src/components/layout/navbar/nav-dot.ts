/**
 * Active-page dot hue per nav link (docs/revamp/COLOR_SYSTEM.md, "Navbar"):
 * Pricing purple, Viral Now red, Resources green. Logo, links and buttons stay neutral.
 */
import type { Hue } from "@/lib/tones";
import { toneBaseBg } from "@/lib/tones";

const NAV_HUE: Record<string, Hue> = {
  Pricing: "purple",
  "Viral Now": "red",
  Resources: "green",
};

/** `bg-{hue}` class for a nav link's active dot (static strings, from the tones map). */
export function navDotClass(label: string): string {
  return toneBaseBg[NAV_HUE[label] ?? "blue"];
}
