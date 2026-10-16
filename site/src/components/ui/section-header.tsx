/**
 * SectionHeader — eyebrow + two-tone heading + optional sub (PLAN §2, jreAl).
 *
 * The heading's first phrase (`title`) is ink; the continuation (`muted`) is the
 * muted token at the same size and weight. Put the one Boska keyword inside
 * either part with <Emphasis>. Headlines: 8 words or fewer.
 *
 *   <SectionHeader
 *     index={4}
 *     label="Features"
 *     title={<>Everything a <Emphasis>video</Emphasis> knows.</>}
 *     muted="Pulled, scored and ranked."
 *     sub="One line of supporting copy."
 *   />
 *   <SectionHeader index={8} label="FAQ" title="Questions," muted="answered." align="center" size="m" />
 *
 * The heading animates in with <Reveal> (lines, once) unless `reveal={false}`.
 * `actions` renders to the right on desktop (left-aligned headers) or below (centre).
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./eyebrow";
import { Reveal } from "./reveal";

export interface SectionHeaderProps {
  /** Section number for the eyebrow, e.g. 4 → "[ 04 / 08 ]". */
  index?: number;
  total?: number;
  /** Eyebrow label, e.g. "Pricing". Omit to hide the eyebrow. */
  label?: string;
  /** Ink part of the heading. */
  title: ReactNode;
  /** Muted continuation of the heading. */
  muted?: ReactNode;
  sub?: ReactNode;
  align?: "left" | "center";
  /** Heading scale: "l" = display-l (default), "m" = display-m, "xl" = display-xl. */
  size?: "xl" | "l" | "m";
  as?: "h1" | "h2" | "h3";
  reveal?: boolean;
  actions?: ReactNode;
  className?: string;
  /** Extra classes for the heading element (e.g. max-width). */
  headingClassName?: string;
}

const SIZE = { xl: "display-xl", l: "display-l", m: "display-m" } as const;

export function SectionHeader({
  index,
  total,
  label,
  title,
  muted,
  sub,
  align = "left",
  size = "l",
  as = "h2",
  reveal = true,
  actions,
  className,
  headingClassName,
}: SectionHeaderProps) {
  const centered = align === "center";
  const headingContent = (
    <>
      {title}
      {muted && (
        <>
          {" "}
          <span className="text-muted">{muted}</span>
        </>
      )}
    </>
  );
  const headingClasses = cn(SIZE[size], "max-w-[18ch]", centered && "mx-auto", headingClassName);
  const Heading = as;

  return (
    <header
      className={cn(
        "flex gap-8",
        centered ? "flex-col items-center text-center" : "flex-col md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-5", centered && "items-center")}>
        {label && <Eyebrow index={index} total={total} label={label} className={cn(centered && "justify-center")} />}
        {reveal ? (
          <Reveal as={as} className={headingClasses}>
            {headingContent}
          </Reveal>
        ) : (
          <Heading className={headingClasses}>{headingContent}</Heading>
        )}
        {sub && <p className={cn("body-l max-w-[52ch] text-muted", centered && "mx-auto")}>{sub}</p>}
      </div>
      {actions && <div className={cn("flex shrink-0 items-center gap-3", centered && "justify-center")}>{actions}</div>}
    </header>
  );
}
