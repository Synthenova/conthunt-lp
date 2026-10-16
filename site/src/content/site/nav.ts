// Legacy navbar copy and links, verbatim from index.html (lines 463-496).
// Value "MISSING" = the legacy page has no value for this field.
// Brief target (not legacy): logo goes to Home; center links are Pricing, Viral Now, Resources;
// right side is Login plus a "Get started" button. See docs/revamp/content/legacy-inventory.md.

export type NavLink = {
  label: string;
  href: string;
};

export type NavContent = {
  logo: {
    src: string;
    alt: string;
    href: string;
  };
  links: NavLink[];
  login: {
    label: string;
    href: string;
    iconId: string;
  };
};

export const data: NavContent = {
  logo: {
    src: "public/logo-title-white.png",
    alt: "ContHunt Logo",
    href: "MISSING",
  },
  links: [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
  ],
  login: {
    label: "LOGIN",
    href: "https://agent.conthunt.app",
    iconId: "lucide:arrow-right",
  },
};
