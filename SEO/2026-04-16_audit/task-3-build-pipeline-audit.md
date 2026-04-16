# Task 3 Blog Build Pipeline Audit

Date: 2026-04-16

Audited `scripts/build-blog.js`, `scripts/templates/layout.ejs`, and `scripts/templates/post.ejs`.

Main bugs:
- Article JSON-LD in `layout.ejs` is HTML-escaped inside the `<script>` block, which makes the schema invalid.
- BreadcrumbList JSON-LD in `post.ejs` also uses escaped output for the title field.
- FAQ frontmatter is turned into JSON-LD, but the FAQ content is not rendered visibly on the page.
- Canonical frontmatter is trusted without validation, so bad canonicals can create alternate-page indexing.

Secondary notes:
- RSS and sitemap generation look structurally fine.
- Related-post generation works, but it depends on tag quality and can amplify cluster overlap if tags are too broad.

Recommended fix path:
- switch JSON-LD fields to raw JSON output
- render visible FAQ sections from `faq_items`
- add canonical validation/warnings in the build step
