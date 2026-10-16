/**
 * Testimonials — the retained "scrolling testimony" band (no eyebrow, no number).
 *
 *   <TestimonialsSection />                          // home: full-bleed tinted band, two opposing marquee rows
 *   <TestimonialsSection variant="compact" />        // pricing page: one slim row of smaller cards
 *   <TestimonialsSection items={data.items.slice(0, 2)} />
 *
 * Props
 *  - variant: "band" (default) | "compact"
 *  - items:   Testimonial[]  (default: every quote in src/content/site/testimonials.ts)
 *  - className: extra classes for the <section>
 *
 * Rows pause on hover and offscreen; the band header has a Pause control.
 * Reduced motion: a static three-card row, no marquee.
 *
 * Rows: the band is ONE row until the data has 6+ quotes (TWO_ROW_MIN in
 * ./marquees.tsx), then two opposing rows. With four quotes two rows would show
 * every quote stacked above itself.
 *
 * Data caveat (see docs/revamp/OWNER_DECISIONS.md C3): the four quotes have no
 * source. Avatars are initials; faces are never generated.
 */
import { Emphasis } from "@/components/ui/emphasis";
import { data, type Testimonial } from "@/content/site/testimonials";
import { cn } from "@/lib/cn";
import { TestimonialMarquees } from "./marquees";

export interface TestimonialsSectionProps {
  variant?: "band" | "compact";
  items?: readonly Testimonial[];
  className?: string;
}

/** "Trusted by top creators" -> ink phrase + Boska italic last word. */
function Heading({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  const last = words.pop() ?? "";
  return (
    <>
      {words.join(" ")} <Emphasis>{last}</Emphasis>
    </>
  );
}

export default function TestimonialsSection({ variant = "band", items = data.items, className }: TestimonialsSectionProps) {
  if (variant === "compact") {
    return (
      <section
        id="testimonials"
        data-section="testimonials"
        aria-labelledby="testimonials-heading"
        className={cn("relative py-6 md:py-8", className)}
      >
        <h2 id="testimonials-heading" className="sr-only">
          {data.heading}
        </h2>
        <TestimonialMarquees items={items} variant="compact" />
      </section>
    );
  }

  return (
    <section
      id="testimonials"
      data-section="testimonials"
      aria-labelledby="testimonials-heading"
      className={cn("relative border-y border-hairline bg-surface py-12 md:py-16", className)}
    >
      <TestimonialMarquees
        items={items}
        variant="band"
        header={
          <>
            <h2
              id="testimonials-heading"
              className="text-[clamp(1.5rem,1.1rem+1.7vw,2.375rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink [text-wrap:balance]"
            >
              <Heading text={data.heading} />
            </h2>
            <p className="max-w-[34ch] text-[15px] leading-snug text-ink-2/75 md:pb-1">{data.subhead}</p>
          </>
        }
      />
    </section>
  );
}

