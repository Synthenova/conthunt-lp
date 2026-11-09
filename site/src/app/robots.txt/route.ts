import { NextResponse } from "next/server";
import { CONTENT_SIGNAL, robotsTxt } from "@/lib/llm/robots";

export const runtime = "nodejs";

export function GET() {
  return new NextResponse(robotsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Signal": CONTENT_SIGNAL,
    },
  });
}
