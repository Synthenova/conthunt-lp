#!/usr/bin/env node
/**
 * Route check for the combined container (nginx in front, the Next site behind it).
 *
 *   node site/scripts/check-routes.mjs <baseUrl>
 *   node site/scripts/check-routes.mjs http://127.0.0.1:8080
 *   node site/scripts/check-routes.mjs https://preview---conthunt-lp-xxxx.a.run.app
 *
 * Needs Node 18+ (global fetch) and no dependencies. Exit code 0 when every check passes, 1 otherwise.
 * Run it from anywhere; it finds `nginx.conf` at the repo root (two folders above this script).
 *
 * What it checks, in order:
 *  pages     `/` is the revamp (marker below), /pricing, /resources, one article, /blog and three posts
 *  redirects every 301 and 410 rule parsed from nginx.conf (status and Location), plus /mcp and /skill
 *  legacy    /privacy, /terms, /docs, both integration pages, /.well-known/skills/index.json and SKILL.md
 *            with their content types
 *  feeds     /rss.xml, /robots.txt, /llms.txt, /sitemap.xml, and every URL inside the sitemap answers 200
 *  assets    /og-default.jpg, one /media/* file, one /_next/static/* file, /ingest/ and /v1/... (not 5xx)
 *  errors    /preview/hero and an unknown path answer 404
 *
 * Redirects are never followed. Absolute URLs in the sitemap and in Location headers are compared by
 * path, so the same run works against localhost, a Cloud Run preview tag and production.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("usage: node site/scripts/check-routes.mjs <baseUrl>   (for example http://127.0.0.1:8080)");
  process.exit(2);
}

const here = dirname(fileURLToPath(import.meta.url));
const nginxConf = readFileSync(join(here, "..", "..", "nginx.conf"), "utf8");

const REVAMP_MARKER = 'data-section="hero"';
const LEGACY_MARKER = "glass-nav";
const TIMEOUT_MS = 30_000;

let passed = 0;
const failures = [];

function record(ok, label, detail = "") {
  if (ok) passed += 1;
  else failures.push(`${label}${detail ? `  (${detail})` : ""}`);
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${!ok && detail ? `  (${detail})` : ""}`);
}

async function get(path, init = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS), ...init });
  return res;
}

async function check(label, path, { status = 200, type, includes, excludes, minBytes, notServerError = false, init } = {}) {
  try {
    const res = await get(path, init);
    const body = includes || excludes || minBytes ? await res.text() : await res.arrayBuffer().then(() => "");
    const problems = [];
    if (notServerError ? res.status >= 500 : res.status !== status) problems.push(`status ${res.status}`);
    const contentType = res.headers.get("content-type") ?? "";
    if (type && !contentType.toLowerCase().includes(type)) problems.push(`content-type "${contentType}"`);
    if (includes && !body.includes(includes)) problems.push(`missing ${JSON.stringify(includes)}`);
    if (excludes && body.includes(excludes)) problems.push(`unexpected ${JSON.stringify(excludes)}`);
    if (minBytes && body.length < minBytes) problems.push(`only ${body.length} bytes`);
    record(problems.length === 0, `${label} ${path}`, problems.join(", "));
    return res;
  } catch (error) {
    record(false, `${label} ${path}`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function text(path) {
  const res = await get(path);
  return { res, body: await res.text() };
}

const pathOf = (url) => {
  try {
    const parsed = new URL(url, "http://x");
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
};

/* ---------------------------------------------------------------- sitemap (read first: feeds the page checks) */
let sitemapPaths = [];
try {
  const { body } = await text("/sitemap.xml");
  sitemapPaths = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => pathOf(m[1]));
} catch (error) {
  console.log(`note: could not read /sitemap.xml (${error instanceof Error ? error.message : error})`);
}
const sitemapSet = new Set(sitemapPaths);
const firstOf = (re, fallback) => sitemapPaths.find((p) => re.test(p)) ?? fallback;

/* ---------------------------------------------------------------- pages */
console.log("\n# pages");
await check("revamp home", "/", { type: "text/html", includes: REVAMP_MARKER, excludes: LEGACY_MARKER });
await check("page", "/pricing", { type: "text/html" });
await check("page", "/resources", { type: "text/html" });
await check("article", firstOf(/^\/resources\/[^/]+$/, "/resources/how-deep-search-works"), { type: "text/html" });
await check("legacy blog index", "/blog", { type: "text/html", includes: LEGACY_MARKER });
const posts = sitemapPaths.filter((p) => /^\/blog\/[a-z0-9-]+$/.test(p)).slice(0, 3);
if (posts.length < 3) record(false, "three legacy blog posts in the sitemap", `found ${posts.length}`);
for (const post of posts) await check("legacy blog post", post, { type: "text/html", includes: LEGACY_MARKER });

/* ---------------------------------------------------------------- redirects */
console.log("\n# redirects (parsed from nginx.conf)");
const rules = new Map();
const ruleRe = /location\s*=\s*(\/\S*)\s*\{\s*return\s+(301|410)(?:\s+(\S+?))?\s*;/g;
for (const m of nginxConf.matchAll(ruleRe)) {
  const [, from, code, target] = m;
  rules.set(from, { code: Number(code), target: target ? pathOf(target.replace("$host", "x")) : null });
}
if (rules.size === 0) record(false, "parsed 301/410 rules from nginx.conf", "none found");
let redirects = 0;
let gone = 0;
for (const [from, { code, target }] of rules) {
  // The /mcp and /skill rules are listed below with their targets; every other rule is a blog rule.
  try {
    const res = await get(from);
    await res.arrayBuffer();
    const location = res.headers.get("location");
    const ok = res.status === code && (code === 410 || (location && pathOf(location) === target));
    record(ok, `${code} ${from}${code === 301 ? ` -> ${target}` : ""}`, ok ? "" : `got ${res.status}${location ? ` -> ${location}` : ""}`);
    if (code === 301) redirects += 1;
    else gone += 1;
  } catch (error) {
    record(false, `${code} ${from}`, error instanceof Error ? error.message : String(error));
  }
}
console.log(`(${redirects} redirects, ${gone} gone)`);
for (const [from, to] of [
  ["/mcp", "/docs/integrations/mcp"],
  ["/skill", "/docs/integrations/skill"],
]) {
  const res = await get(from);
  await res.arrayBuffer();
  const location = res.headers.get("location");
  record(res.status === 301 && !!location && pathOf(location) === to, `301 ${from} -> ${to}`, `got ${res.status}${location ? ` -> ${location}` : ""}`);
}
{
  // A trailing slash is normalised, not served twice.
  const res = await get("/blog/");
  await res.arrayBuffer();
  record(res.status === 301 && pathOf(res.headers.get("location") ?? "") === "/blog", "301 /blog/ -> /blog", `got ${res.status}`);
}

{
  // The legacy blog is only reachable from the new site through a footer link; keep it crawlable.
  const { body } = await text("/");
  record(/href="[^"]*\/blog"/.test(body), "home page links to /blog");
}

/* ---------------------------------------------------------------- legacy pages */
console.log("\n# legacy pages");
await check("legacy", "/privacy", { type: "text/html" });
await check("legacy", "/terms", { type: "text/html" });
await check("legacy", "/docs", { type: "text/html" });
await check("legacy", "/docs/integrations/mcp", { type: "text/html" });
await check("legacy", "/docs/integrations/skill", { type: "text/html" });
await check("skills index", "/.well-known/skills/index.json", { type: "application/json", includes: '"skills"' });
await check("skill file", "/.well-known/skills/conthunt/SKILL.md", { type: "text/markdown", includes: "name:" });

/* ---------------------------------------------------------------- feeds */
console.log("\n# feeds and sitemap");
await check("rss", "/rss.xml", { type: "xml", includes: "<rss" });
await check("robots", "/robots.txt", { type: "text/plain", includes: "Sitemap:" });
await check("llms", "/llms.txt", { type: "text/plain", minBytes: 100 });
await check("sitemap", "/sitemap.xml", { type: "xml", includes: "<urlset" });
if (sitemapPaths.length === 0) record(false, "sitemap lists URLs");
else {
  const must = ["/", "/pricing", "/resources", "/blog", "/docs", "/privacy", "/terms"];
  for (const p of must) record(sitemapSet.has(p === "/" ? "/" : p), `sitemap lists ${p}`);
  console.log(`(checking ${sitemapPaths.length} sitemap URLs)`);
  let bad = 0;
  const queue = [...sitemapPaths];
  const worker = async () => {
    for (let p = queue.shift(); p !== undefined; p = queue.shift()) {
      try {
        const res = await get(p || "/");
        await res.arrayBuffer();
        if (res.status !== 200) {
          bad += 1;
          record(false, `sitemap URL ${p}`, `status ${res.status}`);
        }
      } catch (error) {
        bad += 1;
        record(false, `sitemap URL ${p}`, error instanceof Error ? error.message : String(error));
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  record(bad === 0, `all ${sitemapPaths.length} sitemap URLs answer 200`, `${bad} did not`);
}

/* ---------------------------------------------------------------- assets */
console.log("\n# assets and proxies");
await check("share image", "/og-default.jpg", { type: "image/jpeg", minBytes: 1 });
await check("media", "/media/hero/0/1.webp", { type: "image/webp" });
await check("blog plate", "/blog/plates/_index-800.webp", { type: "image/webp" });
await check("brand", "/brand/wordmark-ink.png", { type: "image/png" });
await check("legacy css", "/assets/css/style.css", { type: "text/css", minBytes: 1 });
await check("legacy public file", "/public/banner.png", { type: "image/png" });
{
  const { body } = await text("/");
  const asset = body.match(/\/_next\/static\/[^"'\s)\\]+\.(?:css|js)/)?.[0];
  if (asset) await check("next static", asset, { type: "", minBytes: 1 });
  else record(false, "next static asset found in the home page");
}
await check("posthog proxy", "/ingest/", { notServerError: true });
await check("posthog proxy", "/ingest/static/array.js", { notServerError: true });
await check("backend proxy", "/v1/trending/niches", { notServerError: true });
await check("backend proxy", "/v1/public-boards/search?q=viral-now&limit=1", { notServerError: true });

/* ---------------------------------------------------------------- errors */
console.log("\n# errors");
await check("preview is hidden", "/preview/hero", { status: 404 });
await check("unknown path", "/this-page-does-not-exist", { status: 404 });
await check("unknown blog path", "/blog/this-post-does-not-exist", { status: 404 });
await check("not exposed", "/about", { status: 404 });
await check("not exposed", "/authors", { status: 404 });
await check("backend API is not proxied beyond the public read routes", "/v1/chats", { status: 404 });

/* ---------------------------------------------------------------- summary */
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nfailures:");
  for (const line of failures) console.log(` - ${line}`);
  process.exit(1);
}
