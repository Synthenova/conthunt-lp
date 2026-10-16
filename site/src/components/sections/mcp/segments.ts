/**
 * Line-breaking helper for the MCP section's code.
 *
 * Chrome offers a break opportunity between two adjacent `white-space: nowrap` spans, so
 * per-token nowrap still lets `"<youtube-url>"` and its trailing comma land on separate
 * lines. Instead, tokens are split at whitespace and every run between spaces is rendered
 * inside ONE nowrap span (the coloured token spans sit inside it). Lines then wrap only at
 * spaces, plus after any token flagged `breakAfter` (e.g. the "(" after a tool name).
 *
 * A token flagged `glueBefore` (a CLI flag such as `--json`) pulls the space in front of it
 * into the previous run, so the flag never ends up alone on a line.
 *
 *   const runs = toRuns(tokens);
 *   runs.map((r) => r.space ? r.toks[0].text : <span className="whitespace-nowrap">…</span>)
 */

export interface CodeToken {
  text: string;
  cls: string;
  /** Character offset in the whole block (drives the decode sweep). */
  at: number;
  /** Allow a line break right after this token. */
  breakAfter?: boolean;
  /** Never break before this token: it stays on the line of the word in front of it. */
  glueBefore?: boolean;
}

export interface Run {
  /** A whitespace run (a break opportunity) rather than unbreakable text. */
  space: boolean;
  toks: CodeToken[];
  /** Render a <wbr> after this run. */
  breakAfter: boolean;
}

/** Splits tokens at whitespace (offsets preserved) and groups the pieces into runs. Pure. */
export function toRuns(tokens: CodeToken[]): Run[] {
  const runs: Run[] = [];
  let cur: Run | null = null;
  /** The previous unbreakable run, while only whitespace has followed it. */
  let last: Run | null = null;
  for (const t of tokens) {
    let at = t.at;
    const pieces = t.text.split(/(\s+)/).filter(Boolean);
    for (let i = 0; i < pieces.length; i++) {
      const text = pieces[i];
      const piece: CodeToken = { text, cls: t.cls, at, breakAfter: i === pieces.length - 1 && t.breakAfter };
      at += text.length;
      if (/^\s+$/.test(text)) {
        runs.push({ space: true, toks: [piece], breakAfter: false });
        cur = null;
        continue;
      }
      // Glue: fold the preceding space run back into the previous run and continue it.
      if (!cur && i === 0 && t.glueBefore && last && !last.breakAfter) {
        const prev = runs[runs.length - 1];
        if (prev?.space && runs[runs.length - 2] === last) {
          runs.pop();
          last.toks.push(...prev.toks);
          cur = last;
        }
      }
      if (!cur) {
        cur = { space: false, toks: [], breakAfter: false };
        runs.push(cur);
      }
      cur.toks.push(piece);
      last = cur;
      if (piece.breakAfter) {
        cur.breakAfter = true;
        cur = null;
      }
    }
  }
  return runs;
}
