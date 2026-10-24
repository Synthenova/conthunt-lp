"use client";

/**
 * Right chat panel (simulator-spec §6): header, transcript, background strip and composer.
 *
 * Every transcript row is the app's own structure (NativeChatTranscript + the inline Deep Search
 * worker task). Structural labels are real text; dynamic bodies shimmer while `skeleton` is set.
 */
import { memo, useEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
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
  SimNextPrompts,
  SimResearchPlan,
  SimThinkingGroup,
  SimTraceRow,
  SimWorkerTask,
} from "@/content/simulator/types";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL } from "@/lib/links";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { SimMenu, useTooltip } from "./layer";
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
            <div key={q.id} className="flex w-[150px] shrink-0 flex-col gap-1 rounded-[8px] bg-surface/70 px-2 py-1.5">
              <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-growth/70" />
                <span className="truncate">{q.label}</span>
              </span>
              {q.platform && q.count != null && !(row.skeleton || skeleton) ? (
                <span className="flex items-center gap-1 pl-3 font-mono text-[11.5px] text-muted">
                  <PlatformIcon platform={q.platform} size={9} />
                  {q.platform} · {q.count} videos
                </span>
              ) : (
                <Shimmer width={78} height={6} className="ml-3" />
              )}
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
        {row.preview && !(row.skeleton || skeleton) ? (
          <span className="truncate text-muted">{row.preview}</span>
        ) : (
          <Shimmer width={120} />
        )}
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

function UserBubble({ text }: { text: string }) {
  return (
    <div className="ml-auto max-w-[85%] rounded-[12px] bg-surface px-3 py-2.5 text-[14px] leading-[1.5] text-ink shadow-[inset_0_0_0_1px_rgb(15_15_15/0.04)]">
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

function AssistantReport({ item }: { item: SimAssistantMessage }) {
  const [sources, setSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const lines = item.skeleton_lines ?? 4;
  const widths = ["100%", "92%", "96%", "70%", "88%", "60%"];
  return (
    <div>
      {item.skeleton || !item.markdown ? (
        <div role="group" aria-label="Report" aria-busy="true" className="relative flex flex-col gap-[9px] py-1">
          {Array.from({ length: lines }, (_, i) => (
            <Shimmer key={i} width={widths[i % widths.length]} height={8} />
          ))}
          <span aria-hidden className={styles.sweep} />
        </div>
      ) : (
        <div className="flex flex-col gap-2 text-[14px] leading-[1.55] text-ink-2">
          {item.markdown.split(/\n{2,}/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
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
          {Array.from({ length: Math.min(4, item.source_count ?? 0) }, (_, i) => (
            <span key={i} className="flex items-center gap-2">
              <span aria-hidden className={cn(styles.shimmer, "h-[26px] w-[16px] shrink-0 rounded-[4px] bg-surface-2")} />
              <Shimmer width={`${[72, 58, 66, 50][i]}%`} height={7} />
            </span>
          ))}
          {(item.source_count ?? 0) > 4 ? (
            <p className="pl-6 font-mono text-[11.5px] text-muted">+{(item.source_count ?? 0) - 4} more</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function NextPrompts({ item, onPick }: { item: SimNextPrompts; onPick: (prompt: string) => void }) {
  const [dismissed, setDismissed] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  // Roving focus: the group is one tab stop; Up/Down move, Enter or Space streams the prompt in.
  const [focusIdx, setFocusIdx] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);
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
    <div className="rounded-[12px] p-1.5 shadow-[inset_0_0_0_1px_var(--hairline)]" role="group" aria-label="Next step">
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
              onPick(p.prompt);
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

function TranscriptItem({ item, onPick }: { item: SimChatItem; onPick: (prompt: string) => void }) {
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
      return <AssistantReport item={item} />;
    case "next_prompts":
      return <NextPrompts item={item} onPick={onPick} />;
    case "plan":
      return <PlanCard item={item} />;
    case "budget":
      return <BudgetCard item={item} />;
  }
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
  const [streaming, setStreaming] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const raf = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const fill = (prompt: string) => {
    cancelAnimationFrame(raf.current);
    const finish = () => {
      setStreaming(false);
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
    setStreaming(true);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / total);
      setDraft(prompt.slice(0, Math.ceil(prompt.length * (1 - Math.pow(1 - t, 2)))));
      if (t < 1) raf.current = requestAnimationFrame(step);
      else finish();
    };
    raf.current = requestAnimationFrame(step);
  };

  const workers = search.messages.filter((m): m is SimWorkerTask => m.kind === "worker_task");
  const finished = workers.filter((w) => w.status === "completed").length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        key={search.id}
        className={cn(
          styles.enter,
          styles.noScrollbar,
          styles.fadeBottom,
          "flex min-h-0 flex-1 flex-col gap-2.5 px-4 pb-6 pt-4",
          scrollAreaOverflow(ownsWheel),
        )}
        {...scrollAreaProps(ownsWheel)}
        aria-label="Chat transcript"
        role="log"
      >
        {search.skeleton || search.messages.length === 0 ? (
          <SkeletonTranscript prompt={search.prompt} />
        ) : (
          search.messages.map((m) => <TranscriptItem key={m.id} item={m} onPick={fill} />)
        )}
      </div>

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
        streaming={streaming}
        onDraft={(v) => {
          cancelAnimationFrame(raf.current);
          setStreaming(false);
          setDraft(v);
        }}
        textareaRef={textareaRef}
      />
    </div>
  );
});

// --------------------------------------------------------------------------------- composer

function Composer({
  composer,
  draft,
  streaming,
  onDraft,
  textareaRef,
}: {
  composer: SimComposer;
  draft: string;
  streaming: boolean;
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

  // The demo cannot run a search; sending opens the real product (a real link, so no popup blocker).
  const send = () => {
    if (hasText) sendRef.current?.click();
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
          {hasText ? (
            <a
              ref={sendRef}
              href={GET_STARTED_URL}
              {...phAttrs("simulator_chat", "app")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send: opens ContHunt in a new tab"
              {...sendTip.bind("Run it in ContHunt")}
              className="ml-auto grid size-7 place-items-center rounded-[8px] bg-ink text-paper outline-none transition-[background-color,scale] duration-200 ease-out hover:bg-ink-2 focus-visible:shadow-[0_0_0_2px_var(--accent)] active:scale-[0.94]"
            >
              <ArrowUp aria-hidden className="size-4" strokeWidth={2.25} />
            </a>
          ) : (
            <button
              type="button"
              aria-label="Send"
              aria-disabled
              {...sendTip.bind("Type or pick a next step")}
              className="ml-auto grid size-7 cursor-default place-items-center rounded-[8px] bg-surface-2 text-faint outline-none focus-visible:shadow-[0_0_0_2px_var(--accent)]"
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
