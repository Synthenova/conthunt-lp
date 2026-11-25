import "server-only";
import benchmarks from "./benchmark-2026.json";
import { loadViralNowData } from "@/lib/viral-now/load";
import type { ViralNowVideo } from "@/lib/viral-now/types";

const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort ( (a, b) => a - b );
  const i = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[i] : (sorted[i - 1] + sorted[i]) / 2;
};
const allVideos = () => {
  const { niches } = loadViralNowData();
  const unique = new Map<string, ViralNowVideo>();
  for (const video of niches.flatMap(n => n.videos)) {
    if (!unique.has(`${video.platform}:${video.id}`)) unique.set(`${video.platform}:${video.id}`, video);
  }
  return [...unique.values()];
};
const count = (v: ViralNowVideo) => v.metrics.views ?? 0;

/** Cached bundled snapshot, not a live feed. */
export function getPublicHooksData() {
  const snapshotDate = loadViralNowData().generatedAt;
  const videos = allVideos().filter(v => ["tiktok", "instagram", "youtube"].includes(v.platform) && !!v.url)
    .sort((a, b) => count(b) - count(a)).map(v => ({
      id: v.id, title: v.title, hook: v.analysis?.hook ?? null, platform: v.platform,
      handle: v.creator.handle, views: v.metrics.views, likes: v.metrics.likes,
      comments: v.metrics.comments, engagementRate: v.metrics.views && v.metrics.likes != null
        ? ((v.metrics.likes + (v.metrics.comments ?? 0)) / v.metrics.views) * 100 : null,
      niche: v.niche, url: v.url, snapshotDate,
    }));
  return { snapshotDate, niches: [...new Set(videos.map(v => v.niche))].sort(), videos };
}

export function getPublicHashtagsData() {
  const tags = new Map<string, ViralNowVideo[]>();
  for (const video of allVideos()) {
    for (const tag of new Set((video.title.match(/#[\p{L}\p{N}_]+/gu) ?? []).map(t => t.toLowerCase()))) {
      tags.set(tag, [...(tags.get(tag) ?? []), video]);
    }
  }
  return [...tags].map(([hashtag, videos]) => {
    const platforms = new Map<string, number>();
    videos.forEach(v => platforms.set(v.platform, (platforms.get(v.platform) ?? 0) + 1));
    return { hashtag, frequency: videos.length, medianViews: median(videos.flatMap(v => v.metrics.views == null ? [] : [v.metrics.views])),
      topPlatform: [...platforms].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      niches: [...new Set(videos.map(v => v.niche))] };
  }).sort((a, b) => b.frequency - a.frequency || a.hashtag.localeCompare(b.hashtag));
}

export function getPublicBoardsDirectory() {
  const data = loadViralNowData();
  return data.niches.map(n => ({ slug: n.board_slug, niche: n.slug, name: n.name, itemCount: n.videos.length,
    totalViews: n.videos.reduce((sum, v) => sum + count(v), 0), updatedDate: n.updated_at ?? data.generatedAt,
    indexable: n.videos.length >= 5 }));
}

export function getPublicCreatorsDirectory() {
  const groups = new Map<string, ViralNowVideo[]>();
  for (const video of allVideos()) {
    const handle = video.creator.handle?.trim().replace(/^@/, "");
    if (!handle || !/^[\w.-]+$/.test(handle)) continue;
    const key = `${video.platform}:${handle.toLowerCase()}`;
    groups.set(key, [...(groups.get(key) ?? []), video]);
  }
  return [...groups].map(([, videos]) => ({ handle: videos[0].creator.handle!.trim().replace(/^@/, "").toLowerCase(), platforms: [...new Set(videos.map(v => v.platform))],
    indexable: videos.some(v => v.metrics.views != null && v.metrics.views > 0 && v.metrics.likes != null && v.metrics.likes >= 0 && !!v.url),
    videoCount: videos.length, totalViews: videos.reduce((sum, v) => sum + count(v), 0),
    medianViews: median(videos.flatMap(v => v.metrics.views == null ? [] : [v.metrics.views])),
    bestVideo: [...videos].sort((a, b) => count(b) - count(a))[0], niches: [...new Set(videos.map(v => v.niche))] }));
}
export function getPublicCreatorByHandle(handle: string) {
  const matches = getPublicCreatorsDirectory().filter(c => c.handle === handle.trim().replace(/^@/, "").toLowerCase());
  return matches.length === 1 ? matches[0] : null;
}

/** The Viral Now snapshot is a selected breakout sample, not a representative feed. */
export function getViralityIndexSnapshot() {
  const data = loadViralNowData();
  const videos = getPublicHooksData().videos;
  const platforms = (["tiktok", "instagram", "youtube"] as const).map(platform => {
    const clips = videos.filter(v => v.platform === platform);
    const views = clips.flatMap(v => v.views != null && v.views > 0 ? [v.views] : []);
    const baseline = benchmarks.by_platform[platform].views.median;
    return { platform, sampleSize: views.length, medianViews: median(views), benchmarkMedianViews: baseline,
      topOutlierMultiple: baseline && views.length ? Math.max(...views) / baseline : null };
  });
  const niches = data.niches.map(n => {
    const views = n.videos.flatMap(v => v.metrics.views != null && v.metrics.views > 0 ? [v.metrics.views] : []);
    return { slug: n.slug, name: n.name, sampleSize: views.length, medianViews: median(views) };
  });
  return { snapshotDate: data.generatedAt, source: "bundled Viral Now snapshot" as const, benchmarkDate: benchmarks.extracted_at_utc,
    platforms, niches, topHashtag: getPublicHashtagsData()[0]?.hashtag ?? null,
    fastestMovingNiche: null, videos: videos.slice(0, 30) };
}
