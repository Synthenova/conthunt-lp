"use client";

/**
 * CopyButton: copies `text` (or the current URL when `text` is omitted), then flips
 * its icon from copy/link to a check for 1.6s. Both icons stay in the DOM and
 * cross-fade with scale and blur, so the swap is interruptible.
 *
 *   <CopyButton text={code} label="Copy" />
 *   <CopyButton label="Copy link" icon="link" />
 */
import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { capture } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export interface CopyButtonProps {
  text?: string;
  label: string;
  copiedLabel?: string;
  icon?: "copy" | "link";
  className?: string;
}

export function CopyButton({ text, label, copiedLabel = "Copied", icon = "copy", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async () => {
    const value = text ?? window.location.href.split("#")[0];
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      // Clipboard API unavailable (insecure context): fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand("copy");
      ta.remove();
    }
    if (!ok) return;
    if (icon === "link") capture("copy_succeeded", { target: "article_link" });
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  const Idle = icon === "link" ? Link2 : Copy;
  const iconBase =
    "absolute inset-0 m-auto size-[15px] transition-[opacity,scale,filter] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex h-8 select-none items-center gap-2 rounded-chip px-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.02em] text-ink-2",
        "transition-[background-color,color,scale] duration-200 ease-out hover:bg-surface-2 hover:text-ink active:scale-[0.96]",
        "after:absolute after:-inset-1 after:content-['']",
        className,
      )}
    >
      <span className="relative size-[15px]" aria-hidden="true">
        <Idle className={cn(iconBase, copied ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-0")} strokeWidth={1.8} />
        <Check
          className={cn(iconBase, "text-growth", copied ? "scale-100 opacity-100 blur-0" : "scale-[0.25] opacity-0 blur-[4px]")}
          strokeWidth={2.4}
        />
      </span>
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
