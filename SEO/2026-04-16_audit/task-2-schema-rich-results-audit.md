# Task 2 Schema And Rich Results Audit

Date: 2026-04-16

Reviewed 13 priority URLs and the blog build path for structured-data issues.

Findings:
- `scripts/templates/post.ejs` emits `FAQPage` JSON-LD, but the FAQ content is not rendered visibly on the page from the same frontmatter source.
- Multiple priority posts return `Rich Results: FAIL` in GSC with `FAQ` and/or `Unparsable structured data`.
- Some URLs have canonical drift to the homepage, which creates alternate-page indexing behavior.

Files checked:
- `scripts/build-blog.js`
- `scripts/templates/post.ejs`
- `content/blog/how-long-can-an-instagram-reel-be.md`

Suggested next fix:
- render visible FAQ sections from `faq_items`
- keep JSON-LD generation, but only for validated FAQ content
- audit and correct canonical frontmatter on the URLs that resolve to `/`
