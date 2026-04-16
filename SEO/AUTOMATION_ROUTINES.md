# SEO Automation Routines for ContHunt

Cron-style prompts for SEO agent automation. Each prompt specifies exact skills to use.

---

## DAILY ROUTINES

### Morning Performance Check (Daily 8:00 AM)

**Frequency:** Daily

**Prompt:**
```
Run daily SEO/GEO performance monitoring for conthunt.app.

Skills to use:
1. rank-tracker - Track keyword positions in SERP and AI responses
2. performance-reporter - Generate SEO/GEO performance report

Data sources:
- Use keywords.db (SEO/data/keywords.db) for tracked keywords and historical data
- gsc-cli skill available for Google Search Console data
- google-indexing-service skill available for indexing status

Deliverable: Summary of ranking changes, traffic trends, and any alerts from the last 24 hours.
```

---

### Backlink Health Check (Daily 10:00 AM)

**Frequency:** Daily

**Prompt:**
```
Monitor backlink profile health for conthunt.app.

Skills to use:
1. backlink-analyzer - Analyze backlink profile, detect toxic links
2. alert-manager - Flag any new toxic backlinks or lost high-value links

Data sources:
- Use keywords.db (SEO/data/keywords.db) for domain authority baseline
- gsc-cli skill available for Google Search Console backlink data
- google-indexing-service skill available for indexing status

Deliverable: Backlink changes summary, toxic link alerts, new linking opportunities.
```

---

## WEEKLY ROUTINES

### Keyword Opportunity Research (Weekly Monday 9:00 AM)

**Frequency:** Weekly (Monday)

**Prompt:**
```
Research new keyword opportunities for conthunt.app content strategy.

Skills to use (in order):
1. keyword-research - Discover keywords with intent analysis and difficulty scoring
2. content-gap-analysis - Find content opportunities competitors cover but we don't

Data sources:
- Use keywords.db (SEO/data/keywords.db) for existing tracked keywords and search volume data
- gsc-cli skill available for Google Search Console query data
- google-indexing-service skill available for indexing status

Deliverable: List of high-value keyword opportunities with topic clusters and content recommendations.
```

---

### Competitor Intelligence (Weekly Tuesday 9:00 AM)

**Frequency:** Weekly (Tuesday)

**Prompt:**
```
Analyze competitor SEO/GEO strategies for conthunt.app market positioning.

Skills to use:
1. competitor-analysis - Analyze competitor strategies and find weaknesses
2. serp-analysis - Analyze search results and AI answer patterns

Data sources:
- Use keywords.db (SEO/data/keywords.db) for competitor keyword data and benchmarks
- gsc-cli skill available for Google Search Console competitive insights
- google-indexing-service skill available for indexing status

Deliverable: Competitor insights, keyword gaps, SERP feature opportunities, AI visibility comparison.
```

---

### Content Quality Audit (Weekly Wednesday 9:00 AM)

**Frequency:** Weekly (Wednesday)

**Prompt:**
```
Audit content quality and domain authority for conthunt.app.

Skills to use:
1. content-quality-auditor - 80-item CORE-EEAT audit with publish readiness gate
2. domain-authority-auditor - 40-item CITE audit with authority verdict

Data sources:
- Use keywords.db (SEO/data/keywords.db) for page-level keyword targeting data, SERP etc.
- gsc-cli skill available for Google Search Console page performance data
- google-indexing-service skill available for indexing status

Deliverable: Combined 120-item quality assessment with priority fixes and ship/no-ship verdicts.
```

---

### Technical Health Check (Weekly Thursday 9:00 AM)

**Frequency:** Weekly (Thursday)

**Prompt:**
```
Check technical SEO health for conthunt.app.

Skills to use:
1. technical-seo-checker - Check crawlability, indexing, Core Web Vitals
2. internal-linking-optimizer - Analyze internal link structure

Data sources:
- Use keywords.db (SEO/data/keywords.db) for page inventory and link targets
- gsc-cli skill available for Google Search Console crawl and indexing data
- google-indexing-service skill available for indexing status

Deliverable: Technical issues list, Core Web Vitals summary, internal linking recommendations.
```

---

## BI-WEEKLY ROUTINES

### Content Refresh Cycle (Bi-weekly Friday 10:00 AM)

**Frequency:** Every 2 weeks (Friday)

**Prompt:**
```
Identify and refresh decaying content for conthunt.app.

Skills to use:
1. content-refresher - Update outdated content to recover rankings
2. content-quality-auditor - Ensure refreshed content meets quality gates

Data sources:
- Use keywords.db (SEO/data/keywords.db) for declining keyword positions and traffic trends
- gsc-cli skill available for Google Search Console historical performance data
- google-indexing-service skill available for indexing status

Deliverable: List of pages needing refresh, priority ranking, recommended updates.
```

---

### Entity & Brand Optimization (Bi-weekly Monday 2:00 PM)

**Frequency:** Every 2 weeks (Monday)

**Prompt:**
```
Optimize brand entity presence for conthunt.app across search and AI.

Skills to use:
1. entity-optimizer - Canonical entity profile for brand truth
2. schema-markup-generator - Generate JSON-LD for rich results

Data sources:
- Use keywords.db (SEO/data/keywords.db) for entity-related keyword data
- gsc-cli skill available for Google Search Console brand query data
- google-indexing-service skill available for indexing status

Deliverable: Entity profile updates, schema markup recommendations, knowledge panel status.
```

---

## MONTHLY ROUTINES

### Full Site Audit (Monthly 1st of month 8:00 AM)

**Frequency:** Monthly (1st)

**Prompt:**
```
Comprehensive SEO/GEO audit for conthunt.app.

Skills to use:
1. on-page-seo-auditor - Full on-page audit with scored report
2. technical-seo-checker - Technical health check
3. content-quality-auditor - 80-item CORE-EEAT audit
4. domain-authority-auditor - 40-item CITE audit

Data sources:
- Use keywords.db (SEO/data/keywords.db) for all tracked data
- gsc-cli skill available for Google Search Console comprehensive data
- google-indexing-service skill available for indexing status

Deliverable: Comprehensive audit report with all scores, priority fixes, and strategic recommendations.
```

---

### Strategy & Planning (Monthly 15th 9:00 AM)

**Prompt:**
```
Monthly SEO/GEO strategy review and planning for conthunt.app.

Skills to use:
1. keyword-research - New keyword opportunities
2. competitor-analysis - Competitive landscape changes
3. content-gap-analysis - Content opportunity assessment
4. performance-reporter - Monthly performance summary

Data sources:
- Use keywords.db (SEO/data/keywords.db) for all historical data
- gsc-cli skill available for Google Search Console analytics
- google-indexing-service skill available for indexing status

Deliverable: Strategic recommendations, content calendar suggestions, priority initiatives for next month.
```

---

## ON-DEMAND ROUTINES

### New Content Publication

**Trigger:** Before publishing new content

**Prompt:**
```
Prepare and optimize new content for conthunt.app.

Skills to use (in order):
1. seo-content-writer - Write search-optimized content
2. geo-content-optimizer - Make content quotable by AI systems
3. meta-tags-optimizer - Create compelling titles and descriptions
4. schema-markup-generator - Generate JSON-LD structured data
5. content-quality-auditor - Final quality gate before publish

Data sources:
- Use keywords.db (SEO/data/keywords.db) for target keyword research and SERP data
- gsc-cli skill available for Google Search Console keyword insights
- google-indexing-service skill available for indexing status

Deliverable: Publication-ready content with all meta tags, schema, and quality gate passed.
```

---

### Alert Response

**Trigger:** When alerts fire (ranking drops, traffic changes)

**Prompt:**
```
Diagnose and respond to SEO alerts for conthunt.app.

Skills to use:
1. alert-manager - Review triggered alerts
2. on-page-seo-auditor - Diagnose page-level issues
3. technical-seo-checker - Check for technical causes
4. content-refresher - Recommend content fixes if needed

Data sources:
- Use keywords.db (SEO/data/keywords.db) for affected keyword/page data
- gsc-cli skill available for Google Search Console alert context
- google-indexing-service skill available for indexing status

Deliverable: Root cause analysis, recommended fixes, priority ranking.
```

---

## SUMMARY TABLE

| Routine | Frequency | Primary Skills |
|---------|-----------|----------------|
| Morning Performance Check | Daily | rank-tracker, performance-reporter |
| Backlink Health Check | Daily | backlink-analyzer, alert-manager |
| Keyword Opportunity Research | Weekly (Mon) | keyword-research, content-gap-analysis |
| Competitor Intelligence | Weekly (Tue) | competitor-analysis, serp-analysis |
| Content Quality Audit | Weekly (Wed) | content-quality-auditor, domain-authority-auditor |
| Technical Health Check | Weekly (Thu) | technical-seo-checker, internal-linking-optimizer |
| Content Refresh Cycle | Bi-weekly (Fri) | content-refresher, content-quality-auditor |
| Entity & Brand Optimization | Bi-weekly (Mon) | entity-optimizer, schema-markup-generator |
| Full Site Audit | Monthly (1st) | on-page-seo-auditor, technical-seo-checker, content-quality-auditor, domain-authority-auditor |
| Strategy & Planning | Monthly (15th) | keyword-research, competitor-analysis, content-gap-analysis, performance-reporter |
| New Content Publication | On-demand | seo-content-writer, geo-content-optimizer, meta-tags-optimizer, schema-markup-generator, content-quality-auditor |
| Alert Response | On-demand | alert-manager, on-page-seo-auditor, technical-seo-checker, content-refresher |

---

## NOTES

- All prompts reference `SEO/data/keywords.db` for accessing tracked keyword data
- All prompts mention availability of `gsc-cli` skill for Google Search Console integration
- All prompts mention availability of `google-indexing-service` skill for indexing status
- Skills are grouped according to the workflow: Research → Build → Optimize → Monitor
- Cross-cutting skills (content-quality-auditor, domain-authority-auditor, entity-optimizer) act as quality gates
- Skill combos follow the recommended combinations from seo_readme.md
