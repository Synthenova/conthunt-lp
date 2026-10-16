/**
 * Client loader for the rest of the seed snapshot.
 *
 * The first paint ships only a few videos (see ./wire.ts). Everything else is one static,
 * cacheable JSON file, fetched once per page view, shared by every caller. A failed request
 * is forgotten, so the next caller tries again.
 */
import { WIRE_VERSION, type SeedChunk } from "./wire";

export const SEED_CHUNK_PATH = "/viral-now/seed.json";

let pending: Promise<SeedChunk> | null = null;

function isChunk(value: unknown): value is SeedChunk {
  if (typeof value !== "object" || value === null) return false;
  const chunk = value as { v?: unknown; niches?: unknown };
  return chunk.v === WIRE_VERSION && typeof chunk.niches === "object" && chunk.niches !== null;
}

/**
 * `version` comes from the server (`ViralNowInitial.seedVersion`) and keys the browser cache.
 * The request is shared, so it takes no abort signal: one caller leaving must not fail the others.
 */
export function fetchSeedChunk(version: string): Promise<SeedChunk> {
  if (!pending) {
    pending = fetch(`${SEED_CHUNK_PATH}?v=${encodeURIComponent(version)}`, { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`seed chunk ${response.status}`);
        const body: unknown = await response.json();
        if (!isChunk(body)) throw new Error("seed chunk has an unexpected shape");
        return body;
      })
      .catch((error: unknown) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}
