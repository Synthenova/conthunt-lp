---
title: "Short-Form Video Engagement Benchmark 2026: 1,500 Public TikToks, Reels & Shorts"
slug: short-form-video-engagement-benchmark-2026
excerpt: "First-party public benchmark of 1,500 English, non-ad TikTok, Instagram Reels, and YouTube Shorts posts across five commercial niches, with downloadable CSV and JSON appendices."
date: "2026-11-23"
updated: "2026-11-23"
category: Research
readingMinutes: 13
author: "ContHunt Team"
featured: true
section: blog
---

This study benchmarks **1,500 deduplicated public short-form videos** — 500 TikToks, 500 Instagram Reels, and 500 YouTube Shorts — evenly balanced across five commercial niches (**100 clips per platform per niche**). Extracted on **23 November 2026 at 08:53 UTC** from ContHunt's indexed public video database, the sample covers posts published between **1 January 2026 and 16 November 2026** (every post at least 7 days old at extraction) after filtering out non-English captions, disclosed ads, and incomplete rows from **80,808 initial 2026 candidates**.

Every table below is computed directly from the public dataset, with full reproducibility files attached:

- [Download CSV observations (1,500 rows, 384 KB)](/public/research/short-form-video-engagement-benchmark-2026/observations.csv)
- [Download JSON summary & filter specification (30 KB)](/public/research/short-form-video-engagement-benchmark-2026/summary.json)

This is a **public metadata benchmark** for 2026–2027 creative planning, not a private retention or revenue study. It reports only publicly visible counters (views, likes, comments, TikTok shares, duration, caption length, and hashtag counts) and makes zero claims about watch-time curves, completion rates, RPM, ad spend, or TikTok Shop GMV.

---

## Key findings at a glance (n = 1,500 public videos)

1. **Instagram Reels and TikTok earn roughly 3× higher like-to-view ratios than YouTube Shorts.** Across 500 sampled clips per platform, median like-to-view is **5.20%** on Instagram Reels (IQR 2.66%–8.44%), **4.85%** on TikTok (IQR 2.57%–7.92%), and **1.77%** on YouTube Shorts (IQR 0.98%–3.12%).
2. **TikTok has the widest breakout upside tail (71.9× p90/median skew).** Instagram Reels edges out TikTok on median views (**3,068** vs. **2,818**), but TikTok's 90th-percentile view count reaches **202,504** — **2.6× higher** than Instagram Reels (**78,858**) and **6.9× higher** than YouTube Shorts (**29,277**).
3. **Instagram Reels leads on public comment rates (0.22% median, 3.67% at p90).** That is more than double the median comment-to-view ratio on YouTube Shorts (**0.10%**) and TikTok (**0.09%**).
4. **Longer short-form clips earn monotonically higher like-to-view ratios on every single platform.** Within each platform separately (n = 1,430 clips with duration), moving from under 15 seconds to 60+ seconds lifts median like-to-view from **3.71% → 5.94%** on TikTok, **2.55% → 5.92%** on Instagram Reels, and **0.92% → 2.76%** on YouTube Shorts.
5. **Tech & AI viewers share and comment instead of double-tapping.** Tech & AI Tools had the lowest TikTok like-to-view median of all five niches (**3.70%**), yet posted the **highest TikTok share-to-view median (0.42%)** — triple Fitness & Wellness (**0.14%**) — and the **highest YouTube Shorts comment-to-view median (0.66%)**.
6. **Heavy hashtag stuffing (8+ tags) did not lift views.** Clips with 8+ hashtags recorded lower median views on TikTok (**686** vs. **3,070** for 4–7 tags) and Instagram (**86** vs. **7,736** for 1–3 tags), while YouTube Shorts medians stayed flat across all hashtag buckets (**953–1,026** views).

Want to check how your own clip stacks up right now? Run your numbers through our free [TikTok Engagement Rate Calculator](/tools/tiktok-engagement-rate-calculator) or [Instagram Engagement Rate Calculator](/tools/instagram-engagement-rate-calculator).

---

## 1. Cross-platform benchmark: TikTok vs. Instagram Reels vs. YouTube Shorts

Because short-form view distributions are heavily right-skewed, raw averages mislead. A single 2M-view outlier pulls a 100-video mean far above what a normal post earns. Every table in this study reports **medians (p50)**, **interquartile ranges (p25–p75)**, and **breakout thresholds (p90)**.

| Metric (n = 500 per platform) | TikTok | Instagram Reels | YouTube Shorts |
| --- | ---: | ---: | ---: |
| **Median views (p50)** | 2,818 | **3,068** | 998 |
| **Views IQR (p25 – p75)** | 475 – 38,921 | 670 – 15,621 | 233 – 3,130 |
| **90th-percentile views (p90)** | **202,504** | 78,858 | 29,277 |
| **Breakout skew (p90 ÷ p50)** | **71.9×** | 25.7× | 29.3× |
| **Median Like-to-View (%)** | 4.85% | **5.20%** | 1.77% |
| **Like-to-View IQR (p25 – p75)** | 2.57% – 7.92% | 2.66% – 8.44% | 0.98% – 3.12% |
| **90th-percentile Like-to-View (%)** | 12.32% | **14.52%** | 5.57% |
| **Median Comment-to-View (%)** | 0.09% | **0.22%** | 0.10% |
| **90th-percentile Comment-to-View (%)** | 1.02% | **3.67%** | 1.40% |
| **Median Share-to-View (%)** | **0.19%** (p90: 1.08%) | Private (n = 0) | Private (n = 0) |
| **Median duration** | **51.7s** (n = 430) | 39.0s (n = 500) | 37.0s (n = 500) |
| **Median caption length (chars)** | 298 | 487 | **508** |
| **Median hashtag count** | 5 | 5 | 5 |

*Notes: TikTok is the only platform that consistently exposes public share counts (n = 500); public saves were populated on only 2 TikTok rows and 0 Reels/Shorts rows, so saves are omitted from public cross-platform comparisons. Duration was present on 430 of 500 TikTok rows and all 500 Instagram Reels and YouTube Shorts rows.*

### What this means for creative teams
- **Never apply one engagement threshold across all three platforms.** A **3.5% like-to-view ratio** on YouTube Shorts is well above the 75th percentile (3.12%), whereas the same 3.5% on Instagram Reels or TikTok sits below the median.
- **TikTok rewards swing-for-the-fences testing; Reels rewards steadier baseline floors.** TikTok's 25th percentile sits lower than Instagram's (475 vs. 670 views), but its top decile (p90) reaches **202,504 views** — 71.9× its median.

---

## 2. Benchmark by commercial niche & platform (all 15 cells, n = 100 each)

Category mechanics matter as much as platform choice. Below are the verified medians and 90th-percentile view thresholds across all five commercial verticals.

| Niche (100 clips per row) | Platform | Median Views | p90 Views | Median Like/View | Median Comm./View | Median Share/View | Median Duration |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| **Beauty & Skincare** | TikTok | 3,555 | **531,028** | **6.28%** | 0.12% | 0.15% | 44.2s |
| Beauty & Skincare | Instagram Reels | 3,739 | 81,872 | 5.37% | 0.34% | — | 40.9s |
| Beauty & Skincare | YouTube Shorts | 951 | 33,461 | 1.60% | 0.10% | — | 31.5s |
| **E-commerce & Product Finds** | TikTok | 886 | 85,366 | 5.06% | 0.13% | 0.16% | 65.2s |
| E-commerce & Product Finds | Instagram Reels | 2,175 | 49,688 | **6.00%** | **0.42%** | — | 43.8s |
| E-commerce & Product Finds | YouTube Shorts | 1,136 | 32,879 | 2.01% | 0.07% | — | 48.0s |
| **Fitness & Wellness** | TikTok | 2,691 | 159,708 | 5.58% | 0.06% | 0.14% | 47.3s |
| Fitness & Wellness | Instagram Reels | 2,447 | 60,990 | 5.26% | 0.11% | — | 40.0s |
| Fitness & Wellness | YouTube Shorts | 1,216 | 41,955 | 1.64% | 0.07% | — | 31.5s |
| **Food & Recipes** | TikTok | **9,542** | 321,294 | 4.70% | 0.06% | 0.26% | 52.5s |
| Food & Recipes | Instagram Reels | **9,338** | 153,392 | 3.76% | 0.12% | — | 29.8s |
| Food & Recipes | YouTube Shorts | 1,135 | 15,852 | 1.63% | 0.15% | — | 38.5s |
| **Tech & AI Tools** | TikTok | 1,503 | 100,659 | 3.70% | 0.12% | **0.42%** | 52.2s |
| Tech & AI Tools | Instagram Reels | 1,497 | 33,478 | 5.04% | 0.35% | — | 43.6s |
| Tech & AI Tools | YouTube Shorts | 275 | 6,302 | 2.07% | **0.66%** | — | 42.0s |

### Four niche patterns that stand out
- **Beauty & Skincare has the largest TikTok breakout ceiling:** Its p90 hits **531,028 views** alongside the highest TikTok like-to-view median (**6.28%**).
- **Food & Recipes delivers the highest baseline reach on both TikTok (9,542 median views) and Instagram Reels (9,338 median views):** Recipe clips are broadly accessible to cold viewers, driving nearly 3× higher median reach than the five-niche average — even though their like-to-view ratios sit lower than Beauty or E-commerce.
- **E-commerce & Product Finds runs longest on TikTok (65.2s median) and earns the highest comment rate on Instagram Reels (0.42%):** Product demos, hauls, and unboxings need room for a before/after or problem/solution sequence, and Reels viewers respond heavily in comments (often asking for links or product names). Compare dedicated product-discovery tools in our [TikTok Shop analytics tools guide](/blog/tiktok-shop-analytics-tools) and [UGC ad research tools guide](/blog/ugc-ad-research-tools).
- **Tech & AI Tools behaves like a utility category, not an entertainment category:** On TikTok it posts the lowest median like-to-view (**3.70%**) but the highest share-to-view (**0.42%** — 2.8× Beauty's 0.15%). On YouTube Shorts, Tech & AI posts the highest comment-to-view rate of any cell in the entire dataset (**0.66%**), driven by viewers debating workflows, tools, and prompts.

---

## 3. Clip length vs. engagement (within each platform, n = 1,430)

A common trap in multi-platform studies is combining platforms before slicing by duration (if shorter clips mostly come from YouTube Shorts, short clips look worse purely because Shorts have lower like rates). Below, we split **within each platform separately**.

The pattern holds cleanly on all three platforms: **longer short-form clips earn monotonically higher median like-to-view ratios**.

| Platform | Duration Bucket | Sample (n) | Median Views | p90 Views | Median Like-to-View |
| --- | --- | ---: | ---: | ---: | ---: |
| **TikTok** *(n = 430)* | < 15s | 43 | 1,076 | 420,691 | 3.71% |
| TikTok | 15 – 30s | 76 | 1,894 | 161,439 | 3.97% |
| TikTok | 30 – 60s | 120 | 1,118 | 101,978 | 4.24% |
| TikTok | **60s+** | 191 | **4,231** | 209,942 | **5.94%** |
| **Instagram Reels** *(n = 500)* | < 15s | 70 | 1,231 | 19,056 | 2.55% |
| Instagram Reels | 15 – 30s | 113 | 3,987 | 87,656 | 4.11% |
| Instagram Reels | 30 – 60s | 174 | 2,355 | 61,156 | 5.85% |
| Instagram Reels | **60s+** | 143 | **4,616** | **106,695** | **5.92%** |
| **YouTube Shorts** *(n = 500)* | < 15s | 74 | 952 | 18,199 | 0.92% |
| YouTube Shorts | 15 – 30s | 134 | **1,163** | 29,680 | 1.36% |
| YouTube Shorts | 30 – 60s | 150 | 952 | 17,727 | 2.00% |
| YouTube Shorts | **60s+** | 142 | 860 | **32,493** | **2.76%** |

*Caution on interpretation:* This is observational correlation, not causation. Longer clips in commercial niches (tutorials, multi-step skincare routines, product breakdowns, full recipes) often deliver a complete payoff that prompts a like, whereas ultra-short `<15s` clips frequently rely on loops or visual stunts (notice TikTok's small `<15s` bucket of 43 clips still produced a 420,691 p90 view ceiling despite a lower 3.71% median like-to-view). Still, the widespread myth that commercial videos *must* be cut under 15 seconds to engage is not supported by this 2026 dataset.

---

## 4. Hashtag count vs. views & like-to-view

All three platforms shared the exact same overall median of **5 hashtags per caption**, yet the bucket breakdown shows no benefit to stuffing 8 or more tags.

| Platform | Hashtags in Caption | Sample (n) | Median Views | Median Like-to-View |
| --- | --- | ---: | ---: | ---: |
| **TikTok** | 0 | 29 | 11,781 | 4.00% |
| TikTok | 1 – 3 | 51 | 1,107 | 5.27% |
| TikTok | 4 – 7 | 401 | 3,070 | 4.93% |
| TikTok | 8+ | 19 | 686 | 3.06% |
| **Instagram Reels** | 0 | 144 | 3,710 | 4.89% |
| Instagram Reels | 1 – 3 | 54 | 7,736 | 5.64% |
| Instagram Reels | 4 – 7 | 288 | 2,230 | 5.20% |
| Instagram Reels | 8+ | 14 | 86 | 5.76% |
| **YouTube Shorts** | 0 | 107 | 1,007 | 2.00% |
| YouTube Shorts | 1 – 3 | 60 | 1,026 | 2.23% |
| YouTube Shorts | 4 – 7 | 185 | 989 | 1.51% |
| YouTube Shorts | 8+ | 148 | 953 | 1.75% |

*Small-bucket note:* The `0` and `8+` buckets on TikTok (n = 29 and n = 19) and `8+` on Instagram (n = 14) are small, so treat those exact medians cautiously. The practical takeaway is consistent with platform guidance: **1 to 5 specific topical hashtags** is the norm across winning posts, and piling on 8+ tags does not rescue weak creative.

---

## 5. Methodology, QA funnel & explicit limitations

To match the transparency standard of our earlier [YouTube Shorts Public Search Benchmark (September 2026)](/blog/youtube-shorts-public-search-benchmark-2026), we publish the exact filtering funnel, SQL scope, and methodological caveats below.

### Filtering & QA funnel

| Stage | Row Count | Removed at Stage | Rule Applied |
| --- | ---: | ---: | --- |
| 1. 2026 short-form candidates | 80,808 | — | Read-only extract (`2026-11-23 08:53:50 UTC`), public URL pattern matching TikTok videos, Instagram Reels, or YouTube Shorts, `published_at >= 2026-01-01` |
| 2. Minimum 7-day post age | 74,165 | 6,643 | Required `published_at <= extraction_utc - 7 days` (latest included post: `2026-11-16 08:02 UTC`) so 24-hour velocity doesn't skew distributions |
| 3. Deduplication | 74,165 | 0 | Deduplicated by `(platform, external_id)` keeping newest `snapshot_at` |
| 4. Niche matching (5 verticals) | 14,206 | 59,959 | Deterministic case-insensitive keyword regex on title + first 400 chars of caption (964 multi-niche matches assigned in fixed niche order) |
| 5. English-language QA | 12,106 | 2,100 | Stripped hashtags; required ≥ 20 chars, zero CJK/Arabic/Cyrillic/Devanagari characters, ≥ 85% Latin letters, ≥ 2 common English words, AND `langdetect 1.0.9` (seed 42) = English |
| 6. Ad & PR disclosure exclusion | 11,485 | 621 | Excluded DB `is_ad` / `is_paid_partnership` flags and caption disclosures (`#ad`, `#sponsored`, `#paidpartnership`, `#gifted`, `#affiliate`, `#tiktokshopaffiliate`, `#prpackages`, `paid partnership`) |
| 7. Metric completeness | 10,104 | 1,381 | Required non-null `views > 0` and `likes >= 0` |
| 8. Balanced deterministic sample | **1,500** | 8,604 | Sorted each of the 15 `(niche, platform)` cells by `MD5(external_id)` and selected the first **100** rows (every cell had ≥ 101 clean candidates before sampling) |

A manual spot-check of 10 sampled captions confirmed apparent English text and niche relevance. Full regex definitions, pre-sample counts for every cell (ranging from 101 clean Instagram E-commerce candidates up to 2,204 clean TikTok Tech & AI candidates), and the exact read-only SQL query are stored inside [summary.json](/public/research/short-form-video-engagement-benchmark-2026/summary.json).

### Explicit limitations (read before citing)
- **Discovery & indexing survivorship bias:** ContHunt's database indexes public short-form videos discovered through niche searches, creator tracking, and trend monitors — not a uniform random sample of every upload on earth. Indexed posts tend to over-represent discoverable, searchable, and higher-performing public clips compared to zero-view private or unindexed uploads.
- **Cached database snapshots, not live re-fetches:** `snapshot_at` records `content_items.updated_at` in the database rather than a synchronized real-time scrape timestamp across all 1,500 rows, and individual URLs were not re-checked for live availability at publication.
- **Heuristic niche and language filters:** Deterministic keyword regexes + `langdetect` eliminate the bulk of off-topic and foreign-language leakage, but heuristic classifiers are not a 100% guarantee of English or single-niche exclusivity.
- **Undisclosed sponsorships may remain:** Filtering removes explicitly tagged `#ad`, `#sponsored`, `#affiliate`, and platform-flagged paid partnerships, but undisclosed brand deals cannot be detected from public text alone.
- **Public metadata only:** No video files or thumbnails are rehosted. Private metrics (retention curves, average watch duration, Instagram DM sends/saves, TikTok bookmarks, revenue, or TikTok Shop GMV) are intentionally excluded.

---

## How to run this analysis on your own niche

Static benchmarks tell you whether a metric is normal or an outlier; your next step is inspecting the actual opening hooks, pacing, and visual patterns inside the top-decile videos for your exact category.

- **Check a single video or batch of 3–10 posts right now:** Use the free [TikTok Engagement Rate Calculator](/tools/tiktok-engagement-rate-calculator) or [Instagram Engagement Rate Calculator](/tools/instagram-engagement-rate-calculator).
- **Browse top public clips across 20 categories:** Open [ContHunt Viral Now](/viral-now) (free, no sign-up).
- **Automate cross-platform hook & outlier research:** Connect Claude, Cursor, or Codex directly to ContHunt via our [hosted MCP server](/docs/integrations/mcp) or [compare ContHunt plans and 7-day free trial options](/pricing).
