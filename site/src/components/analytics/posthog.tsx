"use client";

/**
 * PostHog, at parity with the legacy pages (index.html, the blog and docs templates), loaded late.
 *
 * Same public project key and options as the legacy snippet: `api_host: '/ingest'` (nginx proxies
 * /ingest/ to us.i.posthog.com, so ad blockers see a first-party path), `ui_host`,
 * `person_profiles: 'always'` and `cross_subdomain_cookie: true`. The key is a public project key
 * (it ships in every legacy page), not a secret.
 *
 * Unlike the legacy pages, which load `array.js` in <head> and block rendering on it, this waits for
 * the first user input (pointer, key, touch, scroll) or for the browser to be idle after `load`
 * (5 s cap), whichever comes first. The script is a plain async tag, so it never competes with LCP
 * or adds main-thread work during the first paint.
 *
 * `capture_pageview: 'history_change'` records the first page view and every client-side route
 * change. The legacy pages are full page loads, so they only needed the default.
 *
 * Production only, and only on conthunt.app hosts: local runs, `next dev` and Cloud Run preview
 * URLs never send events to the production project. Set NEXT_PUBLIC_POSTHOG_ANYWHERE=1 at build
 * time to lift the host check (to test the wiring on a preview revision).
 */
import { useEffect } from "react";

const POSTHOG_KEY = "phc_xYSuTFpO0h1u15WCJBqls5qzDc93YTmY0IXZST6t4J7";
const POSTHOG_ASSET = "https://us-assets.i.posthog.com/static/array.js";
const INPUT_EVENTS = ["pointerdown", "keydown", "touchstart", "scroll", "wheel"] as const;
const IDLE_CAP_MS = 5000;

interface PostHogLike {
  init: (key: string, options: Record<string, unknown>) => void;
  __loaded?: boolean;
}

declare global {
  interface Window {
    posthog?: PostHogLike;
  }
}

function enabledOnThisHost(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (process.env.NEXT_PUBLIC_POSTHOG_ANYWHERE === "1") return true;
  const host = window.location.hostname;
  return host === "conthunt.app" || host.endsWith(".conthunt.app");
}

function loadPostHog(): void {
  if (window.posthog?.__loaded || document.querySelector(`script[src="${POSTHOG_ASSET}"]`)) return;
  const script = document.createElement("script");
  script.src = POSTHOG_ASSET;
  script.async = true;
  script.onload = () => {
    window.posthog?.init(POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      person_profiles: "always",
      cross_subdomain_cookie: true,
      capture_pageview: "history_change",
    });
  };
  document.head.appendChild(script);
}

export function PostHogLoader() {
  useEffect(() => {
    if (!enabledOnThisHost()) return;

    let started = false;
    let idleHandle: number | undefined;
    let timer: number | undefined;

    const cleanup = () => {
      for (const type of INPUT_EVENTS) window.removeEventListener(type, start);
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
    function start() {
      if (started) return;
      started = true;
      cleanup();
      loadPostHog();
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
