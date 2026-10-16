# Hero revision 3 (owner feedback, 2026-10-16)

Status: shipped

## Owner's words (verbatim)

> "The header section requires some cleanup. I just feel like it's not centered yet. There's just too much gap above the title, and one important line is missing: "Your first Deep search is on us." That is exactly what would make the user click and try their niche or something. That should be focused on.
>
> The right side stack of the videos also need to be centered. The ideal for the exact viewport center should be maintained by the left text input and the triangular grid that we have built on the side. When they are in sync, the other elements can be placed above and below to fill them.
>
> Also, let's lose the right side alpha blur on the cards. The top and bottom make sense, the right side doesn't."

Earlier the same morning (hero-rev3 G in `simulator-fullsize.md`): the mono badge
`DEEP SEARCH · 500 VIDEOS IN < 5 MIN` above the H1 was removed ("remove this").

## Specs (desktop and laptop, >= 1024px)

### A. One centre line
- The hero has one horizontal **centre line** at the exact vertical centre of the viewport (50svh on
  the first screen; if the hero is taller than the viewport because of its 760px minimum, use the
  hero stage's centre).
- Both anchors sit on that line:
  1. the **prompt box** (the chat input card): its vertical centre is on the line;
  2. the **triangular grid**: the triangle's vertical centre, the midpoint of its tallest column, is on
     the line. Columns are already centred on each other, so the whole board moves as one.
- Every other element hangs off those anchors:
  - **above the prompt box**: the H1, then the new offer line (B);
  - **below the prompt box**: the subtext with the inlaid chips, then the CTA row (Get started, See how
    it works, the sound toggle).
- The space above the H1 and below the CTA row is whatever is left, so the "too much gap above the
  title" goes away. Use a structure that keeps the prompt box centred whatever the text heights: for
  example a three-row grid `1fr auto 1fr` with the top group aligned to the end and the bottom group
  to the start, or a measured offset. Never use magic numbers per breakpoint.
- The lead card (column 1, the single top scorer) now sits on the same line as the prompt box. Keep the
  connector beam from the prompt box's right edge to the lead card's left edge correct and good
  looking. It is now nearly level, so a straight run or a very gentle curve both work; make it feel
  intentional, and keep the light orb, the contact flash and the wave.
- Check that the board's tallest column, under its top and bottom fades, never collides with the
  navbar or the platform strip. If it does, scale the card size (the existing clamp) rather than
  moving the centre.

### B. The offer line: "Your first Deep Search is on us."
- Copy, verbatim apart from the product name's casing: **"Your first Deep Search is on us."**
- It is the hook that makes a visitor type their niche, so give it focus. Place it directly above the
  prompt box, between the H1 and the input, as the input's lead-in. Make it clearly more prominent than
  body copy but subordinate to the H1. Options to choose from by eye:
  - a medium-weight `body-l`/`h5` line in ink;
  - Boska italic on *on us*, but only if no other heading on the page already uses that italic word;
  - a small leading mark such as a gift glyph from lucide or a tiny accent dot.
  Do not use a badge or pill, since the owner just removed one.
- Tie it to the action: the prompt placeholder or the submit button's accessible label can echo it, for
  example "Try your niche". The Enter and submit behavior is unchanged
  (`GET_STARTED_URL?q=<prompt>`).
- Add it to OWNER_DECISIONS.md as **C18** (an owner-supplied claim: confirm that the free starter
  credits cover one full Deep Search).

### C. Board edges
- Remove the **right-side** alpha fade (mask) on the board. The last visible column is cut cleanly by
  the viewport edge.
- Keep the **top and bottom** fades exactly as they are.

### D. Other sizes
- **1024 to 1279px:** apply A to C (the same centre line with four columns).
- **Below 1024px** (text first, then the grid): keep the stacking. Add the offer line above the prompt
  box. There is no centre-line rule. Check 820 x 1180 and 390 x 844.
- **Reduced motion:** the same layout with static states.
- **Performance:** the hero paragraph and prompt box stay painted on the first frame (transform-only
  rise, `.riseT`). Add no new web fonts or faces beyond those already preloaded on Home: Switzer
  400/500/600/700 and Boska 400/500 italic.

### E. QA
Viewport screenshots at 1280 x 720, 1440 x 900, 1680 x 1050, 1920 x 1080, 2048 x 1152, 2560 x 1440,
1024 x 768, 820 x 1180 and 390 x 844. At each desktop size, overlay a 1px line at 50svh (in the
screenshot tooling only) and confirm that both the prompt box's centre and the triangle's centre sit on
it within 2px. Confirm that the H1 doesn't wrap awkwardly, that the beam looks right, that the right
edge is hard-cut with the top and bottom fades intact, and that the offer line reads as the hook.

## Rev 4 (owner follow-up, 2026-10-16)

### Owner's words (verbatim)

> "Make use of the whitespace and increase the hero header size, and add color to the word 'viral'"
>
> "When the blue pulse beam hits the first card, it gets a blue outline. That is unnecessary. Just ensure that the pulse goes from one end of the vector to the other and it just stops. The pulse start line should be the outer border of the search box, it shouldn't start from the submit button. So that connection needs to be handled a little bit cleanly."
>
> "imagine Deep Search is a toggle, like a click toggle. Either I unclick it where it is grayed out, or I click it, and then it's a little bit colorful and bold. I want it to be a toggle like that, but again, it doesn't need to be toggleable, because we want the users to only try Deep Search. So let it just exist as a button that does nothing."

### What changed
- **H1 size.** The H1 has its own measure (`--h1-w` = text column + connector gap - 1.75rem), so it may run
  past the prompt box's right edge, up to a clearance short of the lead card's left edge (nothing else
  sits in that band). `.textInner` has `grid-template-columns: minmax(0, 1fr)`, so the wider H1 never
  widens the box. Size = min(`--h1-room`, `--h1-w` / 5.75, 9.5rem). Line height 0.92 (was 0.95); the offer gaps
  are 0.62 x `--gap-y` (were 0.9 and 0.75); the `--h1-room` slack is 2px (was 4). Still three lines, no
  orphan. 1440x900 is bound by the 450px top half (`--h1-room`); 1920 and up are bound by the measure.
  Below 1024px the H1 is `min(100vw - 40px, 640px) / 6.2`, max 5.5rem.
  Sizes (before to after): 1280x720 52.8 to 57.3; 1440x900 75.7 to 82.9; 1920x1080 81.3 to 113.3;
  2560x1440 96 to 134.3; 1024x768 61.1 to 66.1; 820x1180 59 to 88; 390x844 44.5 to 56.5.
- **"viral"** is `text-accent` (solid, still Boska 500 italic).
- **Beam.** The outline ring and the flash on the lead card are gone (`contact()`, `.flash` and
  `[data-flash]` removed; the ring element remains only for the pop of a turned card). The submit-button
  press is removed from the cycle. The port dots at both ends are removed. The line starts on the prompt
  box's outer border (box right edge + 1px, where its hairline ring ends) and ends exactly on the lead card's
  left edge: a level run on a pixel row, butt joints, no overlap. One pulse (the orb with a 64px trail,
  `BEAM_SECONDS` = 0.7, power2.inOut) travels from the box's border to the card's edge (its core touches both),
  then fades in 0.14s in place; the split-flap wave starts at its arrival. The glow is clipped to the run
  between box and card (`#ch-hero-run`). Intro: the base line draws 0.6s, then the pulse. Reduced motion
  unchanged (static line, no pulse).
- **Deep Search chip.** The two-option segmented control, the `mode` state, the roving-radio keyboard logic and the
  `mode` query param are gone. One `<span aria-hidden>` chip (ScanSearch icon + "Deep Search") styled like the How
  it works "Deep Research" chip: `bg-accent/10`, accent icon and text, semibold, h-8, radius 10. No role, no tab stop,
  no hover change, cursor default; it is not a button, so the delegated sound bindings ignore it. The mode is
  exposed once: `#hero-mode` (sr-only "Deep Search mode") is in the textarea's `aria-describedby`. Submit always goes to
  `GET_STARTED_URL?q=<prompt>`.
- QA evidence: `.scratch/qa/hero-rev4/` (final-*, beam-*, chip-*, geometry-final.txt). Centre line within 0.1px at
  1024 to 2560.

## Rev 5 (owner follow-up, 2026-10-16)

### Owner's words (verbatim)

> On the "See how it works" link in the hero CTA row: "remove this"
>
> "And show that the hover instruction is in a single line. Instead of removing the legend that shows breakout, growing, declining, let's add that into the videos at the bottom right corner on the right with the same color scheme. Let's put the legends there. For the last row, let's just put the legends on the left bottom side. Again, it's not the legends, but rather the labels for that specific growth."

### What changed
- **CTA row:** the "See how it works" link and its `ArrowDown` import are gone; the row is Get started, then the sound toggle (no `ml-auto`).
  `#how-it-works` is untouched.
- **Hover hint:** one line on desktop at every width (nowrap, 9 to 10.5px by viewport). It is wider than the lead card, so it hangs from the card's
  right edge and runs back over the band above the connector. `.stage` got `--stage-bleed` (260px) as left padding so its fade
  mask no longer cuts the hint (the content box, so `cqw`, `cqh` and the container's aspect, is unchanged); `.stage` passes clicks
  through and only `.slot:not(.slotStatic)` takes them. Below 1024px the hint wraps as before.
- **Growth labels:** the legend list and its CSS are deleted. Each face has a `.trendTag` chip (paper, 6px dot in the trend colour, mono caps in
  `--breakout-ink` / `--growth-ink` / `--decline-ink`), bottom-right, sized by container query (8.5px up to 140px cards, 10px, 11px
  on the lead card, 11.5px from 200px). The engine's `paintFace` writes the new text on landing, so a flap carries it.
  Static columns carry it from their data. Reduced motion shows it too (it is plain face content).
- **Right-most column on the left:** `.col:nth-child(4)` (four columns), `(5)` (five) or `(6)` (six) puts the chip bottom-left, switched by the
  same container queries as the static columns, so it follows resizes with no JS. Measured at 1024, 1280, 1440, 1920, 2560 (and 1920x950,
  2048x1000): the cards whose right edge passes the viewport are exactly the ones with left labels, and no label crosses the edge. At 390 no card is
  cut, so all labels stay right.
- QA: `.scratch/qa/hero-rev5/`. Centre line unchanged (0.0px at 1024 to 2560).

## Rev 6 (owner follow-up, 2026-10-16)

### Owner's words (verbatim)

> "Can you actually add some more gap between the header and the first "Deep search is on us"? And then add some more gap below the subtext or the subtitle and the Get Started button. I've also shown this as a diagram. The blue lines basically indicate the gap that's needed. So ultimately, the header should move a little to the top and the Get Started should move a little to the bottom."
>
> "This GIFT logo is bad. I want something like an actual glossy 3D icon vibe across for this logo."

### What changed
- **Gaps** (fluid, from `--gap-y`): `--offer-gap-top` = 1.2 x gap-y + 4px (H1 to offer), `--cta-gap` = 1.95 x gap-y (subtext to CTA row), `--offer-gap-bottom` 0.62 to 0.5 x gap-y (the offer sits a bit closer to its box so the H1 loses less size). The prompt box stays on the centre line (centre = innerHeight/2 at every size). The H1 cannot move up (navbar clearance), so its size comes from `--h1-room` and drops slightly.
  Box-to-box gaps and H1 size, before to after:
  1280x720: H1 to offer 6.4 to 19.8, subtext to CTA 18.2 to 30.9, H1 57.3 to 53.3px;
  1440x900: 13.4 to 35.0 (+21.6), 34.1 to 57.9 (+23.8), H1 82.9 to 76.6px;
  1920x1080: 13.0 to 36.0, 36.8 to 62.4, H1 113.3 to 106.6px;
  1024x768: 6.5 to 20.6, 19.4 to 32.9, H1 66.1 to 61.9px;
  390x844: 13.9 to 34.0, 32.0 to 54.3, H1 unchanged at 56.5px.
- **3D gift:** generated with Infiknit. `infiknit-nano-banana-2-1` is not in the model list, and the Nano Banana 2.1 routes (`fal-nano-banana-2-1`, `kie-nano-banana-2-1`) reject `transparentBackground`, so I used `gpt-image-2.5-flare` (OpenAI, transparent background supported), 4 variations, 1:1, request `conthunt-hero-gift-3d-rev6-002`. Take 3 was picked (symmetric cube, cobalt box, magenta ribbon and bow, true alpha, so no cut-out needed). It was trimmed to a square and exported as `public/media/hero/gift-3d@2x.webp|png` (64px) and `@3x` (96px); the sources are in `.scratch/gen/gift/`. Rendered in a `<picture>` with an explicit 32x32 `<img>` (CSS size = 1.4 x `--offer-fs`, 25 to 34px), `aria-hidden`, `decoding="async"`, margin-block that keeps the offer line height unchanged (so no shift and `--h1-room` is unchanged). Vertically centred on the text to 0.01px. The lucide `Gift` import is gone.
- QA: `.scratch/qa/hero-rev6/`.

## Rev 7 (owner follow-up, 2026-10-16)

> "And sure that when hovered over a video, the flipped side of the video should be the same size as the video. But right now, it's a little bit bigger, and that is kind of awkward because the shadows don't fit well with the grid. So ensure that they are at the same size."

Cause: `HeroEngine.turn()` scaled the `.lift` wrapper to 1.1 (`LIFT`) while the card turned, and `.backCard` carried a 28px-blur drop shadow that spilled onto the neighbours. Fix: no lift scale (the `LIFT` constant is gone), the back's shadow is a hairline plus a faint negative-spread contact shadow, and `edgeShift()` now moves a card only if it is actually clipped (the cut right column, the top and bottom overrun of column 4), by the minimum needed. The wave pop (1 to 1.06 to 1) stays and settles at exactly 1 (ring opacity 0).
Measured (back at hover vs the card's rest box, max difference): 1440x900 lead card 0.00px and column-3 card 0.00px; 1920x1080 lead 0.00px, column-3 0.00px. A column-4 card that the stage clips still slides into view by design. Touch tap at 390x844: the back is 117.02 x 146.28 at (20, 200.44), identical to the rest box. QA: `.scratch/qa/hero-rev7/`.

## Rev 8 (owner follow-up, 2026-10-16)

> "Add "Try it" at the end with a down arrow"

The offer line now reads [3D gift] Your first Deep Search is *on us.* Try it (down arrow). "Try it" is a real `<button>` named "Try it: focus the prompt" (so the site's tap sound applies): it focuses `#hero-q` with `preventScroll`, which runs the box's own focus behaviour (rotation pauses, the example is inserted and selected). Styled `.offerCta`: accent, the offer's size and weight, a faint accent hover tint, an accent focus ring; the arrow (`ArrowDown`) nudges 3px down every 2.4s, held by the pause control (`--hero-loop`) and `animation: none` under reduced motion. Its padding is cancelled by negative margins, so the line height is unchanged. Desktop: `.offer` is `--h1-w` wide and nowrap (a 440px box would have wrapped it at 1440 and pushed the box off the centre line); measured box centre = innerHeight/2 at 1024, 1280, 1440, 1920, 2560. At 390 it wraps and "Try it" drops under the claim. QA: `.scratch/qa/hero-rev8/`.

## Colour pass (2026-10-16, COLOR_SYSTEM.md "Hero")

*viral* is `text-pink` (3.40:1, display size, matches the gift's ribbon). The count chips take a `tone` prop (`count-chip.tsx`, `toneSoftBg` + `toneInkText`, no border): "10 platforms" blue (5.76:1), "100,000+ niches" purple (4.98:1), "10,000,000 videos" pink (4.89:1). The Deep Search chip, the beam, "Try it", the offer line, the CTAs and the card data colours are unchanged. QA: `.scratch/qa/hero-color/`.

## Rev 9 (owner overrides of the colour pass, 2026-10-16)

> "In the hero section, the word "viral" is red. I don't want it to be red. I want it to be a multicolored gradient that just keeps moving, like rainbowish colors, but then choose limited colors, keep it moving and keep it a little bit animated.
> Let's lose the gift icon and then ensure that "try it" is basically the same color as the text. So, "Your first Deep search is on us. Try it." It's just a single line, and then we have this down arrow. That's it. No multicolor there.
> In the hero section, we have these chips which say "10 platforms, 100,000 niches, and 10 million videos." Put all of them into the same colors. There is no need to change that. For now, I want it to basically show some more random numbers. Let's call it "Search through seven platforms across 100K something." Give a random number, remove the plus, and then put "10 million videos as 10 million something." Don't keep it a perfect round number."

- *viral*: `.viral` is a `background-clip:text` gradient (pink, orange, a deepened gold, purple, blue, back to pink; a 7em tile drifting exactly one tile per 9s, linear, so the loop is seamless), with inline padding and an equal negative margin so the italic's overhang is not clipped. Static under reduced motion, held by the pause control.
- Offer: the gift image, its CSS and the four `gift-3d@*` files are deleted. "Try it" is `color: inherit` (ink); hover only draws a 1px underline; the arrow nudge and click-to-focus are unchanged. One line at 1280, 1440, 1920 and 390.
- Chips: back to the neutral surface style, the same for all three (the `tone` prop is removed). Figures: 7 platforms, 104,862 niches, 10,384,719 videos (`HERO_STATS`); OWNER_DECISIONS C1 updated.
- Centre line: box centre = innerHeight/2 within 0.01px at 1280, 1440, 1920. QA: `.scratch/qa/hero-rev9/`.

## A11y fix (label-in-name), 2026-10-16

Each board card is now a plain `div[data-slot]` (hover and tap target) holding a visually hidden native `<button data-hit>` whose own text is `describeCard()` (no aria-label, so the name is its content and axe's label-content-name-mismatch cannot fire); the visual subtree stays `aria-hidden`. Focus, Enter and Space turn the card, Escape turns it back, the arrow keys rove (one tab stop), and `:has([data-hit]:focus-visible)` draws the ring. The engine updates the button's text and `aria-pressed` per wave and flip. axe (wcag2a, 2aa, 21a, 21aa, 22aa, best-practice) at 1440x900: 0 violations. At 390x844: color-contrast in the statement section and scrollable-region-focusable in another section, none in the hero (`.scratch/qa/hero-a11y/`).


## Rev 10 (owner follow-up, 2026-10-16) — status: shipped

### Owner's words (verbatim, with their screenshot of the intended spacing, 1630x915)

> "Small adjustment, this sort of spacing is what I expect from the hero section, currently the space looks too cramped.
> For the first free deep search we offer 50 videos only across 5 searches
> Deepsearch buton inside the promptbox should be in black with white text and icon
> As you see in the image the "first deepsearch" lines is removed in that image, instead add it to the subtitle of the hero section. "Deep Search analyzes videos frame by frame and provides the info that most of us miss. Your first Deep Search is on us. Try it <up arrow>"
> the flip animation timing between columns must be increased by 100% the current timing difference."

### Fact: "your first Deep Search" = 50 videos across 5 searches
The free first Deep Search is 50 videos spread over 5 searches, not a 500-video run. Applied: the typing hint beside the submit button
(`DEEP_HINT`) said "500 videos · < 5 min" and now says "50 videos · 5 searches". The subtitle makes no size claim (it says "Your first Deep Search is on us."),
and its Deep Search sentences stay the owner's words. Copy elsewhere in the repo that describes the paid Deep Search as 500 to 1,000 videos is a
separate product statement and is not changed here (the list of places is in the Rev 10 report; OWNER_DECISIONS C18 still says "covers 500 videos").

### What changed
- **Offer line removed; its words moved into the subtitle.** The paragraph under the prompt box is now: "Search through [7 platforms] across [104,862 niches] and over
  [10,384,719 videos] updated daily. Deep Search analyzes videos frame by frame and provides the info that most of us miss. Your first Deep Search is on us. Try it ↑".
  "Try it" is the old rev 8/9 button (focuses `#hero-q` with `preventScroll`, which runs the box's focus behaviour), now inline, in the paragraph's own colour,
  with an `ArrowUp` (`.subCta`, `.subArrow`; the nudge goes up, still held by the pause control and off under reduced motion). The Deep Search sentences carry
  `#hero-offer`, so the textarea's `aria-describedby` still includes them. `.offer*` CSS and the `ArrowDown` import are gone.
- **One calm paragraph.** Each chip is wrapped with its lead-in word (`Search through [chip]`, `across [chip]`, `over [chip]`) in a nowrap span, so a wrapped line never
  starts on a lone chip. Chips are 1.35em tall (was 1.5em) inside leading 1.62, so stacked lines keep clear air. Desktop width is `--h1-w` (as wide as the H1, 28px short of the lead card; was the 440px
  box width, which made it 5 lines), font `min(1.25rem, max(1rem, 2svh))` (16px at 800 tall, 18px at 900, 20px from 1000); stacked layouts keep body-l (18 to 20px) at 36rem.
  4 lines on every desktop size checked at 1280 to 1920 wide, 6 to 7 at 390x844.
- **Spacing.** Measured on pixels (ink to ink) against the owner's screenshot at 1630x915:

  | gap | owner | before | after |
  |---|---|---|---|
  | top of window to H1's first line | 137 | 102 | 137 |
  | H1 to prompt box | 61 | 94 (the offer line stood between) | 62 |
  | prompt box to subtitle | 35 | 40 | 35 |
  | subtitle to Get started | 58 | 65 | 57 |
  | lead card centre vs box centre | same | same | same (457.5) |

  Box-to-box values, before to after (H1 to box, box to subtitle, subtitle to CTA): 1630x915 80.9 (H1 to box, with the offer line between) / 30.2 / 58.9 to 49.7 / 27.2 / 51.3; the H1 grows from
  78.5 to 77.3px (it was bound by the room above the box, which the offer line used to share; it is now bound by the nav and `--h1-air`). The three gaps are fluid, from `--gap-y`:
  `--h1-gap` 1.8x, `--sub-gap` 0.9x, `--cta-gap` 1.7x, `--h1-air` (navbar to H1) 1.15x; they are smaller than the ink gaps because the H1's line masks and the
  paragraphs' half-leading add 5 to 8px. `--h1-room` now subtracts `--h1-air` and `--h1-gap` instead of the offer line and its two gaps. `.textBottom` keeps `--strip-h` plus
  0.8 x `--gap-y` of air above the platforms strip. Short windows (max-height 820) use `--gap-y: clamp(0.875rem, 2.6svh, 1.25rem)` (was 2.2svh) so the gaps stay open there.
  Centre line (box centre = lead centre = 50svh): 0.0px at 1024x768, 1280x720, 1440x900, 1630x915, 1920x1080 and 2560x1440. The beam still runs from the box's border to the lead card.
  Clearances at the bottom (Get started to the strip top): 27px at 1280x720, 48 at 1024x768, 74 at 1440x900, 78 at 1630x915, 146 at 1920x1080, 358 at 2560x1440; nothing touches the navbar (the H1 starts at least 26px below it).
- **Deep Search chip:** `bg-ink text-paper`, icon inherits white: #0f0f0f on #ffffff is 19.17:1 (text and icon). Still a `span`, `aria-hidden`, no `tabindex`, no hover or press styles (verified: not in the Tab order).
- **Wave:** `STAGGER` 0.065 to 0.13 in `engine.ts`. `visibleSlots()` is `COLUMNS.flat()`, i.e. column by column ([0], [1,2], [3,4,5], [6,7,8,9]), so doubling the per-card step doubles every column-to-column
  gap. Measured (a real `goTo`, hooks on `arrive` and `land`, 1630x915, 1920x1080 and 1280x720 agree within 5ms): column starts 0, 66, 193, 387ms before, 0, 126, 387, 781ms after; first card to last card start
  0.585s to 1.17s; first card to last landing 0.95 to 1.0s to 1.61s (the flaps themselves are unchanged: 70ms, 70ms, 160ms and the settle); the cycle timeline (beam, contact, wave) 1.57s to 2.15s. The chart
  draw-ins end about 1.1s after each landing, so the last card is done about 2.7s after the first lands, about 3.7s after the cycle starts, inside the 6s `CYCLE_SECONDS`: the next wave cannot start before this one ends.
  `flap-sound.ts` is unchanged (it drops plays closer than 45ms; the step is now 130ms, so no landing is dropped), the trend labels and score tick are painted in `land()` on the same timeline, a flipped card still pops instead of flapping,
  reduced motion has no wave (its 0.5s crossfade is untouched). The "~9s" note in `hero.module.css` is the LCP time the first wave once had under throttling, not its length; the comment now says so.
- QA: `.scratch/qa/hero-rev10/` (`measure.cjs`, `wave.cjs`, `checks.cjs`, `bands.py`, before and after screenshots at the eight sizes, `compare-1630x915.png`). axe (wcag2a, 2aa, 21a, 21aa, 22aa, best-practice, scoped to the hero section) at
  1630x915 and 390x844: 0 violations (the color-contrast rule is "incomplete" on both: the board's video posters; the text and chip contrast were computed by hand).

## Rev 11 (owner's corrections, 2026-10-16)

- **H1:** `font-weight` 700 to 500 (the "viral" `Emphasis` is unchanged). Desktop size scaled by 100/110.62: divisor 5.75 to 6.36, cap 9.5rem to 8.6rem, `--h1-room` untouched (it still binds on short or low windows: 77px at 1630x915, 75px at 1440x900, 55px at 1280x720). The owner's 100px is the width-bound size, reached from a tall window: 100.0px at 1790x1080 (`--h1-w` 636px, `--gap-y` 32px). Stacked size unchanged (56.5px at 390).
- **Subtitle:** only "Search through [7 platforms] across [104,862 niches] and over [10,384,719 videos] updated daily." The Deep Search sentences, "Try it" and its arrow (`.subCta`, `.subArrow`, the nudge keyframes) are gone.
- **Offer line:** new, first in `.textBottom` (so the box stays on the centre line). "Your first search is on us, for free. Try it now." in the `.hint` face (`font-family: var(--font-mono)`, uppercase, tracking 0.03em from 1024px and 0.04em below, `--ink-soft` 5.3:1) at 2x its size: `calc(2 * clamp(9px, 0.5vw + 3.5px, 10.5px))` from 1024px (18px at 1024, 19.8 at 1280, 21 from about 1300), 21px below. `<div .offer>` (size container, the box's width, `text-align: center`) holding `<p id="hero-offer">`, so the textarea's `aria-describedby` still resolves. `.riseT` with `--d: 0.34s` (between the box's 0.28 and the subtitle's 0.4); reduced motion as its neighbours. "Try it now." is a `<button type="button" aria-label="Try it now: focus the prompt">` that focuses `#hero-q` with `preventScroll`: text in the same face, hover underlines only, 2px ink `focus-visible` outline.
- **Wrapping:** where the sentence fits the box (23.4em at 0.03em tracking, 23.8em at 0.04em: 37 mono characters; the box is 497px at 1630, so 497 >= 23.4 x 21) a container query puts "Try it now." on its own line: "YOUR FIRST SEARCH IS ON US, FOR FREE." / "TRY IT NOW.". Where it does not fit (1440 and narrower), the whole text wraps `text-wrap: balance` and breaks at the comma ("YOUR FIRST SEARCH IS ON US," / "FOR FREE. TRY IT NOW."; the first half is no-wrap from 17.6em, "for free." and "Try it now." always). At 390 the box is 16.7em, so it breaks inside the first half, but "on us," stays whole: "YOUR FIRST SEARCH IS" / "ON US, FOR FREE." / "TRY IT NOW." (three lines; the stacked layout has height to spare). Never narrower than 2x the hint.
- **Rhythm** (`--gap-y` multiples, so short windows tighten together): `--offer-gap` 0.55 (box to offer, 17.6px at gap-y 32), `--sub-gap` 0.9 to 1.25 (40px under the offer line), `--cta-gap` 1.7 to 2.5 (80px under the subtitle). The new block made the bottom half taller than the top, so: `.textBottom` air above the strip 0.8 to 0.5 gap-y; below 880px tall `--cta-gap` is 2.2; below 820px (1280x720, 1366x768) `--offer-gap` 0.45, `--sub-gap` 1.05, `--cta-gap` 1.9 and the offer's line-height 1.3. Box centre = innerHeight/2 within 0.5px at 1024x768, 1280x720, 1366x768, 1440x900, 1536x864, 1630x915, 1790x1080; the CTA row and the strip are above the fold at all of them.
- QA: `.scratch/qa/hero-rev11/` (`measure.cjs`, `rows.cjs`, `measure.out.txt`, screenshots).
