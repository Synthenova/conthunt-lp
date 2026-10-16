/**
 * Button — the one button style for the site.
 *
 * Variants: `primary` (ink fill, the "Get started" CTA), `secondary` (surface
 * fill), `ghost` (transparent, surface on hover). Sizes: sm (36px), md (44px),
 * lg (56px). Radius is the 14px button token.
 *
 * Pass `href` to render a link with the same styles (asChild-like): internal
 * paths use next/link, absolute URLs render <a> (add `newTab` to open in a new tab).
 *
 *   <Button href={GET_STARTED_URL}>Get started <ArrowRight className="size-4" /></Button>
 *   <Button variant="secondary" size="sm" onClick={…}>Monthly</Button>
 *   <Button variant="ghost" href="/pricing">See pricing</Button>
 *
 * For other elements, reuse the classes: <summary className={buttonVariants({ variant: "ghost" })}>.
 */
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isExternal } from "@/lib/links";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "group/button relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-btn font-medium tracking-[-0.01em] " +
  "transition-[background-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 " +
  "[&_svg]:shrink-0";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-2",
  secondary: "bg-surface text-ink hover:bg-surface-2",
  ghost: "bg-transparent text-ink hover:bg-surface",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

export type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

export type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "href"> & {
    href: string;
    /** Open external links in a new tab (adds rel="noopener noreferrer"). */
    newTab?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { variant, size, className, children, href, newTab, ...rest } = props;
    const classes = buttonVariants({ variant, size, className });
    if (isExternal(href)) {
      return (
        <a
          href={href}
          className={classes}
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...rest}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant, size, className, children, type = "button", ...rest } = props;
  return (
    <button type={type} className={buttonVariants({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}
