/**
 * A small markdown renderer for the transcript: the report and the pre-written replies.
 *
 * Covers what the agent's answers use: paragraphs (blank lines), `**bold**`, `*italic*`, `` `code` ``,
 * `- ` / `* ` bullet lists, `1. ` numbered lists and `#` headings (drawn as bold lines). Indented lines
 * under a list item belong to it (detail lines, or a nested bullet list), and a numbered list split by
 * blank lines keeps counting from the number written (`<ol start>`). It is safe
 * on a half-streamed string: an unclosed `**` or `*` styles the rest of the text instead of showing
 * the markers, and a lone list or heading marker is held back, so nothing flickers as words arrive.
 * (react-markdown would add the whole unified pipeline to the island for this.)
 */
import { Fragment, type ReactNode } from "react";

const BULLET = /^\s*[-*]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;
const HEADING = /^#{1,6}\s+/;
/** A list or heading marker with no text yet (mid-stream), held back so `###` never shows raw. */
const BARE_MARKER = /^\s*(?:[-*]|\d+[.)]|#{1,6})\s*$/;

/**
 * Inline spans: **bold**, *italic*, `code`. Unclosed markers run to the end. Underscores are always
 * text, so creator handles such as @_skinbyana or @glow_with_maya read as written.
 */
function inline(text: string, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let n = 0;
  while (rest.length) {
    const m = /(\*\*|\*|`)/.exec(rest);
    if (!m) {
      out.push(rest);
      break;
    }
    const marker = m[1];
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const after = rest.slice(m.index + marker.length);
    const close = after.indexOf(marker);
    const body = close < 0 ? after : after.slice(0, close);
    const k = `${key}-${n++}`;
    if (marker === "`") out.push(<code key={k} className="rounded-[4px] bg-surface px-1 font-mono text-[12.5px] text-ink">{body}</code>);
    else if (marker === "**") out.push(<strong key={k} className="font-semibold text-ink">{inline(body, k)}</strong>);
    else out.push(<em key={k}>{inline(body, k)}</em>);
    rest = close < 0 ? "" : after.slice(close + marker.length);
  }
  return out;
}

/** A list item: its own line and the indented lines under it. */
type Item = { text: string; sub: string[] };
type Segment = { kind: "ul" | "ol" | "h" | "p"; lines: string[]; items: Item[] };

const INDENTED = /^\s{2,}\S/;

const kindOf = (l: string): Segment["kind"] =>
  BULLET.test(l) ? "ul" : NUMBERED.test(l) ? "ol" : HEADING.test(l) ? "h" : "p";

/** Blocks split on blank lines, then into runs of list items, headings and paragraph lines. */
function segments(markdown: string): Segment[] {
  const out: Segment[] = [];
  for (const block of markdown.trim().split(/\n{2,}/)) {
    let current: Segment | null = null;
    for (const l of block.split("\n")) {
      if (!l.trim() || BARE_MARKER.test(l)) continue;
      const last = current?.items[current.items.length - 1];
      if (last && INDENTED.test(l)) {
        last.sub.push(l.trim());
        continue;
      }
      const kind = kindOf(l);
      if (!current || current.kind !== kind || kind === "h") {
        current = { kind, lines: [], items: [] };
        out.push(current);
      }
      current.lines.push(l);
      if (kind === "ul" || kind === "ol") current.items.push({ text: l.replace(kind === "ul" ? BULLET : NUMBERED, ""), sub: [] });
    }
  }
  return out;
}

/** The indented lines under a list item: detail lines, with runs of bullets as a nested list. */
function subLines(lines: string[], key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    const k = `${key}-u${out.length}`;
    out.push(
      <ul key={k} className="mt-1 flex list-disc flex-col gap-1 pl-[18px] marker:text-muted">
        {bullets.map((b, j) => (
          <li key={j}>{inline(b.replace(BULLET, ""), `${k}.${j}`)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  lines.forEach((l, j) => {
    if (BULLET.test(l)) {
      bullets.push(l);
      return;
    }
    flush();
    out.push(
      <span key={`${key}-${j}`} className="block">
        {inline(l, `${key}-${j}`)}
      </span>,
    );
  });
  flush();
  return out;
}

function ListItem({ item, k }: { item: Item; k: string }) {
  return (
    <li>
      {inline(item.text, k)}
      {item.sub.length ? subLines(item.sub, k) : null}
    </li>
  );
}

/** Renders `markdown` as transcript blocks. */
export function Markdown({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <div className={className}>
      {segments(markdown).map((seg, i) => {
        if (seg.kind === "ul") {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1 pl-[18px] marker:text-muted">
              {seg.items.map((item, j) => (
                <ListItem key={j} item={item} k={`${i}.${j}`} />
              ))}
            </ul>
          );
        }
        if (seg.kind === "ol") {
          return (
            <ol
              key={i}
              start={Number(/\d+/.exec(seg.lines[0])?.[0] ?? 1)}
              className="flex list-decimal flex-col gap-1 pl-[20px] marker:font-mono marker:text-[12.5px] marker:text-muted"
            >
              {seg.items.map((item, j) => (
                <ListItem key={j} item={item} k={`${i}.${j}`} />
              ))}
            </ol>
          );
        }
        if (seg.kind === "h") {
          return (
            <p key={i} className="font-semibold text-ink">
              {inline(seg.lines[0].replace(HEADING, ""), String(i))}
            </p>
          );
        }
        return (
          <p key={i}>
            {seg.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 ? <br /> : null}
                {inline(l, `${i}.${j}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
