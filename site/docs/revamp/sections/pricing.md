# Section brief: `pricing` (home section) + `/pricing` page + calculator (owner: Sonnet builder)

Owns:
- `src/components/sections/pricing/**` (home section; export the reusable `PlanCards` and
  `BillingToggle` from here)
- `src/components/pages/pricing/**` (page body and calculator)
- `src/app/(site)/pricing/page.tsx` (replace the stub; keep the metadata)

References:
- `dxwbn.png`: the calculator layout ref. Its left column has numbered steps with multi-select
  chips, sliders with tick marks and feature chips. Its right column holds the recommended plan
  card with a monthly/annual toggle and savings. The ref is DARK; build it LIGHT with the site
  tokens.

Data: `src/content/site/pricing.ts` (retained plan items). Also read
`docs/revamp/content/legacy-inventory.md` for the app-code cross-check of plan names, prices,
trial terms and discounts.

## Home section (`[ 04 / 08 ] · PRICING`)

- Three plans "as before" (legacy names and items, items only; the old design is not retained).
  **Remove any money-back guarantee line.**
- **Yearly is the default.** A segmented toggle switches Yearly and Monthly, with a "Save X%"
  chip computed from the real numbers.
- **Discounted prices:** show the original price struck through in muted text, then the
  discounted price in big Switzer 700 with tabular numerals. Label the discount honestly from
  the data.
- **Paid plans:** a "1-week free trial" badge, CTA "Start free trial". The free or starter plan
  CTA is "Get started". All CTAs go to the links in `src/lib/links.ts`.
- **Cards:** white paper on the page with a hairline border and 24px radius.
  - The recommended plan is emphasised with an ink border and a small mono "MOST POPULAR" tag;
    a black card is not allowed.
  - Feature lists use check glyphs in muted ink, with the key limits (searches, videos, credits)
    in mono.
- **Micro-interactions:** the price rolls digit by digit when the billing toggle changes; cards
  lift subtly on hover.
- Below the cards, add a one-line link: "Not sure? Try the pricing calculator →" to
  `/pricing#calculator`.

## `/pricing` page

1. A page header with a short headline (one Boska italic word) and a sub.
2. The same `PlanCards` + toggle.
3. The **calculator** (`#calculator`): fun, tactile and honest.
   - **Left, step 1:** "What are you researching?" A multi-select of chip cards, for example
     product research, hook and ad research, competitor tracking, UGC creator sourcing, a trend
     radar for my niche, and agency client work.
   - **Left, step 2:** "How much research per month?" Sliders with tick marks, as in the ref:
     Deep Searches per month and videos per Deep Search (100/200/500/1000). Show the derived
     count "≈ N videos analysed".
   - **Left, step 3:** "Team & extras" chips: MCP / AI agents, tracking (experimental), seats if
     the plans have them.
   - **Right, a sticky result:**
     - "We recommend **Pro**": the plan that fits the usage, using the REAL plan limits.
     - The price with strike-through and discount, honouring the Yearly/Monthly toggle.
     - An "Expected monthly usage" bar against the plan allowance.
   - **Time saved, the hero metric:**
     - hours saved per month = videos analysed × minutes a person needs per video (default
       2.5 min to watch + note + compare) ÷ 60, minus the run time;
     - show it as a big count-up, for example "≈ 43 hours saved / month";
     - add a playful visual, such as a stack of 30-second clocks that collapses or a "you'd still
       be watching until Thursday" line;
     - add an editable "your hourly rate" field (default $40) that converts it to "≈ $1,720 of
       time".
   - **Under the numbers:** explain the assumptions in one muted line. It must be honest and
     editable, never a fake claim.
   - **CTA:** "Start your 1-week free trial" (paid) or "Get started".
4. The retained testimonials marquee: import from `@/components/sections/testimonials`. If it is
   still a stub, leave the import, since it will be filled.
5. A short pricing FAQ subset: import the FAQ section if it exposes a `items` prop; otherwise
   skip it and note that.

Use real numbers only. If the legacy and the app disagree on prices, use the app's current values
and list the disagreement in your report.
