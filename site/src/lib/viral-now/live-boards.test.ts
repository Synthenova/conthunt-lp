import assert from "node:assert/strict";
import test from "node:test";

import { fetchLiveNiches } from "./api";
import { loadLiveReplacements } from "./live";
import { rowPlaceholders } from "./stats";

const EXPIRES = "2026-11-15T03:00:00Z";

const slimBoard = {
  id: "board",
  slug: "viral-now-fitness",
  title: "Fitness",
  category: "viral-now",
  item_count: 30,
  created_at: "2026-11-09T00:00:00Z",
  updated_at: "2026-11-09T00:00:00Z",
  preview_items: [
    {
      public_board_id: "board",
      rank: 1,
      score: 73.8,
      snapshot_date: "2026-11-09",
      analysis_media_asset_id: "original",
      content_item: { id: "content", platform: "tiktok", external_id: "clip", content_type: "video", title: "Clip", metrics: { views: 10 }, is_analyzed: true },
      assets: [
        { id: "original", asset_type: "video", status: "stored", source_url: "https://r2/full.mp4?sig", expires_at: EXPIRES },
        { id: "small", asset_type: "video_playback", status: "stored", source_url: "https://r2/small.mp4?sig", expires_at: EXPIRES },
        { id: "cover", asset_type: "cover", status: "stored", source_url: "https://r2/cover.webp?sig", expires_at: EXPIRES },
      ],
    },
  ],
};

test("all niches come from one list request the app shares, and slim signed assets stay renewable", async () => {
  const urls: string[] = [];
  const fetchImpl = (async (url: string) => {
    urls.push(url);
    return new Response(JSON.stringify({ boards: [slimBoard], next_cursor: "20" }), { status: 200 });
  }) as typeof fetch;

  const [niche] = await fetchLiveNiches({ baseUrl: "https://api.test", fetchImpl });

  assert.deepEqual(urls, ["https://api.test/v1/public-boards?limit=20&preview_limit=12&category=viral-now"]);
  assert.equal(niche.slug, "fitness");
  const [video] = niche.videos;
  assert.deepEqual(video.video, { asset_id: "original", url: "https://r2/full.mp4?sig", expires_at: EXPIRES, source: "r2" });
  assert.deepEqual(video.preview, { asset_id: "small", url: "https://r2/small.mp4?sig", expires_at: EXPIRES, source: "r2" });
  assert.equal(video.poster.url, "https://r2/cover.webp?sig");
  assert.equal(video.poster.source, "r2");
});

test("page load reads every row from the one list request and no row asks for its board", async () => {
  const urls: string[] = [];
  const board = (n: number) => ({
    ...slimBoard,
    id: `board-${n}`,
    slug: `viral-now-niche-${n}`,
    preview_items: Array.from({ length: 12 }, (_, rank) => ({
      ...slimBoard.preview_items[0],
      public_board_id: `board-${n}`,
      rank: rank + 1,
      content_item: { ...slimBoard.preview_items[0].content_item, id: `content-${n}-${rank}`, external_id: `clip-${n}-${rank}` },
    })),
  });
  const realFetch = globalThis.fetch;
  const realBase = process.env.NEXT_PUBLIC_BACKEND_URL;
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://api.test";
  globalThis.fetch = (async (url: string) => {
    urls.push(String(url));
    return new Response(JSON.stringify({ boards: Array.from({ length: 20 }, (_, n) => board(n)), next_cursor: "20" }), { status: 200 });
  }) as typeof fetch;
  try {
    const metas = Array.from({ length: 20 }, (_, n) => ({ slug: `niche-${n}`, name: `Niche ${n}`, label: `Niche ${n}`, description: "" }));
    const rows = await loadLiveReplacements(metas);
    assert.ok(rows);
    assert.equal(rows.size, 20);
    for (const niche of rows.values()) {
      assert.equal(niche.videos.length, 12);
      assert.equal(niche.video_count, 30);
      assert.equal(rowPlaceholders(niche), 0, `${niche.slug} waits for videos it will never ask for`);
    }
  } finally {
    globalThis.fetch = realFetch;
    if (realBase === undefined) delete process.env.NEXT_PUBLIC_BACKEND_URL;
    else process.env.NEXT_PUBLIC_BACKEND_URL = realBase;
  }
  assert.equal(urls.length, 1);
  assert.match(urls[0], /\/v1\/public-boards\?limit=20&preview_limit=12&category=viral-now$/);
});

test("a snapshot row keeps slots for the videos still streaming in", () => {
  assert.equal(rowPlaceholders({ source: "seed", video_count: 30, videos: new Array(4) }), 26);
  assert.equal(rowPlaceholders({ source: "live", video_count: 30, videos: new Array(12) }), 0);
});
