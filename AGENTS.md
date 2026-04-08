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
`SEO/data/schema_dump.sql`


## Querying keywords.db

```bash
sqlite3 SEO/data/keywords.db "SELECT * FROM queries LIMIT 5;"
sqlite3 SEO/data/keywords.db "SELECT query_text, volume FROM query_seranking_current ORDER BY volume DESC LIMIT 10;"
```
