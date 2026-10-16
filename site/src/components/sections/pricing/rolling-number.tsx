"use client";

/**
 * RollingNumber: an odometer. Each digit is a column of 0-9 that slides with a
 * transform transition, so a price rolls digit by digit when the value changes
 * (units first, then tens). Columns are keyed by their place value, so a number
 * that gains or loses a digit keeps the shared columns in place.
 *
 *   <RollingNumber value={25} prefix="$" className="text-[56px] font-bold" />
 *   <RollingNumber value={49} prefix="-" suffix="%" />
 *
 * Screen readers get the plain number through aria-label. Reduced motion
 * shortens the transition via the global CSS rule.
 */
import { memo } from "react";
import { cn } from "@/lib/cn";
import styles from "./pricing.module.css";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export interface RollingNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Milliseconds each column takes. Default 700. */
  duration?: number;
  /** Extra delay per place value, ms. Default 70. */
  stagger?: number;
}

function RollingNumberImpl({
  value,
  prefix,
  suffix,
  className,
  duration = 700,
  stagger = 70,
}: RollingNumberProps) {
  const digits = String(Math.max(0, Math.round(value))).split("").map(Number);
  const places = digits.length;
  return (
    <span
      role="img"
      aria-label={`${prefix ?? ""}${value}${suffix ?? ""}`}
      className={cn("inline-flex items-baseline whitespace-nowrap tabular-nums", className)}
    >
      {prefix && <span aria-hidden="true">{prefix}</span>}
      {digits.map((digit, i) => {
        const place = places - 1 - i;
        return (
          <span key={place} aria-hidden="true" className={styles.digitWindow}>
            <span
              className={styles.digitColumn}
              style={{
                transform: `translate3d(0, ${-digit * 10}%, 0)`,
                transitionDuration: `${duration}ms`,
                transitionDelay: `${place * stagger}ms`,
              }}
            >
              {DIGITS.map((d) => (
                <span key={d} className={styles.digit}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix && <span aria-hidden="true">{suffix}</span>}
    </span>
  );
}

/** Memoized: it only needs to re-render when the number (or its formatting) changes. */
export const RollingNumber = memo(RollingNumberImpl);
