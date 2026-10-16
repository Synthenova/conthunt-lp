/**
 * Server only: the byte size of every hero loop, read from public/ once per
 * process (the page is static, so in practice once per build). The engine uses it
 * to keep the loops it loads before the visitor's first input inside the PLAN
 * budget (engine.ts, "Video bytes"). A file that cannot be read is left out; the
 * engine then assumes the PLAN tile ceiling for it.
 *
 * Sets 0 and 1 total about 1.48 MB, so all six of their loops fit the 1.5 MB
 * budget (set 1 ranks 2 and 3 are CRF 34 re-encodes; originals in
 * .scratch/hero-orig/). Re-check the total when a loop changes.
 */
import { statSync } from "node:fs";
import path from "node:path";
import { PROMPT_SETS } from "./data";

let cache: Record<string, number> | null = null;

export function heroVideoBytes(): Record<string, number> {
  if (cache) return cache;
  const out: Record<string, number> = {};
  for (const set of PROMPT_SETS) {
    for (const card of set.cards) {
      if (!card.video || card.video in out || !card.video.startsWith("/")) continue;
      try {
        out[card.video] = statSync(path.join(process.cwd(), "public", card.video)).size;
      } catch {
        // Unknown size: the engine falls back to its assumed size.
      }
    }
  }
  cache = out;
  return out;
}
