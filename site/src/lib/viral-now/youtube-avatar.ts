/**
 * YouTube Shorts search does not include a channel photo. oEmbed fills the
 * name and the channel page, and that page's browse metadata carries the
 * avatar. These helpers stay free of network calls so the dialog can share
 * the address check.
 */

const AVATAR_HOSTS = new Set(["yt3.ggpht.com", "yt3.googleusercontent.com"]);

const CHANNEL_PATH =
  /^\/(?:@[A-Za-z0-9._-]{2,30}|channel\/UC[\w-]{22}|c\/[A-Za-z0-9._-]{2,30}|user\/[A-Za-z0-9._-]{2,30})$/;

/** A canonical channel address, or null when this is not a YouTube channel page. */
export function youtubeChannelUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (host !== "youtube.com") return null;
  const path = parsed.pathname.replace(/\/+$/, "");
  if (!CHANNEL_PATH.test(path)) return null;
  return `https://www.youtube.com${path}`;
}

function avatarUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const raw = (value as { url?: unknown }).url;
  if (typeof raw !== "string") return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" || !AVATAR_HOSTS.has(parsed.hostname)) return null;
  // The browse payload is a 900px square. The dialog circle is 40px.
  parsed.pathname = parsed.pathname.replace(/=s\d+/, "=s88");
  return parsed.toString();
}

/** The channel photo from a YouTube browse response, when the metadata includes one. */
export function avatarFromChannelBrowse(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const metadata = (body as { metadata?: unknown }).metadata;
  if (!metadata || typeof metadata !== "object") return null;
  const renderer = (metadata as { channelMetadataRenderer?: unknown }).channelMetadataRenderer;
  if (!renderer || typeof renderer !== "object") return null;
  const avatar = (renderer as { avatar?: unknown }).avatar;
  if (!avatar || typeof avatar !== "object") return null;
  const thumbnails = (avatar as { thumbnails?: unknown }).thumbnails;
  if (!Array.isArray(thumbnails)) return null;
  for (const thumbnail of thumbnails) {
    const url = avatarUrl(thumbnail);
    if (url) return url;
  }
  return null;
}

export function browseIdFromResolve(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const endpoint = (body as { endpoint?: unknown }).endpoint;
  if (!endpoint || typeof endpoint !== "object") return null;
  const browse = (endpoint as { browseEndpoint?: unknown }).browseEndpoint;
  if (!browse || typeof browse !== "object") return null;
  const id = (browse as { browseId?: unknown }).browseId;
  return typeof id === "string" && /^UC[\w-]{22}$/.test(id) ? id : null;
}
