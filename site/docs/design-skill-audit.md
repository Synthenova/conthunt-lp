# ContHunt landing revamp: design-skill audit

Audited 2026-10-12 against the revamp brief (light mode, bold display + PP Neue Montreal, italic/script keyword emphasis, isometric and line motion, video-heavy proof). The current app and site were deliberately excluded. Section references like §4.5 point to [butter-reference-spec.md](butter-reference-spec.md).

## Verdict
- **Choose 6 core skills.** **impeccable** is the single art-direction, build and motion authority (shape, typeset, layout, quieter, craft, animate, critique, polish). **copywriting** drafts and **no-ai-slop** edits. **better-accessibility** is loaded at build time for the video wall. **better-interface** is the one review gate. **cloudflare:web-perf** is the late measurement gate.
- **Motion pillar covered since 2026-10-14.** The official GSAP skills are now installed: `gsap-scrolltrigger` (pin, scrub), `gsap-plugins` (DrawSVG, SplitText), `gsap-core` (`matchMedia` reduced-motion) and `gsap-performance`. Treat them as a seventh core slot alongside impeccable `animate`. The HyperFrames-scoped `gsap` skill is superseded. Isometric illustration is still uncovered (see Gaps).
- **Demoted from core after skeptic review:** taste-skill/minimalism, gsap, explain-interface, better-typography, better-colors and better-ui. Each one either duplicates impeccable or is already loaded inside better-interface.
- **Before the first build command:** create a new empty build folder and write PRODUCT.md, DESIGN.md and `.impeccable/config.json`. Without those, impeccable pushes back on the italic accents, mono numerals and restrained palette, and it injects a random brand hue.
- **Environment (updated 2026-10-14):** FFmpeg/ffprobe 9.0.2 installed via winget and added to the user PATH. Image and video generation runs through the Infiknit MCP: `infiknit-nano-banana-2-1` for images (1K-4K, up to 14 references) and `infiknit-gemini-omni-1.1` for video (9:16 or 16:9, 3-10s, 360p-4K, no audio). GEMINI_API_KEY is now needed only for video-analyze. Still missing: Chrome DevTools MCP; Pencil needs an open .pen file.
- **Owner decisions:** rights to real TikTok, Reels and Shorts clips, and Pangram Pangram web licences per domain (or the free body face under Type systems).

## Tier table

| Skill | Tier | Fit | Use for | Watch out |
|---|---|---|---|---|
| impeccable | core | 9 | Art direction, craft, typeset, animate, quieter, critique, polish, detector | Codex build; editorial-lane, radius, palette-seed rules need overrides |
| copywriting | core | 7 | Hero, subhead, CTA and section copy deck with emphasis-keyword field | 11-section default; "Stop X. Start Y." formula |
| no-ai-slop | core | 8 | Detect, then edit all copy; portability test on headlines | Exempt short display headlines from fragment and contrast bans |
| better-accessibility | core | 8 | Pause control, reduced-motion posters, decorative-loop semantics at build time | screen-readers.md:101 "always render controls" needs decorative-loop override |
| better-interface | core | 7 | Single evidence-based QA gate, Block or Approve | Needs new brief in recon docs; never point at old site |
| cloudflare:web-perf | core | 6 | CWV trace on each build: LCP, CLS, INP, font preload | Omits Media resource type; needs DevTools MCP |
| taste-skill/minimalism | situational | 5 | Quarry only: proof rail, contextual toolbar, command-input demo modules | Warm paper/bone default; anti-launch-page copy; React default |
| taste-skill (router) | situational | 3 | Loading one named style file, if any | Auto-routes to editorial-premium; assumes React/Next |
| taste-skill/swiss-system | situational | 4 | Grotesk scale, numbered indices, line-draw motion ideas | Bans decorative italics, blur, rounded pills |
| taste-skill/editorial-premium | situational | 3 | 58-66ch measure, caption rail beside video plates | Serif display, literary anti-ad titles |
| taste-skill/monochrome-modern | situational | 3 | "Stronger type, not neutral type" principle | Rejects gray-on-gray and blur; grayscale imagery |
| taste-skill/premium-bento | situational | 3 | Vocabulary for one example-outputs section | Busy dials, perpetual micro-motion |
| taste-skill/components | situational | 4 | Link index: draw-a-path, text-replacement, video rails, logo loop | React/Framer bias; ignore atmosphere backgrounds |
| apple-design | situational | 5 | Glass card material, press feel, tracking, reduced-motion policy | System-font default; weight-only emphasis |
| better-typography | situational | 6 | Rendering checklist: real italics, wrapping, tabular nums, text-box trim | Product-UI scale; no font loading; 3-font cap |
| better-colors | situational | 5 | One APCA/WCAG pass on grey-on-grey pairs | Demands dark variants; accent equals interactive |
| better-ui | situational | 5 | Video-tile outlines, shadow-borders, press scale | Says match project motion; blur entrances on tiles |
| better-layout | situational | 4 | Peeking video rails, full-bleed media, container queries | App-oriented; separators "last resort" |
| better-writing | situational | 5 | Microcopy: query placeholder, CTA labels, form states | Not for headlines; anchors to existing voice |
| variant | situational | 6 | User runs on hero emphasis and video-wall density | User-invoked; needs real fonts in place first |
| explain-interface | situational | 4 | One-off questions about a specific Butter effect | Teardown already in spec; user-invoked |
| interface-review | situational | 3 | Pre-merge PR gate typed by user | Duplicates repo-scope better-interface on greenfield |
| gsap-scrolltrigger, gsap-plugins, gsap-core, gsap-performance | core (motion) | 8 | Pinned isometric diagram, DrawSVG line drawing, SplitText reveals, matchMedia reduced-motion | Installed 2026-10-14; keep to one pinned scene |
| gsap | skip | 2 | Superseded by the official gsap-* skills | HyperFrames-scoped; no ScrollTrigger, DrawSVG, SplitText |
| hyperframes | situational | 4 | Demo/OG clip; port highlight-sweep and stroke-draw CSS patterns | House style is dense; needs DESIGN.md override |
| hyperframes-cli | situational | 3 | Scaffold, lint, render clips | Init installs extra skills |
| archify | situational | 3 | Topology draft for a how-it-works line diagram | Dark default, multi-hue, JetBrains Mono, no isometric |
| image-marketing | situational | 4 | OG spec; poster/avatar optimization checklist | AI-hero and stock bias |
| Infiknit | situational | 6 | Isometric concept frames (Nano Banana 2.1) and short abstract loops (Gemini Omni 1.1) | Never fabricate UGC clips; redraw concept frames as SVG |
| nano-banana-pro | skip | 2 | Superseded by Infiknit's Nano Banana 2.1 | Raster only; key unset; "don't read back" rule |
| imagegen-frontend-web | situational | 4 | Optional hero/section comps in minimalist mode | No image tool reachable; comps are mood only |
| image-to-code | situational | 3 | Hero and anti-nesting checklist (§14-17) only | Mandatory image-first loop; direct-code exception L407-410 |
| ui-recording-timeline | situational | 5 | Paint timeline of a cold load with dozens of loops | macOS `open` |
| pencil (pen.dev) | situational | 3 | Static hero comps side by side | Needs open .pen; no Neue Montreal, video or motion |
| social-content | situational | 5 | Hook taxonomy and 0-3s segments for analysis-card fields | Its hook formulas are cliches; data only |
| chatcut-ugc-ad-guide | situational | 4 | Hook/Problem/Demo/Proof/CTA durations; skincare category labels | Codex-only; never run synthetic-UGC generation |
| video-analyze | situational | 4 | Truthful timestamped breakdowns of licensed clips | Blocked: GEMINI_API_KEY (ffprobe installed) |
| youtube-transcript | situational | 2 | Verbatim 0-3s hook captions from captioned Shorts | YouTube only; pass raw 11-char ID |
| make-interfaces-feel-better | skip | 2 | Superseded by better-ui | No reduced-motion; auto-loads, defer to better-ui |
| redesign-existing-projects | skip | 1 | None | Scans old site; forbids rewrites (L12, L14, L173) |
| awwwards-landing-page | skip | 0 | None | Clones template; rm -rf .git; Vercel deploy |
| brandkit | skip | 1 | Only if a rebrand enters scope | Dark canvas default; image tool needed |
| imagegen-frontend-mobile | skip | 0 | None | Excludes landing pages (L28) |
| break | skip | 2 | Only if output cards become data-driven | Marginal on authored copy |
| hyperframes-registry | skip | 1 | None | Third-party blocks bring their own style |
| website-to-hyperframes | skip | 1 | Post-launch promo of the new site | Never aim at current site |
| remotion-skills | skip | 1 | None | React lock-in, commercial licence, broken paths |
| video | skip | 1 | None | Wrong HyperFrames API; nudges AI footage |
| fframes-video | skip | 2 | Read design.md motion doctrine only | Rust/FFmpeg 9 toolchain absent |
| quiet-luxury | skip | 1 | None | Warm creams, anti-sales copy |
| gallery-minimal | skip | 0 | None | Bans autoplay (L219) and advertising copy |
| soft | skip | 2 | None | Warm smoked palette, drift motion |
| warm-modern | skip | 1 | None | Anti "cold minimalism", warm palette |
| brutalism | skip | 1 | None | Poster brutalism, rejects rounded and soft |
| soft-brutalism | skip | 2 | Borrow typography paragraph L189-191 as a note | Thick borders, exposed seams |
| dark-luxe | skip | 0 | None | Dark mode base |
| cinematic-product | skip | 2 | None | Dark stage, 7/7 motion dials |
| dashboards | skip | 0 | None | Rejects hero copy and whitespace |
| marketing-ideas | skip | 1 | Post-launch growth ideas | Popup suggestion |
| unslop | skip | 1 | None | Codex-only; straight quotes; no fragments |
| principle-exhaust-the-design-space | skip | 2 | Apply its rule by hand: 2-3 real hero directions | Codex-only stub |
| principle-experience-first | skip | 1 | None | Codex-only stub |
| chatcut-shader-gen | skip | 0 | None | ChatCut video tooling only |
| chatcut-create-motion-graphics | skip | 2 | Read motion doctrine L138-174 | ChatCut-only; not web |
| chatcut-app-promo-guide | skip | 1 | Separate promo via Path B only | Path A scrapes current site |
| video-input, SEO skills, full-output-enforcement, Liquid | skip | 0 | SEO/OG at launch only | No design guidance |

### Overlap winners and losers
- **Art direction.** impeccable wins over taste-skill/minimalism. minimalism `skill.md:185` defaults to "paper, bone ... warm gray", which impeccable `SKILL.md:68` bans and which contradicts the cool grey brief. minimalism also takes an anti-launch-page copy stance (`:193`) and defaults to React (`:19`). Running two style authorities would contradict itself. Also losing: imagegen-frontend-web and image-to-code (no image tool, and stills cannot show video), and pencil (no fonts, video or motion).
- **Build.** impeccable `craft` wins. It asks for the stack and offers Astro for landing pages (`craft.md:36`). awwwards-landing-page (template cloner) and redesign-existing-projects (improve-in-place) lose.
- **Typography.** impeccable `typeset` wins. It covers pairing, loading and metric-matched fallbacks (`typeset.md:82`, `:239`). better-typography loses because it leaves loading out (`SKILL.md:18`) and is tuned for product UI. It stays as a rendering checklist.
- **Color.** impeccable color strategy plus the spec tokens win. better-colors loses because it demands dark variants (`color-usage.md:102`). It runs inside better-interface anyway.
- **Polish.** impeccable `polish` leads. better-ui wins over make-interfaces-feel-better, which has no reduced-motion guidance and an unconditional stagger at `SKILL.md:39`.
- **Review.** better-interface wins over impeccable `audit`. better-interface refuses taste findings (`SKILL.md:16`). impeccable's audit theming rubric rewards dark mode (`audit.md:42`). Run one audit, not both. impeccable `critique` and the detector stay for design quality.
- **Motion.** The official gsap-* skills win (installed 2026-10-14), with impeccable `animate` for motion principles. The HyperFrames-scoped `gsap` skill loses.
- **Rendered video.** hyperframes wins over remotion-skills (React, licence), fframes-video (toolchain) and video (factual errors).
- **Asset generation.** Infiknit wins over nano-banana-pro: `infiknit-nano-banana-2-1` for images, `infiknit-gemini-omni-1.1` for video.
- **Copy.** copywriting is the only drafter. no-ai-slop wins over unslop, which is Codex-only and stricter on fragments and quotes.
- **Reference analysis.** The reference spec's verified teardown wins over explain-interface and a website-to-hyperframes capture.

## Stack sequence
1. **Setup (impeccable init / `document --seed`).** Work in a new empty folder and run context with `--target` there, never on the old index.html (`SKILL.md:13,15`). Write PRODUCT.md (user-confirmed, `init.md:72`), DESIGN.md and `.impeccable/config.json` ignores. Output: three context files and committed achromatic tokens, so the palette seed is skipped.
2. **Reference teardown (no skill).** Use reference spec §1. Use explain-interface only for one-off effect questions. Output: Butter tokens, eases and video pipeline to adapt.
3. **Content sourcing (social-content, chatcut-ugc-ad-guide as data; video-analyze or youtube-transcript when unblocked; real ContHunt output preferred).** Output: a rights-cleared clip manifest and real example queries and analyses as JSON.
4. **Copy deck (copywriting, then no-ai-slop Detect, then Edit).** Output: 6-7 sections with a headline, subhead and CTA each, plus one emphasis keyword per headline.
5. **Direction brief (impeccable `shape`; optional pencil or imagegen comps; hand-apply principle-exhaust with 2-3 real hero directions).** Output: a shape brief with the scene sentence and the Search → Analyze → Explain spine.
6. **Type system (impeccable `typeset`, better-typography checklist).** Output: font tokens, a fluid clamp scale, emphasis rules and a fallback stack.
7. **Section design (impeccable `layout`, `quieter`, `distill`; minimalism modules as quarry).** Output: section map, whitespace scale and component list from reference spec §4.6.
8. **Build (impeccable `craft`, Astro default, with better-accessibility loaded).** Output: page with live DOM output cards and a global "Pause motion" control.
9. **Motion (impeccable `animate` + `gsap-scrolltrigger`, `gsap-plugins`, `gsap-core`, `gsap-performance`; port hyperframes `css-patterns.md:13-54` highlight sweep and `:213-268` stroke draw).** Output: line-draw, isometric and split-text layer with a reduced-motion branch.
10. **Video and media (reference spec §4.5 by hand; image-marketing for posters and OG; hyperframes + cli only for one demo/OG clip).** Output: encoded loops, posters and an IntersectionObserver player.
11. **Variant decision (user runs `/variant`).** Output: chosen hero emphasis treatment and video density.
12. **Polish and review (impeccable `critique`, then `polish` with the detector; better-interface repo-scope gate; better-writing through it).** Output: findings table and Block or Approve.
13. **Performance (cloudflare:web-perf with Media added; ui-recording-timeline).** Output: CWV report against the reference spec §4.5 budgets and a paint timeline.

## Conflicts and overrides (write into DESIGN.md / PRODUCT.md)
Reasoning behind the non-obvious calls (full list below):
- **Editorial-typographic lane** (`impeccable/reference/brand.md:38`, `:98`; `SKILL.md:107`). Override through the register-reason exception at `brand.md:37` plus the explicit brief. The `brand.md:42` identity-preservation escape does not apply: it covers already-shipped brands, and this is greenfield. Also note that live.md departure mode only governs `live`, while the HARD RULE is enforced by `--target`.
- **Radius cap** (`impeccable/SKILL.md:94`, cards at most 12-16px) against reference spec §4.1 (24-32px). Decision: cards and tiles 12-16px, with one documented 24px exception for the glass case card.
- **Hero ceiling** (`impeccable/SKILL.md:35`, 96px) against the spec's 112px clamp. Decision: cap at 96px. Whitespace and weight carry the impact.
- **Background.** The screenshot is #FFFFFF, live Butter is #FAFAFA, and the brief says light grey. Decision: page #FAFAFA at chroma 0 (allowed by `impeccable/SKILL.md:69`), raised panels #FFFFFF, surfaces #F4F4F4.
- **Autoplay accessibility** (`better-accessibility/motion-and-zoom.md:57`, `better-interface/SKILL.md:84`). This is WCAG 2.2.2, so comply rather than override. Only `screen-readers.md:101` ("always render controls") is overridden, for silent decorative loops.

### Full override list
Paste these into the new project's DESIGN.md / PRODUCT.md before running any build command.

- HARD RULE scope: run impeccable context with --target on a new empty build folder; never read the old Landing Page index.html (overrides impeccable/SKILL.md:15 'Read at least one project file'; redesign-existing-projects/SKILL.md:12 skipped entirely).
- Light mode is mandated; record the scene sentence 'growth marketer at a desk mid-afternoon scanning dozens of vertical videos for hooks' (satisfies impeccable/SKILL.md:71 'Dark vs. light is never a default').
- Light-only page: set color-scheme: light; no dark tokens required (overrides better-colors/color-usage.md:102 and better-colors/SKILL.md:96 'both theme blocks present').
- Palette is Restrained and achromatic: page #FAFAFA, raised #FFFFFF, surface #F4F4F4/#EDEDED, ink #0F0F0F/#373737, muted rgba(15,15,15,.4), hairline #E6E6E6, pill #F6F6F6, one accent at <=10%; all neutrals chroma 0, never warm-tinted. Commit these tokens before craft so the random seed is skipped (overrides impeccable/SKILL.md:18 palette.mjs seed, palette.mjs:536 and :548 pure-white default, brand.md:11/:58/:96 'go big' color push; follows SKILL.md:69 chroma-0 off-white; ignores taste-skill/minimalism/skill.md:185 warm-gray default and impeccable quieter.md:56 tinted grays).
- Color comes from the videos; the keyword pill highlight is a separate decorative token, not the CTA accent (overrides better-colors/SKILL.md:51 accent-means-interactive).
- Editorial accent is a deliberate register choice: bold sans display, italic serif only on keyword spans, no drop caps, no broadsheet grid, no full-italic headlines, video and output artifacts are the dominant imagery; justify via brand.md:37 register-reason exception plus the explicit brief, not the brand.md:42 identity escape (overrides impeccable/reference/brand.md:38, :98 and SKILL.md:107).
- Keyword emphasis: one 1-3 word italic-serif phrase per headline at display sizes only, never in body or buttons; script (if used) max 2 per page at >=48px; never stack pill and italic on one word; emphasized words stay real text inside the heading (overrides better-typography/spacing-and-sizing.md:42 weight-step emphasis, apple-design/SKILL.md:224, no-ai-slop/SKILL.md:86 applies to prose only).
- Fonts: accent face is PP Editorial New Italic (not on reflex list); if Instrument Serif is chosen, suppress with hooks ignore-value overused-font (overrides impeccable/reference/brand.md:32 ban list and hyperframes/references/typography.md:9 for clips).
- Fallback stack uses a metric-matched alias, not raw Helvetica/Arial, or add ignore-value for helvetica/arial (overrides impeccable/scripts/detector/rules/checks.mjs:2088 OVERUSED_FONTS false positive).
- Display face must contrast PP Neue Montreal by width (Formula Narrow or Monument Extended) or be Neue Montreal itself (satisfies impeccable/SKILL.md:34 and better-typography/SKILL.md:34; overrides hyperframes/references/typography.md:17 for clips).
- Font families capped at display + Neue Montreal + accent; Neue Montreal Mono counts as a documented superfamily exception, else use tabular-nums (overrides impeccable/reference/typeset.md:114 and better-typography/choosing-fonts.md:23).
- PP Neue Montreal is a licensed brand decision: buy Pangram Web licences per domain/subdomain, self-host woff2, never publicly downloadable (overrides better-typography/choosing-fonts.md:30; apple-design/SKILL.md:226 system-font default).
- Display sizes: hero clamp max 96px (spec's 112px dropped), tracking -0.02 to -0.04em, never tighter (follows impeccable/SKILL.md:35 and :40).
- Radii: pills and toolbar 8px, buttons and video tiles 12-16px, cards 16px; single documented exception: the glass case card at 24px (overrides impeccable/SKILL.md:94 card cap vs REFERENCE SPEC 4.1 24-32px).
- Exactly one frosted glass card (client case card with 'See details' pill); no glass elsewhere (overrides impeccable/SKILL.md:84, taste-skill/minimalism/skill.md:187, swiss-system/skill.md:185, editorial-premium/skill.md:230).
- Floating toolbar uses either a hairline border or a <=8px-blur shadow, not both (follows impeccable/SKILL.md:93 ghost-card rule).
- Numbered markers 01/02/03 only on the genuine Search-Analyze-Explain sequence; hook timestamps carry inline 'impeccable-disable numbered-section-markers' (overrides impeccable/SKILL.md:88 and detector/engines/regex/detect-text.mjs:287).
- Small grey section labels are sentence case, not uppercase-tracked eyebrows on every section (respects impeccable/SKILL.md:87).
- Whitelisted motifs: one pill highlight per statement for queries/data, 'See details' pill, real query chips, one decorative editor toolbar, bare section numbers (overrides redesign-existing-projects/SKILL.md:95, taste-skill/editorial-premium/skill.md:169, image-to-code/SKILL.md:617 and :544).
- Centered composition only for statement sections (about 45ch, 3 lines, regular weight); everything else start-aligned (overrides taste-skill/editorial-premium/skill.md:60 at DESIGN_VARIANCE>4, better-layout/SKILL.md:30, redesign-existing-projects/SKILL.md:47).
- Motion: ease-out-expo or Butter out curve cubic-bezier(.2,.715,.205,.99); no bounce/spring on reveals; line art draws once in 0.6-1.2s then holds; at most one scroll-scrubbed pinned isometric diagram; no ambient drift on decoration; hero stagger only on first load (overrides taste-skill/minimalism/skill.md:389 hover-only dial and :352 spring bias, hyperframes/house-style.md:45, make-interfaces-feel-better/SKILL.md:39, redesign-existing-projects/SKILL.md:150).
- Isometric/line art is precise geometric SVG on a 2:1 dimetric grid, 1-1.5px non-scaling strokes depicting real product objects; any grid stays inside the diagram plate, never page wallpaper (satisfies impeccable/SKILL.md:95 and :97).
- Visual media = real rights-cleared short-form loops plus live DOM output artifacts; no stock, Unsplash or generated photography; never fabricate UGC (overrides impeccable/reference/brand.md:79, taste-skill/SKILL.md:176, minimalism/skill.md:26, Infiknit/SKILL.md:77, video/SKILL.md:127).
- Video tiles: framed 9:16, muted playsinline loop preload=none, no autoplay attribute, IntersectionObserver play/pause with 200px margin, <=6 concurrent decoders desktop/<=3 mobile, posters <=25KB (follows spec 4.5; apple-design/SKILL.md:207 no full-viewport moving backgrounds).
- Accessibility: one global 'Pause motion' pill, pause offscreen and on document.hidden, prefers-reduced-motion shows posters and finished drawings and disables marquees (complies with better-accessibility/motion-and-zoom.md:57 and better-interface/SKILL.md:84).
- Silent showcase loops are decorative: aria-hidden, no native controls, written hook label beside each tile; any spoken video gets captions and controls (overrides better-accessibility/screen-readers.md:101 'always render controls').
- Grey heading text >=3:1 at large sizes only, mono labels >=4.5:1 or aria-hidden (follows impeccable/SKILL.md:28).
- Proof section is a static 4-column monochrome logo grid of real clients plus one statement, no marquee (overrides taste-skill/minimalism/skill.md:154 and imagegen-frontend-web/SKILL.md:576).
- Output artifacts (analysis card, hook timeline, creator list) are single surfaces with internal rows/dividers, never cards in cards; at most one dark surface on the page (follows impeccable/SKILL.md:45; editorial hairlines are deliberate vs better-layout/grouping-and-alignment.md:11).
- Copy: page capped at 6-7 sections (overrides copywriting/SKILL.md:320).
- Display headlines of <=8 words may be verbless fragments; at most one contrast construction per page; body, cards and FAQ follow no-ai-slop fully (overrides no-ai-slop/SKILL.md:76 and :54, copywriting/SKILL.md:172, impeccable detect-text.mjs:302 SHORT_REBUTTAL).
- No fabricated stats: example searches and outputs come from real ContHunt output or are visibly labeled examples (follows copywriting/SKILL.md:83 and no-ai-slop/SKILL.md:30).
- New voice and tokens live in the new project's AGENTS.md/DESIGN.md so better-* recon anchors to the revamp (overrides better-interface/SKILL.md:42, better-ui/SKILL.md:12, better-colors/SKILL.md:16, better-writing/SKILL.md:20).
- Single compliance audit is better-interface; skip impeccable 'audit' because its theming score rewards dark mode (impeccable/reference/audit.md:42).
- Image-mock gates skipped in Claude Code; in Codex supply the Butter screenshot as approved direction (overrides impeccable/reference/craft.md:71).
- Performance trace adds 'Media' and 'Fetch' to resourceTypes (overrides cloudflare web-perf/SKILL.md:116).

## Type systems
| System | Display | Body | Emphasis | Licence |
|---|---|---|---|---|
| A. One-foundry editorial (recommended) | PP Formula Narrow/Semi Condensed 700-800 | PP Neue Montreal 400-500 + Neue Montreal Text | PP Editorial New Light/Regular Italic | All Pangram; trials for comps; 3-4 web licences before launch |
| B. Wide luxury | PP Monument Extended Bold (hero and sections only; Neue Montreal Bold below 600px) | PP Neue Montreal + Text | PP Editorial New Ultralight Italic | All Pangram; strict line-length control |
| C. Lean superfamily | PP Neue Montreal 700, tracking -0.03 to -0.04em | Neue Montreal Text | PP Editorial New Italic (spec's Instrument Serif is banned by `brand.md:32`; use only with `ignore-value`) | One paid family (+ OFL if Instrument Serif) |

**Rules for all three:**
- Width contrast satisfies the similar-sans bans (`impeccable/SKILL.md:34`, `better-typography/SKILL.md:34`).
- Mono numerals: Neue Montreal Mono is a separate product. Either document it as a superfamily exception to the 3-family cap (`typeset.md:114`) or use Neue Montreal with tabular-nums.

**Free body face (instead of PP Neue Montreal):**
- **Switzer** (Fontshare, ITF Free Font License, 100-900 + italics, variable) is the closest match: a neutral neo-grotesk with a straight-legged R and a straight-tailed y. The FFL allows commercial use and self-hosting via `@font-face`. It forbids subsetting, format conversion and redistribution, so ship the supplied woff2 files unmodified and keep them out of public repos.
- **General Sans** (Fontshare, FFL, 200-700 + italics) is the more geometric option with more character in bold.
- **Hanken Grotesk** (Google Fonts, OFL, 100-900 + italics) is the no-strings fallback: subsetting and redistribution are allowed.
- Avoid the usual "free Neue Montreal" picks. Inter, Geist, DM Sans, Space Grotesk and Plus Jakarta Sans are all on impeccable's ban lists (`brand.md:32`, `shared/constants.mjs:23`). Satoshi isn't banned, but it's very common on AI-built landing pages.

**Unverified facts:**
- The trial style list.
- Whether the locally installed PP Editorial New desktop files carry any web rights. Assume they do not.
- Pricing tiers beyond "from $40".

## Butter.video takeaways
**Take:**
- 120-200px section padding.
- Short declarative copy.
- Mono section numbers, used only on the Search/Analyze/Explain sequence.
- Pill highlight for queries and data.
- Floating DOM UI fragments (filter dropdown, "Save hook" toolbar, "See details" pill).
- Inline video chips in one statement.
- Split-line reveals at 0.6s with a 0.1s stagger.
- The out ease `cubic-bezier(.2,.715,.205,.99)`.
- Monochrome logo grid.
- Creator list as large typographic rows.
- The lazy video component: IntersectionObserver with 200px margin, `preload=none`, poster.

**Tone down:**
- WebGL/R3F hero, shaders, custom cursor, loader and page-transition mask.
- Hue-rotate scramble and saturated accents.
- 8+ dark panels: keep at most 1.
- Two 1800px pinned scenes: keep 1, the isometric diagram.
- Logo marquee: use a static grid.
- Few huge media panels: use many small 9:16 tiles (140-280px) that carry data.

**Depart deliberately:**
- Bold display, where Butter is all weight 400.
- Italic-serif accent, which Butter does not have.
- Negative display tracking.

## Gaps
- **Isometric illustration.** The only mention across all skills is `image-marketing/references/ai-image-prompting.md:79`. Hand-author SVG on a 2:1 dimetric grid (26.565°) per reference spec §4.4. Get concept frames from Infiknit (`infiknit-nano-banana-2-1`), then redraw.
- **Scroll-driven line drawing.** Covered by `gsap-scrolltrigger` and `gsap-plugins` since 2026-10-14 (all GSAP plugins free since 3.13). Use the hyperframes css-patterns ports for CSS-only fallbacks.
- **Script and italic keyword emphasis.** Copy reference spec §4.3 into DESIGN.md and settle the choice with `/variant`.
- **Video-wall engineering and encoding.** Use reference spec §4.5. FFmpeg is installed; write one reusable loop component and an encode script.
- **Clip rights.** This needs an owner decision before any clip ships.
- **Licensed font loading.** Use impeccable `typeset.md:82`, `:239` plus spec budgets (4 or fewer woff2, about 150KB). Buy the web licences.
- **Truthful example data.** Prefer real ContHunt output; video-analyze is the fallback.
- **Breakpoint visual QA.** Screenshot with agent-browser or t3 preview at 375, 768, 1440 and 1920.

## Appendix: skipped skills
- **redesign-existing-projects:** scans and improves the old site, which the HARD RULE forbids.
- **awwwards-landing-page:** template cloner with no design content.
- **brandkit:** identity board; off-scope.
- **imagegen-frontend-mobile:** excludes landing pages.
- **make-interfaces-feel-better:** superseded by better-ui.
- **break:** low value on authored copy.
- **hyperframes-registry, website-to-hyperframes:** video plumbing, and the latter is unsafe on the current site.
- **remotion-skills, video, fframes-video:** redundant video producers.
- **taste-skill quiet-luxury, soft, warm-modern:** warm palettes.
- **taste-skill gallery-minimal:** bans autoplay.
- **taste-skill brutalism, soft-brutalism:** wrong surfaces.
- **taste-skill dark-luxe, cinematic-product:** dark mode.
- **taste-skill dashboards:** app UI.
- **marketing-ideas:** growth tactics only.
- **unslop and principle-* stubs:** Codex-only.
- **chatcut-*:** ChatCut video tooling, not web.
- **SEO, Liquid, video-input, full-output-enforcement:** no design guidance.
