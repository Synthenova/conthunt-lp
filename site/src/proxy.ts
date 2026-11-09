import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { acceptable, wantsMarkdown } from "@/lib/llm/accept";
import { MARKDOWN_REQUEST_HEADER, htmlLinks, htmlPathFromMarkdown, isMarkdownDocument, normalizePath } from "@/lib/llm/paths";
import { CONTENT_SIGNAL } from "@/lib/llm/robots";

/**
 * Markdown for agents, HTML for everyone else.
 *
 * Next strips RSC headers before proxy sees them, so a flight request is recognised by
 * Accept: text/x-component (and by those headers when they are still present). Those requests
 * are never rewritten and never answered 406: doing either breaks client navigation.
 * Only an explicit text/markdown Ask is rewritten. Serving a different article by User-Agent is not done.
 */

const SKIP_PREFIXES = ["/preview", "/_next", "/media", "/brand", "/v1", "/api", "/ingest", "/llm-md", "/blog/plates"];
const ASSET_EXT = /\.(?:avif|css|gif|ico|jpeg|jpg|js|json|map|mjs|mp4|png|svg|txt|webm|webp|woff2?|xml)$/i;

function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isSkipped(pathname: string): boolean {
  return SKIP_PREFIXES.some((prefix) => hasPrefix(pathname, prefix)) || ASSET_EXT.test(pathname);
}

function isFlight(request: NextRequest): boolean {
  const accept = request.headers.get("accept") ?? "";
  if (accept.toLowerCase().includes("text/x-component")) return true;
  return ["rsc", "next-router-prefetch", "next-router-state-tree", "next-url"].some((name) => request.headers.has(name));
}

function rewriteMarkdown(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(MARKDOWN_REQUEST_HEADER, "1");
  // The route sees the original URL, not this rewrite target, so the page path is read there.
  const url = request.nextUrl.clone();
  url.pathname = "/llm-md";
  url.search = "";
  // nginx tells Next the public scheme is https, and the server is bound to 127.0.0.1.
  // NextURL rewrites that address to localhost, so the rewrite no longer matches the
  // internal base URL. Next then fetches https://localhost:3000, the plain HTTP server
  // rejects the TLS handshake, and the page is a 500. Pin it back to 127.0.0.1 so the
  // rewrite stays internal.
  if (url.protocol === "https:" && url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
    if (!url.port) url.port = process.env.PORT || "3000";
  }
  const response = NextResponse.rewrite(url, { request: { headers } });
  response.headers.append("Vary", "Accept");
  return response;
}

function continueHtml(htmlPath: string) {
  const response = NextResponse.next();
  response.headers.append("Vary", "Accept");
  response.headers.append("Link", htmlLinks(htmlPath));
  response.headers.set("Content-Signal", CONTENT_SIGNAL);
  return response;
}

export function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();

  const pathname = normalizePath(request.nextUrl.pathname);
  if (isSkipped(pathname)) return NextResponse.next();

  const fromMarkdown = htmlPathFromMarkdown(pathname);
  if (fromMarkdown) {
    if (!isMarkdownDocument(fromMarkdown)) return NextResponse.next();
    return rewriteMarkdown(request);
  }

  if (!isMarkdownDocument(pathname)) return NextResponse.next();
  if (isFlight(request)) return continueHtml(pathname);

  const accept = request.headers.get("accept");
  if (wantsMarkdown(accept)) return rewriteMarkdown(request);
  if (accept && accept.trim() && !acceptable(accept)) {
    return new NextResponse("Not Acceptable\n", {
      status: 406,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        Vary: "Accept",
        "Content-Signal": CONTENT_SIGNAL,
      },
    });
  }
  return continueHtml(pathname);
}

export const config = {
  // llm-md is the rewrite target. If proxy runs again there, NextResponse.next() drops the
// request header the rewrite just set, and the route 404s.
matcher: ["/((?!_next/static|_next/image|favicon.ico|ingest|media/|brand/|blog/plates/|llm-md).*)"],
};
