/**
 * Typographic quotes for article prose.
 *
 * The posts are written with straight ASCII quotes, which look unfinished in an 18px
 * reading column. `remarkSmartQuotes` rewrites them to curly quotes on the Markdown tree,
 * so code blocks and inline code are never touched (they are not `text` nodes), and the
 * opening/closing decision is made across inline boundaries (`**bold**"` closes, `"**bold**`
 * opens). `smarten` does the same for a plain string (titles and excerpts on cards).
 *
 * Only quotes and `...` change. Dashes are left alone on purpose.
 *
 * No dependencies: a small walker over the mdast tree, safe to import from server or client code.
 */
import type { Root, RootContent } from "mdast";

const OPENERS = /[\s([{—–‘“]/;

/** Rewrites quotes in `value`, given the character that precedes it ("" at a block start). */
function convert(value: string, prev: string): string {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    const last = out.length ? out[out.length - 1] : prev;
    if (ch === '"') {
      out += last === "" || OPENERS.test(last) ? "“" : "”";
    } else if (ch === "'") {
      const next = value[i + 1] ?? "";
      if (/\d/.test(next) && (last === "" || /\s/.test(last))) out += "’"; // '90s
      else out += last === "" || OPENERS.test(last) ? "‘" : "’";
    } else if (ch === "." && value.startsWith("...", i)) {
      out += "…";
      i += 2;
    } else {
      out += ch;
    }
  }
  return out;
}

/** Curly quotes for a standalone string, such as a post title or excerpt. */
export const smarten = (text: string): string => convert(text, "");

const BLOCKS = new Set(["paragraph", "heading", "tableCell", "tableRow", "listItem", "blockquote"]);

/** remark plugin: `unified().use(remarkSmartQuotes)`. */
export function remarkSmartQuotes() {
  return (tree: Root) => {
    let prev = "";
    const walk = (node: Root | RootContent) => {
      if (BLOCKS.has(node.type)) prev = "";
      switch (node.type) {
        case "text": {
          node.value = convert(node.value, prev);
          prev = node.value.slice(-1) || prev;
          return;
        }
        case "inlineCode":
          prev = node.value.slice(-1) || prev;
          return;
        case "break":
          prev = " ";
          return;
        case "code":
        case "html":
        case "image":
        case "imageReference":
        case "definition":
          prev = "";
          return;
        default:
          break;
      }
      if ("children" in node) for (const child of node.children as RootContent[]) walk(child);
    };
    walk(tree);
  };
}
