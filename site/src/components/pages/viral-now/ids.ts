/** DOM ids that tie the niche tabs to the content panel (kept out of component files for Fast Refresh). */
export const PANEL_ID = "vn-panel";

export const tabId = (slug: string | null): string => `vn-tab-${slug ?? "all"}`;

/** The closing call to action: the "Skip niche rows" link in the Explorer jumps here. */
export const CTA_ID = "vn-cta";
