/**
 * ArticleBody: renders a post's Markdown (GFM) with the site's typography.
 *
 *   <ArticleBody markdown={post.body} />
 *
 * remark-gfm for tables and task lists, `remarkSmartQuotes` for curly quotes (code is never
 * touched), rehype-slug for heading ids (the loader's `toc` runs the same plugins and the same
 * slugger, so ids match). Overrides:
 *   h2/h3          hover "#" anchor
 *   a              internal links via next/link, external links open in a new tab
 *   pre            CodeBlock (copy button)
 *   blockquote     PromptCard (every blockquote in these posts is a paste-ready prompt)
 *   table          scrollable card that breaks out to the full column width. It is a keyboard-reachable
 *                  named region (tab stop, arrow keys scroll it), labeled from the heading above it
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Element, ElementContent, Root } from "hast";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { RAIL_INSET } from "@/components/sections/blog/inset";
import { remarkSmartQuotes } from "@/lib/blog/smart-quotes";
import { cn } from "@/lib/cn";
import { CodeBlock, PromptCard } from "./code-block";
import "./article.css";

function hastText(node: Element | ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element") {
    const inner = node.children.map(hastText);
    // paragraphs inside a quote become separate lines
    return node.tagName === "p" ? `${inner.join("")}\n\n` : inner.join("");
  }
  return "";
}

/**
 * Names every table: "Table: <the h2/h3 above it>", numbered when two tables share a heading so the
 * regions stay unique. The label rides on the element as `data-table-label`.
 */
function rehypeTableLabels() {
  return (tree: Root) => {
    let heading = "";
    const seen = new Map<string, number>();
    for (const child of tree.children) {
      if (child.type !== "element") continue;
      if (child.tagName === "h2" || child.tagName === "h3") {
        heading = hastText(child).replace(/\s+/g, " ").trim();
      } else if (child.tagName === "table") {
        const base = heading ? `Table: ${heading}` : "Data table";
        const n = (seen.get(base) ?? 0) + 1;
        seen.set(base, n);
        child.properties = { ...child.properties, dataTableLabel: n > 1 ? `${base} (${n})` : base };
      }
    }
  };
}

function Heading({ level, id, children }: { level: 2 | 3; id?: string; children?: React.ReactNode }) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag id={id}>
      {children}
      {id && (
        <a href={`#${id}`} className="ch-anchor" aria-label="Link to this section">
          #
        </a>
      )}
    </Tag>
  );
}

const components: Components = {
  h2: ({ id, children }) => (
    <Heading level={2} id={id}>
      {children}
    </Heading>
  ),
  h3: ({ id, children }) => (
    <Heading level={3} id={id}>
      {children}
    </Heading>
  ),
  a: ({ href = "", children }) => {
    if (href.startsWith("/")) return <Link href={href}>{children}</Link>;
    if (href.startsWith("#")) return <a href={href}>{children}</a>;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <ArrowUpRight className="ml-0.5 inline size-[0.8em] -translate-y-px align-baseline opacity-55" strokeWidth={2} aria-hidden="true" />
      </a>
    );
  },
  pre: ({ node }) => {
    const code = node?.children.find((c): c is Element => c.type === "element" && c.tagName === "code");
    const text = code ? hastText(code) : "";
    const classes = (code?.properties?.className as string[] | undefined) ?? [];
    const lang = classes.find((c) => c.startsWith("language-"))?.replace("language-", "") ?? "";
    return <CodeBlock code={text} lang={lang} />;
  },
  blockquote: ({ node, children }) => (
    <PromptCard text={node ? hastText(node).trim() : ""}>{children}</PromptCard>
  ),
  table: ({ node, children }) => (
    // tabIndex 0 + role region: a scrollable area must take focus so keyboard users can scroll it.
    <div
      className="ch-table ch-wide"
      data-lenis-prevent-touch
      tabIndex={0}
      role="region"
      aria-label={String(node?.properties?.dataTableLabel ?? "Data table")}
    >
      <table>{children}</table>
    </div>
  ),
};

export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className={cn("ch-prose", RAIL_INSET)} id="article-body">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkSmartQuotes]} rehypePlugins={[rehypeSlug, rehypeTableLabels]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
