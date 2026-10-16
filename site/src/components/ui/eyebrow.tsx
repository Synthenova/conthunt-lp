/**
 * Eyebrow — the mono section label that opens every section (PLyVa pattern):
 *   [ 05 / 08 ] · PRICING
 *
 *   <Eyebrow index={5} label="Pricing" />
 *   <Eyebrow index={3} total={8} label="How it works" className="mb-6" />
 *   <Eyebrow label="Experimental" />   // label only, no number
 *
 * Numbers are zero-padded to two digits. Text is uppercased by CSS, so pass
 * normal case (screen readers get normal case too).
 *
 * Contrast (WCAG AA at 11–12px): the index is --muted (5.3:1 on --bg), the label is
 * --ink-2 (11.4:1). Only the decorative "·" separator uses --faint.
 */
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface EyebrowProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Section number (1-based). Omit to render only the label. */
  index?: number;
  /** Total sections. Default 8. */
  total?: number;
  label: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Eyebrow({ index, total = 8, label, className, ...rest }: EyebrowProps) {
  return (
    <p className={cn("eyebrow flex flex-wrap items-center gap-x-2", className)} {...rest}>
      {index !== undefined && (
        <>
          <span className="whitespace-pre text-muted">{`[ ${pad(index)} / ${pad(total)} ]`}</span>
          <span aria-hidden="true" className="text-faint">
            ·
          </span>
        </>
      )}
      <span className="text-ink-2">{label}</span>
    </p>
  );
}
