import type { Metadata } from "next";
import { Rails } from "@/components/layout/rails";
import TestimonialsSection from "@/components/sections/testimonials";

export const metadata: Metadata = { title: "Preview · testimonials" };

export default function Preview() {
  return (
    <Rails>
      <TestimonialsSection />
    </Rails>
  );
}
