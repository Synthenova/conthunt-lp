"use client";

/**
 * Full Control: the same simulator, full screen, in a native modal <dialog> (the visitor takes over
 * the app; docs/revamp/sections/simulator-fullsize.md B).
 *
 * The dialog's body (the 44px row and the simulator) is 90% of the viewport each way (SIM-SIZE.md,
 * sim.module.css `.fullControlBody`), larger than the landed inline frame. The simulator fills it
 * (`fill`): its canvas grows past 1280 x 800 to the frame's size and aspect at a scale capped at
 * 1:1, so the board gains columns of cards and the transcript gains room; nothing zooms. The page
 * is locked (Lenis stopped), the board and transcript scroll freely (`scrollMode="free"`, no
 * click-to-engage) and the navbar steps aside. It starts on the tab the visitor was looking at. It is a top-layer
 * dialog, so the pinned stage's transforms never clip it, and `data-lenis-prevent` lets the board
 * and transcript scroll natively inside. Close, Esc or a click on the backdrop return to the page
 * and put focus back on the button.
 *
 *   <FullControlButton simulator={props} activeSearchId={() => currentTabId} />
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";
import type { DeepSearchSimulatorProps } from "@/content/simulator/types";
import { useLenis } from "@/components/layout/smooth-scroll";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { DeepSearchSimulator } from "./index";
import styles from "./sim.module.css";

export interface FullControlButtonProps {
  simulator: DeepSearchSimulatorProps;
  /** Reads the inline simulator's current tab when the dialog opens. */
  activeSearchId?: () => string | undefined;
  className?: string;
}

export function FullControlButton({ simulator, activeSearchId, className }: FullControlButtonProps) {
  const [openOn, setOpenOn] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpenOn(activeSearchId?.() ?? simulator.searches[0]?.id ?? "")}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 px-3 text-ink-2 hover:text-ink", className)}
      >
        <Maximize2 aria-hidden className="size-[15px] transition-transform duration-200 ease-out group-hover/button:scale-110" />
        Full Control
      </button>
      {openOn != null ? (
        <FullControlDialog
          simulator={simulator}
          activeSearchId={openOn}
          onClose={() => {
            setOpenOn(null);
            // Next frame: while the modal is still open the page behind it is inert and refuses focus.
            requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
          }}
        />
      ) : null}
    </>
  );
}

function FullControlDialog({
  simulator,
  activeSearchId,
  onClose,
}: {
  simulator: DeepSearchSimulatorProps;
  activeSearchId: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const html = document.documentElement;
    // The fixed navbar steps aside while this modal owns the screen: globals.css keys
    // `[data-site-nav]` off `data-modal-open` on <html> (set after showModal(), cleared on the
    // dialog's `close` event, which Esc fires too, and in cleanup; FOUNDATION.md section 8).
    const clearModalFlag = () => html.removeAttribute("data-modal-open");
    // `close` is queued: one fired by a previous cleanup can land after a reopen (StrictMode).
    const onDialogClose = () => {
      if (!dialog.open) clearModalFlag();
    };
    dialog.addEventListener("close", onDialogClose);
    if (!dialog.open) dialog.showModal();
    html.setAttribute("data-modal-open", "");
    closeRef.current?.focus({ preventScroll: true });
    lenis?.stop();
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      dialog.removeEventListener("close", onDialogClose);
      clearModalFlag();
      html.style.overflow = previous;
      lenis?.start();
      if (dialog.open) dialog.close();
    };
  }, [lenis]);

  return createPortal(
    <dialog
      ref={ref}
      aria-label="Deep Search demo, full control"
      className={styles.fullControl}
      data-lenis-prevent=""
      onCancel={(e) => {
        e.preventDefault();
        onCloseRef.current();
      }}
      // The native `close` event is queued: one fired by an effect cleanup can land after the
      // dialog has been reopened (React StrictMode re-runs effects in dev). Only a dialog that is
      // really closed now reports a close.
      onClose={() => {
        if (!ref.current?.open) onCloseRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCloseRef.current();
      }}
    >
      <div className={styles.fullControlBody}>
        <div className="mb-3 flex h-11 shrink-0 items-center justify-between gap-4">
          <p className="truncate text-[15px] font-medium tracking-[-0.01em] text-ink">
            Full control. <span className="text-muted">Scroll, filter and open any video.</span>
          </p>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close full control"
            aria-keyshortcuts="Escape"
            onClick={() => onCloseRef.current()}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "gap-2 pl-3 pr-2.5")}
          >
            <X aria-hidden className="size-4" />
            Close
            <kbd aria-hidden className="rounded-[6px] bg-paper px-1.5 py-0.5 font-mono text-[11px] leading-none text-ink-2 shadow-[inset_0_0_0_1px_var(--hairline)]">
              Esc
            </kbd>
          </button>
        </div>
        <DeepSearchSimulator
          {...simulator}
          activeSearchId={activeSearchId}
          scrollMode="free"
          fill
          className="min-h-0 flex-1"
          label="Product demo: a completed Deep Search, full control"
        />
      </div>
    </dialog>,
    document.body,
  );
}
