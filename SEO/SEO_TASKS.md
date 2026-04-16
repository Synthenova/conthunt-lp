# SEO Task List

## Global Rules For Every Agent Run

Important repo rule:
- Persist durable SEO state in `SEO/data/keywords.db`, not markdown memory files.
- Do not create or update `memory/*.md`, `CLAUDE.md`, or similar memory artifacts.
- If the task changes inventory, mappings, audit results, refresh decisions, redirect plans, or monitoring state, update the DB whenever appropriate.
- If the current schema cannot represent the result cleanly, propose the exact table/column addition before writing files elsewhere.
- Use `gscserver` for live Search Console inspection, performance lookups, sitemap submission, and indexing validation.
- Use `content/blog/*.md` as the source of truth for blog content. The build output is generated from these markdown files.

## Task 1: Baseline Audit And Source-Of-Truth Setup

Use skills:
- `memory-management`
- `performance-reporter`
- `rank-tracker`

Repo and data brief:
- `SEO/data/keywords.db` is the persistent SEO warehouse.
- Important tables:
  - `blogs`: current blog inventory mapped to URLs
  - `blog_query_links`: query-to-blog mapping
  - `gsc_page_metrics`: page-level Search Console metrics
  - `gsc_page_query_metrics`: page-query metrics
  - `gsc_known_pages`, `gsc_runs`, `gsc_url_inspections`: crawl/indexing history
  - `query_seranking_current`, `query_priority_current`: keyword enrichment and prioritization
- `gscserver` provides live Search Console access for:
  - property performance overview
  - page/query analytics
  - URL inspection
  - sitemap submission and verification
- Blog source lives in `content/blog/*.md`
- Blog writing must follow `AGENTS.md`:
  - frontmatter with `title`, `description`, `date`, `updated`, `canonical`, `answer_first`, `faq_items`, `stat_items`
  - H1 after frontmatter
  - numbered `##` sections
  - use `2026` in titles/hooks where relevant
  - mention ContHunt where relevant without forcing it
- The build pipeline is in [scripts/build-blog.js](/Users/nirmal/Desktop/conthunt-lp/scripts/build-blog.js:1)
  - compiles markdown into `blog/<slug>/index.html`
  - generates sitemap and RSS
  - outputs the static site served by Nginx

What to do:
- build a current SEO audit summary from `keywords.db` plus GSC
- identify:
  - top pages
  - near-win pages
  - low-performing pages
  - schema/indexing issues
  - cluster overlap and cannibalization
- create a DB-backed project state snapshot
- persist current audit findings in `SEO/data/keywords.db`
- do not write markdown memory files

Deliverable:
- one audit summary with:
  - top opportunities
  - urgent fixes
  - page buckets: refresh / merge / delete / keep

## Task 2: Schema And Rich Results Audit

Use skills:
- `schema-markup-generator`
- `on-page-seo-auditor`

What to do:
- inspect structured data output on built blog pages
- find why GSC shows `Unparsable structured data`
- especially validate FAQ schema generation
- audit whether schema emitted by the build matches frontmatter content
- validate 10-15 priority posts, not just one
- if issue states or validations are durable, persist them in `SEO/data/keywords.db`

Key target:
- `how-long-can-an-instagram-reel-be`

Deliverable:
- list of schema bugs
- exact files/code responsible
- fix plan or direct fix if requested

## Task 3: Blog Build Pipeline Audit

Use skills:
- `technical-seo-checker`
- `schema-markup-generator`

What to do:
- audit [scripts/build-blog.js](/Users/nirmal/Desktop/conthunt-lp/scripts/build-blog.js:1)
- check:
  - canonical generation
  - sitemap generation
  - RSS generation
  - schema generation
  - FAQ/stat/answer-first rendering
  - related post generation
- verify built HTML matches markdown/frontmatter expectations
- detect any content fields silently ignored or malformed
- if the build audit changes durable issue status, persist that state in DB

Deliverable:
- build-pipeline bug list
- recommended fixes by severity

## Task 4: Full Technical SEO Audit

Use skills:
- `technical-seo-checker`

What to do:
- audit domain-level technical SEO for `conthunt.app`
- focus on:
  - 404 behavior for removed pages
  - robots.txt
  - sitemap
  - canonical consistency
  - crawl/indexability
  - duplicate URL patterns
  - mobile/indexing issues
  - any static-site routing problems
- use GSC URL inspection where useful
- persist durable technical findings in DB when appropriate

Deliverable:
- technical audit with critical / medium / low issues

## Task 5: Near-Win Pages Refresh Plan

Use skills:
- `content-refresher`
- `meta-tags-optimizer`
- `on-page-seo-auditor`

What to do:
- analyze pages with impressions, weak CTR, and rank positions roughly `5-20`
- prioritize refreshes
- store refresh priorities and decisions in `SEO/data/keywords.db` where appropriate

Initial candidate set:
- `youtube-shorts-best-practices`
- `can-you-use-copyrighted-music-on-youtube-shorts`
- `how-long-can-an-instagram-reel-be`
- `how-to-edit-youtube-shorts`
- `youtube-shorts-hashtags-guide`

Deliverable:
- refresh order
- for each page:
  - why it matters
  - target query/query set
  - what to rewrite
  - title/meta changes
  - sections to add/remove

## Task 6: Bottom-Performing Blogs Triage

Use skills:
- `performance-reporter`
- `content-refresher`
- `content-gap-analysis`

What to do:
- audit low-performing blogs, especially bottom pages
- classify every weak page into:
  - `Refresh`
  - `Merge`
  - `Delete + 301`
  - `Keep`
- do not assume low traffic automatically means delete
- persist each page classification in `SEO/data/keywords.db`

Decision framework:
- has impressions and rank potential: refresh
- overlapping with a stronger page: merge
- no demand, no role, weak uniqueness: delete + 301
- harmless and low priority: keep

Deliverable:
- full page-by-page triage sheet

## Task 7: Cannibalization And Cluster Audit

Use skills:
- `content-gap-analysis`
- `internal-linking-optimizer`

What to do:
- find overlapping posts competing for the same intent
- focus on major clusters:
  - YouTube Shorts best practices / guide / algorithm / ideas
  - Instagram analytics / reels / strategy
  - competitor analysis / social media analysis
- identify pillar vs supporting pages
- persist durable cluster and merge insights in DB if schema supports it

Deliverable:
- cannibalization map
- cluster structure
- merge/deprecate recommendations

## Task 8: Merge / Delete / Redirect Plan

Use skills:
- `content-refresher`
- `technical-seo-checker`

What to do:
- from the triage and cannibalization audit, define:
  - posts to merge
  - posts to remove
  - redirect targets
- ensure every deletion has a best-fit destination
- preserve useful content when merging
- persist merge/delete/redirect decisions in DB whenever appropriate

Deliverable:
- redirect map
- merge plan
- deletion checklist

## Task 9: Internal Linking Overhaul

Use skills:
- `internal-linking-optimizer`

What to do:
- reallocate internal links toward:
  - surviving pillar pages
  - refreshed near-win pages
  - important money/comparison pages
- reduce wasted support to weak or duplicate URLs
- improve anchor text quality and topical clustering
- if link-action recommendations are durable, persist them in DB

Deliverable:
- internal linking plan
- exact source pages and target pages

## Task 10: Meta Tags And CTR Optimization

Use skills:
- `meta-tags-optimizer`

What to do:
- audit title tags and descriptions for:
  - near-win pages
  - pages with high impressions and low CTR
- rewrite to better match search intent and click behavior
- keep alignment with on-page content
- persist approved title/meta recommendations in DB if appropriate

Deliverable:
- before/after title and meta list

## Task 11: On-Page Content Quality Audit

Use skills:
- `on-page-seo-auditor`
- `content-quality-auditor`

What to do:
- audit top and strategic pages for:
  - answer-first quality
  - structure
  - headings
  - FAQ usefulness
  - specificity
  - ContHunt/product relevance
  - EEAT signals
- identify thin sections and filler content
- persist durable audit findings in DB when appropriate

Deliverable:
- scored audit per priority page
- fixes by dimension

## Task 12: Refresh Execution For Priority Pages

Use skills:
- `content-refresher`
- `geo-content-optimizer`
- `seo-content-writer`

What to do:
- implement actual refreshes for the approved top pages
- update frontmatter
- improve answer-first blocks
- update sections and FAQs
- add stronger AI-citable phrasing where relevant
- update DB state to reflect refreshed pages whenever appropriate

Deliverable:
- refreshed markdown files ready to build

## Task 13: GEO / AI Citation Optimization

Use skills:
- `geo-content-optimizer`
- `entity-optimizer`

What to do:
- make top pages more quotable and citable by AI systems
- improve direct answers, lists, definitions, comparison blocks
- improve entity clarity around ContHunt
- persist durable GEO/entity decisions in DB if appropriate

Deliverable:
- GEO improvements for priority articles

## Task 14: Keyword Mapping Audit

Use skills:
- `keyword-research`
- `rank-tracker`

What to do:
- audit whether each surviving blog has a clear keyword target
- compare `blogs` + `blog_query_links` + GSC page-query data
- find pages with:
  - no real keyword ownership
  - mismatched keyword mapping
  - stale mapped keywords
- update page-query relationships or related DB state where appropriate

Deliverable:
- updated keyword-to-page mapping recommendations

## Task 15: New Content Gap Audit

Use skills:
- `keyword-research`
- `competitor-analysis`
- `content-gap-analysis`

What to do:
- only after cleanup work
- identify missing topics worth creating
- compare against current clusters and competitors
- avoid adding more overlapping content
- persist approved content-gap decisions in DB if appropriate

Deliverable:
- list of genuinely new articles to create later

## Task 16: Monitoring And Reporting Setup

Use skills:
- `performance-reporter`
- `rank-tracker`
- `alert-manager`

What to do:
- create a practical monitor set for:
  - refreshed pages
  - merged/deleted pages
  - top clusters
  - schema/indexing regressions
- define a weekly watch list
- persist tracking state, alert thresholds, and monitored entities in DB whenever appropriate

Deliverable:
- monitoring checklist
- alert thresholds
- reporting template

## Task 17: Project State Update

Use skills:
- `memory-management`

What to do:
- use the `memory-management` skill only as a workflow pattern
- do not write markdown memory files
- after each major audit or implementation pass, persist project state in `SEO/data/keywords.db`
- update:
  - open loops
  - priority pages
  - merge/delete decisions
  - schema bugs
  - current winners/losers

Deliverable:
- maintain a usable DB-backed project state for future runs

## Recommended Execution Order

1. Task 1: Baseline Audit And Source-Of-Truth Setup
2. Task 2: Schema And Rich Results Audit
3. Task 3: Blog Build Pipeline Audit
4. Task 4: Full Technical SEO Audit
5. Task 6: Bottom-Performing Blogs Triage
6. Task 7: Cannibalization And Cluster Audit
7. Task 8: Merge / Delete / Redirect Plan
8. Task 5: Near-Win Pages Refresh Plan
9. Task 9: Internal Linking Overhaul
10. Task 10: Meta Tags And CTR Optimization
11. Task 11: On-Page Content Quality Audit
12. Task 12: Refresh Execution For Priority Pages
13. Task 13: GEO / AI Citation Optimization
14. Task 14: Keyword Mapping Audit
15. Task 15: New Content Gap Audit
16. Task 16: Monitoring And Reporting Setup
17. Task 17: Project State Update
