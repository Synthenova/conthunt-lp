import type { Metadata } from "next";
import { Rails } from "@/components/layout/rails";
import BentoSection from "@/components/sections/bento";

export const metadata: Metadata = { title: "Preview · bento" };

export default function Preview() {
  return (
    <Rails>
      <BentoSection />
    </Rails>
  );
}
