/**
 * Section — the outer shell of a home-page section.
 *
 * Renders <section id data-section> with the fluid vertical rhythm
 * (`--section-pad-y`, ≈ 72px mobile → 140px at 1440) and, by default, wraps
 * children in the Letterbox column. `data-section` is how Rails, analytics and
 * QA scripts find sections; always pass the section key.
 *
 *   <Section id="pricing" sectionKey="pricing">
 *     <SectionHeader index={5} label="Pricing" title="Plans that" muted="pay for themselves." />
 *     …
 *   </Section>
 *
 *   // Full-bleed content (manage your own column):
 *   <Section sectionKey="mcp" letterbox={false} padding="none">…</Section>
 */
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Letterbox } from "./letterbox";

export type SectionPadding = "default" | "top" | "bottom" | "tight" | "none";

const PADDING: Record<SectionPadding, string> = {
  default: "py-[var(--section-pad-y)]",
  top: "pt-[var(--section-pad-y)]",
  bottom: "pb-[var(--section-pad-y)]",
  tight: "py-[calc(var(--section-pad-y)*0.5)]",
  none: "",
};

export interface SectionProps extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  /** Section key, e.g. "pricing". Written to data-section; also the default id. */
  sectionKey: string;
  /** Anchor id. Defaults to sectionKey. */
  id?: string;
  padding?: SectionPadding;
  /** Wrap children in <Letterbox>. Default true. */
  letterbox?: boolean;
  /** Extra classes for the inner Letterbox. */
  innerClassName?: string;
  children?: ReactNode;
}

export function Section({
  sectionKey,
  id,
  padding = "default",
  letterbox = true,
  className,
  innerClassName,
  children,
  ...rest
}: SectionProps) {
  return (
    <section id={id ?? sectionKey} data-section={sectionKey} className={cn("relative", PADDING[padding], className)} {...rest}>
      {letterbox ? <Letterbox className={innerClassName}>{children}</Letterbox> : children}
    </section>
  );
}
