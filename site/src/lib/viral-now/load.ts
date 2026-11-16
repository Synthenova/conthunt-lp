/**
 * Server-side loader for the Viral Now page: the bundled seed snapshot, normalized by the
 * adapter and ordered by src/content/viral-now/niches.json (popularity order).
 *
 * Import this from server code only (the page, its metadata and the seed route). It pulls the
 * 450 KB seed JSON into the server bundle; client components never import it.
 *
 *   loadViralNowData()        every niche with every video (metadata, validation, the route)
 *   loadViralNowInitial(slug) niche shells for the first paint, with no snapshot videos
 *   loadSeedChunk()           every video in the compact wire format (served as static JSON)
 *
 * The first paint does not include the October snapshot. The client fills the shells from
 * the live boards after hydration (see ./live.ts).
 */
import { cache } from "react";
import nicheMetaJson from "@/content/viral-now/niches.json";
import seedJson from "@/content/viral-now/seed.json";
import { coerceSeed, fetchNicheVideos } from "./api";
import { BOARD_SIZE } from "./ranking";
import type { ViralNowNiche, ViralNowNicheMeta, ViralNowSource } from "./types";
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

/** The first-paint payload: niche shells and an empty wire. Live boards fill the rows. */
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
 * One niche for `/viral-now/[slug]`. The live board is preferred. The bundled snapshot
 * is the fallback, so the HTML still has titles when the API is down. Deduped per request.
 */
export const loadNicheBoard = cache(async (slug: string): Promise<ViralNowNiche | null> => {
  const seed = loadViralNowData().niches.find((niche) => niche.slug === slug);
  if (!seed) return null;
  try {
    const live = await fetchNicheVideos(slug, {
      limit: BOARD_SIZE,
      meta: { slug: seed.slug, name: seed.name, label: seed.label, description: seed.description },
      revalidate: 3600,
      timeoutMs: 8_000,
    });
    if (live && live.videos.length > 0) return live;
  } catch {
    // Snapshot titles stay in the HTML.
  }
  return seed.videos.length > 0 ? seed : null;
});

/**
 * The page's first-paint data. The index is niche shells until the live boards arrive.
 * A slug page passes `board` so that niche's videos are in the server HTML.
 */
export function loadViralNowInitial(activeSlug: string | null = null, board: ViralNowNiche | null = null): ViralNowInitial {
  const data = loadViralNowData();
  return {
    ...data,
    niches: data.niches.map((niche) => {
      if (board && niche.slug === activeSlug && niche.slug === board.slug && board.videos.length > 0) {
        return { ...board, video_count: board.videos.length };
      }
      return {
        ...nicheShell(niche),
        summary: undefined,
        week_of: null,
        video_count: BOARD_SIZE,
      };
    }),
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
