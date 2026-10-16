# Section briefs: `tracking` (Sonnet builder) and `mcp` (Opus animation engineer)

## `tracking` (`[ 05 / 08 ] · TRACKING`, plus an "Experimental" badge)

Owns: `src/components/sections/tracking/**`.

Reference: `ZVfn8.png` for the design style. The text column at the left has a mono number, a
heading, dim body and a two-column feature list under a hairline. The board UI at the right shows
columns of cards with small metric glyphs. The ref is DARK; build it LIGHT.

Data: `src/content/media/tracking.json` (2 real accounts, Glossier and rhode, with avatars, handles,
followers and video posters; rev 2 dropped @dermatologysurgeon). App facts are in the app repo's tracking docs and code: rg in
`../conthunt/backend/app/services/tracking_service.py` and `../conthunt/frontend/src/app/app/(private)/tracking/`.
These cover what is tracked, the snapshot cadence, and limits. Do not claim features the app
lacks.

**Copy intent (owner):** "we let user track public accounts and selective videos from it, we
store daily cumulative data for the users to revisit and analyze for competitor campaign
performance and growth metrics." Call it an experimental feature. It is NOT an interactive
simulation.

**Visual (rev 2):** a static, beautifully composed "tracking board" in DOM/SVG.
- **Layout:** from lg, "What gets tracked" is a single ruled column on the left (4/12) and the
  board window on the right (8/12). Below, one full-width panel holds two charts side by side.
  Below lg the order is list, board, charts (list in two columns at md, one on phones). The
  board's columns swipe sideways on phones.
- **Board:** columns per tracked account (avatar, handle, follower count with the role label and the 7d change chip together on its right; a cover crop of the account's own poster fades in from the card's top-right corner via a radial mask), then
  that account's tracked video cards (poster, caption, views / likes / saves, a Δ24h chip, a
  14-day daily-gain bar sparkline). Captions reserve two lines (`min-h-[2.7em]`) so every card
  is the same height, and sit at 62% ink so the numbers lead.
- **Charts:** Followers and Likes, side by side, no toggle. Each shows both accounts as change
  since day one (pink for Glossier, blue for rhode; see COLOR_SYSTEM.md) with an end number, a 7D window, a daily-snapshot tick
  row, and a scrub crosshair that moves on both charts together. The scrub reading shows each
  account's value and daily gain (green up, red down). Legend buttons above pin an account.
- **Series are illustrative, not measured.** One public read gives no daily history, so the
  series are seeded (noise, a launch spike, a slump) and anchored so the last point is the real
  current count. They are labelled "Illustrative trend"; the board footnote says the 7-day
  changes and 24h gains are illustrative too. Do not call them real.

Lines draw once on view (DrawSVG), numbers count up once; then everything stays static except
hover and scrub. Reduced motion: everything is simply there.

## `mcp` (`[ 06 / 08 ] · POWER YOUR AGENT`)

Owns: `src/components/sections/mcp/**`.

Reference: `PLyVa.png` (Firecrawl), a "cleaner idea" with a light, framed, techy feel:
- a top bar with a mono step counter;
- a hero band with an ASCII-art field behind it, an "Agent ready" pill and a heading whose second
  line is in the accent;
- two cards below: "One command." with Prompt / MCP / CLI tabs and a copy button, and
  "Agent onboarding." with a cURL snippet and a "View the skill" link.

**Make it a bit more techy than the rest of the page:**
- **ASCII field:** a canvas-rendered ASCII density field, for example the ContHunt compass
  mark or a slowly rotating globe or orbit built from characters ` .:-=+*#%@`, in muted ink.
  - Hover makes characters near the cursor scramble or ripple and brighten toward the accent,
    then decay back.
  - Use a cheap canvas with DPR-aware text grid caching, about 30fps max, paused offscreen.
  - Reduced motion: a static frame.
- **Heading** (Switzer 700): line 2 is in the accent colour (the one allowed use here). For
  example "Plug ContHunt into / your AI agents".
- **Code cards:** JetBrains Mono, hairline frames, tab switching and a copy-to-clipboard button
  with a check morph. The ASCII flourish on the tab underline is optional.
- **REAL commands only.** Read the app repo for the actual MCP endpoint and CLI:
  - `../conthunt/backend/app/mcp/`;
  - `../conthunt/cli/` (README and cmd usage);
  - `../conthunt/frontend/src/app/cli/` and `../conthunt/frontend/src/app/oauth/`;
  - docs mentioning MCP.
  - The Next app rewrites `/mcp` to the backend, so the public MCP URL is probably
    `https://<app-domain>/mcp`. Verify the domain from `src/lib/links.ts` and the legacy page.
  - Show:
    - **Prompt tab:** a copy-paste instruction for an agent;
    - **MCP tab:** a JSON client config snippet for Claude/Cursor with the real URL;
    - **CLI tab:** the real install + login + deep-search command.
  - If a value cannot be verified, put a clear `<verify>` token in the string and note it in
    your report. Never invent a package name.
- Link "View the docs →" to `DOCS_URL` / `MCP_DOCS_URL`.
