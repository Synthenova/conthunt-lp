/**
 * Island code — the client code of a <LazySection> island, loaded with the island.
 *
 * A server section that renders client components puts their code in the page's first-load
 * JavaScript, even when <LazySection> defers their hydration. For an island in this table the
 * section's server file imports its client components through `islandPart()` proxies instead
 * (a section's `island.tsx`), so their code (and everything only they import: motion, d3,
 * section data) lands in a separate chunk that is fetched only when the island wakes:
 *
 *   // sections/tracking/client.ts — the island's client components, re-exported
 *   export { TrackingBoard } from "./board";
 *   // sections/tracking/island.tsx ("use client")
 *   export const TrackingBoard = islandPart("tracking", "TrackingBoard");
 *   // sections/tracking/index.tsx (server)
 *   import { TrackingBoard } from "./island";
 *   // app/(site)/page.tsx
 *   <LazySection code="tracking"><TrackingSection /></LazySection>
 *
 * - Server rendering is unchanged: a proxy awaits the module (`use`) and renders the real
 *   component, so the static HTML is the same as a direct import.
 * - <LazySection code> keeps the server DOM until the code has arrived, then swaps in the
 *   live tree in one synchronous commit as before (the proxies find the module loaded).
 * - The chunk is a plain `import()` (not `next/dynamic`), so Next neither lists nor preloads
 *   it in the HTML. <OffscreenSections> prefetches every island's code after the reader's
 *   first scroll, swipe or key press, and an island prefetches its own on approach.
 * - A client-side navigation renders the island at once: a proxy suspends until the chunk
 *   arrives, and the navigation (a transition) keeps the previous page until then.
 *
 * Only proxy a component that is rendered inside a <LazySection code> (a direct render would
 * suspend its page's hydration on the chunk). A CSS module the island's components use must
 * also be imported by the section's server file, so its rules ship with the page's CSS.
 */
import { use, type ComponentType } from "react";

/** One `import()` per island; each module re-exports that island's client components. */
const LOADERS = {
  "statement-simulator": () => import("@/components/sections/statement-simulator/client"),
  "how-it-works": () => import("@/components/sections/how-it-works/client"),
  bento: () => import("@/components/sections/bento/client"),
  pricing: () => import("@/components/sections/pricing/client"),
  tracking: () => import("@/components/sections/tracking/client"),
  mcp: () => import("@/components/sections/mcp/client"),
  blog: () => import("@/components/sections/blog/client"),
  faq: () => import("@/components/sections/faq/client"),
  footer: () => import("@/components/sections/footer/client"),
};

/**
 * motion's feature chunk (components/ui/lazy-motion.tsx). The FAQ, MCP, pricing and tracking
 * islands animate with `m` components, so it is warmed with any island's code: a first click
 * in a fresh island then animates instead of waiting for it.
 */
const warmMotionFeatures = () => import("@/lib/motion-features").catch(() => {});

export type IslandKey = keyof typeof LOADERS;
type IslandModules = { [K in IslandKey]: Awaited<ReturnType<(typeof LOADERS)[K]>> };

const loaded: Partial<{ [K in IslandKey]: IslandModules[K] }> = {};
const loading: Partial<Record<IslandKey, Promise<unknown>>> = {};

function load<K extends IslandKey>(key: K): Promise<IslandModules[K]> {
  if (!loading[key]) warmMotionFeatures();
  const pending =
    loading[key] ??
    (loading[key] = (LOADERS[key]() as Promise<IslandModules[K]>).then(
      (mod) => {
        loaded[key] = mod;
        return mod;
      },
      (err: unknown) => {
        // A failed chunk (offline, a deploy in between) may be retried by the next wake.
        delete loading[key];
        throw err;
      },
    ));
  return pending as Promise<IslandModules[K]>;
}

export function isIslandKey(key: string | undefined): key is IslandKey {
  return !!key && Object.prototype.hasOwnProperty.call(LOADERS, key);
}

/** Null when the island's code is ready (or it has none); otherwise a promise for it. */
export function loadIslandCode(key: string | undefined): Promise<unknown> | null {
  if (!isIslandKey(key) || loaded[key]) return null;
  return load(key);
}

/** Starts every island's chunk (idle network after the first interaction). Errors are ignored. */
export function prefetchIslandCode(): void {
  for (const key of Object.keys(LOADERS) as IslandKey[]) if (!loaded[key]) load(key).catch(() => {});
}

/**
 * A stand-in for one client component of island `key`, named `name` in its client module.
 * Same props; renders the real component once the island's code is loaded.
 */
export function islandPart<K extends IslandKey, N extends keyof IslandModules[K] & string>(
  key: K,
  name: N,
): IslandModules[K][N] {
  function IslandPart(props: Record<string, unknown>) {
    const mod = loaded[key] ?? use(load(key));
    const Part = mod[name] as unknown as ComponentType<Record<string, unknown>>;
    return <Part {...props} />;
  }
  IslandPart.displayName = `Island(${key}:${name})`;
  return IslandPart as unknown as IslandModules[K][N];
}
