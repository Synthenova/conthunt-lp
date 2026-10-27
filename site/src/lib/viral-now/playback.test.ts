import assert from "node:assert/strict";
import test from "node:test";

import { cardFile, mapBoardItem, mapTrendingItem } from "./api.ts";
import type { ApiPublicBoardItem, ApiTrendingItem } from "./types.ts";

const boardItem: ApiPublicBoardItem = {
  public_board_id: "board",
  rank: 1,
  score: 10,
  source_query: null,
  snapshot_date: "2026-10-20",
  added_at: "2026-10-20T00:00:00Z",
  analysis_media_asset_id: "original",
  content_item: {
    id: "content",
    platform: "tiktok",
    external_id: "clip",
    content_type: "video",
    canonical_url: "https://www.tiktok.com/@a/video/1",
    title: "Clip",
    primary_text: null,
    published_at: null,
    creator_handle: "a",
    author_id: null,
    author_name: null,
    author_url: null,
    author_image_url: null,
    metrics: {},
    is_analyzed: true,
  },
  assets: [
    {
      id: "original",
      asset_type: "video",
      status: "stored",
      source_url: null,
      signed_url: "https://r2/full.mp4",
      expires_at: null,
    },
    {
      id: "small",
      asset_type: "video_playback",
      status: "stored",
      source_url: "original",
      signed_url: "https://r2/small.mp4",
      expires_at: null,
    },
    {
      id: "cover",
      asset_type: "thumbnail",
      status: "stored",
      source_url: null,
      signed_url: "https://r2/cover.webp",
      expires_at: null,
    },
  ],
};

test("a landing card prefers the small file and the dialog asset stays the original", () => {
  const video = mapBoardItem(boardItem, { niche: "fitness", boardSlug: "viral-now-fitness", fallbackRank: 1 });
  assert.equal(video.video.asset_id, "original");
  assert.equal(video.video.url, "https://r2/full.mp4");
  assert.equal(video.preview?.asset_id, "small");
  const card = cardFile(video);
  assert.equal(card.video.asset_id, "small");
  assert.equal(card.video.url, "https://r2/small.mp4");
  const plain = { ...video, preview: null };
  assert.equal(cardFile(plain), plain);
});

test("a trending card can play the small file without replacing the original", () => {
  const item: ApiTrendingItem = {
    id: "content",
    external_id: "clip",
    url: "https://www.tiktok.com/@a/video/1",
    title: "Clip",
    platform: "tiktok",
    video_url: "https://r2/full.mp4",
    thumbnail_url: "https://r2/cover.webp",
    duration: 4.5,
    playback_asset_id: "original",
    thumbnail_asset_id: "cover",
    playback_expires_at: null,
    thumbnail_expires_at: null,
    preview_asset_id: "small",
    preview_url: "https://r2/small.mp4",
    preview_expires_at: null,
    author: { id: null, uniqueId: "a", nickname: null, avatar: null },
    creator_name: null,
    creator_image: null,
    view_count: 1,
    like_count: null,
    comment_count: null,
    share_count: null,
    public_trending: true,
  };
  const video = mapTrendingItem(item, 1);
  assert.equal(video.video.asset_id, "original");
  assert.equal(video.preview?.asset_id, "small");
  assert.equal(cardFile(video).video.url, "https://r2/small.mp4");
});
