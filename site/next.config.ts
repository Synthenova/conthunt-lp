import path from "node:path";
import type { NextConfig } from "next";

/**
 * ContHunt marketing site config.
 *
 * - `/v1/trending/*` and `/v1/public-boards/*` (the public read routes) are proxied to the ContHunt
 *   backend so the browser only ever talks to this origin (no CORS, no backend URL in client code).
 *   The rest of the backend API is deliberately not exposed on this origin (it answers 404).
 * - Turbopack's root is pinned to this folder so it never climbs into the
 *   parent directory (the legacy blog build lives at the repo root).
 * - Public media, brand and blog assets are cached for a week and revalidated in
 *   the background for a day after that. Not `immutable`: these filenames are not
 *   content-hashed, so give a replaced file a new name when it must update at once.
 *   `/_next/*` (hashed, Next sets its own) and `/viral-now/seed.json` are untouched.
 * - Two root files are cached on their own, shorter terms. `/og-default.jpg` is the share
 *   image: crawlers and social apps re-fetch it rarely, so a day fresh plus a week of
 *   background revalidation keeps previews fast, and a new image reaches visitors within
 *   a day (link unfurls elsewhere keep their own cache regardless). `/llms.txt` is editable
 *   copy for AI crawlers, so it stays fresh for an hour and revalidates for a day.
 */
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(/\/+$/, "");

const STATIC_ASSET_CACHE = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];
const SHARE_IMAGE_CACHE = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
const LLMS_TXT_CACHE = [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }];

const nextConfig: NextConfig = {
  // Self-contained server (`.next/standalone/server.js`) for the production container, where it runs
  // on 127.0.0.1:3000 behind nginx (see the repo-root Dockerfile and nginx.conf).
  output: "standalone",
  // `pnpm dev` / `pnpm build` always run with cwd = this folder (`site/`). Pinning the tracing root here
  // keeps the standalone output flat (`server.js` at the top) and stops Next from climbing to the repo
  // root, which has its own package-lock.json for the legacy blog build.
  outputFileTracingRoot: process.cwd().split(path.sep).join("/"),
  turbopack: {
    root: process.cwd(),
  },
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      ...["/media/:path*", "/brand/:path*", "/blog/plates/:path*"].map((source) => ({ source, headers: STATIC_ASSET_CACHE })),
      { source: "/og-default.jpg", headers: SHARE_IMAGE_CACHE },
      { source: "/llms.txt", headers: LLMS_TXT_CACHE },
    ];
  },
  async rewrites() {
    return [
      { source: "/v1/trending/:path*", destination: `${BACKEND_URL}/v1/trending/:path*` },
      { source: "/v1/public-boards/:path*", destination: `${BACKEND_URL}/v1/public-boards/:path*` },
    ];
  },
  images: {
    // Next 16 requires an explicit quality allowlist.
    qualities: [60, 75, 90],
    formats: ["image/avif", "image/webp"],
    // No `remotePatterns`: /_next/image only optimises local files. R2 media (thumbnails, posters) has
    // presigned, expiring URLs, so it is rendered with `unoptimized` on <Image>. Allowing r2.dev or
    // r2.cloudflarestorage.com would make /_next/image an open proxy for anyone's bucket.
    // Cloud Run's writable disk is memory: keep the optimiser cache small.
    maximumDiskCacheSize: 50_000_000,
  },
};

export default nextConfig;
