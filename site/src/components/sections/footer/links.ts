/**
 * Footer link columns: every retained link from `src/content/site/footer.ts`,
 * regrouped into Explore / Resources / Socials / Legal (CebbF structure) and
 * resolved to real URLs through `@/lib/links`.
 *
 * The legacy page had `href="#"` for all of them, so the content file stores
 * "MISSING". The map below is the only place a legacy label gets a URL.
 *
 * Still without a destination: Changelog (no page exists). It renders as a
 * disabled item with a "Soon" tag instead of a dead `#` link.
 *
 * Socials are shown only once their URL is CONFIRMED (see CONFIRMED_SOCIALS). The
 * guesses in links.ts failed a live check on 2026-10-15, so the Socials column is
 * left out until the owner supplies real URLs rather than shipping dead links.
 * Contact (`mailto:support@conthunt.app`) is also a `// verify` guess; a mailto
 * link cannot 404, so it stays.
 */
import { data } from "@/content/site/footer";
import {
  CONTACT_URL,
  DOCS_URL,
  GET_STARTED_URL,
  LOGIN_URL,
  MCP_DOCS_URL,
  PRIVACY_URL,
  ROUTES,
  SOCIALS,
  TERMS_URL,
  isExternal,
} from "@/lib/links";

export interface ResolvedFooterLink {
  label: string;
  /** null = no destination yet (rendered disabled, with a "Soon" tag). */
  href: string | null;
  /** Open in a new tab (socials). */
  newTab: boolean;
  external: boolean;
}

export interface ResolvedFooterColumn {
  title: string;
  links: ResolvedFooterLink[];
}

/** Legacy label -> URL. `null` means the destination does not exist yet. */
const LEGACY_HREF: Record<string, string | null> = {
  Features: `${ROUTES.home}#bento`, // home "Features" (bento) section; id comes from Section's sectionKey
  Pricing: ROUTES.pricing,
  Changelog: null,
  Docs: DOCS_URL,
  "Privacy Policy": PRIVACY_URL,
  "Terms of Service": TERMS_URL,
  Contact: CONTACT_URL,
  Twitter: SOCIALS.x,
  GitHub: SOCIALS.github,
  Discord: SOCIALS.discord,
};

/** Display label overrides (the legacy icon was Twitter; the product is X now). */
const LABEL: Record<string, string> = { Twitter: "X" };

const NEW_TAB = new Set(["Twitter", "GitHub", "Discord"]);

/**
 * Socials whose destination has been confirmed to exist and to belong to ContHunt.
 * Add the legacy label here ("Twitter", "GitHub", "Discord") once the URL in
 * `@/lib/links` SOCIALS is confirmed; its link then appears in the footer and the
 * Socials column returns. Checked 2026-10-15:
 *  - GitHub  https://github.com/conthunt      -> 404 (no such org or user)
 *  - Discord https://discord.gg/conthunt      -> invalid invite (Discord API: 404 "Unknown Invite")
 *  - X       https://x.com/conthunt           -> cannot be verified without a login (X answers 200 for any handle)
 */
const CONFIRMED_SOCIALS = new Set<string>([]);

function link(label: string, href: string | null, newTab = false): ResolvedFooterLink {
  return { label, href, newTab, external: href ? isExternal(href) : false };
}

function legacy(label: string): ResolvedFooterLink {
  const href = label in LEGACY_HREF ? LEGACY_HREF[label] : null;
  return link(LABEL[label] ?? label, href, NEW_TAB.has(label));
}

/** Retained labels, flattened (columns first, then socials), for the "nothing dropped" fallback. */
const retainedLabels = [...data.columns.flatMap((c) => c.links.map((l) => l.label)), ...data.socials.map((s) => s.name)];

const PLACED = {
  explore: ["Features", "Pricing"],
  resources: ["Docs", "Changelog"],
  socials: ["Twitter", "GitHub", "Discord"],
  legal: ["Privacy Policy", "Terms of Service", "Contact"],
};

const placed = new Set(Object.values(PLACED).flat());
/** Anything the content file gains later still shows up (in Resources) rather than disappearing. */
const unplaced = retainedLabels.filter((label) => !placed.has(label));

export const FOOTER_COLUMNS: ResolvedFooterColumn[] = [
  {
    title: "Explore",
    links: [
      legacy("Features"),
      legacy("Pricing"),
      link("Viral Now", ROUTES.viralNow),
      link("Log in", LOGIN_URL),
      link("Get started", GET_STARTED_URL),
    ],
  },
  {
    title: "Resources",
    links: [
      link("Articles", ROUTES.resources),
      legacy("Docs"),
      link("MCP docs", MCP_DOCS_URL),
      legacy("Changelog"),
      ...unplaced.map(legacy),
    ],
  },
  { title: "Socials", links: PLACED.socials.filter((label) => CONFIRMED_SOCIALS.has(label)).map(legacy) },
  { title: "Legal", links: PLACED.legal.map(legacy) },
].filter((column) => column.links.length > 0);

/** Retained social labels hidden until their URL is confirmed (for the build report). */
export const FOOTER_SOCIALS_UNCONFIRMED = PLACED.socials.filter((label) => !CONFIRMED_SOCIALS.has(label)).map((label) => LABEL[label] ?? label);

/** Labels that still have no destination (for the build report). */
export const FOOTER_LINKS_WITHOUT_DESTINATION = FOOTER_COLUMNS.flatMap((c) => c.links)
  .filter((l) => l.href === null)
  .map((l) => l.label);

/** "© 2024 ContHunt Inc. All rights reserved." -> ["© 2026 ContHunt Inc.", "All rights reserved."] */
export function copyrightParts(now = new Date()): [string, string] {
  const year = String(Math.max(2026, now.getFullYear()));
  const text = data.copyright.replace(/\b20\d{2}\b/, year);
  const match = text.match(/^(.*?\bInc\.)\s*(.*)$/);
  return match ? [match[1], match[2]] : [text, ""];
}
