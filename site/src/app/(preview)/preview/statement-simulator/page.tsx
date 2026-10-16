import type { Metadata } from "next";
import { Rails } from "@/components/layout/rails";
import StatementSimulatorSection from "@/components/sections/statement-simulator";

export const metadata: Metadata = { title: "Preview · statement-simulator" };

export default function Preview() {
  return (
    <Rails>
      <StatementSimulatorSection />
    </Rails>
  );
}
