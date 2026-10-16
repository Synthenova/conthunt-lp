/**
 * Asset loaders shared by the Open Graph image routes (`opengraph-image.tsx`).
 *
 * Only `node:fs` and `node:path` are imported at the top level. `sharp` (native binding) and
 * `next/og` (Satori + resvg wasm) are imported inside the functions that need them: Next's dev
 * server loads each `opengraph-image` module in a separate static-paths worker just to read
 * `generateStaticParams`, and this keeps that worker light.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/** Absolute path of a file in `public/` (a leading slash is fine). */
export const publicFile = (file: string): string => path.join(process.cwd(), "public", file);

/**
 * A plate resized to the card and re-encoded as a JPEG data URI. Satori cannot decode WebP,
 * so the WebP plates are converted here.
 */
export async function plateJpeg(file: string): Promise<string> {
  const { default: sharp } = await import("sharp");
  const buf = await sharp(publicFile(file)).resize(OG_SIZE.width, OG_SIZE.height, { fit: "cover" }).jpeg({ quality: 84 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/** The ink wordmark (transparent PNG) as a data URI. */
export async function wordmarkDataUri(): Promise<string> {
  return `data:image/png;base64,${(await readFile(publicFile("brand/wordmark-ink.png"))).toString("base64")}`;
}

const fontCache = new Map<number, Promise<ArrayBuffer | null>>();

/**
 * Switzer from the Fontshare CDN (the same source the site uses at runtime), cached per process.
 * Resolves to null if the fetch fails, so the card falls back to the bundled default font.
 */
function switzer(weight: 500 | 700): Promise<ArrayBuffer | null> {
  let cached = fontCache.get(weight);
  if (!cached) {
    cached = (async () => {
      try {
        const cssUrl = `https://api.fontshare.com/v2/css?f[]=switzer@${weight}&display=swap`;
        const css = await (await fetch(cssUrl, { signal: AbortSignal.timeout(5000) })).text();
        const match = /url\('?(\/\/[^')]+\.(?:ttf|woff))'?\)/.exec(css);
        if (!match) return null;
        const res = await fetch(`https:${match[1]}`, { signal: AbortSignal.timeout(8000) });
        return res.ok ? await res.arrayBuffer() : null;
      } catch {
        return null;
      }
    })();
    fontCache.set(weight, cached);
  }
  return cached;
}

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 500 | 700;
  style: "normal";
}

/** Switzer 700 and 500 when reachable; an empty list otherwise. */
export async function loadOgFonts(): Promise<OgFont[]> {
  const [bold, medium] = await Promise.all([switzer(700), switzer(500)]);
  return [
    ...(bold ? [{ name: "Switzer", data: bold, weight: 700 as const, style: "normal" as const }] : []),
    ...(medium ? [{ name: "Switzer", data: medium, weight: 500 as const, style: "normal" as const }] : []),
  ];
}
