"use client";

/**
 * Client pieces of the page header that read the live-or-seed data: the mono status line, the
 * sentence under the headline and the facts row. All three render on the server too, from the
 * bundled snapshot, and change wording when live boards replace it (see lib/viral-now/copy.ts).
 */
import { sublineText, statusText } from "@/lib/viral-now/copy";
import { formatWhole } from "@/lib/viral-now/format";
import { PLATFORMS } from "@/lib/viral-now/glyphs";
import { PlatformGlyph } from "./parts";
import { useViralNow } from "./provider";
import styles from "./viral-now.module.css";

/** The ranking week, "Week 2 of Oct 2026" (rendered in caps); the trending feed says when it was updated. */
export function StatusLine() {
  const { board } = useViralNow();
  const text = statusText(board);
  if (!text) return null;
  return (
    <p className="eyebrow flex items-center gap-2.5 text-ink-2">
      <span className={styles.statusDot} data-kind={board.kind} aria-hidden="true" />
      {text}
    </p>
  );
}

/** The sentence under "Viral now.", true for whichever source is on screen. */
export function Subline() {
  const { board } = useViralNow();
  return <span className="text-ink-2/75">{sublineText(board)}</span>;
}

/** Video and niche counts and the platforms covered, as one quiet mono line. */
export function Facts() {
  const { niches, totalVideos, platforms } = useViralNow();
  return (
    <p className="eyebrow flex flex-wrap items-center gap-x-5 gap-y-2 text-ink-2/70">
      <span>
        <b className="font-semibold text-ink">{formatWhole(totalVideos)}</b> videos
      </span>
      <span>
        <b className="font-semibold text-ink">{niches.length}</b> niches
      </span>
      {platforms.length > 0 && (
        <span className="flex items-center gap-3">
          {platforms.map((platform) => (
            <span key={platform} className="inline-flex items-center gap-1.5">
              <PlatformGlyph platform={platform} className="size-3.5" />
              {PLATFORMS[platform].label}
            </span>
          ))}
        </span>
      )}
    </p>
  );
}
