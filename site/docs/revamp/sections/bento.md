# Section brief: `bento` (owner: Opus animation engineer)

Owns: `src/components/sections/bento/**`.

References:
- `jreAl.png`: bento caption style. A 1–2 word **ink** caption, then a dimmer continuation in
  the same size, plus clean spacious tiles and small UI fragments. The ref is dark; ours is light.
- `q41dd.png`: the owner's sketch for the first, big tile. The centre box is the video; boxes of
  different shapes and sizes around it hold charts and data.

Data:
- `src/content/site/bento.ts`: the RETAINED bento copy for every other tile.
- `src/content/media/bento-analysis.json`: REAL ContHunt analysis of the featured video;
- `public/media/bento/featured.(mp4|webp)`.

## Heading

Eyebrow `[ 03 / 08 ] · FEATURES`, then a heading of 8 words or fewer with one Boska italic word.
For example: "Everything a video *knows*, on one screen." Follow the copy voice.

## Tile 1: "We know a lot" (bigger than the rest)

- Spans the full letterbox width, about 560–620px tall at 1440.
- **Rest state:**
  - The featured video sits centred (9:16, about 260px wide), playing muted when in view, on a
    calm `--surface` tile.
  - Top-left caption in the jreAl style, for example **"Deep analysis."** then muted "Every
    signal, from one video."
  - Bottom centre, subtle mono text: **"Hover me"** (on touch devices, "Tap me"), with a tiny
    animated cursor hint.
- **On hover (or tap): the data explosion.** Around the video, a mosaic of differently-sized
  panels animates in, staggered with a spring-like ease. They grow out from behind the video
  edges like cards dealt from the centre.
  - Follow the layout logic of the q41dd sketch: a tall panel at the left, a wide one at the
    top, a tall one at the right, and small ones at the bottom.
  - Every panel is a real micro-visual driven by `bento-analysis.json`:
    - **Hook:** the hook text in quotes, a timestamp chip `0:00–0:03` and the hook type.
    - **Metrics:** views, likes, comments, shares and engagement rate, in big mono numerals that
      count up.
    - **Qualitative:** 2–3 Q&A pairs (question in muted text, answer in ink).
    - **Quantitative:** a compact table of 6–10 measures.
    - **Trend:** the trend name plus a 14-point sparkline with an area (breakout gold or growth
      green).
    - **Audio:** the sound name, original or trending, plus an animated waveform bar group.
    - **Virality analysis:** a one-line "why it works".
    - **Scores:** 5–8 horizontal score bars that fill in sequence.
    - **Re-rank:** "Rank #14 → #2 for 'skincare unboxing hooks'", with an animated rank ticker.
  - Panels are white paper cards with hairline borders, 16px radius and small mono labels. They
    must stay legible and uncluttered. Fit them within the tile; do not overflow the letterbox.
- Mouse-leave reverses the animation (faster). Keyboard: the tile is focusable and Enter toggles
  it. Reduced motion: an instant reveal and no count-ups.
- Every value shown must come from `bento-analysis.json`. Fields marked "derived" may be shown,
  but nothing may be invented.

## Other tiles

- Use EVERY retained bento item: the caption is the first 1–2 words in ink, then the rest in
  muted text. Rewrite into this two-tone form while keeping the meaning.
- Lay them out as a clean grid inside the letterbox: 2 or 3 columns with mixed spans, a gap of
  about 16px, `--surface` tiles with 24px radius and generous padding (about 28–32px).
- Each tile gets ONE small, crisp, CODED UI fragment that illustrates the feature (light theme;
  no screenshots or stock images), and ONE micro-interaction on hover. Examples:
  - a filter chip snapping on;
  - a toggle sliding;
  - a sparkline drawing;
  - a copy-link pill with a check-mark morph;
  - a board grid where a card slides in;
  - a platform-glyph orbit;
  - a timestamp scrubber.
- The micro-interactions are what win: small, precise, about 200–400ms, ease ch.out.
- Keep everything clean, nothing complex. Use only `--surface`, `--paper` and ink, plus the
  accent in at most one or two places.
