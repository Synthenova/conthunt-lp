"use client";

/**
 * SoundBindings: one delegated listener set that gives the whole site its UI
 * sounds, so sections need no sound code. Mounted once in the root layout.
 *
 * Mapping (see src/lib/sound.ts for the four families):
 *  - click on a choice control (role tab/radio/checkbox/switch/option,
 *    aria-pressed, native checkbox/radio)        → select (direction from position)
 *  - click on any other link / button            → tap (subtle unless it is a primary ink button)
 *  - [aria-expanded] flips right after user input → open / close (subtle)
 *  - pointer enters a content card (hero board cards, <article> cards,
 *    [data-sound-hover])                          → select, subtle, quiet, fine pointers only
 *  - range sliders step                           → select, subtle
 * Opt out anywhere with data-sound="off" on the element or an ancestor.
 * Elements that already use cuelume's own data-cuelume-* bindings are skipped.
 */
import type { PlayOptions } from "cuelume";
import { useEffect } from "react";
import { cue, HOVER_VOLUME, initSound } from "@/lib/sound";

const CHOICE =
  '[role="tab"],[role="radio"],[role="checkbox"],[role="switch"],[role="option"],[role="menuitemradio"],[aria-pressed],input[type="checkbox"],input[type="radio"]';
const ACTION = 'a[href],button,[role="button"],summary,input[type="submit"]';
const HOVER_CARDS = '[data-section="hero"] [role="button"][aria-pressed],article,[data-sound-hover]';
/** How long after a real input an aria-expanded change still counts as the user's. */
const USER_WINDOW_MS = 700;

const skip = (el: Element) => !!el.closest('[data-sound="off"],[data-cuelume-tap],[data-cuelume-select],[data-cuelume-toggle],[data-cuelume-open],[data-cuelume-close],[data-cuelume-navigate]');

function selectedIndex(el: Element): { prev: number; next: number } {
  const role = el.getAttribute("role");
  const group = el.parentElement?.closest('[role="tablist"],[role="radiogroup"],[role="group"],[role="listbox"]') ?? el.parentElement;
  if (!group) return { prev: -1, next: -1 };
  const peers = Array.from(group.querySelectorAll(role ? `[role="${role}"]` : el.tagName.toLowerCase()));
  const prev = peers.findIndex(
    (p) => p !== el && (p.getAttribute("aria-selected") === "true" || p.getAttribute("aria-checked") === "true" || (p as HTMLInputElement).checked === true),
  );
  return { prev, next: peers.indexOf(el) };
}

export function SoundBindings() {
  useEffect(() => {
    initSound();
    let lastInput = -Infinity;
    const markInput = () => {
      lastInput = performance.now();
    };
    const userDriven = () => performance.now() - lastInput < USER_WINDOW_MS;

    // Clicks: choices → select, everything else → tap. Disclosures are left to the observer.
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || !(target instanceof Element)) return;
      const choice = target.closest(CHOICE);
      const action = target.closest(ACTION);
      const el = choice ?? action;
      if (!el || skip(el)) return;
      if (el.hasAttribute("aria-expanded")) return; // open/close comes from the observer
      if (el.matches(":disabled,[aria-disabled='true']")) return;
      if (choice) {
        const { prev, next } = selectedIndex(choice);
        const direction: PlayOptions["direction"] = prev >= 0 && next < prev ? "back" : "forward";
        cue("select", { direction });
        return;
      }
      const primary = el.classList.contains("bg-ink") || el.getAttribute("data-variant") === "primary";
      const input: PlayOptions["input"] = e.detail === 0 ? "keyboard" : "mouse";
      cue("tap", { emphasis: primary ? "normal" : "subtle", input });
    };

    // Disclosures: any aria-expanded flip shortly after user input.
    const observer = new MutationObserver((records) => {
      if (!userDriven()) return;
      for (const r of records) {
        const el = r.target as Element;
        if (skip(el)) continue;
        const now = el.getAttribute("aria-expanded");
        if (now === r.oldValue) continue;
        cue(now === "true" ? "open" : "close", { emphasis: "subtle" });
        break; // one cue per batch
      }
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["aria-expanded"], attributeOldValue: true });

    // Hover on content cards (fine pointers only), once per entry.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let hovered: Element | null = null;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !fine.matches) return;
      const card = (e.target as Element | null)?.closest?.(HOVER_CARDS) ?? null;
      if (card === hovered) return;
      hovered = card;
      if (!card || skip(card)) return;
      cue("select", { emphasis: "subtle", volume: HOVER_VOLUME }, 90);
    };

    // Sliders: one subtle detent per step.
    const lastValue = new WeakMap<HTMLInputElement, number>();
    const onInput = (e: Event) => {
      const el = e.target as HTMLInputElement | null;
      if (!el || el.type !== "range" || skip(el)) return;
      const v = Number(el.value);
      const prev = lastValue.get(el);
      lastValue.set(el, v);
      if (prev === undefined || prev === v) return;
      cue("select", { emphasis: "subtle", direction: v < prev ? "back" : "forward", volume: 0.8 }, 60);
    };

    window.addEventListener("pointerdown", markInput, { capture: true, passive: true });
    window.addEventListener("keydown", markInput, { capture: true, passive: true });
    window.addEventListener("pointerover", onOver as EventListener, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("input", onInput, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointerdown", markInput, { capture: true });
      window.removeEventListener("keydown", markInput, { capture: true });
      window.removeEventListener("pointerover", onOver as EventListener);
      document.removeEventListener("click", onClick);
      document.removeEventListener("input", onInput);
    };
  }, []);

  return null;
}

export default SoundBindings;
