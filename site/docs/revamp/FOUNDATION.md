# Foundation: how to build a section

Read `USER_BRIEF.md` and `PLAN.md` first. This file explains the skeleton that the
foundation agent built and how a section or page agent plugs into it.

## 1. Stack and commands

- Next.js 16.4 (App Router, Turbopack), React 19.2, TypeScript strict, Tailwind CSS v4,
  pnpm 10, Node 22. GSAP 3.15 (every plugin is free), `@gsap/react`, Lenis 1.3, `motion` 14
  (small presence/layout transitions only, and never in code every page loads first: the
  navbar's mobile menu animates with the Web Animations API), `d3-shape` and `d3-scale` for chart path maths,
  `lucide-react` 1.x (UI icons only; it has **no brand icons**, so draw social and platform
  marks as inline SVG), `clsx` and `tailwind-merge`.
- Next 16 differs from older Next versions. Before you use an API you are unsure of, read
  `node_modules/next/dist/docs/`. `next dev` also writes a root `AGENTS.md` that says this.

```bash
pnpm dev          # next dev --turbopack -p 3001 (the orchestrator usually runs it)
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint . (flat config; Next 16 has no `next lint`)
pnpm build        # production build

# Filter checks to your own files while siblings are mid-build:
pnpm exec tsc --noEmit 2>&1 | grep "sections/<key>"
pnpm exec eslint src/components/sections/<key>
```

Before you start the dev server, check whether it is already running:
`curl -s -o /dev/null -w "%{http_code}" http://localhost:3001`.

## 2. Where things live

| Path | What it is |
|---|---|
| `src/app/layout.tsx` | Root `<html>`: fonts, metadata (share image `DEFAULT_OG_IMAGE` = `/og-default.jpg`), `<SmoothScroll>` (Lenis), `<SoundBindings>`. Icons are files: `src/app/icon.png` (48px) and `src/app/apple-icon.png` (180px) |
| `src/app/(site)/layout.tsx` | Skip link ("Skip to content", the first focusable element), Navbar, then `<main id="main" tabIndex={-1}>`, then Footer, for every public page |
| `src/app/(site)/page.tsx` | Home: the hero (full-width: its text starts at the navbar logo's left edge, `--hero-gutter`, not the 20% letterbox edge), then `<Rails>` around every other section (PLAN §3 order) |
| `src/app/(site)/{pricing,viral-now,resources,resources/[slug]}/page.tsx` | Page routes. Each renders `src/components/pages/<page>/index.tsx` |
| `src/app/(preview)/preview/<key>/page.tsx` | Isolated preview, with no navbar or footer. Letterboxed sections are wrapped in `<Rails>` |
| `src/app/(preview)/preview/ui/page.tsx` | Kitchen sink for every primitive and type utility: **http://localhost:3001/preview/ui** |
| `src/components/sections/<key>/index.tsx` | **Your section** (default export). Keep private files in the same folder |
| `src/components/layout/*` | Letterbox, Section, Rails, RailSeam, Placeholder, SmoothScroll/useLenis, navbar/, footer/ |
| `src/components/ui/*` | Shared primitives (§4) |
| `src/lib/*` | `cn`, `links`, `gsap`, `motion`, `media`, `api`, `sound` (the site-wide sound preference and cues) |
| `src/content/**` | Typed copy and data from the content and media agents |
| `public/brand/wordmark-ink.png`, `public/brand/icon-ink.png` | Ink logo assets with alpha, made with ffmpeg. Never redraw the logo |

Preview URLs (`http://localhost:3001/preview/<key>`): `hero`, `statement-simulator`,
`how-it-works`, `bento`, `pricing`, `testimonials`, `tracking`, `mcp`, `blog`, `faq`,
`footer`, `navbar`, and `ui` (the kit).

The footer is a section like any other. Build it in `src/components/sections/footer`.
`src/components/layout/footer/index.tsx` mounts it on every page, so do not render it
from Home.

## 3. Tokens (`src/app/globals.css`)

The CSS variables hold the values, and Tailwind v4 utilities map to them. **The default
Tailwind colour palette is removed.** Classes like `text-gray-500` or `bg-blue-600` produce
nothing, and Tailwind gives no warning. Use the tokens:

| Purpose | Utilities | Variable |
|---|---|---|
| Page, surfaces | `bg-bg`, `bg-surface`, `bg-surface-2`, `bg-paper` | `--bg`, `--surface`, `--surface-2`, `--paper` |
| Text | `text-ink`, `text-ink-2`, `text-muted`, `text-faint` | `--ink` … `--faint`. `--muted` is ink at 62% (5.3:1 on `--bg`, 5.05:1 on `--surface-2`), safe for small text. `--faint` (28%, 1.9:1) is for decorative, non-text or disabled UI only, never for information |
| Lines | `border-hairline` (the default border colour, so `border` alone works) | `--hairline` |
| Palette (7 hues × 4 steps) | `bg-pink`, `bg-purple-soft`, `text-blue-ink`, `from-green-glow`, `border-red/25`, `shadow-glow shadow-pink/40` | `--{pink,purple,blue,green,yellow,orange,red}` plus `-soft`, `-ink`, `-glow`; `--yellow-deep`. **Read `docs/revamp/COLOR_SYSTEM.md` before using colour.** It has the rules (text stays ink, at most 3 UI hues per view, yellow and orange are fill-only, white text only on `-ink` or `--night`) and the section-by-section placement map. Readable coloured text always uses `-ink` (at least 4.5:1 on `--bg`, `--paper`, `--surface` and its own `-soft`) |
| Gradients and dark card | `bg-grad-{hue}`, `bg-grad-spectrum`, `bg-grad-spectrum-ink`, `bg-aurora`, `bg-night` | `--grad-spectrum`, `--grad-spectrum-ink`, `--grad-aurora`, `--night`, `--night-2`. The spectrum is for lines, rings and tags only; aurora is for the featured Pro card only; no gradient text |
| UI accent (focus, links, product UI) | `text-accent`, `bg-accent/10`, `ring-accent` | `--accent` = `--blue` (#2f54eb). Focus rings, links, the hero beam and the simulator. It is no longer the only accent |
| Data | `text-breakout`, `bg-growth`, `stroke-decline`, `bg-breakout-glow` | `--breakout` = `--yellow-deep`, `--breakout-glow` = `--yellow`, `--growth` = `--green`, `--decline` = `--red` (values unchanged). Wherever trend data appears, yellow means breakout, green growing and red declining. Use these names in data code |
| Data text | `text-breakout-ink`, `text-growth-ink`, `text-decline-ink` | = `--yellow-ink` (#7d5700), `--green-ink` (#0a7340), `--red-ink` (#b9262c). Fills, dots, chart strokes and icons keep the bright colour (3:1 non-text rule) |
| Plain | `bg-white`, `bg-black` | |
| Radii | `rounded-chip` (8), `rounded-btn` (14), `rounded-card` (24), `rounded-tray` (32) | `--r-*` |
| Shadow (floating fragments only) | `shadow-float` | `--shadow-float` |
| Eases | `ease-out`, `ease-in-out`, `ease-out-fast` (CSS) | `--ease-out`, `--ease-in-out`, `--ease-out-fast` |
| Fonts | `font-sans` (Switzer), `font-serif-italic` (Boska), `font-mono` (JetBrains Mono) | `--font-sans`, `--font-serif-italic`, `--font-mono` |
| Layout | `letterbox` utility; `py-[var(--section-pad-y)]` | `--letterbox`, `--section-pad-y`, `--nav-h` (88px) |

Opacity modifiers work on tokens, for example `bg-ink/15` or `bg-paper/80`.

Fluid type utilities scale from a 375px to a 1440px viewport:

| Utility | Size | Notes |
|---|---|---|
| `display-xl` | 44→104px | 700, lh .94, −0.035em, ink |
| `display-l` | 34→64px | 700, lh 1, −0.035em, ink |
| `display-m` | 24→40px | 700, lh 1.08, −0.025em, ink |
| `statement` | 26→44px | 400, lh 1.18 (G1o2H pattern) |
| `body-l` | 18→20px | lh 1.5 |
| `eyebrow` | 11→12px | mono, uppercase, +0.02em, tabular-nums, muted |
| `emphasis` | 1.07em | Boska italic. Use `<Emphasis>`, which wraps this utility |

`cn()` knows these names, so `cn("display-l", props.className)` lets a later `display-m`
override the earlier class.

Fonts: the `@font-face` rules for Switzer and Boska sit at the top of `globals.css`
(woff2 URLs on `cdn.fontshare.com`, `font-display: swap`), so no third-party stylesheet blocks
the first paint. They declare only the faces the site uses: Switzer 400, 500, 600, 700 and 800
(800 is the Viral Now rank numerals), Switzer 400 italic (`<em>` in article prose), and Boska
**italic only** at 400 and 500 (`<Emphasis>`). Any other weight or style is synthesised by the
browser, so copy its `@font-face` from the Fontshare CSS API into that block before you use it.
Do not set Boska upright. Browsers download a face only when a page renders it. Preloads
cover only the faces a route paints at load: its first viewport (measured at 390, 412 and 1440
wide), plus faces the browser lays out before the first paint anyway:
the root layout preloads Switzer 400, 500 and 700 on every page, and each route adds its own
with `<FontPreloads faces={[…]} />` (`src/components/layout/font-preloads.tsx`; the URLs and the
per-route list are in `src/lib/fonts.ts`): Home Boska 500 italic, plus Switzer 600 and Boska 400
italic for the statement scene below the hero (`content-visibility: auto` still lays it out at
load, and an unpreloaded face found through the stylesheet counts as render-blocking in
Lighthouse); /pricing Switzer 600 and Boska
400 italic; /viral-now Switzer 600, 800 and Boska 400 italic; /resources and the 404 Boska 400
italic. Keep route preloads in that client component: a preload in a server component (a
`preload()` call or a `<link rel="preload">`) becomes a hint in the route's RSC payload, and a
`<Link>` prefetch from another page then fetches it there ("preloaded but not used").
JetBrains Mono loads through `next/font`.

Other helper classes: `edge-fade-x` (alpha mask on the left and right edges, for
horizontal scrollers), `rails-lines` and `rails-seam` (internal to Rails), and
`ch-marquee-track` (internal to Marquee).

## 4. Primitives

Every primitive has a header comment with its full prop list and examples. Read the file
before you use it.

```tsx
import { Section } from "@/components/layout/section";
import { Letterbox } from "@/components/layout/letterbox";
import { Rails, RailSeam } from "@/components/layout/rails";
import { Button, buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { Reveal } from "@/components/ui/reveal";             // client
import { VideoTile } from "@/components/ui/video-tile";      // client
import { Marquee } from "@/components/ui/marquee";           // client
import { SegmentedToggle } from "@/components/ui/segmented-toggle"; // client
```

The rest of this section gives a short example for each one.

```tsx
// A typical letterboxed home section (server component, no "use client" needed).
export default function PricingSection() {
  return (
    <Section sectionKey="pricing">                                  {/* <section id="pricing" data-section="pricing"> + letterbox + section padding */}
      <SectionHeader
        index={5}                                                   // → [ 05 / 09 ] · PRICING
        label="Pricing"
        title={<>Plans that <Emphasis>pay</Emphasis></>}            // ink part, with one Boska keyword
        muted="for themselves."                                     // muted continuation
        sub="Every paid plan starts with a 1-week free trial."
        actions={<Button href={GET_STARTED_URL}>Get started</Button>}
      />
      <PricingCards />                                              {/* your client component for interactivity */}
    </Section>
  );
}
```

- **Section** `{ sectionKey, id?, padding?: "default"|"top"|"bottom"|"tight"|"none", letterbox?: boolean = true, innerClassName?, ...sectionProps }`.
  Pass `letterbox={false}` for full-bleed content. The hero does this.
- **Letterbox** `{ as?, className?, ...props }` is the 60/80/100%−40px column.
- **Rails** `{ seams?: boolean = true, className? }` draws hairline column edges and puts a
  `+` seam between each pair of children. **RailSeam** places one seam manually.
  Hidden by default as of 2026-10-16 per owner: `SHOW_RAILS = false` in `components/layout/rails.tsx` sets `data-rails="hidden"` on `<html>` (`visibility: hidden`, so nothing moves); flip it to `true` to restore the lines and seams.
- **Button** `{ variant?: "primary"|"secondary"|"ghost", size?: "sm"|"md"|"lg", href?, newTab?, ...button|anchor props }`.
  With `href`, internal paths render through `next/link` and absolute URLs render as `<a>`.
  `buttonVariants({variant,size,className})` returns the same classes for other elements.
- **Chip** `{ variant?: "outline"|"surface"|"ink", tone?: "neutral"|"accent"|"breakout"|"growth"|"decline", size?: "sm"|"md", dot?, icon?, mono? }`.
- **Badge** `{ tone?: "neutral"|"ink"|"accent"|"outline"|"breakout"|"growth"|"decline" }` renders a tiny uppercase mono label.
- **Eyebrow** `{ index?, total? = 8, label }` renders `[ 0N / 08 ] · LABEL`: the index in `--muted`, the label in `--ink-2`, only the `·` in `--faint`.
- **Emphasis** `{ scale? = 1.07, weight?: 300|400|500 }`. Use it for one Boska italic keyword per headline.
- **SectionHeader** `{ index?, total?, label?, title, muted?, sub?, align?: "left"|"center", size?: "xl"|"l"|"m", as?: "h1"|"h2"|"h3", reveal? = true, actions?, className?, headingClassName? }`.
- **Reveal** `{ as?, type?: "lines"|"words", delay?, stagger? = .1, duration? = .6, start? = "top 90%", immediate?, initiallyHidden? }`.
  SplitText runs once, then the original DOM comes back. Children must be static text.
- **VideoTile** `{ src, poster?, label, aspect? = "9/16", overlay?, children?, autoPlay? = true, priority?, allowReducedMotion?, boostOnHover? = true, fit?, videoClassName?, videoRef? }`.
- **Marquee** `{ children, speed? = 40 (px/s), direction?, gap? = 32, pauseOnHover? = true, fade? = true, label?, className?, rowClassName? }`.
- **SegmentedToggle** `{ options: {value,label,badge?,disabled?}[], value, onChange, ariaLabel, size?, className? }` is a radiogroup with arrow-key support.
- **Placeholder** is only for stubs. Delete it from your section when you replace the stub.

## 5. Links and data

- Every URL comes from `@/lib/links`. Do not hard-code URLs. The module exports `APP_URL`
  (from `NEXT_PUBLIC_APP_URL`, default `https://agent.conthunt.app`), `LOGIN_URL`,
  `GET_STARTED_URL` (the primary CTA everywhere), `DOCS_URL`, `MCP_DOCS_URL`,
  `MCP_SERVER_URL`, `PRIVACY_URL`, `TERMS_URL`, `CONTACT_URL`, `SOCIALS`, `ROUTES`,
  `NAV_LINKS`, `isActivePath`, and `isExternal`. Values marked `// verify` in that file are
  guesses. The content files in `src/content/site/*.ts` keep the legacy `href="#"` values as
  `"MISSING"`, so resolve them through `links.ts`.
- Backend: `import { api, ApiError } from "@/lib/api"`, then
  `await api<T>("/v1/trending/niches", { query, timeoutMs, next: { revalidate } })`.
  The browser calls same-origin `/v1/*`, which `next.config.ts` rewrites to
  `NEXT_PUBLIC_BACKEND_URL`. Server components call the backend directly.
- Caching: `next.config.ts` sends `Cache-Control: public, max-age=604800,
  stale-while-revalidate=86400` for `/media/*`, `/brand/*` and `/blog/*`. These filenames are
  not content-hashed, so a replaced file can stay cached for up to a week: give a changed
  asset a new filename when it must update at once.
- Images: use `next/image` for anything in `public/`. Remote R2 hosts
  (`*.r2.cloudflarestorage.com`, `**.r2.dev`) are allowed, but pass `unoptimized`, because
  presigned URLs expire. `images.qualities` is `[60, 75, 90]`.

## 6. Motion

### GSAP

Always import GSAP from `@/lib/gsap`, never from `"gsap"`:

```tsx
"use client";
import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, EASE, useGSAP } from "@/lib/gsap";
import { Flip } from "@/lib/gsap-flip"; // only where you use Flip
import { MOTION_OK, MOTION_REDUCED } from "@/lib/motion";

export function Thing() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from(".card", { y: 24, opacity: 0, stagger: 0.06, ease: EASE.out,
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true } });
    });
    mm.add(MOTION_REDUCED, () => gsap.set(".card", { opacity: 1, y: 0 }));   // final state
  }, { scope: root });
  return <div ref={root}>…</div>;
}
```

- `@/lib/gsap` registers ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase and `useGSAP`
  once, in the browser only. Every page loads it first, so plugins few components use live
  elsewhere: Flip in `@/lib/gsap-flip` (import `Flip` from there), and InertiaPlugin in its one
  user (`components/pages/viral-now/h-scroller.tsx`). MorphSVGPlugin is not bundled,
  because nothing uses it. If you need another plugin (MorphSVG, Observer, ScrollToPlugin,
  and so on), import it from `gsap/<Plugin>` and register it in your own file with
  `gsap.registerPlugin(Observer)` after importing `gsap` from `@/lib/gsap`. Registering
  twice does nothing.
- The named eases are `"ch.out"`, `"ch.inOut"` and `"ch.outFast"` (also exported as
  `EASE.out`, `EASE.inOut` and `EASE.outFast`). The default is `ease: "ch.out"`, `duration: 0.6`.
- `useGSAP` together with `gsap.matchMedia()` reverts every tween, ScrollTrigger and
  SplitText on unmount and whenever the motion preference changes. Do not write manual
  cleanup.
- Animate only `transform`, `opacity`, `clip-path`, `filter` (sparingly) and
  `stroke-dashoffset`.

### Lenis and ScrollTrigger

- There is one Lenis instance, created in the root layout. It is driven by `gsap.ticker`,
  and every Lenis scroll calls `ScrollTrigger.update`. The scroller is the **window**, so
  do not pass `scroller:` to ScrollTrigger. `useLenis()` from
  `@/components/layout/smooth-scroll` returns the instance, or `null` under reduced motion.
  Use it for `lenis.stop()` and `start()`, or for `lenis.scrollTo(target, { offset })`.
- **Pinning:** only the `statement-simulator` scene pins (PLAN §2). Pin an *inner wrapper*,
  not the `<section data-section>` itself. The rails CSS targets direct children of
  `.rails`, and the pin-spacer would become that child. Use `pinSpacing: true` and
  `anticipatePin: 1`. Call `ScrollTrigger.refresh()` after layout-changing async content,
  such as images without dimensions. Webfont loading already triggers a refresh. Never pin
  inside an ancestor that has `transform`, `filter` or `backdrop-filter`, because that breaks
  `position: fixed`.
- Nested scroll areas (sheets, horizontal rows, code panes) need `data-lenis-prevent`,
  `data-lenis-prevent-wheel` or `data-lenis-prevent-touch`. Otherwise Lenis takes their
  wheel events.
- Lenis anchors are enabled with a −96px offset, so `href="#faq"` scrolls smoothly and clears the navbar.

### Reduced motion

- CSS: globals.css shortens every CSS animation and transition to about 0ms under
  `prefers-reduced-motion: reduce`. Lenis is off.
- JS: use `gsap.matchMedia()` with `MOTION_OK` and `MOTION_REDUCED` (shown above). In React
  logic, use `usePrefersReducedMotion()`, which returns false on the server and the first
  client render, then the live value. Use `prefersReducedMotion()` for one-off reads.
- motion (Framer): render `m.*` (never `motion.*`) inside `<LazyMotionConfig>` from
  `@/components/ui/lazy-motion` (`<MotionFeatures>` plus `<MotionConfig reducedMotion="user">`),
  as SegmentedToggle does. The animation features then load in their own chunk after
  hydration, never in a page's first-load JavaScript; a stray `motion.*` throws in dev. The
  mobile menu uses the Web Animations API instead (no motion on every page).
- Expected behaviour: final states show at once, autoplay loops and marquees stop, videos
  show their posters (VideoTile does not autoplay unless `allowReducedMotion`), and a hover
  flip becomes an instant swap.
- Pause offscreen loops with `observeInView`, `onceInView` or `useInView` from `@/lib/media`,
  and pause on `document.hidden` with `onDocumentVisibility`.

### Video

- Use `VideoTile`. It renders `<video muted playsInline loop preload="none" disablePictureInPicture disableRemotePlayback>`,
  and the global manager plays a video only near the viewport (rootMargin 200px). At most 6
  play on desktop and 3 on mobile, and all pause when the tab is hidden.
- If you build a custom `<video>`, register it with `useManagedVideo(ref, { priority })` or
  `videoManager.register(el)`.
- QA in dev: `window.__chVideoManager.debug()`, `.playingCount` and `.cap`. If you edit
  `src/lib/media.ts` while a page is open, Fast Refresh creates a second manager, so
  **reload** before you test playback.

### Sound

- All sound goes through `src/lib/sound.ts` (cuelume, Web Audio, no files). One preference, saved
  in localStorage, **on by default** but silent until the first click or key press; the hero and
  navbar toggles share it. Four families: `tap` (actions), `select` (choices, card flips, a soft
  hover cue), `disclosure` (open and close) and `flap`.
- `flap` is the hero board's landing sound: cuelume's `navigate` cue (default theme, a soft paper
  whoosh), one per card landing, in `src/components/sections/hero/flap-sound.ts`. It replaced the
  synthesized clack. Gates: the site preference, hero at least 45% visible, tab visible.
- Add a cue with the hooks and helpers in `sound.ts`; do not call `cuelume` directly from a section
  except the hero's `flap-sound.ts`.

## 7. Client and server boundaries

- `Section`, `Letterbox`, `Rails`, `SectionHeader`, `Eyebrow`, `Emphasis`, `Button`, `Chip`
  and `Badge` are server-safe. Server components can render them without `"use client"`.
- `Reveal`, `VideoTile`, `Marquee`, `SegmentedToggle`, the navbar and smooth-scroll are
  client components. Server components can import them. Props must be serialisable, and JSX
  children count as serialisable.
- `@/lib/gsap`, the hooks in `@/lib/motion` and `@/lib/media`, and `useLenis` are for
  client components only. The constants (`MOTION_OK`, `EASE`, `VIDEO_CAP`) work anywhere.
- Keep the interactive parts of a section in small client islands, so the rest stays
  server-rendered.
- A Home section (and the footer) loads its client code with its island, not in the page's
  first-load JavaScript: its server file imports its client components from the section's
  `island.tsx` (stand-ins made by `islandPart()`), `client.ts` re-exports the real ones, and
  `src/components/layout/island-code.tsx` maps the island key to that chunk. Add a new client
  component of such a section to all three. Also import the section's CSS modules in its server
  file, so their rules ship with the page. Do not re-export client components from a section's
  `index.tsx` (a re-export puts them back in the first-load JavaScript), and do not import a
  stand-in outside its `<LazySection code="…">` (the page's hydration would wait for the chunk).

## 8. Layout rules

- The navbar is `position: fixed`, 88px tall at the top (`--nav-h`). On scroll it becomes
  a compact frosted-glass pill (translucent paper plus backdrop blur) that auto-hides when you
  scroll down and returns on scroll up, at the top of the window or on keyboard focus. The hero and page tops must clear it, for example with
  `pt-[var(--nav-h)]` or by vertically centring content in a `100svh` hero.
- The hero is the one full-width section. Its text column starts at the navbar logo's left edge
  (`--hero-gutter`) and the board fills the rest: columns of 1, 2, 3 and 4 cards, plus a 5th column
  of five static cards (and on short, wide windows a 6th of four) from 1280px up to 2560px. A thin
  progress ring around the pause button shows the 6s prompt cycle (it replaced the dash pager).
  See `docs/revamp/sections/hero.md`.
- Rails sit at the letterbox edges. Content that should "touch the rails" uses the
  letterbox width exactly. **Every home section header (eyebrow, h2, sub) sits flush on
  the left rail**, one left edge down the page, and every home section h2 is Display L.
  The one element below the hero that leaves the letterbox is the landed Deep Search simulator:
  it is full size (`--sim-full-w` in globals.css, shared with its Full Control dialog;
  OWNER_DECISIONS D5), with its slim eyebrow row on the frame's edges.
  Documented exceptions: the statement (Statement type, pinned scene), testimonials (a slim
  strip with no number), the MCP spec-sheet frame (ruled cells keep a cell padding; the h2 is
  fitted to its 7fr cell) and the FAQ (Display L capped at 48px in its 240px sticky column).
  How-it-works step rows keep their inset because the rail carries their progress line.
- The fixed navbar (`[data-site-nav]`) hides while a native modal `<dialog>` is open, so it
  never ghosts through a translucent backdrop. **Contract:** the component that calls
  `showModal()` sets `data-modal-open` on `<html>` right after it, and removes it on the
  dialog's `close` event (Escape, `<form method="dialog">`, `close()`) and in its effect
  cleanup. globals.css hides the navbar with `:root[data-modal-open] [data-site-nav]`.
  A separate flag, `data-immersive` on `<html>`, slides the navbar away (like its auto-hide)
  while the landed full-size simulator owns the screen; the statement scene sets it while it is
  pinned and landed and clears it as soon as it unpins in either direction.

  ```tsx
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const root = document.documentElement;
    dialog.showModal();
    root.setAttribute("data-modal-open", "");
    const onClose = () => {
      root.removeAttribute("data-modal-open");
      setOpen(false);
    };
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("close", onClose);
      if (dialog.open) dialog.close();
      root.removeAttribute("data-modal-open");
    };
  }, [open]);
  ```

- **Home loads lazily below the hero, with the same pixels.** Every section after the hero
  is wrapped in `<LazySection>` (`src/components/layout/lazy-section.tsx`): the server HTML is
  complete, but React hydrates the section (and its GSAP set-up runs) only when it comes
  within 75% of a viewport (25% for the pinned statement scene), after the first scroll,
  wheel, touch or key press (idle time, nearest first), or when focus or a pointer enters it.
  With `code="<key>"` the section's client code is a separate chunk (§7), fetched when the
  island approaches or after the first interaction; the server DOM stays until it arrives.
  The wrapper is `display: contents` and reads `data-island="pending"` until it goes
  `"live"`. Sections below the statement scene (and the statement scene while pending, and
  the footer) also use `content-visibility: auto` with a measured `--cis` placeholder height
  (`.rails-cv` in `globals.css`). `<OffscreenSections>` (mounted by `SiteChrome`) refreshes
  ScrollTrigger when a real height lands, renders each skipped section once after the first
  scroll so heights never jump later, and hydrates the islands above a same-page `#anchor`
  before the scroll is measured (holding the click until their code has arrived). Rules for section code: keep decorations inside the section
  box (paint containment clips there); do not rely on effects running at page load; a big
  layout change in a section means re-measuring its `--cis`; a `<video>` poster goes through
  `posterStyle()` (`src/lib/media.ts`) so it loads only when the section renders.
- Never anchor `:has()` on `html`, `body`, `main` or a section, and never use a Tailwind
  `has-[…]` or `group-has-*` variant whose group is one of those. Chrome re-matches such a
  selector on every DOM mutation below it: the old `:root:has(dialog:modal)` navbar rule
  cost Home a 20-second main-thread stall in dev and 5 seconds in prod. `:has()` on a small
  component (a card, a list row, a tile) is fine.
- The mobile menu sheet sets `inert` on everything outside the navbar and the sheet while it
  is open, and drives Tab / Shift+Tab itself. A custom full-screen overlay should do the
  same, or use a native modal `<dialog>` (which is inert-outside by default).
- Full-bleed elements inside a section use `letterbox={false}` on `Section` and manage
  their own column.
- A section with an opaque background hides the rails behind it (sections are `z-index: 1`).
  The page allows at most one dark surface (PLAN §2).
- Breakpoints are the Tailwind defaults: `md` = 768 and `xl` = 1280. These match the letterbox steps.

## 9. Verification (PLAN §8)

1. Run `pnpm exec tsc --noEmit` and `pnpm exec eslint src/components/sections/<key>`.
2. Take screenshots with agent-browser. Prefix each call with `timeout 60` (the first call
   can hang while its daemon starts) and use your own session name:

   ```bash
   AB="timeout 60 agent-browser --session <key>"
   $AB set viewport 1440 900
   $AB open http://localhost:3001/preview/<key>
   $AB wait 2000
   $AB screenshot "$(cd '<repo>/.scratch/qa/<key>' && pwd -W)/1440-top.png"
   $AB mouse move 700 450; $AB mouse wheel 900; $AB wait 1500   # Lenis smooth-scrolls wheel input
   $AB screenshot ".../1440-scrolled.png"
   $AB set viewport 390 844    # then repeat
   $AB set media light reduced-motion   # reduced-motion pass; `set media light` to undo
   $AB console; $AB errors     # warnings and errors
   ```

   On Windows, `screenshot` needs an absolute path; `pwd -W` gives one.
3. Measure animations with a single `eval`, because each CLI call costs hundreds of
   milliseconds. For example, sample `getBoundingClientRect()` on each `requestAnimationFrame`
   and return the list.
4. Save screenshots to `.scratch/qa/<key>/` and list them in your report.

## 10. Gotchas

- Tailwind v4 only sees classes written as complete string literals. `bg-${tone}` does not
  work. Use a lookup object, as Chip and Badge do.
- After you add new classes to a file, the first screenshot can be taken before Tailwind's
  HMR update arrives. Reload once if the layout looks unstyled.
- `next/image` warns when you change only one dimension in CSS. Set both, or neither.
- `motion` logs a dev-only "Reduced Motion enabled" warning under reduced-motion emulation.
  This is expected.
- Do not edit `package.json` by hand. If you need a dependency, `pnpm add` it and name it
  in your report.
- Do not commit, do not touch the legacy `index.html` or `public/*` assets, and never print
  `.env.local`.
