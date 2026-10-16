import type { Metadata } from "next";
import HeroSection from "@/components/sections/hero";

export const metadata: Metadata = { title: "Preview · hero" };

export default function Preview() {
  return (
    <HeroSection />
  );
}
