/**
 * ResourcesHeader: the /resources banner. The shared `_index` plate as a soft wide
 * tray, with the page headline, a sub and the latest post as a frosted pill.
 * The plate drifts a few px with the pointer (BlogCover) and shifts slightly on
 * scroll (transform only). From 700px of banner width a coded chart fragment (the
 * virality cover's) floats bottom-right, so the right half is not empty fog; it is the same
 * illustrative mock UI as on that article's cover and carries the "Illustrative UI" tag.
 * Text is real DOM above the plate, never inside the cover.
 * The banner is a media band (it touches the rails); its text uses the same inset as the
 * list below (`RAIL_INSET`: 20 / 24 / 32px) so the left edges line up down the page.
 */
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { BlogCover } from "@/components/sections/blog/cover/blog-cover";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { formatDateShort, getCover, getIndexCover, type PostSummary } from "@/lib/blog";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/links";
import { TEXT_SOFT } from "@/components/sections/blog/inset";
import { BannerScroll } from "./banner-scroll";

const pad = (n: number) => String(n).padStart(2, "0");

export function ResourcesHeader({
  latest,
  total,
  categories,
}: {
  latest: PostSummary;
  total: number;
  categories: number;
}) {
  return (
    <Section
      sectionKey="resources-header"
      padding="none"
      className="pb-8 pt-[calc(var(--nav-h)+1.25rem)] md:pb-10 md:pt-[calc(var(--nav-h)+2rem)]"
    >
      <div data-cover-host className="relative isolate overflow-hidden rounded-tray">
        <BannerScroll>
          <BlogCover
            cover={getIndexCover()}
            fragment={getCover("reading-virality-beyond-views").fragment}
            anchor="right"
            stageSize="clamp(9px, 1.28cqw, 14px)"
            priority
            sizes="(min-width: 1280px) 60vw, 100vw"
            style={{ position: "absolute", inset: 0, height: "100%", width: "100%", aspectRatio: "auto", borderRadius: 0 }}
          />
        </BannerScroll>

        {/* The text layer covers the whole banner, so it ignores the pointer except on its own text and
            the "Latest" link: the chart fragment underneath stays scrubbable. */}
        <div className="pointer-events-none relative z-10 flex min-h-[27rem] flex-col justify-between gap-12 px-5 py-6 md:min-h-[31rem] md:px-6 md:py-8 xl:px-8 xl:py-10">
          <div className="flex items-start justify-between gap-4">
            <Eyebrow label="Resources" className="[&_span]:text-ink-2/70" />
            <p
              className={cn(
                "hidden font-mono text-[11px] font-medium uppercase tabular-nums tracking-[0.02em] sm:block",
                TEXT_SOFT,
              )}
            >
              {pad(total)} articles <span aria-hidden="true">·</span> {pad(categories)} categories
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <Reveal as="h1" className="display-l pointer-events-auto max-w-[18ch]" immediate>
              Short-form research
              <span className="text-ink/50">
                , <Emphasis>explained</Emphasis>.
              </span>
            </Reveal>
            <p className="body-l pointer-events-auto max-w-[44ch] text-ink-2/85">
              Playbooks, guides and research from the team behind Deep Search. Every method starts from videos that
              already worked.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={ROUTES.article(latest.slug)}
              className="group/latest pointer-events-auto inline-flex max-w-full items-center gap-3 rounded-full bg-paper/75 py-1.5 pl-1.5 pr-4 text-[14px] text-ink shadow-[0_0_0_1px_rgba(15,15,15,0.06),0_8px_24px_rgba(26,34,44,0.1)] backdrop-blur-xl transition-[background-color,scale] duration-200 ease-out hover:bg-paper active:scale-[0.98]"
            >
              <span className="shrink-0 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.05em] text-paper">
                Latest<span className="hidden sm:inline"> · {formatDateShort(latest.date)}</span>
              </span>
              <span className="truncate font-medium tracking-[-0.01em]">{latest.title}</span>
              <ArrowUpRight className="size-4 shrink-0 transition-transform duration-300 ease-out group-hover/latest:-translate-y-px group-hover/latest:translate-x-px" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
