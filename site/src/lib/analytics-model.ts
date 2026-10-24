/**
 * Pure analytics rules. No DOM, no PostHog. The browser client and the unit tests both use this.
 */

export const SCROLL_MILESTONES = [25, 50, 75, 90, 100] as const;

export type ScrollMilestone = (typeof SCROLL_MILESTONES)[number];

export interface QueuedCapture {
  name: string;
  properties: Record<string, unknown>;
  beacon?: boolean;
}

export interface CaptureQueue {
  push: (event: QueuedCapture) => void;
  /** Attach the sink and deliver everything already waiting, in order. Later pushes go straight through. */
  flush: (sink: (event: QueuedCapture) => void) => QueuedCapture[];
}

export function createCaptureQueue(): CaptureQueue {
  const pending: QueuedCapture[] = [];
  let sink: ((event: QueuedCapture) => void) | null = null;
  return {
    push(event) {
      if (sink) sink(event);
      else pending.push(event);
    },
    flush(next) {
      sink = next;
      const copy = pending.splice(0, pending.length);
      for (const event of copy) next(event);
      return copy;
    },
  };
}

export function analyticsAllowed(input: {
  nodeEnv: string | undefined;
  anywhere: boolean;
  hostname: string;
  pathname: string;
}): boolean {
  if (input.pathname.startsWith("/preview")) return false;
  if (input.nodeEnv !== "production") return false;
  if (input.anywhere) return true;
  return input.hostname === "conthunt.app" || input.hostname.endsWith(".conthunt.app");
}

export function isIntent(name: string, properties: Record<string, unknown>): boolean {
  if (name === "hero_search_submitted" || name === "viral_outbound_clicked") return true;
  if (name === "cta_clicked" && (properties.destination === "app" || properties.destination === "login")) return true;
  if (name === "copy_succeeded" && String(properties.target ?? "").startsWith("mcp")) return true;
  return false;
}

/** Bounce and engaged, as the dashboards filter them on `page_exit`. */
export function pageExitFlags(input: {
  visibleMs: number;
  maxScroll: number;
  hadIntent: boolean;
  sectionEngaged: boolean;
}): { bounce: boolean; engaged: boolean } {
  const bounce = input.visibleMs < 10_000 && input.maxScroll < 25 && !input.hadIntent;
  const engaged = input.maxScroll >= 50 || input.sectionEngaged || input.hadIntent;
  return { bounce, engaged };
}

export function scrollPercent(scrollY: number, innerHeight: number, scrollHeight: number): number {
  const range = scrollHeight - innerHeight;
  if (range <= 0) return 100;
  return Math.min(100, Math.max(0, (scrollY / range) * 100));
}

export function newlyReached(percent: number, sent: ReadonlySet<number>): ScrollMilestone[] {
  return SCROLL_MILESTONES.filter((milestone) => percent >= milestone && !sent.has(milestone));
}

export type QuerySource = "typed" | "example" | "edited_example";

/**
 * `example` when the submitted string is the example on screen.
 * `edited_example` when focus inserted an example and the string differs.
 * `typed` otherwise.
 */
export function heroQuerySource(query: string, onScreenExample: string, insertedExample: string): QuerySource {
  if (query === onScreenExample) return "example";
  if (insertedExample) return "edited_example";
  return "typed";
}

/** `null` means the message contains a query string or an email and must not be stored. */
export function exceptionMessage(raw: string): string | null {
  const message = raw.replace(/\s+/g, " ").trim().slice(0, 200);
  if (message.includes("q=")) return null;
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(message)) return null;
  return message;
}
