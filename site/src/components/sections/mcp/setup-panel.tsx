"use client";

/**
 * SetupPanel — the "One URL." code panel: Prompt / MCP / CLI tabs, a client picker on the
 * MCP tab (the app's MCP_SETUP clients), a copy button and a decode sweep whenever the
 * content changes (and once when the panel first scrolls into view).
 *
 * Height never changes: every tab, and on the MCP tab every client's snippet, is laid out
 * in one grid cell and only the active layer is visible. The cell takes the tallest
 * layer, so switching tabs or clients never reflows the page. Code soft-wraps the way the
 * app's McpSetup card does (JSON with a hanging indent; URLs and flags never break), so
 * nothing scrolls sideways.
 *
 *   <SetupPanel />                       // defaults: Prompt tab, Cursor client
 *   <SetupPanel defaultTab="mcp" defaultClient="claudeCode" />
 */
import { LayoutGroup, m } from "motion/react";
import { LazyMotionConfig } from "@/components/ui/lazy-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useInView } from "@/lib/media";
import { usePrefersReducedMotion } from "@/lib/motion";
import { CopyButton } from "./copy-button";
import { decodeText, useDecode, type DecodeState } from "./decode";
import { toRuns, type Run } from "./segments";
import {
  CLI_SNIPPET,
  DEFAULT_CLIENT,
  DOCS_URL,
  MCP_CLIENTS,
  PROMPT_SNIPPET,
  PROMPT_STEPS,
  SERVER_SPEC,
  TABS,
  type ClientKey,
  type Snippet,
  type SnippetLine,
  type TabKey,
} from "./data";

export interface SetupPanelProps {
  defaultTab?: TabKey;
  defaultClient?: ClientKey;
  className?: string;
}

const DONE: DecodeState = { p: 1, frame: 0 };

/* ------------------------------------------------------------ highlighting */

type Tok = { text: string; cls: string; glueBefore?: boolean };

/*
 * Colours (COLOR_SYSTEM.md): every visible code glyph meets 4.5:1 on the code wells. Argument keys and
 * flags are purple-ink, string values green-ink, the command name ink, the `$` prompt pink-ink.
 * Punctuation and placeholders use ink/64 (about 5.5:1 on surface); only line numbers stay faint.
 */
const isFlag = (t: string) => /^--?[a-z]/i.test(t);

function tokenizeCmd(text: string): Tok[] {
  // Lines wrap only at spaces (see toRuns), so flags, URLs and placeholders never split.
  // A flag keeps its value on its line (`--url https://…`, `-s user`); a flag with no
  // value (`--json`) stays on the line of the word before it, so it is never orphaned.
  const out: Tok[] = [];
  const re = /("[^"]*"|\s+|[^\s"]+)/g;
  let first = true;
  for (const m of text.matchAll(re)) {
    const t = m[0];
    if (/^\s+$/.test(t)) out.push({ text: t, cls: "" });
    else if (first) {
      out.push({ text: t, cls: "font-semibold text-ink" });
      first = false;
    } else if (isFlag(t)) out.push({ text: t, cls: "text-purple-ink" });
    else if (t.startsWith('"')) out.push({ text: t, cls: "text-green-ink" });
    else if (t.startsWith("<")) out.push({ text: t, cls: "text-ink/64" });
    else out.push({ text: t, cls: "text-ink-2" });
  }
  const words = out.filter((t) => t.cls !== "");
  words.forEach((t, i) => {
    if (i === 0 || !isFlag(t.text)) return;
    const next = words[i + 1];
    if (next && !isFlag(next.text)) next.glueBefore = true;
    else t.glueBefore = true;
  });
  return out;
}

function tokenizeJson(text: string): Tok[] {
  const out: Tok[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|([{}[\],:])|(\s+)|([^\s"{}[\],:]+)/g;
  for (const m of text.matchAll(re)) {
    if (m[1] && m[2]) {
      out.push({ text: m[1], cls: "text-purple-ink" });
      out.push({ text: m[2], cls: "text-ink/64" });
    } else if (m[1]) out.push({ text: m[1], cls: "text-green-ink" });
    else if (m[3]) out.push({ text: m[3], cls: "text-ink/64" });
    else out.push({ text: m[0], cls: "text-ink-2" });
  }
  return out;
}

/** Prose wraps at spaces only, so URLs stay whole. */
function tokenizeProse(text: string): Tok[] {
  return [{ text, cls: "text-ink" }];
}

/** Leading spaces of a JSON line become padding, so wrapped rows hang 2ch deeper. */
function indentOf(line: SnippetLine): number {
  return line.kind === "json" ? (/^ */.exec(line.text)?.[0].length ?? 0) : 0;
}

function lineTokens(line: SnippetLine): Tok[] {
  switch (line.kind) {
    case "cmd":
      return tokenizeCmd(line.text);
    case "json":
      return tokenizeJson(line.text.slice(indentOf(line)));
    case "note":
      return [{ text: `# ${line.text}`, cls: "text-ink/64" }];
    case "prose":
      return tokenizeProse(line.text);
    case "gap":
      return [];
  }
}

/* ------------------------------------------------------------------- code */

interface LaidToken extends Tok {
  /** Character offset inside the whole snippet (for the decode sweep). */
  at: number;
}

/** Tokenises every line and records each token's offset in the snippet. Pure. */
function layout(snippet: Snippet): { lines: { line: SnippetLine; runs: Run[] }[]; total: number } {
  const lines: { line: SnippetLine; runs: Run[] }[] = [];
  let offset = 0;
  for (const line of snippet.lines) {
    const toks: LaidToken[] = [];
    for (const t of lineTokens(line)) {
      toks.push({ ...t, at: offset });
      offset += t.text.length;
    }
    offset += 1;
    lines.push({ line, runs: toRuns(toks) });
  }
  return { lines, total: offset };
}

/**
 * The visible code is decorative (it decodes); screen readers get the final text from a
 * sibling `sr-only` copy.
 */
function CodeBlock({ snippet, dec, numbered }: { snippet: Snippet; dec: DecodeState; numbered: boolean }) {
  const rendered = useMemo(() => layout(snippet), [snippet]);

  return (
    <>
      <div className="sr-only">
        {snippet.lines.map((l, i) => (l.kind === "gap" ? null : <p key={i}>{l.text}</p>))}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "grid min-w-0 gap-x-4 font-mono text-[12px] leading-[1.8] md:text-[12.5px]",
          numbered ? "grid-cols-[auto_minmax(0,1fr)]" : "grid-cols-1",
        )}
      >
        {rendered.lines.map(({ line, runs }, li) => {
          const indent = indentOf(line);
          return (
            <div key={li} className="contents">
              {numbered && (
                <span className="select-none text-right tabular-nums text-faint">{String(li + 1).padStart(2, " ")}</span>
              )}
              <span
                className={cn(
                  // `pretty` keeps comments and prose from ending on a lone word.
                  "min-w-0 whitespace-pre-wrap [overflow-wrap:break-word] [text-wrap:pretty]",
                  (line.kind === "cmd" || line.kind === "note") && "pl-[2ch] -indent-[2ch]",
                )}
                style={line.kind === "json" ? { paddingLeft: `${indent + 2}ch`, textIndent: "-2ch" } : undefined}
              >
                {line.kind === "cmd" && <span className="select-none text-pink-ink">$ </span>}
                {line.kind === "gap"
                  ? " "
                  : runs.map((r, ri) =>
                      r.space ? (
                        <span key={ri}>{r.toks[0].text}</span>
                      ) : (
                        <span key={ri} className="whitespace-nowrap">
                          {r.toks.map((t, ti) => (
                            <span key={ti} className={t.cls}>
                              {decodeText(t.text, dec, t.at, rendered.total)}
                            </span>
                          ))}
                        </span>
                      ),
                    )}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ----------------------------------------------------------------- pieces */

/** One layer of a stacked grid cell. Inactive layers keep their size but are hidden and inert. */
function Layer({ active, children, className }: { active: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      aria-hidden={active ? undefined : true}
      inert={!active}
      className={cn("col-start-1 row-start-1 min-w-0", !active && "invisible", className)}
    >
      {children}
    </div>
  );
}

function Label({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mb-2.5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.04em] text-ink/64",
        className,
      )}
    >
      {children}
      <span aria-hidden="true" className="h-px flex-1 bg-hairline" />
    </p>
  );
}

/** Shared chip look for the Prompt tab's shortcuts and the MCP tab's client picker. */
const CHIP =
  "relative inline-flex h-7 items-center rounded-[6px] border px-2 font-mono text-[11.5px] transition-[border-color,color,background-color,scale] duration-150 ease-out active:scale-[0.96]";

const FOOTERS: Record<TabKey, ReactNode> = {
  prompt: <span>Any agent that can add MCP servers.</span>,
  mcp: <span>Sign in once. Tokens auto-refresh.</span>,
  cli: (
    <>
      <a
        href={DOCS_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 whitespace-nowrap underline decoration-hairline underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent"
      >
        Install: see docs
        <ArrowUpRight aria-hidden="true" className="size-3" />
      </a>
      <span className="hidden whitespace-nowrap sm:inline">--json for agents</span>
    </>
  ),
};

/* ------------------------------------------------------------------ panel */

export function SetupPanel({ defaultTab = "prompt", defaultClient = DEFAULT_CLIENT, className }: SetupPanelProps) {
  const [tab, setTab] = useState<TabKey>(defaultTab);
  const [client, setClient] = useState<ClientKey>(defaultClient);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const radioRefs = useRef<Partial<Record<ClientKey, HTMLButtonElement | null>>>({});
  const focusClient = useRef<ClientKey | null>(null);
  const inView = useInView(rootRef, { once: true, rootMargin: "0px 0px -15% 0px" });
  const reduced = usePrefersReducedMotion();
  const id = useId();

  const activeClient = MCP_CLIENTS.find((c) => c.key === client) ?? MCP_CLIENTS[0];
  const snippet: Snippet = tab === "prompt" ? PROMPT_SNIPPET : tab === "cli" ? CLI_SNIPPET : activeClient.snippet;
  const dec = useDecode(`${inView ? 1 : 0}:${tab}:${tab === "mcp" ? client : ""}`, { disabled: reduced });

  // A shortcut chip on the Prompt tab hides itself; hand focus to the matching radio.
  useEffect(() => {
    if (tab !== "mcp" || !focusClient.current) return;
    radioRefs.current[focusClient.current]?.focus();
    focusClient.current = null;
  }, [tab, client]);

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  };

  const onRadioKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const n = MCP_CLIENTS.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    const key = MCP_CLIENTS[next].key;
    setClient(key);
    radioRefs.current[key]?.focus();
  };

  return (
    <LazyMotionConfig>
      <div
        ref={rootRef}
        className={cn("flex min-w-0 flex-col overflow-hidden rounded-[12px] border border-hairline bg-paper", className)}
      >
        {/* header: tabs + copy */}
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-hairline pl-1.5 pr-2">
          <LayoutGroup id={`${id}-tabs`}>
            <div role="tablist" aria-label="Setup method" className="flex items-center gap-0.5">
              {TABS.map((t, i) => {
                const active = t.key === tab;
                return (
                  <button
                    key={t.key}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    id={`${id}-tab-${t.key}`}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    aria-controls={`${id}-panel`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setTab(t.key)}
                    onKeyDown={(e) => onTabKey(e, i)}
                    className={cn(
                      "relative h-9 rounded-[7px] px-3 text-[13px] font-medium tracking-[-0.01em] transition-colors duration-150",
                      active ? "text-ink" : "text-ink/64 hover:text-ink",
                    )}
                  >
                    {active && (
                      <m.span
                        layoutId="tab-thumb"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-[7px] bg-surface"
                        transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                      />
                    )}
                    <span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
          <div className="flex min-w-0 items-center gap-2">
            {tab === "mcp" && snippet.file && (
              <span className="hidden truncate font-mono text-[11px] text-ink/64 sm:inline">{snippet.file}</span>
            )}
            <CopyButton
              text={snippet.copy}
              label={tab === "prompt" ? "Copy prompt" : tab === "mcp" ? `Copy ${activeClient.label} setup` : "Copy CLI commands"}
              analytics={{
                target: tab === "mcp" ? "mcp_config" : "mcp_command",
                client: tab === "mcp" ? activeClient.key : tab,
              }}
            />
          </div>
        </div>

        {/* body: three stacked layers, the tallest sets the height */}
        <div
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${tab}`}
          className="grid flex-1 px-5 py-5 md:px-6"
        >
          {/* Prompt */}
          <Layer active={tab === "prompt"} className="flex flex-col">
            <p className="mb-3 text-[13px] leading-snug text-ink/64">Copy and paste this into your AI agent.</p>
            {/* The well takes any spare height, so the tab never shows a gap under its last row. */}
            <div className="flex-1 rounded-[7px] bg-surface px-3.5 py-3">
              <CodeBlock snippet={PROMPT_SNIPPET} dec={tab === "prompt" ? dec : DONE} numbered={false} />
            </div>
            <Label className="mt-6">Then your agent</Label>
            <ol className="grid gap-1.5 font-mono text-[12px] leading-[1.6]">
              {PROMPT_STEPS.map((s, i) => (
                // Label column 5.25rem fits "load tools" (10ch), so the value gets the room: the MCP URL
                // (16ch) shows whole from about 360px. Below 22rem the value drops under its label
                // instead of being cut off. It is never truncated.
                <li
                  key={s.step}
                  className="grid grid-cols-[2ch_5.25rem_minmax(0,1fr)] gap-x-2 max-[22rem]:grid-cols-[2ch_minmax(0,1fr)]"
                >
                  <span className="tabular-nums text-ink/64">{i + 1}</span>
                  <span className="text-ink">{s.step}</span>
                  <span className="min-w-0 text-ink-2 [overflow-wrap:anywhere] max-[22rem]:col-start-2">{s.detail}</span>
                </li>
              ))}
            </ol>
            <Label className="mt-6">Or set up a client</Label>
            <div className="flex flex-wrap gap-1.5">
              {MCP_CLIENTS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    focusClient.current = c.key;
                    setClient(c.key);
                    setTab("mcp");
                  }}
                  aria-label={`Show ${c.label} setup`}
                  className={cn(CHIP, "border-hairline bg-paper text-ink-2 hover:border-ink/25 hover:bg-bg hover:text-ink")}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Layer>

          {/* MCP: client picker (the app's MCP_SETUP clients) + snippet + server spec */}
          <Layer active={tab === "mcp"}>
            <LayoutGroup id={`${id}-clients`}>
              <div role="radiogroup" aria-label="MCP client" className="flex flex-wrap gap-1.5">
                {MCP_CLIENTS.map((c, i) => {
                  const active = c.key === client;
                  return (
                    <button
                      key={c.key}
                      ref={(el) => {
                        radioRefs.current[c.key] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      tabIndex={active ? 0 : -1}
                      onClick={() => setClient(c.key)}
                      onKeyDown={(e) => onRadioKey(e, i)}
                      className={cn(
                        CHIP,
                        active
                          ? "border-transparent text-ink"
                          : "border-hairline text-ink/64 hover:border-ink/25 hover:text-ink",
                      )}
                    >
                      {/* Only while the tab shows: a hidden, promoted thumb changes text AA under the Prompt chips. */}
                      {active && tab === "mcp" && (
                        <m.span
                          layoutId="client-thumb"
                          aria-hidden="true"
                          className="absolute -inset-px rounded-[6px] border border-ink bg-surface"
                          transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                        />
                      )}
                      <span className="relative">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
            <div className="mt-4 grid">
              {MCP_CLIENTS.map((c) => (
                <Layer key={c.key} active={c.key === client}>
                  <CodeBlock snippet={c.snippet} dec={tab === "mcp" && c.key === client ? dec : DONE} numbered />
                </Layer>
              ))}
            </div>
            <Label className="mt-6">Server</Label>
            <dl className="grid grid-cols-[5.25rem_minmax(0,1fr)] gap-x-2 gap-y-1.5 font-mono text-[12px] leading-[1.6]">
              {SERVER_SPEC.map((row) => (
                <div key={row.k} className="contents">
                  <dt className="text-ink/64">{row.k}</dt>
                  <dd className="min-w-0 text-ink-2">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Layer>

          {/* CLI */}
          <Layer active={tab === "cli"}>
            <CodeBlock snippet={CLI_SNIPPET} dec={tab === "cli" ? dec : DONE} numbered />
          </Layer>
        </div>

        {/* footer */}
        <div className="flex min-h-10 shrink-0 items-center justify-between gap-4 border-t border-hairline px-5 py-2 font-mono text-[11px] text-ink/64 md:px-6">
          {FOOTERS[tab]}
        </div>
      </div>
    </LazyMotionConfig>
  );
}
