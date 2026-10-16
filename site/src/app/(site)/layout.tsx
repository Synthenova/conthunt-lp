import { SiteChrome } from "@/components/layout/site-chrome";

/**
 * Site chrome for every public page: skip link, fixed Navbar, page content, Footer
 * (see components/layout/site-chrome.tsx, which the branded 404 reuses).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
