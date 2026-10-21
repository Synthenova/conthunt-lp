"use client";

/**
 * Right chat panel (simulator-spec §6): header, transcript, background strip and composer.
 *
 * Every transcript row is the app's own structure (NativeChatTranscript + the inline Deep Search
 * worker task). Structural labels are real text; dynamic bodies shimmer only while `skeleton` is
 * set (real data never renders a skeleton).
 *
 * Pre-written replies (SIM-UI.md §1): picking a next step streams its prompt into the composer and
 * arms Send. Sending a step that has a `response` clears the composer, slides the sent bubble in,
 * shows the agent's working line (~0.9s), streams the reply in word by word (~40 words/s, rendered
 * as markdown as it grows), then offers the same next steps again underneath. Exchanges append to
 * the tab's transcript and survive tab switches; a tab switch mid-reply completes it. While a reply
 * runs the steps are hidden and Send is disabled. The transcript follows the stream unless the
 * visitor scrolled up inside it. Reduced motion: the bubble and the whole reply appear at once.
 * The reply is announced once, complete (a polite live region; the log itself is `aria-live=off`),
 * and focus moves to the new steps if it was still in the chat. Free text, or a step without a
 * response, keeps "Run it in ContHunt" (Send opens the product).
 */
import {
  memo,
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowUp,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Copy,
  Globe,
  History,
  ImagePlus,
  Pencil,
  Plus,
  Telescope,
  Wrench,
  X,
} from "lucide-react";
import type {
  SimAssistantMessage,
  SimBudgetCard,
  SimChatItem,
  SimComposer,
  SimDeepSearch,
  SimNextPrompt,
  SimNextPrompts,
  SimPlatform,
  SimPrecookedResponse,
  SimResearchPlan,
  SimThinkingGroup,
  SimTraceRow,
  SimWorkerTask,
} from "@/content/simulator/types";
import { GET_STARTED_URL } from "@/lib/links";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { SimMenu, useTooltip } from "./layer";
import { Markdown } from "./markdown";
import { PlatformIcon } from "./platform-icon";
import { scrollAreaOverflow, scrollAreaProps } from "./scroll";
import styles from "./sim.module.css";

/** MODEL_OPTIONS labels, production list (chat-input/constants.ts:7-18). */
export const SIM_MODEL_OPTIONS = [
  "Claude Fable 5.1",
  "Claude Opus 5.5",
  "Claude Sonnet 5.5",
  "GPT 6.1 Sol",
  "GPT 6 Astra",
  "Grok 4.6",
  "Gemini 3.8 Flash",
  "GPT 6 Luna",
  "GLM 5.3 Flash",
] as const;

/** The agent's working line before a pre-written reply. */
const WORKING_MS = 900;
/** Reply streaming speed. */
const WORDS_PER_SECOND = 40;
/** Within this many pixels of the end the transcript keeps following the stream. */
const FOLLOW_SLACK = 48;
const DEFAULT_WORKING_LABEL = "Reading this research";
/** The report's and the replies' text style. */
const REPORT_TEXT = "flex flex-col gap-2 text-[14px] leading-[1.55] text-ink-2";

// --------------------------------------------------------------------------------- primitives

/** A static skeleton bar. Groups that are skeleton throughout add one `styles.sweep` overlay. */
function Shimmer({ width, height = 8, className }: { width: number | string; height?: number; className?: string }) {
  return (
    <span aria-hidden className={cn(styles.shimmer, "block rounded-[4px] bg-surface", className)} style={{ width, height }} />
  );
}

function IconButton({
  label,
  children,
  onClick,
  pressed,
  disabled,
  tipSide = "bottom",
  className,
}: {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  pressed?: boolean;
  disabled?: boolean;
  tipSide?: "bottom" | "top" | "right";
  className?: string;
}) {
  const tip = useTooltip(tipSide);
  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        aria-disabled={disabled || undefined}
        onClick={disabled ? undefined : onClick}
        {...tip.bind(label)}
        className={cn(
          "grid size-7 place-items-center rounded-[8px] text-muted outline-none transition-[background-color,color,scale] duration-150 ease-out",
          "hover:bg-surface hover:text-ink focus-visible:shadow-[0_0_0_2px_var(--accent)] active:scale-[0.94]",
          pressed ? "bg-surface text-ink" : "",
          disabled ? "cursor-default active:scale-100" : "",
          className,
        )}
      >
        {children}
      </button>
      {tip.node}
    </>
  );
}

// ------------------------------------------------------------------------------ header (right)

export function ChatHeader() {
  return (
    <div className="flex h-full items-center justify-between pl-4 pr-2.5">
      <p className="text-[15.5px] font-semibold tracking-[-0.01em] text-ink">Agent</p>
      <div className="flex items-center gap-0.5">
        <IconButton label="New Chat">
          <Plus aria-hidden className="size-4" />
        </IconButton>
        <IconButton label="Chat History">
          <History aria-hidden className="size-4" />
        </IconButton>
        <IconButton label="Close chat" disabled>
          <X aria-hidden className="size-4" />
        </IconButton>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------- trace rows

function TraceRows({ rows, skeleton }: { rows?: SimTraceRow[]; skeleton?: boolean }) {
  if (!rows?.length) {
    if (!skeleton) return <p className="text-[13.5px] text-muted">No activity recorded.</p>;
    return (
      <div className="relative flex flex-col gap-2 py-1">
        {[0.82, 0.64, 0.74].map((w, i) => (
          <span key={i} className="flex items-center gap-2">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-surface-2" />
            <Shimmer width={`${w * 100}%`} />
          </span>
        ))}
        <span aria-hidden className={styles.sweep} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row, i) => (
        <TraceRow key={i} row={row} skeleton={skeleton} />
      ))}
    </div>
  );
}

function TraceRow({ row, skeleton }: { row: SimTraceRow; skeleton?: boolean }) {
  if (row.kind === "searches") {
    return (
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-medium text-ink-2">
          <Globe aria-hidden className="size-3.5 text-muted" />
          {row.label}
        </p>
        <div className={cn(styles.noScrollbar, styles.fadeX, "-mx-1 flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-0.5 pr-6")}>
          {row.rows.map((q) => (
            <div key={q.id} className="flex w-[172px] shrink-0 flex-col gap-1 rounded-[8px] bg-surface/70 px-2 py-1.5">
              <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-growth/70" />
                <span className="truncate">{q.label}</span>
              </span>
              {row.skeleton || skeleton ? (
                <Shimmer width={78} height={6} className="ml-3" />
              ) : q.platform && q.count != null ? (
                <span className="flex items-center gap-1 whitespace-nowrap pl-3 font-mono text-[11.5px] text-muted">
                  <PlatformIcon platform={q.platform} size={9} />
                  {q.platform} · {q.count} videos
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-1.5 font-mono text-[12px] tabular-nums text-muted">{row.count} searches</p>
      </div>
    );
  }
  if (row.kind === "analysis") {
    const pct = Math.max(0, Math.min(100, row.percent));
    return (
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-[13.5px] font-medium text-ink-2">
          <Clapperboard aria-hidden className="size-3.5 text-muted" />
          {row.label}
        </p>
        <div className="flex items-center gap-2">
          <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-surface-2">
            <span className="absolute inset-y-0 left-0 rounded-full bg-ink" style={{ width: `${pct}%` }} />
          </span>
          <span className="font-mono text-[12px] tabular-nums text-ink-2">{Math.round(pct)}%</span>
        </div>
      </div>
    );
  }
  if (row.kind === "thinking") {
    return (
      <p className="flex items-center gap-2 text-[13.5px] text-ink-2">
        <span className="font-medium">{row.label}</span>
        {row.skeleton || skeleton ? (
          <Shimmer width={120} />
        ) : row.preview ? (
          <span className="truncate text-muted">{row.preview}</span>
        ) : null}
      </p>
    );
  }
  return (
    <p className="flex items-center gap-2 text-[13.5px] text-ink-2">
      <Wrench aria-hidden className="size-3.5 shrink-0 text-muted" />
      <span className="font-medium">{row.label}</span>
      {row.chip ? (
        <span className={cn("rounded-[5px] bg-surface px-1.5 py-0.5 text-[12px] text-ink-2", row.mono ? "font-mono" : "")}>{row.chip}</span>
      ) : row.skeleton || skeleton ? (
        <Shimmer width={64} height={7} />
      ) : null}
    </p>
  );
}

// ----------------------------------------------------------------------------- transcript items

function UserBubble({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={cn(
        "ml-auto max-w-[85%] rounded-[12px] bg-surface px-3 py-2.5 text-[14px] leading-[1.5] text-ink shadow-[inset_0_0_0_1px_rgb(15_15_15/0.04)]",
        className,
      )}
    >
      {text}
    </div>
  );
}

function Disclosure({
  open,
  onToggle,
  children,
  className,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={label}
      onClick={onToggle}
      className={cn("group/disc flex w-full items-center gap-1.5 rounded-[6px] text-left outline-none", className)}
    >
      <ChevronRight
        aria-hidden
        className={cn("size-3.5 shrink-0 text-muted transition-transform duration-200 ease-out", open ? "rotate-90" : "")}
      />
      {children}
    </button>
  );
}

function ThinkingGroup({ item }: { item: SimThinkingGroup }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Disclosure open={open} onToggle={() => setOpen((v) => !v)}>
        <span className="truncate text-[13.5px] text-muted transition-colors duration-150 group-hover/disc:text-ink-2">{item.summary}</span>
      </Disclosure>
      {open ? (
        <div className={cn(styles.reveal, "ml-[7px] mt-2 border-l pl-3.5")}>
          <TraceRows rows={item.rows} skeleton={item.skeleton} />
        </div>
      ) : null}
    </div>
  );
}

function AutoApproved({ searches, videos }: { searches: number; videos: number }) {
  return (
    <p className="inline-flex max-w-full items-start gap-1.5 self-start rounded-[8px] bg-surface px-2.5 py-1.5 text-[13px] leading-[1.4] text-ink-2">
      <BadgeCheck aria-hidden className="mt-px size-3.5 shrink-0 text-growth" />
      <span>
        {/* Non-breaking inside each group, so a wrap only ever happens at a " · ". */}
        <span className="font-medium text-ink">Auto-approved:</span> Research&nbsp;budget · {searches}&nbsp;searches ·{" "}
        {videos}&nbsp;videos
      </span>
    </p>
  );
}

function WorkerTask({ item }: { item: SimWorkerTask }) {
  const [open, setOpen] = useState(!!item.expanded);
  const done = item.status === "completed";
  return (
    <div className="rounded-[10px] shadow-[inset_0_0_0_1px_var(--hairline)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full items-center gap-2 rounded-[10px] px-2.5 text-left outline-none transition-colors duration-150 hover:bg-surface/60 focus-visible:shadow-[inset_0_0_0_2px_var(--accent)]"
      >
        <span
          aria-hidden
          className={cn(
            "grid size-[18px] shrink-0 place-items-center rounded-full",
            done ? "bg-surface text-growth" : item.status === "failed" ? "bg-surface text-decline" : "bg-surface text-muted",
          )}
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
        <span className="truncate whitespace-nowrap text-[13.5px] font-semibold text-ink">{item.label}</span>
        {item.elapsed ? <span className="shrink-0 whitespace-nowrap font-mono text-[12px] tabular-nums text-muted">{item.elapsed}</span> : null}
        <span className="ml-auto rounded-full bg-surface px-2 py-[3px] text-[12px] font-medium leading-none text-ink-2">
          {item.status_label ?? (done ? "Finished" : item.status === "failed" ? "Failed" : "Starting")}
        </span>
        <ChevronDown aria-hidden className={cn("size-3.5 text-muted transition-transform duration-300 ease-out", open ? "rotate-180" : "")} />
      </button>
      {open ? (
        <div className={cn(styles.reveal, "border-t px-3 pb-3 pt-2.5")}>
          <TraceRows rows={item.rows} />
        </div>
      ) : null}
    </div>
  );
}

/** A real video behind a report: listed under "Sources". */
export interface SimSource {
  id: string;
  creator: string;
  title: string;
  platform: SimPlatform;
  poster: string | null;
}

/** Real cards on the board, in board order, as the transcript's sources (none while tiles are skeletons). */
function boardSources(search: SimDeepSearch): SimSource[] {
  const seen = new Set<string>();
  const out: SimSource[] = [];
  for (const section of search.sections) {
    for (const v of section.videos) {
      const c = v.card;
      if (v.skeleton || v.status !== "ready" || !c || seen.has(c.content_item_id)) continue;
      seen.add(c.content_item_id);
      out.push({
        id: c.content_item_id,
        creator: c.author_name || c.creator_handle || "Video",
        title: c.title || c.primary_text || "No Title",
        platform: c.platform,
        poster: c.thumbnail_url,
      });
    }
  }
  return out;
}

function AssistantReport({ item, sources: sourceList = [], className }: { item: SimAssistantMessage; sources?: SimSource[]; className?: string }) {
  const [sources, setSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const lines = item.skeleton_lines ?? 4;
  const widths = ["100%", "92%", "96%", "70%", "88%", "60%"];
  const sourceCount = item.source_count ?? 0;
  // Real sources once the board has real cards; a skeleton report keeps skeleton rows.
  const listed = item.skeleton ? [] : sourceList.slice(0, Math.min(4, sourceCount));
  return (
    <div className={className}>
      {item.skeleton ? (
        <div role="group" aria-label="Report" aria-busy="true" className="relative flex flex-col gap-[9px] py-1">
          {Array.from({ length: lines }, (_, i) => (
            <Shimmer key={i} width={widths[i % widths.length]} height={8} />
          ))}
          <span aria-hidden className={styles.sweep} />
        </div>
      ) : item.markdown ? (
        <Markdown markdown={item.markdown} className={REPORT_TEXT} />
      ) : null}
      <div className="mt-2 flex items-center gap-1">
        <IconButton
          label={copied ? "Copied" : "Copy"}
          onClick={() => {
            if (item.markdown) void navigator.clipboard?.writeText(item.markdown).catch(() => {});
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          }}
        >
          {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
        </IconButton>
        {item.source_count != null ? (
          <button
            type="button"
            aria-expanded={sources}
            onClick={() => setSources((v) => !v)}
            className="flex h-7 items-center gap-1 rounded-[8px] px-2 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-surface"
          >
            Sources <span className="font-mono tabular-nums text-muted">{item.source_count}</span>
            <ChevronDown aria-hidden className={cn("size-3.5 text-muted transition-transform duration-200", sources ? "rotate-180" : "")} />
          </button>
        ) : null}
      </div>
      {sources ? (
        <div className={cn(styles.reveal, "mt-1 flex flex-col gap-1.5 rounded-[10px] bg-surface/60 p-2")}>
          {listed.length
            ? listed.map((src) => (
                <span key={src.id} className="flex min-w-0 items-center gap-2 text-[12.5px]">
                  <span
                    aria-hidden
                    className="h-[26px] w-[16px] shrink-0 rounded-[4px] bg-surface-2 bg-cover bg-center"
                    style={src.poster ? { backgroundImage: `url("${src.poster}")` } : undefined}
                  />
                  <PlatformIcon platform={src.platform} size={10} className="shrink-0 text-muted" />
                  <span className="shrink-0 font-medium text-ink">{src.creator}</span>
                  <span className="truncate text-muted">{src.title}</span>
                </span>
              ))
            : Array.from({ length: Math.min(4, sourceCount) }, (_, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span aria-hidden className={cn(styles.shimmer, "h-[26px] w-[16px] shrink-0 rounded-[4px] bg-surface-2")} />
                  <Shimmer width={`${[72, 58, 66, 50][i]}%`} height={7} />
                </span>
              ))}
          {sourceCount > 4 ? <p className="pl-6 font-mono text-[11.5px] text-muted">+{sourceCount - 4} more</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function NextPrompts({
  item,
  onPick,
  className,
  autoFocus,
  onAutoFocused,
}: {
  item: SimNextPrompts;
  onPick: (prompt: SimNextPrompt) => void;
  className?: string;
  /** After a reply: take focus if it is still in the chat (or nowhere). */
  autoFocus?: boolean;
  onAutoFocused?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  // Roving focus: the group is one tab stop; Up/Down move, Enter or Space streams the prompt in.
  const [focusIdx, setFocusIdx] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);
  const focused = useEffectEvent(() => onAutoFocused?.());
  useEffect(() => {
    if (!autoFocus) return;
    const group = groupRef.current;
    const active = document.activeElement;
    if (group && (!active || active === document.body || group.closest("aside")?.contains(active))) {
      group.querySelector<HTMLElement>("[role=radio]")?.focus({ preventScroll: true });
    }
    focused();
  }, [autoFocus]);
  if (dismissed) return null;
  const tabStop = picked ?? focusIdx;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = item.prompts.length;
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (tabStop + dir + n) % n;
    setFocusIdx(next);
    if (picked != null) setPicked(null);
    groupRef.current?.querySelectorAll<HTMLElement>("[role=radio]")[next]?.focus({ preventScroll: true });
  };
  return (
    <div className={cn("rounded-[12px] p-1.5 shadow-[inset_0_0_0_1px_var(--hairline)]", className)} role="group" aria-label="Next step">
      <div className="flex items-center justify-between py-0.5 pl-2">
        <p className="text-[13.5px] font-semibold text-ink">Next step</p>
        <IconButton label="Dismiss" onClick={() => setDismissed(true)} className="size-6">
          <X aria-hidden className="size-3.5" />
        </IconButton>
      </div>
      <div ref={groupRef} role="radiogroup" aria-label="Suggested next prompts" className="mt-0.5 flex flex-col" onKeyDown={onKey}>
        {item.prompts.map((p, i) => (
          <button
            key={p.label}
            type="button"
            role="radio"
            aria-checked={picked === i}
            tabIndex={i === tabStop ? 0 : -1}
            onClick={() => {
              setPicked(i);
              setFocusIdx(i);
              onPick(p);
            }}
            className="group/np flex min-h-8 items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-left outline-none transition-colors duration-150 hover:bg-surface focus-visible:bg-surface"
          >
            <span
              aria-hidden
              className={cn(
                "grid size-3.5 shrink-0 place-items-center rounded-full transition-shadow duration-150",
                picked === i ? "shadow-[inset_0_0_0_4.5px_var(--ink)]" : "shadow-[inset_0_0_0_1.25px_rgb(15_15_15/0.3)]",
              )}
            />
            <span className="flex-1 text-[14px] leading-[1.35] text-ink-2 group-hover/np:text-ink">{p.label}</span>
            <Pencil
              aria-label={`Edit ${p.label}`}
              className="size-3.5 shrink-0 text-faint opacity-0 transition-opacity duration-150 group-hover/np:opacity-100 group-focus-visible/np:opacity-100"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/** PresentPlanCard.tsx:117-151 (optional; real chats render it above the budget). */
function PlanCard({ item }: { item: SimResearchPlan }) {
  return (
    <div className="rounded-[12px] p-3 text-[13.5px] shadow-[inset_0_0_0_1px_var(--hairline)]">
      <p className="font-mono text-[11.5px] uppercase text-muted">Objective</p>
      <p className="mt-0.5 text-ink-2">{item.objective}</p>
      {item.output ? (
        <>
          <p className="mt-2 font-mono text-[11.5px] uppercase text-muted">Expected output</p>
          <p className="mt-0.5 text-ink-2">{item.output}</p>
        </>
      ) : null}
      <p className="mt-2 font-mono text-[11.5px] uppercase text-muted">Research questions</p>
      <ul className="mt-0.5 list-disc pl-4 text-ink-2">
        {item.research_questions.map((q) => (
          <li key={q.question}>{q.question}</li>
        ))}
      </ul>
      <p className="mt-2 text-muted">
        Suggested rubrics · {item.criteria.length} rubrics <span className="text-faint">/</span> Suggested searches · {item.searches.length}
      </p>
    </div>
  );
}

/** RecommendationCard.tsx:26-61 (optional; the default sim uses the auto-approved pill). */
function BudgetCard({ item }: { item: SimBudgetCard }) {
  const o = item.option;
  return (
    <div className="rounded-[12px] p-3 text-[13.5px] shadow-[inset_0_0_0_1px_var(--hairline)]">
      <p className="flex items-center justify-between">
        <span className="font-semibold text-ink">Research budget</span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[12px] text-ink-2">Recommended</span>
      </p>
      <p className="mt-1.5 text-ink-2">
        {o.searches} searches
        <span className="text-faint"> · </span>
        {o.videos} analyses{o.aiCreditEstimate != null ? ` · ~${o.aiCreditEstimate} AI credits` : ""}
      </p>
      {o.researchDepth != null ? (
        <div className="mt-2">
          <p className="text-muted">Research depth</p>
          <span className="mt-1 block h-1 overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-ink" style={{ width: `${o.researchDepth}%` }} />
          </span>
        </div>
      ) : null}
      <p className="mt-2 text-[13px] font-medium text-ink">{item.accepted ? "Research approved" : "Choose budget"}</p>
    </div>
  );
}

function TranscriptItem({ item, onPick, sources }: { item: SimChatItem; onPick: (prompt: SimNextPrompt) => void; sources: SimSource[] }) {
  switch (item.kind) {
    case "user":
      return <UserBubble text={item.text} />;
    case "thinking_group":
      return <ThinkingGroup item={item} />;
    case "auto_approved":
      return <AutoApproved searches={item.searches} videos={item.videos} />;
    case "worker_task":
      return <WorkerTask item={item} />;
    case "assistant":
      return <AssistantReport item={item} sources={sources} />;
    case "next_prompts":
      return <NextPrompts item={item} onPick={onPick} />;
    case "plan":
      return <PlanCard item={item} />;
    case "budget":
      return <BudgetCard item={item} />;
  }
}

// ------------------------------------------------------------------------------- exchanges

/** One sent step and its pre-written reply. */
interface Exchange {
  id: string;
  prompt: string;
  response: SimPrecookedResponse;
  phase: "working" | "streaming" | "done";
}

type ExchangeLog = Readonly<Record<string, readonly Exchange[]>>;

/**
 * Appended exchanges per tab (search id), kept for the visit. A module-level store, so the inline
 * simulator and the Full Control dialog share one conversation: what the visitor sent inline is
 * there when the dialog opens, and the reverse on close.
 */
const exchangeStore = (() => {
  let log: ExchangeLog = {};
  let seq = 0;
  const listeners = new Set<() => void>();
  const set = (next: ExchangeLog) => {
    if (next === log) return;
    log = next;
    for (const l of listeners) l();
  };
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    get: () => log,
    nextId: (tab: string) => `${tab}-x${++seq}`,
    append(tab: string, exchange: Exchange) {
      set({ ...log, [tab]: [...(log[tab] ?? []), exchange] });
    },
    /** Moves one exchange on, only from the phase it is expected in (stale timers do nothing). */
    advance(tab: string, id: string, from: Exchange["phase"], to: Exchange["phase"]) {
      const xs = log[tab];
      if (!xs?.some((x) => x.id === id && x.phase === from)) return;
      set({ ...log, [tab]: xs.map((x) => (x.id === id ? { ...x, phase: to } : x)) });
    },
    /** Completes every reply still running (a tab switch, or the other simulator taking over). */
    finishRunning() {
      if (!Object.values(log).some((xs) => xs.some((x) => x.phase !== "done"))) return;
      const next: Record<string, readonly Exchange[]> = {};
      for (const [tab, xs] of Object.entries(log)) next[tab] = xs.map((x) => (x.phase === "done" ? x : { ...x, phase: "done" }));
      set(next);
    },
  };
})();

const NO_EXCHANGES: ExchangeLog = {};
const serverLog = () => NO_EXCHANGES;

/** The reply as plain text, for the live region. */
function plainText(markdown: string): string {
  return markdown
    .replace(/^\s*(?:[-*]|\d+[.)]|#{1,6})\s+/gm, "")
    // Emphasis and code markers only: underscores in handles stay.
    .replace(/[*`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The agent at work: the ThinkingBlock status line with the app's working shimmer on the label. */
function WorkingLine({ label }: { label: string }) {
  return (
    <p className={cn(styles.enter, "flex items-center gap-1.5 text-[13.5px]")}>
      <ChevronRight aria-hidden className="size-3.5 shrink-0 text-muted" />
      <span className={styles.working}>{label}</span>
    </p>
  );
}

/** The reply streaming in word by word, rendered as markdown as it grows. */
function StreamingReply({ markdown, onGrow, onDone }: { markdown: string; onGrow: () => void; onDone: () => void }) {
  // Words and the whitespace between them alternate, so a prefix keeps line breaks and blank lines.
  const tokens = useMemo(() => markdown.trim().split(/(\s+)/), [markdown]);
  const words = Math.ceil(tokens.length / 2);
  const [count, setCount] = useState(1);
  const done = useEffectEvent(onDone);
  const grow = useEffectEvent(onGrow);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const n = Math.min(words, 1 + Math.floor(((now - start) / 1000) * WORDS_PER_SECOND));
      setCount(n);
      if (n < words) raf = requestAnimationFrame(step);
      else done();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [words]);

  useLayoutEffect(() => grow(), [count]);

  return (
    <div aria-busy="true">
      <Markdown markdown={tokens.slice(0, count * 2 - 1).join("")} className={REPORT_TEXT} />
    </div>
  );
}

function ExchangeView({
  exchange,
  sources,
  onGrow,
  onDone,
}: {
  exchange: Exchange;
  sources: SimSource[];
  onGrow: () => void;
  onDone: (id: string) => void;
}) {
  const { response, phase } = exchange;
  return (
    <>
      <UserBubble text={exchange.prompt} className={styles.sendIn} />
      {phase === "working" ? (
        <WorkingLine label={response.status_label ?? DEFAULT_WORKING_LABEL} />
      ) : phase === "streaming" ? (
        <StreamingReply markdown={response.markdown} onGrow={onGrow} onDone={() => onDone(exchange.id)} />
      ) : (
        <AssistantReport
          item={{ kind: "assistant", id: exchange.id, markdown: response.markdown, source_count: response.source_count }}
          sources={sources}
        />
      )}
    </>
  );
}

/** Tabs whose search is still a skeleton: prompt bubble, skeleton trace rows and a shimmering report. */
function SkeletonTranscript({ prompt }: { prompt: string }) {
  return (
    <>
      <UserBubble text={prompt} />
      <span className="flex items-center gap-1.5">
        <ChevronRight aria-hidden className="size-3.5 text-faint" />
        <Shimmer width={190} />
      </span>
      <div className="flex h-10 items-center gap-2 rounded-[10px] px-2.5 shadow-[inset_0_0_0_1px_var(--hairline)]">
        <span aria-hidden className="size-[18px] rounded-full bg-surface" />
        <span className="whitespace-nowrap text-[13.5px] font-semibold text-ink">Deep Search worker</span>
        <Shimmer width={44} height={7} />
        <span className="ml-auto">
          <Shimmer width={52} height={14} className="rounded-full" />
        </span>
      </div>
      <div className="relative flex flex-col gap-[9px] py-1">
        {["100%", "92%", "96%", "70%"].map((w, i) => (
          <Shimmer key={i} width={w} />
        ))}
        <span aria-hidden className={styles.sweep} />
      </div>
    </>
  );
}

// ------------------------------------------------------------------------------------ panel

export interface ChatPanelProps {
  search: SimDeepSearch;
  composer: SimComposer;
  /** The transcript takes the wheel (see ./scroll.ts). */
  ownsWheel: boolean;
}

export const ChatPanel = memo(function ChatPanel({ search, composer, ownsWheel }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const [filling, setFilling] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  // The step whose prompt is in the composer: Send plays its reply while the text is unedited.
  const [pending, setPending] = useState<SimNextPrompt | null>(null);
  // Appended exchanges per tab, shared with the other simulator instance (see exchangeStore).
  const log = useSyncExternalStore(exchangeStore.subscribe, exchangeStore.get, serverLog);
  // Replies sent from this instance: only these drive "done", the announcement and focus.
  const owned = useRef(new Set<string>());
  const [announce, setAnnounce] = useState("");
  const [focusSteps, setFocusSteps] = useState(false);
  const raf = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const follow = useRef(true);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // A tab switch drops an armed step from the other tab (derived during render, React's pattern).
  const [shownTab, setShownTab] = useState(search.id);
  if (shownTab !== search.id) {
    setShownTab(search.id);
    if (pending) {
      setPending(null);
      setDraft("");
    }
  }
  // A tab switch completes a reply that is still running there (its stream unmounts). So does
  // mounting (the Full Control dialog opening over an inline reply shows it complete rather than
  // replaying it) and unmounting (the dialog closing mid-reply).
  useLayoutEffect(() => exchangeStore.finishRunning(), [search.id]);
  useEffect(() => () => exchangeStore.finishRunning(), []);

  const exchanges = log[search.id] ?? EMPTY;
  const busy = exchanges.some((x) => x.phase !== "done");
  const armed = !!pending?.response && (filling || draft === pending.prompt);
  const sources = useMemo(() => boardSources(search), [search]);

  const stick = useCallback(() => {
    const el = transcriptRef.current;
    if (el && follow.current) el.scrollTop = el.scrollHeight;
  }, []);
  // Follow new exchanges (a tab with none keeps its transcript at the top, as it lands).
  useLayoutEffect(() => {
    if (exchanges.length) stick();
  }, [exchanges, stick]);

  const fill = (prompt: string) => {
    cancelAnimationFrame(raf.current);
    const finish = () => {
      setFilling(false);
      const el = textareaRef.current;
      if (el) {
        el.focus({ preventScroll: true });
        el.setSelectionRange(prompt.length, prompt.length);
      }
    };
    if (prefersReducedMotion()) {
      setDraft(prompt);
      finish();
      return;
    }
    // Stream the prompt in over ~650ms, like the app's Edit action filling the composer.
    const start = performance.now();
    const total = 650;
    setFilling(true);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / total);
      setDraft(prompt.slice(0, Math.ceil(prompt.length * (1 - Math.pow(1 - t, 2)))));
      if (t < 1) raf.current = requestAnimationFrame(step);
      else finish();
    };
    raf.current = requestAnimationFrame(step);
  };

  const pick = (step: SimNextPrompt) => {
    setPending(step);
    fill(step.prompt);
  };

  const send = () => {
    const response = pending?.response;
    if (busy || !pending || !response) return;
    cancelAnimationFrame(raf.current);
    setFilling(false);
    const tab = search.id;
    const id = exchangeStore.nextId(tab);
    const reduced = prefersReducedMotion();
    owned.current.add(id);
    exchangeStore.append(tab, { id, prompt: pending.prompt, response, phase: reduced ? "done" : "working" });
    setDraft("");
    setPending(null);
    setAnnounce("");
    setFocusSteps(true);
    follow.current = true;
    if (reduced) {
      // Bubble and reply at once; the announcement lands in the next task so a repeat is re-read.
      window.setTimeout(() => setAnnounce(plainText(response.markdown)), 60);
      return;
    }
    window.setTimeout(() => exchangeStore.advance(tab, id, "working", "streaming"), WORKING_MS);
  };

  const onReplyDone = (id: string) => {
    // The other instance may render the same stream (behind the dialog); the sender finishes it.
    if (!owned.current.has(id)) return;
    const x = exchanges.find((e) => e.id === id);
    exchangeStore.advance(search.id, id, "streaming", "done");
    if (x) setAnnounce(plainText(x.response.markdown));
  };

  const workers = search.messages.filter((m): m is SimWorkerTask => m.kind === "worker_task");
  const finished = workers.filter((w) => w.status === "completed").length;
  // The next steps always close the transcript: after the report, then after each exchange.
  const last = search.messages[search.messages.length - 1];
  const steps = last?.kind === "next_prompts" ? last : null;
  const head = steps ? search.messages.slice(0, -1) : search.messages;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        key={search.id}
        ref={transcriptRef}
        className={cn(
          styles.enter,
          styles.noScrollbar,
          styles.fadeBottom,
          "flex min-h-0 flex-1 flex-col gap-2.5 px-4 pb-6 pt-4",
          scrollAreaOverflow(ownsWheel),
        )}
        {...scrollAreaProps(ownsWheel)}
        onScroll={(e) => {
          const el = e.currentTarget;
          follow.current = el.scrollHeight - el.clientHeight - el.scrollTop < FOLLOW_SLACK;
        }}
        aria-label="Chat transcript"
        role="log"
        // The live region below announces each reply once, complete; the log stays quiet.
        aria-live="off"
      >
        {search.skeleton || search.messages.length === 0 ? (
          <SkeletonTranscript prompt={search.prompt} />
        ) : (
          <>
            {head.map((m) => (
              <TranscriptItem key={m.id} item={m} onPick={pick} sources={sources} />
            ))}
            {exchanges.map((x) => (
              <ExchangeView key={x.id} exchange={x} sources={sources} onGrow={stick} onDone={onReplyDone} />
            ))}
            {steps && !busy ? (
              <NextPrompts
                key={`${steps.id}-${exchanges.length}`}
                item={steps}
                onPick={pick}
                className={exchanges.length ? styles.enter : undefined}
                autoFocus={focusSteps}
                onAutoFocused={() => setFocusSteps(false)}
              />
            ) : null}
          </>
        )}
      </div>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announce}
      </p>

      {/* BackgroundTasksStrip (BackgroundTasksTray.tsx:21-39). */}
      <div className="px-3">
        {bgOpen && workers.length > 0 ? (
          <div className={cn(styles.reveal, "mb-1 flex flex-col gap-1 rounded-[10px] bg-surface/60 p-1.5")}>
            {workers.map((w) => (
              <p key={w.id} className="flex items-center gap-2 px-1.5 py-1 text-[13px] text-ink-2">
                <Check aria-hidden className="size-3 text-growth" strokeWidth={3} />
                {w.label}
                <span className="font-mono text-[12px] text-muted">{w.elapsed}</span>
                <span className="ml-auto text-muted">{w.status_label ?? "Finished"}</span>
              </p>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          aria-expanded={bgOpen}
          onClick={() => setBgOpen((v) => !v)}
          disabled={workers.length === 0}
          className="flex h-7 w-full items-center justify-between rounded-[8px] px-1.5 text-[13px] text-muted transition-colors duration-150 hover:bg-surface hover:text-ink-2 disabled:pointer-events-none"
        >
          <span className="flex items-center gap-1">
            Background
            <ChevronDown aria-hidden className={cn("size-3.5 transition-transform duration-200", bgOpen ? "" : "rotate-180")} />
          </span>
          <span className="font-mono text-[12px] tabular-nums">{workers.length ? `${finished} finished` : "None"}</span>
        </button>
      </div>

      <Composer
        composer={composer}
        draft={draft}
        streaming={filling}
        armed={armed}
        busy={busy}
        onSend={send}
        onDraft={(v) => {
          cancelAnimationFrame(raf.current);
          setFilling(false);
          setDraft(v);
        }}
        textareaRef={textareaRef}
      />
    </div>
  );
});

const EMPTY: readonly Exchange[] = [];

// --------------------------------------------------------------------------------- composer

function Composer({
  composer,
  draft,
  streaming,
  armed,
  busy,
  onSend,
  onDraft,
  textareaRef,
}: {
  composer: SimComposer;
  draft: string;
  streaming: boolean;
  /** A picked step with a pre-written reply is in the composer: Send plays it. */
  armed: boolean;
  /** A reply is running: Send is disabled. */
  busy: boolean;
  onSend: () => void;
  onDraft: (v: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const [model, setModel] = useState(composer.model.label);
  const [autoApprove, setAutoApprove] = useState(composer.auto_approve);
  const hasText = draft.trim().length > 0;
  const sendTip = useTooltip("top");
  const sendRef = useRef<HTMLAnchorElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Last input modality on the page: a textarea matches :focus-visible for a click and for Tab alike,
  // so the box tells them apart itself (same approach as the hero prompt box).
  const lastInput = useRef<"pointer" | "key">("key");
  useEffect(() => {
    const pointer = () => {
      lastInput.current = "pointer";
    };
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Tab") lastInput.current = "key";
    };
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("keydown", key, true);
    return () => {
      document.removeEventListener("pointerdown", pointer, true);
      document.removeEventListener("keydown", key, true);
    };
  }, []);

  // Free text (or a step without a reply) cannot run here: Send opens the real product (a real
  // link, so no popup blocker). An armed step plays its reply instead.
  const opensProduct = hasText && !armed && !busy;
  const send = () => {
    if (busy) return;
    if (armed) onSend();
    else if (hasText) sendRef.current?.click();
  };

  return (
    <div className="px-3 pb-3 pt-1.5">
      <div
        ref={boxRef}
        className={cn(
          "rounded-[16px] bg-paper shadow-[inset_0_0_0_1px_var(--hairline)] transition-shadow duration-200 ease-out",
          // Neutral active state (no blue), the hero prompt box's treatment: a firmer ink ring and a
          // deeper, softer lift. A click keeps it quiet; Tab arrival (data-focus="key") adds a clear
          // ink ring (WCAG 2.4.7). Scaled for the canvas: the ring is 1.5px, the halo 5px.
          "focus-within:shadow-[inset_0_0_0_1.5px_rgba(15,15,15,0.17),0_2px_4px_rgba(0,0,0,0.05),0_10px_26px_-4px_rgba(0,0,0,0.11)]",
          "data-[focus=key]:focus-within:shadow-[inset_0_0_0_1.5px_rgba(15,15,15,0.7),0_0_0_5px_rgba(15,15,15,0.09),0_2px_4px_rgba(0,0,0,0.05),0_10px_26px_-4px_rgba(0,0,0,0.11)]",
          "forced-colors:focus-within:outline forced-colors:focus-within:outline-2 forced-colors:focus-within:outline-offset-2 forced-colors:focus-within:outline-[color:Highlight]",
        )}
      >
        <div className="relative">
          <textarea
            ref={textareaRef}
            onFocus={() => boxRef.current?.setAttribute("data-focus", lastInput.current)}
            onBlur={() => boxRef.current?.removeAttribute("data-focus")}
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={composer.placeholder}
            aria-label="Message the agent"
            rows={2}
            className={cn(
              styles.thinScrollbar,
              styles.composerInput,
              "block h-[52px] w-full resize-none bg-transparent px-3.5 pt-3 text-[14px] leading-[1.45] text-ink outline-none placeholder:text-muted",
              streaming ? "caret-transparent" : "caret-ink",
            )}
          />
        </div>
        <div className={cn("flex items-center gap-0.5 px-2 pb-2", styles.composerBar)}>
          <IconButton label="Add attachments and sources" tipSide="top">
            <Plus aria-hidden className="size-4" />
          </IconButton>
          <IconButton label="Attach image" tipSide="top">
            <ImagePlus aria-hidden className="size-4" />
          </IconButton>
          <SimMenu
            id="model"
            title="Model"
            width={196}
            items={SIM_MODEL_OPTIONS.map((label) => ({ value: label, label, checked: label === model }))}
            onSelect={setModel}
            trigger={(p) => {
              const { ref, ...rest } = p;
              return (
                <button
                  ref={ref}
                  type="button"
                  {...rest}
                  className="flex h-7 items-center gap-1 rounded-[8px] px-2 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-surface data-[open=true]:bg-surface"
                >
                  {model}
                  <ChevronDown aria-hidden className="size-3.5 text-muted" />
                </button>
              );
            }}
          />
          <IconButton label="Auto approve" tipSide="top" pressed={autoApprove} onClick={() => setAutoApprove((v) => !v)}>
            <BadgeCheck aria-hidden className="size-4" />
          </IconButton>
          <IconButton label="Deep Research" tipSide="top" pressed={composer.deep_research_enabled} disabled>
            <Telescope aria-hidden className="size-4" />
          </IconButton>
          {opensProduct ? (
            <a
              ref={sendRef}
              href={GET_STARTED_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send: opens ContHunt in a new tab"
              {...sendTip.bind("Run it in ContHunt")}
              className="ml-auto grid size-7 place-items-center rounded-[8px] bg-ink text-paper outline-none transition-[background-color,scale] duration-200 ease-out hover:bg-ink-2 focus-visible:shadow-[0_0_0_2px_var(--accent)] active:scale-[0.94]"
            >
              <ArrowUp aria-hidden className="size-4" strokeWidth={2.25} />
            </a>
          ) : (
            // One button for armed, busy and empty, so focus survives the switch to busy on Send.
            <button
              type="button"
              aria-label="Send"
              aria-disabled={!armed || busy || undefined}
              onClick={armed && !busy ? onSend : undefined}
              {...sendTip.bind(busy ? "Wait for the reply" : armed ? "Send" : "Type or pick a next step")}
              className={cn(
                "ml-auto grid size-7 place-items-center rounded-[8px] outline-none transition-[background-color,color,scale] duration-200 ease-out focus-visible:shadow-[0_0_0_2px_var(--accent)]",
                armed && !busy
                  ? "bg-ink text-paper hover:bg-ink-2 active:scale-[0.94]"
                  : "cursor-default bg-surface-2 text-faint",
              )}
            >
              <ArrowUp aria-hidden className="size-4" strokeWidth={2.25} />
            </button>
          )}
          {sendTip.node}
        </div>
      </div>
    </div>
  );
}
