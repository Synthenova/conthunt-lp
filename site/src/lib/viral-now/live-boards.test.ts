import assert from "node:assert/strict";
import test from "node:test";

import { fetchLiveNiches } from "./api";

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
