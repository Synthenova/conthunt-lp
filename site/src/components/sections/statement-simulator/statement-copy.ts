/**
 * The giant statement (section 1.5, ref G1o2H).
 *
 * It opens with the retained legacy line, verbatim from `src/content/site/statement.ts`
 * ("Stop scrolling to find ideas."), then tightens the old manual-research copy into one claim
 * built from the product facts: the video budget comes from the simulator data (500), and
 * "under five minutes" is the owner's brief (the designed run took 4m 12s). 24 words, 5 chips.
 *
 * The copy is authored as five ragged-centre lines (4-6 words each, as in G1o2H). On desktop the
 * lines are fixed, so the scroll-jack can Flip whole lines from the centred statement into the
 * left-aligned headline without words crossing; on phones they wrap naturally.
 *
 * Template syntax: words separated by spaces, `[n]` = statement chip n
 * (src/content/media/statement-chips.json), `*word*` = the one Boska italic keyword,
 * `{videos}` = approved video budget, `|` = line break.
 */
import { data as legacy } from "@/content/site/statement";

export type StatementToken =
  | { kind: "word"; text: string; italic?: boolean }
  | { kind: "chip"; n: number };

const [stop, scrolling, to, find, ideas] = legacy.words;

const TEMPLATE = [
  `${stop} ${scrolling} [4] ${to} ${find} ${ideas}`,
  "ContHunt watches [3] {videos} videos",
  "from your niche [2] in under five",
  "minutes, scores every hook [6]",
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
