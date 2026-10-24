"use client";

/**
 * FaqAccordion — single-open accordion (WAI-ARIA accordion pattern).
 *
 *   <FaqAccordion items={FAQ_ITEMS} />
 *   <FaqAccordion items={pickFaqs(["free-trial", "cancel"])} defaultOpen={null} />
 *
 * - Opening an item closes the previous one; clicking the open item closes it.
 * - Uncontrolled by default (`defaultOpen`). Pass `open` + `onOpenChange` to
 *   control it from outside (the section's left-column tick bar does this).
 * - Every trigger is a <button aria-expanded aria-controls>. Arrow Up/Down move
 *   focus between triggers (wrapping), Home/End jump to the first/last.
 * - Height animates with Motion (0.35s, the site "out" curve); the answer then
 *   fades in a beat later. Closed panels are `inert` + aria-hidden, so their
 *   text is not focusable or announced. Reduced motion: instant swap.
 * - The plus rotates into a minus (transform only). No ink rule marks the open item: only the
 *   hairline dividers between items.
 */
import { m } from "motion/react";
import { LazyMotionConfig } from "@/components/ui/lazy-motion";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Chip } from "@/components/ui/chip";
import { cn } from "@/lib/cn";
import { destinationForHref, phAttrs } from "@/lib/attribution";
import { isExternal } from "@/lib/links";
import { usePrefersReducedMotion } from "@/lib/motion";
import type { FaqEntry } from "./items";
import { ArrowLink } from "./arrow-link";

const EASE_OUT = [0.2, 0.715, 0.205, 0.99] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wrap each `emphasis` phrase in the answer in an ink, medium-weight span (the legacy page used <em>). */
function renderAnswer(answer: string, emphasis: readonly string[]): ReactNode {
  const phrases = emphasis.filter((p) => p && answer.includes(p));
  if (phrases.length === 0) return answer;
  const parts = answer.split(new RegExp(`(${phrases.map(escapeRegExp).join("|")})`, "g"));
  return parts.map((part, i) =>
    phrases.includes(part) ? (
      <em key={i} className="whitespace-nowrap font-medium not-italic text-ink">
        {part}
      </em>
    ) : (
      part
    ),
  );
}

function PlusMinus({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative mt-px inline-flex size-9 shrink-0 items-center justify-center rounded-full",
        "transition-[background-color,color] duration-300 ease-out",
        open ? "bg-ink text-paper" : "bg-surface text-ink group-hover/q:bg-surface-2",
      )}
    >
      <svg
        viewBox="0 0 14 14"
        className={cn("size-3.5 transition-transform duration-[350ms] ease-out", open ? "rotate-180" : "rotate-0")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <line x1="1.5" y1="7" x2="12.5" y2="7" />
        <line
          x1="7"
          y1="1.5"
          x2="7"
          y2="12.5"
          className="origin-center transition-transform duration-[350ms] ease-out"
          style={{ transformBox: "fill-box", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        />
      </svg>
    </span>
  );
}

export interface FaqAccordionProps {
  items: readonly FaqEntry[];
  /** Index of the item open on first render, or null for all closed. Default 0. Ignored when `open` is set. */
  defaultOpen?: number | null;
  /** Controlled open index (or null for all closed). Omit for uncontrolled. */
  open?: number | null;
  /** Called whenever the open item changes (index, or null when all are closed). */
  onOpenChange?: (index: number | null) => void;
  className?: string;
}

export function FaqAccordion({ items, defaultOpen = 0, open: openProp, onOpenChange, className }: FaqAccordionProps) {
  const uid = useId();
  const reduced = usePrefersReducedMotion();
  const [innerOpen, setInnerOpen] = useState<number | null>(defaultOpen);
  const open = openProp !== undefined ? openProp : innerOpen;
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = (i: number) => {
    const next = open === i ? null : i;
    if (openProp === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = items.length - 1;
    let target: number | null = null;
    if (e.key === "ArrowDown") target = i === last ? 0 : i + 1;
    else if (e.key === "ArrowUp") target = i === 0 ? last : i - 1;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = last;
    if (target === null) return;
    e.preventDefault();
    triggers.current[target]?.focus();
  };

  return (
    <LazyMotionConfig>
      <ul className={cn("m-0 list-none p-0", className)}>
        {items.map((item, i) => {
          const isOpen = open === i;
          const triggerId = `${uid}-trigger-${i}`;
          const panelId = `${uid}-panel-${i}`;
          return (
            <li key={item.id ?? item.question} className="relative border-b border-hairline first:border-t">
              <h3 className="m-0 text-base font-normal tracking-normal">
                <button
                  ref={(el) => {
                    triggers.current[i] = el;
                  }}
                  id={triggerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "group/q flex w-full items-start gap-3 rounded-chip px-3 py-5 text-left sm:gap-4 sm:px-4 sm:py-6",
                    "transition-colors duration-200 ease-out hover:bg-surface/60",
                    "focus-visible:outline-offset-[-2px]",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1 inline-flex h-[25px] w-7 shrink-0 items-center font-mono text-[11px] font-medium leading-none tabular-nums tracking-[0.02em] sm:h-[26px] sm:w-9",
                      "transition-colors duration-300 ease-out",
                      isOpen ? "text-ink" : "text-muted group-hover/q:text-ink-2",
                    )}
                  >
                    {pad(i + 1)}
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 pt-1 text-[19px] font-medium leading-[1.3] tracking-[-0.018em] text-ink sm:text-[20px]",
                      "transition-transform duration-300 ease-out",
                      !isOpen && "group-hover/q:translate-x-1",
                    )}
                  >
                    {item.question}
                  </span>
                  <PlusMinus open={isOpen} />
                </button>
              </h3>

              <m.div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                aria-hidden={!isOpen}
                inert={!isOpen}
                initial={false}
                animate={{ height: isOpen ? "auto" : 0 }}
                transition={{ duration: reduced ? 0 : 0.35, ease: EASE_OUT }}
                style={{ overflow: "hidden" }}
              >
                <m.div
                  initial={false}
                  animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -6 }}
                  transition={{ duration: reduced ? 0 : isOpen ? 0.32 : 0.15, delay: reduced || !isOpen ? 0 : 0.07, ease: EASE_OUT }}
                  className="pb-7 pl-[52px] pr-4 sm:pb-8 sm:pl-[68px] sm:pr-8"
                >
                  <p className="max-w-[62ch] text-[16px] leading-[1.62] text-ink-2/75">{renderAnswer(item.answer, item.emphasis)}</p>
                  {(item.chips?.length || item.link) && (
                    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                      {item.chips?.length ? (
                        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                          {item.chips.map((chip) => (
                            <li key={chip}>
                              <Chip variant="surface" mono size="sm">
                                {chip}
                              </Chip>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {item.link ? (
                        <ArrowLink
                          href={item.link.href}
                          external={isExternal(item.link.href)}
                          tabIndex={isOpen ? 0 : -1}
                          {...(destinationForHref(item.link.href)
                            ? phAttrs("faq", destinationForHref(item.link.href)!)
                            : {})}
                        >
                          {item.link.label}
                        </ArrowLink>
                      ) : null}
                    </div>
                  )}
                </m.div>
              </m.div>
            </li>
          );
        })}
      </ul>
    </LazyMotionConfig>
  );
}
