import "server-only";
/**
 * Blog loader. Reads `content/blog/*.md` (README.md is not a post), validates the
 * frontmatter, joins each post with its cover from `blog-covers.json`, replaces
 * `{{GET_STARTED_URL}}`, and extracts the table of contents.
 *
 *   getAllPosts()            newest first
 *   getFeaturedPosts()       the `featured` posts by `featuredOrder`
 *   getPost(slug)            full post (body + toc) or null
 *   getPostSlugs()           for generateStaticParams
 *   getRelatedPosts(slug, n) same category first, then newest
 *   getCategoryCounts()      [{ category, count }] in CATEGORIES order
 *
 * Results are memoized for the life of the server process. In dev, the memo is
 * dropped whenever a post file changes (mtime check), so edits show on reload.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";
import type { Root } from "mdast";
import { toString as nodeText } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { GET_STARTED_URL } from "@/lib/links";
import { getCover } from "./covers";
import { remarkSmartQuotes, smarten } from "./smart-quotes";
import { CATEGORIES, type Post, type PostCategory, type PostSummary, type TocItem } from "./types";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function toIsoDate(value: unknown, file: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  throw new Error(`[blog] ${file}: "date" must be an ISO date`);
}

function requireString(data: Record<string, unknown>, key: string, file: string): string {
  const v = data[key];
  if (typeof v !== "string" || !v.trim()) throw new Error(`[blog] ${file}: missing "${key}"`);
  return v;
}

/**
 * Heading ids must match what rehype-slug generates in the renderer (same slugger, same order).
 * The renderer runs `remarkSmartQuotes` before rehype-slug, so the tree is smartened here too:
 * the TOC then shows the same curly quotes as the headings, and both slug the same text.
 */
export function extractToc(markdown: string): TocItem[] {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkSmartQuotes);
  const tree = processor.runSync(processor.parse(markdown)) as Root;
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  for (const node of tree.children) {
    if (node.type !== "heading") continue;
    const text = nodeText(node);
    const id = slugger.slug(text);
    if (node.depth === 2 || node.depth === 3) toc.push({ id, text, depth: node.depth });
  }
  return toc;
}

function parsePost(file: string): Post {
  const raw = readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = requireString(data, "slug", file);
  if (`${slug}.md` !== file) throw new Error(`[blog] ${file}: slug "${slug}" must equal the file name`);

  const category = requireString(data, "category", file) as PostCategory;
  if (!CATEGORIES.includes(category)) throw new Error(`[blog] ${file}: unknown category "${category}"`);

  const body = content.replaceAll("{{GET_STARTED_URL}}", GET_STARTED_URL).trim();

  return {
    slug,
    title: smarten(requireString(data, "title", file)),
    excerpt: smarten(requireString(data, "excerpt", file)),
    date: toIsoDate(data.date, file),
    category,
    readingMinutes: Number(data.readingMinutes) || Math.max(1, Math.round(body.split(/\s+/).length / 200)),
    author: typeof data.author === "string" ? data.author : "ContHunt Team",
    featured: data.featured === true,
    featuredOrder: typeof data.featuredOrder === "number" ? data.featuredOrder : null,
    cover: getCover(slug),
    body,
    toc: extractToc(body),
  };
}

let memo: { stamp: string; posts: Post[] } | null = null;

function loadAll(): Post[] {
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md");
  const stamp =
    process.env.NODE_ENV === "production"
      ? "prod"
      : files.map((f) => `${f}:${statSync(path.join(BLOG_DIR, f)).mtimeMs}`).join("|");
  if (memo && memo.stamp === stamp) return memo.posts;
  const posts = files.map(parsePost).sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));
  memo = { stamp, posts };
  return posts;
}

const summary = (p: Post): PostSummary => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  date: p.date,
  category: p.category,
  readingMinutes: p.readingMinutes,
  author: p.author,
  featured: p.featured,
  featuredOrder: p.featuredOrder,
  cover: p.cover,
});

/** Every post, newest first, without bodies. */
export function getAllPosts(): PostSummary[] {
  return loadAll().map(summary);
}

/** Featured posts by `featuredOrder` (1 to 5). */
export function getFeaturedPosts(): PostSummary[] {
  return loadAll()
    .filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
    .map(summary);
}

export function getPost(slug: string): Post | null {
  return loadAll().find((p) => p.slug === slug) ?? null;
}

export function getPostSlugs(): string[] {
  return loadAll().map((p) => p.slug);
}

/** Same-category posts first (newest first), then the rest by date. */
export function getRelatedPosts(slug: string, count = 3): PostSummary[] {
  const all = loadAll();
  const current = all.find((p) => p.slug === slug);
  const others = all.filter((p) => p.slug !== slug);
  const same = others.filter((p) => p.category === current?.category);
  const rest = others.filter((p) => p.category !== current?.category);
  return [...same, ...rest].slice(0, count).map(summary);
}

export function getCategoryCounts(): { category: PostCategory; count: number }[] {
  const all = loadAll();
  return CATEGORIES.map((category) => ({ category, count: all.filter((p) => p.category === category).length })).filter(
    (c) => c.count > 0,
  );
}
