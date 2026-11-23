"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GET_STARTED_URL, ROUTES } from "@/lib/links";
import type {
  CalculatorPlatform,
  NicheBenchmark,
  PlatformBenchmarkDataset,
} from "@/lib/tools/benchmarks";

type CalcMode = "single" | "batch";

interface BatchRow {
  id: number;
  label: string;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
}

interface SingleInputs {
  views: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  followers: string;
  accountMedianViews: string;
}

const DEFAULT_SINGLE: Record<CalculatorPlatform, SingleInputs> = {
  tiktok: {
    views: "48500",
    likes: "4120",
    comments: "145",
    shares: "310",
    saves: "620",
    followers: "18000",
    accountMedianViews: "14000",
  },
  instagram: {
    views: "32000",
    likes: "2150",
    comments: "92",
    shares: "410",
    saves: "540",
    followers: "24000",
    accountMedianViews: "11500",
  },
};

const DEFAULT_BATCH: Record<CalculatorPlatform, BatchRow[]> = {
  tiktok: [
    { id: 1, label: "Video 1", views: "12400", likes: "920", comments: "34", shares: "48", saves: "110" },
    { id: 2, label: "Video 2", views: "15800", likes: "1310", comments: "51", shares: "72", saves: "165" },
    { id: 3, label: "Video 3", views: "64200", likes: "6180", comments: "214", shares: "520", saves: "940" },
    { id: 4, label: "Video 4", views: "11900", likes: "840", comments: "28", shares: "39", saves: "95" },
    { id: 5, label: "Video 5", views: "19300", likes: "1620", comments: "66", shares: "112", saves: "230" },
  ],
  instagram: [
    { id: 1, label: "Reel 1", views: "9800", likes: "590", comments: "24", shares: "88", saves: "140" },
    { id: 2, label: "Reel 2", views: "14200", likes: "940", comments: "41", shares: "145", saves: "215" },
    { id: 3, label: "Reel 3", views: "51600", likes: "4180", comments: "168", shares: "790", saves: "1120" },
    { id: 4, label: "Reel 4", views: "11100", likes: "660", comments: "29", shares: "95", saves: "152" },
    { id: 5, label: "Reel 5", views: "16400", likes: "1120", comments: "49", shares: "198", saves: "290" },
  ],
};

function parseNum(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] ?? 0;
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}K`;
  return Math.round(n).toLocaleString("en-US");
}

function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "0.00%";
  return `${n.toFixed(2)}%`;
}

interface GradeResult {
  label: string;
  tone: "growth" | "breakout" | "neutral" | "decline";
  detail: string;
}

function gradeAgainstBenchmark(publicErPct: number, benchmark: NicheBenchmark): GradeResult {
  const p50 = benchmark.medianPublicErPct;
  const p75 = benchmark.p75PublicErPct;
  if (publicErPct <= 0) {
    return {
      label: "Enter metrics",
      tone: "neutral",
      detail: "Add views and likes to compare against public Viral Now benchmarks.",
    };
  }
  if (publicErPct >= p75 && p75 > 0) {
    return {
      label: "Top quartile vs Viral Now",
      tone: "growth",
      detail: `Above the 75th percentile (${formatPct(p75)}) of public viral clips in this benchmark.`,
    };
  }
  if (publicErPct >= p50 && p50 > 0) {
    return {
      label: "Above Viral Now median",
      tone: "growth",
      detail: `Beats the ${formatPct(p50)} public median among high-performing clips in this benchmark.`,
    };
  }
  if (publicErPct >= p50 * 0.6 && p50 > 0) {
    return {
      label: "Solid / near viral median",
      tone: "breakout",
      detail: `Within range of the ${formatPct(p50)} public Viral Now median (note: Viral Now tracks breakout clips, not average feeds).`,
    };
  }
  return {
    label: "Below Viral Now median",
    tone: "decline",
    detail: `Trails the ${formatPct(p50)} public median for top-ranked clips. Check hook retention and share/save triggers below.`,
  };
}

function gradeBadgeClasses(tone: GradeResult["tone"]): string {
  if (tone === "growth") return "bg-green-soft text-green-ink border-green/25";
  if (tone === "breakout") return "bg-yellow-soft text-yellow-ink border-yellow-deep/30";
  if (tone === "decline") return "bg-red-soft text-red-ink border-red/25";
  return "bg-surface text-ink-2 border-hairline";
}

function outlierBadge(multiplier: number | null): { label: string; className: string } | null {
  if (multiplier == null || !Number.isFinite(multiplier) || multiplier <= 0) return null;
  if (multiplier >= 3) {
    return {
      label: `${multiplier.toFixed(1)}x Breakout Outlier`,
      className: "bg-green-soft text-green-ink border-green/25",
    };
  }
  if (multiplier >= 1.5) {
    return {
      label: `${multiplier.toFixed(1)}x Above Baseline`,
      className: "bg-blue-soft text-blue-ink border-blue/25",
    };
  }
  if (multiplier >= 0.8) {
    return {
      label: `${multiplier.toFixed(1)}x Typical Baseline`,
      className: "bg-surface text-ink-2 border-hairline",
    };
  }
  return {
    label: `${multiplier.toFixed(1)}x Under Baseline`,
    className: "bg-red-soft text-red-ink border-red/25",
  };
}

export function EngagementCalculator({ dataset }: { dataset: PlatformBenchmarkDataset }) {
  const isTikTok = dataset.platform === "tiktok";
  const platformName = isTikTok ? "TikTok" : "Instagram";
  const itemNoun = isTikTok ? "video" : "Reel";
  const utmCampaign = isTikTok ? "tiktok-er-calc" : "instagram-er-calc";

  const [mode, setMode] = useState<CalcMode>("single");
  const [selectedSlug, setSelectedSlug] = useState<string>(dataset.niches[0]?.slug ?? "fitness-gym");
  const [single, setSingle] = useState<SingleInputs>(DEFAULT_SINGLE[dataset.platform]);
  const [batchRows, setBatchRows] = useState<BatchRow[]>(DEFAULT_BATCH[dataset.platform]);
  const [batchFollowers, setBatchFollowers] = useState<string>(DEFAULT_SINGLE[dataset.platform].followers);
  const [copied, setCopied] = useState(false);

  const selectedNiche = useMemo(
    () => dataset.niches.find((n) => n.slug === selectedSlug) ?? dataset.niches[0],
    [dataset.niches, selectedSlug],
  );

  const singleMetrics = useMemo(() => {
    const views = parseNum(single.views);
    const likes = parseNum(single.likes);
    const comments = parseNum(single.comments);
    const shares = parseNum(single.shares);
    const saves = parseNum(single.saves);
    const followers = parseNum(single.followers);
    const accountMedian = parseNum(single.accountMedianViews);

    const totalInteractions = likes + comments + shares + saves;
    const publicInteractions = isTikTok ? likes + comments + shares : likes + comments;

    const fullErByViews = views > 0 ? (totalInteractions / views) * 100 : 0;
    const publicErByViews = views > 0 ? (publicInteractions / views) * 100 : 0;
    const erByFollowers = followers > 0 ? (totalInteractions / followers) * 100 : null;
    const likeToView = views > 0 ? (likes / views) * 100 : 0;
    const commentToView = views > 0 ? (comments / views) * 100 : 0;
    const shareToView = views > 0 ? (shares / views) * 100 : 0;
    const saveToView = views > 0 ? (saves / views) * 100 : 0;
    const outlierMultiplier = views > 0 && accountMedian > 0 ? views / accountMedian : null;

    return {
      views,
      likes,
      comments,
      shares,
      saves,
      followers,
      accountMedian,
      totalInteractions,
      publicInteractions,
      fullErByViews,
      publicErByViews,
      erByFollowers,
      likeToView,
      commentToView,
      shareToView,
      saveToView,
      outlierMultiplier,
    };
  }, [single, isTikTok]);

  const batchMetrics = useMemo(() => {
    const parsed = batchRows.map((row) => {
      const views = parseNum(row.views);
      const likes = parseNum(row.likes);
      const comments = parseNum(row.comments);
      const shares = parseNum(row.shares);
      const saves = parseNum(row.saves);
      const total = likes + comments + shares + saves;
      const publicTotal = isTikTok ? likes + comments + shares : likes + comments;
      return {
        ...row,
        viewsNum: views,
        likesNum: likes,
        commentsNum: comments,
        sharesNum: shares,
        savesNum: saves,
        total,
        publicTotal,
        fullErPct: views > 0 ? (total / views) * 100 : 0,
        publicErPct: views > 0 ? (publicTotal / views) * 100 : 0,
        likeToViewPct: views > 0 ? (likes / views) * 100 : 0,
      };
    });

    const active = parsed.filter((r) => r.viewsNum > 0);
    const medianViews = median(active.map((r) => r.viewsNum));
    const totalViews = active.reduce((s, r) => s + r.viewsNum, 0);
    const totalLikes = active.reduce((s, r) => s + r.likesNum, 0);
    const totalComments = active.reduce((s, r) => s + r.commentsNum, 0);
    const totalShares = active.reduce((s, r) => s + r.sharesNum, 0);
    const totalSaves = active.reduce((s, r) => s + r.savesNum, 0);
    const totalInteractions = totalLikes + totalComments + totalShares + totalSaves;
    const totalPublicInteractions = isTikTok
      ? totalLikes + totalComments + totalShares
      : totalLikes + totalComments;

    const avgFullErByViews = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;
    const medianFullErByViews = median(active.map((r) => r.fullErPct));
    const avgPublicErByViews = totalViews > 0 ? (totalPublicInteractions / totalViews) * 100 : 0;
    const followers = parseNum(batchFollowers);
    const avgInteractionsPerPost = active.length > 0 ? totalInteractions / active.length : 0;
    const erByFollowers = followers > 0 && active.length > 0 ? (avgInteractionsPerPost / followers) * 100 : null;

    const rowsWithOutlier = parsed.map((r) => ({
      ...r,
      outlierMultiplier: medianViews > 0 && r.viewsNum > 0 ? r.viewsNum / medianViews : null,
    }));

    const topOutlier = rowsWithOutlier
      .filter((r) => r.outlierMultiplier != null)
      .sort((a, b) => (b.outlierMultiplier ?? 0) - (a.outlierMultiplier ?? 0))[0] ?? null;

    return {
      rows: rowsWithOutlier,
      activeCount: active.length,
      medianViews,
      totalViews,
      avgFullErByViews,
      medianFullErByViews,
      avgPublicErByViews,
      erByFollowers,
      likeToView: totalViews > 0 ? (totalLikes / totalViews) * 100 : 0,
      commentToView: totalViews > 0 ? (totalComments / totalViews) * 100 : 0,
      shareToView: totalViews > 0 ? (totalShares / totalViews) * 100 : 0,
      saveToView: totalViews > 0 ? (totalSaves / totalViews) * 100 : 0,
      topOutlier,
    };
  }, [batchRows, batchFollowers, isTikTok]);

  const activeFullEr = mode === "single" ? singleMetrics.fullErByViews : batchMetrics.avgFullErByViews;
  const activePublicEr = mode === "single" ? singleMetrics.publicErByViews : batchMetrics.avgPublicErByViews;
  const activeFollowerEr = mode === "single" ? singleMetrics.erByFollowers : batchMetrics.erByFollowers;
  const activeLtv = mode === "single" ? singleMetrics.likeToView : batchMetrics.likeToView;
  const activeCtv = mode === "single" ? singleMetrics.commentToView : batchMetrics.commentToView;
  const activeStv = mode === "single" ? singleMetrics.shareToView : batchMetrics.shareToView;
  const activeSav = mode === "single" ? singleMetrics.saveToView : batchMetrics.saveToView;
  const activeOutlier =
    mode === "single"
      ? singleMetrics.outlierMultiplier
      : batchMetrics.topOutlier?.outlierMultiplier ?? null;

  const grade = gradeAgainstBenchmark(activePublicEr, selectedNiche);
  const badge = outlierBadge(activeOutlier);

  const ctaHref = `${GET_STARTED_URL}?utm_source=free-tool&utm_medium=calculator&utm_campaign=${utmCampaign}&utm_content=${encodeURIComponent(selectedNiche.slug)}`;

  function handleAddRow() {
    if (batchRows.length >= 10) return;
    const nextId = Math.max(0, ...batchRows.map((r) => r.id)) + 1;
    setBatchRows([
      ...batchRows,
      {
        id: nextId,
        label: `${isTikTok ? "Video" : "Reel"} ${batchRows.length + 1}`,
        views: "",
        likes: "",
        comments: "",
        shares: "",
        saves: "",
      },
    ]);
  }

  function handleRemoveRow(id: number) {
    if (batchRows.length <= 1) return;
    setBatchRows(batchRows.filter((r) => r.id !== id));
  }

  function handleBatchChange(id: number, field: keyof Omit<BatchRow, "id">, value: string) {
    setBatchRows(batchRows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function handleResetSample() {
    if (mode === "single") {
      setSingle(DEFAULT_SINGLE[dataset.platform]);
    } else {
      setBatchRows(DEFAULT_BATCH[dataset.platform]);
      setBatchFollowers(DEFAULT_SINGLE[dataset.platform].followers);
    }
  }

  function handleClear() {
    if (mode === "single") {
      setSingle({ views: "", likes: "", comments: "", shares: "", saves: "", followers: "", accountMedianViews: "" });
    } else {
      setBatchRows([
        { id: 1, label: `${isTikTok ? "Video" : "Reel"} 1`, views: "", likes: "", comments: "", shares: "", saves: "" },
        { id: 2, label: `${isTikTok ? "Video" : "Reel"} 2`, views: "", likes: "", comments: "", shares: "", saves: "" },
        { id: 3, label: `${isTikTok ? "Video" : "Reel"} 3`, views: "", likes: "", comments: "", shares: "", saves: "" },
      ]);
      setBatchFollowers("");
    }
  }

  async function handleCopySummary() {
    const benchmarkSource = selectedNiche.isNicheSpecific
      ? `${selectedNiche.name} Viral Now median (${formatPct(selectedNiche.medianPublicErPct)}, n=${selectedNiche.platformSampleSize} ${platformName} clips)`
      : `ContHunt Viral Now ${platformName} median (${formatPct(selectedNiche.medianPublicErPct)}, n=${dataset.totalPlatformVideos} clips)`;

    const lines = [
      `${platformName} Engagement Rate Summary (${mode === "single" ? "Single Post" : `Batch of ${batchMetrics.activeCount} Posts`})`,
      `Niche: ${selectedNiche.name}`,
      `Full Engagement Rate by Views: ${formatPct(activeFullEr)}`,
      `Public-Comparable ER by Views: ${formatPct(activePublicEr)}`,
      activeFollowerEr != null ? `Engagement Rate by Followers: ${formatPct(activeFollowerEr)}` : null,
      activeOutlier != null ? `Outlier Multiplier: ${activeOutlier.toFixed(2)}x` : null,
      `Like-to-View: ${formatPct(activeLtv)} | Save-to-View: ${formatPct(activeSav)} | Share-to-View: ${formatPct(activeStv)} | Comment-to-View: ${formatPct(activeCtv)}`,
      `Benchmark: ${benchmarkSource} — ${grade.label}`,
      `Calculated on conthunt.app/tools/${dataset.platform}-engagement-rate-calculator`,
    ].filter(Boolean);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable in restricted contexts.
    }
  }

  function handleDownloadCsv() {
    let csv = "";
    if (mode === "single") {
      csv = [
        "mode,platform,niche,views,likes,comments,shares,saves,followers,account_median_views,full_er_by_views_pct,public_er_by_views_pct,er_by_followers_pct,like_to_view_pct,save_to_view_pct,share_to_view_pct,outlier_multiplier,benchmark_median_public_er_pct",
        [
          "single",
          dataset.platform,
          `"${selectedNiche.name.replace(/"/g, '""')}"`,
          singleMetrics.views,
          singleMetrics.likes,
          singleMetrics.comments,
          singleMetrics.shares,
          singleMetrics.saves,
          singleMetrics.followers,
          singleMetrics.accountMedian,
          singleMetrics.fullErByViews.toFixed(2),
          singleMetrics.publicErByViews.toFixed(2),
          singleMetrics.erByFollowers != null ? singleMetrics.erByFollowers.toFixed(2) : "",
          singleMetrics.likeToView.toFixed(2),
          singleMetrics.saveToView.toFixed(2),
          singleMetrics.shareToView.toFixed(2),
          singleMetrics.outlierMultiplier != null ? singleMetrics.outlierMultiplier.toFixed(2) : "",
          selectedNiche.medianPublicErPct.toFixed(2),
        ].join(","),
      ].join("\n");
    } else {
      const header =
        "label,views,likes,comments,shares,saves,full_er_by_views_pct,public_er_by_views_pct,like_to_view_pct,outlier_multiplier_vs_batch_median";
      const rows = batchMetrics.rows.map((r) =>
        [
          `"${r.label.replace(/"/g, '""')}"`,
          r.viewsNum,
          r.likesNum,
          r.commentsNum,
          r.sharesNum,
          r.savesNum,
          r.fullErPct.toFixed(2),
          r.publicErPct.toFixed(2),
          r.likeToViewPct.toFixed(2),
          r.outlierMultiplier != null ? r.outlierMultiplier.toFixed(2) : "",
        ].join(","),
      );
      csv = [header, ...rows].join("\n");
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conthunt-${dataset.platform}-engagement-rate.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const benchmarkMaxScale = Math.max(selectedNiche.p75PublicErPct * 1.5, activePublicEr * 1.15, 10);
  const userBarPct = Math.min(100, (activePublicEr / benchmarkMaxScale) * 100);
  const p50MarkerPct = Math.min(100, (selectedNiche.medianPublicErPct / benchmarkMaxScale) * 100);
  const p75MarkerPct = Math.min(100, (selectedNiche.p75PublicErPct / benchmarkMaxScale) * 100);

  return (
    <div className="space-y-8">
      {/* Main Interactive Card */}
      <div className="rounded-card border border-hairline bg-paper p-5 shadow-float sm:p-8">
        {/* Top Controls Row: Mode Toggle + Niche Selector */}
        <div className="flex flex-col gap-4 border-b border-hairline pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="inline-flex w-full rounded-btn border border-hairline bg-surface p-1 sm:w-auto"
            role="tablist"
            aria-label="Calculator mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "single"}
              onClick={() => setMode("single")}
              className={`flex-1 rounded-chip px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                mode === "single" ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"
              }`}
            >
              Single {itemNoun} + Outlier Check
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "batch"}
              onClick={() => setMode("batch")}
              className={`flex-1 rounded-chip px-4 py-2 text-sm font-medium transition-colors sm:flex-none ${
                mode === "batch" ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"
              }`}
            >
              Account Average (3–10 {isTikTok ? "Videos" : "Reels"})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="calc-niche-select" className="font-mono text-xs uppercase tracking-wider text-muted">
              Benchmark niche
            </label>
            <select
              id="calc-niche-select"
              value={selectedNiche.slug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="rounded-chip border border-hairline bg-bg px-3 py-2 text-sm font-medium text-ink focus:border-blue focus:outline-none"
            >
              {dataset.niches.map((niche) => (
                <option key={niche.slug} value={niche.slug}>
                  {niche.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleResetSample}
              className="rounded-chip border border-hairline bg-surface px-3 py-2 text-xs font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              Sample
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-chip border border-hairline bg-paper px-3 py-2 text-xs font-medium text-muted hover:text-ink"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Inputs + Live Results Split */}
        <div className="mt-6 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7">
            {mode === "single" ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <NumberField
                    id="input-views"
                    label="Views"
                    required
                    value={single.views}
                    onChange={(v) => setSingle({ ...single, views: v })}
                    placeholder="48500"
                  />
                  <NumberField
                    id="input-likes"
                    label="Likes"
                    required
                    value={single.likes}
                    onChange={(v) => setSingle({ ...single, likes: v })}
                    placeholder="4120"
                  />
                  <NumberField
                    id="input-comments"
                    label="Comments"
                    value={single.comments}
                    onChange={(v) => setSingle({ ...single, comments: v })}
                    placeholder="145"
                  />
                  <NumberField
                    id="input-shares"
                    label="Shares"
                    hint={isTikTok ? "Public on TikTok" : "From IG Insights"}
                    value={single.shares}
                    onChange={(v) => setSingle({ ...single, shares: v })}
                    placeholder="310"
                  />
                  <NumberField
                    id="input-saves"
                    label={isTikTok ? "Saves / Bookmarks" : "Saves"}
                    hint="High-intent signal"
                    value={single.saves}
                    onChange={(v) => setSingle({ ...single, saves: v })}
                    placeholder="620"
                  />
                  <NumberField
                    id="input-followers"
                    label="Followers"
                    hint="Optional (ER by followers)"
                    value={single.followers}
                    onChange={(v) => setSingle({ ...single, followers: v })}
                    placeholder="18000"
                  />
                </div>

                <div className="rounded-btn border border-hairline bg-surface/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                      <label htmlFor="input-median-views" className="block text-sm font-medium text-ink">
                        Account median views (optional — for Outlier Score)
                      </label>
                      <p className="mt-0.5 text-xs text-muted">
                        Enter the median views of the creator&apos;s last 10 {isTikTok ? "videos" : "Reels"} to see whether this {itemNoun} is a breakout outlier (e.g., 3.5x baseline).
                      </p>
                    </div>
                    <input
                      id="input-median-views"
                      type="text"
                      inputMode="numeric"
                      value={single.accountMedianViews}
                      onChange={(e) => setSingle({ ...single, accountMedianViews: e.target.value })}
                      placeholder="14000"
                      className="w-full rounded-chip border border-hairline bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-blue focus:outline-none sm:w-40"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-ink-2">
                    Enter 3 to 10 recent {isTikTok ? "videos" : "Reels"} to calculate median views, account engagement rate, and which clip is a breakout outlier.
                  </p>
                  <div className="flex items-center gap-2">
                    <label htmlFor="batch-followers" className="text-xs font-medium text-muted">
                      Followers (optional)
                    </label>
                    <input
                      id="batch-followers"
                      type="text"
                      inputMode="numeric"
                      value={batchFollowers}
                      onChange={(e) => setBatchFollowers(e.target.value)}
                      placeholder="18000"
                      className="w-28 rounded-chip border border-hairline bg-bg px-2.5 py-1.5 font-mono text-xs text-ink focus:border-blue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-btn border border-hairline">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-hairline bg-surface text-muted">
                        <th className="px-2.5 py-2 font-mono font-medium">Post</th>
                        <th className="px-2 py-2 font-mono font-medium">Views</th>
                        <th className="px-2 py-2 font-mono font-medium">Likes</th>
                        <th className="px-2 py-2 font-mono font-medium">Comm.</th>
                        <th className="px-2 py-2 font-mono font-medium">Shares</th>
                        <th className="px-2 py-2 font-mono font-medium">Saves</th>
                        <th className="px-2 py-2 font-mono font-medium">ER%</th>
                        <th className="px-2 py-2 font-mono font-medium">Outlier</th>
                        <th className="w-7 px-1 py-2" aria-label="Remove row" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline bg-paper">
                      {batchMetrics.rows.map((row) => (
                        <tr key={row.id} className="align-middle">
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              value={row.label}
                              onChange={(e) => handleBatchChange(row.id, "label", e.target.value)}
                              aria-label={`Label for row ${row.id}`}
                              className="w-20 rounded border border-hairline bg-bg px-2 py-1 text-xs text-ink focus:border-blue focus:outline-none"
                            />
                          </td>
                          {(["views", "likes", "comments", "shares", "saves"] as const).map((field) => (
                            <td key={field} className="px-1.5 py-1.5">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={row[field]}
                                onChange={(e) => handleBatchChange(row.id, field, e.target.value)}
                                aria-label={`${row.label} ${field}`}
                                className="w-16 rounded border border-hairline bg-bg px-1.5 py-1 font-mono text-xs text-ink focus:border-blue focus:outline-none"
                              />
                            </td>
                          ))}
                          <td className="px-2 py-1.5 font-mono font-medium text-ink">
                            {row.viewsNum > 0 ? formatPct(row.fullErPct) : "—"}
                          </td>
                          <td className="px-2 py-1.5 font-mono">
                            {row.outlierMultiplier != null ? (
                              <span
                                className={`inline-block rounded-chip px-1.5 py-0.5 text-[11px] font-semibold ${
                                  row.outlierMultiplier >= 3
                                    ? "bg-green-soft text-green-ink"
                                    : row.outlierMultiplier >= 1.5
                                      ? "bg-blue-soft text-blue-ink"
                                      : "bg-surface text-ink-2"
                                }`}
                              >
                                {row.outlierMultiplier.toFixed(1)}x
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-1 py-1.5 text-center">
                            {batchRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                aria-label={`Remove ${row.label}`}
                                className="rounded px-1.5 py-0.5 text-muted hover:bg-surface hover:text-ink"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    disabled={batchRows.length >= 10}
                    className="rounded-chip border border-hairline bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-2 disabled:opacity-40"
                  >
                    + Add {itemNoun} ({batchRows.length}/10)
                  </button>
                  {batchMetrics.activeCount > 0 && (
                    <span className="font-mono text-xs text-muted">
                      Batch median views: <strong className="text-ink">{formatCompact(batchMetrics.medianViews)}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Sub-Ratio Breakdown Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat
                label="Like / View"
                value={formatPct(activeLtv)}
                benchmark={`Median ${formatPct(selectedNiche.medianLikeToViewPct)}`}
              />
              <MiniStat
                label="Save / View"
                value={formatPct(activeSav)}
                benchmark="Private / Insights"
              />
              <MiniStat
                label="Share / View"
                value={formatPct(activeStv)}
                benchmark={
                  selectedNiche.medianShareToViewPct != null
                    ? `Median ${formatPct(selectedNiche.medianShareToViewPct)}`
                    : "IG Insights only"
                }
              />
              <MiniStat
                label="Comment / View"
                value={formatPct(activeCtv)}
                benchmark={`Median ${formatPct(selectedNiche.medianCommentToViewPct)}`}
              />
            </div>
          </div>

          {/* Right Column: Results & Real Viral Now Benchmark */}
          <div className="flex flex-col justify-between rounded-btn border border-hairline bg-bg p-5 lg:col-span-5">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  {mode === "single" ? "Full Engagement Rate (by Views)" : "Weighted Account ER (by Views)"}
                </span>
                <span className={`rounded-chip border px-2.5 py-0.5 text-xs font-medium ${gradeBadgeClasses(grade.tone)}`}>
                  {grade.label}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-mono text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                  {formatPct(activeFullEr)}
                </span>
                {badge && (
                  <span className={`rounded-chip border px-2.5 py-1 font-mono text-xs font-semibold ${badge.className}`}>
                    {badge.label}
                  </span>
                )}
              </div>

              {/* Secondary KPI row */}
              <div className="grid grid-cols-2 gap-3 border-y border-hairline py-4">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    Public-Comparable ER
                  </div>
                  <div className="mt-1 font-mono text-lg font-semibold text-ink">
                    {formatPct(activePublicEr)}
                  </div>
                  <div className="text-[11px] text-muted">
                    {isTikTok ? "(Likes + Comm. + Shares) / Views" : "(Likes + Comm.) / Views"}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    ER by Followers
                  </div>
                  <div className="mt-1 font-mono text-lg font-semibold text-ink">
                    {activeFollowerEr != null ? formatPct(activeFollowerEr) : "—"}
                  </div>
                  <div className="text-[11px] text-muted">
                    {activeFollowerEr != null
                      ? mode === "single"
                        ? "Interactions / Followers"
                        : "Avg post interactions / Followers"
                      : "Enter followers to compute"}
                  </div>
                </div>
              </div>

              {/* Real Viral Now Benchmark Comparison Bar */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">
                    vs. {selectedNiche.isNicheSpecific ? selectedNiche.name : `Viral Now ${platformName}`} public clips
                  </span>
                  <span className="font-mono text-muted">
                    Median {formatPct(selectedNiche.medianPublicErPct)} · P75 {formatPct(selectedNiche.p75PublicErPct)}
                  </span>
                </div>

                <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-ink transition-all duration-300"
                    style={{ width: `${Math.max(2, userBarPct)}%` }}
                  />
                  {/* Median tick */}
                  <div
                    title={`Viral Now median: ${formatPct(selectedNiche.medianPublicErPct)}`}
                    className="absolute top-0 h-full w-0.5 bg-blue"
                    style={{ left: `${p50MarkerPct}%` }}
                  />
                  {/* P75 tick */}
                  <div
                    title={`Viral Now 75th percentile: ${formatPct(selectedNiche.p75PublicErPct)}`}
                    className="absolute top-0 h-full w-0.5 bg-green"
                    style={{ left: `${p75MarkerPct}%` }}
                  />
                </div>

                <p className="text-xs leading-relaxed text-ink-2">{grade.detail}</p>

                <p className="font-mono text-[11px] leading-relaxed text-muted">
                  {selectedNiche.isNicheSpecific
                    ? `Source: ContHunt Viral Now (${selectedNiche.platformSampleSize} public ${platformName} clips in ${selectedNiche.name}, week of ${dataset.weekOf}).`
                    : `Source: ContHunt Viral Now ${platformName} dataset (${dataset.totalPlatformVideos} public ${platformName} clips across 20 niches, week of ${dataset.weekOf}; ${selectedNiche.name} has ${selectedNiche.platformSampleSize} ${platformName} clips in this snapshot, so the full ${platformName} median is shown).`}
                </p>
              </div>
            </div>

            {/* Export / Copy Actions */}
            <div className="mt-6 flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex-1 rounded-btn border border-hairline bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
              >
                {copied ? "Copied summary" : "Copy summary"}
              </button>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="flex-1 rounded-btn border border-hairline bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Handoff: Live Top 3 Viral Now Examples + ContHunt Trial CTA */}
      <div className="rounded-card border border-hairline bg-paper p-5 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Real benchmark examples · {selectedNiche.name}
            </p>
            <h2 className="mt-1 text-xl font-medium text-ink sm:text-2xl">
              Top public breakout clips in {selectedNiche.name}
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              Compare your numbers against actual public clips ranked on ContHunt Viral Now (week of {dataset.weekOf}), then inspect what hooks drove them.
            </p>
          </div>
          <Link
            href={`${ROUTES.viralNow}/${selectedNiche.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-blue-ink underline underline-offset-4 hover:text-ink"
          >
            Browse all {selectedNiche.nicheSampleSize} clips in {selectedNiche.label} →
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {selectedNiche.examples.map((video) => (
            <div
              key={video.id}
              className="flex flex-col justify-between rounded-btn border border-hairline bg-bg p-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
                  <span>
                    #{video.rank} · {video.platform}
                  </span>
                  <span className="rounded-chip bg-surface px-2 py-0.5 text-ink">
                    {formatCompact(video.views)} views
                  </span>
                </div>
                <p className="mt-2.5 line-clamp-2 text-sm font-medium leading-snug text-ink">
                  {video.title}
                </p>
                <p className="mt-1 text-xs text-muted">{video.creator}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3 font-mono text-xs">
                <div>
                  <span className="text-muted">Public ER </span>
                  <strong className="text-ink">{formatPct(video.publicErPct)}</strong>
                </div>
                <div>
                  <span className="text-muted">L/V </span>
                  <strong className="text-ink">{formatPct(video.likeToViewPct)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* High-Intent ContHunt CTA Strip */}
        <div className="mt-6 flex flex-col gap-4 rounded-btn border border-hairline bg-night p-5 text-paper sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="space-y-1">
            <p className="font-mono text-xs uppercase tracking-wider text-blue-glow">
              Go beyond manual calculators
            </p>
            <h3 className="text-lg font-medium text-paper sm:text-xl">
              Research public TikTok, Reels &amp; Shorts hooks in {selectedNiche.name}
            </h3>
            <p className="max-w-2xl text-sm text-paper/75">
              Engagement rate tells you <em>which</em> clip won. ContHunt breaks down <em>why</em> — searching public videos across TikTok, Instagram Reels, and YouTube Shorts, scoring hooks and formats, and tracking competitor outliers automatically.
            </p>
          </div>
          <a
            href={ctaHref}
            data-ch-placement="free_tool_cta"
            className="inline-flex shrink-0 items-center justify-center rounded-btn bg-paper px-5 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            Start 7-day free trial →
          </a>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  id,
  label,
  hint,
  required,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? <span className="ml-0.5 text-blue-ink">*</span> : null}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-chip border border-hairline bg-bg px-3 py-2 font-mono text-sm text-ink focus:border-blue focus:outline-none"
      />
      {hint ? <p className="text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

function MiniStat({
  label,
  value,
  benchmark,
}: {
  label: string;
  value: string;
  benchmark: string;
}) {
  return (
    <div className="rounded-btn border border-hairline bg-bg p-3">
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 font-mono text-lg font-semibold text-ink">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted">{benchmark}</div>
    </div>
  );
}
