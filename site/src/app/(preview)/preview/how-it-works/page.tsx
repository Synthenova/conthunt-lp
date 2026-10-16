import type { Metadata } from "next";
import { Rails } from "@/components/layout/rails";
import HowItWorksSection from "@/components/sections/how-it-works";

export const metadata: Metadata = { title: "Preview · how-it-works" };

export default function Preview() {
  return (
    <Rails>
      <HowItWorksSection />
    </Rails>
  );
}
