---
title: "YouTube Shorts Public Search Benchmark 2026"
description: "A reproducible public sample of 74 YouTube Shorts search observations, with source URLs, fields, exclusions, and caveats."
date: "2026-09-15"
updated: "2026-09-15"
category: "YouTube"
author: "ContHunt Editorial Team"
image: "/public/banner.png"
canonical: "https://conthunt.app/blog/youtube-shorts-public-search-benchmark-2026"
meta_keywords: ["youtube shorts benchmark 2026", "youtube shorts research", "public shorts sample", "shorts search benchmark", "short form video research"]
author_profile:
  name: "ContHunt Editorial Team"
  url: "https://conthunt.app/blog"
  image: "/public/avatar-team.png"
  job_title: "Content Intelligence Research"
  description: "The ContHunt team documents public short-form video samples separately from private channel analytics."
answer_first:
  text: "**This is a public search sample, not a private performance benchmark.** On September 15, 2026, ContHunt collected 79 raw observations from three YouTube search pages with the Shorts filter selected, deduplicated them to 74 unique Shorts, and preserved the source URLs, visible titles, public view text, thumbnail dimensions, and exclusions."
faq_items:
  - question: "Is this a YouTube Shorts performance benchmark?"
    answer: "No. It is a dated public search sample. It does not include retention, chose-to-view, revenue, RPM, audience, conversion, or private YouTube Studio data."
  - question: "Can I reproduce the sample?"
    answer: "Yes. The article lists the exact source queries, search URLs, fields, collection date, exclusions, CSV, and summary JSON."
  - question: "What claims does this dataset support?"
    answer: "It supports only descriptive claims about the collected public search sample: row counts, deduplicated Shorts count, source URLs, visible fields, and simple title-pattern counts."
stat_items:
  - label: "Raw Observations"
    value: "79"
    context: "Rows extracted from public YouTube search pages with the Shorts filter selected."
  - label: "Unique Shorts"
    value: "74"
    context: "Deduplicated by video ID across the three collected queries."
  - label: "Collection Date"
    value: "2026-09-15"
    context: "Fetched from the ContHunt SEO VPS at 06:16 UTC."
---

# YouTube Shorts Public Search Benchmark 2026

Most Shorts “benchmarks” become misleading when they skip the data boundary. A public search page can show a Short, title, public view text, thumbnail, and source URL. It cannot show another channel's retention graph, chose-to-view rate, revenue, RPM, audience mix, or conversion data.

This asset is intentionally narrow. It documents a reproducible public sample that creators and researchers can inspect, challenge, or repeat.

## Dataset snapshot

| Field | Value |
| :--- | :--- |
| Collection date | September 15, 2026 at 06:16 UTC |
| Source | Public YouTube search result pages |
| Filter | YouTube search type filter: Shorts |
| Queries | `youtube shorts content ideas`, `youtube shorts editing tips`, `youtube shorts analytics` |
| Raw observations | 79 |
| Unique Shorts | 74 |
| Duplicate video IDs | 5 |
| Rows with public view text | 79 |
| Rows with 1080x1920 thumbnail metadata | 51 |

Download the public appendices:

- [CSV observations](/public/research/youtube-shorts-public-search-benchmark-2026/observations.csv)
- [Summary JSON](/public/research/youtube-shorts-public-search-benchmark-2026/summary.json)

## Sampling method

We fetched these three public YouTube search URLs from the ContHunt SEO VPS using a desktop browser user agent:

1. `https://www.youtube.com/results?search_query=youtube+shorts+content+ideas&sp=EgIQCQ%253D%253D`
2. `https://www.youtube.com/results?search_query=youtube+shorts+editing+tips&sp=EgIQCQ%253D%253D`
3. `https://www.youtube.com/results?search_query=youtube+shorts+analytics&sp=EgIQCQ%253D%253D`

The `sp` value came from YouTube's own public search filter labeled “Shorts” in the fetched result page. We parsed the embedded `ytInitialData` response and extracted only `shortsLockupViewModel` entries.

## Observed fields

Each raw row preserves:

- collection timestamp;
- source query;
- source search URL;
- rank within the fetched response;
- YouTube video ID;
- Shorts URL;
- visible title text;
- public view text exactly as YouTube served it;
- thumbnail width and height when present;
- YouTube page type.

We kept raw rows and deduplicated summary counts separately. The CSV keeps all 79 observations because duplicates across queries are part of the public search result experience.

## What this sample can say

In the 74 unique Shorts, simple title-string checks found:

| Title signal | Count |
| :--- | ---: |
| How/tutorial wording | 19 |
| Number or list wording | 23 |
| AI mentioned | 2 |
| Money, growth, viral, subscriber, or view claim wording | 21 |
| Editing or tooling wording | 19 |

These counts describe this sample only. They are not a formula for distribution and they do not prove why any Short received views.

## Sample rows

| Query | Rank | Visible title | Public view text | Source |
| :--- | ---: | :--- | :--- | :--- |
| content ideas | 1 | Try this Creative videography #shorts #videography #ideas | 201 миллион просмотров | [Short](https://www.youtube.com/shorts/t4VQzJtIvAM) |
| content ideas | 5 | How to Get More YouTube Shorts Views in 2026 | 3,7 миллиона просмотров | [Short](https://www.youtube.com/shorts/p2O2HP0vKV0) |
| editing tips | 1 | How to Edit Short Form Content Video in Premiere Pro | 2,5 миллиона просмотров | [Short](https://www.youtube.com/shorts/LyAoEo4NnDc) |
| editing tips | 3 | 3 CapCut Video Editing Tips for Viral Shorts & Reels | 3,1 миллиона просмотров | [Short](https://www.youtube.com/shorts/ZD7OYFFamKo) |
| analytics | 1 | YouTube Shorts Tips / Viral Video Analytics | 16 тысяч просмотров | [Short](https://www.youtube.com/shorts/HZX5gX5Wv3M) |
| analytics | 4 | Analytics of a viral video #shorts | 3,1 тысячи просмотров | [Short](https://www.youtube.com/shorts/rtsDAFEyRLA) |

The CSV preserves the exact localized public view text returned to the server. The table above trims some symbols for readability and links back to the original Shorts.

## Exclusions

This sample does not include:

- YouTube Studio retention, shown-in-feed, chose-to-view, or audience metrics;
- private channel analytics;
- RPM, revenue, or monetization rates;
- paid promotion data;
- customer data;
- backlink, ranking, or authority claims;
- normalized numeric view counts.

We did not normalize localized view text into integers because the goal was reproducibility from public fields, not a scraped performance leaderboard.

## How to reproduce it

1. Open the three source URLs on the same date or a new declared date.
2. Keep the Shorts type filter selected.
3. Save the raw public HTML response.
4. Parse only `shortsLockupViewModel` entries from `ytInitialData`.
5. Keep the source query, rank, video ID, Shorts URL, title, public view text, thumbnail dimensions, and page type.
6. Disclose locale, date, and any blocked or missing fields.

If you repeat the collection later, expect the rows to change. YouTube search results are personalized, localized, and time-sensitive.

## How ContHunt uses this kind of sample

Use a sample like this to build research questions, not universal rules. For example:

- Which visible titles rely on tutorial promises?
- Which titles use a number or list?
- Which titles make a money, growth, viral, subscriber, or view claim?
- Which examples are worth opening for hook, pacing, caption, and visual structure review?

Then test one variable on your own channel and measure it in YouTube Studio. Public creative research and private channel analytics answer different questions.

## Bottom line

This benchmark is linkable because it is small, dated, source-labeled, and honest about what it cannot know. The useful takeaway is not that a title pattern guarantees views. The useful takeaway is the method: collect public Shorts with source URLs, write down only observable fields, and keep unsupported analytics claims out of the conclusion.
