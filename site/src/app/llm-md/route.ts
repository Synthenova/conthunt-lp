import { NextRequest, NextResponse } from "next/server";
import { renderMarkdown } from "@/lib/llm/document";
import { MARKDOWN_REQUEST_HEADER, htmlPathFromMarkdown, isMarkdownDocument, markdownLinks, normalizePath } from "@/lib/llm/paths";
import { CONTENT_SIGNAL, LLM_CACHE_CONTROL, MARKDOWN_MEDIA_TYPE } from "@/lib/llm/robots";

export const runtime = "nodejs";

function plain(body: string, status: number) {
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Internal target for /.md and Accept: text/markdown. A direct hit without the proxy header is a 404. */
export function GET(request: NextRequest) {
  // A direct request never gets the proxy header. The rewritten request still carries the
  // browser's URL: nextUrl is /pricing.md or /pricing, not /llm-md.
  if (request.headers.get(MARKDOWN_REQUEST_HEADER) !== "1") return plain("Not found\n", 404);
  const pathname = normalizePath(request.nextUrl.pathname);
  const htmlPath = htmlPathFromMarkdown(pathname) ?? pathname;
  if (!isMarkdownDocument(htmlPath)) return plain("Not found\n", 404);
  const body = renderMarkdown(htmlPath);
  if (!body) return plain("Not found\n", 404);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": MARKDOWN_MEDIA_TYPE,
      "Cache-Control": LLM_CACHE_CONTROL,
      "Content-Signal": CONTENT_SIGNAL,
      Link: markdownLinks(htmlPath),
      Vary: "Accept",
    },
  });
}
