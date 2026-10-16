/**
 * CodeBlock and PromptCard: the two special blocks inside article prose.
 *
 *  - CodeBlock: a fenced block as a light card with the language label and a copy
 *    button. Light token color only: shell comments and flags, `LABEL:` templates.
 *  - PromptCard: a Markdown blockquote. In these posts every blockquote is a prompt
 *    you can paste into ContHunt, so it renders like the app's input with a copy button.
 *
 * Both are small client islands (copy needs the clipboard); the text is passed in
 * as a plain string by the Markdown renderer.
 */
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { CopyButton } from "./copy-button";

function shellLine(line: string, key: number): ReactNode {
  if (/^\s*#/.test(line)) {
    return (
      <span key={key} className="text-ink-2/[0.72]">
        {line}
      </span>
    );
  }
  const parts = line.split(/(\s--?[a-zA-Z][\w-]*)/g);
  return (
    <span key={key}>
      {parts.map((p, i) =>
        /^\s--?[a-zA-Z]/.test(p) ? (
          <span key={i} className="text-accent">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </span>
  );
}

function templateLine(line: string, key: number): ReactNode {
  const m = /^([A-Z][A-Z0-9 /&-]*:)(.*)$/.exec(line);
  if (!m) return <span key={key}>{line}</span>;
  return (
    <span key={key}>
      <span className="font-semibold text-ink">{m[1]}</span>
      <span className="text-ink-2">{m[2]}</span>
    </span>
  );
}

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const lines = code.replace(/\n$/, "").split("\n");
  const isShell = lang === "bash" || lang === "sh" || lang === "shell";
  const isTemplate = lang === "text";
  const label = lang && lang !== "text" ? lang : "template";
  return (
    <figure className="ch-wide group/code my-[1.8em] overflow-hidden rounded-[16px] border border-hairline bg-surface">
      <figcaption className="flex items-center justify-between border-b border-hairline py-1 pl-4 pr-1.5">
        <span className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.03em] text-ink-2/75">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-ink/25" />
          {label}
        </span>
        <CopyButton text={code.replace(/\n$/, "")} label="Copy" />
      </figcaption>
      <pre tabIndex={0} className="overflow-x-auto px-5 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent font-mono text-[13.5px] leading-[1.75] tracking-normal text-ink-2 [scrollbar-width:thin]">
        <code className="grid">
          {lines.map((line, i) => (
            <span key={i} className="block min-h-[1.75em] whitespace-pre">
              {isShell ? shellLine(line, i) : isTemplate ? templateLine(line, i) : line}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

export function PromptCard({ text, children }: { text: string; children: ReactNode }) {
  return (
    <div role="group" aria-label="Prompt to try" className="group/prompt my-[1.8em] rounded-[16px] bg-surface p-1.5">
      <div className="flex items-center justify-between pb-1 pl-3.5 pr-0.5 pt-1.5">
        <span className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.03em] text-ink-2/75">
          <Sparkles className="size-3.5 text-ink" strokeWidth={1.8} aria-hidden="true" />
          Prompt to try
        </span>
        <CopyButton text={text} label="Copy" />
      </div>
      <div className="rounded-[10px] bg-paper px-4 py-3.5 text-[16px] leading-[1.6] tracking-[-0.005em] text-ink-2 [&>p]:m-0 [&>p+p]:mt-3">
        {children}
      </div>
    </div>
  );
}
