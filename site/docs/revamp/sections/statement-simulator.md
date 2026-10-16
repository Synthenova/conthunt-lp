# Section brief: `statement-simulator` (owner: Opus animation engineer)

> Updated 2026-10-16 by `simulator-fullsize.md` (owner feedback; it wins where they differ, and
> OWNER_DECISIONS D5 records it). The landed simulator is no longer "centred in the letterbox": it
> is full size, the app simulated as the whole screen (`--sim-full-w`, the Full Control dialog's
> size), under a slim row with the eyebrow, the run caption, `Full Control` and `Get started`. The
> scroll-jack's story is unchanged, but the frame parks at about the old letterbox size and grows
> into the full size as it centres; the navbar steps aside while it is landed. The board's filters
> sit on the right of the simulator's header band. Phones are unchanged. Current behaviour:
> `src/components/sections/statement-simulator/README.md`.

Owns: `src/components/sections/statement-simulator/**`.

References:
- `G1o2H.png`: the giant statement with inline media squircles.
- `J7ZHKO.png` → `H4IoP.png`: the scroll-jack keyframes.
- `o29ppw.png`: the owner's layout sketch of the simulator.
- `ueumE.png`: the design-system vibe, a clean light SaaS app (Ace Studio).

Data:
- `src/content/site/statement.ts`: retained "stop scrolling" giant-text copy.
- `src/content/media/statement-chips.json`: 6 square loops.
- `docs/revamp/specs/simulator-spec.md`, `src/content/simulator/types.ts` and `placeholder.ts`.

## 1.5 Giant statement

- Centred, letterboxed, regular weight (400–500 Switzer) at a large statement size (about
  56–64px at 1440, line-height 1.1). Ragged centred lines of 4–6 words, as in G1o2H.
- Use the retained "stop scrolling" copy. You may tighten it to about 18–26 words while keeping
  its meaning. Weave **inline media squircles** between words: 4–6 of the statement-chip loops,
  sized about 1.05 cap-height+ (≈ 64px at 1440), with radius 22% and autoplay muted while visible.
- Reveal: words go from 15% to 100% opacity in reading order, scrubbed by scroll (Butter
  highlightWords style). The chips scale from 0.6 to 1 with a slight rotate as their neighbouring
  word lights up.

## The ONE pinned scroll-jack on the page

The owner described it as: "reveal the text, then the text moves to the left. The simulation
slowly comes in … and lands in the center. That's where the scroll jacking ends."

The keyframe nodes show the UI entering from the right edge and travelling LEFT into the centre,
while the text moves left and out. Build exactly that leftward motion:

1. The statement is fully revealed.
2. The statement **shrinks and moves to the left** into a smaller left-aligned headline block
   (J7ZHKO's left text). At the same time the simulator appears **peeking from the right edge**
   (about 40% visible), slightly scaled (0.92) and tilted (`rotateY` -6deg, perspective).
3. As the scroll continues, the simulator **slides left to the centre**, straightens and scales
   to 1. The headline **slides out left** and fades.
4. The pin ends with the simulator centred and fully interactive (H4IoP).

- Use one ScrollTrigger timeline with `pin: true` and `scrub: 0.6`, with a pin length of about
  220–260% of the viewport height. Keep it smooth with Lenis.
- Below 768px: no pin. The statement reveals normally, then the simulator fades and slides in.
- Reduced motion: no pin and no scrub. Show the static statement, then the static simulator.
- Add a mono eyebrow `[ 01 / 08 ] · DEEP SEARCH` above the simulator's final position, plus a
  short caption line under it. For example: "A finished Deep Search: 500 videos, watched, scored
  and ready to explore." Follow the copy voice.

## The simulator (final position: centred in the letterbox)

**Design system:** modern, clean, light SaaS (ueumE).
- White canvas with a hairline frame; light grey #F7F7F7 sidebar.
- Switzer 13–14px UI type and lucide icons.
- Pills with 8px radius and soft hover states; no heavy shadows. Use the site tokens.
- Do NOT reuse the app's current visual styling. Keep the app's STRUCTURE exactly as specified
  in `simulator-spec.md`, and never invent new structure or data fields.

**Rendering:**
- Build at a fixed design width of 1200×740 and scale it to fit the letterbox width with a CSS
  transform (`--sim-scale`). It should read like a crisp product shot and stay interactive.
- Wrap it in a soft 24px-radius frame with a very subtle shadow.

**Regions** (per the spec and the o29ppw sketch):
- **Collapsible left sidebar:** the real nav items, a collapse button and an account footer.
  It animates width 220 → 56 (icons only, with tooltips) using the Flip plugin or a width tween.
- **Shared top header bar:** breadcrumb or title and actions, per the spec.
- **Tab strip at the top of the main area:** three completed deep searches.
  - Tab 1 is fully designed; tabs 2 and 3 show a loading skeleton state when clicked.
  - Each tab label carries its title plus a small "500" count badge.
- **Main board:** the deep-search results board.
  - A grid of video cards (4 per row at design width), with the fields the spec lists.
  - Filters and sort controls as in the spec.
  - Content is **skeletal**: shimmer placeholders for thumbnails and metrics, with a subtle
    ordered shimmer that runs only while in view.
  - The board header shows the realistic prompt, the counts ("500 videos analysed",
    "3 platforms") and status "Completed".
- **Right chat panel:** the real chat structure, moved to the right as in the app.
  - User prompt bubble, a "Worked for 4m 12s" style line, agent trace rows (skeleton lines with
    real label patterns from the spec), a report block skeleton, follow-up suggestions and the
    composer at the bottom (with the model picker if the spec has it).
  - Traces are skeletal because the owner will deliver real traces later.

**Data:**
- The component accepts props typed by `src/content/simulator/types.ts`, so the owner can drop
  real data in later. Default to `placeholder.ts`.
- Write a short `README.md` in your folder on how to feed real data.

**Micro-interactions:**
- Sidebar collapse; tab switching (an underline or pill that moves with Flip); card hover lift.
- Composer focus ring; chips. Clicking a skeleton video card opens a light side drawer skeleton
  (optional, only if the spec has a drawer).
