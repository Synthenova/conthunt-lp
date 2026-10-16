"use client";

/**
 * Text decode ("scramble → resolve") for the MCP section's code and tool names.
 *
 *   const dec = useDecode(`${tab}:${client}`, { disabled: reduced });
 *   <span>{decodeText(line, dec, offset, total)}</span>
 *
 * The hook only advances a progress value in rAF; the scramble itself is computed during
 * render from a deterministic hash (index + frame), so render stays pure. Monospace text
 * keeps its width while it decodes, so nothing reflows.
 *
 * When `key` changes, the next render already treats progress as 0, so the new text never
 * flashes in its final form before scrambling. The first key is not animated.
 */
import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#%&$01";

export interface DecodeState {
  /** 0 → 1 */
  p: number;
  /** Changes ~20 times a second so scramble glyphs flicker at a readable rate. */
  frame: number;
}

const DONE: DecodeState = { p: 1, frame: 0 };
const START: DecodeState = { p: 0, frame: 0 };

export function useDecode(key: string, opts: { duration?: number; disabled?: boolean } = {}): DecodeState {
  const { duration = 460, disabled = false } = opts;
  const [state, setState] = useState<{ key: string } & DecodeState>({ key, ...DONE });
  // The initial key never animates. Cleared (in an effect) once any decode starts, so
  // StrictMode's double effect run and a return to the initial key both still animate.
  const skip = useRef<string | null>(key);

  useEffect(() => {
    if (disabled || skip.current === key) return;
    skip.current = null;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setState({ key, p, frame: Math.floor((now - t0) / 50) });
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, duration, disabled]);

  if (disabled) return DONE;
  if (state.key !== key) return START;
  return state;
}

function hash(n: number): number {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

/**
 * Returns `text` partly scrambled for progress `p`. Characters resolve left to right with
 * jitter. `offset` and `total` place this string inside a longer block (e.g. line N of a
 * snippet) so a whole panel resolves as one sweep.
 */
export function decodeText(text: string, s: DecodeState, offset = 0, total = text.length): string {
  if (s.p >= 1) return text;
  const span = Math.max(1, total);
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === " " || c === "\n" || c === "\t") {
      out += c;
      continue;
    }
    const g = offset + i;
    const at = 0.72 * (g / span) + 0.28 * hash(g * 7 + 3);
    if (s.p >= at) out += c;
    else out += GLYPHS[Math.floor(hash(g * 31 + s.frame * 977) * GLYPHS.length)];
  }
  return out;
}
