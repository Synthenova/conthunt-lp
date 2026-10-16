# Simulator at full size (owner feedback, 2026-10-16)

Status: shipped (A, B, C, D, F; G landed with hero revision 3). Current behaviour and numbers:
`src/components/sections/statement-simulator/README.md`; QA in `.scratch/qa/w8/build/`.

## Owner's words (verbatim, preview annotation on the landed simulator canvas)

> "The simulation needs to be bigger than its current size. I like the size it shows up in the full view mode, so that should be the default size. In the full view mode, we are actually going full screen and simulating the app as the entire screen. Maybe we can have a little gap at the top or the bottom to show the items. But then ultimately, if the user wants to X out, that's where they come back to the other page."

Screenshot: `C:\Users\win10\.t3\userdata\attachments\339f5a3a-e4d9-4850-a954-61853571c364-3657f373-105a-4370-bc87-9302d4654804.png`
(the landed inline frame at 1280 x 800 canvas scaled 0.80, inside the 60vw letterbox).

## Interpretation (orchestrator decision)

The landed inline simulator takes the Full view dialog's size: the app simulated as the whole
screen. A slim row of the scene's items sits in a small gap above the frame. The dialog stays, renamed
"Full Control" (B); its X/Close is the owner's "X out" back to the page.

## Specs

### A. Landed geometry (desktop and tablet with motion: the pinned stage)
- When the scroll-jack lands, the frame is sized like `.fullViewBody` in `sim.module.css` (the size
  the owner likes): `width: min(100vw - 2 * 24px, (100svh - row - gaps) * 1.6, 1440px)`, centred,
  16:10, so the canvas renders at about 0.99x at 1440 x 900, 1.0x at 1920 x 1080 and so on. It breaks
  out of the 60vw letterbox. This is the one deliberate exception below the hero, so record it in
  OWNER_DECISIONS.md (new D5).
- **The small gap.** One slim row (about 44px tall, like the full-view dialog header) directly above
  the frame, aligned to the frame's edges.
  - **Left:** the eyebrow `[ 01 / 08 ] · DEEP SEARCH` and the run caption ("A finished Deep Search.
    500 videos watched and ranked in 4m 12s."), condensed onto one line if it fits, eyebrow first.
  - **Right:** `Full Control` (ghost, small, see B) and `Get started` (primary, small).
  - Leave a small, even gap below the frame (about 16 to 24px) so the frame never touches the
    viewport edge.
- **Immersive while landed.** While the landed frame owns the screen (pinned and live), keep the
  frosted navbar out of the way so it never overlaps the row or the frame. Reuse the existing
  `[data-site-nav]` hide hook (see how `data-modal-open` works in globals.css; add a separate
  attribute such as `data-immersive` on <html>). The navbar comes back as soon as the scene unpins in
  either direction.
- **Choreography.** Keep the scroll-jack's story (statement → Flip into the left headline → the
  simulator swings in from the right and parks → it slides to the centre and straightens → the head
  rises in), retuned so the simulator **grows into the full-screen size** as it centres, like zooming
  into the app. The park state can stay at about the old letterbox size; the final state is the
  full-size frame. Keep it smooth (transforms only, one timeline) and keep LIVE_AT semantics (inert
  until it lands; "Skip to the live demo" still jumps to the landed state).
- **Wheel.** The current "engage" behaviour stays: the page owns the wheel until a click or focus in
  the frame, then the board, transcript and drawer take it and hand it back at their ends. With a
  full-screen frame, make sure a visitor who has not clicked can scroll on past the scene as before.

### B. Keep the dialog; rename the button "Full Control" (owner follow-up, supersedes the first draft)
Owner, later the same morning (annotation on the `Full view` button): "Rename this button to \"Full Control\"."
- **Keep** the Full view dialog (`simulator/full-view.tsx`) and its button. Rename the visible label to
  **"Full Control"**. Rename the dialog's accessible name to "Deep Search demo, full control" and
  update its header line to match (for example "Full control. Scroll, filter and open any video."), with
  apt, short copy.
- The dialog is how the visitor takes over the app. It covers the whole screen, the page is locked,
  the board and transcript scroll freely (`scrollMode="free"`), and the navbar is hidden.
- Its header row holds the items. Its existing **Close / X button (with Esc)** is the owner's "X out,
  that's where they come back to the other page". Keep it, check it, and polish it.
- Because the inline frame now has the same size, the dialog geometry stays as it is (`.fullViewBody`).
  Share one geometry definition (a CSS custom property or shared calc) so inline and dialog never drift.
- Show the `Full Control` button in the slim row above the inline frame (A), next to `Get started`,
  wherever the frame is interactive at desktop sizes (today it is hidden below 1024px; keep that).

### C. No separate inline X
The first draft of this spec added an inline X that scrolled to how-it-works. **Drop it.** The X lives in
the Full Control dialog (B). The navbar still steps aside while the landed inline frame owns the
screen (A, "Immersive while landed").

### F. Board filters move into the header (owner follow-up)
Owner (annotation on the rubric block's filter row with `Assessment score`, `Any Date` and the
platform picker): "These three selectors actually must go into the header, where we can see the search
prompt or the text. The right-side gap is free, that's where these three selectors must be put."
- Move the three selectors (sort `Assessment score`, date `Any Date`, platform `TikTok · Instagram ·
  YouTube`) out of `RubricBlock` (`simulator/board.tsx`, the `mb-4 flex flex-wrap` row) into the right
  side of the simulator's header band: the band with the search icon and the prompt title "DTC
  skincare: winning hooks, proof and offers". Right-align them in the band, vertically centred, at
  the same compact size.
- The title truncates with an ellipsis before it can collide with them. Their dropdowns and menus still
  open correctly (overlay layer, positioning, Esc, outside click) and still filter the board. Keep the
  sidebar collapse "push" animation correct (mark them `data-anchor="right"` if the header's right
  controls need to stay put).
- Remove the empty row from the rubric block and keep the board's top spacing tidy.
- The same change applies in the inline frame and in the Full Control dialog (both render the same
  component), and on phones (check the header at 0.8 scale; let the title truncate harder).

### G. Hero: remove the badge (owner follow-up)
Owner (annotation on `DEEP SEARCH · 500 VIDEOS IN < 5 MIN`): "remove this".
- Remove the mono badge above the hero H1 (`src/components/sections/hero/`) at every breakpoint.
  Rebalance the left column's vertical rhythm so the H1 now leads, and keep the lead card aligned with
  the prompt box and the connector beam correct. Keep the hero's entrance stagger coherent.
- Update `docs/revamp/sections/hero.md` (layout item 1).

### D. Other modes
- **Reduced motion** (no pin): the static frame uses the same full-size geometry in normal flow,
  with the same row above it.
- **Phones (< 768px):** unchanged (no pin; the sim fades and slides up and pans at its 0.8 minimum
  scale).
- **Tablets (768 to 1023px):** the formula gives about the viewport width minus the gutters; check
  820 x 1180 and 1024 x 768.
- Update the seam rhythm under the scene (`.section` padding in scene.module.css), the statement
  island's `--cis` placeholder height (heights-ssr.mjs), the scene header comment, and the docs
  (`docs/revamp/sections/statement-simulator*.md` if present, FOUNDATION.md or PLAN.md where they
  describe the scene, and the simulator README).

### E. QA
Check the landed state and the mid-choreography frames at 1280 x 720, 1440 x 900, 1680 x 1050,
1920 x 1080, 2560 x 1440, 1024 x 768, 820 x 1180 and 390 x 844, plus reduced motion.
- The frame fills the screen with even margins and the row is legible.
- The navbar never overlaps the row or the frame, and it comes back after the scene.
- Full Control opens the dialog on the current tab; its Close/X and Esc return to the page with focus restored.
- The header filters work (open, choose, filter, close) in the inline frame and the dialog.
- The hero has no badge, and its rhythm and beam are correct.
- The wheel passes through until the visitor engages.
- The simulator's own interactions all work at the new scale (tabs, drawer, filters, sidebar
  collapse, chat expanders, tooltips).
- No horizontal overflow.
- The 17 checks in `.scratch/qa/w6/perf/interact.mjs` still pass (update the checks for the renamed
  Full Control button and the moved filters).

### H. Hero revision 3 is owned elsewhere
After G, the owner sent more hero feedback (a centre line, an offer line, and no right-edge fade). It is
specified in `docs/revamp/sections/hero-rev3.md` and a **separate hero agent owns
`src/components/sections/hero/**` and `docs/revamp/sections/hero.md`** from 2026-10-16 05:55.
- The simulator build agent must not edit hero files after G.
- Reviewers and verifiers should check the hero against hero-rev3.md only once its status line reads
  "Status: shipped". Until then, leave hero files alone.
