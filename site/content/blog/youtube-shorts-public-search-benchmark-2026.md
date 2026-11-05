---
title: "YouTube Shorts Public Search Benchmark 2026"
slug: youtube-shorts-public-search-benchmark-2026
excerpt: "This YouTube Shorts public search benchmark is a dated sample of 74 unique Shorts from 79 observations, not a private retention or revenue study."
date: "2026-09-15"
category: Research
readingMinutes: 12
author: "ContHunt Team"
featured: false
section: blog
cover:
  mood: sand
  plate_prompt: "Text-free, softly blurred, light and airy photographic background plate of cream dunes under a bright washed sky, soft grain and wide empty sand, with no people, no text, no logos, and no UI."
  fragment: mcp-terminal
  fragment_data:
    lines:
      - "$ fetch three YouTube search URLs with the Shorts filter"
      - "> parse ytInitialData for shortsLockupViewModel only"
      - "> raw observations 79, unique video IDs 74"
      - "> kept title, public view text, thumbnail size, URL"
      - "> left out retention, revenue, audience, paid data"
---

The YouTube Shorts public search benchmark for 2026 is a dated public search sample, not a private performance benchmark. On 15 September 2026 at 06:16 UTC, ContHunt collected 79 raw observations from three YouTube search pages with the Shorts filter selected and deduplicated them to 74 unique Shorts. Five video IDs appeared more than once. The sample keeps source URLs, visible titles, public view text, and thumbnail dimensions. Fifty-one of the 79 raw rows included 1080x1920 thumbnail metadata. A public search page cannot show another channel's retention, chose-to-view rate, revenue, RPM, audience mix, or conversion data.

## What is in the YouTube Shorts public search sample?

The YouTube Shorts public search sample is one collection pass, frozen to a timestamp, a filter, and three queries. It is intentionally narrow so a reader can inspect it, challenge it, or repeat it. It is not a leaderboard and not a formula for views.

| Field | Value |
| --- | --- |
| Collection date | 15 September 2026 at 06:16 UTC |
| Source | Public YouTube search result pages |
| Filter | YouTube search type filter: Shorts |
| Queries | `youtube shorts content ideas`, `youtube shorts editing tips`, `youtube shorts analytics` |
| Raw observations | 79 |
| Unique Shorts | 74 |
| Duplicate video IDs | 5 |
| Rows with public view text | 79 |
| Rows with 1080x1920 thumbnail metadata | 51 |

The appendices are the [CSV observations](/public/research/youtube-shorts-public-search-benchmark-2026/observations.csv) and the [summary JSON](/public/research/youtube-shorts-public-search-benchmark-2026/summary.json). The CSV keeps all 79 observations because a Short that appears under two queries is part of the public search result, not a mistake to hide. The unique count of 74 is the deduplicated summary. Both numbers are reported on purpose. Using only the unique count would hide repeated visibility. Using only the raw count would double-count a video in a "how many Shorts" sentence.

These three queries are creator-education searches. They are not a sample of gaming, beauty, cooking, or comedy Shorts. A title pattern that shows up here describes this slice. It does not describe Shorts as a whole.

## How was the sample collected?

The sample was collected by fetching three public YouTube search URLs from the ContHunt SEO VPS with a desktop browser user agent. The `sp` value came from YouTube's own public search filter labeled "Shorts" on the fetched result page. The parse used the embedded `ytInitialData` response and kept only `shortsLockupViewModel` entries. Other modules on the page were not turned into rows.

The three source URLs were:

```
https://www.youtube.com/results?search_query=youtube+shorts+content+ideas&sp=EgIQCQ%253D%253D
https://www.youtube.com/results?search_query=youtube+shorts+editing+tips&sp=EgIQCQ%253D%253D
https://www.youtube.com/results?search_query=youtube+shorts+analytics&sp=EgIQCQ%253D%253D
```

Rank in this sample means rank inside the fetched response for that query. It is not a global Shorts rank, not a quality score, and not a statement that the first row is a better video than the fifth. YouTube search results are personalized, localized, and time-sensitive. A later fetch, a different country, or a signed-in session can return different rows. That is why the timestamp, the user agent class, and the exact URLs are part of the method rather than a footnote.

No private channel was logged into. Nothing in the sample comes from YouTube Studio. If a field was not on the public search payload, it is not in the CSV.

## Which fields does each row preserve?

Each raw row preserves only fields a public search response can show. The list is the collection timestamp, the source query, the source search URL, the rank within the fetched response, the YouTube video ID, the Shorts URL, the visible title text, the public view text exactly as YouTube served it, the thumbnail width and height when present, and the YouTube page type. Raw rows and deduplicated summary counts are stored separately so a later reader can audit either view.

The public view text stays a string. This benchmark does not normalize localized view text into integers. The goal was reproducibility from public fields, not a scraped performance leaderboard. A comma in one locale is not a thousands separator in another. Translating a localized phrase into an integer would be a new dataset with new error, and this page refuses that step. When a table below shows view text, it is the served string, with some symbols trimmed for readability. The CSV is the exact text. Do not cite a converted view total from this article, because this article does not publish one.

Thumbnail width and height are recorded when the payload includes them. Fifty-one raw rows include 1080x1920 thumbnail metadata. The other rows are not assigned a guessed size. Absence of that metadata is an absence, not a claim that the thumbnail was a different aspect ratio on screen.

## What can the title counts support?

The title counts support descriptive claims about this sample only. In the 74 unique Shorts, simple title-string checks found the counts below. They do not support a distribution formula, and they do not prove why any Short received views.

| Title signal | Count in the 74 unique Shorts |
| --- | --- |
| How or tutorial wording | 19 |
| Number or list wording | 23 |
| AI mentioned | 2 |
| Money, growth, viral, subscriber, or view-claim wording | 21 |
| Editing or tooling wording | 19 |

A title can match more than one check. A title that says "3 editing tips" can fall in both the number-or-list row and the editing-or-tooling row. Because of that overlap, the five counts are not slices that add up to 74, and this page does not publish a percentage share. Turning 19 into a percentage of 74 would look more precise than the check is. The check is a string test on visible titles in one localized, dated response.

The queries themselves pull this result toward tutorials and tools. Two of the three queries contain "editing tips" and "analytics," and one contains "content ideas." A high count of how-to wording is partly what you would expect from those searches. It is not evidence that how-to titles beat other titles on YouTube. AI is mentioned in 2 of the 74 titles. That is a count of the string in this sample. It is not a trend line, and it is not a claim that AI topics are rare on Shorts outside these queries.

Use the counts to form a question you can test on your own channel. For example: among the public titles in this creator-education slice, list-shaped titles and view-claim titles are both common enough to study. Whether either shape holds viewers is a Studio question. Public creative research and private channel analytics answer different questions. The private side of that split is what [YouTube Shorts analytics](/blog/youtube-shorts-analytics) is for. The habit of turning a public pattern into a hypothesis, rather than a rule, is the same habit as [how to identify market trends](/blog/how-to-identify-market-trends).

## What do the sample rows actually show?

The sample rows show a query, a rank inside that query's fetched response, a visible title, the localized public view text, and a link back to the Short. They do not show a winner. Read them as examples of what the method captured, including titles that stuff hashtags into the title line and titles that make a views claim. Those are observations about packaging in the response, not recommendations to copy.

| Query | Rank | Visible title | Public view text | Source |
| --- | --- | --- | --- | --- |
| content ideas | 1 | Try this Creative videography #shorts #videography #ideas | 201 миллион просмотров | [Short](https://www.youtube.com/shorts/t4VQzJtIvAM) |
| content ideas | 5 | How to Get More YouTube Shorts Views in 2026 | 3,7 миллиона просмотров | [Short](https://www.youtube.com/shorts/p2O2HP0vKV0) |
| editing tips | 1 | How to Edit Short Form Content Video in Premiere Pro | 2,5 миллиона просмотров | [Short](https://www.youtube.com/shorts/LyAoEo4NnDc) |
| editing tips | 3 | 3 CapCut Video Editing Tips for Viral Shorts & Reels | 3,1 миллиона просмотров | [Short](https://www.youtube.com/shorts/ZD7OYFFamKo) |
| analytics | 1 | YouTube Shorts Tips / Viral Video Analytics | 16 тысяч просмотров | [Short](https://www.youtube.com/shorts/HZX5gX5Wv3M) |
| analytics | 4 | Analytics of a viral video #shorts | 3,1 тысячи просмотров | [Short](https://www.youtube.com/shorts/rtsDAFEyRLA) |

The view-text column is localized. This page does not convert those strings into integers. A reader who wants a numeric leaderboard will not find one here, on purpose. Rank 1 under "content ideas" and rank 1 under "analytics" are not comparable positions. Each rank is local to the response that was fetched for that query at 06:16 UTC.

What you can say about a row is modest and checkable. You can say the visible title contains a hashtag, or the words "how to," or a numeral, because those characters are in the title string. You can say the public view text was served as the string in the table. You cannot say the Short retained viewers, earned a chose-to-view rate, or ranked because of the title. Opening the Short is the next research step: look at the hook, the pacing, the captions, and the visual structure yourself. The row is a pointer. It is not the review.

## What does this benchmark exclude?

This benchmark excludes every private or derived performance field. The exclusion list is part of the result. Without it, a public sample gets misquoted as a study of what "works."

- YouTube Studio retention, shown-in-feed, chose-to-view, and audience metrics are not included.
- Private channel analytics are not included.
- RPM, revenue, and monetization rates are not included.
- Paid promotion data is not included.
- Customer data is not included.
- Backlink, ranking, and authority claims are not included.
- Normalized numeric view counts are not included.

If a later citation adds any of those, it is no longer citing this benchmark. It is adding a claim the CSV cannot support. The same boundary applies to averages. This page does not publish an average view count, a median title length, or a "typical" thumbnail, because those would require transformations the method refused.

Duplicate handling is also an exclusion of a sort. The five duplicate video IDs are not deleted from the CSV. They are removed only when the sentence is about unique Shorts, as in the title-signal table. Say which count you mean. "79 observations" and "74 Shorts" are both true and they are not interchangeable.

## How do you reproduce the collection?

You reproduce the collection by repeating the same steps on a declared date and writing down what changed. Expect different rows. A reproduction that hides personalization is not a reproduction.

1. Open the three source URLs on the same date or on a new date you declare.
2. Keep the Shorts type filter selected.
3. Save the raw public HTML response.
4. Parse only `shortsLockupViewModel` entries from `ytInitialData`.
5. Keep the source query, rank, video ID, Shorts URL, title, public view text, thumbnail dimensions, and page type.
6. Disclose the locale, the date, and any blocked or missing fields.

Do not fill a missing thumbnail size from a later watch-page fetch and still call it the same sample. Do not translate view text and still call the column "as served." If you add a field, label the new file as a different dataset. The useful property of this one is that another person can disagree with it from the URLs, not from a paraphrased chart.

A later collection is a new sample even when the queries match. Say the new timestamp in the first paragraph. Do not attach the new rows to the 15 September 2026 counts. Those counts are closed.

## How should ContHunt use a sample like this?

ContHunt should use a sample like this to build research questions, not universal rules. The questions that fit the fields are concrete. Which visible titles rely on a tutorial promise? Which titles use a number or a list? Which titles make a money, growth, viral, subscriber, or view claim? Which examples are worth opening for a look at hook, pacing, caption, and visual structure? After that, test one variable on your own channel and measure it in YouTube Studio.

Deep Search is a different instrument from this fixed three-URL fetch. ContHunt searches TikTok, Instagram Reels, and YouTube Shorts. Deep Search watches 500 to 1,000 videos in under five minutes and returns a ranked answer with the videos as evidence. That is how you ask a question across a larger public set and keep the videos attached. It does not turn this 74-Short sample into a retention study, and it does not fill in the excluded Studio fields. The method page for that pipeline is [how Deep Search works](/resources/how-deep-search-works). An agent can call the same search through the MCP server at `https://mcp.conthunt.app`. That connection does not reproduce this benchmark by itself. This benchmark is three declared search URLs, a Shorts filter, and a field list. An agent prompt that skips the URLs and the exclusions is a different project.

Tracking, which is experimental, is also a different project. A daily curve of your own video is private analytics over time. This page is one public search response at 06:16 UTC. Do not plot them on the same axis and call the picture a benchmark.

The sample is linkable because it is small, dated, source-labeled, and honest about what it cannot know. The takeaway is the method. Collect public Shorts with source URLs, write down only observable fields, and keep unsupported analytics claims out of the conclusion. A title pattern in the table is a description of 74 Shorts on one morning. It is not a publishing rule.

Repeat the method on a question you can actually check, or open a larger public set without pretending it is Studio data. [Get started]({{GET_STARTED_URL}}) with a Deep Search when you want a ranked answer and the videos kept as evidence, and leave retention in YouTube Studio where the numbers exist.
