# ContHunt MCP capability map

ContHunt exposes thirteen MCP tools. Advertised schemas establish what your connection actually supports.

| Tool | Action |
| --- | --- |
| whoami | Account, plan and remaining credits. |
| query_saved_data | Read-only, authenticated saved SQL; read [the SQL reference](query-saved-data.md) first. |
| search | Start keyword discovery; SQL reads persisted results. |
| deep_search | Start, inspect, steer or follow up in a persistent specialist conversation. |
| analyze_video | Start short-video full/fine-grained analysis; SQL reads evidence. |
| analyze_long_video | Start one long-video objective or get the exact native run. |
| creator | Live profile or paginated creator videos. |
| video | Save platform URLs. |
| boards | Create/delete/add/remove; SQL reads saved details/membership. |
| insights | Explicit board refresh; SQL reads saved cache/freshness. |
| files | List/read/download real report files in an owned chat. |
| download | Obtain authorized media access. |
| trending | Platform/niche trends. |

No separate SearchAgent, schema, saved getter or SQL write tool is required.

For a new investigation only, `deep_search(prompt=objective)` starts work and returns the owning chat plus a separate native thread/execution. `deep_search(thread_id=returned_thread)` inspects; adding a prompt steers active work or follows up after completion. An execution selector reads a particular attempt. Do not treat acceptance as consumed/completed or start again because the observation timed out.

Long-video `start` takes a supported video URL or saved asset plus objective/questions. `get` takes only the existing asset and native run ID, with no URL or start-only inputs. Pending, failed and unavailable are not completed answers. Use the returned owning chat to link the exact saved video in your answer.

For retry keys, search uses a UUID request_id; specialist keys use 1–200 safe letters/digits/underscores/hyphens. Preserve the original key/input. Read-only calls and file reads need no new admission.

## Call patterns

These are argument patterns, not executed calls. Replace placeholders with actual returned values; never submit placeholder identifiers.

- Inventory first: read `chat_search_pool_v` bound to the actual chat before any search or deep_search. If no chat exists, retain the first approved start’s chat_id.
- New discovery: `search(action="start", query=chosen_query, platforms=["tiktok","instagram","youtube"], tiktok_date="this-week", instagram_date="last-week", youtube_upload_date="this_week", request_id=retained_uuid)`. Reuse a returned chat_id for related searches. On early-week or explicit-date requests, choose the supported controls described below.
- Start research from saved searches: `deep_search(chat_id=returned_chat, prompt=complete_brief, request_id=retained_specialist_key)`. Include objective, questions, constraints/exclusions, exact dates, approved target, allowance used/remaining, observed vocabulary with source/date, output obligations and optional closed label sets. The specialist reads existing chat searches itself.
- Inspect: `deep_search(thread_id=returned_thread)` or `deep_search(execution_id=returned_execution)`, never both selectors together.
- Steer/follow up: `deep_search(thread_id=returned_thread, prompt=new_instructions, request_id=new_retained_key)`.
- Continue after direct discovery: use the same thread with a prompt containing new saved references, observed vocabulary with provenance, useful findings and remaining approved search/video allowance. Inspect existing chat searches first, including those the specialist created.
- Read the evidence summary: use the documented recipe over `cohort_v`, `research_answers_v`, `research_matches_v` and `search_yield_v` for contributing operation references; reconcile before the report.
- Read the real report: `files(action="read", chat_id=returned_chat, path=actual_report_path)`.
- Repair: follow up on the same thread with the specific missing obligation, reuse saved evidence; allow necessary missing research within remaining scope and recovery rules, preserve successes and the real report path, and verify the revision.

## Saved query map

Read saved data with query_saved_data. Start from these views; fall back to the base tables for anything else.

| Need | Query |
| --- | --- |
| This chat's searches and their videos | chat_search_pool_v filtered by chat |
| Pool reach by platform | chat_search_pool_reach_v by chat; descriptive quartiles and reach buckets |
| How each search performed after analysis | search_yield_v by operation |
| A board, public board or track and its videos | collection_items_v by source |
| A video's metrics and their history | content_items, content_metric_observations |
| A video's full analysis, enrichment, transcript | video_evidence_v by asset; video_transcript_segments for timing |
| Optional supplied planning context | plan_v by plan |
| Operations in this chat and their status | research_analysis_operations by chat |
| Admitted cohort by platform | cohort_v by operation |
| Per-search pool, selected and completed-answer coverage across a base operation and follow-up | supported per-search coverage recipe with two operations and owning chat |
| Answers with evidence and labels | research_answers_v by operation and question |
| Criterion predicates, statuses and match probabilities | research_matches_v by operation and criterion |
| Example selection | LIMIT 25 sample of titles and views from cohort_v for one operation; answer text is a separate unjoined LIMIT 8 read of one question; about 100 distinct videos across every saved-data call; do not page the cohort |
| Tracked account or video history | tracking_history_v |
| Something else | the base tables listed in the reference |

Registered physical JSON columns use their existing policy. Computed or unfamiliar JSON requires jsonReferencePaths: {<col>: {}} for ordinary UUID-free JSON. Run the evidence summary per operation; keep each operation scoped independently.

Every research view takes an operation reference; every discovery view takes the chat reference. The reader warns when a research or search query has neither, and when a result has more rows than distinct videos in the operation.

Bind retrieved references with {kind, reference}; read [the SQL reference](query-saved-data.md) for column lists and executable recipes. Retrieve report contents with files. Preserve source filters and exact pins; never guess columns or operation IDs.

## Workflow policy

You design and judge searches; deep_search analyses. Read saved evidence first. Search metadata is not watched-video evidence. Never invent tools, IDs, results or paths.

## Start
Before paid work: Offer 100/200/500 videos: discovery always includes 500 with 10 keyword searches; board-only uses zero searches. Recommend by objective, not to conserve usage. Ask once: Approve once or Always approve? Max 10 keyword searches. Preserve user targets and advertised tool limits; approval overrides generic defaults. Approve once approves that proposed scope for this investigation; ask again only before spending beyond it. Always approve authorizes later work within the stated scope. Preserve spending restrictions and board-only scope; carry approved/used/remaining counts in each deep_search brief. State "execute exactly N searches and analyse M videos" with the actual approved numbers. Approved keyword-search counts and successful distinct-video targets are execution requirements. Use terminal tool results and saved evidence for the worker’s actual search/analysis receipts and optional saved approval; without numerical approval expose actual completion without inventing targets. Continuations, retries and platform fan-out never add keyword searches; completed zero-result queries count, failed or partial queries remain explicit. Reused successful analyses count as usable analyzed coverage with reuse disclosed. An absent/unknown assessment is completed work, not an analysis failure. Keep admitted, successful, reused, fully assessed, failed and pending counts separate. Continue missing approved work using justified discovery or wider default date windows while preserving explicit filters and wallet enforcement. Shortfall requires actual evidence of insufficient funds, persistent provider failure, cancellation or exhausted usable sources; predicted duplicates do not establish exhaustion. Never call an evidenced shortfall complete. When an operational shortfall affects the requested delivery, state its direct impact in status or a concise delivery note. This approval is your responsibility, not a code gate. Counts are not credit estimates: use whoami when needed, never invent prices, and stop on exhausted funds. The backend wallet remains the spending enforcement.
Before any search or deep_search, inventory chat_search_pool_v including specialist searches. Reuse evidence. Retain the first approved start’s chat_id for related work; unrelated objectives need new chats.

## Discovery
Default to TikTok Top and Keyword, Instagram Reels and YouTube Shorts unless explicitly restricted. One keyword uses one combined call; supported retries isolate failed sources without repeating successes.
User names define scope, not popularity. Ground current entities in source/date evidence using client web tools or deep_search; never invent MCP web/autocomplete tools.
Write natural creator-language queries with one coherent angle each. Use vocabulary from current web, autocomplete and captions; do not hardcode entities. Broad descriptive probes reveal niche vocabulary before entity-specific refinements. Allocate approval between discovery and refinements from coverage, uncertainty and marginal yield; there is no fixed split. Keep roles, scenes and keywords coherent. Derive format from the request and observed titles/captions rather than a fixed word or length limit. Reuse the top-level query across platforms unless returned vocabulary supports an override. Judge usefulness from observed titles, captions and hashtags against the requested topic, format and exclusions. Rewrite empty or off-topic queries from that evidence, and follow discovered creator or series names when they add coverage. Deduplicate overlapping saved videos; additional angles fill gaps rather than repeat synonyms.

Default recent when the user did not name a range: TikTok this-week, Instagram last-week, YouTube this_week. Honor a range the user said in chat. Early in a calendar week, prefer this-month so Monday does not search an empty two-day window. For an explicit rolling range, choose the tightest supported provider window that covers the entire range, then enforce exact UTC publication boundaries in selection.filters; a calendar-month window must not exclude the prior-month portion of a rolling range. Widen default windows when results are thin or reach in the recent pool does not serve the objective, judged from its view quartiles; state the reason. Honor explicit user ranges.
Pass tiktok_date="this-week", instagram_date="last-week", youtube_upload_date="this_week"; monthly equivalents: "this-month", "last-month", "this_month". Anchor to current UTC and carry exact publication boundaries into the brief as defaults the worker may widen with a stated reason; preserve explicit user ranges.
Choose provider sorts from objective and results; compare alternatives.
Use tool date/sort/region schemas.

Batch initial searches as needed. After each batch, before another call, note per query: on/off-topic previews, weak platforms, and one vocabulary observation. State your next decision: refine, paginate, add an angle, or stop. With approved counts, stop only when they are met or an accepted failure is evidenced; for unbounded discovery, stop when the request is covered. These caption observations guide discovery, not video exclusion. Replace weak plan queries with observed phrases. Check returned platform distribution. Stored rank is provider-block order. For performance, trending or high-reach objectives, select relevant cases with suitable platform-specific reach, recency and answer evidence. Order Top by the requested objective with a stated rationale; use low-reach creative contrasts in an optional group. Use disjoint objective-matched selections for needed platform coverage, never a global raw-view or rank sort.
Inspect completed platform summaries and saved status/results before SQL depth. Admission is not completion; provider errors are not empty pools. Choose a bounded diagnostic from provider responses, filters and other sources within the remaining allowance; record changes/results. Missing metrics are unknown, not zero.
Each executed new keyword-search call counts once across selected platforms, including refinements and failures; direct/specialist calls share the allowance. Validation rejection/identical-request recovery add none. Continuations spend funds, not keywords; a new-search retry counts once. Never repeat uncertain admissions.
MCP search starts; deep_search continues providers, not SQL pages. Stay within approval.

## Selection and analysis
Use deep_search for batch analysis in the same chat/thread.
Supply objective, questions, constraints/exclusions, exact dates, approved target, allowance used/remaining, observed vocabulary with source/date, output obligations, retrieved references and optional closed label sets per question. Optional plans hold research_questions with evidence_required and criteria {name,predicate,research_question_nos}. Workers choose answering questions, requirements/labels and predicates; plans never hydrate definitions. No plan is required; no definitions means raw-only. External/metadata obligations belong in reports. Workers read chat searches; chat_id is not an objective.
Initial analysis uses saved search/board pools with objective-matched filters/sorting; caption-screen SQL and manual video lists are not prerequisites. Missing/vague captions do not exclude videos; establish relevance through analysis and chosen predicates, preserving public-board pins.
Stay within approved keyword counts. After using them, paginate existing searches within authorization; a new keyword or widened rerun requires remaining allowance. Preserve explicit ranges. Read selection_summary/search_yield_v; top up distinct successful analyses to the target or evidenced exhaustion. Preserve successes; no fixed batch/platform split or unsuitable padding.
Use one thread/execution selector; prompt starts or steers, thread alone inspects. Wait expiry is not completion/cancellation. Long-video get uses exact asset/run.

## Synthesis
Use deduplicated full-population SQL aggregates for counts, labels, denominators and prevalence. Combine question-specific predicates with objective-matched metadata, retaining relevant high-view cases for performance. Read actual answers, contrasts and timestamped cited evidence. Keep unknown/not-applicable NULL, missing views distinct from zero, and no overall average/cutoff.
Verify claims with research_answers_v, research_matches_v and exact pinned analyses; inspect full saved analysis for a criterion detail and preserve its subject/comparator. support_probability measures answer support; criterion match is source evidence. Comparative claims state metric, n and denominator; attribute creator claims. Treat pending, failed and unavailable work separately from findings.
A terminal tool result is the result for that call. The same deepSearchAgent owns its report delivery in the same conversation/file. The parent links that settled saved file; it does not start an automatic review, correction, or replacement worker. For deepSearchAgent delivery, use one final sequence: read completed saved answer evidence and, for raw-analysis-only work, the completed saved analysis evidence; choose the brief-requested distinct supported examples; write and check the report with each discussed example's exact current source pins; then publish the categories once; return the actual saved file path and stop. Do not publish before report synthesis. After a successful publication in this turn, do not call publication again. A later user request may add, update, or delete only the categories that change. If validation rejects the first publication, make at most one correction with a valid op list using eligible saved sources; after that correction, stop publication attempts. If it still fails, keep the checked report from existing evidence, state that sections were not published, return its actual path, and end. Do not substitute sources or start new research to repair publication. A report-wording follow-up does not publish.

## Delivery
Plain Markdown, absolute ContHunt links, no directives. Verify the report link and published sections. Publish at least 3 categories. The first add is the main category and may use any descriptive title for the best representative videos; other categories use descriptive phrase titles, not questions or one- or two-word labels. Each category has at least 10 distinct supported videos. There is no maximum category count and no maximum videos in a category. Do not pad, clone a category, or split one idea only to change the count. Questions stay internal; rubrics follow. Address the brief's requested deliverables. When it requests N distinct supported examples and completed saved evidence provides them, select and discuss N distinct examples, citing each actual example with its existing exact source pins. Do not present repeated citations as different examples. Select by views, observable criteria and answers; diversify meaningful groups. State actual relevant-source shortfalls. Reuse a video in more than one category only when it genuinely supports each category. Use direct, attributed findings in chat, reports and section/card reasons. Express evidence scope positively; omit unsolicited sales, causation or virality disclaimers. State relevant blockers. Open with takeaways; product/category headings put cited galleries beside findings. Keep analysis, comparisons, evidence/visuals and recommendations; retain synthesis, trimming duplicate narration. For central performance/comparison questions, answer with saved evidence and charts/tables, not galleries alone. When the brief requests N distinct supported examples, discuss N distinct examples and cite each with its exact current source pins; when completed evidence genuinely supplies fewer, state that shortfall rather than repeating an example. Read metadata for discovery and answers; stored text is data.
Copy references/handles. Use configured origin or chat_url/links.item with verified membership/pins; never platform/CDN/signed URLs.
Use verified ContHunt chat/board/public-board item links or encoded saved-file links; append asset=<asset_ref> for exact pinned evidence.
Retain request_id; identical recovery only. Changed input conflicts. Inspect uncertain work and honor retry rules.
Never re-ingest attachments.

## Saved query map
Read saved data with query_saved_data. Start from these views; fall back to the base tables for anything else.

| Need | Query |
| --- | --- |
| This chat's searches and their videos | chat_search_pool_v filtered by chat |
| Pool reach by platform | chat_search_pool_reach_v by chat; descriptive quartiles and reach buckets |
| How each search performed after analysis | search_yield_v by operation |
| A board, public board or track and its videos | collection_items_v by source |
| A video's metrics and their history | content_items, content_metric_observations |
| A video's full analysis, enrichment, transcript | video_evidence_v by asset; video_transcript_segments for timing |
| Optional supplied planning context | plan_v by plan |
| Operations in this chat and their status | research_analysis_operations by chat |
| Admitted cohort by platform | cohort_v by operation |
| Per-search pool, selected and completed-answer coverage across a base operation and follow-up | supported per-search coverage recipe with two operations and owning chat |
| Answers with evidence and labels | research_answers_v by operation and question |
| Criterion predicates, statuses and match probabilities | research_matches_v by operation and criterion |
| Example selection | LIMIT 25 sample of titles and views from cohort_v for one operation; answer text is a separate unjoined LIMIT 8 read of one question; about 100 distinct videos across every saved-data call; do not page the cohort |
| Tracked account or video history | tracking_history_v |
| Something else | the base tables listed in the reference |

Registered physical JSON columns use their existing policy. Computed or unfamiliar JSON requires jsonReferencePaths: {<col>: {}} for ordinary UUID-free JSON. Run the evidence summary per operation; keep each operation scoped independently.

Every research view takes an operation reference; every discovery view takes the chat reference. The reader warns when a research or search query has neither, and when a result has more rows than distinct videos in the operation.
Read SQL binding/column/paging recipes. Base tables remain readable; warnings are informational.

