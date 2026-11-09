/**
 * Path mapping between an HTML page and its Markdown twin.
 * Pure module: the proxy imports it, so it must not touch the filesystem or server-only code.
 *
 * Home is /index.md (llms.txt convention). Every other page is the path plus .md, with no trailing slash.
 * Dots in the HTML path are rejected so a request cannot escape into a file extension or a traversal.
 */
import { SITE_URL } from "../links.ts";

export const MARKDOWN_REQUEST_HEADER = "x-conthunt-markdown";

const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";
const HTML_PATH = new RegExp(`^\\/(?:${SLUG})(?:\\/${SLUG})*$`);
const ARTICLE_PATH = new RegExp(`^\\/(?:resources|blog)\\/${SLUG}$`);
const STATIC_DOCUMENTS = new Set(["/", "/pricing", "/viral-now", "/resources"]);

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

export function markdownPath(htmlPath: string): string {
  const path = normalizePath(htmlPath);
  if (path === "/" || path === "") return "/index.md";
  return `${path}.md`;
}

/** HTML path for a Markdown URL, or null when the URL is not a page twin. */
export function htmlPathFromMarkdown(pathname: string): string | null {
  const path = normalizePath(pathname);
  if (path.includes("\\") || path.includes("..") || !path.endsWith(".md")) return null;
  const stem = path.slice(0, -".md".length);
  if (stem === "/index") return "/";
  if (!HTML_PATH.test(stem)) return null;
  return stem;
}

/** Pages this Next app owns. Legacy privacy, terms, and docs stay on nginx and are not twins. */
export function isMarkdownDocument(htmlPath: string): boolean {
  return STATIC_DOCUMENTS.has(htmlPath) || ARTICLE_PATH.test(htmlPath);
}

export function absolutePageUrl(htmlPath: string): string {
  if (htmlPath === "/" || htmlPath === "") return SITE_URL;
  return `${SITE_URL}${htmlPath.startsWith("/") ? htmlPath : `/${htmlPath}`}`;
}

export function absoluteMarkdownUrl(htmlPath: string): string {
  return `${SITE_URL}${markdownPath(htmlPath)}`;
}

/** Link header for the HTML representation. */
export function htmlLinks(htmlPath: string): string {
  return `<${absoluteMarkdownUrl(htmlPath)}>; rel="alternate"; type="text/markdown", <${SITE_URL}/llms.txt>; rel="describedby"`;
}

/** Link header for the Markdown representation. Canonical stays the HTML URL. */
export function markdownLinks(htmlPath: string): string {
  const html = absolutePageUrl(htmlPath);
  return `<${html}>; rel="canonical", <${html}>; rel="alternate"; type="text/html"`;
}
