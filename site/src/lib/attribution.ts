/**
 * Visit attribution. Last-touch lives in sessionStorage for the tab. First-touch lives in a
 * 90-day cookie on `.conthunt.app`. `appUrl` copies last-touch onto the app at click time,
 * because the visit's query string does not exist when the module loads.
 */
const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL || "https://agent.conthunt.app").replace(/\/+$/, "");

export const CAMPAIGN_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "ttclid",
  "msclkid",
  "li_fat_id",
] as const;

export type CampaignKey = (typeof CAMPAIGN_KEYS)[number];
export type CampaignParams = Partial<Record<CampaignKey, string>>;

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

const SESSION_KEY = "ch_utm";
const FIRST_TOUCH_COOKIE = "ch_ft";
const FIRST_TOUCH_MAX_AGE = 60 * 60 * 24 * 90;

export type Destination = "app" | "login" | "docs" | "mcp_docs" | "pricing" | "resources" | "article" | "mailto";

export type InternalSource = "blog" | "resources" | "docs";

export interface AppUrlOptions {
  placement: string;
  plan?: string;
  billing?: string;
  /** Hero submit only. Never copied onto any other property. */
  query?: string;
  attribution?: CampaignParams;
  /** Applied only when the visit has no campaign parameters of its own. */
  internal?: { source: InternalSource; campaign?: string } | null;
}

export function parseCampaign(search: string): CampaignParams {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const out: CampaignParams = {};
  for (const key of CAMPAIGN_KEYS) {
    const value = params.get(key);
    if (value) out[key] = value;
  }
  return out;
}

export function hasCampaign(params: CampaignParams | URLSearchParams): boolean {
  if (params instanceof URLSearchParams) return CAMPAIGN_KEYS.some((key) => params.get(key));
  return CAMPAIGN_KEYS.some((key) => params[key]);
}

/** Incoming keys replace stored ones. An empty incoming visit leaves the stored last-touch alone. */
export function mergeLastTouch(stored: CampaignParams, incoming: CampaignParams): CampaignParams {
  if (!hasCampaign(incoming)) return { ...stored };
  const next: CampaignParams = { ...stored };
  for (const key of CAMPAIGN_KEYS) {
    if (incoming[key]) next[key] = incoming[key];
  }
  return next;
}

export function serializeCampaign(params: CampaignParams): string {
  const search = new URLSearchParams();
  for (const key of CAMPAIGN_KEYS) {
    const value = params[key];
    if (value) search.set(key, value);
  }
  return search.toString();
}

export function appUrl(href: string, options: AppUrlOptions): string {
  const url = new URL(href);
  const touch = options.attribution ?? {};
  for (const key of CAMPAIGN_KEYS) {
    const value = touch[key];
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  if (!hasCampaign(url.searchParams) && options.internal) {
    url.searchParams.set("utm_source", options.internal.source);
    url.searchParams.set("utm_medium", "cta");
    if (options.internal.campaign) url.searchParams.set("utm_campaign", options.internal.campaign);
  }
  url.searchParams.set("ch_placement", options.placement);
  if (options.plan) url.searchParams.set("plan", options.plan);
  if (options.billing) url.searchParams.set("billing", options.billing);
  if (options.query) url.searchParams.set("q", options.query.slice(0, 500));
  return url.toString();
}

export function hadUtm(href: string): boolean {
  return hasCampaign(new URL(href).searchParams);
}

export function destinationForHref(href: string): Destination | null {
  if (href.startsWith("mailto:")) return "mailto";
  let url: URL;
  try {
    url = new URL(href, "https://conthunt.app");
  } catch {
    return null;
  }
  let app: URL;
  try {
    app = new URL(APP_ORIGIN);
  } catch {
    app = new URL("https://agent.conthunt.app");
  }
  if (url.origin === app.origin || url.hostname === "agent.conthunt.app") {
    if (url.pathname === "/login" || url.pathname.startsWith("/login/")) return "login";
    if (url.pathname === "/app" || url.pathname.startsWith("/app/")) return "app";
  }
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/docs/integrations/mcp")) return "mcp_docs";
  if (path === "/docs" || path.startsWith("/docs/")) return "docs";
  if (path === "/pricing" || path.startsWith("/pricing/")) return "pricing";
  if (path === "/resources") return "resources";
  if (path.startsWith("/resources/")) return "article";
  return null;
}

export function phAttrs(
  placement: string,
  destination: Destination,
  extra?: { plan?: string; billing?: string },
): {
  "data-ph-placement": string;
  "data-ph-destination": Destination;
  "data-ph-plan"?: string;
  "data-ph-billing"?: string;
} {
  return {
    "data-ph-placement": placement,
    "data-ph-destination": destination,
    ...(extra?.plan ? { "data-ph-plan": extra.plan } : {}),
    ...(extra?.billing ? { "data-ph-billing": extra.billing } : {}),
  };
}

function cookieDomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (host === "conthunt.app" || host.endsWith(".conthunt.app")) return ".conthunt.app";
  return null;
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  for (const part of document.cookie.split("; ")) {
    if (part.startsWith(prefix)) return decodeURIComponent(part.slice(prefix.length));
  }
  return "";
}

export function readLastTouch(): CampaignParams {
  if (typeof sessionStorage === "undefined") return {};
  try {
    return parseCampaign(sessionStorage.getItem(SESSION_KEY) ?? "");
  } catch {
    return {};
  }
}

export function readFirstTouch(): CampaignParams {
  return parseCampaign(readCookie(FIRST_TOUCH_COOKIE));
}

/** Remember this visit's campaign parameters. Returns the last-touch set events should carry. */
export function rememberAttribution(search: string): CampaignParams {
  const incoming = parseCampaign(search);
  const last = mergeLastTouch(readLastTouch(), incoming);
  if (typeof sessionStorage !== "undefined") {
    try {
      const serialized = serializeCampaign(last);
      if (serialized) sessionStorage.setItem(SESSION_KEY, serialized);
    } catch {
      // Private mode can refuse storage. Events still carry the in-memory copy below.
    }
  }
  if (hasCampaign(incoming) && !readCookie(FIRST_TOUCH_COOKIE)) {
    const domain = cookieDomain();
    if (domain && typeof document !== "undefined") {
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `${FIRST_TOUCH_COOKIE}=${encodeURIComponent(serializeCampaign(incoming))}; Max-Age=${FIRST_TOUCH_MAX_AGE}; Path=/; Domain=${domain}; SameSite=Lax${secure}`;
    }
  }
  return last;
}
