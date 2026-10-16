// Legacy pricing cards, from index.html (lines 1213-1407).
// The "Risk Reversal" money-back line (legacy lines 1398-1405) is intentionally NOT included, per the brief.
// Legacy values are static in the HTML; the JS toggle swaps Creator and Pro prices to the yearly values below.
// The legacy page defaults to monthly (isAnnual = false); the brief wants yearly by default.
// Struck-through prices are shown in both billing states in the legacy page.
// Values "MISSING" = no source on the legacy page or in the app code.
// Cross-check against the app code and the open questions are in docs/revamp/content/legacy-inventory.md.

export type PricingFeature = {
  text: string;
  /** Legacy sub-line (text-xs, indented under the item above it). */
  indent: boolean;
};

export type PricingPlan = {
  id: "free" | "creator" | "pro_research";
  name: string;
  badge: string | null;
  /** Free shows $0 in both billing states. */
  price: { monthly: number; yearly: number };
  /** Legacy struck-through price, shown above the current price. Null when the legacy page shows none. */
  struckPrice: number | null;
  priceSuffix: string;
  /** Legacy card shows a "Billed ..." label; the Free card does not. */
  showsBillingLabel: boolean;
  features: PricingFeature[];
  cta: {
    label: string;
    href: string;
  };
};

export type PricingContent = {
  heading: string;
  subhead: string;
  billingToggle: {
    label: string;
    billedMonthlyLabel: string;
    billedYearlyLabel: string;
    legacyDefault: "monthly";
  };
  savingsBadge: string;
  plans: PricingPlan[];
  trialTerms: string;
};

export const data: PricingContent = {
  heading: "Transparent Pricing",
  subhead: "Lock in Beta pricing today. Prices increase after V1.0 launch.",
  billingToggle: {
    label: "Paid Annually",
    billedMonthlyLabel: "Billed Monthly",
    billedYearlyLabel: "Billed Annually",
    legacyDefault: "monthly",
  },
  savingsBadge: "Save up to 20%",
  plans: [
    {
      id: "free",
      name: "Free",
      badge: null,
      price: { monthly: 0, yearly: 0 },
      struckPrice: null,
      priceSuffix: "/mo",
      showsBillingLabel: false,
      features: [
        { text: "2 Platforms (IG, TikTok)", indent: false },
        { text: "10 Searches / mo", indent: false },
        { text: "10 AI Analyses / mo", indent: false },
        { text: "Gemini Flash Model", indent: false },
        { text: "1 AI Board", indent: false },
      ],
      cta: { label: "GET STARTED", href: "MISSING" },
    },
    {
      id: "creator",
      name: "Creator",
      badge: "Popular",
      price: { monthly: 29, yearly: 25 },
      struckPrice: 49,
      priceSuffix: "/mo",
      showsBillingLabel: true,
      features: [
        { text: "All Platforms", indent: false },
        { text: "50 Searches / mo", indent: false },
        { text: "1,000 AI Credits / mo", indent: false },
        { text: "~500 video analysis or", indent: true },
        { text: "~200 video indexing", indent: true },
        { text: "Latest AI Models", indent: false },
        { text: "5 AI Boards", indent: false },
      ],
      cta: { label: "CHOOSE PLAN", href: "MISSING" },
    },
    {
      id: "pro_research",
      name: "Pro Research",
      badge: "Full Experience",
      price: { monthly: 79, yearly: 63 },
      struckPrice: 139,
      priceSuffix: "/mo",
      showsBillingLabel: true,
      features: [
        { text: "All Platforms + Upcoming Platforms", indent: false },
        { text: "300 Searches / mo", indent: false },
        { text: "3,000 AI Credits / mo", indent: false },
        { text: "~1,500 video analysis or", indent: true },
        { text: "~600 video indexing", indent: true },
        { text: "Latest AI Models", indent: false },
        { text: "25 AI Boards", indent: false },
        { text: "Deep Search Agent (new)", indent: false },
      ],
      cta: { label: "CHOOSE PLAN", href: "MISSING" },
    },
  ],
  trialTerms: "MISSING",
};
