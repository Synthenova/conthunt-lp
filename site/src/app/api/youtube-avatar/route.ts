import { avatarFromChannelBrowse, browseIdFromResolve, youtubeChannelUrl } from "@/lib/viral-now/youtube-avatar";

const CLIENT = { clientName: "WEB", clientVersion: "2.20241016.01.00", hl: "en", gl: "US" };

type Cached = { url: string | null; expires: number };
const cache = new Map<string, Cached>();
const HIT_MS = 24 * 60 * 60 * 1000;
const MISS_MS = 2 * 60 * 1000;

async function post(path: string, payload: object, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`https://www.youtube.com/youtubei/v1/${path}?prettyPrint=false`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ context: { client: CLIENT }, ...payload }),
    signal,
    cache: "no-store",
  });
  if (!response.ok) return null;
  return response.json();
}

async function lookup(channel: string): Promise<string | null> {
  const hit = cache.get(channel);
  if (hit && hit.expires > Date.now()) return hit.url;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let url: string | null = null;
  try {
    const path = new URL(channel).pathname;
    const direct = path.startsWith("/channel/UC") ? path.slice("/channel/".length) : null;
    const browseId = direct ?? browseIdFromResolve(await post("navigation/resolve_url", { url: channel }, controller.signal));
    if (browseId) {
      url = avatarFromChannelBrowse(await post("browse", { browseId }, controller.signal));
    }
  } catch {
    url = null;
  } finally {
    clearTimeout(timer);
  }
  cache.set(channel, { url, expires: Date.now() + (url ? HIT_MS : MISS_MS) });
  return url;
}

export async function GET(request: Request): Promise<Response> {
  const channel = youtubeChannelUrl(new URL(request.url).searchParams.get("url"));
  if (!channel) {
    return Response.json({ url: null }, { status: 400, headers: { "cache-control": "no-store" } });
  }
  const url = await lookup(channel);
  return Response.json(
    { url },
    { headers: { "cache-control": url ? "public, max-age=86400" : "public, max-age=120" } },
  );
}
