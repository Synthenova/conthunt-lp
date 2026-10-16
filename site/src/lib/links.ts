/**
 * Every outbound URL the marketing site uses. Import from here; never hard-code.
 *
 * Sources:
 * - Legacy `index.html`: LOGIN and every GET STARTED button send users to
 *   `https://agent.conthunt.app` (nav anchor + `window.location.href` handlers).
 * - App repo `frontend/src/app/(private)/profile/components/McpSetup.tsx`:
 *   MCP "Full guide" → `https://conthunt.app/docs/integrations/mcp`.
 * - App repo `frontend/src/lib/mcp-setup.ts`: MCP server `https://mcp.conthunt.app`.
 * - Live check 2026-10-14: conthunt.app/docs, /docs/integrations/mcp, /privacy and
 *   /terms return 200 (an unknown path returns 404).
 * Lines marked `// verify` are guesses: the legacy footer used `href="#"` for them.
 */

const trimSlash = (url: string) => url.replace(/\/+$/, "");

/** ContHunt app origin. Override per environment with NEXT_PUBLIC_APP_URL. */
export const APP_URL = trimSlash(process.env.NEXT_PUBLIC_APP_URL || "https://agent.conthunt.app");

/** Public marketing origin (canonical URLs, OG). */
export const SITE_URL = "https://conthunt.app";

/** App sign-in (app route `src/app/login`). */
export const LOGIN_URL = `${APP_URL}/login`;

/**
 * Primary CTA, "Get started": the app home, whose search box is the deep-search
 * entry (app route `src/app/app/(public)/page.tsx`, guests allowed).
 */
export const GET_STARTED_URL = `${APP_URL}/app`; // verify: no dedicated deep-search query param exists yet

/** Docs. */
export const DOCS_URL = `${SITE_URL}/docs`;
/** The legacy blog (45 posts), served by nginx, not by Next: an absolute URL so it renders as a plain <a>. */
export const BLOG_URL = `${SITE_URL}/blog`;
export const MCP_DOCS_URL = `${SITE_URL}/docs/integrations/mcp`;
/** Hosted MCP server URL users paste into their client. */
export const MCP_SERVER_URL = "https://mcp.conthunt.app";

/** Legal. */
export const PRIVACY_URL = `${SITE_URL}/privacy`;
export const TERMS_URL = `${SITE_URL}/terms`;
export const CONTACT_URL = "mailto:support@conthunt.app"; // verify

/** Socials (the legacy footer showed X, GitHub and Discord icons with `href="#"`). */
export const SOCIALS = {
  x: "https://x.com/conthunt", // verify
  github: "https://github.com/conthunt", // verify
  discord: "https://discord.gg/conthunt", // verify
} as const;

/** Internal routes (site pages). */
export const ROUTES = {
  home: "/",
  pricing: "/pricing",
  viralNow: "/viral-now",
  resources: "/resources",
  article: (slug: string) => `/resources/${slug}`,
} as const;

/** Primary navigation (navbar centre). */
export const NAV_LINKS = [
  { label: "Pricing", href: ROUTES.pricing },
  { label: "Viral Now", href: ROUTES.viralNow },
  { label: "Resources", href: ROUTES.resources },
] as const;

/** Active-state test for nav links: exact match or a child route. */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** True for absolute http(s) or mailto URLs (render as <a>, not next/link). */
export function isExternal(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");
}
