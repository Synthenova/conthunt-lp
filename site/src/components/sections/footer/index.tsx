/**
 * Footer — newsletter, link columns and the wordmark moment. Mounted on every
 * (site) page by `src/components/layout/footer`; preview at /preview/footer.
 *
 *   <FooterSection />        // no props
 *
 * Order (CebbF structure, light): newsletter block (retained copy + email field),
 * link columns (Explore / Resources / Legal, plus Socials once their URLs are
 * confirmed, see ./links.ts),
 * the full-width ContHunt wordmark with its layered chromatic shadow, then the
 * copyright row.
 *
 * Letterbox: like every home section, the text content (newsletter, link columns,
 * copyright row) sits in the 20/60/20 column, so its left edge lines up with the rails
 * and the FAQ above. Only the wordmark is full-bleed: it is the closing personality
 * moment (on phones it stacks into CONT / HUNT, see ./wordmark.tsx).
 *
 * "Lifted content" detail: the footer paints its own top cap, a strip in the
 * page background (--bg) with 32–60px bottom radii that continues the rail
 * lines, so the page appears to lift over the surface-2 footer. Because the cap
 * belongs to the footer, the (site) layout needs no change.
 *
 * Copy and links:
 *  - src/content/site/newsletter.ts, footer.ts (retained), resolved in ./links.ts
 *  - ./subscribe.ts: `subscribeToNewsletter` has live / demo / closed modes, see there.
 */
import Image from "next/image";
import type { CSSProperties } from "react";
import { Letterbox } from "@/components/layout/letterbox";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";
import { data as footer } from "@/content/site/footer";
import { data as newsletter } from "@/content/site/newsletter";
import { BackToTop, NewsletterForm, Reveal, Stagger, Wordmark } from "./island";
import { FooterLink } from "./footer-link";
import { copyrightParts, FOOTER_COLUMNS } from "./links";

/**
 * Link grid inside the letterbox: the blurb on its own row at md, then a blurb column
 * plus one column per link group from lg. The Socials column is omitted until its URLs
 * are confirmed (see ./links.ts), which leaves 3 link columns instead of 4.
 */
const GRID =
  FOOTER_COLUMNS.length === 3
    ? { cols: "md:grid-cols-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]", blurb: "md:col-span-3 lg:col-span-1" }
    : { cols: "md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]", blurb: "md:col-span-4 lg:col-span-1" };

const VARS = {
  "--footer-lift": "clamp(2rem, 1rem + 3.6vw, 3.75rem)",
  /** Side margin of the full-bleed wordmark from 640px up; phones use a small fixed margin (see the Wordmark call). */
  "--footer-px": "clamp(1.25rem, 0.5rem + 3vw, 4rem)",
} as CSSProperties;

/** "a machine." -> "a <Emphasis>machine</Emphasis>." (the one Boska keyword). */
function HeadlineLine({ text, keyword }: { text: string; keyword: boolean }) {
  if (!keyword) return <>{text}</>;
  const match = text.match(/^(.*?)([\p{L}\p{N}]+)([^\p{L}\p{N}]*)$/u);
  if (!match) return <>{text}</>;
  return (
    <>
      {match[1]}
      <Emphasis>{match[2]}</Emphasis>
      {match[3]}
    </>
  );
}

export default function FooterSection() {
  const [copyLeft, copyRight] = copyrightParts();
  const lines = newsletter.headlineLines;

  return (
    <footer data-section="footer" className="relative overflow-x-clip bg-surface-2 text-ink-2" style={VARS}>
      {/* Page cap: --bg with rounded bottom corners lifting over the footer, rail lines carried through. */}
      <div aria-hidden="true" className="relative h-[var(--footer-lift)] rounded-b-[var(--footer-lift)] bg-bg">
        <div className="rails-lines" />
      </div>

      <Letterbox className="pt-[clamp(3.5rem,7vw,7rem)]">
        {/* Newsletter: the headline owns its row at Display L, the pitch and the form share the next. */}
        <section aria-labelledby="newsletter-heading" className="flex flex-col gap-8 md:gap-10">
          <Reveal as="h2" id="newsletter-heading" className="display-l">
            {lines.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                <HeadlineLine text={line} keyword={i === lines.length - 1} />
              </span>
            ))}
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-end lg:gap-x-10">
            <p className="body-l max-w-[36ch] text-ink-2/75">{newsletter.subhead}</p>
            <NewsletterForm />
          </div>
        </section>

        {/* Links */}
        <Stagger className={cn("mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ink/10 pt-10 md:mt-20", GRID.cols)}>
          <div data-stagger className={cn("col-span-2 flex flex-col gap-5", GRID.blurb)}>
            <div className="flex items-center gap-2.5">
              <Image src="/brand/icon-ink.png" alt="" width={28} height={28} sizes="28px" className="size-7" />
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{footer.logo.wordmark}</span>
            </div>
            <p className="max-w-[32ch] text-[15px] leading-[1.55] text-ink-2/75">{footer.blurb}</p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} data-stagger aria-label={column.title}>
              {/* Eyebrow label at 60% ink (4.7:1 on surface-2) so the column titles sit one step below the ink links. */}
              <Eyebrow label={column.title} className="mb-4 [&>span]:text-ink/60" />
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </Stagger>
      </Letterbox>

      {/* The brand moment: the only full-bleed element. Phones get a small side margin (the stacked mark fills it). */}
      <Wordmark className="mt-14 px-2 pb-[clamp(2.5rem,7vw,6.5rem)] sm:mt-20 sm:px-[var(--footer-px)]" />

      {/* Bottom row, back on the column. */}
      <Letterbox className="flex flex-col gap-3 border-t border-ink/10 py-5 text-[14px] text-ink-2/75 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {copyLeft} {copyRight}
        </p>
        {/* Its own padding is hit area: pull the circle and the label onto the rail edges. */}
        <BackToTop className="-ml-1 sm:ml-0 sm:-mr-3 w-fit" />
      </Letterbox>
    </footer>
  );
}
