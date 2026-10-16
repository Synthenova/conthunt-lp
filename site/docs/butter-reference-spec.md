# ContHunt landing revamp: reference target spec (Butter study, type system, requirements)

**Evidence tags.** [V] means verified: fetched, measured or read from source on 2026-10-12. [I] means inferred. [R] means my recommendation. I did not modify any project files. Scratch downloads and screenshots are under `C:/Users/win10/AppData/Local/Temp/butter_ref/` and `C:/Users/win10/AppData/Local/Temp/butter_shots/`. The viewport captures at 1440x900 are `t_0.png` through `t_13132.png`.

---

## 1. Butter.video teardown (live site, 2026-10-12)

### 1.1 Stack [V]
- **Framework:** Next.js App Router with RSC payload, styled-components 6.4.4 and Prismic CMS.
- **Motion:** GSAP 3.x with ScrollTrigger and InertiaPlugin. Text uses a custom `AnimateSplitText` built on SplitText. Smooth scrolling uses Lenis 1.3.25.
- **3D and shaders:** a react-three-fiber canvas (`R3FWrapper`, a 3D keychain in the hero), plus three.js, OGL and GLSL shaders.
- **Media pipeline:** Cloudinary (cloud `buttercreatives`).
- **Not found:** Lottie, Rive, Spline runtime and Framer Motion.
- **Page chrome:** a custom cursor labelled "Add butter", a loader ("It's a whole new timeline."), a page-transition mask and an iubenda consent banner.

### 1.2 Typography [V]
- **Primary face:** `DieGrotesk` (Klim, Kris Sowersby, 2025). It is variable, with weight 100–900 and an optical-size axis 6–42. Only one 400 woff2 is preloaded.
- **Secondary face:** `ABCDiatype` (Dinamo), used for small captions and footer eyebrows.
- **Mono:** eyebrows use `var(--font-abcd-mono, monospace)`. That variable is undefined, so the browser falls back to system monospace (seen as Courier-like on Windows).
- **Weight:** every computed weight on the page is 400. Butter uses no bold anywhere.
- **Root size:** `font-size: 62.5%`, so 1rem = 10px.
- **Fluid sizing:** each size scales between 375 and 1800 on the basis `min(100vw, 100vh*16/9)`.

Token object from the JS chunk, with values measured at 1440x900:

| Token | Size min→max (px) | Line height (mobile / desktop) | Tracking (em) | At 1440 |
|---|---|---|---|---|
| heading1 | 56→125 | 1.09 / 0.992 | 0 / +0.0032 | 107.6px |
| heading2 | 32→70 | 0.90 / 0.97 | +0.006 | 60.4px |
| heading3 | 32→50 | 1.00 / 0.96 | +0.008 | 45.5px |
| heading4 | 20→26 | 1.2 / 1.15 | +0.03 | — |
| heading5 | 18→20 | 1.2 / 1.15 | +0.03 | — |
| body | 20→21 | 24px | +0.033 | 20.7px |
| bodySmall / interface | 16 | 1.31 / 1.25 | +0.044 | 16px |
| cap (mono or Diatype eyebrow) | 12→14 | 24px | +0.036 | 13.5px, at 40–50% opacity |

Headline `max-width` is 15–20ch. Body text runs 30–50ch.

### 1.3 Colour tokens [V]
- **Page:** `--butter-white #FAFAFA`. Off-white is `#F7F7F7`.
- **Surfaces:** cards and footer use `--butter-light-grey #EDEDED`. Related greys are `#EBEBEB` and `#E2E2E2`.
- **Ink:** `#0F0F0F` (true black), `#1E1E1E` (buttons) and `#3C3C3C` (charcoal).
- **Muted text:** `rgba(15,15,15,.4)` for eyebrows and secondary body; `.3` for the logo-strip caption.
- **Accents, used only inside media and effects:** yellow `#E9D352`, blue `#4DC5E5`, pink `#F9ABFF`, green `#63AD45`, red `#FF3333`.
- **Eases:**
  - out `cubic-bezier(.2,.715,.205,.99)`
  - inOut `(.835,.12,.225,.77)`
  - in `(.815,.005,.81,.195)`
  - outFast `(0,0,0,1)`

### 1.4 Layout rhythm at 1440 wide [V, measured]
- **Gutter and grid:** about 66px on each side (≈4.6vw). Two-column splits are 634 + 25 gap + 634. The four-card grid uses about a 25px gap.
- **Section padding:** 140px top and bottom on most sections, 235–238px on the "story" sections. Two pinned scroll scenes are 1800px tall (2× the viewport).
- **Radii:**
  - cards and panels: 32px (3.2rem)
  - video squircles: 22.4%
  - buttons: about 12–16px
  - page bottom corners: 60px, lifting the page over an `#EDEDED` footer with 160px top padding
- **Header:** two floating pills. The left nav pill is `#EDEDED`-ish and collapses to logo plus "⋮" on scroll. The right pill holds Login and a dark "Try for free" button.

### 1.5 Section inventory [V]

| # | Section | Height | Pattern |
|---|---|---|---|
| 1 | Hero | 900 | WebGL 3D object; one-line centred H1 "Engineered for Creativity" (107px/400); one-line sub; one dark button |
| 2 | Ticker | 220 | 30%-opacity caption above a monochrome logo marquee (24 logos ×2) |
| 3 | StatementTimeline (pinned) | 1800 | Centred 3-line H2 with **inline video squircles between words**, then a dark editor-timeline UI panel (0s–7s ruler, play/pause, "Dur 5s") with 5 squircle loops |
| 4–6 | Story 1/2/3 | 1341 / 813 / 1800 | Mono eyebrow, then a 4-line H2 left; dark UI panel right (library, settings inspector, app shell). Story 2 has inline UI icons (dial, sliders) in the H2 |
| 7 | FeatureCards | 990 | Eyebrow, H3 and ghost button; 4 cards (2 dark, 2 grey) holding UI fragments; title plus 40%-grey body |
| 8 | FeaturesHighlight | 977 | Tabbed "Create in 3 ways" (Remix / Describe / Code) |
| 9 | GalleryCarousel | 958 | 24 videos: 9:16 template cards in a grey 32px-radius tray, title plus category, centred dark CTA |
| 10–11 | Features / DoubleBlock | 914 / 994 | Text-left/media-right split, then two grey cards with arrow buttons |
| 12 | BlockHighlight | 977 | Large black media panel plus a creator list as big typographic rows ("Dedcool ilovecreatives": name in black, studio in 40% grey) |
| 13 | Footer | 1120 | Mono eyebrows and large link lists |

Overall: about 14,250px of page, **49 `<video>` elements** and one canvas. All copy is short and declarative.

### 1.6 How statements are set [V]
- Statements are large, regular-weight, centred and ragged, broken into 3 lines of 4–6 words with a period at the end.
- Emphasis is never done with bold or serif. Butter uses four devices instead:
  - inline media chips sized about 1 cap-height+ inside the line
  - a `highlightWords` prop that keeps the first N words at full opacity and dims the rest to 0.3
  - colour or name contrast (black vs 40% grey) in lists
  - a soft pill highlight, seen in the reference screenshot
- Eyebrows above headings are monospace at 40% opacity, with a `hueRotate` colour scramble on headings.

### 1.7 Decorative UI fragments [V]
- Recreated product chrome is used as illustration: a timeline ruler, a settings inspector (Rotation 78/100, Tilt, Material dropdown), a library panel, a floating rich-text toolbar, "See details" pills, segmented tabs (Videos/Images/Audio) and a "transparent" text chip.
- These are DOM/SVG with real text, not screenshots, and sit mostly on dark `#0F0F0F` 32px-radius panels.

### 1.8 Media and video pipeline [V, from code]
- **Element:** `<video loop muted playsInline autoPlay={false} controls={false} preload={lazy ? "none" : "metadata"}>`. Sources are MP4 and WebM.
- **Lazy playback:** an IntersectionObserver with `rootMargin "200px 0px"` gates `.load()`. `.play()` and `.pause()` are driven by visibility; play rejections are caught with `console.warn`.
- **Progress:** exposed to CSS as `--progress` via `timeupdate`.
- **Cloudinary quality:** `q` of 60 on one breakpoint and 75 on the other (`isMobile ? 60 : 75` [I]).
- **Formats seen:** squircle "app icon" loops, 9:16 template cards, and large 16:10 dark panels. Logos and photos are Prismic PNG/JPG at @2x.

### 1.9 Motion [V]
- **Split-text defaults:**
  - lineDuration .6s, lineDelay .1s
  - wordDuration 1s, wordDelay .05s
  - maskShow/Hide .5s
  - yPercent 60 with ease outFast
  - trigger `rootMargin "0px 0px -10% 0px"`, fires once
- **Reduced motion:** handled via `gsap.matchMedia` (sets `opacity: 1`). An `aria-hidden` animated copy sits next to a screen-reader-only copy.
- **Other motion:** Lenis smooth scroll, two pinned scroll-scrubbed scenes, a logo marquee, WebGL hero and shader effects in media, a custom cursor, and hover `translateY(-2px)` with a .2s ease-out.

### 1.10 Reference screenshot readout ("Trusted by the bold") [V, sampled pixels]
- **Provenance:** this section is not on the live butter.video HTML, nor in the Wayback captures from 2023-10-31 and 2026-09-03. Treat it as a standalone reference. It is probably an earlier or different Butter-family page [I].
- **Background:** samples at **#FFFFFF**, not grey. The brief says "very light grey"; live Butter uses `#FAFAFA`.
- **Section label:** "02" in mono, about 10px, colour `#D1D1D1`.
- **Heading:** light grotesk at about 32px, `#ADADAD`.
- **Divider:** a 2px dot below the heading.
- **Statement:** about 30px on a 40px line, `#373737`, centred, 3 lines, about 650px wide (about 45ch).
- **Pill highlight:** fill `#F6F6F6`, radius about 8px, padding about 0.3em by 0.15em, same text colour.
- **Toolbar fragment:** white `#FFFFFF` with a soft shadow, radius about 8px, about 36px tall. Icons are `#858585`. It contains "Heading 2 ⌄ | B I U | ● ⌄", centred under the statement.
- **Glass card:** grey gradient `#5C5C5C`→`#7A7A7A`, radius about 24px, with a white logo and "Antimetal / Website" in white over 60% white.
- **"See details" pill:** `#F3F3F3` with a soft shadow.
- **Logo row:** monochrome `#373737`, about 28px cap height, on an even 4-column grid.

---

## 2. Typography research

### 2.1 PP Neue Montreal (body) [V]
- **Designers:** Mat Desjardins and Francesca Bolognini (Pangram Pangram), version 3.00.
- **Families:**
  - Neue Montreal: 11 weights, Hairline 100 to Black 900, plus italics.
  - **Neue Montreal Text:** 7 weights, 200 to 700, plus italics, built for long-form reading and small sizes. Use this one for paragraphs.
- **Format:** variable, delivered as OTF/TTF/WOFF/WOFF2.
- **Siblings:** "Neue Montreal Mono" is sold as a separate product.
- **Price:** licences start at $40.
- **Licence types:** Print, **Web** (needed for every website, microsite or subdomain that embeds the font, priced on monthly pageviews; the FAQ's example tier is 10k/month), App, Social Media, Logo, Broadcast and Video Game.
- **EULA:** says to "purchase a Web License for each individual domain or subdomain." It prohibits making the fonts publicly downloadable or available (§3.7).
- **Trial:** "Free to try… for personal use as long as it is not used in a commercial project". The FAQ allows portfolios, client pitches and personal projects, and says trials ship "some selected key styles."
- **What this means [I]:** the trial covers design comps and pitch decks only. A production launch needs a purchased Web licence sized to pageviews, for each domain and subdomain (marketing, staging if public, and the app if it reuses the font).
- **Trial styles:** one third-party listing gives Book, Italic, Thin, Medium, SemiBold Italic and Bold. This is unverified.

### 2.2 Bold display candidates

| Face | Facts | Fit notes |
|---|---|---|
| **PP Formula** (Pangram) [V] | Desjardins; 6 widths (Condensed → Extended) × 18 styles = 108; variable; trial; from $40 | Width contrast with Neue Montreal; Condensed/Narrow Bold reads "sharp" [I] |
| **PP Monument Extended** (Pangram) [V] | 5 widths (Condensed to Extended) × 9 weights + italics; variable; trial; from $40 | Strong luxury/fashion display at Extended Bold/Black; hero-only, since it eats width [I] |
| **PP Right Grotesk** (Pangram) [V] | Slobzheninov; 130 styles; display widths Tall/Tight/Narrow/Compact/Casual/Wide/Spatial; variable; trial | Compact/Tight Bold gives punchy headlines; quirkier than Formula [I] |
| **PP Neue Montreal Bold/Black** [V] | Same variable file as body | Cheapest and most coherent; needs about −0.03em tracking to feel "display" [R] |
| **Söhne Breit** (Klim) [V: exists, 2019, Sowersby; family Söhne/Schmal/Breit/Mono] | Weight names and licence not verified | Wide, authoritative; also from the foundry behind Butter's Die Grotesk |
| **Neue Haas Grotesk Display** (Monotype, Christian Schwartz) [V] | On Adobe Fonts (web projects included with Creative Cloud; self-hosting is a separate Monotype purchase) | Classic Swiss bold; Adobe CDN dependency |

### 2.3 Keyword-emphasis candidates (luxury pattern)

| Face | Facts | Use |
|---|---|---|
| **PP Editorial New Italic** (Pangram) [V] | 8 weights 100–900, uprights and italics; variable; trial; from $40 | Default luxury italic serif; Ultralight/Light Italic against a bold sans gives the "fashion" contrast [R] |
| **Instrument Serif Italic** [V] | OFL; Rodrigo Fuenzalida and Jordan Egstad; Regular and Italic, 400 only | Free and small; condensed display italic [I] |
| **Fraunces Italic** [V] | OFL; variable with SOFT and WONK axes | Free alternative; softer, more "warm" than "luxury" [I] |
| **PP Playground** (Pangram) [V] | Contemporary semi-connected script; 5 styles (Thin 100 to Medium 500); variable; contextual alternates for full connection | True cursive, at most 1–2 moments per page [R] |
| **Pinyon Script** [V] | OFL; Nicole Fally; 400 only | Formal copperplate; risks a "wedding invite" read [I] |

### 2.4 Three pairing systems [R]

**A. "One-foundry editorial" (default).**
- **Faces:**
  - Display: PP Formula Narrow or Semi Condensed, 700–800, tracking −0.01 to −0.02em.
  - Body/UI: PP Neue Montreal 400–500, with Neue Montreal Text 400 for paragraphs.
  - Emphasis: PP Editorial New Light/Regular Italic.
  - Data: PP Neue Montreal Mono.
- **Licensing:** one vendor, one EULA and one pageview tier. All four have trials, so comps can start immediately; 4 web licences are needed before launch.

**B. "Wide luxury".**
- **Faces:**
  - Display: PP Monument Extended Bold (hero and section titles only; switch to Neue Montreal Bold below 600px wide).
  - Body: PP Neue Montreal and Neue Montreal Text.
  - Emphasis: PP Editorial New Ultralight Italic.
  - Data: Neue Montreal Mono.
- **Character:** the most fashion-forward. It needs strict line-length control because Extended runs long.
- **Licensing:** Pangram only.

**C. "Lean superfamily + free italic".**
- **Faces:**
  - Display: PP Neue Montreal 700, at −0.03 to −0.04em.
  - Body: Neue Montreal Text.
  - Emphasis: Instrument Serif Italic (OFL).
  - Optional single script word: PP Playground.
- **Cost and weight:** one paid family plus OFL, the lowest cost and bytes. It is the least distinctive and relies on the italic for character.

Alternatives: Söhne Breit can replace A's display for a Klim route (mixed licences), or Neue Haas Grotesk Display for teams with Adobe CC.

### 2.5 Where the brief departs from Butter (flag for audit)
1. Butter uses weight 400 everywhere; the brief wants bold display. This is a deliberate departure.
2. Butter has no serif and no script; the italic-serif or script accent comes from luxury/fashion practice, not from Butter.
3. Butter's fonts are Die Grotesk (Klim) and ABC Diatype (Dinamo), not Neue Montreal.
4. Butter tracks slightly *positive* because Die Grotesk has an optical-size axis. A bold Neue Montreal or Formula needs *negative* display tracking.

---

## 3. Toning Butter down for ContHunt [R]
- **Drop:**
  - WebGL/R3F hero
  - shaders
  - custom cursor
  - loader and page-transition mask
  - hue-rotate scramble
  - saturated accents (yellow, pink, blue, green)
- **Colour:** let colour come only from the videos. The UI stays monochrome plus at most one accent.
- **Dark panels:** Butter has 8+ dark `#0F0F0F` UI panels. Use at most one dark surface (for example the analysis-output card). Otherwise use light grey `#EDEDED`/`#F4F4F4` cards on a white or `#FAFAFA` page.
- **Pinned scenes:** at most one, versus Butter's two 1800px scenes. Preferably make it the isometric "search → analyze → explain" diagram.
- **Video density:** keep it high but small. Use many 9:16 tiles at 140–280px CSS width in walls and marquees, plus 1–2 featured loops up to 360px. Butter instead uses a few huge media panels. Every video should carry data (views, duration, hook label) so it reads as evidence, not decoration.
- **Copy:** bold headlines of 8 words or fewer with one italic keyword, plus a one-line subhead. Keep Butter's long regular-weight 3-line statement (the screenshot pattern) for one manifesto or trust section only.
- **Keep from Butter:**
  - whitespace (120–200px section padding at 1440)
  - mono section numbers and eyebrows
  - the pill highlight
  - floating UI-fragment graphics as DOM
  - inline media chips in one statement
  - split-line reveals
  - monochrome logo row
  - the creator list as big typographic rows

---

## 4. Design-system requirements (the capabilities a skill stack must support)

### 4.1 Tokens [R]
- **Colour:**
  - `bg #FFFFFF` or `#FAFAFA`
  - `surface #F4F4F4` / `#EDEDED`
  - `ink #0F0F0F`, `ink-2 #373737`
  - `muted rgba(15,15,15,.4)`, `faint #ADADAD`, `hairline #E6E6E6`
  - `pill #F6F6F6`
  - one accent
- **Radii:** 8 (pill, toolbar), 12–16 (buttons, video tiles), 24–32 (cards, trays).
- **Shadows:** soft only, for floating fragments (about `0 8px 24px rgba(0,0,0,.06)`).
- **Eases:** reuse Butter's out curve `(.2,.715,.205,.99)`.
- **Spacing:** fluid between 375 and 1440/1800, with gutter `clamp(20px, 4.6vw, 80px)` and a max content width of about 1400px.

### 4.2 Type scale (fluid `clamp`, 375 → 1440) [R]

| Role | Face | Size | Line height / tracking |
|---|---|---|---|
| Display XL (hero) | display Bold | 44→112px | 0.92–0.98 / −0.02 to −0.04em |
| Display L (sections) | display Bold | 34→72px | 0.95–1.0 |
| Display M (cards) | display Bold | 24→44px | — |
| Statement (manifesto) | Neue Montreal 400 | 24→40px | 1.25–1.33 (about 45ch, centred) |
| Body L | Neue Montreal Text | 18–20px | 1.5, max 38rem |
| Body | Neue Montreal Text | 16–17px | — |
| UI | Neue Montreal 500 | 14–16px | — |
| Eyebrow, section number, data | Mono | 11–13px | +0.03–0.04em, 40–50% ink; `font-variant-numeric: tabular-nums` |

### 4.3 Emphasis rules [R]
- **Italic serif:**
  - one phrase of 1–3 words per headline, display sizes only, never in body text or buttons
  - same colour as the headline, or the single accent
  - optically matched x-height: test 1.0–1.1em, or `font-size-adjust`
  - add about 0.05em of extra space after italic overhang
- **Script (Playground or Pinyon):** at most 2 uses per page (hero or closing CTA), at 48px or larger.
- **Pill highlight:** for *data and queries* (for example "skincare UGC hooks under 15s with >1M views"). Never stack a pill and italic on the same word.
- **Opacity dimming:** an optional third device (Butter's highlightWords).
- **Accessibility:** emphasised words must stay real text inside the heading for screen readers.

### 4.4 Motion rules (isometric and line) [R]
- **Line drawing:** SVG stroke draw via `stroke-dashoffset` or GSAP DrawSVG. GSAP is fully free, including plugins, since 3.13 [V].
- **Strokes:** 1–1.5px with `vector-effect: non-scaling-stroke`, ink at 20–60% opacity plus one accent stroke.
- **Isometric:** a true 2:1 dimetric grid (26.565°), built as inline SVG.
- **What animates:** only transform, opacity and dashoffset.
- **Timing:** draw over 0.6–1.2s with the out ease, staggered 40–100ms. Text reveals use lines at 0.6s with a 0.1s stagger and yPercent of about 60 (Butter's values).
- **Triggers:** fire once at `rootMargin 0 0 -10% 0`. At most one scroll-scrubbed pinned diagram. Ambient loops must be slow (6s or more) and pause offscreen.
- **Reduced motion:** `prefers-reduced-motion` renders final states and disables marquees and autoplay.
- **Smooth scroll:** optional. If used, Lenis with lerp of about 0.1, disabled under reduced motion.

### 4.5 Video wall and loop rules [R, except the Butter-derived items marked V]
- **Tiles:**
  - fixed `aspect-ratio: 9/16` boxes so layout does not shift
  - radius 12–16px, with a dominant-colour or LQIP background
  - overlay chips in mono: platform, views, duration, hook label
- **Markup:** `muted playsinline loop disablepictureinpicture disableremoteplayback preload="none"` with no `autoplay` attribute. The LCP or hero video is the exception: `preload="metadata"` and a poster with `fetchpriority="high"`.
- **Playback control:**
  - IntersectionObserver with about 200px rootMargin [V, Butter]: load and play when intersecting, pause when not
  - pause on `document.hidden`
  - catch `play()` rejections (iOS Low Power Mode) and fall back to the poster
- **Limits and network:**
  - concurrent decoding: 6 or fewer on desktop, 3 or fewer on mobile
  - Save-Data or 2G connections get posters only
  - reduced motion gets poster plus a play button
- **Encoding:**
  - H.264 MP4, yuv420p, `+faststart`, no audio track
  - optional AV1/VP9 WebM
  - 4–8s seamless trim at 24–30fps
  - 360×640 for tiles up to 240px CSS; 540×960 for featured tiles up to 360px; 720×1280 for the hero only
  - CRF about 28–32, targeting 150–500KB per loop
  - posters as AVIF/WebP at 25KB or less
  - CDN `f_auto,q_auto` (Butter uses Cloudinary q 60/75 [V])
- **Budgets:** initial video payload 1.5MB or less; LCP under 2.5s, CLS under 0.1, INP under 200ms; fonts at 4 or fewer preloaded woff2 files, Latin-subset, about 150KB total.
- **Rights:** "real short-form videos" need creator or brand permission or licensed UGC. Hotlinking or rehosting TikTok/IG/YT media is a legal and ToS risk [I]. This needs an owner decision.

### 4.6 Components needed to show example outputs [R]
- Query bar with a pill query and filter chips (Platform, Duration ≤15s, Views >1M, Niche, Date)
- Results grid of video cards with metrics in tabular mono
- **Analysis card:** hook transcript for 0–3s, hook type, format, pacing (cuts per second), on-screen text, CTA, and a "why it works" line
- **Hook-breakdown timeline:** a line-drawn ruler from 0 to 15s with markers (Hook / Problem / Proof / CTA), adapted from Butter's timeline-ruler fragment
- Creator list as large typographic rows (handle in ink, niche and metrics in grey), plus a compact table variant
- Floating UI fragments (filter dropdown "Views > 1M ⌄", a "Save hook" toolbar, a "See analysis" pill) as decorative DOM
- Monochrome logo row and a frosted glass case card, following the screenshot pattern

### 4.7 Capability checklist for scoring skills (needs IDs)

| ID | Capability |
|---|---|
| C1 | Fluid clamp type scale and tokens with variable fonts and licensed self-hosted woff2 |
| C2 | Mixed-family inline emphasis (italic serif, script, pill) with optical matching |
| C3 | Editorial whitespace layout: asymmetric splits, centred statements, 12-column gutter grid |
| C4 | SVG line drawing and isometric diagram construction, plus scroll triggers (GSAP / ScrollTrigger / DrawSVG / SplitText) |
| C5 | Restraint: anti-"AI slop" judgement and toning down |
| C6 | Video-wall engineering (IntersectionObserver play/pause, posters, encoding, budgets) |
| C7 | Realistic product-output UI fragments and data cards |
| C8 | Short, sharp marketing copy for marketers and DTC buyers |
| C9 | Reduced-motion, contrast, alt text and screen-reader handling for split text |
| C10 | Core Web Vitals verification and visual QA at 375, 768, 1440 and 1920 |

---

## 5. Risks and conflicts summary
- Bold display versus Butter's all-400 look (intentional).
- Italic serif or script is not in Butter (intentional).
- Isometric line art replaces Butter's 3D, shader and heavy dark panels.
- The screenshot's background is white while live Butter is `#FAFAFA`; the brief says grey. Pick one token.
- The Pangram trial cannot ship; budget for Web licences per domain and pageview tier.
- Video rights need an owner decision.
- "Tons of video" conflicts with performance unless C6 is enforced.
- The screenshot section is not on Butter's live site.

## 6. Sources
- **Butter, live site and code:**
  - https://www.butter.video/
  - CSS: https://marketing.butter.video/_next/static/css/2836d44e2fdcb041.css and …/6294d87c4b6dbd81.css
  - JS chunks: `6620.b2411e06085280f9.js` (video component), `5891-7ce9818823a4c71a.js` (split text and type tokens)
  - live render through agent-browser at 1440x900 (an isolated session I opened and closed)
- **Butter archive and provenance:** Wayback CDX http://web.archive.org/cdx/search/cdx?url=www.butter.video/
- **Butter's fonts:**
  - https://klim.co.nz/fonts/die-grotesk/
  - https://abcdinamo.com/news/typeface-release-abc-diatype
- **Pangram Pangram:**
  - https://pangrampangram.com/products/neue-montreal
  - https://pangrampangram.com/pages/faq
  - https://pangrampangram.com/pages/eula
  - https://pangrampangram.com/products/formula
  - https://pangrampangram.com/products/monument-extended
  - https://pangrampangram.com/products/right-grotesk
  - https://pangrampangram.com/products/editorial-new
  - https://pangrampangram.com/products/playground
- **OFL fonts (Google Fonts repo metadata):**
  - https://github.com/google/fonts/blob/main/ofl/instrumentserif/METADATA.pb
  - …/ofl/pinyonscript/METADATA.pb
  - …/ofl/fraunces/METADATA.pb
- **Other display faces:**
  - https://fonts.adobe.com/fonts/neue-haas-grotesk
  - https://fontsinuse.com/typefaces/97994/soehne
- **GSAP:** https://gsap.com/blog/3-13/
- **Third-party, unverified:**
  - https://licenseorg.com/guide/fonts/pangram-pangram
  - https://www.cufonfonts.com/font/pp-neue-montreal
- **Search with no match for the screenshot section:** "Trusted by the bold" + Antimetal/Clerk/Clearbit.