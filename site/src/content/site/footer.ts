// Legacy footer, from index.html (lines 1435-1498).
// Every legacy footer link has href="#" (a placeholder), so every URL here is "MISSING".
// Legacy labels are kept verbatim. Social links have icons only; their names come from the icon ids.
// The legacy footer has no personality or wordmark copy; that part is new work.
// Value "MISSING" = the legacy page has no value for this field.

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: FooterLink[];
};

export type FooterSocial = {
  name: string;
  iconId: string;
  href: string;
};

export type FooterContent = {
  logo: {
    src: string;
    alt: string;
    wordmark: string;
  };
  blurb: string;
  socials: FooterSocial[];
  columns: FooterColumn[];
  copyright: string;
};

export const data: FooterContent = {
  logo: {
    src: "public/icon black 800px.png",
    alt: "ContHunt Logo",
    wordmark: "ContHunt",
  },
  blurb: "The all-in-one content aggregation and research intelligence tool for the modern web.",
  socials: [
    { name: "Twitter", iconId: "simple-icons:twitter", href: "MISSING" },
    { name: "GitHub", iconId: "simple-icons:github", href: "MISSING" },
    { name: "Discord", iconId: "simple-icons:discord", href: "MISSING" },
  ],
  columns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "MISSING" },
        { label: "Pricing", href: "MISSING" },
        { label: "Changelog", href: "MISSING" },
        { label: "Docs", href: "MISSING" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "MISSING" },
        { label: "Terms of Service", href: "MISSING" },
        { label: "Contact", href: "MISSING" },
      ],
    },
  ],
  copyright: "© 2024 ContHunt Inc. All rights reserved.",
};
