"use client";

/**
 * Billing state shared by the plan cards, the toggle and the calculator.
 *
 *   <BillingProvider>                       // default "yearly"
 *     <BillingToggle />                      // anywhere inside
 *     <PlanCards />                          // reads the same state
 *   </BillingProvider>
 *
 * `useBilling()` works without a provider too (it falls back to a local value),
 * so a component can be dropped in on its own.
 */
import { createContext, memo, useContext, useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { capture } from "@/lib/analytics";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { cn } from "@/lib/cn";
import { MAX_YEARLY_SAVING_PCT, type Billing } from "./plans";

interface BillingContextValue {
  billing: Billing;
  setBilling: (next: Billing) => void;
}

const BillingContext = createContext<BillingContextValue | null>(null);

export function BillingProvider({
  children,
  defaultBilling = "yearly",
}: {
  children: ReactNode;
  defaultBilling?: Billing;
}) {
  const [billing, setBilling] = useState<Billing>(defaultBilling);
  const value = useMemo(() => ({ billing, setBilling }), [billing]);
  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  const ctx = useContext(BillingContext);
  const [local, setLocal] = useState<Billing>("yearly");
  return ctx ?? { billing: local, setBilling: setLocal };
}

export interface BillingToggleProps {
  className?: string;
  size?: "sm" | "md";
  /** Accessible name of the radiogroup. Give each toggle on one page a distinct name. */
  ariaLabel?: string;
  /** Where the toggle sits, so a billing change can be split on the pricing dashboard. */
  surface: "home" | "pricing" | "calculator";
}

/**
 * Yearly / Monthly segmented control with a "Save up to N%" chip computed from the plan data.
 * The shared toggle dims the inactive option with `text-muted` (3.3:1 on the surface track), so the
 * inactive label is darkened here to ink-2 at 75% (4.7:1) and still turns to ink on hover.
 */
export const BillingToggle = memo(function BillingToggle({
  className,
  size = "md",
  ariaLabel = "Billing period",
  surface,
}: BillingToggleProps) {
  const { billing, setBilling } = useBilling();
  return (
    <SegmentedToggle<Billing>
      ariaLabel={ariaLabel}
      size={size}
      className={cn(
        "[&>button[aria-checked=false]]:text-ink-2/75 [&>button[aria-checked=false]:hover]:text-ink",
        className,
      )}
      value={billing}
      onChange={(next) => {
        if (next !== billing) capture("billing_toggled", { billing: next, surface });
        setBilling(next);
      }}
      options={[
        { value: "yearly", label: "Yearly", badge: <Badge tone="neutral" className="bg-green-soft text-[11px] text-green-ink">Save up to {MAX_YEARLY_SAVING_PCT}%</Badge> },
        { value: "monthly", label: "Monthly" },
      ]}
    />
  );
});
