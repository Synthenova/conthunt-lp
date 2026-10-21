/**
 * Site-wide sound: one preference, one volume budget, four sound families.
 *
 *   tap        actions: links, buttons, CTAs                  (cuelume "tap")
 *   select     choices: tabs, radios, toggles, card flips,
 *              and a soft hover cue on content cards           (cuelume "select")
 *   disclosure open / close: accordions, menus, sidebars,
 *              hover-reveals                                   (cuelume "open" / "close")
 *   flap       the hero split-flap board: one soft paper
 *              whoosh per card landing                         (cuelume "navigate",
 *                                                               via hero/flap-sound.ts)
 *
 * Cues are synthesized live by cuelume (Web Audio, no files). The preference is
 * set by the navbar toggle (the hero board follows it) and saved in localStorage.
 * Browsers keep audio locked until the first click or key press, so nothing
 * plays on a cold page load.
 */
import { play, setEnabled as setCuelumeEnabled, setVolume, unlock, type PlayOptions, type SoundName } from "cuelume";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "conthunt:sound";
/** Sound is on by default (it still needs a first user gesture to start). */
export const SOUND_DEFAULT_ON = true;
/** Global multiplier for UI cues (cuelume volume, 0–1). */
export const UI_VOLUME = 0.5;
/** Hover cues sit well under clicks. */
export const HOVER_VOLUME = 0.55;

const listeners = new Set<() => void>();

function read(): boolean {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === null ? SOUND_DEFAULT_ON : v === "on";
  } catch {
    return SOUND_DEFAULT_ON;
  }
}

export function isSoundOn(): boolean {
  return typeof window !== "undefined" && read();
}

export function setSoundOn(on: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* private mode: in-memory only via listeners */
  }
  setCuelumeEnabled(on);
  if (on) void unlock();
  listeners.forEach((l) => l());
}

export function subscribeSound(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** `on` is false during SSR and hydration, then the saved preference. */
export function useSound(): { on: boolean; toggle: () => void; set: (on: boolean) => void } {
  const on = useSyncExternalStore(subscribeSound, read, () => false);
  const toggle = useCallback(() => setSoundOn(!read()), []);
  return { on, toggle, set: setSoundOn };
}

/** Apply the saved preference and volume to cuelume (call once on mount). */
export function initSound(): void {
  setVolume(UI_VOLUME);
  setCuelumeEnabled(read());
}

let lastAt = 0;
/** Play a UI cue, respecting the preference and a small anti-stacking gap. */
export function cue(name: SoundName, options: PlayOptions = {}, minGapMs = 45): void {
  if (!isSoundOn()) return;
  const now = performance.now();
  if (now - lastAt < minGapMs) return;
  lastAt = now;
  play(name, options);
}
