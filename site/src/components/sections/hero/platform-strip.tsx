/**
 * Platforms strip at the hero's bottom edge (retained "platforms covered").
 * Monochrome simple-icons marks. Static where the row fits (≥1280px); a slow
 * marquee below that (the Marquee primitive is static under reduced motion).
 *
 * The marks are drawn once, in a hidden sprite, and every copy (the static row
 * and the marquee's repeats) points at them with <use>, so the long brand paths
 * appear once in the page instead of once per copy.
 *
 * From 1024px the strip starts at the hero's gutter (the navbar logo's left
 * edge), like the hero text above it.
 */
import { Marquee } from "@/components/ui/marquee";
import { COVERED_PLATFORMS } from "./icons";

const symbolId = (name: string) => `ch-platform-${name.toLowerCase()}`;

function Sprite() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="absolute">
      {COVERED_PLATFORMS.map((p) => (
        <symbol key={p.name} id={symbolId(p.name)} viewBox="0 0 24 24">
          <path d={p.icon.path} />
        </symbol>
      ))}
    </svg>
  );
}

function Items({ as: Tag = "li" }: { as?: "li" | "span" }) {
  return COVERED_PLATFORMS.map((p) => (
    <Tag
      key={p.name}
      className="flex shrink-0 items-center gap-2 text-[13px] font-medium tracking-[-0.005em] text-ink/62 transition-colors duration-200 ease-out hover:text-ink"
    >
      <svg aria-hidden="true" focusable="false" className="size-[15px] fill-current">
        <use href={`#${symbolId(p.name)}`} />
      </svg>
      {p.name}
    </Tag>
  ));
}

export function PlatformStrip() {
  return (
    <div className="border-t border-hairline">
      <Sprite />
      <div className="flex h-[var(--strip-h,64px)] items-center gap-6 px-5 md:px-[calc((100%-var(--letterbox))/2)] lg:px-[calc(2.5rem+1px)] xl:gap-10">
        {/* The eyebrow's type with soft ink instead of --faint: ≈ 5.3:1 on --bg. */}
        <span className="shrink-0 font-mono text-[11px] font-medium uppercase leading-[1.3] tracking-[0.02em] text-ink/62 xl:text-[12px]">
          Covering
        </span>
        <ul aria-label="Platforms covered" className="hidden items-center gap-8 xl:flex">
          <Items />
        </ul>
        <div className="min-w-0 flex-1 xl:hidden">
          <Marquee speed={28} gap={32} label="Platforms covered" rowClassName="items-center">
            <Items as="span" />
          </Marquee>
        </div>
      </div>
    </div>
  );
}
