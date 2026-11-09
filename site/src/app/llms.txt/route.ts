import { NextResponse } from "next/server";
import { renderLlmsTxt } from "@/lib/llm/document";
import { CONTENT_SIGNAL, LLM_CACHE_CONTROL, MARKDOWN_MEDIA_TYPE } from "@/lib/llm/robots";

export const runtime = "nodejs";

export function GET() {
  return new NextResponse(renderLlmsTxt(), {
    headers: {
      "Content-Type": MARKDOWN_MEDIA_TYPE,
      "Cache-Control": LLM_CACHE_CONTROL,
      "Content-Signal": CONTENT_SIGNAL,
      Vary: "Accept",
    },
  });
}
