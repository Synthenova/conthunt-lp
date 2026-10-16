"use client";

/**
 * ToolIndex — the "13 tools." panel: a `tools/list` manifest of the hosted MCP server.
 * Tool names are grouped (Discover / Analyze / Organize / Account). Hovering, focusing or
 * clicking a name selects it; the detail pane decodes its summary and a real example call.
 *
 * Tour: while in view it cycles through the tools (a thin rule in the group's hue shows the dwell).
 * The pause / play button in the header controls it (WCAG 2.2.2); any selection by the
 * visitor stops it, and a pointer over the list or detail holds it. Reduced motion: no
 * tour, no decode, no button.
 *
 * Accessibility: the manifest is a tablist (one tab stop; arrow keys, Home and End move
 * and select) and the detail is its tabpanel. Nothing is live-announced, so the tour is
 * silent; the decoding glyphs are aria-hidden with the final text alongside.
 *
 * Layout stability: every tool's detail is laid out invisibly in the same grid cell, so
 * the pane always has the tallest tool's height and the page never reflows as the tour
 * advances. When the panel is stretched taller than its content (to match the setup
 * panel), the manifest rows share the slack evenly, like table rows.
 *
 *   <ToolIndex />
 *   <ToolIndex defaultTool="search" autoCycle={false} />
 */
import { m } from "motion/react";
import { MotionFeatures } from "@/components/ui/lazy-motion";
import { Pause, Play } from "lucide-react";
import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { useInView } from "@/lib/media";
import { usePrefersReducedMotion } from "@/lib/motion";
import { CopyButton } from "./copy-button";
import { decodeText, useDecode } from "./decode";
import { DEFAULT_TOOL, MCP_TOOLS, TOOL_GROUPS, type McpTool, type ToolGroup } from "./data";
import { toRuns, type CodeToken } from "./segments";

export interface ToolIndexProps {
  defaultTool?: string;
  /** Cycle through tools while in view until the visitor interacts or pauses. Default true. */
  autoCycle?: boolean;
  /** Dwell per tool when cycling, ms. Default 3200. */
  dwell?: number;
  className?: string;
}

/** Tool group hues (COLOR_SYSTEM.md): Discover blue, Analyze purple, Organize orange, Account neutral. Full class names. */
const GROUP_INK: Record<ToolGroup, string> = {
  Discover: "text-blue-ink",
  Analyze: "text-purple-ink",
  Organize: "text-orange-ink",
  Account: "text-ink-2",
};
const GROUP_RULE: Record<ToolGroup, string> = {
  Discover: "bg-blue",
  Analyze: "bg-purple",
  Organize: "bg-orange-ink",
  Account: "bg-ink-2",
};

const ORDER = TOOL_GROUPS.flatMap((g) => MCP_TOOLS.filter((t) => t.group === g));
const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Splits an example call into classed tokens with their offsets. Pure. Lines break only at
 * spaces (see `toRuns`) and after "(", so a long tool name can sit alone on the first line
 * and `key="value",` never splits.
 */
function tokenizeCall(call: string): CodeToken[] {
  const re = /("[^"]*"|<[^>]+>|\w+=|[(),[\]]|\s+|[^\s"<(),[\]=]+)/g;
  const out: CodeToken[] = [];
  let at = 0;
  for (const m of call.matchAll(re)) {
    const t = m[0];
    const cls =
      out.length === 0
        ? "font-semibold text-ink"
        : t.endsWith("=")
          ? "text-purple-ink"
          : t.startsWith('"')
            ? "text-green-ink"
            : t.startsWith("<")
              ? "text-ink/64"
              : /^[(),[\]]$/.test(t)
                ? "text-ink/64" // ≥ 4.5:1 on the call well; dimmer tones failed AA
                : "text-ink-2";
    out.push({ text: t, cls, at, breakAfter: t === "(" });
    at += t.length;
  }
  return out;
}

function CallLine({ call, decodeKey, animate }: { call: string; decodeKey: string; animate: boolean }) {
  const dec = useDecode(decodeKey, { disabled: !animate, duration: 520 });
  const runs = useMemo(() => toRuns(tokenizeCall(call)), [call]);
  return (
    <>
      <code
        aria-hidden="true"
        className="block whitespace-pre-wrap font-mono text-[12px] leading-[1.7] [overflow-wrap:break-word]"
      >
        {runs.map((r, i) =>
          r.space ? (
            <span key={i}>{r.toks[0].text}</span>
          ) : (
            <Fragment key={i}>
              <span className="whitespace-nowrap">
                {r.toks.map((t, j) => (
                  <span key={j} className={t.cls}>
                    {decodeText(t.text, dec, t.at, call.length)}
                  </span>
                ))}
              </span>
              {r.breakAfter && <wbr />}
            </Fragment>
          ),
        )}
      </code>
      <span className="sr-only">{call}</span>
    </>
  );
}

/** One tool's detail. `live` renders the visible pane (decode + copy); otherwise a sizer. */
function Detail({ tool, live, reduced }: { tool: McpTool; live: boolean; reduced: boolean }) {
  const position = ORDER.indexOf(tool) + 1;
  const nameDec = useDecode(tool.name, { disabled: reduced || !live, duration: 360 });
  return (
    <>
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <p className="min-w-0 truncate font-mono text-[13px] font-semibold text-ink">
          <span aria-hidden="true">{decodeText(tool.name, nameDec)}</span>
          <span className="sr-only">{tool.name}</span>
        </p>
        <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.04em] text-ink/64 tabular-nums">
          {tool.group} · {pad2(position)}/{MCP_TOOLS.length}
        </p>
      </div>
      <p className="mt-1.5 text-[13.5px] leading-[1.45] text-ink-2">{tool.summary}</p>
      {/* The call well takes the spare height, so short tools don't leave a gap below it. */}
      <div className="mt-3 flex flex-1 items-start gap-2 rounded-[7px] bg-surface py-2.5 pl-3 pr-1.5">
        <span aria-hidden="true" className="select-none font-mono text-[12px] leading-[1.7] text-pink-ink">
          ›
        </span>
        <div className="min-w-0 flex-1">
          <CallLine call={tool.call} decodeKey={tool.name} animate={live && !reduced} />
        </div>
        {live ? (
          <CopyButton
            text={tool.call}
            label={`Copy example call for ${tool.name}`}
            showLabel={false}
            className="-my-1 h-7 w-[30px] justify-center px-0 hover:bg-surface-2"
          />
        ) : (
          <span aria-hidden="true" className="-my-1 h-7 w-[30px] shrink-0" />
        )}
      </div>
    </>
  );
}

function ToolTab({
  tool,
  active,
  reduced,
  id,
  panelId,
  tabRef,
  onSelect,
  onKeyDown,
}: {
  tool: McpTool;
  active: boolean;
  reduced: boolean;
  id: string;
  panelId: string;
  tabRef: (el: HTMLButtonElement | null) => void;
  onSelect: (name: string, how: "hover" | "focus" | "click") => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
}) {
  const [hovers, setHovers] = useState(0);
  const dec = useDecode(`${tool.name}:${hovers}`, { disabled: reduced, duration: 280 });
  return (
    <button
      ref={tabRef}
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={panelId}
      tabIndex={active ? 0 : -1}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          setHovers((h) => h + 1);
          onSelect(tool.name, "hover");
        }
      }}
      onFocus={() => onSelect(tool.name, "focus")}
      onClick={() => onSelect(tool.name, "click")}
      onKeyDown={onKeyDown}
      className={cn(
        "group/tool relative inline-flex h-7 items-center whitespace-nowrap rounded-[5px] font-mono text-[12px] transition-colors duration-150",
        "before:absolute before:-inset-x-[0.6ch] before:inset-y-0 before:content-['']",
        active ? "text-ink" : "text-ink/64 hover:text-ink",
      )}
    >
      {/* Brackets sit in the gap beside the name (only one tool shows them), so they cost no width. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-full top-1/2 w-[1ch] -translate-y-1/2 transition-[opacity,translate] duration-200 ease-out",
          GROUP_INK[tool.group],
          active ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0",
        )}
      >
        [
      </span>
      <span aria-hidden="true">{decodeText(tool.name, dec)}</span>
      <span className="sr-only">{tool.name}</span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-full top-1/2 w-[1ch] -translate-y-1/2 transition-[opacity,translate] duration-200 ease-out",
          GROUP_INK[tool.group],
          active ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0",
        )}
      >
        ]
      </span>
    </button>
  );
}

export function ToolIndex({ defaultTool = DEFAULT_TOOL, autoCycle = true, dwell = 3200, className }: ToolIndexProps) {
  const [selected, setSelected] = useState(defaultTool);
  /** The tour is on. Turned off by any selection, toggled by the pause / play button. */
  const [tour, setTour] = useState(autoCycle);
  /** Pointer over the list or detail: hold the tour without turning it off. */
  const [hold, setHold] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const inView = useInView(rootRef, { rootMargin: "0px 0px -10% 0px" });
  const reduced = usePrefersReducedMotion();
  const uid = useId();
  const panelId = `${uid}-detail`;
  const tabId = (name: string) => `${uid}-tab-${name}`;

  const cycling = tour && inView && !hold && !reduced;

  useEffect(() => {
    if (!cycling) return;
    const t = window.setTimeout(() => {
      const i = ORDER.findIndex((x) => x.name === selected);
      setSelected(ORDER[(i + 1) % ORDER.length].name);
    }, dwell);
    return () => window.clearTimeout(t);
  }, [cycling, selected, dwell]);

  const onSelect = (name: string, how: "hover" | "focus" | "click") => {
    if (how === "hover" && name === selected) return;
    setSelected(name);
    setTour(false);
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, name: string) => {
    const i = ORDER.findIndex((t) => t.name === name);
    const n = ORDER.length;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    tabRefs.current[ORDER[next].name]?.focus(); // focus selects (automatic activation)
  };

  const tool = MCP_TOOLS.find((t) => t.name === selected) ?? MCP_TOOLS[0];

  return (
    <MotionFeatures>
      <div
        ref={rootRef}
        className={cn("flex flex-col overflow-hidden rounded-[12px] border border-hairline bg-paper", className)}
      >
        {/* header */}
        <div
          className={cn(
            "flex h-12 shrink-0 items-center justify-between gap-3 border-b border-hairline pl-4",
            autoCycle && !reduced ? "pr-2.5" : "pr-4",
          )}
        >
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="size-2.5 rounded-full border border-hairline" />
              <span className="size-2.5 rounded-full border border-hairline" />
              <span className="size-2.5 rounded-full border border-hairline" />
            </span>
            <span className="font-mono text-[12px] text-ink-2">tools/list</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink/64 tabular-nums">
              {MCP_TOOLS.length} tools
            </span>
            {autoCycle && !reduced && (
              <button
                type="button"
                onClick={() => setTour((v) => !v)}
                aria-label={tour ? "Pause the tool tour" : "Play the tool tour"}
                title={tour ? "Pause tour" : "Play tour"}
                className={cn(
                  "relative grid size-7 place-items-center rounded-[6px] text-ink/64 transition-[color,background-color,scale] duration-150 ease-out",
                  "hover:bg-surface hover:text-ink active:scale-[0.94]",
                )}
              >
                {tour ? (
                  <Pause aria-hidden="true" className="size-3.5" strokeWidth={2} />
                ) : (
                  <Play aria-hidden="true" className="size-3.5" strokeWidth={2} />
                )}
              </button>
            )}
          </div>
        </div>

        <div
          className="flex flex-1 flex-col"
          onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
          onPointerLeave={() => setHold(false)}
        >
          {/* manifest: rows share any extra height evenly */}
          <div role="tablist" aria-label="ContHunt MCP tools" className="flex flex-1 flex-col px-4 py-1.5 md:px-5">
            {TOOL_GROUPS.map((group, gi) => {
              const tools = MCP_TOOLS.filter((t) => t.group === group);
              return (
                <div
                  key={group}
                  className={cn(
                    "grid flex-1 grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-x-3 py-2",
                    gi > 0 && "border-t border-hairline",
                  )}
                >
                  <span aria-hidden="true" className={cn("font-mono text-[11px] uppercase tracking-[0.04em]", GROUP_INK[group])}>
                    {group}
                  </span>
                  <div className="flex flex-wrap gap-x-[1.5ch] font-mono text-[12px]">
                    {tools.map((t) => (
                      <ToolTab
                        key={t.name}
                        tool={t}
                        active={t.name === tool.name}
                        reduced={reduced}
                        id={tabId(t.name)}
                        panelId={panelId}
                        tabRef={(el) => {
                          tabRefs.current[t.name] = el;
                        }}
                        onSelect={onSelect}
                        onKeyDown={(e) => onTabKey(e, t.name)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* detail: every tool stacked in one cell, so the height never changes */}
          <div className="relative shrink-0 border-t border-hairline px-4 pb-5 pt-4 md:px-5">
            {cycling && (
              <m.span
                key={tool.name}
                aria-hidden="true"
                className={cn("absolute inset-x-0 top-[-1px] h-px origin-left", GROUP_RULE[tool.group])}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: dwell / 1000, ease: "linear" }}
              />
            )}
            <div className="grid">
              {MCP_TOOLS.map((t) => (
                <div key={t.name} aria-hidden="true" inert className="invisible col-start-1 row-start-1 flex min-w-0 flex-col">
                  <Detail tool={t} live={false} reduced={reduced} />
                </div>
              ))}
              <div
                id={panelId}
                role="tabpanel"
                aria-labelledby={tabId(tool.name)}
                className="col-start-1 row-start-1 flex min-w-0 flex-col"
              >
                <Detail tool={tool} live reduced={reduced} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionFeatures>
  );
}
