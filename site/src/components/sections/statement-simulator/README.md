# statement-simulator

Home section 1.5–2: the giant "Stop scrolling…" statement with inline clip squircles, then the
page's one pinned scroll-jack into a live Deep Search simulator. Preview: `/preview/statement-simulator`.

## Files

| File | What it is |
|---|---|
| `index.tsx` | Server entry. `<StatementSimulatorSection simulator? index? total? />` |
| `scene.tsx`, `scene.module.css` | Statement, chips, credit line and the pinned GSAP timeline |
| `statement-copy.ts` | The statement as five lines: the owner's sentence (2026-10-16); "500" is fixed capability copy (`STATEMENT_VIDEOS`) |
| `simulator/index.tsx` | `<DeepSearchSimulator {...DeepSearchSimulatorProps} live? label? scrollMode? onActiveSearchChange? className? />` |
| `simulator/full-view.tsx` | `<FullControlButton simulator activeSearchId? />`: "Full Control", the same simulator in a modal `<dialog>` at 90% of the viewport (page locked, free scrolling, `fill`) |
| `simulator/scroll.ts` | Wheel ownership for the board, transcript and drawer (engage on click, hand back at the edges) |
| `simulator/preload.ts` | Poster cache and the later rails' whole-rail reveal (`useRailReveal`), clip warming, one-clip-at-a-time |
| `simulator/markdown.tsx` | Small markdown renderer for the report and the pre-written replies (safe on a half-streamed string) |
| `simulator/runs.ts` | Tabs loaded on demand: `useRuns`, `loadRun`, `runPending` (one module-level store) |
| `simulator/*` | Sidebar, tabs, board, tile, chat, drawer, menus/tooltips (`layer.tsx`), helpers (`format.ts`) |

## Feeding real data

The simulator is driven entirely by `DeepSearchSimulatorProps` in
`src/content/simulator/types.ts`. Field names are the app's own. The default data is
`src/content/simulator/data.ts` (`simulatorProps`): three real ContHunt Deep Searches, curated for
the demo (spec: `.scratch/deepsearch/DATA.md`).

```sh
python -P .scratch/deepsearch/tools/build_sim_data.py skincare   # or supplements, gifting, --all
```

1. **Run files.** The generator turns a finished tab folder (`.scratch/deepsearch/<tab>/`: `run.json`,
   `final.json`, `followups.json`, `files/report.md`, plus `plan-<tab>.md`) into
   `src/content/simulator/runs/<slug>.json` and regenerates `runs/index.ts` (one loader per file that
   exists), so adding a tab is that one command. A run file is a `SimRunData`: the transcript after
   the prompt, the five sections (8 tiles each, `videos_total` the real entry count), the five
   research-question rails (8 tiles, `total` = videos evaluated) and each card once in `cards`, with
   its `analysis` (hook, summary of at most ~280 characters, and one `[status, probability]` per
   research question). `src/content/simulator/expand.ts` turns it back into a `SimDeepSearch`
   (shared card objects, named checks, the prompt as the first bubble).
2. **Static copy.** Tab label, chat title, prompt (as it was run: 300 videos, the run's platforms,
   the last 30 days), platforms and date filter stay in `data.ts`.
3. **Transcript.** All real, no skeleton: prompt, the thinking group (Checked credits, Research
   approved, Thinking with the plan's reading line), the auto-approved pill (the approved budget:
   12 searches, 300 videos), the finished worker (real elapsed; one Searched row per keyword with the
   platform that admitted most and the videos admitted across platforms; Analysis finished; Read
   video analyses; Publish research sections; Wrote file `report`), the report (ContHunt's
   `report.md`, `Sources` = videos analysed) and the three next steps, each playing back ContHunt's
   own follow-up answer. Text is cleaned for display: markdown links become their label (they point
   at a private app chat), operation ids and `/app/chats/...` paths go, then `` `x` `` becomes
   `@x` only when x is one of the run's creator handles (other backticked words, such as file
   names or ingredients, lose the backticks); replies stay under about 200 words (the generator
   drops the last detail line of every list item first, never rewrites a line). A card with no
   title gets a stand-in, so no tile reads "No Title": its caption without #tags and @tags, else
   the creator's quoted hook, else the analysis's first sentence (at most 100 characters).
4. **Payload.** Only the active tab's run ships with the page (skincare: 69KB JSON, 19KB gzipped;
   cards are stored once and Flight keeps them shared). The other tabs ship as copy and load their
   run file (a separate chunk) on intent (only while still a stub, so the active tab never
   refetches its run): tab or Recents hover/focus, or the first hover inside the
   frame (which also warms their first two rails' posters). A click on a tab whose run is still
   loading switches when it lands (about 200ms locally), so a switch never shows a skeleton.
5. **All three tabs are real runs** (skincare, supplements, gifting; 2026-10-18). The sample-run
   fallback and its placeholder data are gone: a stub with no run file would stay a stub.
6. **Copy outside the frame.** The statement's "up to 500 videos" is the product's capability and is
   fixed copy. The run caption follows the active tab's data: "In action. Real Deep Search results
   added. 300 videos watched and ranked in 17m 38s." for skincare (approved budget and the worker's
   elapsed).

Statement copy is the owner's sentence, "Stop scrolling to find ideas. ContHunt watches up to 500
videos from your niche in under five minutes, checks every frame and hands you what works." (brand
spelled ContHunt, `{videos}` = `STATEMENT_VIDEOS` (500, not read from the demo data), 26 words,
five chips, *works.* in Boska italic). Edit it in
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
- Full Control (>= 1024px) opens the same demo in a modal `<dialog>` whose body (the 44px row, its
  12px gap and the simulator) is 90vw x 90vh, centred, on every desktop size (SIM-SIZE.md). The
  simulator fills it (`fill` on `DeepSearchSimulator`, `.fill` in `simulator/sim.module.css`): the
  scale is `min(1, width / 1280, height / 800)` (`--sim-fill-max: 1`, the app at its own size) and
  the canvas is the frame divided by that scale, so it grows past 1280 x 800 to the frame's aspect
  instead of zooming. The sidebar, header band and board flow into the extra space and the chat
  panel widens from 352 to at most 520 design px (a quarter of the canvas width past 1440). Measured:
  1440 x 900 is 0.94x on a 1375 x 800 canvas (5 cards per rail), 1920 x 1080 is 1x on 1728 x 916
  (6.5 cards, chat 424), 2560 x 1440 is 1x on 2304 x 1240 (all 8 cards of a rail, chat 520); the
  inline frame at those sizes is 0.99x, 1.125x and 1.2x. It opens on the tab the visitor was
  viewing: the page is locked, the board and transcript scroll freely (`scrollMode="free"`) and the
  navbar hides. Close, Esc or a backdrop click
  return to the page with focus back on the button. Inside the dialog Esc closes an open menu or
  the drawer first, then the dialog (it does not collapse the sidebar there).
- Sidebar collapse (224 to 64) is transform-only: see the header comment in `simulator/index.tsx`.
- Skeleton shimmer: blocks are static; one light sweep runs per group that is skeleton throughout
  (a rail of skeleton tiles, the loading board, a skeleton report, the open drawer's poster). It
  exists only while the frame is on screen (`data-sim-play="running"` on the frame) and never under
  reduced motion, so an offscreen frame holds no animations. A rail stops shimmering as soon as its
  tiles carry real data (a later rail: once its posters are in, see "Rails and posters").
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
- Pre-written replies (SIM-UI.md §1, `simulator/chat.tsx`): picking a next step streams its prompt
  into the composer (~650ms) and arms Send. Send (button or Enter) clears the composer, slides the
  sent bubble in, shows the working line (`status_label`, default "Reading this research", with
  the app's text shimmer, not a skeleton) for 0.9s, streams the reply in at 40 words/s as markdown,
  then shows the same three next steps again underneath. Exchanges append per tab and survive tab
  switches (a switch mid-reply completes it). While a reply runs the steps are hidden and Send is
  disabled; the transcript follows the stream unless the visitor scrolled up inside it. Reduced
  motion: bubble and whole reply at once. The reply is announced once, complete (a polite live
  region; the `role="log"` transcript is `aria-live="off"`), and focus moves to the new steps if it
  was still in the chat. Edited text, free text or a step without a reply keeps "Run it in
  ContHunt". Replies render numbered lists split by blank lines with their own numbers, and indented
  lines under a list item (detail lines, nested bullets) inside that item. The exchanges live in one module-level store keyed by search id, so the inline
  simulator and Full Control share the conversation; opening or closing the dialog mid-reply shows
  that reply complete instead of replaying it. Underscores are always text in the markdown (creator
  handles such as `@_skinbyana` read as written); use `*italic*`.
- Rails and posters (SIM-UI.md §3): the first two rails never show a skeleton. Their tiles visible
  on landing (5 per rail) render posters with `loading="eager"` and `fetchPriority="high"`; the
  rest of those two rails preload once the frame is within 1500px of the viewport, and the first
  hover warms the other tabs' first two rails. Later rails (sections 3-5 and the rubric rail) still
  mount on the first hover, click or focus; each shows CSS-only skeleton tiles (with a shimmer
  sweep) until every poster in it has loaded or failed, then reveals whole with one 250ms crossfade
  (a skeleton face over each card fades out together), never tile by tile; after 4s it reveals
  anyway and missing posters keep the face's neutral colour. A rubric change, or a filter that
  brings new videos into the rubric rail, follows the same rule; a set already loaded (a subset
  after a platform filter, a rubric seen before) reveals at once with the usual Flip.
- Hover play (SIM-UI.md §4, `simulator/tile.tsx`): a mouse resting 120ms on a real card with a
  `playback_url` mounts the muted clip; the poster stays until the clip fires `playing`, then the
  clip fades in (150ms). Leaving fades it out, pauses and unmounts it. One clip plays at a time
  across the simulator. Once the frame is live (not inert), half in view and the main thread idle,
  the first rail's first three clips prefetch at low priority, only where the primary pointer can
  hover (`(hover: hover) and (pointer: fine)`), so phones download no clips. No hover playback or
  warming under reduced motion or Save-Data; touch never starts a clip. Coming back to a tile
  within the 150ms fade-out fades the same clip straight back in.
- Video drawer (`simulator/drawer.tsx`): a real card shows its poster, creator, caption, platform,
  score and the four video metrics, then its analysis from the run (`SimVideoCard.analysis`):
  "Research findings" (one row per research question: check or dash, the question, and a
  "Present 99%" / "Absent 0%" pill, the rubric badge's probability), HOOK, SUMMARY and a short
  "Open ContHunt" block for transcript, scenes and timeline. A real card without `analysis` keeps the
  static "Full analysis in ContHunt" block; only a skeleton tile opens the skeleton layout.

## When real posters arrive

Tiles render posters with `next/image` (`unoptimized`). The frame enters the viewport by transform
rather than by scrolling, where lazy loading was unreliable, so the first two rails' landing tiles
are eager (see "Rails and posters" above) and later rails mount with their posters already loaded.
Posters are 9:16 at 360x640 WebP; clips 360x640 H.264, about 5-6s and 250KB.

## Card size

A card is 176 x 313 design px (`TILE_W` x `TILE_H` in `simulator/tile.tsx`, SIM-SIZE.md): 4.5
cards across the inline board's default visible width (sidebar collapsed, chat open: 856px = 20px
inset + 4 x (176 + 12) + about half a card). That is also its maximum: the card never grows in
design px, so a wider board (Full Control) shows more cards instead of larger ones. The anatomy
(padding 12, creator 17px, caption 15px, metrics 14.5px with 14px glyphs, badge 15.5px) is the old
140px card scaled by 176/140, well above the legibility floors. The skeleton tile
(`simulator/tile.module.css`) is drawn at the same fixed positions, measured from the real card
(creator line centred at y 218, caption lines at 244 and 264.7, metric row at 292), so a later
rail's reveal crossfade lands each bar on its text. The caption always reserves two lines
(`min-h-[2lh]`), so a card with a one-line caption lines up too.

The overlay renders smaller than that anatomy (owner, 2026-10-19: the card text read too large). The text
block, the skeleton layer and the score badge are zoomed together by `--t-s` (`simulator/tile.module.css`),
anchored bottom left, so the skeleton still lands on the text:
`clamp(0.7, 0.654 / (frame scale x tile zoom), 1)`. Desktop frames get 0.7: at the usual 1.125 frame
the creator renders at about 13px, the caption at 12px and the metrics at 10px, near the app's own card.
Smaller frames ease up so the metrics never render below about 8.5px. Tablets and phones get 1, so their
cards render as before. The select checkbox is not zoomed. Rails (`RAIL_H`), the lazy-rail
and rubric placeholders, the loading tiles and the arrow step (whole cards in view minus one: 3
inline) all follow `TILE_W` / `TILE_H`.

Phones (`max-width: 767px`) keep the 140 x 249 card they had before SIM-SIZE (about 2.4 cards at
the Board stop, the second rail peeking in): `--sim-tile-zoom` (140/176, `simulator/sim.module.css`)
zooms each tile, so its anatomy and skeleton scale together and stay matched, and `RAIL_H`, the
placeholders and the arrow step multiply by it.

On screen and against the 360x640 poster (`sizes="176px"`):

| Where | Scale | Card (CSS px) | DPR 2 (device px) | Poster |
|---|---|---|---|---|
| Inline 1280 x 800 | 0.865 | 152 x 271 | 304 x 541 | downscaled |
| Inline 1440 x 900 | 0.99 | 174 x 310 | 348 x 620 | about 1:1 (0.97) |
| Inline 1920 x 1080 | 1.125 | 198 x 352 | 396 x 704 | upscaled 1.1x |
| Inline 2560 x 1440 (largest) | 1.2 | 211 x 376 | 422 x 751 | upscaled 1.17x |
| Full Control, any size (cap) | <= 1 | <= 176 x 313 | <= 352 x 626 | never upscaled |
| Phone 390 x 844 (140 x 249 card) | 0.8 | 112 x 199 | 224 x 398 | downscaled |

At DPR 1 no card exceeds 211 x 376, so the poster is never upscaled. Only inline frames on DPR 2
screens of 1920px and wider stretch it slightly (at most 1.17x); a 480x854 poster would cover them.
