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

## Rev 12 (owner's corrections, 2026-10-16)

- **Offer line:** 21px (18 to 21px from 1024px) to 14px, new copy "Research videos for your niche. First search is on us, try it now." (the owner wrote "try is now"; read as "try it now"; the line is uppercase, so "niche" shows as "NICHE"). Same `<div .offer>` (size container) and `<p id="hero-offer">`, so the textarea's `aria-describedby` still resolves; same mono face, uppercase, `--ink-soft`, tracking (0.04em, 0.03em from 1024px) and `.riseT`. "try it now" is still the `<button type="button" aria-label="Try it now: focus the prompt">` (`.offerCta`, `preventScroll` focus); the full stop after it sits outside the button, so the hover underline stops at the word. The rev 11 break machinery is gone: `.offerA`, `.offerB`, `.offerBreak`, their container queries, `text-wrap: balance` and the doubled-hint clamp.
- **One line, centred:** the sentence is 41.6em (582px at 14px) at the desktop tracking, 42.2em (591px) below 1024px. `.offer` is `display: flex; justify-content: center` around `.offerText` (`flex: none`, so as wide as its longest line): a flex item wider than the box overflows equally on both sides, where `text-align: center` pins an overflowing nowrap line to the left edge. Measured line centre minus box centre: 0.00 to 0.03px at every size below. Each sentence is an `.offerLine` (`white-space: nowrap`): `display: block` by default, `display: inline` where one line fits. Container queries on `.offer` (14px, so em = 14px): 42.3em (592px), the box's own width, which is the stacked layout from about 650px wide (768x1024: 614px box, one line at 88px from either edge); and, from 1024px, a box of 420px or wider. First pass of rev 12 stopped at 14px and went to two lines wherever a centred 582px line would pass the viewport edge (1630x915 and every narrower desktop window); the owner asked for one line, so from 1024px the size now gives way instead: the text column starts at the 41px gutter, so the line may hang past the box by up to 29px a side (12px from the viewport edge), and `.offerText` is `font-size: min(1em, (100cqw + 58px) / 41.6)` in that range (the box plus 58px, over the sentence's width in em). That is 14px from a 546px box (windows of about 1770px and up: 1772x1000 left edge 20.2px, 1790x1080 22.9px, 1920x1080 42.7px), 13.3px at 1630x915 (box 497px), 12.7px at 1536x864 (468px), 12.0px at 1280x720, 1366x768 and 1440x900 (440px, the narrowest one-line box, left edge 12.1px), 12.4px at 1200x800. The tracking stays 0.03em and scales with the size. A 400px box (1024x768, and 1100x800 at 418px) would need about 11px, so there each sentence takes its own line at 14px, as on phones: "RESEARCH VIDEOS FOR YOUR NICHE." / "FIRST SEARCH IS ON US, TRY IT NOW." (273 and 300px). The break is always at the sentence, never inside a phrase. The line's right end stays well short of the lead card at every desktop size (1280x720: 510px against the card at 566px). The one-line line starts left of the H1 and navbar-logo edge (41px) below about 1770px, by up to 29px at 1280: it is centred on the box, so it hangs equally either side of it.
- **Phones:** 14px holds down to a 353px window (the box needs 22.5em, 315px, for the second sentence: 22.4em at 0.04em tracking). `.offerText` is `font-size: min(1em, 100cqw / 22.5)` with the tracking on the same element, so below that the size steps down with the box and the tracking scales with it: 13.6px at 345px wide, 12.4px at 320px (second line 271px in a 280px box). 360 and 390 stay 14px.
- **Subtitle:** "Gain your advantage on Social Media. Search through [7 platforms] across [104,862 niches] and over [10,384,719 videos] updated daily." The lead sentence is plain text (owner's capitalisation) and may wrap; "Social Media." is a nowrap pair, because at 320px the sentence otherwise broke as "Gain your advantage on Social" / "Media." (a lone word). The chip groupings and `text-wrap: pretty` are unchanged. Lines: 2 at 1280, 1366, 1536, 1630, 1790, 1920 (the first starts "Gain your advantage on Social Media. Search through 7 platforms"); 3 at 1440 and 1024 (the lead sentence alone on the first line) and at 768; 4 at 390 and 360; 6 at 320. No lone word and no chip alone on a line at any size.
- **Rhythm unchanged:** `--offer-gap`, `--sub-gap`, `--cta-gap` and the 820px tier are as in rev 11: 40px offer to subtitle and 80px subtitle to CTA row at 1790x1080 and 1920x1080 (`--gap-y` 32px; 37.7 and 75.5 at 1630x915, as in rev 11). The offer block is 19.6px a line instead of 29.4px, the subtitle gained a line where the lead sentence did not fit beside the count sentence.
- **Fit:** the offer is one line on desktop (19.6px instead of two) and the subtitle gained a line at 1440x900 and 1024x768, so every desktop size has the same or more room than rev 11 except 1024x768 (the offer is still two lines and the subtitle is three: CTA row bottom 682.7 against 667.5, strip top 703). No height tier or variable changed from rev 11. 1440x900 keeps the box on the centre line with the 880px tier (subtitle to CTA row 74.3px, as rev 11). CTA row bottom (rev 11 to rev 12): 1280x720 643.9 to 608.0 (strip top 655), 1366x768 674.4 to 636.3 (703), 1440x900 812.4 to 799.6 (835), 1536x864 778.4 to 737.3 (799), 1630x915 823.0 to 782.9 (850), 1790x1080 918.8 to 879.6 (1015), 1920x1080 918.8 to 879.6, 1024x768 667.5 to 682.7 (703). Box centre = innerHeight/2 exactly at all of them. No horizontal overflow at any of the twelve sizes measured; the CTA row is above the fold at all of them but 320x640, where it was not in rev 11 either (it sits at 751px; the page scrolls).
- QA: `.scratch/qa/hero-rev12/` (`measure.cjs`, `summary.cjs`, `measure.out.txt` for twelve sizes, `baseline-rev11.out.txt` the same script on the rev 11 build, `edges.out.txt` the in-between widths, screenshots).

## Rev 13 — board (owner's corrections, 2026-10-17)

Owner: cut the fifth column, four columns only (the fifth is for 2K displays; it did not animate or switch its cards), narrower cards "closer to 9:16", and replace the "hover a card to see why it scored" hint with a plain "hover me".

- **Four columns below 2200px.** The static columns are gone: `STATIC_COLUMNS`, `STATIC_TIERS`, `spareCards`, `.colStatic`, `.colStatic2`, `.slotStatic`, the `hero-stage` aspect container queries that showed them, the `nth-child(6)` label rules and their comments. Every window narrower than 2200px shows exactly columns 1 to 4.
- **A real fifth column from 2200px (2560x1440 at 100%).** `COLUMNS` has a fifth entry (slots 10 to 14, `SLOT_COUNT` 15), so it is an engine column: it takes part in the intro shuffle and every flap wave (the wave order is `COLUMNS.flat()`), turns on hover and focus, repaints its chart, score and trend per prompt, and is covered by the pause control and the reduced-motion crossfade. `data.ts boardCards()` fills it with the set's two spare ranks plus three of the lowest ranks of a donor set (the set two along; the donor's cards keep their score, trend and chart, only the rank is renumbered 13 to 15 so no back shows one rank twice), highest score first: fifteen distinct videos, no poster twice on screen. Below 2200px `.col5` is `display: none`: its posters are swapped for an empty image by a `<picture>` source (`Face hiddenBelow={2200}`, same trick as column 4 below 1024px), it has no `<video>`, and its focus buttons are not focusable, so the arrow-key roving (`offsetParent !== null`) skips it. `WIDE_COLUMN_MIN_WIDTH` (data.ts) and the CSS media query keep the same number. Wave budget: the wave is now 15 cards, so the last card lands 14 x 0.13 = 1.82s after the first (was 1.17s); the whole wave (beam, steps, longest card, chart draw-in) is about 4.4s, still inside the 6s cycle.
- **Cards 3:5.** `--aspect: 0.6` is the one number: `--ch = --cw / --aspect`, the height cap uses it (was `0.8`), the stacked layout fills the letterbox width as before (cards are taller, +33%, not narrower; its cap is 156px, was 190px, and `HERO_POSTER_SIZES` follows), `.chartBox` is 34% of the card (was 40%: a 3:5 card's 40% is 1.5:1, against the 2:1 chart viewBox; 34% is 1.76:1), the card back's radar may grow to 85cqw (was 60cqw) to fill the taller back. Nothing in engine.ts measures card aspect (placement uses the stage and the prompt box only), so `prePaintPlacementScript` and `HeroEngine.layout()` are unchanged and still agree. The slot container tiers (124, 128, 140, 160, 200px) are unchanged: card widths are now 117 to 242px, inside the same tiers, and the measured chips never overlap, wrap or leave the card at any size.
- **Re-balancing the board** (narrow cards and one column fewer left the board 300 to 600px short of the prompt box). `--overrun` 1.2/1.3 to 1.45 (1.55 on stages 5:4 and wider, 1.3 at 2200px+ where column 5 has five cards), `--lead` 1.12 to 1.25 (the card "Hover me" points at), `--peek` 0.7 to 0.8, `--rg` 12 to 16, and the width the height cap leaves over is shared into the column gaps (`--cg0` 18px up to `--spread` x a card width, 0.5; 0.6 on wide stages) instead of lengthening the connector. The reasoning is in the comment above `.columns`. Trade-off: cards are 15 to 25% taller than the old four-column height at 1280 to 1728 (the width, not the old height, is what fills the band), and the gaps between columns are wide (60 to 110px) on big windows.
- **Cut column.** The last visible column (4th below 2200px, 5th above) still carries its trend tag bottom-left; its score chip now rides the visible edge (`translate` by the hidden share of the card) instead of being cut in half by the viewport, and is hidden when the card is under 144px (not enough visible width for the views chip and the score).
- **"Hover me".** `.hint` now reads "Hover me" (touch: "Tap me") with a small down arrow, above the lead card with the left edges aligned, in the same mono uppercase face. The board's `aria-label` is unchanged.
- QA: `.scratch/qa/hero-rev13/board/` (`measure.cjs`/`interact.cjs`/`model2.cjs` in `.scratch/rev13-tools/board/`; `baseline-measure.txt` before, `r2-measure.txt`/`final-measure.txt` after, screenshots).

## Rev 14 — layout model and board (owner's Pencil frame `dFkvz`, 2026-10-17)

Build spec: `.scratch/qa/hero-rev14/SPEC.md` (sections 1, 2, 3, 5 here). The owner hand-tuned a 1920x1080 frame; it is the reference and every other size is derived from it. This part covers the row geometry and the board; the text column's internals (H1, prompt box, offer, subtitle, CTA) are in "Rev 14 — text column" below.

- **One unit, `--u`** (hero.module.css, `.root`, a registered `<length>`): `clamp(0.75rem, min(100cqw / 120, (100svh − --nav-h − --strip-h − 2.5rem) / 46.5), 1.15rem)`. 16px at 1920x1080 and 1920x950, 18.4 at 2560x1440 (cap), 17.07 at 2048x1152, 14.4 at 1728, 12.6 at 1512, 12 from 1440 down. `cqw` reads the section (`.hero { container: hero / inline-size }`), so the Windows scrollbar is never counted (1903x1080: u 15.86). The navbar and strip are not scaled.
- **The row**: `L | T | M | B(N) | R`. T = 33.8125u (541px at 1080p) and the cards never stretch: lead 16u, column 2 14.2u, the rest 12.8u, all 3:5; column gap `--hero-g` 1.375u (22px), card gap 1u. Only L, M and R move, together: L = R = k·7.125u, M = k·12.0125u, k = (W − T − B) / 26.2625u. Variables (for the text column and anyone else): `--u`, `--hero-t`, `--hero-g` on `.root`; `--hero-b`, `--hero-l`, `--hero-m` on `.root`'s children (N itself lives only in the container queries; R = L follows because the board is placed from the left) (registered lengths, so `cqw` resolves against the hero, not a card or the offer container). k itself is implicit (CSS cannot divide a length by a length yet). `.textCol` pads by `--hero-l`, `.textInner` is `--hero-t` wide.
- **Whole columns only, N in CSS.** N = 5 where k(5) ≥ 1, else the most of 4, 3, 2 with k ≥ 0.5: thresholds W ≥ 134.175u, 106.86875u, 92.69375u. They are container queries on `.root` (`container: hero-row`), whose `font-size` is `--u`, so `em` in the query is u (a query cannot read a custom property; `.root > *` resets to 1rem). Correct on the first paint with no script, and on every resize. Columns drop from the right; column 5 only exists at N = 5 (2560x1440 and up at the cap, or earlier on short wide windows where the height guard holds u down, e.g. 1920x850). The `--peek` cut column, the 2200px breakpoint, `--overrun`/`--spread`/`--cg0`, the `hero-stage` aspect queries, the stage bleed and the cut-column score-chip translate are gone. Below 1024px the stacked layout is untouched (columns 1 to 3).
- **Posters of hidden columns** never download: `data.ts COLUMN_HIDDEN_MEDIA` restates the rule as media queries for the `<picture>` source (`Face hiddenMedia`). Columns 3 and 4 depend on width alone (u ≤ W/120, so only the 0.75rem floor matters: 69.52rem and 80.15rem). Column 5 also depends on height, which a media query cannot combine with width linearly, so its band is cut into 12 width steps, each hidden only above the height line at its widest end (a visible column never gets the blank image). Viewport queries count a classic scrollbar and only approximate the column-5 band, so the posters of columns 3 to 5 are also `loading="lazy"` (`Face eager` is false there): a lazy image in a `display: none` column is never fetched, whatever `src` the engine assigns on a wave. That is exact at any scrollbar width or height (with scripts on; browsers ignore `lazy` with scripting off, where only the media queries apply). The engine's next-set preload warms only the posters of visible slots and tracks warmed posters by URL, so a column that appears after a resize is warmed on the next preload too.
- **Stage and board.** The stage spans the full hero width between the navbar and the strip (pointer-events pass through; only cards take them), with the same top/bottom fade. `.columns` sits at x = L + T + M. The engine's `--board-dy` still centres the columns on the prompt box's centre line (pre-paint script unchanged); the lead card sits 0.84u higher (a `margin-bottom` on column 1, so layout reads include it). The last visible column carries its tags bottom-left (per N).
- **Connector**: a level run along the prompt box's centre line, from the box's right edge (no +1px: the new box has no outline ring) to the lead card's left edge, which it now meets 0.84u below the card's centre; it bends only if that line would miss the card's straight edge. Open question for the owner: the frame has no connector drawn.
- **Hint**: centred on the lead card, 0.75u above it (12px at 1080p), sized in u from 1024px (10.5px, floor 10px).
- **Trend tags**: drawn above the chart (after `.chartBox` in the face), an icon instead of the dot (Phosphor star-fill, caret-double-up-bold, caret-double-down-bold as inline paths; data-trend picks one, so the engine's repaint is unchanged), tinted fills: breakout #FFF3DE at 94% with a #D6A529 star, growth #C4DEC3 with #26853B chevrons, decline #F3CAC7 with #B34848 (growth's OKLCH lightness and chroma at the decline red's hue). From a 200px card: 26px tall, radius 8, padding 0 8 0 7, gap 5, 11.5px, chevrons 10px, star 8px; smaller tiers as before.
- **Measured** (`.scratch/qa/hero-rev14/layout/`, `tools/measure.cjs`): 1920x1080 text left 114, box right 655, columns at 847.2/1125.2/1374.4/1601.2 (256, 227.2, 204.8, 204.8 wide), gaps 22, board right 1806, R 114, lead top 313.2 (frame 313.3), connector `M 655 540.5 L 847 540.5`, hint centre = lead centre. 1920x950 identical horizontally. 2560x1440 N 5, L 155.8, M 262.7. 1366x650 N 4, L 65.4, M 110.3. 1280x720 N 3, L 88.2, M 148.8. 1024x768 N 2, L 64.9, M 109.5. 3440x1440 N 5, L 394.6, M 665. 390x844 board identical to rev 13. Column 2 is centred on the box line, so its top card starts at y 153 at 1080p (frame about 165, within the spec's 12px).

## Rev 14 — text column (owner's Pencil frame `dFkvz`, 2026-10-17)

SPEC sections 4 and 6. The left portion matches the frame at 1920x1080 (column origin 114, 151) and scales with the row. Every size is in `--tu`, the text column's unit (hero.module.css `.textCol`, a registered length): `--u` from 1024px, 1rem in the stacked layout, whose own sizes (H1 width formula, prompt 16/17px, subtitle 18 to 20px, the `--gap-y` rhythm) are kept.

- **H1**: Switzer 500, 5.625u (90px), tracking −0.0408em, three fixed lines. Lines 1 and 2 are 1.0719em boxes (96.47px) with the text centred by half-leading, line 3 is the bare 0.92 box, so the line tops are 0 / 96.5 / 193 and the heading is 276px, as the frame's rows. **"viral"**: `LiquidRampText` (liquid-ramp.tsx, VIRAL) in Bilbo Swash Caps at 1.7em (153px), tracking −1.15px, line-height 0.92; its 141px box is centred on line 2 with `vertical-align: top` and −0.1447em block margins (the line box does not grow), 16.8px after "analyze" (the word space plus a 0.0261em margin, from the frame's ink). Line 2's mask clips only its bottom edge (a `clip-path` polygon), and its rise starts 0.5em lower, so the word's 22px overhang never shows outside the entrance. The old gradient `.viral` and `Emphasis` are gone from the hero (Emphasis stays for other pages). The shader holds with the pause control (`paused` prop added to both liquid-ramp components; the clock resumes where it stopped).
- **Prompt box** (`.promptBox`): T wide, 123px (padding 14 16 11.7 16: the frame fixes the box 0.3px short of its rows), radius 1u, no outline, one shadow 0 0.125u 0.25u at 5%. The focus states moved into the module (unlayered CSS outranks Tailwind's utilities layer): a 1px ink ring and lift on focus, a stronger ring on keyboard arrival. Prompt text 1.125u (floor 0.875rem), first line box at (24, 19): `.promptArea` is inset 8/5px and 2.4611em tall from 1024px (44.3px at 1080p; in the text's em, so at the 14px floor it keeps the frame's room for the second line), its two lines run into the 12px gap above the 36px control row. The focus lift's offsets and blurs are in u like the resting shadow. **Deep Search chip**: icon only, 34x32, radius 10, white lucide Brain 14px on `LiquidRampFill` (DEEP_SEARCH_CHIP); `role="img"`, `aria-label="Deep Search"`, `title` = DEEP_HINT; still no tab stop; `#hero-mode` still describes the textarea. Pause ring 2u, gap 0.5u, submit 2.25u with a 1u arrow; the typing hint sits 2.75u from the right, 0.65625u with a 10px floor.
- **Offer**: "First search is free, try it now." (uppercase in CSS), JetBrains Mono 0.8125u (floor 0.65625rem), tracking 0.0323em, line-height 1.4, `--ink-soft`, 9px under the box, 13px in (where the box's corner meets its bottom edge), one line from 1024px. "try it now" is still the focus-the-prompt button. The centred two-sentence machinery (`.offerText`, `.offerLine`, its container queries) is gone.
- **Subtitle**: "Claim your superpower. Search through [7 platforms] / over [10,862 niches] and [10,384,719 videos] updated daily. / Save around [33 hours] every week." Switzer 1.25u, line-height 1.62, tracking −0.005em, `--sub-ink` #737373 (4.54:1 on --bg; do not lighten), 2px in, 56px under the offer. From 1024px two no-wrap segments (`.subSeg`) and a block last line (`.subLine`) give exactly three lines; everything is in u, so the wrap is the same at every desktop width and "over" opens line 2, as in the frame (line 2 runs about 3px past the 541px column at 1080p, into the empty M gap). Below 1024px it wraps naturally, each chip glued to its lead-in word. `HERO_STATS`: niches 10,862, new `hours` (33). `CountChip` is sized in em of the subtitle (25.4px tall, radius 8, padding 0 8.46, gap 6.58, number mono 500 at 0.846em, label 500 at 0.94em), sits on the line with `vertical-align: top` and 0.175em block margins (centred in the 32.4px line like the frame), and has 0.125em inline margins (the frame's 5.5px word gaps around a chip).
- **CTA row**: only "Get started" (the CTA-row Sound toggle is gone; the navbar keeps its sound button; `useFlapSound` still runs for the board's flap sound). `HeroCta`: `MetalButton` with `.cta`, 12.5625u x 4.125u, radius 0.875u, padding-left 1.0625u (content 7px right of centre), label 1u, #F8F8F8, arrow 1u, gap 0.5u, 44.3px under the subtitle. metal-button.tsx gained an optional `metal` prop (`ringPx`, `radius`, `glow`), passed to metal-button-fx.tsx; the hero reads `--tu` in a layout effect before the first paint, then on resize (ResizeObserver), and asks for a 0.1875u ring, a 0.875u radius and no halo. Before metal-fx swaps in, and without WebGL2, the button shows the frame's static ring gradient (its background, with the face as `::before`); inside metal-fx's wrapper both are switched off. Other MetalButton call sites are unchanged.
- **Vertical placement**: the prompt box stays on the hero's centre line (grid `1fr auto 1fr`; box centre y 540 at 1920x1080, H1 top 151.2). `.textTop` keeps 1.5rem under the navbar, `.textBottom` 1rem over the strip; on shorter windows the box moves off the line by just that much. The grid has a definite height, `max(100svh, 680px, --nav-h + --strip-h + 2.5rem + 46.5u)`: with only the root's min-height, both 1fr rows grew to the taller (H1) group and the hero overflowed the window (1001.6px at 1920x950). Desktop rhythm in u: H1 → box 3.2225u (51.56px), box → offer 0.5625u, offer → subtitle 3.4875u, subtitle → CTA 2.76875u. The old `--h1-w`, `--h1-room`, `--box-half`, `--line-y`, `--h1-air` and the 880/820px height tiers are gone.
- **Measured** (`.scratch/qa/hero-rev14/text/`, `tools/text.cjs`, `compare.py`, `words.py`): at 1920x1080 against the export, ink boxes of every element within 1px (H1 lines, prompt text, chip, ring, submit, offer, each subtitle word and chip, CTA ring and face); "viral" ink 435–635 x 233–332 against 436–634 x 233–331; mean RGB difference over the 600x760 crop 3.0 (antialiasing edges only, `r2/diff.png`). 1920x950, 1728x1000, 1512x860, 1440x800, 1366x650, 1280x720, 1024x768 and 2560x1440: subtitle three lines with "over" on line 2, offer one line, prompt text inside the box, H1 ≥ 24px under the navbar, CTA ≥ 49px above the strip, CLS ≤ 0.0015, no horizontal overflow.

## Rev 14 — review fixes, round 1 (2026-10-17)

Evidence: `.scratch/qa/hero-rev14/fix1/` (`tools/geo.cjs`, `ctx.cjs`, `focus.cjs`; posters with `verify1-responsive/tools/posters2.cjs`).

- **Short windows fit**: the definite grid height above. 1920x950: hero 950 (was 1001.6), box at y 439.3, CTA bottom 852.8, strip 885–950 in view. 1440x800 and 1024x768 now fit (strip bottom = window bottom). 1920x1080 is unchanged (H1 151.2, box 478.5, lead 847.2 / 314.2).
- **Known limit, owner decision**: below about 750px of window height (192px of chrome + 46.5u at the 12px floor) the block cannot fit: 1366x650 and 1280x720 give a 750px hero, so "Get started" ends about 20px below a 650px fold. The 0.75rem floor wins over the height guard by the spec's own formula. Options: let only the height guard go under the floor, or a tighter rhythm under about 760px of height (it recovers at most about 45px, not enough alone).
- **WebGL contexts**: liquid-ramp releases its context on unmount (`WEBGL_lose_context`, once the canvas has left the document, so StrictMode's simulated unmount is unaffected). 9 Home → /pricing → Back round trips: 2 live liquid-ramp contexts (was 16), no "Too many active WebGL contexts" warning, the metal ring stays. Failed compiles or links delete their shader and program objects; a superseded text-mask pass no longer touches the canvas.
- **Hidden-column posters**: lazy (above). With a classic scrollbar, 1120x800, 1284x800, 1920x860 and 2472x1300 fetch no poster of a hidden column with scripts on (1920x860: 23 requests in 9s, was 39).
- **Bilbo Swash Caps** is no longer preloaded on every route (`preload: false`; next/font's metric-matched fallback covers the swap).
- **Clean-up**: `useFlapSound` returns nothing (the navbar owns the sound toggle); `--hero-n` and `--hero-r` removed; stale comments (connector "outer border", pre-paint "column 1 is centred", "2K-only column") reworded.
- **Not changed** (spec or brief wins; owner may decide): the lead card stays at x 847.2 (the spec's uniform 22px gap; the frame's own card sits at 843 with a 27px gap to column 2); column 2 stays centred on the box line (10.7px above the frame, inside the spec's 12px); the hint stays centred on the lead card; the connector stays (open question); the CTA ring keeps metal-fx's chromatic material, darker than the frame's pale ring. metal-fx draws every instance with one shared material, so a lighter hero ring would also change the closing band's and the 404's (the frame's static ring is already in `.cta` as the pre-load look, if the owner prefers it); no Switzer metric-matched fallback yet (a site-wide globals.css change; the swap shift is ≤ 0.0005 at 1080p and mostly a dev-server timing effect).

## Rev 14 — review fixes, round 2 (2026-10-17)

Evidence: `.scratch/qa/hero-rev14/fix2/` (`tools/conn.cjs`, `ring.cjs` + `ringscore.py`, `sweep.cjs`, `tags.cjs`).

- **Trend tags take the frame's set width**: `min-width: 8.1em` with the content centred (`justify-content: center`), so short labels keep air at both ends as in the frame (Pencil: 94 and 91px). 1920x1080: breakout and growing 93.1x26, declining 96.3 (it already exceeded the minimum). It scales with the tag's type in every tier except phones (under 140px cards, `min-width: 0`).
- **Flap spares come only from shown cards**: `engine.sparePool()` draws the intermediate flap faces from the outgoing and incoming sets' cards in visible slots, not from all 12 cards of each set. Those posters are on screen or warmed by `preload()`, so a flap never fetches a cold poster or one only a hidden column holds. Sweep at 1920x1080, 1024x768, 1180x800, 1920x860, 2560x1440, 390x844, 768x1024 (no scrollbar) and 1024x768, 1284x800, 1920x1080 (classic scrollbar): no flap-only and no hidden-only poster requests.
- **Geometry settles after a live resize under reduced motion**: the global reduced-motion rule (`transition-duration: 0.01ms`) still tweens the hero's padding and widths for one frame, and the engine's ResizeObserver could fire on that frame (new size, old position) and never again. Each observer callback now also re-runs `layout()` two frames later. With `reduce`, 1920x950 → 1440x800 → 1280x720 → 1728x1000 → 1366x768 → 1920x1080 gives the same path start (form.right) and `--board-dy` as without reduced motion, at every step.
- **The CTA ring survives a resize under reduced motion**: metal-fx clears a paused instance's canvas when it resizes and never repaints it. `MetalButtonFx` now re-composites the frozen frame (`redrawInstance`) two frames after any resize or ring/radius change while paused. Reduced motion, load at 1920x1080, then 1440x800, 1920x1080, 1280x720: the ring band stays lit (luminance 151–174, coloured share 0.37–0.39; was 31–42 and 0.00 after the first resize).
- **Not changed** (spec or brief wins; owner may decide): the CTA ring's material (as in round 1); the lead card at 847.2 (the spec's constant gap, 4px right of the frame's 843); with a classic Windows scrollbar the hero is 1905px wide, so u = 15.875 and the composition is 0.8% smaller than the frame (lead card 840.6): the spec defines W without the scrollbar, and taking u from `100vw` instead is an owner call; windows under about 750px tall still do not fit the text block at the 0.75rem floor (as in round 1); the trend label inks stay as the spec fixes them, though growth #0A7340 on #C4DEC3 (4.12:1) and decline #B9262C on #F3CAC7 (4.17:1) are under WCAG AA's 4.5:1 for this small text (#07633A and #A01F25 would pass on the same tints at 5.1 and 5.2).

## Rev 14 — owner follow-ups: tag contrast, short windows (2026-10-17)

Evidence: `.scratch/qa/hero-rev14/followups/build/` (`measure.cjs` + `compare.mjs` + `pixdiff.py`: `before/` and `after/` boxes and screenshots; `tools/sweep.cjs`, the round-2 sweep with this model; `tools/tagcolors.cjs` → `tag-contrast.txt`; `contrast.mjs` → `contrast-derivation.txt`; `ublock.cjs`, the block height at forced u).

- **Trend tag label ink** (owner-approved): only the growth and decline labels change, darkened in OKLCH lightness at the same hue (chroma kept; green trimmed by 0.003 to stay in sRGB) until they pass AA on their tints. Growth `#0a7340` → **`#006b3a`** on `#c4dec3`: 4.12 → **4.61:1**. Decline `#b9262c` → **`#b11b25`** on `#f3cac7`: 4.17 → **4.61:1**. Breakout keeps `#7d5700` (its tint is 94% opaque: 5.95:1 over white, 5.18:1 even over black). Tints and icons unchanged. Set on `.face` as `--tag-ink` (hero only; the site's `--growth-ink`/`--decline-ink` tokens are untouched).
- **Short windows fit** (owner-approved): `--u = max(0.6rem, min(clamp(0.75rem, 100cqw / 120, 1.15rem), --u-fit))`. The 0.75rem floor still bounds the width term, but the height guard `--u-fit` may now take u under it, down to 0.6rem. `--u-fit` is the larger-block model: `min((100svh − nav − strip − 2.5rem) / 46.5, (100svh − nav − strip − 2.5rem − 3.0722rem) / 42.39375)`. The second line is the block once the prompt's 14px and the offer's 10.5px floors stop scaling (below u ≈ 12.4px; they add 3.0722rem − 3.90625u, measured with `ublock.cjs`: Chromium draws the frame's block at 46.3u). It only binds under 0.75rem. Where the guard is ≥ 0.75rem, u is the same as before. **The floor is 0.6rem, not 0.65**: 1366x650 needs u = 9.62px (0.601rem) to fit with the spec's air; at 0.65rem (10.4px) the block is 490px, leaving 7px of air in total and pushing the strip about 33px below the fold. **Pending owner sign-off**: the brief said "not under about 0.65rem"; the alternative is to keep 0.65rem and accept that 1366x650 does not fit (1280x720, 1440x700 and 1600x720 sit at 11.27, 10.80 and 11.27px, above 0.65rem either way).
- **Strip height**: the fit maths use `--strip-full` = `--strip-h` + 1px (the strip's hairline plus its 64px row), in `--u-fit`, the grid height and `.textBottom`'s clearance. The CTA now ends 16.1px above the strip where the guard binds (was 15.2). `--strip-h` stays 64px, because the strip row, the stage's bottom edge and engine.ts read it.
- **Hero height**: the 680px minimum is gone (`.root` `lg:min-h-svh`; `.textInner` `max(100svh, nav + strip-full + 2.5rem + max(46.5u, 42.39375u + 3.0722rem))`). The hero matches the window down to about 649px of height. Below that, u sits at its floor and the hero grows taller than the window. The text then still clears the navbar and the strip, but the strip falls below the fold (1366x600: strip bottom at 649).
- **Column count follows u** (the spec's rule, unchanged): a smaller u fits more whole columns, so short windows gain columns. 1366x650: N 5 (was 4). 1280x720: N 4 (was 3). 1440x700: N 4. 1600x700 and 1920x700: N 5. 1024x700: N 3. `data.ts COLUMN_HIDDEN_MEDIA` now covers the new bands, each cut into width steps hidden only above the height line at the step's widest end: column 3 from 1024px (2 steps), column 4 from ROW_N4 × 0.6rem (3 steps), column 5 from ROW_N5 × 0.6rem (16 steps). It uses the same block model and 153px of chrome. Visible columns never match their hidden media (checked at 1366x650 and 1600x700). Their lazy posters arrive a few seconds late on the dev server.
- **Measured** (classic scrollbar): 1366x650 u 9.62, 1280x720 u 11.27, 1440x700 u 10.80. In all three, H1 24px under the navbar, CTA 16.1px over the strip, strip bottom = window bottom, prompt 14px, offer 10.5px, no overlap (text to lead card ≥ 93px), CLS ≤ 0.0008. **References unchanged**: at 1920x1080, 1920x950, 1512x860, 1440x900 and 2560x1440, every measured box is identical before and after (u, hero, strip, H1, box, offer, subtitle, CTA, every card, hint). The only pixel changes are the darker tag labels, the animated metal ring and the scrollbar thumb (the page below the hero is longer).
- **Trend tags keep 10px on desktop**: the smaller u makes desktop cards narrower than 140px on short windows (12.8u ≈ 123px at 1366x650; the smallest was 153.6px before), which tipped the tags into the phone tier (8.5px, under the 10.5px offer floor). The 8.5px tier is now scoped to the stacked layout (`@media (max-width: 1023.98px)` around the `slot` ≤ 139.98px query), so desktop tags stay on the 10px tier with the 8.1em set width; "Declining" still fits a 123px card.
- **Watch**: at u 9.6–10.8 the CTA label (1u) is 9.6–10.8px and the subtitle (1.25u) is 12–13.5px. The owner set floors only for the offer and the prompt.

## 2026-10-18: the CTA ring without metal-fx

The owner found the metal button laggy next to the smooth shader backgrounds: metal-fx drew every ring on a shared 15 fps loop and copied each frame through a 2D canvas. `ui/metal-ring.tsx` + `metal-ring-glsl.ts` replace it: one small WebGL1 canvas inside each button, the same scheduler as liquid-ramp (on screen and tab visible only, ~60fps cap, DPR 2, reduced motion = one still frame repainted on resize, context loss handled), and the chromatic look rebuilt (chrome stripes, cool blue burn, red/blue fringes). `.cta[data-metal-ring="on"]` turns off the frame's static ring gradient once the shader ring has drawn its first frame. The metal-fx notes above describe the earlier build.
