/**
 * Chip — small inline pill for data and tags (8px radius token).
 *
 * Variants: `outline` (paper + hairline, default), `surface` (grey fill), `ink`
 * (inverted). `tone` colours the text and optional leading dot; data tones
 * (breakout/growth/decline) are for data only, never UI chrome. Hue tones
 * (pink/purple/blue/green/yellow/orange/red) use `text-{hue}-ink` with a base dot
 * (yellow dot = yellow-deep, orange dot = orange-ink); pair with
 * `variant="surface"` or a `bg-{hue}-soft` className for a tinted chip. `mono` switches
 * to JetBrains Mono with tabular numbers (use for metrics).
 *
 *   <Chip mono>2.4M views</Chip>
 *   <Chip tone="growth" dot mono>+38%</Chip>
 *   <Chip variant="surface" icon={<Search className="size-3.5" />}>gym tok</Chip>
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ChipTone =
  | "neutral"
  | "accent"
  | "breakout"
  | "growth"
  | "decline"
  | "pink"
  | "purple"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "red";
export type ChipVariant = "outline" | "surface" | "ink";

const VARIANTS: Record<ChipVariant, string> = {
  outline: "border border-hairline bg-paper text-ink-2",
  surface: "bg-surface text-ink-2",
  ink: "bg-ink text-paper",
};

const TONE_TEXT: Record<ChipTone, string> = {
  neutral: "",
  accent: "text-accent",
  breakout: "text-breakout-ink",
  growth: "text-growth-ink",
  decline: "text-decline-ink",
  pink: "text-pink-ink",
  purple: "text-purple-ink",
  blue: "text-blue-ink",
  green: "text-green-ink",
  yellow: "text-yellow-ink",
  orange: "text-orange-ink",
  red: "text-red-ink",
};

const TONE_DOT: Record<ChipTone, string> = {
  neutral: "bg-faint",
  accent: "bg-accent",
  breakout: "bg-breakout",
  growth: "bg-growth",
  decline: "bg-decline",
  pink: "bg-pink",
  purple: "bg-purple",
  blue: "bg-blue",
  green: "bg-green",
  yellow: "bg-yellow-deep",
  orange: "bg-orange-ink",
  red: "bg-red",
};

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  tone?: ChipTone;
  size?: "sm" | "md";
  /** Leading status dot in the tone colour. */
  dot?: boolean;
  /** Leading icon (≈14px). */
  icon?: ReactNode;
  mono?: boolean;
}

export function Chip({
  variant = "outline",
  tone = "neutral",
  size = "md",
  dot = false,
  icon,
  mono = false,
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-chip align-middle leading-none",
        size === "sm" ? "h-6 px-2 text-[11px]" : "h-7 px-2.5 text-[13px]",
        mono ? "font-mono tabular-nums tracking-[0.01em]" : "font-medium",
        VARIANTS[variant],
        variant !== "ink" && TONE_TEXT[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span aria-hidden="true" className={cn("size-1.5 rounded-full", TONE_DOT[tone])} />}
      {icon}
      {children}
    </span>
  );
}
