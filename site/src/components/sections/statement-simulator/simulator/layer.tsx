"use client";

/**
 * Canvas-level overlay for menus and tooltips.
 *
 * The board and transcript are scroll containers, so a dropdown positioned inside them would be
 * clipped. Menus and tooltips render through a portal into one overlay that covers the 1280 x 800
 * canvas. Positions are converted from screen pixels to design pixels with the live scale
 * (canvas rect width / 1280), so they stay aligned at any --sim-scale.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import styles from "./sim.module.css";

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

interface LayerContextValue {
  canvasRef: RefObject<HTMLDivElement | null>;
  overlay: HTMLDivElement | null;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
}

const LayerContext = createContext<LayerContextValue | null>(null);

export function LayerProvider({ value, children }: { value: LayerContextValue; children: ReactNode }) {
  return <LayerContext.Provider value={value}>{children}</LayerContext.Provider>;
}

export function useLayer(): LayerContextValue {
  const ctx = useContext(LayerContext);
  if (!ctx) throw new Error("useLayer must be used inside the simulator canvas");
  return ctx;
}

/** Anchor rect in design pixels, relative to the canvas. */
export function designRect(canvas: HTMLElement, anchor: Element) {
  const c = canvas.getBoundingClientRect();
  const scale = c.width / (canvas.offsetWidth || CANVAS_W) || 1;
  const r = anchor.getBoundingClientRect();
  return {
    left: (r.left - c.left) / scale,
    right: (r.right - c.left) / scale,
    top: (r.top - c.top) / scale,
    bottom: (r.bottom - c.top) / scale,
    width: r.width / scale,
    height: r.height / scale,
  };
}

// ---------------------------------------------------------------------------------------- Menu

export interface MenuItem {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  checked?: boolean;
}

export interface MenuTriggerProps {
  ref: (el: HTMLButtonElement | null) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  /** Only while the menu is in the DOM (an id reference to a missing element is invalid ARIA). */
  "aria-controls": string | undefined;
  onClick: () => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  "data-open": boolean;
}

export interface SimMenuProps {
  /** Unique id; only one menu is open at a time. */
  id: string;
  /** Menu heading, verbatim from the app (for example "Filter By Date"). */
  title?: string;
  items: MenuItem[];
  /** "radio" closes on select; "checkbox" stays open. */
  mode?: "radio" | "checkbox";
  onSelect: (value: string) => void;
  align?: "start" | "end";
  /** Renders the trigger. Spread `props` onto a <button>. */
  trigger: (props: MenuTriggerProps) => ReactNode;
  className?: string;
  width?: number;
}

export function SimMenu({ id, title, items, mode = "radio", onSelect, align = "start", trigger, className, width = 216 }: SimMenuProps) {
  const { canvasRef, overlay, openMenu, setOpenMenu } = useLayer();
  const open = openMenu === id;
  // Callback-ref state (not a ref object): the trigger is rendered through a render prop.
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const rendered = open && overlay != null;

  const close = useCallback(
    (refocus: boolean) => {
      setOpenMenu(null);
      if (refocus) anchor?.focus({ preventScroll: true });
    },
    [setOpenMenu, anchor],
  );

  // Position before paint, flipping above the trigger when it would overflow the canvas.
  useLayoutEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    const menu = menuRef.current;
    if (!canvas || !anchor || !menu) return;
    const r = designRect(canvas, anchor);
    const h = menu.offsetHeight;
    const below = r.bottom + 6;
    // Layout height (phones use a shorter canvas than the 800 design height).
    const flip = below + h > (canvas.offsetHeight || CANVAS_H) - 10;
    const top = flip ? Math.max(10, r.top - 6 - h) : below;
    const left = align === "end" ? Math.max(10, r.right - width) : Math.min(r.left, CANVAS_W - width - 10);
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
    menu.style.setProperty("--origin", `${flip ? "bottom" : "top"} ${align === "end" ? "right" : "left"}`);
    const first = menu.querySelector<HTMLElement>('[role^="menuitem"][aria-checked="true"], [role^="menuitem"]');
    first?.focus({ preventScroll: true });
  }, [open, canvasRef, align, width, anchor]);

  // Outside click, Escape and scroll close the menu. Only a scroll that moves the trigger counts
  // (the page, or a scroller around the trigger, such as the board for the Rubrics menu): a rail
  // re-snapping after a filter change must not close the header's checkbox menu mid-choice.
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || anchor?.contains(t)) return;
      close(false);
    };
    const onScroll = (e: Event) => {
      const t = e.target;
      if (menuRef.current?.contains(t as Node)) return;
      if (t instanceof Element && anchor && !t.contains(anchor)) return;
      close(false);
    };
    document.addEventListener("pointerdown", onPointer, true);
    canvas?.addEventListener("scroll", onScroll, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      canvas?.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open, canvasRef, close, anchor]);

  const onMenuKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);
    const i = nodes.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = e.key === "ArrowDown" ? (i + 1) % nodes.length : (i - 1 + nodes.length) % nodes.length;
      nodes[next]?.focus({ preventScroll: true });
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      nodes[e.key === "Home" ? 0 : nodes.length - 1]?.focus({ preventScroll: true });
    } else if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    }
  };

  return (
    <>
      {trigger({
        ref: setAnchor,
        "aria-haspopup": "menu",
        "aria-expanded": rendered,
        "aria-controls": rendered ? menuId : undefined,
        onClick: () => setOpenMenu(open ? null : id),
        onKeyDown: (e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpenMenu(id);
          }
        },
        "data-open": open,
      })}
      {rendered
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={title}
              onKeyDown={onMenuKey}
              style={{ width, top: 0, left: 0 }}
              className={cn(
                styles.pop,
                "pointer-events-auto absolute z-10 rounded-[10px] bg-paper p-1 text-[14px] text-ink-2",
                "shadow-[0_0_0_1px_rgb(15_15_15/0.08),0_8px_24px_-6px_rgb(15_15_15/0.18)]",
                className,
              )}
            >
              {title ? (
                <p className="px-2.5 pb-1 pt-1.5 font-mono text-[11.5px] uppercase tracking-[0.04em] text-muted">{title}</p>
              ) : null}
              {items.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role={mode === "radio" ? "menuitemradio" : "menuitemcheckbox"}
                  aria-checked={!!item.checked}
                  tabIndex={-1}
                  onClick={() => {
                    onSelect(item.value);
                    if (mode === "radio") close(true);
                  }}
                  className={cn(
                    "flex h-8 w-full items-center gap-2 rounded-[7px] px-2.5 text-left outline-none transition-colors duration-150",
                    "hover:bg-surface focus-visible:bg-surface",
                    item.checked ? "font-medium text-ink" : "",
                  )}
                >
                  {item.icon ? <span className="grid size-4 place-items-center text-muted">{item.icon}</span> : null}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <Check
                    aria-hidden
                    className={cn("size-3.5 text-ink transition-opacity duration-150", item.checked ? "opacity-100" : "opacity-0")}
                    strokeWidth={2.25}
                  />
                </button>
              ))}
            </div>,
            overlay,
          )
        : null}
    </>
  );
}

// ------------------------------------------------------------------------------------ Tooltip

/**
 * Hover/focus tooltip rendered in the overlay. `side` picks the anchor edge.
 * Usage: const tip = useTooltip(); <button {...tip.bind("Rename chat")} /> {tip.node}
 */
export function useTooltip(side: "right" | "bottom" | "top" = "bottom", enabled = true) {
  const { canvasRef, overlay } = useLayer();
  const [tip, setTip] = useState<{ label: string; x: number; y: number } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const show = useCallback(
    (label: string, el: Element, delay: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const r = designRect(canvas, el);
        if (side === "right") setTip({ label, x: r.right + 10, y: r.top + r.height / 2 });
        else if (side === "top") setTip({ label, x: r.left + r.width / 2, y: r.top - 8 });
        else setTip({ label, x: r.left + r.width / 2, y: r.bottom + 8 });
      }, delay);
    },
    [canvasRef, side],
  );

  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    setTip(null);
  }, []);

  const bind = (label: string) =>
    enabled
      ? {
          onPointerEnter: (e: { currentTarget: Element }) => show(label, e.currentTarget, 280),
          onPointerLeave: hide,
          onFocus: (e: { currentTarget: Element }) => {
            if ((e.currentTarget as HTMLElement).matches(":focus-visible")) show(label, e.currentTarget, 0);
          },
          onBlur: hide,
          onPointerDown: hide,
        }
      : {};

  const node =
    enabled && tip && overlay
      ? createPortal(
          <span
            role="tooltip"
            className={cn(
              styles.pop,
              "pointer-events-none absolute z-20 whitespace-nowrap rounded-[6px] bg-ink px-2 py-1 text-[13px] font-medium leading-none text-paper",
            )}
            style={{
              left: tip.x,
              top: tip.y,
              translate: side === "right" ? "0 -50%" : side === "top" ? "-50% -100%" : "-50% 0",
            }}
          >
            {tip.label}
          </span>,
          overlay,
        )
      : null;

  return { bind, node, hide };
}
