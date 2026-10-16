# statement-simulator

Home section 1.5–2: the giant "Stop scrolling…" statement with inline clip squircles, then the
page's one pinned scroll-jack into a live Deep Search simulator. Preview: `/preview/statement-simulator`.

## Files

| File | What it is |
|---|---|
| `index.tsx` | Server entry. `<StatementSimulatorSection simulator? index? total? />` |
| `scene.tsx`, `scene.module.css` | Statement, chips, credit line and the pinned GSAP timeline |
| `statement-copy.ts` | The statement as five lines: the owner's sentence (2026-10-16), "500" read from the data |
| `simulator/index.tsx` | `<DeepSearchSimulator {...DeepSearchSimulatorProps} live? label? scrollMode? onActiveSearchChange? className? />` |
| `simulator/full-view.tsx` | `<FullControlButton simulator activeSearchId? />`: "Full Control", the same simulator full screen in a modal `<dialog>` (page locked, free scrolling) |
| `simulator/scroll.ts` | Wheel ownership for the board, transcript and drawer (engage on click, hand back at the edges) |
| `simulator/*` | Sidebar, tabs, board, tile, chat, drawer, menus/tooltips (`layer.tsx`), helpers (`format.ts`) |

## Feeding real data

The simulator is driven entirely by `DeepSearchSimulatorProps` in
`src/content/simulator/types.ts`. Field names are the app's own, so an export from the app maps
1:1. Start from `src/content/simulator/placeholder.ts` and replace values; no component changes
are needed.

```tsx
import StatementSimulatorSection from "@/components/sections/statement-simulator";
import { realSimulatorProps } from "@/content/simulator/real"; // your file

<StatementSimulatorSection simulator={realSimulatorProps} />
```

1. **Video tiles.** For each `SimSectionVideo` / `SimRubricVideo`, remove `skeleton: true` and fill
   `card` (`SimVideoCard`): `creator_handle` or `author_name`, `title`, `platform`, `metrics`
   (`views`, `likes`, `comments`, `shares`) and `thumbnail_url` (9:16 poster, 360x640 WebP per
   PLAN §2). Optional `playback_url` (muted H.264 MP4) plays on hover. Tiles render the app's
   anatomy: score badge, creator + platform glyph, two-line caption, views / likes /
   shares-or-comments / engagement rate (`1.2k`, `2.6M` formats). Badges come from `score`
   (sections) or `match_probability` (rubrics).
2. **Sections.** Keep "Top videos" first. `videos_total` is the "N videos" count when you ship a
   slice of a longer list (the sim renders up to 8 tiles per rail).
3. **Rubrics.** Each `SimRubricRow` needs `parameter` and `predicate`; give the rows you want
   populated a `videos` page. Rows without `videos` show the app's loading tiles. The Sort,
   Date and Platform menus (on the right of the header band, beside the prompt title) filter and
   sort the rubric rail for real (nulls sort last).
4. **Chat transcript.** `messages` is a discriminated union (`user`, `thinking_group`,
   `auto_approved`, `worker_task`, `assistant`, `next_prompts`, optional `plan` and `budget`).
   Fill trace rows (`searches` rows get `platform` + `count`) and set `SimAssistantMessage.markdown`
   (paragraphs split on blank lines) with `skeleton: false`.
5. **Tabs 2 and 3.** The placeholder ships them as `skeleton: true` stubs. Until real data lands,
   `simulator/sample-runs.ts` fills a stub (matched by id, only while it is still empty) with a
   finished run: completed worker, its own queries, section titles, rubric rows, counts and
   skeleton tiles, so every tab reads as a finished Deep Search. Drop `skeleton: true` once a tab
   has `messages`, `sections` and `rubrics`; owner data always wins and the file can then go.
   Each tab swaps the board, the transcript, the header title and the highlighted Recents row.
6. **Copy outside the frame** reads `searches[0].approved_budget.videos` and the first worker's
   `elapsed`, so "500 videos … in 8m" follows the data.

Statement copy is the owner's sentence, "Stop scrolling to find ideas. ContHunt watches up to 500
videos from your niche in under five minutes, checks every frame and hands you what works." (brand
spelled ContHunt, `{videos}` for 500, 26 words, five chips, *works.* in Boska italic). Edit it in
`statement-copy.ts`; keep each of the five desktop lines at 5-6 words, because the scroll-jack's Flip
moves whole lines. Line 2 ("ContHunt watches up to 500 videos") is the widest line (15.08em) and so
carries no chip; chip 3 sits on line 1. `--stmt-desk` (scene.module.css, 5.1vw below 1280px and
3.85vw from there, under the clamp) keeps the letterbox at 15.58em or more, at least 3% slack. The
screen-reader text is the same words without chips.

Statement clips come from `src/content/media/statement-chips.json` (`[n]` markers in
`statement-copy.ts` pick which chip goes where). Hovering a chip names its creator and views in
the credit line.

## Behaviour notes

- Landed size (OWNER_DECISIONS D5, `docs/revamp/sections/simulator-fullsize.md`): from 768px the
  landed frame is full size, the app simulated as the whole screen: `--sim-full-w` in
  `globals.css`, `min(100% - 48px, (100svh - 108px) * 1.6, max(1440px, --letterbox))`, 16:10. The
  canvas renders at about 0.77x at 1280 x 720, 0.99x at 1440 x 900, 1.125x at 1680 x 1050 and
  1920 x 1080, and 1.2x at 2560 x 1440. It is the one element below the hero that leaves the
  letterbox. A slim 44px row sits 12px above it, on the frame's edges: the eyebrow and the run
  caption on the left (eyebrow over caption on tablets), `Full Control` (>= 1024px) and
  `Get started` on the right. The row and its gap are opaque, so the rails stop at the app.
- Desktop and tablet with motion: one ScrollTrigger timeline, `pin` on the inner stage (not the
  `<section data-section>`), `scrub: 0.6`, `end: +=240%`. The statement lines Flip from centred to a
  0.8x left headline while the frame swings in from the right and parks 36-56% visible (a fixed gap
  right of the headline; about the old letterbox size, 0.92 of it; rotateY -6deg), then it slides to
  the centre, straightens and grows into the full-size frame (one timeline, transforms only; layout
  always holds the landed geometry). The row rises in; the frame is live from `LIVE_T` (10.05 of
  10.9) and the pin holds it to the end.
- Immersive: while the landed frame owns the screen (from 8.6 of 10.9 until the pin ends, in either
  direction) the scene sets `data-immersive` on `<html>` and `globals.css` slides the navbar away,
  so it never covers the row (the top-edge peek does not bring it back; keyboard focus in the
  navbar does). It comes back as soon as the scene unpins.
- Until it lands, the whole simulator group is `inert` (no invisible tab stops). A visually hidden
  "Skip to the live demo" button is the section's only tab stop; it scrolls to the landed state and
  focuses the frame.
- Phones: unchanged by D5. No pin, scrubbed word reveal, the letterbox-wide frame fades up at a
  0.8 scale and pans between two snap stops (Board / Agent, 44px buttons). The header band ends at
  the Board stop's right edge, so the three filters show without panning (sort and date as icons)
  and the title truncates hard. The video drawer becomes a 1:1 bottom sheet over the
  visible pan window (drag down or Close to dismiss).
- Reduced motion: no pin or scrub, final states, posters instead of clip playback, instant collapse.
  From 768px the static frame has the same full size and the same row, in normal flow.
- Wheel: the page owns it until a click or focus inside the frame. Then the board, transcript and
  drawer scroll, and hand the same gesture back to the page at either end of their range. Touch
  engagement also ends after 2.5s idle. A one-time hint ("Click to scroll the board") teaches this.
- Legibility: real labels stay at or above 11.5px design (12px for body text) and at least 4.5:1
  contrast (the canvas scopes `--muted` to 62% ink; `--faint` is used only for decorative marks).
  Below a 768px-wide frame the scale holds at 0.6 and the frame pans instead of shrinking.
- Full Control (>= 1024px) opens the same demo in a full-screen modal `<dialog>` at the same size
  (both read `--sim-full-w`), on the tab the visitor was viewing: the page is locked, the board and
  transcript scroll freely (`scrollMode="free"`) and the navbar hides. Close, Esc or a backdrop click
  return to the page with focus back on the button. Inside the dialog Esc closes an open menu or
  the drawer first, then the dialog (it does not collapse the sidebar there).
- Sidebar collapse (224 to 64) is transform-only: see the header comment in `simulator/index.tsx`.
- Skeleton shimmer: blocks are static; one light sweep runs per group that is skeleton throughout
  (a rail of skeleton tiles, the loading board, a skeleton report, the open drawer's poster). It
  exists only while the frame is on screen (`data-sim-play="running"` on the frame) and never under
  reduced motion, so an offscreen frame holds no animations. A rail stops shimmering as soon as its
  tiles carry real data.
- Markup budget: a skeleton tile is CSS-only (`simulator/tile.module.css`: bars from the face's
  pseudo-elements, the four metric glyphs as one masked layer, no lucide SVGs). Only the first two
  sections' rails render on the server; later rails and the rubric block mount on the first hover,
  click or focus inside the frame (before the board can scroll), over placeholders of the same
  height. The active board at rest is about 20KB and 175 elements (it was about 252KB and 1,979).
- Full Control sets `data-modal-open` on `<html>` while open (the fixed navbar hides; globals.css),
  cleared on close, on Esc and on unmount.
- Menus and tooltips close on Esc, an outside click, or a scroll that moves their trigger (the page,
  or a scroller around the trigger); a rail re-snapping after a filter change does not close them.
- Keyboard: each rail is one tab stop (arrow keys move, Enter opens, Space selects); the drawer
  returns focus to the tile that opened it; tabs, Recents and next-step rows use roving focus.

## When real posters arrive

Tiles render posters with `next/image` (`unoptimized`, lazy by default). The frame enters the
viewport by transform rather than by scrolling, and the sidebar logo did not lazy-load reliably in
that situation (it is `loading="eager"` with `fetchPriority="low"`, so React emits no head preload
for it). Check that real posters in the first two rails appear
on landing; if they do not, pass `loading="eager"` for the first 5 tiles of each rail.
