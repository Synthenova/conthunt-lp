import type { Metadata } from "next";
import { Rails } from "@/components/layout/rails";
import McpSection from "@/components/sections/mcp";

export const metadata: Metadata = { title: "Preview · mcp" };

export default function Preview() {
  return (
    <Rails>
      <McpSection />
    </Rails>
  );
}
