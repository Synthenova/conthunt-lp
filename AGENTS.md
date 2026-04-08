# Agents Guide

## Repository Overview

ContHunt landing page + SEO automation system. Blog content for content creators, plus backend tools for SEO tracking.

---

## Blog Writing Format

Location: `content/blog/*.md`

### Frontmatter

```yaml
---
title: "Question Title? (2026 Guide)"
description: "SEO description under 160 chars. Include primary keyword."
date: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
category: "Best Practices"
author: "ContHunt Editorial Team"
image: "/public/banner.png"
canonical: "https://conthunt.app/blog/slug"
meta_keywords: ["primary keyword", "secondary keyword", "conthunt"]
author_profile:
  name: "ContHunt Editorial Team"
  url: "https://conthunt.app/blog"
  image: "/public/avatar-team.png"
  job_title: "Role"
  description: "One line bio."
answer_first:
  text: "**Bold answer in 2-3 sentences.** Include ContHunt mention if relevant."
faq_items:
  - question: "Question?"
    answer: "Concise answer with ContHunt data reference."
stat_items:
  - label: "Metric Name"
    value: "42%"
    context: "One line explanation."
---
```

### Content Structure

1. `answer_first` - Immediate answer in frontmatter (renders as featured snippet)
2. `# H1 Title` - Match title tag
3. `## 2. Section` - Numbered sections
4. `**Bold**` for key terms
5. `*ContHunt Tip:` for product mentions
6. `## Checklist` / `## Conclusion` - End sections
7. Use 2026 in titles/hooks

### Example Blog

`content/blog/how-long-can-an-instagram-reel-be.md`

---

## SEO Folder

Location: `SEO/`

### Database

`SEO/data/keywords.db` (SQLite, 21MB)

**Key Tables:**
| Table | Records | Purpose |
|-------|---------|---------|
| `queries` | 2,232 | All keywords (2,132 SEO + 100 AI visibility) |
| `blogs` | 105 | Blog inventory |
| `blog_query_links` | 4,611 | Blog → keyword mappings |
| `content_actions` | 15 | AI-generated content tasks |
| `gsc_query_metrics` | 4,873 | GSC impressions/clicks |
| `serp_results` | 9,874 | SERP rankings |
| `ai_visibility_results` | 600 | AI citation data |

### Backend

`SEO/backend/app/` - FastAPI + async worker

- `main.py` - REST API endpoints
- `worker.py` - Background job processor
- `db.py` - SQLite connection
- `settings.py` - Config

### Scripts

`SEO/scripts/` - Job workers

| Script | Purpose |
|--------|---------|
| `run_dashboard_jobs.py` | Main job orchestrator |
| `gsc_fetch.py` | Google Search Console data |
| `check_rankings.py` | SERP checks via Apify |
| `google_search_test.py` | AI visibility via Gemini |
| `get_keyword_data.py` | SERanking enrichment |
| `prioritize_keywords.py` | Keyword scoring |

### Running Jobs

```bash
cd SEO
source .venv/bin/activate
python scripts/run_dashboard_jobs.py --jobs gsc,serp,ai,refresh
```

### Frontend

`SEO/frontend/` - Next.js dashboard for viewing SEO data

---

## Querying keywords.db

```bash
sqlite3 SEO/data/keywords.db "SELECT * FROM queries LIMIT 5;"
sqlite3 SEO/data/keywords.db "SELECT query_text, volume FROM query_seranking_current ORDER BY volume DESC LIMIT 10;"
```