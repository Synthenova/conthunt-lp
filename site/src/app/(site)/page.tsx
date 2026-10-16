import { LazySection } from "@/components/layout/lazy-section";
import { Rails } from "@/components/layout/rails";
import { HomeJsonLd } from "@/components/seo/home-json-ld";
import { FontPreloads } from "@/components/layout/font-preloads";
import BentoSection from "@/components/sections/bento";
import BlogSection from "@/components/sections/blog";
import FaqSection from "@/components/sections/faq";
import HeroSection from "@/components/sections/hero";
import HowItWorksSection from "@/components/sections/how-it-works";
import McpSection from "@/components/sections/mcp";
import PricingSection from "@/components/sections/pricing";
import StatementSimulatorSection from "@/components/sections/statement-simulator";
import TestimonialsSection from "@/components/sections/testimonials";
import TrackingSection from "@/components/sections/tracking";

/**
 * Home — section order per docs/revamp/PLAN.md §3. The hero is full-bleed; every
 * section after it sits inside <Rails> (hairline column edges with "+" seams).
 * After the hero, sections stay cheap until the reader nears them: <LazySection> defers
 * their hydration and GSAP set-up, and `rails-cv` lets the browser skip rendering the
 * ones below the pinned statement scene (globals.css). Both keep the full server HTML.
 * <OffscreenSections> in <SiteChrome> coordinates them (components/layout/offscreen-sections.tsx).
 * Navbar and Footer come from the (site) layout. <HomeJsonLd /> renders the
 * Organization + WebSite + SoftwareApplication graph exactly once (server HTML).
 */
export default function Home() {
  return (
    <>
      {/* Beyond the site faces: the H1 keyword, and the statement scene's faces (it renders at load; lib/fonts.ts). */}
      <FontPreloads faces={["boska500i", "switzer600", "boska400i"]} />
      <HeroSection />
      <Rails className="rails-cv">
        {/* A tighter margin: this island hydrates the page's one pinned scene. */}
        <LazySection rootMargin="25% 0px" code="statement-simulator">
          <StatementSimulatorSection />
        </LazySection>
        <LazySection code="how-it-works">
          <HowItWorksSection />
        </LazySection>
        <LazySection code="bento">
          <BentoSection />
        </LazySection>
        <LazySection code="pricing">
          <PricingSection />
        </LazySection>
        <LazySection>
          <TestimonialsSection />
        </LazySection>
        <LazySection code="tracking">
          <TrackingSection />
        </LazySection>
        <LazySection code="mcp">
          <McpSection />
        </LazySection>
        <LazySection code="blog">
          <BlogSection />
        </LazySection>
        <LazySection code="faq">
          <FaqSection />
        </LazySection>
      </Rails>
      <HomeJsonLd />
    </>
  );
}
