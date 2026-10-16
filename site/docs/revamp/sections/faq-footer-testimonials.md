# Section briefs: `faq`, `footer`, `testimonials` (owner: Sonnet builder)

## `testimonials` (retained "scrolling testimony")

Owns: `src/components/sections/testimonials/**`.
Data: `src/content/site/testimonials.ts`.

- A slim band (no eyebrow) with two marquee rows moving in opposite directions, using the shared
  `Marquee` primitive. Rows pause on hover, and the band pauses offscreen.
- Cards: white paper with a hairline border, 16px radius, about 360px wide. Each holds the quote
  (Switzer 16–17px, ink) and, under it, the avatar, name and role or handle in muted text.
  If avatars are missing, use initials in a surface circle; never generate faces.
- Fade both band edges with a mask gradient. Reduced motion: a static 3-card row.
- Export a `variant` prop: `band` for home, and `compact` for the pricing page.

## `faq` (`[ 08 / 08 ] · FAQ`)

Owns: `src/components/sections/faq/**`.
Data: `src/content/site/faqs.ts` (retained copy; tighten only obvious issues).

- Clean, minimal and correctly sized. The heading ("Questions, *answered*.") sits left on
  ≥1024px; the accordion takes about 66% at the right.
- **Single-open accordion:** opening one item closes the previous.
  - Animate the height with Motion (`AnimatePresence` with height auto) or a GSAP height tween,
    about 0.35s ch.out.
  - The plus icon rotates into a minus.
  - Each question is Switzer 500 at 18–20px; the answer is in muted ink, 16px, with a max of
    62ch.
  - Hairline separators between items.
- Accessible: buttons with `aria-expanded` and `aria-controls`, and full keyboard support.
- Accept an `items` prop (defaulting to all FAQs) so the pricing page can pass a subset.
- End with a quiet line: "Still curious? Get started free →".

## `footer` (newsletter + links + personality)

Owns: `src/components/sections/footer/**` (the `(site)` layout renders it through `src/components/layout/footer`, which you must not edit).

Data:
- `src/content/site/newsletter.ts` and `src/content/site/footer.ts`: the retained copy and ALL
  links/docs, which the owner said are important.
- `src/lib/links.ts`.

Reference: `CebbF.png`. A light footer with mono column eyebrows (Explore, Socials, Resources,
Legal) and link lists, then a GIANT expressive wordmark with a soft iridescent layered shadow,
then a copyright row. "Keep the personality in theme with overall webpage."

- **Newsletter block first:**
  - the retained copy (headline + sub);
  - an email input with an ink submit button and success/error states;
  - post to the legacy endpoint if the legacy page had one (check `index.html`), otherwise
    `TODO` with a disabled submit and a note.
- **Link columns:** every retained link, grouped. Use mono uppercase eyebrows at 40% ink and
  links in Switzer 16px with a hover underline slide.
- **The personality moment:**
  - A full-width ContHunt wordmark: use `public/brand/wordmark-ink.png` (the foundation makes
    it), or an SVG trace via ffmpeg/potrace if available. Never hand-draw it.
  - Behind it sit 3–4 stacked, offset, blurred copies tinted in the site's data palette (accent
    blue, breakout gold and growth green at low saturation) as a soft chromatic shadow cascading
    downward, like CebbF's layered glow.
  - The layers follow the cursor slightly (parallax ±12px, eased) and settle when idle.
  - Reduced motion: static.
- **Butter detail:** the page's main content ends with 48–60px bottom corner radii, lifting over
  the footer (`--surface-2` background).
  - Coordinate this by having the footer render the colour behind. The radius belongs to the
    `(site)` layout, which the foundation owns, so put an exact CSS snippet in your report if it
    is needed.
- **Bottom row:** the copyright line and "All rights reserved." from the retained copy.
