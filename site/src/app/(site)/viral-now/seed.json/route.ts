import { loadSeedChunk } from "@/lib/viral-now/load";

/**
 * The bundled Viral Now snapshot in the compact wire format (src/lib/viral-now/wire.ts).
 *
 * The page's first paint carries only a few videos; the client fetches this file once after
 * hydration for the rest. It is built from seed.json at build time and never changes between
 * deploys, so it is static and cacheable (the page adds `?v=` so a new snapshot is not served
 * from a stale cache).
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(loadSeedChunk(), {
    headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
  });
}
