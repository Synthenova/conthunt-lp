# Colour system (2026-10-16)

Owner, verbatim (bento batch, 2026-10-16): *"Actually, since we don't have a singular accent color, you've
just used gray everywhere. I would love to mix and match. Let's use some nice bright colors like pink,
purple, green, yellow, red, and blue, wherever. And then inside the bentos too, they need a little bit more
color. They all look very bland."* Pricing: *"The "save up to 20%" and the seven-day free trial, both should
be in green."* Pricing cards: *"…The white with that dark black border for the most popular also doesn't look
very nice…"*

This file supersedes OWNER_DECISIONS **D4** ("one blue accent") and the PLAN §2 lines "The UI is monochrome
plus the one accent" and "Colour comes from the videos". The tokens are live in `src/app/globals.css`.
The swatch preview is in `.scratch/qa/color-system/preview.html` (with a screenshot, `preview.png`).

## 1. Direction in one paragraph

The page stays a light, ink-on-white editorial page. Colour arrives as **flat, confident marks**:
tinted tiles, chips, dots, icons, chart lines and a few headline keywords. Think of Figma's or Raycast's
multicolour, not a gradient wash. Each section gets **one to three hues**. One signature runs through the
site, the **spectrum** (pink, then purple, then blue). It appears as a thin line or ring: the How it works rail,
the featured Pro card ring and the "Most popular" tag. It is never a big fill and never text. There is one dark,
designed surface, the Pro card (`--night` with aurora light). Data hues keep their meaning everywhere: yellow means
breakout, green means growing and red means declining.

## 2. Palette

Seven hues. Each has four steps. Class names follow `bg-{hue}`, `bg-{hue}-soft`, `text-{hue}-ink`,
`from-{hue}-glow`, plus opacity modifiers (`border-pink/25`, `shadow-purple/40`).

| Step | Use |
|---|---|
| `{hue}` (base) | fills, dots, icons, chart strokes, progress bars, big numerals, display-size keywords |
| `{hue}-soft` | opaque tint for chips, badges, avatars and tile backdrops (11–26% on white, tuned to the same perceived lightness, OKLCH L ≈ .95) |
| `{hue}-ink` | any readable text in that hue; also a solid fill **behind white text** |
| `{hue}-glow` | light partner for gradients and glows; the text tone on `--night` |

Contrast ratios (WCAG 2.x). Computed by `.scratch/qa/color-system/final.mjs`. "white on ink" means white text on an `-ink` fill.

| Hue | base | soft | ink | glow | base on --bg | ink on --bg | ink on --paper | ink on --surface | ink on soft | white on ink | --ink on base | glow on --night |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pink | `#f0448c` | `#fde9f1` (12%) | `#bd2a69` | `#ff8fc3` | 3.40 | 5.44 | 5.68 | 5.07 | 4.89 | 5.68 | 5.40 | 8.65 |
| purple | `#8a55f7` | `#f1ebfe` (12%) | `#7444de` | `#c3a6ff` | 4.26 | 5.55 | 5.79 | 5.18 | 4.98 | 5.79 | 4.31 | 8.87 |
| blue | `#2f54eb` | `#e8ecfd` (11%) | `#2a4bd8` | `#8fa9ff` | 5.61 | 6.50 | 6.78 | 6.06 | 5.76 | 6.78 | 3.28 | 8.06 |
| green | `#16a05a` | `#e1f3ea` (13%) | `#0a7340` | `#5fe39a` | 3.24 | 5.68 | 5.93 | 5.30 | 5.15 | 5.93 | 5.67 | 11.23 |
| yellow | `#ffc83d` | `#fff1cd` (26%) | `#7d5700` | `#ffe28f` | 1.48 | 6.22 | 6.49 | 5.80 | 5.78 | 6.49 | 12.40 | 14.34 |
| orange | `#ff7a2e` | `#ffece2` (14%) | `#a8490e` | `#ffb27a` | 2.49 | 5.55 | 5.79 | 5.18 | 5.06 | 5.79 | 7.37 | 10.33 |
| red | `#e5484d` | `#fce9ea` (12%) | `#b9262c` | `#ff9497` | 3.75 | 5.96 | 6.22 | 5.56 | 5.33 | 6.22 | 4.90 | 8.62 |

Extras:

| Token | Value | Use |
|---|---|---|
| `--yellow-deep` / `bg-yellow-deep` | `#e0a100` | the breakout stroke (lines on video and charts, yellow dots on paper) |
| `--night` / `--night-2` | `#170f33` / `#2c1b6b` | the Pro card surface. White text: 18.2:1 and 14.2:1; white/72 at 8:1 or better |
| `--grad-spectrum`, `bg-grad-spectrum` | pink → purple → blue (90°) | rails, rings, hairline borders, small marks |
| `--grad-spectrum-ink`, `bg-grad-spectrum-ink` | the same at -ink strength | pills and tags carrying white text |
| `--grad-aurora`, `bg-aurora` | night + blue light top-left + pink light bottom-right | the Pro card only |
| `bg-grad-{hue}` | glow → base at 135° | avatar discs, plan glyphs, glow blobs, step dots |
| `shadow-glow` + `shadow-{hue}/NN` | 0 18px 44px −14px | coloured glow under hovered tiles and the featured card |

Folded data tokens. These are now aliases with **unchanged values**, so existing code renders the same:
`--accent` = `--blue`, `--growth` = `--green`, `--decline` = `--red`, `--breakout` = `--yellow-deep`,
`--breakout-glow` = `--yellow`, `--growth-ink` / `--decline-ink` / `--breakout-ink` = the hue's `-ink` step.
Keep using `growth`, `decline` and `breakout` names in data code (charts, trend chips) and hue names in UI code.

Orange is the one hue added beyond the owner's six. It carries warm categories (Food, Home, Audio, Organize),
which keeps the 20 Viral Now niches and the analysis mosaic from repeating hues.

## 3. Rules

1. **Text stays ink.** Body, paragraphs, list items, prices, button labels and headings are `ink`, `ink-2` or `muted`.
   Coloured text is limited to: chips, badges, tags, mono labels, links, category labels, step indexes,
   and **at most one keyword per headline**, only where the hue means something (section 4 lists all four:
   hero *viral*, pricing *week*, tracking *grow*, MCP *your AI agents*). All other Boska keywords stay ink.
2. **Readable coloured text uses `-ink`.** Base colours may be text only at display size (24px bold or larger,
   or 32px regular or larger) and only pink, purple, blue, green and red. Those hold 3:1 or better on `--bg`.
3. **Yellow and orange are fill-only on light surfaces.** Put ink text on them (12.4:1 and 7.4:1). Use
   `yellow-deep` for yellow dots and lines, and `orange-ink` for orange strokes that carry meaning.
4. **White text sits on `-ink` fills or `--night`.** Never put white on a base colour (pink 3.55, green 3.38 and yellow 1.55 fail).
5. **Hues per view.** A 1440×900 viewport shows at most **3 UI hues** plus the data hues. There are three named
   exceptions, each a deliberate "everything" moment: the open bento analysis mosaic, the Viral Now niche row,
   and the footer wordmark cascade.
6. **Area.** Outside tile backdrops, colour covers ≤ 10% of a viewport. Tile backdrops use `-soft` only, never a base fill.
   There are no full-bleed coloured sections.
7. **One hue per component.** A card, tile or chip has one identity hue. Green trial and saving chips may
   join it (pricing). Data hues may join it (trend chips).
8. **Data semantics win.** In any view that shows trend data, yellow, green and red mean breakout, growing and declining. Do not use
   those hues as a decorative identity *in the same component* as trend data. Tracking uses pink, purple
   and blue for its series for this reason.
9. **Gradients.** Only `bg-grad-{hue}` on small marks, the spectrum as lines, rings and tags, and aurora on the Pro card.
   No gradient text. No purple-to-blue washes behind content.
10. **Primary CTAs stay ink** (`Button variant="primary"`), and paper on `--night`. Colour goes to secondary CTAs
    (pricing) and to accents around CTAs, never to the main "Get started".
11. **Focus rings stay `--accent` (blue)** everywhere, including inside coloured tiles.
12. **Quiet sections** keep the rhythm: the statement and simulator, testimonials (avatars only), FAQ, and the
    newsletter half of the footer. Loud sections: hero, How it works, bento, pricing, Viral Now.

### Implementation helpers (for workers)

- **Tone variables.** When a hue comes from data (a niche, a category, a plan), set CSS variables on the element
  and use arbitrary-value classes. Add `src/lib/tones.ts`:
  `export type Hue = "pink"|"purple"|"blue"|"green"|"yellow"|"orange"|"red";`
  `export const toneVars = (h: Hue) => ({ "--tone": \`var(--${h})\`, "--tone-soft": \`var(--${h}-soft)\`, "--tone-ink": \`var(--${h}-ink)\`, "--tone-glow": \`var(--${h}-glow)\`, "--tone-mark": h === "yellow" ? "var(--yellow-deep)" : h === "orange" ? "var(--orange-ink)" : \`var(--${h})\` }) as React.CSSProperties;`
  Then use `bg-[var(--tone-soft)] text-[var(--tone-ink)]`, and `bg-[var(--tone-mark)]` for dots and lines on paper.
- **Chip and Badge.** Extend `ChipTone` and `BadgeTone` in `src/components/ui/chip.tsx` and `badge.tsx` with the seven hues:
  Badge `{hue}` = `bg-{hue}-soft text-{hue}-ink`. Chip text = `text-{hue}-ink`. Chip dot = `bg-{hue}`, with
  yellow using `bg-yellow-deep` and orange `bg-orange-ink`. Keep `accent`, `breakout`, `growth` and `decline` as they are.
- **Tailwind only generates classes it finds in source.** Write class names out in full (`bg-pink-soft`), never
  `bg-${hue}-soft`. For dynamic hues, use `toneVars` or a full static map.

## 4. Placement map

Paths are relative to `src/components/`. "→" means change from the current treatment to the new one.

### Navbar (`layout/navbar/index.tsx`, `mobile-menu.tsx`): quiet
- The active-page dot (line ~215, `bg-accent`) becomes per page: Pricing `bg-purple`, Viral Now `bg-red`, Resources `bg-green`.
  Mobile menu: the same dot beside the active link.
- Logo, links, sound toggle and Login stay neutral. "Get started" stays ink.

### Hero (`sections/hero/*`). Hues: pink and blue, plus data
- **"viral"** (`hero-board.tsx` ~436, `text-accent`) → `text-pink`. Display size, 3.40:1 on `--bg`. It matches the gift's
  pink ribbon, and the gift's blue box matches the blue "Deep Search" chip.
- **Offer line** "Your first Deep Search is *on us.*": text stays ink. Keep `s.offerOnUs` ink.
  The gift image carries the colour.
- **Deep Search mode chip** (~546): stays `bg-accent/10 text-accent`. This is the product's blue.
- **Beam and orb** (~664–681): stay `--accent`.
- **Count chips** (`count-chip.tsx`): "10 platforms" `bg-blue-soft text-blue-ink`, "100,000+ niches" `bg-purple-soft text-purple-ink`,
  "10,000,000 videos" `bg-pink-soft text-pink-ink`. No borders.
- **Video cards**: data only. The breakout line `--breakout` (yellow-deep), the glow `--breakout-glow`, growing `--growth`, declining `--decline`.
  Status chips use `-ink` text on paper with a base dot. The score badge stays neutral. The card back's hexagon
  stat fill: `--accent` at 18% with a `--accent` stroke (unchanged role).
- Platform strip: neutral.

### Statement + simulator (`sections/statement-simulator/*`): QUIET
- **Statement chips** (`scene.module.css` `.chipInner::after`): replace the neutral 8% inset ring with a 1.5px ring
  in a hue at 55% strength, cycling by chip number n: 1 pink, 2 blue, 3 yellow-deep, 4 green, 5 purple, 6 pink
  (`box-shadow: inset 0 0 0 1.5px color-mix(in oklab, var(--pink) 55%, transparent)`). On `.chip:hover .chipLift`
  add `filter: drop-shadow(0 6px 14px color-mix(in oklab, <hue> 40%, transparent))`. Words and *works.* stay ink.
- **Simulator**: no change. It emulates the app, so it stays neutral plus `--accent`. Score badges and trend data keep data hues.

### How it works (`sections/how-it-works/*`). Hues: pink (01), purple (02), blue (03)
- Step hue by index: **01 Assistant = pink, 02 Planner = purple, 03 Watcher = blue.**
- **Heading verb pills** (`hiw-heading.tsx` ~102–111, active `bg-accent/10 text-accent`): active pill
  01 `bg-pink-soft text-pink-ink`, 02 `bg-purple-soft text-purple-ink`, 03 `bg-blue-soft text-blue-ink`. The superscript
  index takes the same `-ink`. Inactive and hover states stay as they are.
- **Rail line** (`hiw-steps.tsx` ~108, `bg-accent`) → `bg-grad-spectrum` drawn vertically:
  `background-image: linear-gradient(180deg, var(--pink), var(--purple) 50%, var(--blue))`. Use an arbitrary class
  or the module CSS. Keep the scale transform.
- **Rail nodes** (~170, `data-[on=true]:border-accent bg-accent`) → the step hue (pink, purple, blue).
- **Step index** (~181, `text-accent`) → `text-pink-ink`, `text-purple-ink` or `text-blue-ink`. The hint pointer icons (~234,
  `plan-stage` ~477) use the step's base hue.
- **Q/P legend** (`hiw-heading.tsx` ~71–75) and **Tag** (`plan-stage.tsx` ~726):
  Q = `bg-purple-soft text-purple-ink`, P = `bg-yellow-soft text-yellow-ink`. Highlighted row (`hiw.module.css`
  `.hlRow.is-hl [data-tag]`): Q → `background: var(--purple-ink); color: #fff`, P → `background: var(--yellow); color: var(--ink)`.
  Add `data-kind="q|p"` to Tag to select.
- **Plan stage** (step 02, purple): `.link.is-hl` stroke → `var(--purple)` for q links and `var(--orange-ink)` for p links.
  `.hlChip.is-hl` (keyword chips) → purple mix (same recipe as now, with `--purple`). Spine nodes `fill-accent` → `fill-purple`.
  The pulse dot (~466) → `bg-purple`. The gate ring (~781) → `ring-purple`. **"kept"** count (~692, `text-accent`) → `text-green-ink`
  (passed means good). The timeline cursor (~793–795) → purple.
- **Rank stage** (step 03): stays `--accent` (blue): tile ring, rank badge, scanline and "WATCHING" label, progress bar,
  matched keywords (~576 → `text-blue-ink`), the score chip (~599).
- **Ask visual** (step 01, pink): caret (~168) → `bg-pink`, spinner top border (~138) → `border-t-pink`, status pill
  (~144) → `bg-pink-soft text-pink-ink`. The selected brief chip (Pet gadgets, `brief-picker.tsx`, now `bg-ink`) → `bg-pink-ink text-white`.
  The **"Deep Research" mode chip (~174)** stays `bg-accent/10 text-accent` (product UI).
- **Outro** (`follow-up.tsx`): "→ BACK TO ASSISTANT" arrow → `text-pink`. The suggestion `↳` glyphs → `text-pink`. The agent
  avatar "C" stays ink. "Continue in ContHunt" stays ink.

### Bento (`sections/bento/*`). Hues: multi (the owner's main ask)

**Big analysis tile** (`analysis-tile.tsx`, `analysis-tile.module.css`, `analysis-panels.tsx`)
- Tile backdrop stays `bg-surface` and gains a **mesh**: three absolutely positioned blobs inside `.tile`, below the
  video (`z-index: 0`, `pointer-events: none`, `border-radius: 50%`, `filter: blur(64px)`), drawn in the rest state:
  pink (`--pink`, 300px, top 6%, left 18%, opacity .20), blue (`--blue`, 280px, top 30%, right 14%, opacity .16),
  yellow (`--yellow`, 260px, bottom 4%, left 34%, opacity .26). When the mosaic opens, fade all three to 40% of
  their opacity over the open timeline, so the white panels read.
- **Rest chips** (Hook, Re-rank, Views, Demo clarity) take their open-panel hue: label text `-ink`, plus a 6px
  `rounded-full` dot in the base before the label. Hook = pink, Re-rank = green, Views = blue, Demo clarity = purple.
- **"Hover me" hint**: the pointer icon → `text-pink`. Text stays ink.
- **Open mosaic panels** stay `bg-paper border-hairline`. Each panel's `PanelLabel` gets `text-{hue}-ink` plus a 6px dot,
  and one inner element takes the base:
  | Panel | Hue | Inner accent |
  |---|---|---|
  | hook | pink | `0:00` and `Problem/Solution` Tags → `bg-pink-soft text-pink-ink` |
  | rerank | green | the arrow and "#7" → `text-green-ink`; the step dots → `bg-green` |
  | metrics | blue | the "Eng. rate" derived `d` superscripts → `text-blue-ink` |
  | qual | purple | the active question's dot and number → `bg-purple` / `text-purple-ink` |
  | trend | green | already `--growth`; "● Growth" → `text-green-ink` |
  | scores | blue | bars ≥ 50 → `bg-blue`; bars < 35 stay `bg-decline` (data) |
  | audio | orange | the played part of the waveform → `bg-orange-ink` (meaningful, so it needs 3:1); the playhead → `bg-orange-ink` |
  | virality ("Why it works") | yellow | a `bg-yellow-soft` highlight behind the claim text (ink on yellow), the "REASON 01/05" index → `text-yellow-ink` |
  | quant ("Measures") | purple | the `d` superscripts → `text-purple-ink` |
- The close (×) button stays paper and ink.

**Feature tiles** (`feature-tile.tsx`, `feature-grid.tsx`, fragments). Pass a `hue` on each `FEATURES` entry in `data.ts`.
| Tile | Hue | Backdrop |
|---|---|---|
| Multi-platform | pink | `bg-pink-soft` |
| Deep research | purple | `bg-purple-soft` |
| Niche hunter | yellow | `bg-yellow-soft` |
| Velocity metrics | green | `bg-green-soft` |
- `FeatureTile` `<article>`: `bg-surface` → the backdrop above, plus `group/tile`. Add a glow blob as the article's first child:
  `pointer-events-none absolute -bottom-1/3 -right-1/4 aspect-square w-3/4 rounded-full bg-{hue} opacity-[.22] blur-3xl transition-[opacity,scale] duration-500 ease-out group-data-[active=true]/tile:opacity-[.36] group-data-[active=true]/tile:scale-110`
  (for yellow, use opacity .30, then .45). Put the caption and the fragment wrapper in `relative z-[1]`.
- The caption stays ink plus muted (muted on each soft tint is 5.0:1 or better).
- Fragment cards: `border-hairline` → `border-{hue}/20` (yellow: `border-yellow-deep/30`). The shadow stays.
  When active, add `shadow-glow shadow-{hue}/25`.
- Inner accent (the one colour moment per tile):
  - **Platforms** (`fragment-platforms.tsx`): the selected platform chip `bg-ink text-paper` → `bg-pink-ink text-white`. The typing caret
    (~108) → `bg-pink`. The send button stays ink.
  - **Research** (`fragment-research.tsx`): progress segments that are played or active (~65) → `bg-purple`. The active scene highlight (~77)
    `bg-surface` → `bg-purple-soft`. The active row's time and tag (~92–95) → `text-purple-ink`.
  - **Niche** (`fragment-niche.tsx`): a hovered or locked niche chip → `bg-yellow text-ink` with `ring-1 ring-inset ring-yellow-deep`. The lock
    bracket corners → `border-yellow-deep`. The "Locked" label stays ink.
  - **Velocity** (`fragment-velocity.tsx`): the rising line (~88, `text-ink`) → `text-growth`. Add an area fill under the line (a gradient from
    `--growth` at 20% to 0). The faded duplicate (~82) → `text-growth/20`. The creator-average dashed line stays `text-ink/35`. The tooltip pill
    (~115, `bg-ink`) → `bg-green-ink text-white`.
- Mobile: tiles get the same colours. `active` follows the in-view logic that is already there.

### Pricing (`sections/pricing/*`, also used on /pricing). Hues: pink, purple (featured), blue, plus green
Plan identities form the spectrum from left to right: **Creator = pink, Pro = the spectrum on night, Research = blue.**
- **Billing toggle** (`billing.tsx` ~74): "Save up to 20%" Badge `tone="accent"` → `bg-green-soft text-green-ink`
  (or `tone="green"` once Badge is extended).
- **Trial badge** (`plan-cards.tsx` `TrialBadge`): `tone="accent"` → green: `bg-green-soft text-green-ink` on light cards;
  on Pro, `bg-green/20 text-green-glow ring-1 ring-inset ring-green-glow/30` (7.3:1).
- **"save 14% / 20%"** in `BillingLines`: the "save NN%" fragment → `text-green-ink` (on Pro, `text-green-glow`).
  The rest of the line stays as it is.
- **Discount badge** ("−49% vs list"): stays `tone="ink"` on light cards. On Pro it becomes paper with `text-night`. It stays neutral so a card shows at most 2 hues.
- **Creator and Research cards** (light):
  - Surface `bg-paper border-hairline`, plus a top wash: `absolute inset-x-0 top-0 h-40 bg-linear-to-b from-pink-soft to-transparent`
    (Research: `from-blue-soft`) inside the card, with the content above it.
  - Plan glyph: a 22px `rounded-[7px] bg-grad-pink` (Research: `bg-grad-blue`) before the plan name. The name stays ink.
  - CTA (`PlanCta`, non-featured): `bg-pink-soft text-pink-ink ring-1 ring-inset ring-pink/30`, hover
    `bg-pink-ink text-white`. Research uses the blue equivalents.
  - Check glyphs (`CheckGlyph`): stroke `--pink` / `--blue`.
  - Allowance blocks (the full card's Deep Search tiles, `bg-ink` ~397): filled → `bg-pink` / `bg-blue`, and the partial or empty
    tile → `{hue}/30`.
  - **Research "Best value" tag** (`CardTag`, non-featured): `bg-blue-soft text-blue-ink`, no border.
  - 3D tilt hover: `shadow-glow shadow-pink/25` (or `shadow-blue/25`).
- **Pro card (featured)**. This replaces the white card with a black border:
  - Surface: `bg-aurora`, with a 1.5px spectrum ring
    (`border: 1.5px solid transparent; background: var(--grad-aurora) padding-box, var(--grad-spectrum) border-box;`).
    Shadow: `0 30px 60px -22px color-mix(in oklab, var(--purple) 70%, transparent), 0 10px 24px -12px color-mix(in oklab, var(--pink) 40%, transparent)`.
  - Text: name and price `text-white`. Secondary lines (`/mo`, billing lines, notes, the trial sentence) `text-white/72`. List text `text-white/85`.
    Dividers `border-white/12`. Strike price `text-white/60`. Leads such as "25" `text-white`.
  - Plan glyph `bg-grad-spectrum`. Check glyphs: stroke `--purple-glow`.
  - **"Most popular" tag**: `bg-grad-spectrum-ink text-white` (5.7:1 or better at every stop).
  - **CTA**: paper button (`bg-paper text-ink`). Hover: `shadow-glow shadow-pink/50` and arrow nudge. The worker's shimmer sweep may run
    across it.
  - Allowance blocks: filled tiles step through the glow colours from left to right (`--pink-glow`, then `--purple-glow`, then `--blue-glow`,
    interpolated by index); empty tiles `bg-white/20`.
  - Shimmer: a diagonal sheen `linear-gradient(115deg, transparent 35%, rgb(255 255 255 / .14) 47%, rgb(255 255 255 / .04) 53%, transparent 62%)`
    that moves with the pointer. For parallax, the aurora's two radial centres may shift ±6% with the tilt.
- **Footer note and calculator link**: neutral. The link arrow stays ink.
- **/pricing page** (`pages/pricing/*`): the same cards. Headline *keep* stays ink. Calculator: the recommended plan
  (`use-result-tier.ts`) highlights in its identity hue (Creator pink, Pro purple: `bg-purple-soft text-purple-ink`, Research blue).
  "Hours saved" and the time-saved readout numerals → `text-green-ink`. Slider tracks and thumbs stay `--accent`.
  `pricing-faq.tsx`: quiet.
- **Pricing headline** (`pricing/index.tsx` ~42): *week* → `<Emphasis className="text-green">` (display, 3.24:1). It echoes
  the green trial chips.

### Testimonials (`sections/testimonials/*`): QUIET
- Avatar initials (`card.tsx` ~53): `bg-surface text-ink` → by index mod 6: pink, blue, green, yellow, purple, orange
  (`bg-{hue}-soft text-{hue}-ink`). Hover (`group-hover/card:bg-ink`) → `group-hover/card:bg-{hue}-ink group-hover/card:text-white`
  (yellow: `bg-yellow text-ink`; orange: `bg-orange-ink text-white`). Use a static class map. Quotes, cards and the section stay neutral.

### Tracking (`sections/tracking/*`). Hues: pink, purple, blue, plus data
- Headline *grow* (`index.tsx` ~39) → `text-green` (display; growth meaning).
- **Experimental badge** (~34, `tone="accent"`) → `bg-purple-soft text-purple-ink`.
- **Account identities**: Glossier = pink, Dr. Neera = purple, rhode = blue. In `data.ts`, `ChartTone` `"ink"|"accent"|"muted"` →
  `"pink"|"purple"|"blue"`, stroke `var(--pink)` / `var(--purple)` / `var(--blue)`. The chart legend swatches follow. The latest-point dot
  uses the series base.
- Role badges (`account-column.tsx` `ROLE_TONE`): DTC BRAND, CREATOR and COMPETITOR → each account's hue (`bg-{hue}-soft text-{hue}-ink`).
  Avatar fallback ring: `ring-{hue}/30`.
- The followers legend dash before "FOLLOWERS" → account base.
- **Data stays data**: `DeltaChip` (growth and decline) and the video Δ24h chips (breakout yellow, growth green, steady neutral) are unchanged. In mini
  bars, the latest bar stays in its data tone.
- "Updates daily" dot (now accent) → `bg-green` (live and healthy). The snapshot-strip latest tick stays `--accent`.
- `highlight.tsx` (hover a feature, find it on the board): the outline stays `--accent`.

### MCP (`sections/mcp/*`). Hues: purple, blue, plus a little orange. Techy
- Headline line "your AI *agents*" (`index.tsx` ~143, `text-accent`) → `text-purple` (display, 4.26:1).
- "Agent ready" dot and ping (~78–79) → `bg-green` / `bg-green/40` (status ok).
- **ASCII band** (`ascii-band.tsx` ~40, `ascii-engine.ts`): the engine now reads a single `accent`. Change it to read a palette array
  `[--pink, --purple, --blue, --green]`. Hover scramble tints glyphs by distance band (nearest = pink, then purple, then blue). The click
  ripple's ring uses green. The idle glyph colour stays muted ink.
- **Tool index** (`tool-index.tsx`): group labels DISCOVER → `text-blue-ink`, ANALYZE → `text-purple-ink`, ORGANIZE →
  `text-orange-ink`, ACCOUNT stays `text-ink-2`. The `[ ]` brackets around the active tool (~197–208, `text-accent`) → the group's ink.
  The dwell rule (~358) → the group's base (ORGANIZE: `bg-orange-ink`).
- **Code / setup panel** (`setup-panel.tsx`, `segments.ts`): tokenised syntax: argument keys `text-purple-ink`, string values
  `text-green-ink`, function name ink, punctuation `text-muted`. Shell prompts `$` → `text-pink-ink`. Client chips stay neutral.
- Links "Read the MCP guide" and "View the docs" (~56): stay `text-accent`.

### Blog gallery (`sections/blog/*`) and Resources (`pages/resources/*`)
- Category identities: **Product = blue, Research = purple, Playbooks = pink, Guides = green.**
- `blog-card.tsx` ~41: the category label → `text-{hue}-ink`, plus a 6px `rounded-full bg-{hue}` dot before it. Read time stays muted.
- Covers (`cover/*`): unchanged (photographic, already designed).
- Gallery arrows and the all-articles card: neutral. The all-articles card's arrow disc may use `bg-grad-spectrum` on hover only.
- `/resources` filter chips (`resources-browser.tsx`): the sliding active pill uses the category's soft and ink colours (`toneVars`);
  "All" stays ink. Counts within the active chip use `-ink`. Featured post category label: same rule as the card.
  Article pages (`article.css`): links stay `--accent`. The TOC active marker → the article's category base.
- `cta-band.tsx` (Resources and Viral Now): quiet, ink CTA.

### Viral Now (`pages/viral-now/*`). Hues: niche scale (exception) plus red page identity
- Niche hue map: add a `src/content/viral-now/niche-hues.ts` keyed by slug.
  | Hue | Niches |
  |---|---|
  | pink | beauty-skincare, fashion-style, parenting-family |
  | red | fitness-gym, sports, cars-motors |
  | orange | food-recipes, home-diy |
  | yellow | comedy-skits, tiktok-shop-finds, education-science |
  | green | personal-finance, pets-animals, wellness-mindset |
  | blue | tech-gadgets, travel, business-creator |
  | purple | gaming, dance-music, lifestyle-vlogs |
- **Niche selector** (`niche-selector.tsx`): inactive pills stay neutral, and each gets an 8px `rounded-[3px]` swatch in
  `--tone-mark` after the thumbnail. The sliding active highlight: "All" stays ink. For a niche, the highlight →
  `bg-[var(--tone-soft)] ring-1 ring-inset ring-[var(--tone)]/40` and the active label → `text-[var(--tone-ink)]`.
- **Row headers** (`niche-row.tsx`): an 8px swatch before the niche name. "See all →" hover → `text-[var(--tone-ink)]`.
- **Outline rank numerals**: the stroke stays ink or hairline at rest. On card hover, the numeral stroke → `--tone-mark`.
- **Single-niche grid** (`niche-view.tsx`): the header gets a soft band `bg-linear-to-b from-[var(--tone-soft)] to-transparent` (h-40,
  behind the header).
- Page identity red: the "week of" status dot in the header (`header-parts.tsx`) → `bg-red` with a soft ping (live). The nav dot
  is red. The `viral-now.module.css` growth bars (~1124, 1132) stay `--growth` (data).
- Video dialog: neutral plus data. The "How ranking works" explainer: the four ranking factors may take blue, purple, green
  and yellow dots (reach, engagement, velocity, recency).

### FAQ (`sections/faq/*`): QUIET
- No colour. The open button stays ink. The progress dashes stay ink. Inline fact chips stay surface. Focus rings stay accent.

### Footer (`sections/footer/*`)
- The newsletter half stays quiet (ink button).
- **Wordmark cascade** (`wordmark.tsx` ~64–67, `LAYERS`): from top to bottom
  1. `color-mix(in oklab, var(--yellow) 80%, white)`
  2. `color-mix(in oklab, var(--pink) 58%, white)`
  3. `color-mix(in oklab, var(--purple) 60%, white)`
  4. `color-mix(in oklab, var(--blue) 34%, white)`
  Keep the blur, top, alpha and amp values. Update the file comment (no longer "data palette").
- Crosshair lines (~350–353): `bg-accent/55` → `bg-pink/55`, and the ring → `border-pink`. The tag stays ink.
- The footer brand glyph and links stay neutral. "Soon" badge: outline.

### 404 (`layout/not-found/*`): unchanged (`--accent`).

## 5. Rhythm down the Home page

Hero (pink, blue: loud) → statement (quiet, faint hue rings) → simulator (neutral app) → How it works
(pink to purple to blue) → bento (multicolour: the peak) → pricing (pink, aurora, blue; green chips) → testimonials (quiet,
avatars) → tracking (pink, purple, blue series plus data) → MCP (purple, blue, techy) → blog (category dots) → FAQ (quiet) →
footer (sunset cascade).

## Owner overrides (2026-10-16, after the first color pass)

These win over the placement map above:
- **Hero *viral*:** an animated multi-hue gradient (4 or 5 palette hues, a slow seamless drift, static under reduced motion). This replaces the solid pink and is the one deliberate exception to "no gradient text".
- **Hero offer line:** no gift icon. "Try it ↓" is the same ink as the offer text, with no color.
- **Hero count chips:** all neutral (the original chip style), not blue, purple and pink. The figures are 7 platforms, 104,862 niches and 10,384,719 videos.
- **Statement chips:** no colored rings or hover glow (back to the original look).
- **How it works rail:** ONE continuous multi-hue gradient over the whole rail (visibly distinct hues per step zone) with a gentle flowing motion, not per-step pink, purple and blue.
- **Bento analysis tile:** a neutral gray linear-gradient backdrop, with no pink, blue or yellow mesh blobs.
- **Testimonials:** face photos in place of colored initials.
- **Compact navbar:** shadow at about half its previous intensity.
- **Pricing cards:** follow `docs/revamp/sections/pricing-rev2.md` Rev 6 (pricing rev 3: the owner's picture head in each plan's hue, purple, red and blue; Creator a near-black card 7% larger, Pro and Research light grey and 7% smaller; a wide row; green offers), which supersedes Rev 5's paper cards and the pricing placement above.
