/**
 * Placeholder — temporary stand-in used by section/page stubs until their
 * owning agent replaces them. Renders a labelled, dashed block at a sensible
 * height so the page renders end to end. Delete usages, not this file.
 */
import { Section } from "./section";

export function Placeholder({
  sectionKey,
  minHeight = "70vh",
  bleed = false,
  label,
}: {
  sectionKey: string;
  minHeight?: string;
  /** Full-bleed (hero) instead of letterboxed. */
  bleed?: boolean;
  label?: string;
}) {
  return (
    <Section sectionKey={sectionKey} letterbox={!bleed} padding={bleed ? "none" : "default"}>
      <div
        className="flex items-center justify-center rounded-card border border-dashed border-hairline bg-paper/40"
        style={{ minHeight }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.04em] text-muted">{label ?? `${sectionKey} — pending`}</p>
      </div>
    </Section>
  );
}
