/**
 * The giant statement (section 1.5, ref G1o2H).
 *
 * The owner's sentence (2026-10-16, "Giant Text Section modification"), word for word:
 * "Stop scrolling to find ideas. Conthunt watches up to 500 videos from your niche in under five
 * minutes, checks every frame and hands you what works." Two adjustments only: the brand is spelled
 * "ContHunt" as everywhere else on the site, and "500" is `{videos}`, the video budget read from the
 * simulator data (the designed run took 4m 12s, which backs "under five minutes"). The first
 * sentence is still the retained legacy line from `src/content/site/statement.ts`.
 * 26 words, 5 chips, one Boska italic (*works.*).
 *
 * The copy is authored as five ragged-centre lines (5-6 words each, as in G1o2H). On desktop the
 * lines are fixed, so the scroll-jack can Flip whole lines from the centred statement into the
 * left-aligned headline without words crossing; on phones they wrap naturally.
 *
 * Fit budget (desktop, `.line` is nowrap and centred in the letterbox, measured in em of the
 * statement font): line 2 is the widest at 15.08em. `--stmt-desk` in scene.module.css keeps the
 * letterbox at 15.58em or more (5.1vw / 3.85vw), so line 2 has at least 3% slack. A chip adds about
 * 1.5em, so line 2 carries none; chip 3 sits on line 1 instead (13.86em). Adding a word or chip to
 * line 2 would overflow; re-measure (every other line is under 13.9em) before lengthening it.
 */
import { data as legacy } from "@/content/site/statement";

export type StatementToken =
  | { kind: "word"; text: string; italic?: boolean }
  | { kind: "chip"; n: number };

const [stop, scrolling, to, find, ideas] = legacy.words;

const TEMPLATE = [
  `${stop} ${scrolling} [4] ${to} ${find} [3] ${ideas}`,
  "ContHunt watches up to {videos} videos",
  "from your niche [2] in under five",
  "minutes, checks every frame [6]",
  "and hands you [1] what *works.*",
].join(" | ");

function parse(part: string): StatementToken {
  const chip = /^\[(\d+)\]$/.exec(part);
  if (chip) return { kind: "chip", n: Number(chip[1]) };
  const italic = /^\*(.+)\*$/.exec(part);
  if (italic) return { kind: "word", text: italic[1], italic: true };
  return { kind: "word", text: part };
}

/** The statement as lines of tokens. */
export function buildStatement(videos: number): StatementToken[][] {
  return TEMPLATE.replace("{videos}", String(videos))
    .split("|")
    .map((line) => line.trim().split(/\s+/).filter(Boolean).map(parse));
}

/** Plain text for screen readers. */
export function statementText(lines: StatementToken[][]): string {
  return lines
    .flat()
    .filter((t): t is Extract<StatementToken, { kind: "word" }> => t.kind === "word")
    .map((t) => t.text)
    .join(" ");
}
