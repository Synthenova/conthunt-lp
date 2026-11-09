/**
 * One robots group. A crawler that matches its own group ignores `*`, so every named
 * agent shares these rules. There is no `Allow: /`: first-match parsers would apply it
 * before `Disallow: /preview/` and open the previews.
 *
 * Content-Signal is a preference inside the group, not a block. Unknown lines are ignored
 * by crawlers that follow RFC 9309, which is the outcome we want: allow the fetch.
 */
import { SITE_URL } from "../links.ts";

export const CONTENT_SIGNAL = "search=yes, ai-input=yes, ai-train=yes";

export const MARKDOWN_MEDIA_TYPE = "text/markdown; charset=utf-8";

export const LLM_CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

const USER_AGENTS = [
  "*",
  "PerplexityBot",
  "Perplexity-User",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "Googlebot",
  "Google-Extended",
  "bingbot",
  "Applebot",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
] as const;

export function robotsTxt(siteUrl: string = SITE_URL): string {
  const origin = siteUrl.replace(/\/+$/, "");
  return [
    ...USER_AGENTS.map((agent) => `User-agent: ${agent}`),
    `Content-Signal: ${CONTENT_SIGNAL}`,
    "Disallow: /preview/",
    "Disallow: /llm-md",
    "",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}
