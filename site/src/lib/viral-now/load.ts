/**
 * Server-side loader for the Viral Now page: the bundled seed snapshot, normalized by the
 * adapter and ordered by src/content/viral-now/niches.json (popularity order).
 *
 * Import this from server code only (the page, its metadata and the seed route). It pulls the
 * 450 KB seed JSON into the server bundle; client components never import it.
 *
 *   loadViralNowData()        every niche with every video (metadata, validation, the route)
 *   loadViralNowInitial(slug) what the first paint needs: niche shells plus a few compact videos
 *   loadSeedChunk()           every video in the compact wire format (served as static JSON)
 *
 * The first paint does not include snapshot videos. The client shows the loading skeletons,
 * then replaces them with the live boards (see ./live.ts).
 */
import nicheMetaJson from "@/content/viral-now/niches.json";
import seedJson from "@/content/viral-now/seed.json";
import { coerceSeed } from "./api";
import type { ViralNowNiche, ViralNowNicheMeta, ViralNowSource } from "./types";
import { BOARD_SIZE } from "./ranking";
import { encodeVideos, nicheShell, WIRE_VERSION, type SeedChunk, type WireNiches } from "./wire";

export interface ViralNowData {
  niches: ViralNowNiche[];
  /** ISO timestamp the snapshot was assembled (status line). */
  generatedAt: string;
  /** Monday (UTC) of the ranking week. */
  weekOf: string | null;
  /** ISO timestamp used for "views per day" and age math. */
  asOf: string;
  rankSource: ViralNowSource;
}

/** The first-paint payload: shells (no videos) plus the compact videos the server render shows. */
export interface ViralNowInitial extends ViralNowData {
  wire: WireNiches;
  /** Part of the seed chunk URL, so a new snapshot or wire format is never served from a stale cache. */
  seedVersion: string;
}

const seedRoot = seedJson as unknown as {
  week_of?: string;
  generated_at?: string;
  ranking?: { as_of?: string };
};

export const NICHE_METAS: ViralNowNicheMeta[] = (
  nicheMetaJson as Array<{ slug: string; name: string; label: string; description: string }>
).map(({ slug, name, label, description }) => ({ slug, name, label, description }));

let cached: ViralNowData | null = null;

/** The normalized seed snapshot. Computed once per server process. */
export function loadViralNowData(): ViralNowData {
  if (cached) return cached;
  const coerced = coerceSeed(seedJson, NICHE_METAS);
  const order = new Map(NICHE_METAS.map((meta, index) => [meta.slug, index] as const));
  const niches = [...coerced].sort(
    (a, b) => (order.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
  );
  const generatedAt = seedRoot.generated_at ?? new Date(0).toISOString();
  const asOfDay = seedRoot.ranking?.as_of;
  cached = {
    niches,
    generatedAt,
    weekOf: seedRoot.week_of ?? niches[0]?.week_of ?? null,
    asOf: asOfDay ? `${asOfDay}T00:00:00Z` : generatedAt,
    rankSource: "seed",
  };
  return cached;
}

let cachedWire: WireNiches | null = null;

function fullWire(): WireNiches {
  if (cachedWire) return cachedWire;
  const { niches } = loadViralNowData();
  cachedWire = Object.fromEntries(niches.map((niche) => [niche.slug, encodeVideos(niche.videos, niche.slug, niche.week_of)]));
  return cachedWire;
}

/**
 * The page's first-paint data: niche names and counts, no snapshot videos. The rows render
 * their loading skeletons until the live boards arrive.
 */
export function loadViralNowInitial(_activeSlug: string | null = null): ViralNowInitial {
  const data = loadViralNowData();
  return {
    ...data,
    niches: data.niches.map((niche) => ({
      ...nicheShell(niche),
      summary: undefined,
      week_of: null,
      video_count: BOARD_SIZE,
    })),
    wire: {},
    seedVersion: `${WIRE_VERSION}-${data.generatedAt}`,
  };
}

/** Every video of every niche, compact. Served as static JSON from /viral-now/seed.json. */
export function loadSeedChunk(): SeedChunk {
  return { v: WIRE_VERSION, niches: fullWire() };
}

/** A niche slug from `?niche=`, or null when it is missing or unknown. */
export function parseNicheParam(value: string | string[] | undefined, niches: ViralNowNiche[]): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && niches.some((niche) => niche.slug === raw) ? raw : null;
}
