import type { Metadata } from "next";
import { Rails } from "@/components/layout/rails";
import FaqSection from "@/components/sections/faq";

export const metadata: Metadata = { title: "Preview · faq" };

export default function Preview() {
  return (
    <Rails>
      <FaqSection />
    </Rails>
  );
}
