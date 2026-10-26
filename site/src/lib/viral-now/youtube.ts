const YOUTUBE_VIDEO_ID_RE =
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&?/]+)/i;

/** The video id from a watch, short, or youtu.be address. */
export function youtubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const id = url.match(YOUTUBE_VIDEO_ID_RE)?.[1]?.trim();
  return id || null;
}

/** A stable poster. hqdefault exists for shorts; maxresdefault often does not. */
export function youtubePosterUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
