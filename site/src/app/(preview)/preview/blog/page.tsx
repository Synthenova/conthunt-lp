import type { Metadata } from "next";
import { Rails } from "@/components/layout/rails";
import BlogSection from "@/components/sections/blog";

export const metadata: Metadata = { title: "Preview · blog" };

export default function Preview() {
  return (
    <Rails>
      <BlogSection />
    </Rails>
  );
}
