/**
 * MonoLabel: the small uppercase mono label used on plan cards and in the calculator
 * (MONTHLY ALLOWANCE, TIME YOU GET BACK, WE RECOMMEND ...).
 *
 * The shared `.eyebrow` utility is tinted `--faint` (about 1.9:1 on white), which is fine for a
 * decorative section marker but too pale for a label that names real data. This keeps the
 * eyebrow's type (mono, 11px, uppercase, +0.02em) and sets the color to ink-2 at 75%
 * (about 5.5:1 on white, 5.0:1 on the surface tray).
 *
 *   <MonoLabel>Monthly allowance</MonoLabel>
 *   <MonoLabel as="span" className="text-ink">Time you get back</MonoLabel>
 */
import type { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface MonoLabelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

export function MonoLabel({ as: Tag = "p", className, ...rest }: MonoLabelProps) {
  return (
    <Tag
      className={cn(
        "font-mono text-[11px] font-medium uppercase leading-[1.3] tracking-[0.02em] tabular-nums text-ink-2/75",
        className,
      )}
      {...rest}
    />
  );
}

/**
 * PageEyebrow: the label-only section marker on /pricing (PRICING, CALCULATOR, PRICING FAQ).
 * Same type as the shared `<Eyebrow>` (the `.eyebrow` utility), but the label is ink-2 at 75% instead
 * of `--muted`, which is 3.3:1 at 12px. Home keeps the shared numbered eyebrow.
 *
 *   <PageEyebrow className="mb-5">Calculator</PageEyebrow>
 */
export function PageEyebrow({ className, children }: { className?: string; children: string }) {
  return (
    <p className={cn("eyebrow", className)}>
      <span className="text-ink-2/75">{children}</span>
    </p>
  );
}
