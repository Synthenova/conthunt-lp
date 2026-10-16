import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Rails } from "@/components/layout/rails";
import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Preview · navbar" };

/** Navbar alone over tall filler, so the large → compact pill transition can be scrolled. */
export default function Preview() {
  return (
    <>
      <Navbar />
      <Placeholder sectionKey="hero" minHeight="100svh" bleed label="scroll to shrink the navbar" />
      <Rails>
        <Placeholder sectionKey="filler-1" minHeight="80vh" label="filler" />
        <Placeholder sectionKey="filler-2" minHeight="80vh" label="filler" />
      </Rails>
    </>
  );
}
