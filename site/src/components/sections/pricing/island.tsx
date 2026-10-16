"use client";

/** Stand-ins for the pricing island's client components (see components/layout/island-code.tsx). */
import { islandPart } from "@/components/layout/island-code";

export const BillingProvider = islandPart("pricing", "BillingProvider");
export const BillingToggle = islandPart("pricing", "BillingToggle");
export const PlanCards = islandPart("pricing", "PlanCards");
