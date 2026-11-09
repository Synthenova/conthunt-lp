/**
 * Accept parsing for Markdown negotiation.
 *
 * Same words, different format, and only when the client asks. A browser Accept
 * that never names text/markdown stays HTML. `*` / `*` does not count as asking
 * for Markdown: chat fetchers send that, and they read HTML.
 */

export interface AcceptClause {
  type: string;
  q: number;
}

export function parseAccept(header: string | null | undefined): AcceptClause[] {
  if (!header || !header.trim()) return [];
  const clauses: AcceptClause[] = [];
  for (const part of header.split(",")) {
    const bits = part
      .split(";")
      .map((bit) => bit.trim())
      .filter(Boolean);
    const type = bits[0]?.toLowerCase();
    if (!type) continue;
    let q = 1;
    for (const param of bits.slice(1)) {
      const [key, value] = param.split("=").map((piece) => piece.trim());
      if (key?.toLowerCase() !== "q") continue;
      const parsed = Number(value);
      q = Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
    }
    clauses.push({ type, q });
  }
  return clauses;
}

/** Quality of `media` under RFC 9110 specificity: exact type, then type-wildcard, then star-slash-star. */
export function qualityFor(clauses: readonly AcceptClause[], media: string): number {
  const wanted = media.toLowerCase();
  const [wantedType] = wanted.split("/");
  let bestSpec = 0;
  let quality = 0;
  for (const clause of clauses) {
    let spec = 0;
    if (clause.type === wanted) spec = 3;
    else if (clause.type === `${wantedType}/*`) spec = 2;
    else if (clause.type === "*/*") spec = 1;
    if (spec > bestSpec || (spec === bestSpec && spec > 0 && clause.q > quality)) {
      bestSpec = spec;
      quality = clause.q;
    }
  }
  return bestSpec === 0 ? 0 : quality;
}

/**
 * True only when text/markdown is named with q > 0 and its quality is at least text/html.
 * An explicit q=0 on text/markdown does not ask for Markdown.
 */
export function wantsMarkdown(header: string | null | undefined): boolean {
  const clauses = parseAccept(header);
  const named = clauses.some((clause) => clause.type === "text/markdown" && clause.q > 0);
  if (!named) return false;
  const markdown = qualityFor(clauses, "text/markdown");
  return markdown > 0 && markdown >= qualityFor(clauses, "text/html");
}

/**
 * False only when the client listed Accept and refused HTML, Markdown, and XHTML,
 * with no star range that covers them. Empty Accept means star-slash-star.
 * text/x-component is a Next.js navigation, not a refusal.
 */
export function acceptable(header: string | null | undefined): boolean {
  if (!header || !header.trim()) return true;
  const clauses = parseAccept(header);
  if (clauses.some((clause) => clause.type === "text/x-component" && clause.q > 0)) return true;
  return (
    qualityFor(clauses, "text/html") > 0 ||
    qualityFor(clauses, "text/markdown") > 0 ||
    qualityFor(clauses, "application/xhtml+xml") > 0
  );
}
