# Task 1 Baseline Audit

Date: 2026-04-16

Completed a baseline SEO audit using `SEO/data/keywords.db` plus live Google Search Console for `sc-domain:conthunt.app`.

Key points:
- Current GSC baseline: 192 clicks, 35,989 impressions, 0.53% CTR, average position 11.5.
- Top page remains the homepage with 187 clicks and position 1.7.
- Biggest near-win opportunities are:
  - `youtube-shorts-best-practices`
  - `can-you-use-copyrighted-music-on-youtube-shorts`
  - `best-time-to-post-youtube-shorts-2026`
  - `instagram-reels-strategy-fitness`
  - `instagram-reels-best-practices-2026`
- Urgent fixes identified:
  - incorrect canonical on `instagram-reels-best-practices-2026`
  - FAQ / unparsable structured data issues on priority blog pages
  - cluster overlap across YouTube Shorts and Instagram Reels content
- Stored a durable baseline snapshot in `SEO/data/keywords.db` via `content_actions`.

Initial bucket view:
- Refresh: high-impression pages with positions in roughly 5-15
- Merge: obvious overlap pages such as `youtube-shorts-format` and `how-to-find-competitor-websites`
- Delete: none yet
- Keep: homepage, index pages, and distinct low-volume pages with clear intent
