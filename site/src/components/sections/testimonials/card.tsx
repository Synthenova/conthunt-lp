/**
 * TestimonialCard — one quote on white paper: hairline border, 16px radius,
 * the quote in Switzer ink, then an initials avatar, name and role.
 *
 * The avatar is a photo (public/media/testimonials/
 * {slug}.webp, 80px for a 36px circle) inside a thin hue ring, with the initials in a soft hue circle
 * as the fallback for a name without a photo. On hover the card lifts 2px, the border firms up under a
 * tight (≤8px) shadow and the ring takes the hue's full colour.
 */
import Image from "next/image";
import type { Testimonial } from "@/content/site/testimonials";
import { cn } from "@/lib/cn";
import type { Hue } from "@/lib/tones";

/** Avatar hues by index mod 6 (full class names so Tailwind emits them). White text sits on -ink fills; yellow keeps ink. */
const AVATAR_HUES: { hue: Hue; ring: string; cls: string }[] = [
  { hue: "pink", ring: "ring-pink/25 group-hover/card:ring-pink", cls: "bg-pink-soft text-pink-ink group-hover/card:bg-pink-ink group-hover/card:text-white" },
  { hue: "blue", ring: "ring-blue/25 group-hover/card:ring-blue", cls: "bg-blue-soft text-blue-ink group-hover/card:bg-blue-ink group-hover/card:text-white" },
  { hue: "green", ring: "ring-green/25 group-hover/card:ring-green", cls: "bg-green-soft text-green-ink group-hover/card:bg-green-ink group-hover/card:text-white" },
  { hue: "yellow", ring: "ring-yellow/25 group-hover/card:ring-yellow-deep", cls: "bg-yellow-soft text-yellow-ink group-hover/card:bg-yellow group-hover/card:text-ink" },
  { hue: "purple", ring: "ring-purple/25 group-hover/card:ring-purple", cls: "bg-purple-soft text-purple-ink group-hover/card:bg-purple-ink group-hover/card:text-white" },
  { hue: "orange", ring: "ring-orange/25 group-hover/card:ring-orange", cls: "bg-orange-soft text-orange-ink group-hover/card:bg-orange-ink group-hover/card:text-white" },
];

/** Names that have a photo in public/media/testimonials (slug of the name, see `slugOf`). */
const PHOTOS = new Set(["sarah-jenkins", "mark-d", "alex-rivera", "elena-k"]);

/** "Mark D." -> "mark-d". */
function slugOf(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A stable hue slot from the name, used when the caller passes no index. */
function slotOf(name: string): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % AVATAR_HUES.length;
}

/** "Sarah Jenkins" -> "SJ", "Mark D." -> "MD", "Alex" -> "A". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export interface TestimonialCardProps {
  item: Testimonial;
  /** Visual size. `compact` is for the pricing page strip. */
  size?: "default" | "compact";
  /** Position in its row: picks the avatar hue (index mod 6). Defaults to a hash of the name. */
  index?: number;
  className?: string;
}

export function TestimonialCard({ item, size = "default", index, className }: TestimonialCardProps) {
  const compact = size === "compact";
  const tone = AVATAR_HUES[(index ?? slotOf(item.name)) % AVATAR_HUES.length];
  const slug = slugOf(item.name);
  const photo = PHOTOS.has(slug) ? `/media/testimonials/${slug}.webp` : null;
  const px = compact ? 32 : 36;
  return (
    <figure
      className={cn(
        "group/card relative flex shrink-0 flex-col justify-between rounded-[16px] border border-hairline bg-paper",
        "transition-[transform,border-color,box-shadow] duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_8px_rgba(0,0,0,0.05)]",
        compact ? "gap-5 p-5" : "gap-7 p-6",
        className,
      )}
    >
      <blockquote
        className={cn(
          "text-ink [text-wrap:pretty]",
          compact ? "text-[15px] leading-[1.5] tracking-[-0.008em]" : "text-[16px] leading-[1.5] tracking-[-0.01em] sm:text-[17px]",
        )}
      >
        <span aria-hidden="true">&ldquo;</span>
        {item.quote}
        <span aria-hidden="true">&rdquo;</span>
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
            photo ? cn("bg-surface ring-2 transition-[box-shadow] duration-300 ease-out", tone.ring) : tone.cls,
            "tracking-[0.02em] transition-[background-color,color] duration-300 ease-out",
            compact ? "size-8 text-[11px]" : "size-9 text-[12px]",
          )}
        >
          {photo ? (
            <Image src={photo} alt="" width={px} height={px} unoptimized className="size-full object-cover" />
          ) : (
            initialsOf(item.name)
          )}
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[14px] font-medium text-ink">{item.name}</span>
          <span className="truncate text-[13px] text-muted">{item.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
