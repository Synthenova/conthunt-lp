/**
 * One horizontal inset for the /resources pages (index, article body, article end).
 *
 * Copy, cards and controls on those pages sit one inset inside the rails: 20px on
 * mobile, 24px on tablet, 32px from 1280px. Only "media bands" (the /resources banner,
 * the article cover, the closing CTA band) touch the rails.
 *
 * The home "Resources" gallery does not use it: every home section header and card
 * row sits flush on the rails (one left edge down the page).
 *
 * Tailwind only sees complete class strings, so these are literals, not templates.
 */
export const RAIL_INSET = "px-5 md:px-6 xl:px-8";

/**
 * Small readable text on the page background. `ink-2` at 75% holds 5.4:1 on `bg`,
 * 5.2:1 on `surface` and 4.9:1 on `surface-2`, so it passes WCAG AA at 11px. Use it for dates, counts and
 * read-times; `muted` (5.3:1) also passes, never use `faint` (1.9:1) for text.
 */
export const TEXT_SOFT = "text-ink-2/75";

/**
 * Keyboard focus for a stretched-link card: the ring wraps the whole card (cover and
 * text), not the inline box of the title. The link carries `data-card-link` and hides
 * its own outline; sibling links inside the card (category chips) keep theirs.
 * The card must have a radius (20px) so the ring stays concentric with the cover.
 */
export const CARD_RING =
  "has-[a[data-card-link]:focus-visible]:outline-2 has-[a[data-card-link]:focus-visible]:outline-accent has-[a[data-card-link]:focus-visible]:outline-offset-[6px]";

/** The matching classes for the stretched link itself. */
export const CARD_LINK =
  "rounded-[4px] outline-none after:absolute after:inset-0 after:z-10 after:content-['']";
