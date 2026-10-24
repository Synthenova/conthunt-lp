"use client";

/**
 * MobileMenu — the < 768px menu button and the sheet it opens.
 *
 * The sheet is portalled to <body> (the bar uses backdrop-filter, which would
 * otherwise become the containing block for position:fixed). It drops from the
 * top under the solid navbar bar (header z-50 > sheet z-40), so the same button
 * closes it. While open:
 * - Lenis and page scroll are locked; Escape closes.
 * - Everything outside the navbar, the sheet and its scrim is `inert` (#main, the
 *   footer, the skip link and any other body child), so neither Tab, a screen
 *   reader's virtual cursor nor a stray tap can reach the page behind it.
 * - Focus moves to the first sheet link, and Tab / Shift+Tab cycle through the
 *   menu button and the sheet's controls (the Close button's forward Tab goes to
 *   the first sheet link). Focus returns to the menu button on close.
 * - The button's aria-controls points at the sheet only while the sheet exists.
 * Links close the sheet on click. The sheet's "Interface sounds" switch is the
 * phone's sound control (the desktop toggle is hidden below 768px); it shares
 * the site-wide preference from `useSound()`.
 *
 * Motion runs on the Web Animations API (no animation library in every page's first-load
 * JavaScript): the sheet drops in from 12px up at 98% scale and fades (0.4s, ease-out) and
 * leaves to 8px up; the scrim fades (0.3s); the menu and close icons cross-fade with a 45°
 * turn (0.25s). An interrupted transition starts from where it is on screen. Under reduced
 * motion only the fades run; the moves are instant.
 */
import Link from "next/link";
import { Menu, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "@/components/layout/smooth-scroll";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/motion";
import { useSound } from "@/lib/sound";
import { phAttrs } from "@/lib/attribution";
import { GET_STARTED_URL, isActivePath, LOGIN_URL, NAV_LINKS, ROUTES } from "@/lib/links";
import { navDotClass } from "./nav-dot";

const EASE_OUT = "cubic-bezier(0.2, 0.715, 0.205, 0.99)";
/** The default fade curve of the menu's original motion transitions (the scrim). */
const EASE_FADE = "cubic-bezier(0.25, 0.1, 0.35, 1)";
const SHEET_REST = "translateY(0px) scale(1)";
const SHEET_FROM = "translateY(-12px) scale(0.98)";
const SHEET_EXIT = "translateY(-8px) scale(0.98)";
const ICON_REST = "rotate(0deg) scale(1)";
const ICON_FROM = "rotate(-45deg) scale(0.8)";
const ICON_EXIT = "rotate(45deg) scale(0.8)";
const subscribeNoop = () => () => {};

interface LayerState {
  opacity: number;
  transform?: string;
}

/**
 * Animates `el` to `to`. It starts from `from`, or from its current on-screen opacity and
 * transform when another animation is still running on it (an interrupted open or close).
 * With `instantTransform`, the transform jumps to its end value and only the opacity moves.
 */
function animateLayer(
  el: HTMLElement,
  from: LayerState,
  to: LayerState,
  options: { duration: number; easing: string; instantTransform: boolean },
): Animation {
  const running = el.getAnimations();
  let start = from;
  if (running.length) {
    const cs = getComputedStyle(el);
    start = { opacity: Number(cs.opacity), transform: cs.transform === "none" ? from.transform : cs.transform };
    running.forEach((a) => a.cancel());
  }
  const startFrame: Keyframe = { opacity: start.opacity };
  const endFrame: Keyframe = { opacity: to.opacity };
  if (to.transform) {
    startFrame.transform = options.instantTransform ? to.transform : start.transform;
    endFrame.transform = to.transform;
  }
  return el.animate([startFrame, endFrame], { duration: options.duration, easing: options.easing, fill: "both" });
}

/** Lets a finished animation go (its end state equals the element's own styles), then runs `then`. */
function release(anim: Animation, then?: () => void) {
  anim.finished.then(
    () => {
      anim.cancel();
      then?.();
    },
    () => {},
  );
}
/** Marks the portalled scrim and sheet, which stay interactive while the page behind is inert. */
const LAYER_ATTR = "data-mobile-menu-layer";
const LAYER_PROPS = { [LAYER_ATTR]: "" };
const FOCUSABLE = 'a[href], button:not([disabled]), [role="switch"]:not([aria-disabled="true"])';
/** Never made inert: non-rendering tags, Next's route announcer (an inert live region stays
 * silent, and a menu link navigates while the sheet closes) and the dev overlay portal. */
const NEVER_INERT = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NEXT-ROUTE-ANNOUNCER", "NEXTJS-PORTAL"]);

/**
 * Sets `inert` on every element under <body> that neither is nor contains one of
 * `keep`, descending only into ancestors of kept elements. Returns the undo,
 * which clears only the attributes it set.
 */
function inertOutside(keep: Element[]): () => void {
  const changed: HTMLElement[] = [];
  const walk = (parent: Element) => {
    for (const child of Array.from(parent.children)) {
      if (!(child instanceof HTMLElement) || child.hasAttribute(LAYER_ATTR)) continue;
      if (keep.includes(child)) continue;
      if (keep.some((k) => child.contains(k))) {
        walk(child);
        continue;
      }
      if (child.inert || NEVER_INERT.has(child.tagName)) continue;
      child.inert = true;
      changed.push(child);
    }
  };
  walk(document.body);
  return () => changed.forEach((el) => (el.inert = false));
}

/** Phone sound control: a 56px row styled like the sheet's Login button, with a constant name. */
function SoundRow() {
  const { on, toggle } = useSound();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      className={buttonVariants({ variant: "secondary", size: "lg", className: "w-full justify-between px-5" })}
    >
      <span className="flex items-center gap-3">
        {on ? (
          <Volume2 className="size-[18px] text-ink" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <VolumeX className="size-[18px] text-muted" strokeWidth={1.75} aria-hidden="true" />
        )}
        Interface sounds
      </span>
      <span
        aria-hidden="true"
        className={cn("relative h-6 w-10 rounded-full transition-colors duration-200 ease-out", on ? "bg-ink" : "bg-ink/15")}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-paper shadow-[0_1px_2px_rgba(15,15,15,0.24)] transition-transform duration-200 ease-out",
            on ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}

export function MobileMenu({
  open,
  onOpenChange,
  pathname,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string | null;
}) {
  const sheetId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const menuIconRef = useRef<HTMLSpanElement>(null);
  const closeIconRef = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();
  const isClient = useSyncExternalStore(subscribeNoop, () => true, () => false);
  // The layers stay mounted after `open` turns false, until the sheet's exit animation ends.
  const [leaving, setLeaving] = useState(false);
  const [shownOpen, setShownOpen] = useState(open);
  if (shownOpen !== open) {
    setShownOpen(open);
    setLeaving(!open);
  }
  const mounted = open || leaving;
  const animatedOpen = useRef(open);

  // Open and close transitions, before paint (no frame shows an end state early).
  useIsomorphicLayoutEffect(() => {
    if (animatedOpen.current === open) return;
    animatedOpen.current = open;
    const reduce = prefersReducedMotion();
    const iconIn = open ? closeIconRef.current : menuIconRef.current;
    const iconOut = open ? menuIconRef.current : closeIconRef.current;
    const icon = { duration: 250, easing: EASE_OUT, instantTransform: reduce };
    if (iconIn) release(animateLayer(iconIn, { opacity: 0, transform: ICON_FROM }, { opacity: 1, transform: ICON_REST }, icon));
    if (iconOut) release(animateLayer(iconOut, { opacity: 1, transform: ICON_REST }, { opacity: 0, transform: ICON_EXIT }, icon));
    const sheet = sheetRef.current;
    const scrim = scrimRef.current;
    if (!sheet || !scrim) return;
    const sheetMotion = { duration: 400, easing: EASE_OUT, instantTransform: reduce };
    const scrimMotion = { duration: 300, easing: EASE_FADE, instantTransform: reduce };
    if (open) {
      release(animateLayer(sheet, { opacity: 0, transform: SHEET_FROM }, { opacity: 1, transform: SHEET_REST }, sheetMotion));
      release(animateLayer(scrim, { opacity: 0 }, { opacity: 1 }, scrimMotion));
    } else {
      // The sheet's exit is the longer one: it unmounts both layers when it ends.
      animateLayer(scrim, { opacity: 1 }, { opacity: 0 }, scrimMotion);
      release(animateLayer(sheet, { opacity: 1, transform: SHEET_REST }, { opacity: 0, transform: SHEET_EXIT }, sheetMotion), () =>
        setLeaving(false),
      );
    }
  }, [open]);

  // Scroll lock, inert page, Escape, focus trap, breakpoint close.
  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    lenis?.stop();

    // The sheet and scrim are portalled in this same commit, so they exist now.
    const header = button?.closest("[data-site-nav]") ?? button;
    const restoreInert = inertOutside([header, sheetRef.current].filter((el): el is Element => !!el));

    const focusables = () =>
      [button, ...(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter(
        (el): el is HTMLElement => !!el,
      );
    // The sheet mounts in the same commit; focus its first link next frame.
    const focusFrame = requestAnimationFrame(() =>
      sheetRef.current?.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true }),
    );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      // Drive every step: the sheet sits at the end of <body>, far from the button in
      // DOM order, so the browser's own order would not match the visual one.
      e.preventDefault();
      const i = list.indexOf(document.activeElement as HTMLElement);
      const last = list.length - 1;
      const next = e.shiftKey ? (i <= 0 ? last : i - 1) : i === -1 || i === last ? 0 : i + 1;
      list[next].focus();
    };
    document.addEventListener("keydown", onKey);

    const mql = window.matchMedia("(min-width: 768px)");
    const onBreakpoint = () => {
      if (mql.matches) onOpenChange(false);
    };
    mql.addEventListener("change", onBreakpoint);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKey);
      mql.removeEventListener("change", onBreakpoint);
      restoreInert();
      root.style.overflow = prevOverflow;
      lenis?.start();
      button?.focus({ preventScroll: true });
    };
  }, [open, lenis, onOpenChange]);

  const close = () => onOpenChange(false);
  const linkClass = (active: boolean) =>
    cn(
      "flex h-14 items-center justify-between border-b border-hairline text-[22px] font-semibold tracking-[-0.02em]",
      active ? "text-ink" : "text-muted",
    );

  const sheet = mounted ? (
    <>
      <div
        {...LAYER_PROPS}
        ref={scrimRef}
        aria-hidden="true"
        onClick={close}
        className="fixed inset-0 z-40 bg-ink/15 backdrop-blur-[2px] md:hidden"
      />
      <div
        {...LAYER_PROPS}
        ref={sheetRef}
        id={sheetId}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="fixed inset-x-2 top-2 z-40 origin-top rounded-[24px] border border-hairline bg-paper px-5 pt-[76px] pb-5 shadow-float md:hidden"
        data-lenis-prevent
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col">
            <li>
              <Link
                href={ROUTES.home}
                onClick={close}
                aria-current={pathname === ROUTES.home ? "page" : undefined}
                className={linkClass(pathname === ROUTES.home)}
              >
                Home
              </Link>
            </li>
            {NAV_LINKS.map((link) => {
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={linkClass(active)}
                  >
                    {link.label}
                    {active && <span aria-hidden="true" className={cn("size-1.5 rounded-full", navDotClass(link.label))} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-6">
          <SoundRow />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button href={LOGIN_URL} variant="secondary" size="lg" onClick={close} {...phAttrs("nav_mobile", "login")}>
            Login
          </Button>
          <Button href={GET_STARTED_URL} size="lg" onClick={close} {...phAttrs("nav_mobile", "app")}>
            Get started
          </Button>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={open ? sheetId : undefined}
        onClick={() => onOpenChange(!open)}
        className="relative flex size-10 items-center justify-center rounded-[12px] text-ink transition-colors duration-200 ease-out hover:bg-surface md:hidden"
      >
        {/* Both icons stay mounted, stacked; the hidden one waits faded out. */}
        <span ref={menuIconRef} className={cn("absolute inset-0 flex items-center justify-center", open && "opacity-0")}>
          <Menu className="size-5" strokeWidth={1.75} />
        </span>
        <span ref={closeIconRef} className={cn("absolute inset-0 flex items-center justify-center", !open && "opacity-0")}>
          <X className="size-5" strokeWidth={1.75} />
        </span>
      </button>
      {isClient && createPortal(sheet, document.body)}
    </>
  );
}
