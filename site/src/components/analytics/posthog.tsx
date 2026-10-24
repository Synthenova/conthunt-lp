"use client";

/**
 * Loads posthog-js. A visit that arrived with a campaign parameter or click id loads immediately.
 * Any other visit waits for the first pointer, key, touch, scroll or wheel, or for idle after
 * load, capped at 5 seconds. The host gate lives in `@/lib/analytics`: production on conthunt.app
 * only, unless NEXT_PUBLIC_POSTHOG_ANYWHERE=1. `/preview` never sends.
 */
import { useEffect } from "react";
import { hasCampaign, parseCampaign } from "@/lib/attribution";
import { startPostHog } from "@/lib/analytics";

const INPUT_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll", "wheel"] as const;
const IDLE_CAP_MS = 5000;

export function PostHogLoader() {
  useEffect(() => {
    if (hasCampaign(parseCampaign(window.location.search))) {
      void startPostHog();
      return;
    }

    let started = false;
    let idleHandle: number | undefined;
    let timer: number | undefined;

    const cleanup = () => {
      for (const type of INPUT_EVENTS) window.removeEventListener(type, start);
      if (idleHandle !== undefined && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleHandle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
    function start() {
      if (started) return;
      started = true;
      cleanup();
      void startPostHog();
    }
    const armIdle = () => {
      if (typeof window.requestIdleCallback === "function") idleHandle = window.requestIdleCallback(start, { timeout: IDLE_CAP_MS });
      else timer = window.setTimeout(start, IDLE_CAP_MS);
    };

    for (const type of INPUT_EVENTS) window.addEventListener(type, start, { passive: true, once: true });
    if (document.readyState === "complete") armIdle();
    else window.addEventListener("load", armIdle, { once: true });

    return () => {
      window.removeEventListener("load", armIdle);
      cleanup();
    };
  }, []);

  return null;
}
