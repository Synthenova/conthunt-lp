/**
 * DeltaChip: a small mono readout of a change ("Δ24h +3.1K", "+2.0% this week").
 *
 * The tone only tints the chip and its arrow (data colours). The text stays ink so
 * it keeps contrast on the light surface.
 */
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { VideoTone } from "./data";

/** The video tones plus `decline` (red), for a change below zero. */
export type ChipTone = VideoTone | "decline";

const TONE_BG: Record<ChipTone, string> = {
  breakout: "bg-breakout/15",
  growth: "bg-growth/12",
  steady: "bg-surface",
  decline: "bg-decline/12",
};

const TONE_ICON: Record<ChipTone, string> = {
  breakout: "text-breakout",
  growth: "text-growth",
  steady: "text-ink/40",
  decline: "text-decline",
};

export function DeltaChip({
  tone,
  label,
  children,
  className,
}: {
  tone: ChipTone;
  /** Small prefix, for example "Δ24h" or a date. */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const Arrow = tone === "decline" ? ArrowDownRight : ArrowUpRight;
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-[6px] px-1.5 font-mono text-[11px] font-medium leading-none tabular-nums text-ink",
        TONE_BG[tone],
        className,
      )}
    >
      <Arrow aria-hidden="true" className={cn("size-3 shrink-0", TONE_ICON[tone])} strokeWidth={2.25} />
      {label !== undefined && <span className="font-normal text-ink/60">{label}</span>}
      <span>{children}</span>
    </span>
  );
}
