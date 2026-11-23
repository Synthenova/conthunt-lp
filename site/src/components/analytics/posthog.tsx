"use client";

/**
 * First-party PostHog loader + cross-subdomain attribution handoff for conthunt.app.
 *
 * Key properties:
 * - Loads `array.js` from first-party `/ingest/static/array.js` (proxied by nginx to
 *   us-assets.i.posthog.com) instead of the third-party host so ad blockers do not drop
 *   landing-page pageviews or the `.conthunt.app` identity cookie.
 * - Starts loading asynchronously on mount (no input/5s deferral) so fast CTA clicks
 *   still record `$pageview` and set the cross-subdomain cookie before reaching
 *   `agent.conthunt.app`.
 * - Persists incoming `utm_*` (including `utm_term`) and `gclid` in `sessionStorage`
 *   across internal navigation and forwards them (plus `ch_placement`) onto outbound
 *   `agent.conthunt.app` links and the hero search redirect.
 * - Captures canonical `outbound_app` events with `sendBeacon` transport so clicks
 *   survive immediate page unload.
 *
 * Production only, and only on conthunt.app hosts: local runs, `next dev` and Cloud Run preview
 * URLs never send events to the production project. Set NEXT_PUBLIC_POSTHOG_ANYWHERE=1 at build
 * time to lift the host check (to test the wiring on a preview revision).
 */
import { useEffect } from "react";
import { APP_URL } from "@/lib/links";

const POSTHOG_KEY = "phc_xYSuTFpO0h1u15WCJBqls5qzDc93YTmY0IXZST6t4J7";
const POSTHOG_ASSET = "/ingest/static/array.js";
const ATTRIBUTION_STORAGE_KEY = "ch_lp_attribution";
const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
] as const;

type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
type AttributionParams = Partial<Record<AttributionKey, string>>;

interface PostHogLike {
  init: (key: string, options: Record<string, unknown>) => void;
  capture?: (event: string, properties?: Record<string, unknown>, options?: Record<string, unknown>) => void;
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

function appOrigin(): string | null {
  try {
    return new URL(APP_URL).origin;
  } catch {
    return null;
  }
}

function readStoredAttribution(): AttributionParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: AttributionParams = {};
    for (const key of ATTRIBUTION_KEYS) {
      const value = parsed[key];
      if (typeof value === "string" && value.trim()) out[key] = value.trim();
    }
    return out;
  } catch {
    return {};
  }
}

function persistIncomingAttribution(): AttributionParams {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const incoming: AttributionParams = {};
  let foundAny = false;
  for (const key of ATTRIBUTION_KEYS) {
    const value = params.get(key)?.trim();
    if (value) {
      incoming[key] = value;
      foundAny = true;
    }
  }
  if (!foundAny) return readStoredAttribution();
  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(incoming));
  } catch {
    // Ignore storage errors (private browsing / restricted iframes).
  }
  return incoming;
}

function inferPlacement(anchor: HTMLAnchorElement, target: URL): string {
  const explicit = anchor.dataset.chPlacement?.trim();
  if (explicit) return explicit;
  if (target.pathname === "/login") return "navbar_login";
  const path = window.location.pathname || "/";
  if (path === "/pricing" || path.startsWith("/pricing/")) return "pricing_cta";
  if (path === "/viral-now" || path.startsWith("/viral-now/")) return "viral_now_cta";
  if (path === "/tools" || path.startsWith("/tools/")) return "free_tool_cta";
  if (path.startsWith("/blog/") || path.startsWith("/resources/")) return "article_cta";
  if (anchor.closest("header, nav")) return "navbar_cta";
  return "landing_cta";
}

/** Attach stored UTM / gclid parameters and `ch_placement` to an outbound app URL without overwriting existing params. */
export function decorateAppUrl(url: URL, placement?: string): URL {
  const attribution = persistIncomingAttribution();
  for (const key of ATTRIBUTION_KEYS) {
    const value = attribution[key];
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  if (placement && !url.searchParams.has("ch_placement")) {
    url.searchParams.set("ch_placement", placement);
  }
  return url;
}

/** Record an outbound click or handoff to `agent.conthunt.app` using sendBeacon so navigation never drops it. */
export function captureOutboundApp(
  target: URL,
  placement: string,
  extra?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  const attribution = readStoredAttribution();
  window.posthog?.capture?.(
    "outbound_app",
    {
      source_path: window.location.pathname || "/",
      destination_path: target.pathname,
      destination_host: target.host,
      placement,
      ...attribution,
      ...extra,
    },
    { transport: "sendBeacon" },
  );
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
    persistIncomingAttribution();
    if (enabledOnThisHost()) loadPostHog();

    const targetOrigin = appOrigin();
    if (!targetOrigin) return;

    const onClick = (event: MouseEvent) => {
      const targetEl = event.target instanceof Element ? event.target : null;
      const anchor = targetEl?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      let parsed: URL;
      try {
        parsed = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (parsed.origin !== targetOrigin) return;

      const placement = inferPlacement(anchor, parsed);
      decorateAppUrl(parsed, placement);
      anchor.href = parsed.toString();
      captureOutboundApp(parsed, placement, {
        cta_text: (anchor.textContent || "").trim().slice(0, 80) || undefined,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
