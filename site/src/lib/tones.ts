/**
 * Tones — runtime hue helpers (niches, blog categories, plans). See docs/revamp/COLOR_SYSTEM.md.
 *
 * Tailwind only emits classes it finds written out in source, so every map below holds full
 * static class strings. Never build `bg-${hue}-soft` yourself; index these maps instead.
 *
 * API (all keyed by `Hue`):
 *   Hue, HUES, isHue(v)       the seven hues, their list, and a type guard for CMS strings
 *   toneVars(hue)             style object setting --tone, --tone-soft, --tone-ink, --tone-glow,
 *                             --tone-mark; pair with `bg-[var(--tone-soft)] text-[var(--tone-ink)]`
 *   toneSoftBg[hue]           bg-{hue}-soft     tinted backdrop (chips, badges, avatars, tiles)
 *   toneInkText[hue]          text-{hue}-ink    readable text in the hue
 *   toneInkBg[hue]            bg-{hue}-ink      solid fill behind WHITE text
 *   toneBaseBg[hue]           bg-{hue}          fills, icons, bars (never behind white text)
 *   toneBaseText[hue]         text-{hue}        display-size keywords only (24px bold+)
 *   toneMarkBg[hue]           dots and lines on paper (yellow -> yellow-deep, orange -> orange-ink)
 *   toneBorder[hue]           border-{hue}/25   hairline tinted border
 *   toneRing[hue]             ring-{hue}/30     tinted ring (use with ring-1 ring-inset)
 *   toneGlow[hue]             shadow-glow shadow-{hue}/25   coloured glow under hovered tiles
 *   toneGlowText[hue]         text-{hue}-glow   text on --night surfaces
 *   toneGradient[hue]         bg-grad-{hue}     small marks: avatar discs, plan glyphs
 *   toneGlowFrom[hue]         from-{hue}-glow   gradient partner
 *   toneSoftFrom[hue]         from-{hue}-soft   top wash: `bg-linear-to-b ${toneSoftFrom[h]} to-transparent`
 *   toneClasses(hue)          { soft, ink, inkBg, base, mark, border, ring, glow, gradient } bundle
 *
 * Data tones (growth, decline, breakout) are not hues: keep using those names in data code.
 */
import type { CSSProperties } from "react";

export type Hue = "pink" | "purple" | "blue" | "green" | "yellow" | "orange" | "red";

export const HUES: readonly Hue[] = ["pink", "purple", "blue", "green", "yellow", "orange", "red"];

export function isHue(value: unknown): value is Hue {
  return typeof value === "string" && (HUES as readonly string[]).includes(value);
}

/** CSS variables for a runtime hue. Use with arbitrary-value classes, e.g. `bg-[var(--tone-soft)]`. */
export const toneVars = (h: Hue) =>
  ({
    "--tone": `var(--${h})`,
    "--tone-soft": `var(--${h}-soft)`,
    "--tone-ink": `var(--${h}-ink)`,
    "--tone-glow": `var(--${h}-glow)`,
    "--tone-mark": h === "yellow" ? "var(--yellow-deep)" : h === "orange" ? "var(--orange-ink)" : `var(--${h})`,
  }) as CSSProperties;

export const toneSoftBg: Record<Hue, string> = {
  pink: "bg-pink-soft",
  purple: "bg-purple-soft",
  blue: "bg-blue-soft",
  green: "bg-green-soft",
  yellow: "bg-yellow-soft",
  orange: "bg-orange-soft",
  red: "bg-red-soft",
};

export const toneInkText: Record<Hue, string> = {
  pink: "text-pink-ink",
  purple: "text-purple-ink",
  blue: "text-blue-ink",
  green: "text-green-ink",
  yellow: "text-yellow-ink",
  orange: "text-orange-ink",
  red: "text-red-ink",
};

export const toneInkBg: Record<Hue, string> = {
  pink: "bg-pink-ink",
  purple: "bg-purple-ink",
  blue: "bg-blue-ink",
  green: "bg-green-ink",
  yellow: "bg-yellow-ink",
  orange: "bg-orange-ink",
  red: "bg-red-ink",
};

export const toneBaseBg: Record<Hue, string> = {
  pink: "bg-pink",
  purple: "bg-purple",
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow",
  orange: "bg-orange",
  red: "bg-red",
};

export const toneBaseText: Record<Hue, string> = {
  pink: "text-pink",
  purple: "text-purple",
  blue: "text-blue",
  green: "text-green",
  yellow: "text-yellow",
  orange: "text-orange",
  red: "text-red",
};

export const toneMarkBg: Record<Hue, string> = {
  pink: "bg-pink",
  purple: "bg-purple",
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow-deep",
  orange: "bg-orange-ink",
  red: "bg-red",
};

export const toneBorder: Record<Hue, string> = {
  pink: "border-pink/25",
  purple: "border-purple/25",
  blue: "border-blue/25",
  green: "border-green/25",
  yellow: "border-yellow-deep/30",
  orange: "border-orange/25",
  red: "border-red/25",
};

export const toneRing: Record<Hue, string> = {
  pink: "ring-pink/30",
  purple: "ring-purple/30",
  blue: "ring-blue/30",
  green: "ring-green/30",
  yellow: "ring-yellow-deep/40",
  orange: "ring-orange/30",
  red: "ring-red/30",
};

export const toneGlow: Record<Hue, string> = {
  pink: "shadow-glow shadow-pink/25",
  purple: "shadow-glow shadow-purple/25",
  blue: "shadow-glow shadow-blue/25",
  green: "shadow-glow shadow-green/25",
  yellow: "shadow-glow shadow-yellow/30",
  orange: "shadow-glow shadow-orange/25",
  red: "shadow-glow shadow-red/25",
};

export const toneGlowText: Record<Hue, string> = {
  pink: "text-pink-glow",
  purple: "text-purple-glow",
  blue: "text-blue-glow",
  green: "text-green-glow",
  yellow: "text-yellow-glow",
  orange: "text-orange-glow",
  red: "text-red-glow",
};

export const toneGradient: Record<Hue, string> = {
  pink: "bg-grad-pink",
  purple: "bg-grad-purple",
  blue: "bg-grad-blue",
  green: "bg-grad-green",
  yellow: "bg-grad-yellow",
  orange: "bg-grad-orange",
  red: "bg-grad-red",
};

export const toneGlowFrom: Record<Hue, string> = {
  pink: "from-pink-glow",
  purple: "from-purple-glow",
  blue: "from-blue-glow",
  green: "from-green-glow",
  yellow: "from-yellow-glow",
  orange: "from-orange-glow",
  red: "from-red-glow",
};

export const toneSoftFrom: Record<Hue, string> = {
  pink: "from-pink-soft",
  purple: "from-purple-soft",
  blue: "from-blue-soft",
  green: "from-green-soft",
  yellow: "from-yellow-soft",
  orange: "from-orange-soft",
  red: "from-red-soft",
};

/** All class strings for one hue, for call sites that need several at once. */
export function toneClasses(h: Hue) {
  return {
    soft: toneSoftBg[h],
    ink: toneInkText[h],
    inkBg: toneInkBg[h],
    base: toneBaseBg[h],
    mark: toneMarkBg[h],
    border: toneBorder[h],
    ring: toneRing[h],
    glow: toneGlow[h],
    gradient: toneGradient[h],
  } as const;
}
