"use client";

/**
 * RankingExplainer: the "How ranking works" popover in the header facts row.
 *
 * A four-segment bar shows how the score is weighted; hovering or focusing a segment
 * explains it. Opens as a floating panel (no layout shift), closes on Esc, outside click or
 * the trigger. Only the seed snapshot has public weights; live boards show a plain summary.
 * Each source says what it is: the snapshot names the day it was taken.
 */
import { Info } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { LazyMotionConfig } from "@/components/ui/lazy-motion";
import { useEffect, useId, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { Hue } from "@/lib/tones";
import { toneMarkBg } from "@/lib/tones";
import { snapshotNote } from "@/lib/viral-now/copy";
import { MAX_PER_CREATOR, rankingSummary, SEED_INGREDIENTS, type IngredientKey } from "@/lib/viral-now/ranking";
import { useViralNow } from "./provider";
import styles from "./viral-now.module.css";

/** Factor dots (COLOR_SYSTEM.md): reach blue, engagement purple, velocity green, recency yellow. */
const INGREDIENT_HUE: Record<IngredientKey, Hue> = { reach: "blue", engagement: "purple", velocity: "green", recency: "yellow" };

export function RankingExplainer({ className }: { className?: string }) {
  const { board } = useViralNow();
  const [open, setOpen] = useState(false);
  const [hot, setHot] = useState<IngredientKey>("reach");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = SEED_INGREDIENTS.find((i) => i.key === hot) ?? SEED_INGREDIENTS[0];

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(buttonVariants({ variant: "secondary", size: "md" }), "group/explain")}
      >
        <Info className="size-4 text-ink-2/70 transition-colors duration-200 group-hover/explain:text-ink" strokeWidth={2} />
        How ranking works
      </button>

      <LazyMotionConfig>
        <AnimatePresence>
          {open && (
            <m.div
              id={panelId}
              role="region"
              aria-label="How ranking works"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.99, transition: { duration: 0.12 } }}
              transition={{ type: "spring", duration: 0.35, bounce: 0 }}
              style={{ transformOrigin: "top right" }}
              className="absolute right-0 top-full z-40 mt-3 flex w-[min(620px,calc(100vw-40px))] flex-col gap-4 rounded-btn bg-paper p-5 text-left normal-case shadow-float"
            >
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">How a score is made</p>
              <p className="text-sm leading-snug text-ink-2">{rankingSummary(board.kind)}</p>

              {(board.kind === "seed" || board.kind === "mixed") && (
                <>
                  <div className={styles.weightBar} role="group" aria-label="Score weights">
                    {SEED_INGREDIENTS.map((ingredient) => (
                      <button
                        key={ingredient.key}
                        type="button"
                        className={styles.weightSeg}
                        data-on={hot === ingredient.key ? "true" : "false"}
                        style={{ flexGrow: ingredient.weight, flexBasis: 0 }}
                        onPointerEnter={() => setHot(ingredient.key)}
                        onFocus={() => setHot(ingredient.key)}
                        aria-label={`${ingredient.label}, ${ingredient.weight} percent of the score`}
                      >
                        <span className="truncate">
                          <span aria-hidden="true" className={cn("mr-1.5 inline-block size-1.5 rounded-full align-middle", toneMarkBg[INGREDIENT_HUE[ingredient.key]])} />
                          {ingredient.label}
                        </span>
                        <span>{ingredient.weight}%</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex min-h-[3.25rem] flex-col gap-1" aria-live="polite">
                    <p className="text-sm font-semibold text-ink">{current.measures}</p>
                    <p className="text-sm leading-snug text-ink-2/70">{current.why}</p>
                  </div>
                  <p className="flex flex-col gap-1 border-t border-hairline pt-3 font-mono text-[11px] tracking-[0.02em] text-ink-2/70">
                    <span>Normalized inside each niche. At most {MAX_PER_CREATOR} videos per creator.</span>
                    <span>{snapshotNote(board.kind === "seed" ? board.at : null)}</span>
                  </p>
                </>
              )}
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotionConfig>
    </div>
  );
}
