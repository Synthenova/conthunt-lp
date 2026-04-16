# Task 20 CORE-EEAT Content Audit

Date: 2026-04-16

Used skill: `content-quality-auditor`

## Audit Scope

Primary page audited in full:

- `https://conthunt.app/blog/youtube-shorts-best-practices`

Why this page:

- highest current content opportunity in GSC among blog posts
- `6,164 impressions`, `1 click`, `0.02% CTR`, `8.7 average position` in the last 28 days
- clearly aligned to a topic cluster ContHunt already targets heavily in `SEO/data/keywords.db`

Supporting cluster checks used for context:

- `https://conthunt.app/blog/best-time-to-post-youtube-shorts-2026`
- `https://conthunt.app/blog/can-you-use-copyrighted-music-on-youtube-shorts`

## CORE-EEAT Audit Report

### Overview

- **Verdict**: **BLOCK**
- **Content**: `YouTube Shorts Best Practices 2026: Hooks, Posting, Retention`
- **Content Type**: `Blog Post`
- **Audit Date**: `2026-04-16`
- **Weighted Total**: **46.8/100 (Low)**
- **GEO Score**: `48.8/100`
- **SEO Score**: `36.3/100`
- **Veto Status**: `R10 triggered`

#### Veto Check

| Veto Item | Status | Action |
|-----------|--------|--------|
| C01: Intent Alignment | ✅ Pass | Topic matches the title and main body |
| T04: Disclosure Statements | ✅ Pass | No affiliate/review monetization pattern observed on the page |
| R10: Content Consistency | ⚠️ VETO | Visible byline, analytics author name, and schema author entity are inconsistent; fix author identity and supporting evidence before pushing this as an authority asset |

### Cluster Context

- `youtube-shorts-best-practices` is already getting impressions for queries around `hooks`, `thumbnails`, `titles`, and `growth`.
- `best-time-to-post-youtube-shorts-2026` ranks in strong positions for several timing queries, but GSC still shows `User Canonical: https://conthunt.app/`, which undercuts trust.
- `can-you-use-copyrighted-music-on-youtube-shorts` matches policy-intent queries well, but it also carries rich-result parsing issues and unsupported numerical claims.

### Dimension Scores

Blog Post weights from the CORE-EEAT benchmark:

`C 25% | O 10% | R 10% | E 20% | Exp 10% | Ept 10% | A 5% | T 10%`

| Dimension | Score | Rating | Weight | Weighted |
|-----------|-------|--------|--------|----------|
| C — Contextual Clarity | 70/100 | Medium | 25% | 17.5 |
| O — Organization | 65/100 | Medium | 10% | 6.5 |
| R — Referenceability | 25/100 | Poor | 10% | 2.5 |
| E — Exclusivity | 35/100 | Poor | 20% | 7.0 |
| Exp — Experience | 15/100 | Poor | 10% | 1.5 |
| Ept — Expertise | 35/100 | Poor | 10% | 3.5 |
| A — Authority | 25/100 | Poor | 5% | 1.25 |
| T — Trust | 70/100 | Medium | 10% | 7.0 |
| **Weighted Total** | | | | **46.75/100** |

### Evidence Used

- Live page HTML from `curl https://conthunt.app/blog/youtube-shorts-best-practices`
- Local source markdown from `content/blog/youtube-shorts-best-practices.md`
- GSC page metrics and page-query reports for the last 28 days
- Existing audit notes in `task-2-schema-rich-results-audit.md` and `task-11-on-page-content-quality-audit.md`
- Domain context from `task-19-domain-authority-audit.md`

### C — Contextual Clarity

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| C01 | Intent Alignment | Pass | The page does deliver on hooks, posting cadence, thumbnails, titles, and retention |
| C02 | Direct Answer | Pass | Answer-first block and quick-take section put the core answer near the top |
| C03 | Query Coverage | Pass | Covers multiple query variants: hooks, retention, titles, thumbnails, posting time, and frequency |
| C04 | Definition First | Partial | Some proprietary phrases are introduced without clean definitions (`Node Alignment`, `Creator Fatigue`) |
| C05 | Topic Scope | Partial | The page implies broad coverage but never clearly states what it does not cover |
| C06 | Audience Targeting | Partial | It is clearly for creators, but the page never explicitly states the intended reader type |
| C07 | Semantic Coherence | Pass | Flow is logical from hook to timing to evergreen strategy |
| C08 | Use Case Mapping | Partial | Advice is broad and not segmented by creator size, niche, or goal |
| C09 | FAQ Coverage | Pass | Visible FAQ section exists and covers relevant follow-up questions |
| C10 | Semantic Closure | Partial | Conclusion is brand-forward but does not resolve the strongest search questions with evidence |

**C Score**: `70/100`

### O — Organization

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| O01 | Heading Hierarchy | Pass | H1/H2/H3 structure is clean |
| O02 | Summary Box | Pass | Answer-first + quick-take satisfy the summary requirement |
| O03 | Data Tables | Fail | No table for the title/hook/thumbnail/frequency comparisons |
| O04 | List Formatting | Pass | Lists and checklist sections are readable |
| O05 | Schema Markup | Partial | Article and FAQ schema exist, but GSC flags FAQ/unparsable structured data errors |
| O06 | Section Chunking | Pass | The content is split into scannable chunks |
| O07 | Visual Hierarchy | Pass | Key concepts are emphasized and the page is easy to scan |
| O08 | Anchor Navigation | Pass | Live page includes a table of contents with jump links |
| O09 | Information Density | Partial | The page is readable, but some sections trade precision for hype language |
| O10 | Multimedia Structure | Fail | Only a generic banner is present; no informative charts, annotated examples, or captions |

**O Score**: `65/100`

### R — Referenceability

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| R01 | Data Precision | Pass | The page uses concrete numbers and time ranges |
| R02 | Citation Density | Fail | No external citations are present |
| R03 | Source Hierarchy | Fail | No primary or authoritative sources are named |
| R04 | Evidence-Claim Mapping | Fail | Strong claims about the `2026 algorithm` and performance lifts are unsupported |
| R05 | Methodology Transparency | Fail | No explanation for how the page’s numbers or playbook were derived |
| R06 | Timestamp & Versioning | Pass | Fresh publication/update date is present |
| R07 | Entity Precision | Partial | YouTube and ContHunt are explicit, but several invented concepts are treated like established terms |
| R08 | Internal Link Graph | Fail | No supporting internal links are embedded in the body |
| R09 | HTML Semantics | Partial | Article/time markup is present, but rich-result health is not clean |
| R10 | Content Consistency | Fail | Visible byline (`Zach Sanders`), analytics author name, and schema author (`ContHunt Editorial Team`) do not match |

**R Score**: `25/100`

### E — Exclusivity

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| E01 | Original Data | Fail | No first-party dataset is shown despite metric-like claims |
| E02 | Novel Framework | Partial | Terms like `Retention-Loop` and `Node Alignment` create framing, but they are not substantiated |
| E03 | Primary Research | Fail | No experiment, survey, or documented test process is included |
| E04 | Contrarian View | Partial | The `quality over daily posting` argument is useful but not evidenced |
| E05 | Proprietary Visuals | Fail | No original visuals or charts |
| E06 | Gap Filling | Partial | The page bundles several Shorts factors together, which is better than a thin single-angle post |
| E07 | Practical Tools | Pass | Checklist format is genuinely useful |
| E08 | Depth Advantage | Partial | Covers more angles than many basic blog posts, but lacks proof depth |
| E09 | Synthesis Value | Partial | Connects creative execution, metadata, and scheduling in one piece |
| E10 | Forward Insights | Fail | Predictions are asserted as facts without data support |

**E Score**: `35/100`

### Exp — Experience

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| Exp01 | First-Person Narrative | Fail | No `we tested` or `I observed` framing |
| Exp02 | Sensory Details | Fail | The piece is abstract, not experience-led |
| Exp03 | Process Documentation | Partial | Some workflows are broken into steps, but not from direct testing |
| Exp04 | Tangible Proof | Fail | No screenshots, test logs, or retained examples |
| Exp05 | Usage Duration | Fail | No time horizon for direct use is stated |
| Exp06 | Problems Encountered | Fail | Does not discuss real failure cases from running Shorts |
| Exp07 | Before/After Comparison | Fail | No measured change examples |
| Exp08 | Quantified Metrics | Partial | Metrics are stated, but not tied to first-hand experience |
| Exp09 | Repeated Testing | Fail | No repeat-test evidence |
| Exp10 | Limitations Acknowledged | Fail | The page does not say where the advice might not apply |

**Exp Score**: `15/100`

### Ept — Expertise

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| Ept01 | Author Identity | Partial | The page has a visible byline, but it conflicts with structured author identity |
| Ept02 | Credentials Display | Fail | No verifiable credentials or experience proof are linked |
| Ept03 | Professional Vocabulary | Partial | Uses platform vocabulary, but mixes it with unsupported coined terms |
| Ept04 | Technical Depth | Partial | Includes specific tactical advice, but thresholds are not backed with evidence |
| Ept05 | Methodology Rigor | Fail | No reproducible test method |
| Ept06 | Edge Case Awareness | Partial | A few caveats exist, but the page does not map exceptions cleanly |
| Ept07 | Historical Context | Partial | Mentions the evolution of Shorts strategy, but superficially |
| Ept08 | Reasoning Transparency | Partial | Some `why this works` logic appears, but tradeoffs are not rigorously defended |
| Ept09 | Cross-domain Integration | Partial | Connects creative, metadata, and scheduling ideas |
| Ept10 | Editorial Process | Fail | No reviewer/fact-check/process label |

**Ept Score**: `35/100`

### A — Authority

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| A01 | Backlink Profile | Fail | Domain authority is currently weak |
| A02 | Media Mentions | Fail | No media coverage surfaced in this pass |
| A03 | Industry Awards | Fail | No awards or recognitions shown |
| A04 | Publishing Record | Partial | The site has a substantial content corpus, but no broader publishing record is demonstrated |
| A05 | Brand Recognition | Pass | Brand demand exists in GSC even if small |
| A06 | Social Proof | Fail | No real testimonials or user proof on the article |
| A07 | Knowledge Graph Presence | Fail | No verified KG presence found |
| A08 | Entity Consistency | Partial | Organization data is mostly consistent, but page-level author identity is not |
| A09 | Partnership Signals | Fail | No authoritative partnerships shown |
| A10 | Community Standing | Fail | No community influence signal surfaced |

**A Score**: `25/100`

### T — Trust

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| T01 | Legal Compliance | Pass | Privacy and terms pages exist |
| T02 | Contact Transparency | Pass | Support email is public and company details exist in legal pages |
| T03 | Security Standards | Pass | HTTPS is live |
| T04 | Disclosure Statements | Pass | No affiliate/review monetization pattern detected on-page |
| T05 | Editorial Policy | Fail | No public content standards/review policy linked from the article |
| T06 | Correction & Update Policy | Fail | Update date exists, but no corrections policy or changelog process is explained |
| T07 | Ad Experience | Pass | No intrusive ad load observed |
| T08 | Risk Disclaimers | Partial | Low-risk topic, but stronger caveats around timing generalizations would help |
| T09 | Review Authenticity | Pass | Not a review page, so no fake-review pattern is present |
| T10 | Customer Support | Pass | Support path is visible via site/legal pages |

**T Score**: `70/100`

### Top 5 Priority Improvements

1. **R10 Content Consistency**
   - Current: `Fail`
   - Potential gain: `1.0 weighted point`, plus removal of the `BLOCK` verdict
   - Action: Make the visible byline, schema author, and telemetry author resolve to the same real entity.

2. **R02/R04/R05 Referenceability Stack**
   - Current: `Fail`
   - Potential gain: `3.0 weighted points` combined
   - Action: Replace unsupported stats with sourced evidence or documented ContHunt first-party analysis.

3. **E01/E03 Original Evidence**
   - Current: `Fail`
   - Potential gain: `4.0 weighted points` combined
   - Action: Add a small first-party dataset, screenshots, or a reproducible methodology box.

4. **Exp01-Exp09 Experience Layer**
   - Current: mostly `Fail`
   - Potential gain: `8.5 weighted points` across the dimension
   - Action: Reframe the article around tested observations, examples, and failure cases rather than abstract claims.

5. **O03 Data Tables / R08 Internal Links**
   - Current: `Fail`
   - Potential gain: `1.5 weighted points`
   - Action: Add one comparison table and link out to supporting cluster pages naturally.

### Action Plan

#### Quick Wins (< 30 minutes each)

- [ ] Fix author identity consistency on the rendered page and schema.
- [ ] Replace unsupported stat cards with either sourced numbers or remove them.
- [ ] Add 3-5 internal links to tightly related Shorts pages.

#### Medium Effort (1-2 hours)

- [ ] Add a simple evidence table for posting cadence, title length, thumbnail approach, and timing guidance.
- [ ] Rewrite the introduction and conclusion to be more direct and less hype-heavy.
- [ ] Add a methodology or `How we derived this` section if ContHunt data is being referenced.

#### Strategic (Requires planning)

- [ ] Turn the Shorts cluster into a documented first-party research program.
- [ ] Create stable author entities with bios, credentials, and reviewer process.
- [ ] Rework the top impression pages to be citation-ready assets instead of generic trend posts.

### Supporting Notes On Other Priority Pages

#### `best-time-to-post-youtube-shorts-2026`

- Strong intent match to timing queries.
- GSC shows several queries ranking between positions `1-4`.
- GSC also shows `User Canonical: https://conthunt.app/`, which is a trust/indexing blocker even though the live HTML canonical is correct.
- This page should be fixed in deployment/indexing first, then expanded with evidence.

#### `can-you-use-copyrighted-music-on-youtube-shorts`

- Good fit for policy-intent queries such as `youtube shorts copyright rules 2026`.
- Suffers from the same unsupported-number problem.
- Because this is a policy/safety topic, unsupported claims create a higher trust risk than on general best-practice content.

### Cross-Reference with CITE

| Assessment | Score | Rating |
|-----------|-------|--------|
| CORE-EEAT (Content) | 46.8/100 | Low |
| CITE (Domain) | 40.9/100 | Low |

**Diagnosis Matrix**: `Low CITE + Low CORE-EEAT`  
The problem is not just ranking polish. ContHunt needs more trustworthy evidence, cleaner entity consistency, and stronger external authority before these pages can behave like citation assets.

### Recommended Next Steps

- Fix the page-level trust contradictions first.
- Refresh the top impression cluster with sources and first-party evidence.
- Only after that, push link/entity building so the improved content has a stronger domain to stand on.
