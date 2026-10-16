# Section brief: `how-it-works` (owner: Opus animation engineer)

Owns: `src/components/sections/how-it-works/**`.

References:
- `D1IvW3.png`: a strong layout ref. A two-tone multi-line heading with inline highlighted verbs
  and superscript step numbers, then three step panels with mini UI visuals, numbered mono labels,
  bold titles and dim body.
- `docs/revamp/research/how-it-works-reference.md` and `docs/reference/x-anim/*`: the owner's
  favourite animation. Rebuild its spirit for step 2, about 2–3× slower. Use only the beats that
  fit.

Data:
- `src/content/media/hiw-thumbs.json`: 60 small posters.
- `src/content/site/getStarted.ts`: retained "Get started" copy.
- `public/media/deepdive/*`: the deepdive video.

## Story (owner, verbatim intent)

"It breaks your search into a set of questions (Q) that need answering and parameters (P) to be
scored. Then it watches 500–1000 videos from your niche and analyzes them in less than 5 mins.
The summary gives you the best possible content search and answers backed with actual video
data." It is a sneak peek under the hood, nothing too technical.

**Heading** (D1IvW3 pattern, light theme), eyebrow `[ 02 / 08 ] · HOW IT WORKS`. For example:

> ContHunt **breaks down**¹ your question, **watches**² 500+ videos, and **ranks**³ what wins.

- The verbs sit in soft pill highlights with superscript mono step numbers.
- The rest is two-tone: the ink lead, then the muted continuation.
- Tighten the wording, but keep it to 3 lines or fewer at Display L.

## Three steps

Stack them as wide rows inside the letterbox, alternating text and visual. Visual rows read better
than three cramped columns at 60vw. Each visual plays once when it scrolls into view and then
idles gently. Do NOT pin; only the simulator section pins.

1. **01 · You ask.** A chat input types a realistic prompt (reuse the hero's input styling).
   For example: "Which unboxing hooks are driving TikTok Shop sales for skincare this month?"
   The submit arrow pulses, then the prompt "lifts" as a card into step 2.
2. **02 · It plans.** The X-reference adaptation.
   - The prompt card splits into **Q chips** (questions to answer, for example "Which hook types
     open the top 10%?" and "What price points appear?") and **P chips** (parameters to score,
     for example Hook strength, Relevance, Engagement rate, Velocity, Purchase intent).
   - These are connected by DrawSVG connector lines to a fan of **keyword queries** (for example
     `skincare unboxing`, `tiktok made me buy it serum`, `grwm skincare haul`) with platform
     glyphs.
   - Slow and legible: about 4–6s total, with staggered builds. Use mono labels for Q1..Q4 and
     P1..P5.
3. **03 · It watches and ranks.**
   - A grid of the 60 thumbnails, cycled to suggest 500–1000.
   - A scan line sweeps across them and a counter ticks up `0 → 512 videos watched`, with a
     timer `4:38`.
   - Then a Flip animation **re-ranks** them into an ordered list. The top 5 rise to the top as
     rows with score bars and a "matched Q1, Q3" chip, and the rest compress into a "+507 more"
     stack.
   - End with a compact answer card: two lines of summary plus a citation chip ("from 38 videos").

## Leading outro: keep talking to the agent

The owner said "just leave them with a leading thing that they can continue to talk to the agent
and extrapolate more information".

- Show a small chat follow-up row with 2–3 suggestion pills (for example "Turn the top 5 hooks
  into a creator brief"). Clicking one types it into a mini input.
- Below it, the **retained "Get started" block**: the retained copy (tightened, meaning kept) +
  the **deepdive video** (`deepdive-1280.mp4`, poster first) in a 16:9 frame with 24px radius.
  - The video plays muted inline when in view, with a small "Watch with sound" control that
    unmutes and shows controls.
  - Primary CTA: `Get started`.

## Notes

- Tokens only, light theme. The connector lines are hairline ink plus the accent for the
  active path.
- Reduced motion: show the final state of each step (chips placed, list ranked).
- Mobile: rows stack with the visual under its text; reduce the thumbnail count to 24.

## Owner revisions (2026-10-16)

- Step eyebrows read ASSISTANT, PLANNER, WATCHER and BACK TO ASSISTANT: number or arrow, a gap, the
  label (no dash between them).
- Step 01: the composer has no "New chat / Agent online" bar. The three "Try a brief" pills sit in
  the text column (`brief-picker.tsx`) above "Pick a brief to rerun the whole walkthrough."; the
  facts line is gone. Body copy: "Explain your requirements in detail or go on a vague rant. Your
  agent takes care of the rest."
- Autoplay: each of the three visuals starts when its own top edge reaches the vertical middle of the
  viewport (`playback.ts`, `start: "mid"`), including replays after a brief switch.
- Step 02: no facts list (heading 5 cols, body from col 6). Only Q rows fan out into the keyword
  searches; P rows have no path and the seam circles are gone.
- Step 03: Score/Views is one interruptible transform FLIP (a click kills the previous flight and
  continues from the current position). Restart wipes every inline trace of the wall-to-list flight.
- Header: no aside paragraph, only the Q/P legend.
- Outro row: title only (two lines on desktop); the paragraph and the Get started button are gone.
