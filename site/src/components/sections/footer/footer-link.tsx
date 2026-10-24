/**
 * FooterLink — Switzer 16px, ink, with an underline that slides in from the left
 * on hover/focus. External links gain a small arrow that nudges up and right.
 * A link with no destination (href null) renders as a disabled item with a
 * "Soon" tag instead of a dead `#`.
 */
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { destinationForHref, phAttrs } from "@/lib/attribution";
import { cn } from "@/lib/cn";
import type { ResolvedFooterLink } from "./links";

const BASE =
  "group/link relative inline-flex min-h-8 items-center gap-1 rounded-[4px] text-[16px] leading-tight tracking-[-0.01em] text-ink";

export function FooterLink({ link }: { link: ResolvedFooterLink }) {
  if (!link.href) {
    return (
      <span aria-disabled="true" className="inline-flex min-h-8 items-center gap-2 text-[16px] leading-tight tracking-[-0.01em] text-ink-2/55">
        {link.label}
        <span className="rounded-[4px] border border-ink/15 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.04em] text-ink-2/80">
          Soon
        </span>
      </span>
    );
  }

  const inner = (
    <>
      <span className="relative">
        {link.label}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-ink transition-transform duration-300 ease-out group-hover/link:scale-x-100 group-focus-visible/link:scale-x-100"
        />
      </span>
      {link.newTab && (
        <ArrowUpRight
          aria-hidden="true"
          className="size-3.5 -translate-x-1 translate-y-0.5 text-ink opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover/link:translate-x-0 group-hover/link:translate-y-0 group-hover/link:opacity-100 group-focus-visible/link:translate-x-0 group-focus-visible/link:translate-y-0 group-focus-visible/link:opacity-100"
        />
      )}
    </>
  );

  const destination = destinationForHref(link.href);
  const attrs = destination ? phAttrs("footer", destination) : {};
  if (link.external) {
    return (
      <a
        href={link.href}
        className={cn(BASE)}
        {...attrs}
        {...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
        {link.newTab && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    );
  }
  return (
    <Link href={link.href} className={cn(BASE)} {...attrs}>
      {inner}
    </Link>
  );
}
