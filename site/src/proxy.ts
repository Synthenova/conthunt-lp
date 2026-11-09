import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { acceptable, wantsMarkdown } from "@/lib/llm/accept";
import { HTML_PATH_HEADER, MARKDOWN_REQUEST_HEADER, htmlLinks, htmlPathFromMarkdown, isMarkdownDocument, normalizePath } from "@/lib/llm/paths";
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
  const original = normalizePath(request.nextUrl.pathname);
  const htmlPath = htmlPathFromMarkdown(original) ?? original;
  headers.set(HTML_PATH_HEADER, htmlPath);
  const url = request.nextUrl.clone();
  url.pathname = "/llm-md";
  url.search = "";
  // Behind nginx the public scheme is https and Next is bound to 127.0.0.1. NextURL
  // rewrites that address to localhost, so a same-app rewrite becomes a fetch of
  // https://localhost:3000. The server is plain HTTP and the fetch 500s. Fetch it
  // over HTTP instead. That fetch's URL is /llm-md, so the page path rides in the header.
  const behindTls = url.protocol === "https:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  const destination = behindTls ? new URL(`http://127.0.0.1:${process.env.PORT || "3000"}/llm-md`) : url;
  const response = NextResponse.rewrite(destination, { request: { headers } });
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
