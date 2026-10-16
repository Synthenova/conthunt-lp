// Legacy "platforms covered" copy and icons, from index.html.
// Marquee: lines 592-613. Bento platform tiles: lines 738-792.
// Copy mentions of platforms: bento body (line 733-734) and FAQ answer (line 1193-1194).
// Value "MISSING" = the legacy page has no value for this field.

export type PlatformMarqueeItem = {
  name: string;
  iconId: string;
  /** Legacy class "hidden md:block": not shown below the md breakpoint. */
  desktopOnly: boolean;
};

export type PlatformTile = {
  name: string;
  iconId: string;
  hoverColor: string;
  /** Legacy tile size class, for reference only. */
  legacySize: "large" | "small" | "wide";
};

export type PlatformsContent = {
  heading: string;
  marquee: PlatformMarqueeItem[];
  bentoTiles: PlatformTile[];
  /** Number of platforms as stated on the legacy page. */
  platformCount: string;
  listedInCopy: {
    bentoMultiPlatform: string;
    faqSupport: string;
  };
};

export const data: PlatformsContent = {
  heading: "Your platforms. Covered.",
  marquee: [
    { name: "TikTok", iconId: "simple-icons:tiktok", desktopOnly: false },
    { name: "YouTube", iconId: "simple-icons:youtube", desktopOnly: false },
    { name: "Instagram", iconId: "simple-icons:instagram", desktopOnly: false },
    { name: "Reddit", iconId: "simple-icons:reddit", desktopOnly: true },
    { name: "LinkedIn", iconId: "simple-icons:linkedin", desktopOnly: true },
    { name: "X", iconId: "simple-icons:x", desktopOnly: true },
    { name: "Pinterest", iconId: "simple-icons:pinterest", desktopOnly: false },
    { name: "Snapchat", iconId: "simple-icons:snapchat", desktopOnly: true },
  ],
  bentoTiles: [
    { name: "Instagram", iconId: "simple-icons:instagram", hoverColor: "#E1306C", legacySize: "large" },
    { name: "YouTube", iconId: "simple-icons:youtube", hoverColor: "#FF0000", legacySize: "small" },
    { name: "Facebook", iconId: "simple-icons:facebook", hoverColor: "#1877F2", legacySize: "small" },
    { name: "Pinterest", iconId: "simple-icons:pinterest", hoverColor: "#E60023", legacySize: "wide" },
    { name: "TikTok", iconId: "simple-icons:tiktok", hoverColor: "#00F2EA", legacySize: "large" },
  ],
  platformCount: "MISSING",
  listedInCopy: {
    bentoMultiPlatform:
      "Search keywords, hashtags, or creators across TikTok, YouTube Shorts, Instagram Reels, and LinkedIn simultaneously.",
    faqSupport:
      "Currently, we support TikTok, YouTube Shorts, and Instagram Reels. LinkedIn video and X (Twitter) support is in beta.",
  },
};
