/**
 * Browser analytics client for the Next site. `capture` queues until posthog-js has loaded,
 * then flushes in order. Static pages cannot import this module; they load
 * `/public/conthunt-analytics.js`, which sends the same event names.
 */
import type { PostHog } from "posthog-js";
import { hadUtm, readLastTouch, rememberAttribution, type CampaignParams, type InternalSource } from "@/lib/attribution";
import {
  analyticsAllowed,
  createCaptureQueue,
  isIntent,
  type QueuedCapture,
} from "@/lib/analytics-model";

export const POSTHOG_KEY = "phc_xYSuTFpO0h1u15WCJBqls5qzDc93YTmY0IXZST6t4J7";
export const POSTHOG_API_HOST = "/ingest";
export const POSTHOG_UI_HOST = "https://us.posthog.com";

export type PageType =
  | "home"
  | "pricing"
  | "viral_now"
  | "resources"
  | "article"
  | "blog_index"
  | "blog_post"
  | "docs"
  | "legal"
  | "not_found";

type AnalyticsClient = Pick<PostHog, "capture" | "register">;

const queue = createCaptureQueue();
let client: AnalyticsClient | null = null;
let starting: Promise<AnalyticsClient | null> | null = null;
let hadIntent = false;
let sectionEngaged = false;
const onceKeys = new Set<string>();

let pageType: PageType = "home";
let contentSlug = "";

export function analyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return analyticsAllowed({
    nodeEnv: process.env.NODE_ENV,
    anywhere: process.env.NEXT_PUBLIC_POSTHOG_ANYWHERE === "1",
    hostname: window.location.hostname,
    pathname: window.location.pathname,
  });
}

export function pageTypeFromPath(pathname: string): PageType {
  if (pathname === "/") return "home";
  if (pathname === "/pricing" || pathname.startsWith("/pricing/")) return "pricing";
  if (pathname === "/viral-now" || pathname.startsWith("/viral-now/")) return "viral_now";
  if (pathname === "/resources") return "resources";
  if (pathname.startsWith("/resources/")) return "article";
  return "home";
}

export function getPageType(): PageType {
  return pageType;
}

export function setPageContext(next: { pageType?: PageType; slug?: string }): void {
  if (next.pageType) pageType = next.pageType;
  if (next.slug !== undefined) contentSlug = next.slug;
  syncSuperProperties();
}

export function resetPageEngagement(): void {
  hadIntent = false;
  sectionEngaged = false;
  onceKeys.clear();
}

export function markSectionEngaged(): void {
  sectionEngaged = true;
}

export function engagement(): { hadIntent: boolean; sectionEngaged: boolean } {
  return { hadIntent, sectionEngaged };
}

/** Resources articles tag app links when the visit arrived with no campaign of its own. */
export function internalCampaign(): { source: InternalSource; campaign: string } | null {
  if (pageType === "article") return { source: "resources", campaign: contentSlug || "article" };
  if (pageType === "resources") return { source: "resources", campaign: "index" };
  return null;
}

function superProperties(): Record<string, string> {
  const touch: CampaignParams = typeof window === "undefined" ? {} : readLastTouch();
  return { site_area: "marketing", page_type: pageType, ...touch };
}

export function syncSuperProperties(): void {
  client?.register(superProperties());
}

function deliver(ph: AnalyticsClient, event: QueuedCapture): void {
  ph.capture(
    event.name,
    event.properties,
    event.beacon ? { transport: "sendBeacon", send_instantly: true } : undefined,
  );
}

function flush(ph: AnalyticsClient): void {
  queue.flush((event) => deliver(ph, event));
}

/** Start loading posthog-js. Safe to call more than once. Resolves null when this host does not send. */
export function startPostHog(): Promise<AnalyticsClient | null> {
  if (!analyticsEnabled()) return Promise.resolve(null);
  if (client) return Promise.resolve(client);
  if (starting) return starting;
  rememberAttribution(window.location.search);
  starting = (async () => {
    const { default: posthog } = await import("posthog-js");
    if (posthog.__loaded) {
      client = posthog;
      posthog.register(superProperties());
      flush(posthog);
      return posthog;
    }
    return await new Promise<AnalyticsClient>((resolve) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_API_HOST,
        ui_host: POSTHOG_UI_HOST,
        person_profiles: "always",
        cross_subdomain_cookie: true,
        capture_pageview: "history_change",
        capture_pageleave: true,
        capture_performance: {
          web_vitals: true,
          network_timing: false,
          web_vitals_allowed_metrics: ["LCP", "INP", "CLS", "FCP"],
        },
        autocapture: false,
        rageclick: false,
        disable_session_recording: true,
        capture_exceptions: false,
        loaded(ph) {
          client = ph;
          ph.register(superProperties());
          flush(ph);
          resolve(ph);
        },
      });
    });
  })();
  return starting;
}

export function capture(name: string, properties: Record<string, unknown> = {}, beacon = false): void {
  if (!analyticsEnabled()) return;
  if (isIntent(name, properties)) hadIntent = true;
  queue.push({ name, properties, beacon });
}

export function captureOnce(key: string, name: string, properties: Record<string, unknown> = {}): void {
  if (onceKeys.has(key)) return;
  onceKeys.add(key);
  capture(name, properties);
}

/**
 * Hero submit cannot wait for the idle loader. Start now, send with a beacon, and give up after
 * one second so the navigation still happens.
 */
export async function captureBeforeNavigate(
  events: readonly { name: string; properties: Record<string, unknown> }[],
): Promise<void> {
  if (!analyticsEnabled()) return;
  for (const event of events) capture(event.name, event.properties, true);
  await Promise.race([
    startPostHog(),
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), 1000);
    }),
  ]);
}

export { hadUtm };
