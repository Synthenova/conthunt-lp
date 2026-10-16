import type { Metadata } from "next";
import { SiteChrome } from "@/components/layout/site-chrome";
import { NotFoundView } from "@/components/layout/not-found";
import { FontPreloads } from "@/components/layout/font-preloads";

/**
 * Branded 404 for the whole site: unmatched URLs (/does-not-exist) and `notFound()`
 * calls from any route (/resources/does-not-exist).
 *
 * Next renders this file inside the root layout only. The (site) layout, which carries
 * the Navbar and Footer, is not part of that tree, so SiteChrome puts them back. The page
 * is light only (the site has no dark theme): `color-scheme: light` keeps form controls and
 * scrollbars light even when the visitor's system is dark. Next adds
 * `<meta name="robots" content="noindex">` and answers 404 itself.
 */
export const metadata: Metadata = {
  title: "Page not found",
  description: "This page does not exist or has moved.",
  // The root layout says "index, follow"; Next adds its own noindex for a 404, so state the same here
  // rather than leave two conflicting robots tags on the page.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div data-theme="light" className="contents" style={{ colorScheme: "light" }}>
      {/* First viewport beyond the site faces: the heading keyword (lib/fonts.ts). */}
      <FontPreloads faces={["boska400i"]} />
      <SiteChrome>
        <NotFoundView />
      </SiteChrome>
    </div>
  );
}
