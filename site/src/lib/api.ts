/**
 * Typed fetch helper for the ContHunt backend's public read routes.
 *
 * In the browser it calls same-origin `/v1/*`, which next.config.ts rewrites to
 * `${NEXT_PUBLIC_BACKEND_URL}/v1/*` (no CORS, no backend origin in client code).
 * On the server (RSC, route handlers) there is no origin, so it calls the
 * backend directly.
 *
 *   type Niche = { keyword: string; trend: "up1" | "up2" | "down1" | "down2"; hashtags: string[] };
 *   const niches = await api<Niche[]>("/v1/trending/niches");
 *   const board = await api<Board>(`/v1/public-boards/${id}`, { query: { limit: 30 }, timeoutMs: 8000 });
 *   // Server components can pass Next cache options: api(path, { next: { revalidate: 3600 } })
 *
 * Errors: non-2xx responses throw `ApiError` (status + parsed body); timeouts
 * throw a DOMException named "TimeoutError"; caller aborts propagate.
 */

export type ApiPath = `/v1/${string}`;

export type QueryValue = string | number | boolean | null | undefined;

export interface ApiOptions extends Omit<RequestInit, "body"> {
  /** Appended as a query string; null/undefined values are skipped. */
  query?: Record<string, QueryValue | QueryValue[]>;
  /** JSON body (sets method POST unless given, and the content-type header). */
  json?: unknown;
  /** Abort after this many ms. Default 15000. */
  timeoutMs?: number;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly path: string;

  constructor(path: string, status: number, body: unknown) {
    super(`API ${status} for ${path}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.path = path;
  }
}

const SERVER_BACKEND = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");

/** Build the request URL for a backend path (exported for <link rel=preload> etc.). */
export function apiUrl(path: ApiPath, query?: ApiOptions["query"]): string {
  const base = typeof window === "undefined" ? SERVER_BACKEND : "";
  let qs = "";
  if (query) {
    const params = new URLSearchParams();
    for (const [key, raw] of Object.entries(query)) {
      const values = Array.isArray(raw) ? raw : [raw];
      for (const v of values) if (v !== undefined && v !== null) params.append(key, String(v));
    }
    const s = params.toString();
    if (s) qs = `?${s}`;
  }
  return `${base}${path}${qs}`;
}

export async function api<T>(path: ApiPath, options: ApiOptions = {}): Promise<T> {
  const { query, json, timeoutMs = 15_000, signal, headers, ...init } = options;
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  const finalHeaders = new Headers(headers);
  finalHeaders.set("accept", "application/json");
  let body: BodyInit | undefined;
  if (json !== undefined) {
    finalHeaders.set("content-type", "application/json");
    body = JSON.stringify(json);
  }

  const res = await fetch(apiUrl(path, query), {
    ...init,
    method: init.method ?? (json !== undefined ? "POST" : "GET"),
    headers: finalHeaders,
    body,
    signal: combined,
  });

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }
  if (!res.ok) throw new ApiError(path, res.status, parsed);
  return parsed as T;
}
