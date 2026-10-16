# Resources blog content

Nine launch articles for the `/resources` index, `/resources/[slug]` pages and the home blog gallery.
One Markdown file per post, named `<slug>.md`. This README is not a post, so a loader must skip it.

## Posts

| Date | Slug | Category | Featured (order) | Cover mood | Cover fragment |
| --- | --- | --- | --- | --- | --- |
| 2026-08-18 | `research-tiktok-hooks-before-you-brief-a-creator` | Playbooks | yes (3) | sky | search-bar |
| 2026-08-25 | `the-3-second-rule-a-hook-taxonomy` | Research | yes (2) | dawn | hook-timeline |
| 2026-09-01 | `ugc-ad-formats-that-sell-a-field-guide` | Guides | yes (4) | clay | board-grid |
| 2026-09-08 | `finding-winning-products-from-short-form-signals` | Playbooks | yes (5) | sand | score-card |
| 2026-09-15 | `how-deep-search-works` | Product | yes (1) | sea | agent-trace |
| 2026-09-22 | `reading-virality-beyond-views` | Research | no | mist | trend-chart |
| 2026-09-29 | `build-a-weekly-trend-radar-for-your-niche` | Playbooks | no | sage | niche-chips |
| 2026-10-06 | `competitor-content-tracking-what-to-measure-daily` | Guides | no | dusk | tracking-chart |
| 2026-10-13 | `using-conthunt-with-ai-agents-through-mcp` | Product | no | ink | mcp-terminal |

Home gallery: sort the five `featured: true` posts by `featuredOrder` (1 to 5), then add the sixth
"all articles" card. Resources index: sort by `date`, newest first. Each of the nine moods and nine
fragments is used exactly once, so the covers stay distinct side by side.

Categories in use: Playbooks (3), Research (2), Guides (2), Product (2).

## Frontmatter schema

```yaml
---
title: string                 # sentence case, no trailing period
slug: string                  # must equal the file name without .md
excerpt: string               # at most 160 characters, plain text, no Markdown
date: 2026-08-18              # ISO date, between 2026-08-18 and 2026-10-13 (YAML parsers may return a Date)
category: Playbooks           # Playbooks | Research | Guides | Product
readingMinutes: 6             # integer, about words / 200
author: "ContHunt Team"
featured: true                # true for the 5 home-gallery posts, false otherwise
featuredOrder: 1              # 1 to 5, present only when featured is true
cover:
  mood: sea                   # sky | sand | sage | dusk | mist | sea | clay | ink | dawn
  plate_prompt: string        # image-model prompt for a text-free, softly blurred, light photographic plate
  fragment: agent-trace       # search-bar | score-card | hook-timeline | trend-chart | board-grid
                              # agent-trace | tracking-chart | mcp-terminal | niche-chips
  fragment_data: { ... }      # shape depends on fragment, see below
---
```

The body is Markdown (no `# h1`, since the page renders `title`). It uses `##` and `###`, lists,
tables, fenced code blocks and ends with a call-to-action paragraph containing the literal
placeholder `{{GET_STARTED_URL}}`. Replace it at render time with the value from `src/lib/links.ts`
(the deep-search entry of the app). Internal links use `/resources/<slug>` and `/viral-now`.

### `cover.plate_prompt`

Every prompt asks for a text-free, softly blurred, light and airy background plate in the style of
reference CH4uy/qmz76 (blurred landscape or sky, motion blur, gentle natural light, film grain, no
people, no text, no logos, no UI). The mood sets the dominant color:
sky = pale blue coast, dawn = peach and pearl, clay = terracotta and sand, sand = cream dunes,
sea = aqua and seafoam, mist = gray-blue haze, sage = sage meadow, dusk = lavender and dove gray,
ink = graphite overcast kept bright and low contrast.

### `cover.fragment_data` shapes

All values are illustrative mock data for the UI fragment that overlays the plate. They are
consistent with the article, and they are not measured results. Keep a small "example" treatment
in the UI if a cover could be mistaken for a real report.

| Fragment | Keys |
| --- | --- |
| `search-bar` | `query`, `platforms[]`, `scope`, `status` |
| `score-card` | `title`, `score`, `out_of`, `verdict`, `metrics[] { label, value }` |
| `hook-timeline` | `window`, `hook_family`, `segments[] { t, label }`, `score` |
| `trend-chart` | `title`, `series[] { label, points[] }`, `badge` |
| `board-grid` | `board`, `items[] { label, score }` |
| `agent-trace` | `steps[] { label, status: done or running }` |
| `tracking-chart` | `account`, `metric`, `points[]`, `labels[]`, `delta`, `badge` |
| `mcp-terminal` | `lines[]` (strings, rendered top to bottom) |
| `niche-chips` | `chips[] { label, state }`, `active`, `window` |

## Editorial rules used

- Product facts follow the legacy `index.html` and the app docs: TikTok, Instagram Reels and YouTube
  Shorts; Deep Search analyzes 500 to 1,000 videos in under five minutesutes; tracking is experimental; MCP
  server `https://mcp.conthunt.app`. No prices, credit counts or plan names appear in any post.
- Worked examples are labeled illustrative and their arithmetic is checked. No post claims a
  measured benchmark of its own.
- ContHunt scores are described as analysis of the content and its fit to the question, not as
  measured viewer retention.
- Outside facts link to public sources, listed here with what each one supports:
  - TikTok creative best practices for performance ads (content proposition in the first 3 seconds, hook in the first 6, DIY creator style): <https://ads.tiktok.com/resources/help/article/creative-best-practices>
  - TikTok Spark Ads (other creators' posts only with authorization): <https://ads.tiktok.com/resources/help/article/spark-ads>
  - TikTok recommendation explainer (signal groups, strong versus weak indicators, follower count not a direct factor): <https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you/>
  - YouTube Help on Shorts views (counting change from 31 March 2025, "engaged views"): <https://support.google.com/youtube/answer/10059070>
  - Instagram Ranking Explained, 31 May 2023 (Reels ranking predicts watch-through, like, reshare): <https://about.instagram.com/blog/announcements/instagram-ranking-explained>
  - FTC disclosures guide for social media influencers (disclose in the video itself): <https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers>
  - FTC final rule on fake reviews and testimonials, 14 August 2024: <https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials>
  - ContHunt MCP setup: <https://conthunt.app/docs/integrations/mcp>
- Files use LF line endings and UTF-8.
