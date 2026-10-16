"use client";

/**
 * CountChip — the inlaid number pills in the hero subtext ("[10 platforms]").
 * The numeral counts up once when the hero first loads; its final width is
 * reserved up front (an invisible copy in the same grid cell), so the sentence
 * never reflows while counting. Reduced motion shows the final value.
 */
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

const fmt = new Intl.NumberFormat("en-US");

export interface CountChipProps {
  value: number;
  suffix?: string;
  label: string;
  /** Seconds before counting starts. */
  delay?: number;
}

export function CountChip({ value, suffix = "", label, delay = 0 }: CountChipProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const final = `${fmt.format(value)}${suffix}`;

  useGSAP(() => {
    const el = numRef.current;
    if (!el) return;
    // Write into the existing text node (never replace it): a new text node is a new
    // LCP candidate, which made this paragraph a late LCP entry when the count ended.
    const write = (text: string) => {
      const node = el.firstChild;
      if (node?.nodeType === Node.TEXT_NODE) node.nodeValue = text;
      else el.textContent = text;
    };
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const o = { v: 0 };
      gsap.to(o, {
        v: value,
        duration: 1.8,
        delay: 0.5 + delay,
        ease: "expo.out",
        onUpdate: () => write(`${fmt.format(Math.round(o.v))}${suffix}`),
        onComplete: () => write(final),
      });
      return () => write(final);
    });
  }, [value, suffix]);

  return (
    <span className="mx-[0.12em] inline-flex h-[1.5em] translate-y-[-0.06em] items-center gap-[0.35em] whitespace-nowrap rounded-chip bg-surface px-[0.45em] align-middle text-[0.94em] leading-none text-ink shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
      <span className="grid font-mono text-[0.9em] font-medium tabular-nums tracking-[-0.01em]">
        <span aria-hidden="true" className="invisible col-start-1 row-start-1">
          {final}
        </span>
        <span ref={numRef} className="col-start-1 row-start-1 text-right">
          {final}
        </span>
      </span>
      <span className="font-medium">{label}</span>
    </span>
  );
}
