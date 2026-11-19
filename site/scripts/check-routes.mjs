#!/usr/bin/env node
/**
 * Route check for the combined container (nginx in front, the Next site behind it).
 *
 *   node site/scripts/check-routes.mjs <baseUrl> [--redirects-only] [--root <repo dir>]
 *   node site/scripts/check-routes.mjs http://127.0.0.1:8080
 *   node site/scripts/check-routes.mjs https://preview---conthunt-lp-xxxx.a.run.app
 *
 * Needs Node 18+ (global fetch) and no dependencies. Exit code 0 when every check passes, 1 otherwise.
 * Expectations come from `nginx.conf` and `site/content/blog/` under the repo root: two folders above this
 * script, or `--root`, which lets scripts/promote.sh check a deployed commit's own files.
 *
 * What it checks, in order:
 *  redirects every exact-match `return 301/302/410` location in nginx.conf (status and Location path+query),
 *            so a new short link is covered without editing this script. --redirects-only stops here.
 *  pages     `/` is the revamp (marker below), /pricing, /resources, one Resources article, three /blog
 *            articles, and the sitemap lists exactly the posts in site/content/blog
 *  legacy    /privacy, /terms, /docs, both integration pages, /.well-known/skills/index.json and SKILL.md
 *            with their content types
 *  feeds     /rss.xml, /robots.txt, /llms.txt, /sitemap.xml, and every URL inside the sitemap answers 200
 *  assets    /og-default.jpg, one /media/* file, one /_next/static/* file, /ingest/ and /v1/... (not 5xx)
 *  errors    /preview/hero and an unknown path answer 404
 *
 * Redirects are never followed. Absolute URLs in the sitemap and in Location headers are compared by
 * path, so the same run works against localhost, a Cloud Run preview tag and production.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const { values: opts, positionals } = parseArgs({
  allowPositionals: true,
  options: { "redirects-only": { type: "boolean", default: false }, root: { type: "string" } },
});
const base = (positionals[0] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("usage: node site/scripts/check-routes.mjs <baseUrl> [--redirects-only] [--root <repo dir>]");
  process.exit(2);
}

const root = opts.root ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const nginxConf = readFileSync(join(root, "nginx.conf"), "utf8");

const REVAMP_MARKER = 'data-section="hero"';
const LEGACY_MARKER = "glass-nav";
const TIMEOUT_MS = 30_000;

const CONCURRENCY = 16;

/** One slot per request; a finishing request hands its slot straight to the next waiter. */
function limiter(size) {
  let active = 0;
  const waiting = [];
  return async (fn) => {
    if (active < size) active += 1;
    else await new Promise((resolve) => waiting.push(resolve));
    try {
      return await fn();
    } finally {
      const next = waiting.shift();
      if (next) next();
      else active -= 1;
    }
  };
}
const limit = limiter(CONCURRENCY);

// Checks run concurrently but print in the order they were queued: each entry is a promise of lines.
const queued = [];
const emit = (lines) => queued.push(Promise.resolve(lines).then((l) => [l].flat()));
const say = (text) => emit({ text });
const result = (ok, label, detail = "") => ({ ok, label, detail });
const message = (error) => (error instanceof Error ? error.message : String(error));

/** Runs fn (which returns [ok, detail]) in a request slot; a thrown error is a failure of that label. */
function probe(label, fn) {
  return limit(async () => {
    try {
      const [ok, detail = ""] = await fn();
      return result(ok, label, detail);
    } catch (error) {
      return result(false, label, message(error));
    }
  });
}

async function get(path, init = {}) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(TIMEOUT_MS), ...init });
  return res;
}

function check(label, path, { status = 200, type, includes, excludes, minBytes, headerIncludes, notServerError = false, init } = {}) {
  return probe(`${label} ${path}`, async () => {
    const res = await get(path, init);
    const body = includes || excludes || minBytes ? await res.text() : await res.arrayBuffer().then(() => "");
    const problems = [];
    if (notServerError ? res.status >= 500 : res.status !== status) problems.push(`status ${res.status}`);
    const contentType = res.headers.get("content-type") ?? "";
    if (type && !contentType.toLowerCase().includes(type)) problems.push(`content-type "${contentType}"`);
    if (includes && !body.includes(includes)) problems.push(`missing ${JSON.stringify(includes)}`);
    if (excludes && body.includes(excludes)) problems.push(`unexpected ${JSON.stringify(excludes)}`);
    if (minBytes && body.length < minBytes) problems.push(`only ${body.length} bytes`);
    if (headerIncludes) {
      const [name, needle] = headerIncludes;
      const value = res.headers.get(name) ?? "";
      if (!value.toLowerCase().includes(String(needle).toLowerCase())) {
        problems.push(`header ${name} "${value}" missing ${JSON.stringify(needle)}`);
      }
    }
    return [problems.length === 0, problems.join(", ")];
  });
}

async function text(path) {
  const res = await get(path);
  return { res, body: await res.text() };
}

async function finish() {
  let passed = 0;
  const failures = [];
  for (const lines of queued) {
    for (const line of await lines) {
      if ("text" in line) {
        console.log(line.text);
        continue;
      }
      const { ok, label, detail } = line;
      if (ok) passed += 1;
      else failures.push(`${label}${detail ? `  (${detail})` : ""}`);
      console.log(`${ok ? "ok  " : "FAIL"} ${label}${!ok && detail ? `  (${detail})` : ""}`);
    }
  }
  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log("\nfailures:");
    for (const line of failures) console.log(` - ${line}`);
  }
  process.exit(failures.length ? 1 : 0);
}

/** The post URLs the site must list, from the files the Next loader reads (src/lib/blog/posts.ts). */
function contentPostPaths() {
  const dir = join(root, "site", "content", "blog");
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md")
    .map((file) => {
      const frontmatter = readFileSync(join(dir, file), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
      const section = frontmatter.match(/^section:\s*["']?(\w+)/m)?.[1] ?? "resources";
      return `/${section === "blog" ? "blog" : "resources"}/${file.slice(0, -3)}`;
    });
}

const pathOf = (url) => {
  try {
    const parsed = new URL(url, "http://x");
    return parsed.pathname + parsed.search;
  } catch {
    return url;
  }
};

/* ---------------------------------------------------------------- redirects */
say("\n# redirects (parsed from nginx.conf)");
const rules = new Map();
const ruleRe = /location\s*=\s*(\/\S*)\s*\{\s*return\s+(301|302|410)(?:\s+(\S+?))?\s*;/g;
for (const m of nginxConf.matchAll(ruleRe)) {
  const [, from, code, target] = m;
  rules.set(from, { code: Number(code), target: target ? pathOf(target.replace("$host", "x")) : null });
}
if (rules.size === 0) emit(result(false, "parsed redirect rules from nginx.conf", "none found"));
const counts = { 301: 0, 302: 0, 410: 0 };
const redirectChecks = [...rules].map(([from, { code, target }]) =>
  limit(async () => {
    try {
      const res = await get(from);
      await res.arrayBuffer();
      const location = res.headers.get("location");
      const ok = res.status === code && (code === 410 || (location && pathOf(location) === target));
      counts[code] += 1;
      return result(ok, `${code} ${from}${target ? ` -> ${target}` : ""}`, ok ? "" : `got ${res.status}${location ? ` -> ${location}` : ""}`);
    } catch (error) {
      return result(false, `${code} ${from}`, message(error));
    }
  }),
);
for (const c of redirectChecks) emit(c);
emit(Promise.all(redirectChecks).then(() => ({ text: `(${counts[301]} permanent, ${counts[302]} temporary, ${counts[410]} gone)` })));
if (opts["redirects-only"]) await finish();

/* ---------------------------------------------------------------- sitemap (read first: feeds the page checks) */
let sitemapPaths = [];
try {
  const { body } = await text("/sitemap.xml");
  sitemapPaths = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => pathOf(m[1]));
} catch (error) {
  say(`note: could not read /sitemap.xml (${message(error)})`);
}
const sitemapSet = new Set(sitemapPaths);
const firstOf = (re, fallback) => sitemapPaths.find((p) => re.test(p)) ?? fallback;

/* ---------------------------------------------------------------- pages */
say("\n# pages");
emit(check("revamp home", "/", { type: "text/html", includes: REVAMP_MARKER, excludes: LEGACY_MARKER }));
emit(check("page", "/pricing", { type: "text/html" }));
emit(check("page", "/resources", { type: "text/html" }));
emit(check("article", firstOf(/^\/resources\/[^/]+$/, "/resources/how-deep-search-works"), { type: "text/html", includes: 'data-section="article"', excludes: LEGACY_MARKER }));
const posts = sitemapPaths.filter((p) => /^\/blog\/[a-z0-9-]+$/.test(p));
{
  const expected = new Set(contentPostPaths());
  const listed = new Set(sitemapPaths.filter((p) => /^\/(blog|resources)\/[a-z0-9-]+$/.test(p)));
  const missing = [...expected].filter((p) => !listed.has(p));
  const extra = [...listed].filter((p) => !expected.has(p));
  emit(result(
    missing.length === 0 && extra.length === 0,
    `sitemap lists the ${expected.size} posts in site/content/blog`,
    [missing.length && `missing ${missing.join(" ")}`, extra.length && `unexpected ${extra.join(" ")}`].filter(Boolean).join("; "),
  ));
}
emit(result(!sitemapSet.has("/blog"), "sitemap omits the /blog index"));
emit(result(!sitemapPaths.some((p) => p.includes(".md")), "sitemap omits markdown URLs"));
for (const post of posts.slice(0, 3)) {
  emit(check("blog article", post, { type: "text/html", includes: 'data-section="article"', excludes: LEGACY_MARKER }));
}

{
  // A post trailing slash is one hop to the canonical path. /blog/ itself is an exact 301 to /resources.
  const sample = posts[0];
  if (!sample) emit(result(false, "301 trailing slash on a blog post", "no post"));
  else {
    emit(probe(`301 ${sample}/ -> ${sample}`, async () => {
      const res = await get(`${sample}/`);
      await res.arrayBuffer();
      return [res.status === 301 && pathOf(res.headers.get("location") ?? "") === sample, `got ${res.status}`];
    }));
  }
}

// The legacy blog is only reachable from the new site through a footer link; keep it crawlable.
emit(probe("home page links to /blog", async () => [/href="[^"]*\/blog"/.test((await text("/")).body)]));

/* ---------------------------------------------------------------- legacy pages */
say("\n# legacy pages");
emit(check("legacy", "/privacy", { type: "text/html" }));
emit(check("legacy", "/terms", { type: "text/html" }));
emit(check("legacy", "/docs", { type: "text/html" }));
emit(check("legacy", "/docs/integrations/mcp", { type: "text/html" }));
emit(check("legacy", "/docs/integrations/skill", { type: "text/html" }));
emit(check("skills index", "/.well-known/skills/index.json", { type: "application/json", includes: '"skills"' }));
emit(check("skill file", "/.well-known/skills/conthunt/SKILL.md", { type: "text/markdown", includes: "name:" }));

/* ---------------------------------------------------------------- feeds */
say("\n# feeds and sitemap");
emit(check("rss", "/rss.xml", { type: "xml", includes: "<rss" }));
emit(check("robots", "/robots.txt", { type: "text/plain", includes: "Sitemap:" }));
emit(check("robots signal", "/robots.txt", { type: "text/plain", includes: "Content-Signal: search=yes, ai-input=yes, ai-train=yes" }));
emit(check("robots preview", "/robots.txt", { type: "text/plain", includes: "Disallow: /preview/" }));
emit(check("robots internal", "/robots.txt", { type: "text/plain", includes: "Disallow: /llm-md" }));
emit(check("robots no allow-all", "/robots.txt", { type: "text/plain", excludes: "Allow: /" }));
emit(check("llms", "/llms.txt", { type: "text/markdown", minBytes: 100, includes: "/pricing.md" }));
emit(check("llms-full", "/llms-full.txt", { type: "text/markdown", minBytes: 5000, includes: "Canonical:" }));
emit(check("home markdown", "/index.md", { type: "text/markdown", includes: "Canonical:" }));
emit(check("pricing markdown", "/pricing.md", { type: "text/markdown", includes: "Pro", headerIncludes: ["link", "canonical"] }));
emit(check("article markdown", `${firstOf(/^\/resources\/[^/]+$/, "/resources/how-deep-search-works")}.md`, {
  type: "text/markdown",
  includes: "Canonical:",
}));
emit(check("accept markdown", "/pricing", {
  type: "text/markdown",
  includes: "Canonical:",
  init: { headers: { Accept: "text/markdown" } },
}));
emit(check("accept html", "/pricing", {
  type: "text/html",
  headerIncludes: ["link", "text/markdown"],
  init: { headers: { Accept: "text/html" } },
}));
emit(check("browser accept stays html", "/pricing", {
  type: "text/html",
  init: { headers: { Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" } },
}));
emit(check("json accept", "/pricing", { status: 406, init: { headers: { Accept: "application/json" } } }));
// Next itself may answer 307 to add ?_rsc. The failure is a 406 from our Accept check.
emit(probe("rsc accept is not refused", async () => {
  const res = await get("/pricing", { headers: { Accept: "text/x-component", RSC: "1" } });
  await res.arrayBuffer();
  return [res.status !== 406 && res.status < 500, `status ${res.status}`];
}));
emit(check("llm-md hidden", "/llm-md", { status: 404 }));
emit(check("llm-md query hidden", "/llm-md?path=/pricing", { status: 404 }));
emit(check("sitemap", "/sitemap.xml", { type: "xml", includes: "<urlset" }));
if (sitemapPaths.length === 0) emit(result(false, "sitemap lists URLs"));
else {
  const must = ["/", "/pricing", "/resources", "/docs", "/privacy", "/terms"];
  for (const p of must) emit(result(sitemapSet.has(p === "/" ? "/" : p), `sitemap lists ${p}`));
  say(`(checking ${sitemapPaths.length} sitemap URLs)`);
  const urlChecks = sitemapPaths.map((p) =>
    probe(`sitemap URL ${p}`, async () => {
      const res = await get(p || "/");
      await res.arrayBuffer();
      return [res.status === 200, `status ${res.status}`];
    }),
  );
  emit(Promise.all(urlChecks).then((results) => {
    const bad = results.filter((r) => !r.ok);
    return [...bad, result(bad.length === 0, `all ${sitemapPaths.length} sitemap URLs answer 200`, `${bad.length} did not`)];
  }));
}

/* ---------------------------------------------------------------- assets */
say("\n# assets and proxies");
emit(check("share image", "/og-default.jpg", { type: "image/jpeg", minBytes: 1 }));
emit(check("media", "/media/hero/0/1.webp", { type: "image/webp" }));
emit(check("blog plate", "/blog/plates/_index-800.webp", { type: "image/webp" }));
emit(check("brand", "/brand/wordmark-ink.png", { type: "image/png" }));
emit(check("legacy css", "/assets/css/style.css", { type: "text/css", minBytes: 1 }));
emit(check("legacy public file", "/public/banner.png", { type: "image/png" }));
emit(
  limit(() => text("/"))
    .then(({ body }) => {
      const asset = body.match(/\/_next\/static\/[^"'\s)\\]+\.(?:css|js)/)?.[0];
      return asset ? check("next static", asset, { type: "", minBytes: 1 }) : result(false, "next static asset found in the home page");
    })
    .catch((error) => result(false, "next static asset found in the home page", message(error))),
);
emit(check("posthog proxy", "/ingest/", { notServerError: true }));
emit(check("posthog proxy", "/ingest/static/array.js", { notServerError: true }));
emit(check("backend proxy", "/v1/trending/niches", { notServerError: true }));
emit(check("backend proxy", "/v1/public-boards/search?q=viral-now&limit=1", { notServerError: true }));

/* ---------------------------------------------------------------- errors */
say("\n# errors");
emit(check("preview is hidden", "/preview/hero", { status: 404 }));
emit(check("unknown path", "/this-page-does-not-exist", { status: 404 }));
emit(check("unknown blog path", "/blog/this-post-does-not-exist", { status: 404 }));
emit(check("about", "/about", { status: 200 }));
emit(check("authors", "/authors", { status: 200 }));
emit(check("editorial", "/editorial", { status: 200 }));
// On conthunt.app, Cloudflare routes /v1/* to the backend before Cloud Run sees it (the backend marks its
// responses with x-conthunt-api-timing-id). There it must demand credentials. From the container itself,
// only the public read routes are rewritten and the rest of /v1 answers 404.
emit(probe("backend API is not open beyond the public read routes /v1/chats", async () => {
  const res = await get("/v1/chats");
  await res.arrayBuffer();
  const fromBackend = res.headers.has("x-conthunt-api-timing-id");
  const expected = fromBackend ? 401 : 404;
  return [res.status === expected, `status ${res.status}, expected ${expected} ${fromBackend ? "from the edge-routed backend" : "from the container"}`];
}));

await finish();
