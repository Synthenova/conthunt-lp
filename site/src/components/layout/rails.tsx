/**
 * Rails — the page's signature structure: two hairline vertical lines on the
 * Letterbox edges running the full height of the wrapped content, with small
 * "+" marks where sections meet (refs PLyVa, qvSVa).
 *
 * Home wraps every section between the hero and the footer:
 *   <Rails>
 *     <StatementSimulator />
 *     <HowItWorks />
 *     …
 *   </Rails>
 *
 * By default a <RailSeam/> is inserted before the first child, between every
 * pair of children and after the last. Pass `seams={false}` and place
 * <RailSeam /> yourself for custom positions. Lines sit behind sections
 * (z-index 0; direct children with [data-section] get z-index 1), so a section
 * with its own background hides the rails behind it.
 */
import { Children, Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Set to true to bring the letterbox guide lines (and "+" seams) back. When false the root
 * layout sets `data-rails="hidden"` on <html> and globals.css hides them with `visibility`,
 * so layout and spacing are unchanged. Hidden by default as of 2026-10-16 (owner request).
 */
export const SHOW_RAILS = false;

export function RailSeam({ className }: { className?: string }) {
  return (
    <div className={cn("rails-seam", className)} aria-hidden="true">
      <span />
      <span />
    </div>
  );
}

export interface RailsProps {
  children?: ReactNode;
  className?: string;
  /** Auto-insert "+" seams around and between children. Default true. */
  seams?: boolean;
}

export function Rails({ children, className, seams = true }: RailsProps) {
  const items = Children.toArray(children);
  return (
    <div className={cn("rails", className)}>
      <div className="rails-lines" aria-hidden="true" />
      {seams ? (
        <>
          <RailSeam />
          {items.map((child, i) => (
            <Fragment key={i}>
              {child}
              <RailSeam />
            </Fragment>
          ))}
        </>
      ) : (
        children
      )}
    </div>
  );
}
