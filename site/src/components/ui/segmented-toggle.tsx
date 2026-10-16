"use client";

/**
 * SegmentedToggle — a radio group styled as a segmented control, with a paper
 * "thumb" that slides between options (motion layout animation; instant under
 * reduced motion).
 *
 *   const [billing, setBilling] = useState<"yearly" | "monthly">("yearly");
 *   <SegmentedToggle
 *     ariaLabel="Billing period"
 *     value={billing}
 *     onChange={setBilling}
 *     options={[
 *       { value: "monthly", label: "Monthly" },
 *       { value: "yearly", label: "Yearly", badge: <Badge tone="accent">−30%</Badge> },
 *     ]}
 *   />
 *
 * Keyboard: Tab focuses the selected option; Arrow keys / Home / End move and select.
 */
import { LayoutGroup, m } from "motion/react";
import { LazyMotionConfig } from "@/components/ui/lazy-motion";
import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Optional trailing element, e.g. a discount Badge. */
  badge?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedToggleProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group. */
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className,
}: SegmentedToggleProps<T>) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    const current = enabled.indexOf(options.findIndex((o) => o.value === value));
    let next: number | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = enabled[(current + 1) % enabled.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = enabled[(current - 1 + enabled.length) % enabled.length];
    else if (e.key === "Home") next = enabled[0];
    else if (e.key === "End") next = enabled[enabled.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <LazyMotionConfig>
      <LayoutGroup id={id}>
        <div
          role="radiogroup"
          aria-label={ariaLabel}
          onKeyDown={onKeyDown}
          className={cn("relative inline-flex items-center gap-0.5 rounded-[12px] bg-surface p-1", className)}
        >
          {options.map((opt, i) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                disabled={opt.disabled}
                onClick={() => onChange(opt.value)}
                className={cn(
                  "relative inline-flex items-center gap-2 whitespace-nowrap rounded-[9px] font-medium transition-colors duration-200 ease-out",
                  "disabled:pointer-events-none disabled:opacity-40",
                  size === "sm" ? "h-8 px-3 text-[13px]" : "h-9 px-4 text-sm",
                  selected ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {selected && (
                  <m.span
                    layoutId="thumb"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[9px] bg-paper shadow-float"
                    transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.9 }}
                  />
                )}
                <span className="relative">{opt.label}</span>
                {opt.badge && <span className="relative">{opt.badge}</span>}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </LazyMotionConfig>
  );
}
