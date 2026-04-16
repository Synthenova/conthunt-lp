# Task 19 Domain Authority Audit

Date: 2026-04-16

Used skill: `domain-authority-auditor`

## CITE Domain Authority Report

### Overview

- **Verdict**: **CAUTIOUS**
- **Domain**: `conthunt.app`
- **Domain Type**: `Tool & Utility`
- **Audit Date**: `2026-04-16`
- **Primary evidence**:
  - GSC property `sc-domain:conthunt.app`
  - `SEO/data/keywords.db`
  - live `curl` checks against `https://conthunt.app`
  - SE Ranking backlink/authority data
- **CITE Score**: **40.9/100 (Low)**
- **Veto Status**: `No trigger`

#### Audit Setup

**Domain**: `conthunt.app`  
**Domain Type**: `Tool & Utility`  
**Dimension Weights**: `C 25% | I 30% | T 25% | E 20%`

#### Veto Check

| Veto Item | Status | Action |
|-----------|--------|--------|
| T03: Link-Traffic Coherence | ✅ Pass | Low backlink volume and low organic traffic are proportionate; this does not look like a link farm |
| T05: Backlink Profile Uniqueness | ✅ Pass | No evidence of a mirrored/PBN-style backlink footprint in the sampled data |
| T09: Penalty & Deindex History | ✅ Pass | Key pages are indexed in GSC and no penalty/deindex evidence surfaced |

### Dimension Scores

| Dimension | Score | Rating | Weight | Weighted |
|-----------|-------|--------|--------|----------|
| C — Citation | 20/100 | Poor | 25% | 5.0 |
| I — Identity | 30/100 | Poor | 30% | 9.0 |
| T — Trust | 72.2/100 | Medium | 25% | 18.1 |
| E — Eminence | 44.4/100 | Low | 20% | 8.9 |
| **CITE Score** | | | | **40.9/100** |

**Score Calculation**: `20 × 0.25 + 30 × 0.30 + 72.2 × 0.25 + 44.4 × 0.20 = 40.9`

### Key Evidence

- GSC last 28 days: `192 clicks`, `35,989 impressions`, `0.53% CTR`, `11.5 average position`.
- Homepage captured `187 clicks`; blog traffic is almost entirely non-branded impressions with near-zero CTR.
- Local keyword DB tracks `1,211` keywords; `762` are YouTube Shorts related.
- Third-party backlink data shows only `6 backlinks` from `4 referring domains`, all `nofollow`.
- Referring-domain authority is mixed, but the link base is too small to create meaningful citation strength.
- Organization schema, privacy page, terms page, and support email exist, which helps trust.
- Social/entity coverage exists on owned properties, but knowledge-graph and brand-mention signals remain weak.

### C — Citation

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| C01 | Referring Domains Volume | Fail | Only `4` refdomains versus the benchmark threshold of `500+` |
| C02 | Referring Domains Quality | Fail | No meaningful dofollow editorial authority base; strongest sampled refdomain does not offset the tiny profile |
| C03 | Link Equity Distribution | Partial | Sample is small and not obviously sitewide-spam, but too thin to show real equity concentration |
| C04 | Link Velocity | Partial | First-seen links from `2026-02-21` to `2026-04-13` suggest gradual accrual rather than a spike |
| C05 | AI Citation Frequency | Fail | AI overview data returned no measurable brand or link presence |
| C06 | AI Citation Prominence | Fail | No evidence of ContHunt appearing as a primary AI-cited source |
| C07 | Cross-Engine Citation | Fail | No cross-engine AI citation footprint confirmed |
| C08 | Citation Sentiment | Fail | No measurable AI citation corpus to score sentiment from |
| C09 | Editorial Link Ratio | Partial | Current anchors look mostly branded/navigation-oriented; not enough evidence of strong editorial citation behavior |
| C10 | Link Source Diversity | Partial | Links span multiple countries/IPs, but only across `4` domains and `2` linked pages |

**C Score**: `20/100`

### I — Identity

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| I01 | Knowledge Graph Presence | Fail | No confirmed Google KG/Wikidata/DBpedia footprint found in the available data |
| I02 | Brand Search Volume | Pass | GSC shows measurable branded demand for `conthunt` and `conthunt.app` |
| I03 | Brand SERP Ownership | Partial | Owned properties exist, but branded search visibility is not yet broad or dominant |
| I04 | Schema.org Coverage | Partial | Homepage and article schema exist, but GSC shows rich-result parsing failures on priority blog URLs |
| I05 | Author Entity Recognition | Fail | Authors are not stable public entities; visible bylines and schema identities do not align cleanly |
| I06 | Domain Tenure | Fail | Founded `2024`; below the `3+ years` benchmark |
| I07 | Cross-Platform Consistency | Partial | Brand name, social handles, and support email are fairly consistent, but author/byline consistency is weak |
| I08 | Niche Consistency | Partial | The domain is focused on creator/content intelligence, but its tenure is still short |
| I09 | Unlinked Brand Mentions | Fail | No reliable third-party unlinked mention corpus surfaced |
| I10 | Query-Brand Association | Fail | Branded navigational demand exists, but not enough evidence of category+brand coupling yet |

**I Score**: `30/100`

### T — Trust

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| T01 | Link Profile Naturalness | Partial | The profile is tiny but gradual; nothing clearly manipulative, nothing strong either |
| T02 | Dofollow Ratio Normality | Fail | `0% dofollow`; benchmark normality is `40-90%` |
| T03 | Link-Traffic Coherence | Pass | Weak link profile is matched by weak organic reach, so coherence is intact |
| T04 | IP/Network Diversity | Pass | `4` refdomains across `5` IPs and `5` subnets; no obvious network cluster |
| T05 | Backlink Profile Uniqueness | Pass | No evidence of a duplicated backlink graph or PBN pattern |
| T06 | WHOIS & Registration Transparency | N/A | Requires WHOIS history not collected in this pass |
| T07 | Technical Security | Pass | HTTPS is live and GSC page fetches succeed |
| T08 | Content Freshness Signal | Pass | Sitemap and content set show active publishing/updates through April 2026 |
| T09 | Penalty & Deindex History | Pass | Priority pages are indexed and GSC shows no deindex symptom |
| T10 | Review & Reputation Signals | Fail | No meaningful third-party review profile surfaced |

**T Score**: `72.2/100`  
`T06` excluded as `N/A`

### E — Eminence

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| E01 | Organic Search Visibility | Pass | Local DB tracks `1,211` active keywords, which clears the `1,000+` benchmark |
| E02 | Organic Traffic Estimate | Fail | GSC shows only `192 clicks` over the last 28 days; no sign of `10k+` monthly organic visits |
| E03 | SERP Feature Ownership | Fail | Priority URLs show rich-result failures rather than owned SERP features |
| E04 | Technical Crawlability | Pass | Robots, sitemap, mobile crawlability, and indexing are healthy overall |
| E05 | Multi-Platform Footprint | Pass | Owned presence exists across main site, app subdomain, X, Instagram, and TikTok |
| E06 | Authoritative Media Coverage | Fail | No authoritative news/industry coverage located in this pass |
| E07 | Topical Authority Depth | Partial | The keyword map is dense in Shorts/analytics topics, but rankings are not yet producing clicks |
| E08 | Topical Authority Breadth | Partial | Coverage spans YouTube Shorts, Reels, TikTok, analytics, and competitor intelligence, but not with strong authority yet |
| E09 | Geographic Reach | N/A | Country-level organic traffic was not pulled in this pass |
| E10 | Industry Share of Voice | Fail | Non-branded share of voice remains weak; homepage carries almost all clicks |

**E Score**: `44.4/100`  
`E09` excluded as `N/A`

### Top 5 Priority Improvements

1. **CITE-C01 Referring Domains Volume**
   - Current: `Fail`
   - Potential gain: `2.5 weighted points`
   - Action: Earn `20-30` relevant editorial links over the next 90 days from creator-economy, social-media, and SaaS publications.

2. **CITE-I01 Knowledge Graph Presence**
   - Current: `Fail`
   - Potential gain: `3.0 weighted points`
   - Action: Create a canonical entity footprint for ContHunt with consistent org data, founder/company details, and third-party profile references.

3. **CITE-C05/C07 AI Citation Signals**
   - Current: `Fail`
   - Potential gain: `5.0 weighted points` combined
   - Action: Turn top blog posts into citation-ready assets with sourced claims, named frameworks, and quotable definitions that AI systems can reuse.

4. **CITE-E02 Organic Traffic Estimate**
   - Current: `Fail`
   - Potential gain: `2.0 weighted points`
   - Action: Improve CTR and intent fit on the existing high-impression blog cluster before publishing new long-tail pages.

5. **CITE-I04 Schema.org Coverage**
   - Current: `Partial`
   - Potential gain: `1.5 weighted points`
   - Action: Fix rich-result parsing errors and align visible author data, schema author data, and canonical deployment output.

### Action Plan

#### Quick Wins (< 1 week)

- [ ] Fix structured-data parsing failures on priority blog posts.
- [ ] Align visible bylines, schema author entities, and analytics author names across the blog.
- [ ] Publish an editorial/about page that names the company, team, and content standards more explicitly.

#### Medium Effort (1-4 weeks)

- [ ] Refresh the top impression pages to improve non-branded CTR.
- [ ] Build a small set of citation-worthy pillar assets around Shorts timing, hooks, copyright, and analytics.
- [ ] Create third-party entity/profile pages with fully consistent organization metadata.

#### Strategic (1-3 months)

- [ ] Run a focused digital PR/link earning campaign in creator-economy and martech publications.
- [ ] Build brand-query association by pushing branded comparisons and category-defining research.
- [ ] Track quarterly CITE trendlines using backlink growth, branded demand, and AI citation checks.

### Cross-Reference with CORE-EEAT

| Assessment | Score | Rating |
|-----------|-------|--------|
| CITE (Domain) | 40.9/100 | Low |
| CORE-EEAT (Content) | See `task-20-core-eeat-content-audit.md` | — |

**Diagnosis**: `Low CITE + weak content trust signals` means the next gains should come from fixing citation-readiness on existing pages, not from expanding topical coverage blindly.

### Recommended Next Steps

- Tighten the trust layer first: author consistency, schema validity, editorial transparency.
- Then refresh the high-impression blog cluster to turn existing query demand into clicks.
- Then build authority externally through entity/profile work and editorial mentions.
