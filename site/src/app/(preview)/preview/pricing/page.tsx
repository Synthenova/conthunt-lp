import type { Metadata } from "next";
import { Rails } from "@/components/layout/rails";
import PricingSection from "@/components/sections/pricing";

export const metadata: Metadata = { title: "Preview · pricing" };

export default function Preview() {
  return (
    <Rails>
      <PricingSection />
    </Rails>
  );
}
