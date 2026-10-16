/**
 * Cover specs from `src/content/blog-covers.json` (written by the cover agent).
 * Pure data, safe to import from server or client code.
 */
import raw from "@/content/blog-covers.json";
import { MCP_SERVER_URL } from "@/lib/links";
import type { CoverSpec, FragmentSpec } from "./types";

interface RawCover {
  plate1600: string;
  plate800: string;
  mood: string;
  fragment: string | null;
  fragment_data: unknown;
  dominant: string;
}

const COVERS = raw as unknown as Record<string, RawCover>;

/** A flat 1x1 SVG in `hex`, used as the `next/image` blur placeholder. */
export function blurFromColor(hex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none"><rect width="1" height="1" fill="${hex}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function toFragment(kind: string | null, data: unknown): FragmentSpec | null {
  if (!kind || !data) return null;
  if (kind === "mcp-terminal") {
    // Keep the one hosted MCP URL centralized in links.ts.
    const lines = (data as { lines: string[] }).lines.map((l) => l.replaceAll("https://mcp.conthunt.app", MCP_SERVER_URL));
    return { kind, data: { lines } };
  }
  return { kind, data } as FragmentSpec;
}

/** Cover for a post slug, or the shared index plate for "_index". */
export function getCover(slug: string): CoverSpec {
  const c = COVERS[slug] ?? COVERS._index;
  return {
    slug,
    plate1600: c.plate1600,
    plate800: c.plate800,
    mood: c.mood,
    dominant: c.dominant,
    blurDataURL: blurFromColor(c.dominant),
    fragment: toFragment(c.fragment, c.fragment_data),
  };
}

/** The soft wide banner plate used on /resources (no overlay fragment). */
export const getIndexCover = (): CoverSpec => getCover("_index");
