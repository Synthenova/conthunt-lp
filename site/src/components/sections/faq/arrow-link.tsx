/**
 * ArrowLink — a quiet inline link: ink text, a hairline that slides in from the
 * left on hover, and an arrow that nudges forward. Internal paths render via
 * next/link, absolute URLs as <a>.
 *
 *   <ArrowLink href={GET_STARTED_URL}>Get started</ArrowLink>
 */
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface ArrowLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  external?: boolean;
  children: ReactNode;
}

export function ArrowLink({ href, external = false, className, children, ...rest }: ArrowLinkProps) {
  const classes = cn(
    "group/arrow relative inline-flex min-h-10 items-center gap-1.5 text-[15px] font-medium tracking-[-0.01em] text-ink",
    className,
  );
  const inner = (
    <>
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-ink transition-transform duration-300 ease-out group-hover/arrow:scale-x-100 group-focus-visible/arrow:scale-x-100"
        />
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-4 transition-transform duration-300 ease-out group-hover/arrow:translate-x-1 group-focus-visible/arrow:translate-x-1"
      />
    </>
  );
  if (external) {
    return (
      <a href={href} className={classes} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {inner}
    </Link>
  );
}
