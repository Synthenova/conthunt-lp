"use client";

/**
 * The board's landing sound: cuelume's "navigate" cue in its default theme, a
 * soft paper-like whoosh (owner, hero-rev2 B, replacing the synthesised clack).
 *
 * One subtle play per card landing. The engine calls `clack()` only when a flap
 * lands (or a turned card pops); the fast intermediate flaps are silent. Plays
 * closer than MIN_GAP_MS are dropped, so a cascade never stacks into one loud
 * swell, and each play varies its direction and level a little so the wave
 * reads like riffled cards rather than one sound repeated.
 *
 * Gates, all kept from the clack version:
 *   - the site-wide sound preference (src/lib/sound.ts; it also drives
 *     cuelume's own enabled flag and global volume);
 *   - no sound before the first pointer or key gesture on the page;
 *   - auto-mute when less than 45% of the hero is visible or the tab is hidden.
 * Muting (any gate closing) cancels every pending landing timer.
 */
import { play, unlock as unlockCuelume } from "cuelume";
import { useCallback, useEffect, useState } from "react";
import { setSoundOn, useSound } from "@/lib/sound";

/** Per-play volume, relative (cuelume's global UI volume applies on top). */
const LANDING_VOLUME = 0.5;
/** Plays closer together than this are dropped. */
const MIN_GAP_MS = 45;
/** Fraction of the hero that must be visible for it to count as active. */
const ACTIVE_RATIO = 0.45;

const jitter = (amount = 0.08) => 1 + (Math.random() * 2 - 1) * amount;

export class FlapSynth {
  private enabled = false;
  private active = true;
  private unlocked = false;
  private lastAt = -Infinity;
  private timers = new Set<number>();

  /** Mark audio as allowed and start cuelume's context. Call from a user gesture. */
  unlock(): void {
    if (typeof window === "undefined") return;
    this.unlocked = true;
    void unlockCuelume();
  }

  get ready(): boolean {
    return this.unlocked;
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (!on) this.cancel();
  }

  /** Auto-mute gate (hero visibility, tab visibility). Closing it drops queued landings. */
  setActive(on: boolean): void {
    this.active = on;
    if (!on) this.cancel();
  }

  /** Resolves once cuelume can sound (resume() is async in some browsers). */
  whenReady(): Promise<void> {
    if (!this.unlocked) return Promise.resolve();
    return unlockCuelume().then(() => {});
  }

  /**
   * One card landing. `level` 1 = the lead card, about 0.85 = the rest of the
   * wave; anything under 0.5 is an intermediate flap and stays silent. `delay`
   * is in seconds from now (timers, cancelled when the sound gates close).
   */
  clack(level = 1, delay = 0): void {
    if (level < 0.5 || !this.canPlay()) return;
    if (delay <= 0) {
      this.fire(level);
      return;
    }
    const id = window.setTimeout(() => {
      this.timers.delete(id);
      this.fire(level);
    }, delay * 1000);
    this.timers.add(id);
  }

  private canPlay(): boolean {
    return this.enabled && this.active && this.unlocked && typeof window !== "undefined";
  }

  private fire(level: number): void {
    if (!this.canPlay()) return;
    const now = performance.now();
    if (now - this.lastAt < MIN_GAP_MS) return;
    this.lastAt = now;
    play("navigate", {
      theme: "default",
      emphasis: "subtle",
      // Mostly rising, now and then falling: a riffle, not a loop.
      direction: Math.random() < 0.3 ? "back" : "forward",
      volume: Math.min(1, LANDING_VOLUME * level * jitter(0.12)),
    });
  }

  private cancel(): void {
    for (const id of this.timers) window.clearTimeout(id);
    this.timers.clear();
  }
}

/* ------------------------------------------------------------- preference */

/**
 * The board's sound: the site-wide preference + an "is the hero active" gate.
 * `on` is false during SSR and the first client render, then the saved value.
 */
export function useFlapSound(synth: FlapSynth) {
  const { on } = useSound();
  const [, force] = useState(0);

  useEffect(() => {
    synth.setEnabled(on);
    if (!on) return;
    // Audio can only start after a user gesture.
    const unlock = () => {
      synth.unlock();
      force((n) => n + 1);
    };
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
    };
  }, [on, synth]);

  // Auto-mute whenever the hero is not the active section (or the tab is hidden).
  useEffect(() => {
    const hero = document.getElementById("hero");
    let inView = true;
    const apply = () => synth.setActive(inView && document.visibilityState === "visible");
    const io = hero
      ? new IntersectionObserver(
          ([entry]) => {
            inView = entry.intersectionRatio >= ACTIVE_RATIO;
            apply();
          },
          { threshold: [0, ACTIVE_RATIO, 1] },
        )
      : null;
    apply();
    if (hero && io) io.observe(hero);
    document.addEventListener("visibilitychange", apply);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", apply);
      synth.setActive(false);
    };
  }, [synth]);

  const toggle = useCallback(() => {
    const next = !on;
    if (next) {
      synth.unlock();
      synth.setEnabled(true);
    } else {
      synth.setEnabled(false);
    }
    // setSoundOn enables cuelume first, so the confirmation below can sound.
    setSoundOn(next);
    // Audible confirmation: one landing, from the same gesture.
    if (next) void synth.whenReady().then(() => synth.clack(1));
  }, [on, synth]);

  return { on, toggle };
}
