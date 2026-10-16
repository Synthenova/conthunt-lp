/**
 * NotFoundView — the body of the branded 404 (src/app/not-found.tsx adds the site chrome).
 *
 * Built like a Home section: Rails, the 20/60/20 letterbox, the mono eyebrow, a Display XL
 * heading with one Boska keyword, one sentence, the "Get started" CTA, then the three pages
 * a lost visitor is most likely to want. The score card (desktop) sits on the right.
 *
 *   <NotFoundView />
 */
import { ArrowRight } from "lucide-react";
import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Emphasis } from "@/components/ui/emphasis";
import { SectionHeader } from "@/components/ui/section-header";
import { GET_STARTED_URL, ROUTES } from "@/lib/links";
import { NoMatchCard } from "./no-match-card";

const GO_TO = [
  { label: "Home", href: ROUTES.home },
  { label: "Viral Now", href: ROUTES.viralNow },
  { label: "Resources", href: ROUTES.resources },
] as const;

export function NotFoundView() {
  return (
    <Rails>
      <Section
        sectionKey="not-found"
        padding="none"
        className="flex min-h-svh items-center pb-[var(--section-pad-y)] pt-[calc(var(--nav-h)+clamp(2rem,6vw,5rem))]"
        innerClassName="grid items-center gap-14 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12"
      >
        <div className="flex flex-col gap-9">
          <SectionHeader
            as="h1"
            size="xl"
            label="Error 404 · Page not found"
            title={
              <>
                Nothing to <Emphasis>hunt</Emphasis> here.
              </>
            }
            sub="This link is broken, or the page has moved. Run a deep search instead, or jump back to a page that exists."
            headingClassName="max-w-[12ch]"
          />

          <div className="flex flex-col gap-6">
            <div>
              <Button href={GET_STARTED_URL} size="lg">
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <nav aria-label="Pages" className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <span className="eyebrow mb-1 basis-full sm:mb-0 sm:mr-2 sm:basis-auto">Or go to</span>
              {GO_TO.map((link) => (
                <Button key={link.href} href={link.href} variant="secondary" size="md">
                  {link.label}
                </Button>
              ))}
            </nav>
          </div>
        </div>

        <NoMatchCard className="hidden md:block" />
      </Section>
    </Rails>
  );
}

export default NotFoundView;
