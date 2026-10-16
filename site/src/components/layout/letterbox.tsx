/**
 * Letterbox — the 20/60/20 content column used by every home section except the hero.
 *
 * Width: 60vw at >= 1280px, 80vw at 768–1279px, calc(100% - 40px) below 768px
 * (the `letterbox` utility / `--letterbox` variable in globals.css). The Rails
 * lines sit exactly on its edges.
 *
 *   <Letterbox>…</Letterbox>
 *   <Letterbox as="header" className="flex items-end justify-between">…</Letterbox>
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type LetterboxProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function Letterbox<T extends ElementType = "div">({ as, className, children, ...rest }: LetterboxProps<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag className={cn("letterbox", className)} {...rest}>
      {children}
    </Tag>
  );
}
