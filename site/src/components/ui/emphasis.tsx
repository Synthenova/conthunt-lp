/**
 * Emphasis — the one Boska italic keyword per headline (PLAN §2 Type).
 *
 * Boska's x-height is smaller than Switzer's, so the span is scaled up
 * (default 1.07em, allowed 1.04–1.1) to optically match the surrounding
 * display text. Never use it in body copy or buttons.
 *
 *   <h2 className="display-l">Find what <Emphasis>works</Emphasis> before it trends</h2>
 *   <Emphasis scale={1.1} weight={300}>breakout</Emphasis>
 */
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface EmphasisProps extends HTMLAttributes<HTMLElement> {
  /** Optical size multiplier relative to the parent font size. 1.04–1.1. Default 1.07. */
  scale?: number;
  /** Boska italic weight: 300, 400 or 500. Default 400. */
  weight?: 300 | 400 | 500;
}

export function Emphasis({ scale = 1.07, weight = 400, className, style, children, ...rest }: EmphasisProps) {
  return (
    <em
      className={cn("emphasis", className)}
      style={{ fontSize: `${scale}em`, fontWeight: weight, fontOpticalSizing: "auto", ...style }}
      {...rest}
    >
      {children}
    </em>
  );
}
