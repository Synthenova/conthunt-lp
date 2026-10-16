import type { JsonLdNode } from "@/lib/seo/schema";

/**
 * Server component that renders one JSON-LD document as `<script type="application/ld+json">`.
 *
 * The JSON is escaped so it can never close the script element or break out of it: "<" becomes
 * the six characters backslash-u-0-0-3-c (this covers a closing script tag and an HTML comment
 * opener), and the line and paragraph separators (code points 8232 and 8233) are escaped for
 * older parsers. It ships in the server HTML, so crawlers see it without running JavaScript.
 */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

export function JsonLd({ data }: { data: JsonLdNode }) {
  const json = JSON.stringify(data)
    .replaceAll("<", "\\u003c")
    .replaceAll(LINE_SEPARATOR, "\\u2028")
    .replaceAll(PARAGRAPH_SEPARATOR, "\\u2029");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
