import type { Metadata } from "next";
import FooterSection from "@/components/sections/footer";

export const metadata: Metadata = { title: "Preview · footer" };

export default function Preview() {
  return (
    <FooterSection />
  );
}
