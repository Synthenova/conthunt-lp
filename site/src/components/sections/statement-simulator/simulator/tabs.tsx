"use client";

/**
 * Tab strip (ChatTabs, simulator-spec §4): one research tab per completed deep search,
 * `SearchCheck` + label, no count badge.
 *
 * The active pill is a duplicate row of ink labels on a surface fill, clipped with an animated
 * `clip-path: inset(... round 8px)` to the active tab. The pill and the ink text slide together and
 * the text colour flips exactly at the pill edge, using clip-path only (no layout animation).
 */
import { memo, useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { SearchCheck } from "lucide-react";
import type { SimDeepSearch } from "@/content/simulator/types";
import { cn } from "@/lib/cn";

const TAB = "flex h-8 max-w-[224px] shrink-0 items-center gap-1.5 px-3.5 text-[14px] font-semibold tracking-[-0.005em]";

export const TabStrip = memo(function TabStrip({
  searches,
  activeId,
  onChange,
  onIntent,
  idPrefix,
}: {
  searches: SimDeepSearch[];
  activeId: string;
  onChange: (id: string) => void;
  /** Hover or focus on a tab (its run starts loading, ./runs.ts). */
  onIntent?: (id: string) => void;
  idPrefix: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const place = () => {
      const list = listRef.current;
      const pill = pillRef.current;
      const btn = list?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(activeId)}"]`);
      if (!list || !pill || !btn) return;
      const left = btn.offsetLeft;
      const right = list.offsetWidth - (btn.offsetLeft + btn.offsetWidth);
      pill.style.clipPath = `inset(0px ${right}px 0px ${left}px round 8px)`;
    };
    place();
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) place();
    });
    return () => {
      cancelled = true;
    };
  }, [activeId, searches]);

  // Enable the transition only after the first placement, so the pill does not slide in on load.
  useEffect(() => {
    const id = requestAnimationFrame(() => pillRef.current?.setAttribute("data-ready", ""));
    return () => cancelAnimationFrame(id);
  }, []);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = searches.findIndex((s) => s.id === activeId);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % searches.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + searches.length) % searches.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = searches.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const id = searches[next].id;
    onChange(id);
    listRef.current?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
  };

  return (
    <div ref={listRef} role="tablist" aria-label="Completed deep searches" className="relative flex items-center" onKeyDown={onKey}>
      {searches.map((s) => {
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            id={`${idPrefix}-tab-${s.id}`}
            data-tab={s.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(s.id)}
            onPointerEnter={() => onIntent?.(s.id)}
            onFocus={() => onIntent?.(s.id)}
            className={cn(
              TAB,
              "rounded-[8px] text-muted outline-none transition-colors duration-150 hover:bg-ink/[0.03] hover:text-ink-2",
              "focus-visible:shadow-[inset_0_0_0_2px_var(--accent)]",
            )}
          >
            <SearchCheck aria-hidden className="size-4 shrink-0" strokeWidth={1.9} />
            <span className="truncate">{s.tab_label}</span>
          </button>
        );
      })}
      <div
        ref={pillRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center rounded-[8px] bg-surface text-ink",
          "shadow-[inset_0_0_0_1px_rgb(15_15_15/0.05)]",
          "[&[data-ready]]:transition-[clip-path] [&[data-ready]]:duration-[360ms] [&[data-ready]]:ease-out",
        )}
        style={{ clipPath: "inset(0px 100% 0px 0px round 8px)" }}
      >
        {searches.map((s) => (
          <span key={s.id} className={TAB}>
            <SearchCheck aria-hidden className="size-4 shrink-0" strokeWidth={1.9} />
            <span className="truncate">{s.tab_label}</span>
          </span>
        ))}
      </div>
    </div>
  );
});
