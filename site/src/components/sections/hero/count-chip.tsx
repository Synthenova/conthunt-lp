"use client";

/**
 * CountChip — the inlaid number pills in the hero subtitle ("[7 platforms]").
 * The numeral counts up once when the hero first loads; its final width is
 * reserved up front (an invisible copy in the same grid cell), so the sentence
 * never reflows while counting. Reduced motion shows the final value.
 *
 * Sized in em of the subtitle (hero-rev14, the owner's Pencil chips at a 20px subtitle): 25.4px tall,
 * radius 8, padding 0 8.46, gap 6.58; the number JetBrains Mono 500 16.92px, the label Switzer 500
 * 18.8px. It sits on the line with `vertical-align: top` and equal block margins, which centres it
 * in the subtitle's 1.62 line box exactly as the frame does: (1.62 − 1.27) / 2 = 0.175em. The frame
 * spaces a chip 5.5px from its words, about 2.5px more than Switzer's word space: the inline margin.
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
    <span className="mx-[0.125em] my-[0.175em] inline-flex h-[1.27em] items-center gap-[0.329em] whitespace-nowrap rounded-[0.4em] bg-surface px-[0.423em] align-top leading-none text-ink shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
      <span className="grid font-mono text-[0.846em] font-medium tabular-nums tracking-[-0.01em]">
        <span aria-hidden="true" className="invisible col-start-1 row-start-1">
          {final}
        </span>
        <span ref={numRef} className="col-start-1 row-start-1 text-right">
          {final}
        </span>
      </span>
      <span className="text-[0.94em] font-medium tracking-[-0.0053em]">{label}</span>
    </span>
  );
}
