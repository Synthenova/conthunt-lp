/**
 * SiteChrome — the public-page frame: skip link, fixed Navbar, <main id="main">, Footer.
 *
 * Mounted by src/app/(site)/layout.tsx for every public page, and by
 * src/app/not-found.tsx for the branded 404. Next renders the root not-found inside the
 * root layout only (the (site) layout is not in that tree), so the 404 puts the same
 * chrome back with this component instead of copying it.
 *
 * The skip link is the first focusable element on every page. It stays above the
 * viewport until it takes focus, then drops in above the fixed navbar (z-60 > z-50).
 * Following it focuses <main> (tabIndex -1, so the next Tab lands on the first
 * control inside it); programmatic focus on <main> draws no outline.
 *
 * <OffscreenSections> coordinates the deferred-hydration islands (<LazySection>: the
 * footer here, and Home's sections) and Home's `content-visibility` sections.
 */
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { OffscreenSections } from "@/components/layout/offscreen-sections";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-60 -translate-y-[calc(100%+3rem)] rounded-btn bg-paper px-4 py-3 text-[14px] leading-none font-medium text-ink shadow-float transition-transform duration-200 ease-out focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none focus:outline-none focus-visible:outline-none">
        {children}
      </main>
      <Footer />
      <OffscreenSections />
    </>
  );
}
