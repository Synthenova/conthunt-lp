import "server-only";

import { loadViralNowData } from "@/lib/viral-now/load";
import type { ViralNowVideo } from "@/lib/viral-now/types";

export type CalculatorPlatform = "tiktok" | "instagram";

export interface NicheExampleVideo {
  id: string;
  rank: number;
  title: string;
  creator: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number | null;
  publicErPct: number;
  likeToViewPct: number;
  url: string;
}

export interface NicheBenchmark {
  slug: string;
  name: string;
  label: string;
  description: string;
  /** Number of platform-matched clips with valid views + likes in this niche. */
  platformSampleSize: number;
  /** Number of all clips with valid views + likes in this niche. */
  nicheSampleSize: number;
  /** True when the displayed benchmark uses this niche's own platform clips (>= 5); otherwise falls back to platform-wide median. */
  isNicheSpecific: boolean;
  /** Public-comparable engagement rate median (%) — TikTok: (L+C+Sh)/Views; Instagram: (L+C)/Views. */
  medianPublicErPct: number;
  /** 75th percentile public-comparable engagement rate (%) for "Top-quartile / High" grading. */
  p75PublicErPct: number;
  /** Median Like-to-View ratio (%). */
  medianLikeToViewPct: number;
  /** Median Comment-to-View ratio (%). */
  medianCommentToViewPct: number;
  /** Median Share-to-View ratio (%) — available for TikTok public clips, null for Instagram. */
  medianShareToViewPct: number | null;
  /** Median views in the benchmark sample. */
  medianViews: number;
  /** Top 3 public videos from this niche on Viral Now (matching platform preferred). */
  examples: NicheExampleVideo[];
}

export interface PlatformBenchmarkDataset {
  platform: CalculatorPlatform;
  weekOf: string;
  totalPlatformVideos: number;
  totalAllVideos: number;
  overallMedianPublicErPct: number;
  overallP75PublicErPct: number;
  overallMedianLikeToViewPct: number;
  overallMedianCommentToViewPct: number;
  overallMedianShareToViewPct: number | null;
  overallMedianViews: number;
  niches: NicheBenchmark[];
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo] ?? 0;
  const weight = idx - lo;
  return (sorted[lo] ?? 0) * (1 - weight) + (sorted[hi] ?? 0) * weight;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function publicInteractions(video: ViralNowVideo, platform: CalculatorPlatform): number {
  const likes = video.metrics.likes ?? 0;
  const comments = video.metrics.comments ?? 0;
  const shares = platform === "tiktok" ? (video.metrics.shares ?? 0) : 0;
  return likes + comments + shares;
}

function hasValidMetrics(video: ViralNowVideo): boolean {
  return (
    typeof video.metrics.views === "number" &&
    video.metrics.views > 0 &&
    typeof video.metrics.likes === "number" &&
    video.metrics.likes >= 0
  );
}

function summarize(videos: ViralNowVideo[], platform: CalculatorPlatform) {
  const valid = videos.filter(hasValidMetrics);
  const erPcts = valid.map((v) => (publicInteractions(v, platform) / (v.metrics.views as number)) * 100);
  const ltvPcts = valid.map((v) => ((v.metrics.likes as number) / (v.metrics.views as number)) * 100);
  const ctvPcts = valid.map((v) => (((v.metrics.comments ?? 0) / (v.metrics.views as number)) * 100));
  const stvPcts =
    platform === "tiktok"
      ? valid
          .filter((v) => typeof v.metrics.shares === "number")
          .map((v) => (((v.metrics.shares as number) / (v.metrics.views as number)) * 100))
      : [];
  const views = valid.map((v) => v.metrics.views as number);

  return {
    count: valid.length,
    medianPublicErPct: round2(percentile(erPcts, 0.5)),
    p75PublicErPct: round2(percentile(erPcts, 0.75)),
    medianLikeToViewPct: round2(percentile(ltvPcts, 0.5)),
    medianCommentToViewPct: round2(percentile(ctvPcts, 0.5)),
    medianShareToViewPct: stvPcts.length > 0 ? round2(percentile(stvPcts, 0.5)) : null,
    medianViews: Math.round(percentile(views, 0.5)),
  };
}

function toExample(video: ViralNowVideo, platform: CalculatorPlatform): NicheExampleVideo {
  const views = video.metrics.views ?? 1;
  const likes = video.metrics.likes ?? 0;
  const comments = video.metrics.comments ?? 0;
  const shares = video.metrics.shares ?? null;
  const er = (publicInteractions(video, platform) / views) * 100;
  const ltv = (likes / views) * 100;
  const creator = video.creator.handle
    ? `@${video.creator.handle}`
    : video.creator.name || "Public creator";
  return {
    id: video.id,
    rank: video.rank,
    title: video.title.trim() || "Public short-form video",
    creator,
    platform: video.platform,
    views,
    likes,
    comments,
    shares,
    publicErPct: round2(er),
    likeToViewPct: round2(ltv),
    url: video.url,
  };
}

const MIN_NICHE_SAMPLE = 5;

/**
 * Computes real public short-form video benchmarks from ContHunt's bundled Viral Now snapshot.
 * Every figure is derived directly from `seed.json` — no invented averages.
 */
export function loadPlatformBenchmarks(platform: CalculatorPlatform): PlatformBenchmarkDataset {
  const data = loadViralNowData();
  const allVideos = data.niches.flatMap((n) => n.videos);
  const allPlatformVideos = allVideos.filter((v) => v.platform === platform && hasValidMetrics(v));
  const overall = summarize(allPlatformVideos, platform);

  const niches: NicheBenchmark[] = data.niches.map((niche) => {
    const nicheValid = niche.videos.filter(hasValidMetrics);
    const platformMatched = nicheValid.filter((v) => v.platform === platform);
    const isNicheSpecific = platformMatched.length >= MIN_NICHE_SAMPLE;
    const stats = isNicheSpecific ? summarize(platformMatched, platform) : overall;

    // Pick top 3 examples: prefer platform-matched ranked clips first, fill with top niche clips.
    const rankedMatched = [...platformMatched].sort((a, b) => a.rank - b.rank);
    const rankedOther = nicheValid
      .filter((v) => v.platform !== platform)
      .sort((a, b) => a.rank - b.rank);
    const topThree = [...rankedMatched, ...rankedOther].slice(0, 3).map((v) => toExample(v, platform));

    return {
      slug: niche.slug,
      name: niche.name,
      label: niche.label,
      description: niche.description,
      platformSampleSize: platformMatched.length,
      nicheSampleSize: nicheValid.length,
      isNicheSpecific,
      medianPublicErPct: stats.medianPublicErPct,
      p75PublicErPct: stats.p75PublicErPct,
      medianLikeToViewPct: stats.medianLikeToViewPct,
      medianCommentToViewPct: stats.medianCommentToViewPct,
      medianShareToViewPct: stats.medianShareToViewPct,
      medianViews: stats.medianViews,
      examples: topThree,
    };
  });

  return {
    platform,
    weekOf: data.weekOf ?? "2026-10-12",
    totalPlatformVideos: allPlatformVideos.length,
    totalAllVideos: allVideos.filter(hasValidMetrics).length,
    overallMedianPublicErPct: overall.medianPublicErPct,
    overallP75PublicErPct: overall.p75PublicErPct,
    overallMedianLikeToViewPct: overall.medianLikeToViewPct,
    overallMedianCommentToViewPct: overall.medianCommentToViewPct,
    overallMedianShareToViewPct: overall.medianShareToViewPct,
    overallMedianViews: overall.medianViews,
    niches,
  };
}
