# Pricing revision 2 (owner feedback, 2026-10-16)

## Owner's words (verbatim)

> "Let's change the pricing plans and the view. Free plan is going to exist, but it's hidden away from the websites. It's like a default fallback, so we're not going to show anything from the free plan. We start with creator, and then we'll have research, and then we'll have that's the three categories. Creator would be billed at $29. Pro would be billed at $79. And we'll have Research being billed at $149.
>
> You can make the basic calculations and extrapolate from the other two plans on what this plan must offer. If you clearly watch the offering difference from Creator to Pro, you'll understand the math, and we'll apply a similar math. Never give them the clear multiple. It will always be a little bit extra, so that we convince them to get the better plan."

## The math (orchestrator)

Creator → Pro today: the price rises **2.72×** ($29 → $79). Searches and AI credits rise **3×**, tracking rises
**3.33×** and AI boards rise **5×**. So each allowance grows about **10% faster than the price**; tracking
grows about 22% faster.

Pro → Research: the price rises **1.89×** ($79 → $149). Applying the same rule (about 1.89 × 1.10 ≈ 2.07×),
each figure is rounded **up** to a friendly number that lands a little above the multiple and is never
a clean 2×:

| Per month | Creator | Pro | Research | Pro → Research |
|---|---|---|---|---|
| Price, monthly billing | $29 | $79 | **$149** | 1.89× |
| Price, yearly billing (per month) | $25 | $63 | **$119** ($1,428 / yr, saves 20%) | |
| Struck list price (C5, unconfirmed) | $49 | $139 | **$259** | |
| Searches | 300 | 900 | **1,900** | 2.11× |
| AI credits | 5,000 | 15,000 | **32,000** | 2.13× |
| Tracking credits | 1,500 | 5,000 | **12,000** | 2.40× (tracking keeps its extra margin) |
| AI boards | 5 | 25 | **60** | 2.40× |
| 7-day trial: searches | 70 | 210 | **440** | 2.10× |
| 7-day trial: AI credits | 1,166 | 3,500 | **7,500** | 2.14× |

## Specs

- **Plans shown:** exactly three paid plans, in this order: **Creator ($29)**, **Pro ($79)** and **Research
  ($149)**.
  - Rename "Pro Research" to "**Pro**" everywhere. Use the plan ids `creator`, `pro` and `research`.
  - **The Free plan is never shown:** no card, no comparison column, no calculator option, and no mention
    in the FAQ or pricing copy. It stays in the app as a silent fallback.
  - The hero line "Your first Deep Search is on us." stays (an owner-supplied claim, C18).
- **Features:**
  - **Creator:** all platforms (TikTok, Reels, Shorts), latest AI models, all AI features (Deep Search
    included), 5 AI boards.
  - **Pro:** all platforms plus upcoming ones, latest AI models, all AI features (Deep Search included),
    25 AI boards.
  - **Research:** everything in Pro, plus 60 AI boards. **Do not invent features** the app does not
    have (no "priority support" or "API access" unless the repo already says so).
- **Tags and emphasis:** Pro is tagged "Most popular" and gets the highlighted (featured) card
  treatment that Creator has today. Research is tagged "Best value". Creator has no tag. The aim is to
  pull visitors up a tier.
- **Blurbs:**
  - **Creator:** "For marketers and creators who research every week." (unchanged)
  - **Pro:** "For growing teams who research at volume."
  - **Research:** "For agencies and brands researching many niches every day."
- **Billing:** yearly is the default, as today. "Save up to N%" is computed (it stays at 20%). Each card
  keeps the 7-day free trial CTA.
- **Calculator** (`/pricing`): recommendations span all three plans (Creator, then Pro, then Research)
  and never suggest Free. Update its copy and its "best plan" logic.
- **Everywhere else:**
  - SEO schema offers (`src/lib/seo/schema.ts`), FAQ answers that mention plans, prices or the free plan,
    llms.txt, and any blog or resources copy quoting plan names or prices.
  - Update `docs/revamp/OWNER_DECISIONS.md`: C4 (allowances; the app's `plan_wallets.py` has no Research
    plan yet, so the backend must add one with these numbers), C5 (strike prices, now including $259), and
    C6 (Free is hidden from the site). Add the table above as the source of the Research numbers.

## Rev 3: card redesign (owner feedback, 2026-10-16)

Owner: the cards were "very bland", the white card with the black border for the most popular plan "doesn't look very nice"; wants a 3D card that parallaxes on hover, a little shimmer, and "Save up to 20%" plus the 7-day free trial in green.

- Look: `docs/revamp/COLOR_SYSTEM.md`, Pricing. Creator is pink, Pro is the featured night/aurora card with a spectrum ring, spectrum tag and white CTA, Research is blue. Green chips for the trial, "save NN%" and the toggle's "Save up to N%".
- Motion: `src/components/sections/pricing/use-card-tilt.ts` (springy tilt up to 7 degrees, perspective 1000px, layers at different depths, a pointer-following light). Pro also gets a slow light pass (ring and surface) every 7 seconds. Fine pointers only; reduced motion, touch and keyboard focus get a flat card (static highlight, press scale on touch).
- Calculator: the recommended plan wears its hue; the hours-saved numeral is green.

## Rev 4: cleanup (owner feedback, 2026-10-16)

Owner, verbatim: *"use opus 5.5 xhigh agent with better skills to cleanup and improve the pricing cards, it is
non-sensical."* Earlier: *"I don't like the look of the pricing cards. It looks very bland. The white with that dark
black border for the most popular also doesn't look very nice. We need to improve this, increase the quality … at
least five times … some sort of maybe a 3D card that also parallaxes when I'm hovering, maybe have a little bit of
shimmer."* And: *"The "save up to 20%" and the seven-day free trial, both should be in green."*

### Critique of Rev 3 (screenshots: `.scratch/qa/pricing-rev4/before-*.png`)

1. **Repetition (P0, confirmed).** The Home viewport says "trial" 11 times: the headline ("free week"), the sub
   ("1-week free trial"), and per card a chip, the CTA and "The trial runs on a smaller allowance". The /pricing card
   adds a second sentence. Each card stacks five rows of 11-12px meta (three in mono) in a ~250px column, so the price is
   the only element with weight and everything else is the same grey whisper.
2. **Percentages that do not add up (P0, confirmed and worse).** One card shows three different numbers: "−49% vs
   list", "save 14%" and the toggle's "Save up to 20%". The two discounts (launch price vs list, yearly vs monthly) are
   compounded without saying so. The list discount also moves when billing flips (Creator −49% → −41%), so the
   "list" figure changes under the reader, and across the row it is −49 / −55 / −54, so Research looks like a worse
   deal than Pro. "VS LIST" is coupon jargon; the paper pill on the night card reads as a sticker.
3. **Meters (P1, confirmed).** "Against the largest plan" bars read as usage meters ("you have used 20%"). Research
   is all full by definition, Creator looks empty (it insults the entry plan), and they repeat the numbers and
   the dotted leaders beside them. The /pricing capacity tiles add a third encoding of the same AI credits.
4. **Features do not differentiate (P1, confirmed).** Three of four rows are identical on every card. The real
   differences (AI boards, upcoming platforms) hide in grey notes, and Research's "Everything in Pro, plus more" sits
   under the boards row and promises a "more" that does not exist.
5. **Colour (P1, confirmed).** Creator's pink-on-pink CTA with a pink ring on a pink wash reads as disabled
   (Research the same in blue). A light card carries a wash, a corner bloom, a gradient glyph tile, coloured meters,
   coloured checks, a coloured CTA, a green chip and a black pill: eight colour events, so none of them means anything.
6. **Featured card (P2, partly confirmed).** The "Most popular" and "Best value" tags hang half off the top edge,
   where the spectrum ring crosses them, so they look stuck on. At rest the aurora does not fight the text, but there
   are four light effects (ring pass, surface pass, pointer sheen, CTA sweep) plus a glare band.
7. **No "who is this for" on Home (P1, own).** The compact card drops the blurb, so the only way to choose is to read
   numbers.
8. **Rows do not line up across cards (P2, own).** Notes of different lengths shift the feature rows; the spec rows
   only line up by luck.
9. **The calculator repeats the "−49% vs list" pill (P2, own)** and its "saves 14%" is not green.

### Direction

One idea per card, read top to bottom: who it is for, what it costs, how to start, what you get. Each fact once.
Fewer, better elements; the plans differ in volume, so the allowance spec is the hero of the lower half.

### Card anatomy (top to bottom; `plan-cards.tsx`)

1. Glyph, plan name and, in the same row on the right, the tag ("Most popular" spectrum, "Best value" blue soft).
   Tags no longer hang off the top edge.
2. The blurb ("who it is for"), on Home too. Side by side, the three blurbs share the tallest height so every
   row below lines up across the cards (`useEqualBlurbs`).
3. The price (rolling digits, 52-60px) with the list price struck small beside it, over "/mo".
4. One billing line: "Billed yearly" plus the green "Save N%" chip, or "Billed monthly" with no chip.
5. The CTA ("Start free trial"; solid -ink on Creator and Research, paper on Pro) and under it the one trial line:
   "7 days free," in green, then what you pay after ("then $756/yr" or "then $79/mo").
6. "Every month": Searches, AI credits, Tracking credits, hairlines between rows (/pricing adds "about N videos
   analyzed" under AI credits).
7. The feature ladder: Creator "Includes" 5 AI boards, Deep Search and all AI features, latest AI models, TikTok,
   Reels and Shorts. Pro "Everything in Creator, plus" 25 AI boards and upcoming platforms as they launch.
   Research "Everything in Pro, plus" 60 AI boards and "More than double Pro's monthly allowance" (computed in
   `plans.ts`; it disappears if any Research limit stops being more than 2x Pro's).

Under the row, once: "Prices in USD; struck prices are list prices. The trial runs on a smaller allowance, and your
plan starts when the 7 days end. Tracking is experimental." (/pricing adds what a search counts.) The FAQ keeps the
trial allowance numbers.

### Removed, and why

- The per-card trial chip and "The trial runs on a smaller allowance" sentence: the trial is now said once per card
  (the green line under the CTA) and the allowance caveat once per row.
- The "−49% / −55% / −54% vs list" pills: three inconsistent percentages, one of which moved with billing. The list
  price stays, struck and quiet, with no derived percentage (`listDiscountPct` is gone; the calculator matches).
- The allowance meters and the /pricing capacity tiles: they encoded the same numbers two more times and read as
  usage bars.
- The light cards' pink and blue top wash, the soft-tint CTAs and the mono "EVERY MONTH" labels. Mono now appears
  only on tags and chips.
- The Home sub line's trial sentence (the headline already says "free week"): it now says what every plan shares.

### Look and motion

- Light cards: paper, a hairline ring (shadow, no border), a faint hue halo in the top corner and a lit top edge in
  the hue. Colour per card is the hue (glyph, edge, checks, CTA) plus green (trial, saving).
- Pro: night with aurora light (blue from the top left, pink from the bottom right, as % ellipses so a wide tablet
  card keeps the same light), a 1px spectrum ring, a purple glow under it, a paper CTA.
- Tilt (`use-card-tilt.ts`): up to 6 degrees, spring damping ratio about 0.8 (it follows the pointer, it does not
  wobble), content layers at different depths (the price floats furthest), the aurora and halo drift against the
  pointer, a soft light follows the pointer and on Pro the ring catches it (rim light). Mouse only; off for touch,
  reduced motion and a keyboard-focused card (the CTA shows its ring, white on Pro).
- Shimmer (Pro): one diagonal band crosses the ring and the surface every 8 seconds (1.8s of travel), drawn by
  the gradient and moved by transform, so it crosses the full height of a tall card. Paused off screen
  (`data-live`), none under reduced motion.
- Calculator: the recommendation card uses the same price treatment (struck list price beside "/mo", green
  "Save N%" chip, no percentage pill). It keeps its hue name pill and hue border.

### Follow-ups for the owner

- The list prices ($49, $139, $259) still have no source (C5). If they are not real list prices, drop
  `listPrice` and the struck figure disappears everywhere.
- "More than double Pro's monthly allowance" on Research is derived from the numbers. Confirm the wording.
- `globals.css` `--cis` for pricing (not edited here): content heights are now about 2440px at 390, 1510px at 820
  and 1090px at 1440 (currently 2150 / 2120 / 970).
- `COLOR_SYSTEM.md` Pricing still describes the Rev 3 card (soft-tint CTAs, discount badge, allowance blocks,
  top wash). This section supersedes it for the cards.

## Rev 5: card colours from scratch (owner feedback, 2026-10-16)

Owner, verbatim: *"The color schemes of the card are not nice. It just looks a little bit out of place, especially
the Pro card makes no sense. Yeah, could we just try to improve the card color schemes from scratch?"* The Rev 4
layout and anatomy stay; this round is colour only, and supersedes Rev 4's "Look and motion" colours.

The problem: three unrelated palettes (indigo and pink aurora on Pro, a raspberry CTA on Creator, a royal-blue CTA on
Research) on a page that is ink on near-white with small, deliberate accents. Pro's colours meant nothing.

Three schemes were rendered on the real cards (`.scratch/qa/pricing-rev5/options-*.png`, in context with the bento
above and testimonials below in `options-context-*.png`):

- **(a) Neutral premium (chosen).** Paper cards with a hairline and a short shadow, ink type, neutral checks and
  outline CTAs. Pro is the one ink card (near-black #0e0e10 to #19191c, not indigo) with a white CTA, the only filled
  action in the row. Colour carries meaning only: the glyph tile is each plan's identity (pink, the spectrum, blue),
  green is the trial and the saving, and a thin spectrum beam travels round Pro's 1px edge (the site's spectrum
  signature as a line). Tags: "Most popular" is a white hairline pill on the ink; "Best value" a quiet ink outline.
- (b) Light featured. Every card light; Pro raised with a spectrum hairline ring, a faint lavender top and a deep
  shadow, Creator and Research recessed on a grey fill. Clean, but Pro barely separates, and it sits close to the
  white featured card the owner already turned down.
- (c) Bento echo. Each card a soft hue tray (pink, purple, blue) holding a white core with the price and CTA, like the
  bento tiles above. Pleasant and on-system, but the trays bring the washes back, compete with the bento, and Pro's
  lavender reads as a sibling of Research's blue rather than the featured plan.

Why (a): it is the page's own palette (ink and paper), so the cards belong; the ink card makes Pro the obvious
choice and its white button the obvious primary; every remaining colour means something.

Motion on the ink card: the tilt and depth stay; a soft white light and glare follow the pointer; the ring catches
the pointer (rim light); a slow white glint crosses the card every 8 seconds; the beam circles the edge in 11 seconds.
The glint and beam pause off screen and stop under reduced motion. The light cards tilt and lift, with no light.

Calculator: the recommendation card is a neutral paper card; the plan's glyph tile sits beside its name in ink
(the hue border and hue name pill are gone). Contrast, measured on the rendered backgrounds
(`.scratch/qa/pricing-rev5/contrast.mjs`): every text pair passes AA, the lowest being ink-2/75 on paper at 5.49:1
and green-glow on the Save chip over the ink top at 6.76:1.

## Rev 6: picture-head cards in a wide row (pricing rev 3, owner feedback, 2026-10-18/19)

Pricing rev 3 (2026-10-18; data and history in `src/components/sections/pricing/plans.ts`) renamed the plans by
position (Pro $29, Creator $79, Research $189), merged searches and tracking into hunt credits, and replaced Rev 5's
paper cards: all three cards are near-black, each led by the owner's card head (397:225, 14px radius), an image in
the plan's hue (Pro purple, Creator red, Research blue; `public/media/pricing/<id>-head.webp`) with the plan name in
Panchang 800 (for Akira Expanded), the price bottom left, the tag pill top right and, when yearly, a green "Save N%" pill.

Owner on the first build, verbatim (2026-10-19): *"The whole character of the card or the pricing card is basically the
beautiful header. We need to decrease the height of the card and give more space for the header to occupy. I feel like
putting three cards within the letterbox is the issue. Remove the letterbox, give them 80% width of the current
viewport, and adjust the cards to have lesser height, more width. Ensure that the header portion is bigger and has very
small padding, just like the way it is shown in the reference image before."* New blurbs in the same round: "For
starters to taste content intelligence.", "For professionals who want full access to content intelligence.", "For
agencies and brands researching multiple niches every day." Later the same day: "Account tracking" became
"Competitor tracking" and Pro's "TikTok, Reels and Shorts" line was removed.

What changed:
- **Wide row.** PlanCards sit outside the Letterbox at `--wide` (globals.css): the letterbox below 1024px, the window
  less 20px a side at 1024-1279px, then 80% of the window up to 1600px (a 2000px window), held at 1600px until the
  letterbox plus 96px a side overtakes it (about a 2347px window), then the letterbox plus 96px a side. The
  /pricing calculator tray takes the same width, so the page has one wide column. Headings stay on the rail; the intro
  row (sub line and billing toggle) spans `--wide` with its left side padded back to the rail, so the toggle ends on
  the cards' right edge.
- **Head.** 10px in from the card's edge (the card's 24px radius less the head's 14px, so the corners nest), pulled
  out of the body padding with negative margins. The body padding is 10px + max(10px, (card width - 20px) x 12/397), so
  body text lines up with the price in the head.
- **Shorter body.** The start row follows reference 1: the white CTA on the left, the trial in two short lines flush
  right (green "7 days free," with a clock, then "then $X/yr" or "$X/mo"; owner: "align it to the right side"); on a
  card too narrow for both (a 320px phone, row under 296px) it stacks under the CTA, left-aligned. Every month shows
  hunt credits and AI credits side by side, figure over label, 16px either side of a hairline (the DOM keeps dt then
  dd; CSS `order` shows the figure first; /pricing adds a balanced note under each). Tighter gaps (20px between
  blocks, 8px between list items, 22px above the blurb). Blurbs balance their two lines; feature lines avoid a
  one-word last line.
- **Research head.** Its picture runs a bright cyan spoke through the name, so its scrim adds a tight band of shade
  behind the title row (RESEARCH from a median 3:1 to about 6:1 against white; PRO and CREATOR were already 6-10:1).
- **Footnote row.** Below 1024px it is as wide as the stacked cards (480px, centred), note above link; from 1024px it
  spans the card row, link on the right.
- **Two tones and scale (owner, 2026-10-19):** *"let's convert the pro and research pricing cards into light gray, and
  keep the creator card, dark gray adjust the text color accordinly. Also enlarge the creator card by 7% while making
  the pro and reasearch card scale down by 7%, to make the middle plan being more desirable to select."* The featured
  card (`data-tone="dark"`) keeps the near-black surface and white CTA; Pro and Research (`data-tone="light"`) are light
  grey (#efeff0 to #e9e9ea) with ink type, green-ink for the trial and a white CTA with a hairline. CSS variables on
  `.card` (`--fg`, `--fg-2`, `--fg-3`, `--fg-muted`, `--fg-faint`, `--trial`, `--rule`, `--dots`) carry every text colour, so
  the markup has no tone-specific classes. From 1024px the featured card is `scale: 1.07` and the others `0.93`, shrinking
  toward their outer edges so the row's edges stay on the toggle and the footnote; stacked cards are not scaled.
- **Grid.** From 1024px the three cards share a 5-row subgrid (head, start, every month, list, blurb), each card one
  `minmax(0, 1fr)` column; below 1024px they stack, up to 480px wide and centred.

Measured at a 1560px window (the owner's): card 299x722 to 403x691, head 251x142 to 383x217 (20% to 31% of the
card). Heights fell at every width checked (390 to 1920); the head share is 26% to 37%.
