/**
 * Badge — tiny uppercase mono label: "Experimental", "New", "−30%", "Beta".
 *
 * Tones: `neutral` (surface), `ink` (inverted), `accent` (tinted accent),
 * `outline` (hairline border), and the data tones `breakout`/`growth`/`decline`
 * (tinted, data contexts only), plus the seven hues `pink`/`purple`/`blue`/`green`/
 * `yellow`/`orange`/`red` (`bg-{hue}-soft text-{hue}-ink`).
 *
 *   <Badge tone="accent">Experimental</Badge>
 *   <Badge tone="ink">−30%</Badge>
 */
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "neutral"
  | "ink"
  | "accent"
  | "outline"
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

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface text-ink-2",
  ink: "bg-ink text-paper",
  accent: "bg-accent/10 text-accent",
  outline: "border border-hairline text-ink-2",
  breakout: "bg-breakout/12 text-breakout-ink",
  growth: "bg-growth/12 text-growth-ink",
  decline: "bg-decline/12 text-decline-ink",
  pink: "bg-pink-soft text-pink-ink",
  purple: "bg-purple-soft text-purple-ink",
  blue: "bg-blue-soft text-blue-ink",
  green: "bg-green-soft text-green-ink",
  yellow: "bg-yellow-soft text-yellow-ink",
  orange: "bg-orange-soft text-orange-ink",
  red: "bg-red-soft text-red-ink",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap rounded-[6px] px-1.5 align-middle font-mono text-[10px] font-medium uppercase leading-none tracking-[0.06em] tabular-nums",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
