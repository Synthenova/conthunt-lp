# Section brief: `blog` (home gallery) + `/resources` + `/resources/[slug]` (owner: Sonnet builder)

Owns:
- `src/components/sections/blog/**`
- `src/components/pages/resources/**`
- `src/app/(site)/resources/**` (replace the stubs; keep and extend the metadata)
- `src/lib/blog/**` (loader)

References:
- `AWqCh.png`: the gallery ref. Three wide cards per view, each with a cover image on top and a
  title plus a dim excerpt below, with arrow buttons top-right.
- `CH4uy.png`, `qmz76.png`, `D5IGip.png`: the cover style, crisp product-UI fragments floating
  over a soft photographic plate.

Data:
- `content/blog/*.md`: frontmatter plus Markdown.
- `src/content/blog-covers.json`: plate paths, dominant colour, fragment type and data.
- `public/blog/plates/*`.

## BlogCover component (shared by the gallery, index and article)

- A 16:10 frame (radius 20px) showing the plate image (`next/image` with blur placeholder
  from the dominant colour).
- A **coded UI fragment** overlaid in the centre-left, rendered in crisp DOM. One fragment type
  per post (`fragment`), each a small, beautiful light-glass card with a soft shadow:
  - `search-bar`: a query in a pill with a mode chip
  - `score-card`: a 9:16 mini card with a 94% chip and a gold area chart
  - `hook-timeline`: a 0–15s ruler with hook/problem/proof/CTA markers
  - `trend-chart`: an area chart plus a delta chip
  - `board-grid`: a 2×3 mini grid of posters, or skeletons
  - `agent-trace`: 3–4 trace rows with check marks
  - `tracking-chart`: 3 lines plus account avatars
  - `mcp-terminal`: a mono code card
  - `niche-chips`: a cloud of niche chips with one active
- Use the `fragment_data` labels. Small posters may come from `public/media/hiw/*.webp`.
- Make the fragments look like the refs: frosted paper (`rgba(255,255,255,.72)` + backdrop blur),
  hairline borders, 12–14px radius, Switzer/mono labels, and slight perspective or tilt variety.
- Export a static OG image route per post: `opengraph-image.tsx` with `next/og`, using the plate
  and title. Do this if it is feasible in time; otherwise report it as a follow-up.

## Home gallery (`[ 07 / 08 ] · RESOURCES`)

- **Header row:** the eyebrow, a heading of 8 words or fewer with one Boska italic word, and on
  the right two round arrow buttons (prev/next, disabled state at the ends).
- **Cards:** 6 in total, the 5 `featured` posts by `featuredOrder` plus a 6th **"All articles"**
  card.
  - The 6th card uses the `_index` plate with a large arrow, the copy "Read all articles",
    and the post count. It links to `/resources`.
- **Paging:** 3 cards per view. The right arrow pages by 3 with a smooth slide (GSAP or Motion,
  about 0.6s ch.out); the left arrow goes back.
  - Drag or swipe works on touch, with dots for 2 pages on mobile.
  - On mobile, show 1.15 cards per view with scroll-snap.
- **Card body:** the cover (BlogCover), then the title (Switzer 600, 18–20px) and a 2-line dim
  excerpt. The category and reading time sit in mono.
- **Card hover:** the cover image scales to 1.03, the fragment lifts 4px and the title underline
  slides in.

## `/resources` index ("newer, cleaner, modern")

- A header with the `_index` plate as a soft wide banner, a headline and a sub.
- A category filter as chips (All + categories, with URL state `?c=`).
- A **featured** post as a large horizontal card (cover left at 60%, text right).
- A clean grid of the rest: 3 columns desktop, 2 tablet and 1 mobile, generous whitespace.
- A newsletter mini-block at the end, using the retained newsletter copy from
  `src/content/site/newsletter.ts` (UI only; post to the same endpoint the legacy page used if
  one exists, otherwise use a disabled state with a TODO).

## `/resources/[slug]` article

- `generateStaticParams` and per-post metadata (title, description, OG).
- Breadcrumb, category and reading time in mono; title at Display M; excerpt; the BlogCover at
  full width.
- Article typography: Switzer 18px with line-height 1.65 and a max of 68ch. h2 and h3 in Switzer
  700 with tracking -0.02em. Tables, lists and blockquotes are styled.
- A sticky TOC at the left on ≥1280px.
- Replace `{{GET_STARTED_URL}}` with `GET_STARTED_URL`.
- End with a CTA band ("Get started") and 3 related posts.
- Markdown: use `gray-matter` plus `remark`/`rehype` (or `marked`) with GFM. Add the packages you
  need and list them in your report.
