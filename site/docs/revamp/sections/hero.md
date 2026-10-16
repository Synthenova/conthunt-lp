# Section brief: `hero` (owner: Opus animation engineer)

> Updated after hero revision 4 (`hero-rev3.md`, section "Rev 4", 2026-10-16: bigger accent-colored H1, a clean pulse that
> starts on the prompt box's border and stops at the lead card's edge with no outline, a static Deep Search chip) and
> hero revision 3 (`hero-rev3.md`, 2026-10-16) and revision 2 (`hero-rev2.md`,
> 2026-10-15). Where this brief and a revision differ, the newer revision wins; the sections below
> already describe the shipped state. Rev 3: one centre line for the prompt box and the triangle,
> the offer line "Your first Deep Search is on us." (the mono badge is gone), a level connector
> beam and no right-edge fade on the board. Rev 2: full-width gutter, a fifth (and on short wide
> windows a sixth) static column, the cuelume `navigate` landing sound, the progress ring around
> the pause button instead of a pager, chart projection, a neutral prompt focus and no hover
> dimming.

Owns: `src/components/sections/hero/**`, `public/audio/**`.
References: `docs/reference/pen/UgHZX.png` (owner wireframe, the source of truth for layout),
`PnXoa.png` (more owner sketches, including the card legend: green, red overlay, yellow breakout),
`wNJzP.png` (chat input styling cue).
Data: `src/content/media/hero-prompts.json` (5 prompts × 12 real cards with score, trend,
14-point series, 6 params, keywords, poster and optional loop).

## Layout (full-bleed; this is the only non-letterboxed home section)

- Height `max(100svh, 680px)` from 1024px (`hero-board.tsx` root). The navbar floats large at top
  centre (foundation owns it).
- **One centre line (hero-rev3 A, from 1024px).** The prompt box's vertical centre and the
  triangle's vertical centre (the midpoint of its tallest column, which is the lead card's centre:
  the columns are centred on each other) sit on one line: 50svh on the first screen, or the stage
  centre (between the navbar and the platforms strip) when the window is shorter than the 680px
  minimum. The text column is a three-row grid `1fr auto 1fr` over the hero's full height
  (`hero.module.css` `.textInner`): the prompt box is the middle row; the H1 and the offer line
  hang above it (end-aligned, clear of `--nav-h`) and the subtext and CTA row below it
  (start-aligned, clear of `--strip-h`). The space above the H1 and below the CTA row is whatever
  is left. The H1 size is capped by the room in the top half (`--h1-room`), so short laptops
  scale the H1 instead of moving the box. The H1 also has its own wider measure (`--h1-w`, rev 4), so tall and
  wide screens grow it up to a clearance short of the lead card. The engine places the board on the box (`--board-dy`,
  the pre-paint script and `HeroEngine.layout()` use the same maths), so the two stay in sync even
  if a group ever outgrows its half. Measured within 0px at 1024 to 2560 wide
  (`.scratch/qa/hero-rev3/build/`).
- **Left column** (about 40% of the width; its left edge aligns to the **navbar logo's left edge**,
  the `--hero-gutter` page gutter, not the 20% letterbox edge, so wide windows have no empty band
  on the left):
  1. H1, bold display, from the owner's sketch: "Search & analyze *viral* social videos".
     Boska italic on "viral", as a slowly drifting five-hue gradient (`.viral`: pink, orange, gold, purple, blue; 9s loop; static under reduced motion; rev 9). Three lines, at 57 to 134px on desktop
     (rev 4: wider measure, line height 0.92), 56px at 390 wide. (The mono badge that sat above it was removed on
     2026-10-16: "remove this".)
  2. The **offer line** (hero-rev3 B, OWNER_DECISIONS C18): "Your first Deep Search is *on us.*",
     the prompt box's lead-in and the page's hook. Switzer 500 in ink at `--offer-fs` (18→24px),
     (no icon: the 3D gift of rev 6 was removed in rev 9) and Boska 500 italic on "on us." (no other heading uses
     that word). More prominent than body copy, subordinate to the H1; never a badge or pill. The
     textarea's `aria-describedby` includes it (`#hero-offer`) and the submit button's name is
     "Try your niche". Transform-only rise (`.riseT`), so it is painted on the first frame.
     Rev 8: the line ends with a "Try it ↓" button (accent, same size and weight, the arrow nudging down on a slow
     loop; static under reduced motion) that focuses the prompt textarea with `preventScroll` and so runs the box's
     focus behaviour. One line on desktop (the line may run as wide as the H1, `--h1-w`); on stacked layouts it wraps.
  3. A **modern chat input box** (white paper card, 14–16px radius, soft shadow, hairline border).
     The text area shows the current prompt. Under it is a row with one static `Deep Search` chip (rev 4: a
     non-interactive span styled as a toggle switched on, `bg-accent/10`, accent, semibold; no `Search` mode, no
     `mode` param) and a round ink submit button with an arrow.
     - Prompts rotate every 6s. The text change is itself a split-flap or vertical-roll animation
       in the same family as the board. It must be tasteful, not a typewriter gimmick.
     - Focus is **neutral**, never blue (hero-rev2 E): a firmer 1px ink ring and a deeper, softer
       lift on click; keyboard arrival adds a clear ink ring (WCAG 2.4.7).
     - When the user focuses or types, rotation pauses and their text is kept. Submit, or Enter,
       goes to `GET_STARTED_URL` with `?q=<encoded prompt>`. Read `src/lib/links.ts`; if it has no
       query support, append `q` anyway and note it.
  4. Subtext with **inlaid chips** (owner sketch): "Search through `7 platforms` across
     `104,862 niches` and over `10,384,719 videos` updated daily (owner figures, 2026-10-16, OWNER_DECISIONS C1)." The chips are pill-highlights
     (surface fill, mono numerals, `tabular-nums`) that count up once on load.
     - The owner wrote these numbers. Check the platforms count against
       `src/content/site/platforms.ts`. If the legacy list has fewer platforms, keep the owner's
       number but add the mismatch to your report.
  5. A row with a primary `Get started` button (ink) and the sound toggle (see Sound), right after it.
     (Rev 5: the `See how it works ↓` link was removed on the owner's word; `#how-it-works` stays as an
     anchor target.)
- **Right side, the triangular staggered grid:**
  - Columns hold **1, 2, 3, 4** cards from left to right. Each column is vertically centred, so
    the silhouette widens like a triangle.
  - **Wide windows add static columns** (`hero.module.css` `.colStatic`, `.colStatic2`; data in
    `STATIC_COLUMNS`). From 1280px, when the stage is wider than 21:20, a **5th column of five
    static cards** appears; on short, wide stages (7:5 and wider) a sixth column of four follows,
    so the silhouette tapers 1, 2, 3, 4, 5, 4. Static cards are the lowest tier (low scores,
    declining or flat charts), posters only: no flipping, no score ticking, no hover turn, no
    focus stop. Supported up to 2560px wide. Tall stages keep four columns.
  - The last visible column bleeds off the right viewport edge (partially cut, as in the sketch)
    and is **hard-cut** by the viewport edge: the right-side fade was removed (hero-rev3 C). The
    stage keeps its soft top and bottom fades (a 22px mask) where the tall columns overflow.
  - The single leftmost card is the top scorer (about 97%, **breakout gold**). Scores fall to the
    right. Mix green growth and red decline as the data says.
  - Cards are portrait (3:4 or 4:5, cropped cover from the 9:16 posters) with 14px radius. The
    gutter between cards is about 12–14px and between columns about 16px. The leftmost card may
    be slightly larger; keep the rhythm clean.
- **Connector:** an SVG path from a port on the input box's right edge to the left edge of the
  first card. Both ends sit on the centre line, so it is one level run along it (hero-rev3 A); if
  the board offset is ever clamped it bends into a gentle S. Hairline ink at 25% opacity. Rev 4: it starts
  on the prompt box's outer border and ends on the lead card's left edge (no port dots, butt joints); the accent
  pulse runs it and stops, with no outline or flash on the card and no submit-button press.

## Card face

- Poster (or loop for ranks 1–3 once flipped in, played through the shared `VideoTile` /
  media manager).
- **Top-right:** the search score as `97%` in a small paper chip with mono numerals.
- **Bottom 40%:** a semi-transparent area chart of `series`. The fill is a gradient of the trend
  colour at about 30% solid (hero-rev2 C), with a 1.5px line in the trend colour. The line ends
  before the card's right edge at an end-point dot; from there a **dotted projection line** runs to
  the edge, extrapolating the trend (breakout keeps surging, growth climbs, decline keeps falling),
  over a paler area (45% of the main fill). The draw-in draws the actual part first, then the
  projection.
  - **breakout** is gold (`--breakout`, with a soft glow on the line end-point dot);
  - **growth** is green; **decline** is red.
- **Growth label (hero-rev5; replaces the standalone Breakout / Growing / Declining legend):** every
  card face carries a small paper chip with a dot in the trend colour and the trend's name in mono
  caps (BREAKOUT, GROWING, DECLINING) in the matching ink token (`--breakout-ink`, `--growth-ink`,
  `--decline-ink`), in the bottom-RIGHT corner over the chart. It is face content (`card-parts.tsx`
  `.trendTag`), so the split-flap wave carries it and the engine repaints its text with the card
  (`paintFace`). The right-most visible column, the one the viewport edge cuts, carries it bottom-LEFT
  instead (`hero.module.css`: `.col:nth-child(4 | 5 | 6)`, chosen by the same container queries that
  show the fifth and sixth columns), so it is never clipped. Static columns have it too. The hint above
  the lead card is one line on desktop ("Hover a card to see why it scored", right-aligned to the card;
  the stage reaches 260px further left as padding so its fade mask does not cut it).
- Optional tiny bottom-left label: platform glyph + views in mono. Keep it minimal; the owner
  said "pretty simple".

## Flipboard wave (the signature; make it *satisfying*)

Every 6s, in this order: the prompt changes → a single accent
**pulse** (a lit core with a short trail and a soft glow, `getPointAtLength`, 0.7s) runs the connector from the
prompt box's border to the lead card's edge and stops there (a 0.14s fade, no flash or ring on the card) → the
**split-flap cascade** starts as it arrives.

- **Real split-flap mechanics** (Solari / derby race board). Each card is split at its
  horizontal midline into a top and a bottom half.
  1. The top half of the OLD face hinges down (`rotateX` 0 → -180, perspective about 900px,
     backface hidden, slight shading gradient as it falls).
  2. This reveals the top half of the NEW face behind it.
  3. The falling flap's back is the bottom half of the NEW face, landing over the old bottom.
  4. Add 1–2 fast intermediate flaps through random spare posters before the final one, as a
     real board cycles through characters. Use about 70ms per intermediate flap and about 160ms
     for the final, with a tiny settle bounce.
- **Stagger:** a wave from the first card outward, column by column (top to bottom within a
  column), at about 55–80ms per card, so it reads as synchronised but cascading.
  Total wave ≤ about 1.4s.
- The score chip ticks to the new value as the flap lands. The chart redraws its line
  (DrawSVG) and the fill fades in.
- Pause the loop when the hero is offscreen or the tab is hidden.
- Cards wholly outside the viewport (the board sits below the fold on phones) land without
  the flap, in sync; only on-screen cards run the wave (engine.ts `visibleSlots`).
- **Cycle progress ring (hero-rev2 D).** The five-dash "example prompts" pager is gone. A thin
  circular stroke wraps the pause button and fills over the 6s cycle in sync with the engine's real
  cycle clock, resets when the prompt changes and freezes when paused (or while rotation is held for
  focus or typing). Reduced motion follows the 8s crossfade cycle.

## Sound

- One subtle **cuelume `navigate`** cue (default theme, a soft paper or card whoosh) per card
  **landing** (`flap-sound.ts`). It replaced the synthesized clack (hero-rev2 B). Intermediate fast
  flaps are silent. Plays closer than 45ms apart are dropped, and each play varies its direction
  and level a little (about +/-8%) so a cascade reads like riffled cards. Per-play volume is about
  0.5, on top of the global cuelume volume.
- Gates: the site-wide sound preference (`src/lib/sound.ts`, shared with the navbar toggle, saved in
  localStorage, **on by default** but silent until the first click or key press), auto-mute when
  less than 45% of the hero is visible or the tab is hidden. Muting cancels every pending landing
  timer.
- The speaker toggle reads "Sound off" or "Sound on".

## Hover: card flips to show "how did this card get that score?"

- Hovering a card turns only that card: there is no pale overlay or dimming on the other cards
  (hero-rev2 E).
- Hovering (or focusing) a single card does a 3D Y-axis flip (about 0.6s, ease ch.out) to its
  **back**:
  - a **hexagon radar** of the 6 params (Hook, Relevance, Engagement, Velocity, Trend fit,
    Audience) with axis labels in tiny mono;
  - the total score;
  - 2–3 keyword chips;
  - one short line such as "Scored on 6 signals".
  - Make it legible at card size. Abbreviate axis labels if needed (HOOK, REL, ENG, VEL, FIT, AUD).
- Rev 7: the back is exactly the front's box (no lift scale; a hairline and a faint contact shadow only), so it sits flush in the
  grid. Only a card the viewport or the stage fade clips (column 4) slides just far enough to be read.
- If a wave hits a card while it is flipped, that card does **not** split-flap. It **pops**
  (scale 1 → 1.06 → 1 with a ring) and its back updates in place: the radar polygon morphs to
  the new values and the numbers tick. When hover ends it flips back to the new face.
- Touch devices: tap to flip and tap again to return.

## Below the fold edge: platforms covered (retained)

A slim full-bleed strip at the hero bottom: a mono caption (`COVERING`) plus monochrome platform
logos from `src/content/site/platforms.ts`. Use the `simple-icons` SVGs (add the package; never
hand-draw logos). The strip is a slow marquee if it overflows; it is static under reduced motion.

## Responsive and accessibility

- Below 1024px: text first (H1, offer line, prompt box, subtext, CTAs), then the grid scaled down
  (show columns 1–3; the 4th is hidden). No centre-line rule.
  Below 640px: a compact 1+2+3 triangle at about 70% scale, still animated.
- The grid is `aria-hidden` decorative with an `sr-only` summary. The rotating prompt region is
  `aria-live="off"`. Pause rotation on hover or focus of the input.
- Reduced motion: no split-flap and no beam. Prompts crossfade every 8s, cards crossfade, and
  hover shows the back without 3D rotation.
- Performance: transforms and opacity only, so frame time stays under 16ms. At most 3 videos
  playing in the hero. Lazy-load posters beyond the first prompt set; preload the next set's
  posters just before each wave.

## Load performance (w6)

- The offer line, the prompt box and the subtext use a transform-only rise (`.riseT`), so they are painted on the
  first frame: a fade from opacity 0 made the subtext a late LCP behind hydration. The CTA row
  keeps the fade. The offer line adds no font face: Switzer 500 and Boska 500 italic are already
  preloaded on Home. Entrance animations use `fill-mode: backwards` (same look, and finished
  animations release their compositor layers).
- The engine is built in an idle task right after hydration (`hero-board.tsx`), not inside the
  hydration commit. The pre-paint script has already placed the board and the intro waits 0.35s.
- `<link rel="expect" href="#hero-parsed" blocking="render">` (hero `index.tsx`) holds the first
  paint until the whole hero is parsed, so a slow parse can never paint a half-built board.
