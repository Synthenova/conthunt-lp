# Hero revision 2 (owner feedback, 2026-10-15)

## Owner's words (verbatim)

> [annotation on the empty band left of the hero text] "this gap os awkward and wrong, hero section sho[uld …]"
> "We can add one more column of 5 static videos if needed for the hero section to display on larger windows cleanly (let's support upto 2k)"
> "instead of the current sound, which is harsh for the flipping, can we choose a more simpler sound that sounds like paper or cards flipping. lets use 'navigate (default)' from cuelume."
> "the bottom growth chart needs to be a little bit more opaque (make it roughly 30% solid) and show projection: the line doesn't seem to connect to the right margin of the video and that is good, we can use it to show projection dotted line and area color a little pale for differentiation."
> "Lose the five lines and instead have a circular stroke filler around the pause button. Pausing will also pause the filler, and that would look neat."
> [annotation on the prompt box] "clicking this box should not show that blue outline indicating activeness."
> [annotation on the board] "when hovering a pale white overlay comes in, and I don't want that"

Screenshots: `C:\Users\win10\.t3\userdata\attachments\339f5a3a-e4d9-4850-a954-61853571c364-92307206-356d-4029-8ae5-6ec996070992.png` (prompt box) and `…-d395c298-f01e-49a9-b075-bc0051ee81c8.png` (board).

## Specs

### A. Full-width layout (hard; Opus)
- The hero is the one full-bleed section (brief: "Hero section is full width"). Today its text column starts at the letterbox's 20% edge, which leaves a large empty band on the left of wide windows. Align the hero text's left edge with the **navbar logo's left edge** (the page gutter used by the large navbar), not the 20% letterbox. Everything below the hero keeps the letterbox.
- The board fills the space to the right. Support **1280 to 2560px wide** (owner: "support up to 2k") so the board looks deliberate at every width, with no dead zones and no oversized cards:
  - Column counts stay 1 · 2 · 3 · 4. On wider windows (from about 1680px, choose by measurement) add a **5th column of 5 static cards**.
  - "Static" means they do not take part in the split-flap wave: no flipping and no score ticking. They are the lowest tier: low scores (about 12 to 18%), mostly decline or flat charts. Use spare posters (ranks 11 and 12, plus other sets' low ranks) and show posters only, no video, to keep bytes low.
  - The last visible column bleeds off the right edge under the existing soft edge fade, as column 4 does today.
  - Card size scales with the viewport (clamp on height and width) so the triangle fills the vertical space between the navbar and the platform strip. Keep the 1 · 2 · 3 · 4 (· 5) triangle silhouette and the lead card aligned with the prompt box.
- Keep the connector beam from the prompt box to card 1 correct at every width.
- Below 1024px keep the current mobile and tablet behaviour.

### B. Flip sound → cuelume `navigate` (hard; Opus)
- Replace the synthesized clack in `flap-sound.ts` with cuelume `play("navigate", { theme: "default", ... })`. Keep the `FlapSynth` public API (`unlock`, `setEnabled`, `setActive`, `whenReady`, `clack`) so the engine does not change, or update the engine calls consistently.
- One subtle `navigate` per card **landing**. Intermediate fast flaps are silent, or at most every other one at very low volume. Respect the scheduled `delay` with timers. Use a minimum gap of about 45ms. Per-play volume is about 0.5 relative (the global cuelume volume already applies). Vary direction or emphasis slightly so a cascade reads like riffled cards, not one sound repeated.
- Keep every gate: the site-wide sound preference (`src/lib/sound.ts`), auto-mute when less than 45% of the hero is visible or the tab is hidden, and no sound before the first user gesture. Cancel pending timers when muting.

### C. Card chart with projection (hard; Opus)
- Area fill about **30% solid** (fill-opacity about 0.30, or a gradient from 0.30 at the top to about 0.18 at the bottom), keeping the trend colour (gold for breakout, green for growth, red for decline).
- The actual line still ends before the card's right edge, with the end-point dot. From that point, draw a **dotted projection line** to the right edge, extrapolating the trend: breakout keeps surging, growth climbs gently, decline keeps falling. Under the projection, use a **paler area** (about 40 to 50% of the main area's opacity) so actual and projected read differently. The line draw-in on landing should draw the actual part first, then the projection.

### D. Pager → circular progress ring (hard; Opus)
- Remove the five dash "example prompts" pager.
- Put a **circular stroke progress ring around the pause button**. It fills over the 6s cycle in sync with the engine's real cycle clock, resets when the prompt changes, and **freezes when paused** (and while rotation is paused for focus or typing). Use a thin stroke: ink at about 15% for the track and ink or accent for the fill. Under reduced motion it follows the 8s crossfade cycle, or shows static when the board is held.
- Keep an accessible way to jump between examples if one existed through the dots: for example, Left and Right keys while the pause button is focused, or drop it if the brief allows. Keep the pause button labels.

### E. Design corrections (Sonnet xhigh)
- **Prompt box focus:** no blue outline or ring on click or focus. Use a neutral, subtle elevation change instead: a slightly deeper soft shadow plus a 1px ink/12–18% ring. It must stay noticeable enough for keyboard users (WCAG 2.4.7) but not blue or "active-looking".
- **Board hover:** remove the pale white overlay or dimming that covers other cards when a card is hovered or turned. Hovering a card only turns that card.
- **Visual QA at 1280, 1440, 1680, 1920, 2048 and 2560 widths** (heights 800 to 1440): the text left edge aligns with the navbar logo, the board fills nicely, the 5th column appears only where it helps, the edge fade sits correctly, nothing collides with the platform strip, and the H1 has no awkward wraps. Fix what you see.
