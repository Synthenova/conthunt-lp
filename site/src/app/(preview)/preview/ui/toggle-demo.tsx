"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";

export function ToggleDemo() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  return (
    <div className="flex items-center gap-4">
      <SegmentedToggle
        ariaLabel="Billing period"
        value={billing}
        onChange={setBilling}
        options={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly", badge: <Badge tone="accent">−30%</Badge> },
        ]}
      />
      <span className="font-mono text-xs text-muted">value: {billing}</span>
    </div>
  );
}
