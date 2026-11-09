import assert from "node:assert/strict";
import test from "node:test";

import { acceptable, wantsMarkdown } from "./accept.ts";
import { htmlPathFromMarkdown, markdownPath } from "./paths.ts";
import { robotsTxt } from "./robots.ts";

const BROWSER = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

test("browser Accept stays HTML", () => {
  assert.equal(wantsMarkdown(BROWSER), false);
  assert.equal(acceptable(BROWSER), true);
});

test("explicit markdown wins over a lower html quality", () => {
  assert.equal(wantsMarkdown("text/markdown, text/html;q=0.9"), true);
  assert.equal(wantsMarkdown("text/html;q=0.9, text/markdown;q=1"), true);
});

test("html preferred over markdown stays HTML", () => {
  assert.equal(wantsMarkdown("text/html, text/markdown;q=0.8"), false);
});

test("star range and empty Accept are HTML, and acceptable", () => {
  assert.equal(wantsMarkdown("*/*"), false);
  assert.equal(wantsMarkdown(null), false);
  assert.equal(wantsMarkdown(""), false);
  assert.equal(acceptable(null), true);
  assert.equal(acceptable("*/*"), true);
});

test("markdown quality zero does not ask for markdown", () => {
  assert.equal(wantsMarkdown("text/markdown;q=0, text/html"), false);
  assert.equal(wantsMarkdown("text/markdown;q=0"), false);
  assert.equal(acceptable("text/markdown;q=0"), false);
});

test("json is not an acceptable document representation", () => {
  assert.equal(acceptable("application/json"), false);
  assert.equal(wantsMarkdown("application/json"), false);
});

test("Next flight Accept is left alone", () => {
  assert.equal(wantsMarkdown("text/x-component"), false);
  assert.equal(acceptable("text/x-component"), true);
});

test("markdown paths", () => {
  assert.equal(markdownPath("/"), "/index.md");
  assert.equal(markdownPath("/pricing"), "/pricing.md");
  assert.equal(markdownPath("/resources/how-deep-search-works"), "/resources/how-deep-search-works.md");
  assert.equal(htmlPathFromMarkdown("/index.md"), "/");
  assert.equal(htmlPathFromMarkdown("/pricing.md"), "/pricing");
  assert.equal(htmlPathFromMarkdown("/resources/how-deep-search-works.md"), "/resources/how-deep-search-works");
  assert.equal(htmlPathFromMarkdown("/foo.bar.md"), null);
  assert.equal(htmlPathFromMarkdown("/../pricing.md"), null);
  assert.equal(htmlPathFromMarkdown("/pricing"), null);
});

test("robots.txt is one group that allows training and hides previews", () => {
  const body = robotsTxt("https://conthunt.app");
  const [group, sitemap] = body.split("\n\n");
  assert.equal(group?.includes("\n\n"), false);
  assert.match(group ?? "", /Content-Signal: search=yes, ai-input=yes, ai-train=yes/);
  assert.match(group ?? "", /Disallow: \/preview\//);
  assert.match(group ?? "", /Disallow: \/llm-md/);
  assert.equal(group?.includes("Allow:"), false);
  assert.equal(sitemap, "Sitemap: https://conthunt.app/sitemap.xml\n");
  const agents = (group ?? "").split("\n").filter((line) => line.startsWith("User-agent:"));
  assert.deepEqual(agents, [
    "User-agent: *",
    "User-agent: PerplexityBot",
    "User-agent: Perplexity-User",
    "User-agent: GPTBot",
    "User-agent: OAI-SearchBot",
    "User-agent: ChatGPT-User",
    "User-agent: ClaudeBot",
    "User-agent: Claude-User",
    "User-agent: Claude-SearchBot",
    "User-agent: anthropic-ai",
    "User-agent: Googlebot",
    "User-agent: Google-Extended",
    "User-agent: bingbot",
    "User-agent: Applebot",
    "User-agent: Applebot-Extended",
    "User-agent: CCBot",
    "User-agent: Bytespider",
    "User-agent: Amazonbot",
    "User-agent: meta-externalagent",
  ]);
});
