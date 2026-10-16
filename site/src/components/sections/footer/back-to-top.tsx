"use client";

/**
 * BackToTop — returns to the top of the page. Uses the shared Lenis instance for
 * an eased scroll (useLenis() is null under reduced motion), falling back to the
 * native scroll, which is instant when the user prefers reduced motion.
 */
import { ArrowUp } from "lucide-react";
import { useLenis } from "@/components/layout/smooth-scroll";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/motion";

/** `className` is merged after the base classes, so the footer row can pull the control onto the column edges. */
export function BackToTop({ className }: { className?: string }) {
  const lenis = useLenis();
  const onClick = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group/top inline-flex h-11 items-center gap-3 rounded-full pl-1 pr-3 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-ink-2/75 transition-colors duration-200 ease-out hover:text-ink",
        className,
      )}
    >
      <span className="relative inline-flex size-9 items-center justify-center overflow-hidden rounded-full bg-ink text-paper transition-transform duration-200 ease-out group-active/top:scale-[0.94]">
        <ArrowUp
          aria-hidden="true"
          className="absolute size-4 transition-transform duration-300 ease-out group-hover/top:-translate-y-6"
        />
        <ArrowUp
          aria-hidden="true"
          className="absolute size-4 translate-y-6 transition-transform duration-300 ease-out group-hover/top:translate-y-0"
        />
      </span>
      Back to top
    </button>
  );
}
