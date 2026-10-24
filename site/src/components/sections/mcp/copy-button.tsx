"use client";

/**
 * CopyButton — copies `text`, morphing its icon from copy to check (scale 0.25 → 1,
 * blur 4px → 0, spring with no bounce) and announcing the result politely.
 *
 *   <CopyButton text={snippet.copy} label="Copy setup" />
 *   <CopyButton text={url} label="Copy server URL" showLabel={false} />
 *
 *   <CopyButton text={MCP_SERVER_URL} label="Copy MCP server URL">{SERVER_HOST}</CopyButton>
 *
 * Every successful copy also dispatches `MCP_COPY_EVENT` on window.
 *
 * Falls back to a hidden textarea + execCommand when the async Clipboard API is
 * unavailable (insecure origin, old browser). On failure the icon turns into an ×, the
 * visible label (or the chip's own text) says "Select to copy", and the live region
 * explains. Labels swap in place without changing the button's width.
 */
import { AnimatePresence, m } from "motion/react";
import { LazyMotionConfig } from "@/components/ui/lazy-motion";
import { capture } from "@/lib/analytics";
import { Check, Copy, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { MCP_COPY_EVENT } from "./events";

type CopyState = "idle" | "copied" | "error";

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

const ICON = {
  initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  transition: { type: "spring" as const, duration: 0.3, bounce: 0 },
};

export interface CopyButtonProps {
  text: string;
  /** Accessible name, e.g. "Copy setup command". */
  label: string;
  /** Show the visible "Copy / Copied" text. Default true. */
  showLabel?: boolean;
  className?: string;
  /** Called after a successful copy (analytics, flourish). */
  onCopied?: () => void;
  /** Named copy for analytics. Omitted copies (tool examples) are not events. */
  analytics?: { target: "mcp_url" | "mcp_command" | "mcp_config"; client?: string };
  /** Custom visible content instead of the "Copy / Copied" label (e.g. the URL itself). */
  children?: ReactNode;
}

export function CopyButton({ text, label, showLabel = true, className, onCopied, analytics, children }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onClick = async () => {
    const ok = await writeClipboard(text);
    setState(ok ? "copied" : "error");
    if (ok) {
      onCopied?.();
      if (analytics) {
        capture("copy_succeeded", {
          target: analytics.target,
          ...(analytics.client ? { client: analytics.client } : {}),
        });
      }
      window.dispatchEvent(new CustomEvent(MCP_COPY_EVENT));
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), ok ? 1800 : 2600);
  };

  const copied = state === "copied";

  /*
   * Visible labels share one grid cell and cross-fade, so the button always has the width
   * of its longest label and nothing around it shifts. With `children` (the URL chip) the
   * chip's own text swaps to "Copied" or "Select to copy"; the plain label variant swaps
   * "Copy" ↔ "Copied" and only grows for the rare failure message.
   */
  const layers: { key: CopyState; node: ReactNode }[] = children
    ? [
        { key: "idle", node: children },
        { key: "copied", node: "Copied" },
        { key: "error", node: "Select to copy" },
      ]
    : showLabel
      ? [
          { key: "idle", node: "Copy" },
          { key: "copied", node: "Copied" },
          ...(state === "error" ? [{ key: "error" as const, node: "Select to copy" }] : []),
        ]
      : [];

  return (
    <LazyMotionConfig>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={state === "error" ? "Copy failed. Select the text to copy it." : undefined}
        className={cn(
          "group/copy relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[6px] px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.04em] text-ink/64",
          "transition-[color,background-color,scale] duration-150 ease-out hover:bg-surface hover:text-ink active:scale-[0.96]",
          "before:absolute before:-inset-1.5 before:content-['']",
          state !== "idle" && "text-ink",
          className,
        )}
      >
        <span className="relative grid size-3.5 place-items-center" aria-hidden="true">
          <AnimatePresence initial={false} mode="popLayout">
            {copied ? (
              <m.span key="check" className="absolute inset-0 grid place-items-center" {...ICON}>
                <Check className="size-3.5" strokeWidth={2.25} />
              </m.span>
            ) : state === "error" ? (
              <m.span key="error" className="absolute inset-0 grid place-items-center" {...ICON}>
                <X className="size-3.5" strokeWidth={2} />
              </m.span>
            ) : (
              <m.span key="copy" className="absolute inset-0 grid place-items-center" {...ICON}>
                <Copy className="size-3.5" strokeWidth={1.75} />
              </m.span>
            )}
          </AnimatePresence>
        </span>
        {layers.length > 0 && (
          <span aria-hidden="true" className="grid text-left tabular-nums">
            {layers.map((l) => (
              <span
                key={l.key}
                className={cn(
                  "col-start-1 row-start-1 whitespace-nowrap transition-[opacity,translate] duration-200 ease-out",
                  l.key === state ? "translate-y-0 opacity-100" : "translate-y-[3px] opacity-0",
                )}
              >
                {l.node}
              </span>
            ))}
          </span>
        )}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "copied" ? "Copied to clipboard" : state === "error" ? "Copy failed. Select the text to copy it." : ""}
      </span>
    </LazyMotionConfig>
  );
}
