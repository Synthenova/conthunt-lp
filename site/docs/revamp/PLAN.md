# ContHunt landing revamp: build plan and shared decisions

Read `USER_BRIEF.md` first; it is the owner's verbatim request and wins every conflict.
This file records the orchestrator's decisions so every subagent builds one coherent site.
Reference images: `docs/reference/pen/<NodeID>.png` (exported from `conthunt.pen`; they are
*references*, not designs to copy; most are dark, and the site is light).

## 0. Ground rules for every agent

- Repo: `C:\Users\win10\Documents\GitHub\Conthunt\Landing Page` (git branch `revamp/next-site`).
  **Do not commit, push, or switch branches.** The orchestrator handles git.
- The legacy static site (`index.html`, `index.bak`, `public/*`) is reference material.
  Do not delete or move it. Next.js ignores root HTML files, and the existing `public/` assets
  stay where they are. To view the legacy page, read `index.html`, or serve the repo root
  with `python -m http.server 3002` and open `/index.html`.
- `.env.local` is a hard link to `../conthunt/frontend/.env.dev` (Windows symlinks need admin).
  Never print, copy, or commit its values. Only `NEXT_PUBLIC_*` keys may reach the client.
- Only edit the files your task owns (see §6). If you need a change in a file you do not own,
  write the request in your final report instead.
- Use Switzer, Boska and JetBrains Mono only. Do not use Inter, Geist, DM Sans, Space Grotesk,
  Plus Jakarta Sans, Instrument Serif/Sans, Fraunces, Roboto, Montserrat, IBM Plex or Satoshi
  (impeccable bans most of these, and the rest read as AI-template defaults).
- Never generate fake UGC or fake people. Videos are real short-form clips sourced through the
  ContHunt MCP (fair use for this build, as the owner allowed). AI images are only for blog cover
  background plates, generated with the Infiknit provider models (`infiknit-nano-banana-2-1`).
- Verify your own work in a real browser before reporting done (see §8). Report honestly what
  you did not verify.

## 1. Stack

- Next.js 16 App Router + React 19 + TypeScript (strict) + Tailwind CSS v4, `src/` directory,
  pnpm. These match the app repo (`next 16.0.10`, `react 19.2.1`, `tailwindcss ^4`).
- Motion: `gsap` 3.13+ (all plugins are free: ScrollTrigger, SplitText, DrawSVGPlugin,
  MorphSVGPlugin, Flip, Observer) with `@gsap/react` (`useGSAP`). `lenis` for smooth scroll
  (lerp ≈ 0.1; disabled under reduced motion; synced to ScrollTrigger via `gsap.ticker`).
  `motion` (Framer Motion) is allowed only for small presence/layout transitions
  (accordion, tabs, toggles). Do not add other animation libraries without a reason in your report.
- Charts: hand-built SVG (area/line/sparkline, hexagon radar, bars). `d3-shape` and `d3-scale`
  are allowed for path math. No heavy chart libraries.
- Sound: cuelume (Web Audio, no files; see FOUNDATION §6 Sound). On by default with a visible toggle, silent
  until the first user gesture (browsers block audio before one). The preference is saved in localStorage.
- Dev server: `pnpm dev` → `next dev --turbopack -p 3001`. Backend calls are same-origin
  `/v1/*`, rewritten to `${NEXT_PUBLIC_BACKEND_URL}/v1/*` in `next.config` (hosted dev API,
  public read routes: `/v1/trending/*`, `/v1/public-boards/*`).

## 2. Visual system (light, sharp, editorial; Butter toned down)

### Colour tokens (CSS variables in `globals.css`, exposed to Tailwind v4 via `@theme`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FAFAFA` | page |
| `--surface` | `#F2F2F2` | cards, trays |
| `--surface-2` | `#EAEAEA` | pressed or nested surfaces |
| `--paper` | `#FFFFFF` | floating UI fragments and the simulator canvas |
| `--ink` | `#0F0F0F` | headings and primary buttons |
| `--ink-2` | `#373737` | body text |
| `--muted` | `rgba(15,15,15,.48)` | secondary text and the dim half of two-tone headings |
| `--faint` | `rgba(15,15,15,.28)` | eyebrows and tertiary text |
| `--hairline` | `#E4E4E4` | borders, rails and dividers |
| `--accent` | `#2F54EB` | the one UI accent: focus rings, active states, links, the hero beam core |
| `--breakout` | `#E0A100` (glow `#FFC83D`) | data only: breakout trend |
| `--growth` | `#16A05A` | data only: healthy growth |
| `--decline` | `#E5484D` | data only: declining |

- **Superseded 2026-10-16 by `COLOR_SYSTEM.md`** (owner asked for pink, purple, green, yellow, red and
  blue "wherever"; the table above lists only the base tokens). Original rule, kept for history:
  Colour comes from the videos. The UI is monochrome plus the one accent. Never use gradient
  text. At most one dark surface per page (the footer wordmark area or the simulator, not both).
- Shadows are soft and only on floating fragments: `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`.
- Radii: 8 (pills, chips, inputs), 14 (buttons, video tiles), 24 (cards), 32 (trays, big panels).

### Type

- **Switzer** (Fontshare CDN `https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700,800&f[]=switzer@401&display=swap`,
  or verify the italic syntax) for body, UI and **bold display** (700–800, tracking −0.035em at
  display sizes). It stands in for PP Neue Montreal; the owner will choose the final face later,
  so keep the family behind a `--font-sans` variable.
- **Boska Italic** (Fontshare, 300–500 italic) for the *one italic keyword* per headline only.
  Match the optical size by setting the italic span 1.04–1.1em. Never use it in body text or buttons.
- **JetBrains Mono** (next/font/google) for eyebrows, section numbers, metrics and code
  (`tabular-nums`, +0.02em, uppercase eyebrows at 11–12px).
- Self-hosting Fontshare woff2 is allowed but not in a public repo, so the `@font-face` rules in `globals.css` point at the CDN woff2 files (no render-blocking stylesheet; see FOUNDATION §3).
- Fluid scale (clamp 375→1440): Display XL 44→104px (lh .94); Display L 34→64px; Display M
  24→40px; Statement 26→44px regular weight (lh 1.18, the Butter G1o2H pattern); Body L 18–20px;
  Body 16px; UI 14px; Eyebrow 11–12px mono.
- Two-tone headings (jreAl): the first phrase is `--ink`, the continuation is `--muted`, in the
  same size and weight. Bento captions are 1–2 words, then a dim continuation sentence.

### Layout

- **Hero is full-bleed.** Every other home section uses the **letterbox**: content column =
  60% of the viewport at ≥1280px (20/60/20), 80% at 768–1279px, and `100% − 40px` below 768px.
  One exception (owner, 2026-10-16, OWNER_DECISIONS D5): the landed Deep Search simulator is full
  size, the app simulated as the whole screen. Draw hairline vertical rails at the column edges
  down the page (as in refs PLyVa and qvSVa) with small `+` marks where sections meet. The rails are the page's signature structure device.
- Section padding ≈ 120–160px at 1440. Each section opens with a mono eyebrow
  `[ 0N / 08 ] · LABEL` (PLyVa pattern), a bold heading of 8 words or fewer with one Boska italic
  keyword, and an optional one-line subhead. Numbering: 01 DEEP SEARCH (statement-simulator),
  02 HOW IT WORKS, 03 FEATURES (bento), 04 PRICING, 05 TRACKING · EXPERIMENTAL,
  06 POWER YOUR AGENT (mcp), 07 RESOURCES (blog), 08 FAQ. The hero, testimonials and footer
  have no number.
- Navbar (retained structure): logo left, pages centre (Pricing, Viral Now, Resources; the logo
  goes to Home), Login + a "Get started" button right. It is large at the top and **shrinks on
  scroll** into a compact floating pill (GSAP or a CSS transition driven by scroll position).
- The primary CTA everywhere is **"Get started"**, which opens the app at deep-search entry
  (`src/lib/links.ts`).

### Motion

- Eases: out `cubic-bezier(.2,.715,.205,.99)`, inOut `cubic-bezier(.835,.12,.225,.77)`, outFast `cubic-bezier(0,0,0,1)`.
- Text reveal: SplitText lines, yPercent 60 → 0, 0.6s, 0.1s stagger, fires once at 10% into view.
- Animate only transform, opacity, clip-path, filter (sparingly) and stroke-dashoffset.
- **One** scroll-jacked pinned scene on Home: Statement → Simulator. Nothing else pins.
- `prefers-reduced-motion`: show final states, stop autoplay loops and marquees, keep
  hover-flip as an instant swap, and turn Lenis off.
- Pause offscreen loops (IntersectionObserver) and pause on `document.hidden`.

### Video

- `<video muted playsInline loop preload="none" disablePictureInPicture disableRemotePlayback>`
  with a poster. Play only when intersecting (rootMargin 200px) and pause otherwise. At most 6
  decoding at once on desktop and 3 on mobile.
- Encoding (ffmpeg 9 is on PATH): H.264 yuv420p `+faststart`, no audio, 4–8s trimmed loops
  at 24–30fps, CRF 28–32. Tiles are 360×640 (≤ ~400KB); the featured bento loop is 540×960.
  Posters are WebP ≤ 30KB.
- Every video tile carries data (score, views, platform, hook label) so it reads as evidence.

## 3. Home page order (component per section)

| # | Section key | Brief section | Notes |
|---|---|---|---|
| 0 | `navbar` | retained navbar | shrinks on scroll |
| 1 | `hero` | 1. Hero (UgHZX) | full-bleed; platforms strip at the bottom (retained "platforms covered") |
| 1.5–2 | `statement-simulator` | giant text (G1o2H) → pinned scroll-jack (J7ZHKO→H4IoP) → simulator | retained "stop scrolling" copy as the statement |
| 3 | `how-it-works` | 1-2-3 (D1IvW3 is a good layout ref) | ends with the retained "Get started" copy + deepdive video (`public/conthunt agent - zoom.mp4`, re-encoded) |
| 4 | `bento` | jreAl + q41dd | first tile is larger: centre video with a "Hover me" hint and a data explosion; other tiles use the retained bento copy |
| 5 | `pricing` | quick pricing | 3 plans, yearly by default, monthly toggle, 1-week free trial on paid plans, discounted prices, no money-back line |
| 5b | `testimonials` | retained scrolling testimony | slim marquee strip below pricing |
| 6 | `tracking` | ZVfn8 style | "Experimental" badge; charts + tracking board image, not interactive |
| 7 | `mcp` | PLyVa | techy, with ASCII hover animations; prompt/MCP/CLI tabs |
| 8 | `blog` | AWqCh | 5 posts + a 6th "all articles" card; 3 per view; arrows page by 3 |
| 9 | `faq` | retained FAQ copy | single-open accordion |
| 10 | `footer` | retained newsletter + links, CebbF personality | big expressive ContHunt wordmark moment, light theme |

Other pages: `/pricing` (cards + calculator, dxwbn, with "time saved"), `/viral-now` (20 niches,
Netflix rows, niche grid of 30), and `/resources` + `/resources/[slug]` (blog index + article).

## 4. Shared data and asset locations

| Path | Owner (W1) | Contents |
|---|---|---|
| `src/content/site/*.ts` | content agent | retained legacy copy, typed (platforms, statement, bento, getStarted, testimonials, faqs, pricing, newsletter, footer links, nav links) |
| `docs/revamp/specs/simulator-spec.md` | simulator-spec agent | exact app structure for the simulator (labels, panels, fields); no invented structure |
| `docs/revamp/specs/viral-now-spec.md` | viral-now agent | in-app feature to remove, API contracts with real payloads, JEV ranking, backend plan |
| `docs/revamp/research/how-it-works-reference.md` | x-reference agent | frame-by-frame breakdown of the X animation, slowed down |
| `public/media/**`, `src/content/media/*.json` | media agent | hero prompt sets, statement chips, bento video + real analysis, tracking assets, how-it-works thumbnails |
| `src/content/viral-now/*.json`, `public/media/viral-now/**` | niche agent | top-20 niche list with rationale, and a seed snapshot of up to 30 ranked videos per niche |
| `content/blog/*.md` | blog writer | 9 articles with frontmatter |
| `public/blog/**`, `src/content/blog-covers.json` | cover agent | Infiknit background plates + overlay spec per cover |

## 5. Section build contract (W2)

- Each section is `src/components/sections/<key>/index.tsx` (default export, client or server
  as needed) plus private files in the same folder.
- Each has an isolated preview route `src/app/(preview)/preview/<key>/page.tsx` (URL `/preview/<key>`, created by foundation),
  so one broken section never blocks another agent's preview.
- Use the shared primitives in `src/components/ui/*` and `src/components/layout/*`
  (Letterbox, Rails, SectionHeader, Eyebrow, Emphasis, Button, Chip, VideoTile, ...).

## 6. File ownership

- **Foundation:** config files (`package.json`, `next.config.ts`, `tsconfig.json`,
  `postcss.config.mjs`, `eslint` config), `src/app/layout.tsx`, `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx` (Home),
  `src/app/globals.css`, `src/app/(preview)/**`, `src/components/layout/**`,
  `src/components/ui/**`, `src/lib/*.ts` (top level only).
- **Section agents:** `src/components/sections/<key>/**` and any page route named in their task.
- Package installs: only foundation in W1. In W2, a section agent may `pnpm add` a library it
  truly needs and must name it in its report. Coordinate through the report, not by editing
  `package.json` by hand.

## 7. Copy voice

Marketers and DTC/ecommerce teams. Short, declarative and concrete. Numbers beat adjectives.
Headlines have 8 words or fewer with one italic keyword. No "unlock", "supercharge",
"revolutionize", "seamless", "game-changer", "in today's fast-paced", or em-dash chains.
Retained legacy copy can be tightened, but keep its meaning and facts.

## 8. Verification standard (every build agent)

1. `pnpm exec tsc --noEmit` shows no errors in your files. Filter the output to your paths,
   since siblings may be mid-build.
2. Load your preview route on the running dev server (`http://localhost:3001/preview/<key>`;
   start it with `pnpm dev` if it is not up, and check first with
   `curl -s -o /dev/null -w "%{http_code}" http://localhost:3001`). Capture screenshots at
   1440×900 and 390×844 with the `agent-browser` skill (or Playwright via `pnpm dlx playwright`).
   Look at them with your image Read tool and fix what you see.
3. Exercise the interactions (hover, click, scroll, toggles) and check the console for errors.
4. Check reduced motion (emulate `prefers-reduced-motion: reduce`).
5. Save evidence screenshots to `.scratch/qa/<key>/` (gitignored) and list them in your report.


## 9. As built by foundation (authoritative paths)

Read `docs/revamp/FOUNDATION.md` for the primitives API. Home is `src/app/(site)/page.tsx`; the footer is built in `src/components/sections/footer/` (rendered by the `(site)` layout via `src/components/layout/footer`, NOT by Home). Page bodies live in `src/components/pages/<pricing|viral-now|resources>/`. Tailwind's default palette is removed: use token classes only (`bg-surface`, `text-muted`, `border-hairline`, ...). The shared dev server runs at http://localhost:3001 (started by the orchestrator; do not start or kill another one on 3001; if it is down, start your own on 3005 with `pnpm exec next dev --turbopack -p 3005` and stop it when done).
