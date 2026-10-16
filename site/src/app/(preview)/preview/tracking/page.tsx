import type { Metadata } from "next";
import { Rails } from "@/components/layout/rails";
import TrackingSection from "@/components/sections/tracking";

export const metadata: Metadata = { title: "Preview · tracking" };

export default function Preview() {
  return (
    <Rails>
      <TrackingSection />
    </Rails>
  );
}
