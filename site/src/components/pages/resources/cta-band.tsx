/**
 * CtaBand: the closing "Get started" band, shared by /resources and every article.
 * A cover plate with a frosted card pinned bottom-left. It is a media band, so it
 * touches the rails (the rest of the page sits one inset inside them).
 *
 *   <CtaBand cover={post.cover} eyebrow="Deep Search" title={<>Ask your own <Emphasis>question</Emphasis>.</>}
 *            body="…" secondary={{ href: ROUTES.article("how-deep-search-works"), label: "How it works" }} />
 *
 * Server component. The plate is decoration only (alt is empty); the card carries the copy.
 */
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { MetalButton } from "@/components/ui/metal-button";
import type { CoverSpec } from "@/lib/blog";
import { GET_STARTED_URL } from "@/lib/links";

export interface CtaBandProps {
  cover: CoverSpec;
  eyebrow: string;
  title: ReactNode;
  body: string;
  secondary?: { href: string; label: string };
}

export function CtaBand({ cover, eyebrow, title, body, secondary }: CtaBandProps) {
  return (
    <div className="relative isolate overflow-hidden rounded-tray" style={{ backgroundColor: cover.dominant }}>
      <Image
        src={cover.plate1600}
        alt=""
        fill
        sizes="(min-width: 1280px) 60vw, 100vw"
        quality={60}
        placeholder="blur"
        blurDataURL={cover.blurDataURL}
        className="-z-10 object-cover"
      />
      <div className="grid min-h-[22rem] items-end p-3 md:min-h-[26rem] md:p-4">
        <div className="max-w-[34rem] rounded-card bg-paper/80 p-7 shadow-[0_0_0_1px_rgba(15,15,15,0.05),0_18px_44px_rgba(26,34,44,0.14)] backdrop-blur-xl md:p-9">
          <Eyebrow label={eyebrow} className="[&_span]:text-ink-2/75" />
          <h2 className="display-m mt-4">{title}</h2>
          <p className="mt-4 max-w-[44ch] text-[16px] leading-[1.55] text-ink-2/80">{body}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <MetalButton href={GET_STARTED_URL} size="lg" className="group/cta">
              Get started
              <ArrowRight className="size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
            </MetalButton>
            {secondary && (
              <Button href={secondary.href} variant="ghost" size="lg">
                {secondary.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
