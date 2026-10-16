"use client";

/**
 * BlogCover: the shared cover for the home gallery, the /resources index and the
 * article header. A 16:10 frame (radius 20px) with the soft photographic plate
 * (`next/image`, blur placeholder from the plate's dominant color) and one coded
 * UI fragment in crisp DOM, center-left.
 *
 *   <BlogCover cover={post.cover} sizes="(min-width:1280px) 280px, 90vw" />
 *   <BlogCover cover={post.cover} selfHost priority sizes="(min-width:1280px) 60vw, 100vw" />
 *   <BlogCover cover={indexCover}>…custom overlay (children)…</BlogCover>
 *
 * Props
 *   cover      CoverSpec from the loader (`post.cover`, or `getIndexCover()`).
 *   sizes      `sizes` attribute for the plate image.
 *   priority   Eager-load the plate (above-the-fold covers).
 *   selfHost   The cover is its own hover host. Cards instead put
 *              `data-cover-host` on their <article>, so hovering the whole card
 *              drives the cover: plate scale 1.03, fragment lift 4px, in-fragment
 *              micro-animations. Keyboard focus inside the host does the same.
 *   parallax   Pointer parallax (fragment and plate drift apart a few px). Default true.
 *   label      Show the small "Illustrative" tag on large covers. Default true.
 *   fragment   Override the fragment drawn on the plate (default: `cover.fragment`). `null` draws none.
 *   anchor     "left" (default) centers the fragment on the left, as on every card. "right" pins it
 *              to the bottom-right and hides it below 700px of cover width; used by the wide
 *              /resources banner, whose left half carries the headline.
 *   stageSize  Overrides the stage's em (the fragment's scale), e.g. "clamp(9px, 1.25cqw, 14px)".
 *   style      Extra inline style, e.g. { aspectRatio: "auto", borderRadius: 32 } for a wide banner.
 *   children   Decorative overlay (the cover is aria-hidden, so never put links or text in it).
 *
 * Loops (spinner, caret) only run while the cover is in view (`data-inview`), and
 * every animation stops under prefers-reduced-motion.
 */
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import type { CoverSpec, FragmentSpec } from "@/lib/blog/types";
import { Fragment } from "./fragments";
import "./blog-cover.css";

export interface BlogCoverProps {
  cover: CoverSpec;
  sizes?: string;
  priority?: boolean;
  selfHost?: boolean;
  parallax?: boolean;
  label?: boolean;
  fragment?: FragmentSpec | null;
  anchor?: "left" | "right";
  stageSize?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function BlogCover({
  cover,
  sizes = "(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw",
  priority = false,
  selfHost = false,
  parallax = true,
  label = true,
  fragment: fragmentProp,
  anchor = "left",
  stageSize,
  className,
  style,
  children,
}: BlogCoverProps) {
  const fragment = fragmentProp === undefined ? cover.fragment : fragmentProp;
  const root = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const fragRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [inView, setInView] = useState(false);

  // Hover (pointer or keyboard focus) on the host card, in-view tracking.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const host = (selfHost ? el : el.closest<HTMLElement>("[data-cover-host]")) ?? el;

    const enter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") setHover(true);
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") setHover(false);
    };
    const focusIn = (e: FocusEvent) => {
      if ((e.target as HTMLElement).matches(":focus-visible")) setHover(true);
    };
    const focusOut = () => setHover(false);

    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("focusin", focusIn);
    host.addEventListener("focusout", focusOut);

    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "240px" });
    io.observe(el);

    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("focusin", focusIn);
      host.removeEventListener("focusout", focusOut);
      io.disconnect();
    };
  }, [selfHost]);

  // Pointer parallax: fragment and plate drift in opposite directions.
  useGSAP(
    () => {
      const el = root.current;
      const plate = plateRef.current;
      const frag = fragRef.current;
      if (!el || !plate || !parallax) return;
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const host = (selfHost ? el : el.closest<HTMLElement>("[data-cover-host]")) ?? el;
        const opts = { duration: 0.7, ease: "power3.out" };
        const fx = frag ? gsap.quickTo(frag, "x", opts) : null;
        const fy = frag ? gsap.quickTo(frag, "y", opts) : null;
        const px = gsap.quickTo(plate, "x", opts);
        const py = gsap.quickTo(plate, "y", opts);
        const move = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          const r = el.getBoundingClientRect();
          const nx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
          const ny = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
          fx?.(nx * 14);
          fy?.(ny * 8);
          px(nx * -10);
          py(ny * -6);
        };
        const reset = () => {
          fx?.(0);
          fy?.(0);
          px(0);
          py(0);
        };
        host.addEventListener("pointermove", move);
        host.addEventListener("pointerleave", reset);
        return () => {
          host.removeEventListener("pointermove", move);
          host.removeEventListener("pointerleave", reset);
        };
      });
    },
    { scope: root, dependencies: [parallax, selfHost] },
  );

  return (
    <div
      ref={root}
      className={cn("bc", className)}
      style={{ "--bc-bg": cover.dominant, ...(stageSize ? { "--bc-stage-size": stageSize } : null), ...style } as CSSProperties}
      data-hover={hover}
      data-inview={inView}
      data-anchor={anchor}
      data-fragment={fragment?.kind ?? "none"}
      aria-hidden="true"
    >
      <div ref={plateRef} className="bc-plate">
        <div className="bc-plate-scale">
          <Image
            src={cover.plate1600}
            alt=""
            fill
            sizes={sizes}
            quality={75}
            priority={priority}
            placeholder="blur"
            blurDataURL={cover.blurDataURL}
            draggable={false}
            className="object-cover"
          />
        </div>
      </div>
      {fragment && (
        <div className="bc-stage">
          <div className="bc-anchor">
            <div ref={fragRef} className="bc-parallax">
              <div className="bc-lift">
                <Fragment spec={fragment} active={hover} />
              </div>
            </div>
          </div>
          {label && <span className="bc-illus">Illustrative UI</span>}
        </div>
      )}
      {children && <div className="bc-over">{children}</div>}
    </div>
  );
}
