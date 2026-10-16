/**
 * Client-side live overlay.
 *
 * The page renders from the seed. After hydration this runs once: if the hosted API has
 * published `viral-now-*` boards, they replace the seed rows niche by niche; otherwise
 * nothing changes. A missing or failing live source is never shown to the visitor. In
 * development it is logged once to the console.
 */
import { fetchLiveNiches, fetchNicheVideos, fetchTrending } from "./api";
import type { ViralNowNiche, ViralNowNicheMeta } from "./types";

/** A live niche needs at least this many videos to replace the seed (same default as resolveViralNow). */
const MIN_LIVE_VIDEOS = 12;

let logged = false;
function logOnce(message: string): void {
  if (logged || process.env.NODE_ENV === "production") return;
  logged = true;
  console.info(`[viral-now] ${message}`);
}

export const metaOf = (niche: ViralNowNiche): ViralNowNicheMeta => ({
  slug: niche.slug,
  name: niche.name,
  label: niche.label,
  description: niche.description,
});

/**
 * The live boards that are ready to replace seed niches, by slug, or null when there are none.
 * The caller applies them to whatever state it holds now (seed videos may have streamed in since
 * the request started), so this never returns the niches it did not replace.
 */
export async function loadLiveReplacements(
  metas: ViralNowNicheMeta[],
  signal?: AbortSignal,
): Promise<Map<string, ViralNowNiche> | null> {
  try {
    const live = await fetchLiveNiches({ metas, signal, timeoutMs: 10_000 });
    const ready = new Map(live.filter((niche) => niche.videos.length >= MIN_LIVE_VIDEOS).map((niche) => [niche.slug, niche] as const));
    if (ready.size === 0) {
      logOnce("no live viral-now boards yet, showing the bundled snapshot");
      return null;
    }
    return ready;
  } catch (error) {
    if (!(error instanceof Error && error.name === "AbortError")) {
      logOnce(
        `live boards unavailable (${error instanceof Error ? error.message : "unknown error"}), showing the bundled snapshot`,
      );
    }
    return null;
  }
}

/**
 * Returns the merged niche list, or null when there is nothing to change.
 * With no seed niches at all it falls back to the trending feed (one "Trending now" niche).
 */
export async function loadLiveOverlay(current: ViralNowNiche[], signal?: AbortSignal): Promise<ViralNowNiche[] | null> {
  try {
    if (current.length === 0) {
      const trending = await fetchTrending({ signal, count: 30 });
      return trending.videos.length > 0 ? [trending] : null;
    }
    const live = await fetchLiveNiches({ metas: current.map(metaOf), signal, timeoutMs: 10_000 });
    const bySlug = new Map(live.map((niche) => [niche.slug, niche] as const));
    let replaced = 0;
    const merged = current.map((niche) => {
      const candidate = bySlug.get(niche.slug);
      if (candidate && candidate.videos.length >= MIN_LIVE_VIDEOS) {
        replaced += 1;
        return candidate;
      }
      return niche;
    });
    if (replaced === 0) {
      logOnce("no live viral-now boards yet, showing the bundled snapshot");
      return null;
    }
    return merged;
  } catch (error) {
    if (!(error instanceof Error && error.name === "AbortError")) {
      logOnce(
        `live boards unavailable (${error instanceof Error ? error.message : "unknown error"}), showing the bundled snapshot`,
      );
    }
    return null;
  }
}

/**
 * A live niche's board preview holds at most 24 videos. Fetch the full 30 for the grid.
 * Returns null when the board is not published or the request fails.
 */
export async function loadFullLiveNiche(niche: ViralNowNiche, signal?: AbortSignal): Promise<ViralNowNiche | null> {
  try {
    return await fetchNicheVideos(niche.slug, { limit: 30, meta: metaOf(niche), signal });
  } catch {
    return null;
  }
}
