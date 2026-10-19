# Page brief: `/viral-now` (owner: Sonnet builder)

Owns:
- `src/components/pages/viral-now/**`
- `src/app/(site)/viral-now/**` (replace the stub; keep the metadata)
- `src/lib/viral-now/**` (extend the adapter written in W1; do not break its types)

References:
- `D5IGip.png` and `qvSVa.png`: "Viral Inspiration" with filter pills.
- The Netflix pattern: rows of titles with big rank numerals and hover-expand.

Data and adapter:
- `src/lib/viral-now/types.ts` and `api.ts`.
- `src/content/viral-now/niches.json`: the top 20 niches.
- `src/content/viral-now/seed.json`: the seed snapshot.
- `docs/revamp/specs/viral-now-spec.md`: the API contract and fallback order: live public
  "viral-now" boards → seed snapshot → trending.

## Concept (owner)

"Public Boards, Netflix style top viral videos for various niches … showcase top 30 videos that
week, side-scrollers with alpha edge blur for the side scrollers. At the top you will chose all
niches as button to select and if the user chooses any single niche, then you will display all 30
for the selected niche in a grid."

## Layout

- **Header (letterbox):** the headline "Viral *now*." with a sub: "The top 30 short videos this
  week in 20 niches, refreshed daily and ranked by ContHunt." Add a mono status line:
  "Week of Oct 12 · updated 06:00 UTC". Take the date from the data and the time from
  `generated_at`.
- **Niche selector:** an "All" pill plus 20 niche pills in ONE row that scrolls horizontally,
  with alpha-faded edges.
  - The active pill is ink with paper text. Keep URL state as `?niche=<slug>` (shallow), and
    make the selector keyboard navigable.
  - On selection, the content crossfades and the scroll position resets smoothly.
- **All (default): Netflix rows**, one row per niche in popularity order.
  - A row title (Switzer 600, 22px) with a muted "Top 30 this week" note and a "See all →" link
    that selects the niche.
  - A horizontal side-scroller of cards (9:16 posters, about 200px wide at 1440, gap 12px):
    - the **big rank numeral** (1–30) in outlined Switzer 800 sits behind or left of each card's
      bottom corner, in the Netflix Top 10 style;
    - scroll-snap; arrow buttons appear on row hover; drag to scroll with the mouse (pointer
      events, with momentum through GSAP Inertia or a simple decay).
  - **Alpha edge blur** on both ends of each scroller: a mask-image linear gradient to
    transparent, PLUS a thin `backdrop-filter: blur(6px)` strip under the fade so cards
    "dissolve" at the edges.
  - The rows bleed full-width and overflow to the viewport edges. Since 2026-10-19 (owner) they start
    inside the gutter: from 768px a row's first card sits at 56% of the side gutter, its numeral hanging
    left of it (kept 20px off the edge below 1280px), and the niche chips start at 40% (`--vn-lead-row`,
    `--vn-lead-chips` in viral-now.module.css). Phones keep the letterbox edge.
  - Virtualise or lazy-mount rows: render posters only for rows near the viewport.
- **Card hover** (desktop): a 180ms delay, then the card scales to 1.08 and raises its z-index.
  - If a loop exists (seed ranks 1–3, or a live signed URL), play it muted.
  - A bottom info panel slides up with the platform glyph, creator, views, likes and a score
    chip. Mono numerals in compact format (1.2M).
- **Card click:** open a light modal or side sheet with:
  - the video (playable when a source is available, otherwise the poster with an "Open on
    TikTok" link);
  - the title, creator, metrics and posted date;
  - the score and its rank-source note;
  - a CTA "Analyze videos like this → Get started".
  - It must close with Esc and trap focus.
- **Single niche selected: a grid of all 30**, 6 columns at 1440 (5/3/2 responsive), with rank
  badges and the same hover and click behaviour. Above it, show the niche title, description and
  count.
- **Empty or partial data:** honest states, for example "18 videos this week" when there are
  fewer than 30, and a skeleton shimmer while loading.

## Data behaviour

- Render on the server from the seed (fast, SEO-friendly). Then hydrate: on the client, try the
  live API via the adapter (same-origin `/v1/...` rewrite). If live viral-now boards exist,
  replace the seed rows; otherwise keep the seed.
- Signed media URLs expire after about 1 hour, so renew them on play failure as the spec
  describes.
- Never block the page on the network. Show no error toasts for a missing live data source; log
  once to the console in development only.
