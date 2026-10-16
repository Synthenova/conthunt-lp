"use client";

/**
 * Frame pieces for the MCP section's spec-sheet layout (PLyVa): hairline rules that span
 * the letterbox (rail to rail), "+" marks where a rule meets a rail, and the entrance
 * choreography that draws them.
 *
 *   <McpReveal>
 *     <Rule edge="top" />  <Cross x="left" y="top" />  <Cross x="right" y="top" />
 *     …
 *   </McpReveal>
 *
 * Entrance (once, at 78% of the viewport): rules draw left → right in sequence, the
 * vertical divider drops, "+" marks pop, heading lines rise out of their masks, then
 * content blocks marked `data-mcp-in` lift in. Reduced motion: nothing animates; the
 * default DOM is the final state.
 */
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { EASE, gsap, useGSAP } from "@/lib/gsap";
import { MOTION_OK } from "@/lib/motion";

export function Rule({ edge, className }: { edge: "top" | "bottom" | "vertical"; className?: string }) {
  if (edge === "vertical") {
    return (
      <span
        aria-hidden="true"
        data-rule-y=""
        className={cn("pointer-events-none absolute inset-y-0 w-px bg-hairline", className)}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      data-rule-x=""
      className={cn(
        "pointer-events-none absolute inset-x-0 h-px bg-hairline",
        edge === "top" ? "top-0" : "bottom-0",
        className,
      )}
    />
  );
}

/** An 11px "+" centred on a rule/rail junction. */
export function Cross({ x, y, className }: { x: "left" | "right"; y: "top" | "bottom"; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-cross=""
      className={cn(
        "pointer-events-none absolute z-[1] size-[11px] -translate-x-1/2 -translate-y-1/2 text-faint",
        "before:absolute before:left-[5px] before:top-0 before:h-[11px] before:w-px before:bg-current",
        "after:absolute after:left-0 after:top-[5px] after:h-px after:w-[11px] after:bg-current",
        x === "left" ? "left-0" : "left-full",
        y === "top" ? "top-0" : "top-full",
        className,
      )}
    />
  );
}

export function McpReveal({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        const tl = gsap.timeline({
          defaults: { ease: EASE.out },
          scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
        });
        // Every tween clears its inline styles when done: the entrance runs once, and
        // leftover identity transforms would keep whole articles on their own GPU layers
        // (uneven text antialiasing, wasted memory).
        tl.from(q("[data-rule-x]"), {
          scaleX: 0,
          transformOrigin: "0% 50%",
          duration: 1.1,
          ease: EASE.inOut,
          stagger: 0.09,
          clearProps: "transform,transformOrigin",
        })
          .from(
            q("[data-rule-y]"),
            { scaleY: 0, transformOrigin: "50% 0%", duration: 0.9, ease: EASE.inOut, clearProps: "transform,transformOrigin" },
            0.4,
          )
          .from(q("[data-cross]"), { opacity: 0, scale: 0.3, duration: 0.45, stagger: 0.04, clearProps: "opacity,transform" }, 0.15)
          .from(q("[data-mcp-line]"), { yPercent: 110, duration: 0.85, stagger: 0.1, clearProps: "transform" }, 0.3)
          .from(q("[data-mcp-in]"), { y: 16, opacity: 0, duration: 0.7, stagger: 0.07, clearProps: "opacity,transform" }, 0.45);
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
