import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Rails } from "@/components/layout/rails";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Emphasis } from "@/components/ui/emphasis";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { VideoTile } from "@/components/ui/video-tile";
import { ToggleDemo } from "./toggle-demo";

export const metadata: Metadata = { title: "Preview · ui kit" };

const SAMPLE_VIDEO = "/conthunt%20agent%20-%20zoom.mp4";

/** Foundation kitchen sink: every shared primitive and type utility on one page. */
export default function UiKitPreview() {
  return (
    <Rails>
      <Section sectionKey="kit-type">
        <SectionHeader
          index={1}
          label="Type scale"
          title={
            <>
              Find what <Emphasis>works</Emphasis>
            </>
          }
          muted="before it trends."
          sub="Two-tone heading: ink first phrase, muted continuation, one Boska italic keyword."
          actions={<Button href="/pricing" variant="secondary">See pricing</Button>}
        />
        <div className="mt-16 flex flex-col gap-8">
          <p className="display-xl">
            Display XL <Emphasis>italic</Emphasis>
          </p>
          <p className="display-l">Display L heading</p>
          <p className="display-m">Display M heading</p>
          <p className="statement">
            Statement: stop scrolling for ideas. ContHunt watches <Emphasis>500 videos</Emphasis> so you don&apos;t have to.
          </p>
          <p className="body-l text-ink-2">Body L — 18 to 20px for lead paragraphs.</p>
          <p className="text-base text-ink-2">Body — 16px. The quick brown fox jumps over the lazy dog.</p>
          <p className="text-sm text-muted">UI — 14px muted.</p>
          <Eyebrow index={3} label="How it works" />
          <p className="eyebrow">eyebrow utility · 11–12px mono</p>
        </div>
      </Section>

      <Section sectionKey="kit-controls">
        <Eyebrow index={2} label="Controls" className="mb-8" />
        <div className="flex flex-wrap items-center gap-3">
          <Button href="https://agent.conthunt.app/app" size="lg">
            Get started <ArrowRight className="size-4" />
          </Button>
          <Button>Primary md</Button>
          <Button size="sm">Primary sm</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <Chip mono>2.4M views</Chip>
          <Chip tone="breakout" dot mono>
            97 score
          </Chip>
          <Chip tone="growth" dot mono>
            +38%
          </Chip>
          <Chip tone="decline" dot mono>
            −12%
          </Chip>
          <Chip variant="surface">gym tok</Chip>
          <Chip variant="ink" size="sm">
            ink sm
          </Chip>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2" data-testid="hue-chips">
          <Chip tone="pink" dot>pink</Chip>
          <Chip tone="purple" dot>purple</Chip>
          <Chip tone="blue" dot>blue</Chip>
          <Chip tone="green" dot>green</Chip>
          <Chip tone="yellow" dot>yellow</Chip>
          <Chip tone="orange" dot>orange</Chip>
          <Chip tone="red" dot>red</Chip>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2" data-testid="hue-chips-surface">
          <Chip variant="surface" tone="pink" size="sm" dot mono>pink</Chip>
          <Chip variant="surface" tone="purple" size="sm" dot mono>purple</Chip>
          <Chip variant="surface" tone="blue" size="sm" dot mono>blue</Chip>
          <Chip variant="surface" tone="green" size="sm" dot mono>green</Chip>
          <Chip variant="surface" tone="yellow" size="sm" dot mono>yellow</Chip>
          <Chip variant="surface" tone="orange" size="sm" dot mono>orange</Chip>
          <Chip variant="surface" tone="red" size="sm" dot mono>red</Chip>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="ink">−30%</Badge>
          <Badge tone="accent">Experimental</Badge>
          <Badge tone="outline">Beta</Badge>
          <Badge tone="breakout">Breakout</Badge>
          <Badge tone="growth">Growth</Badge>
          <Badge tone="decline">Decline</Badge>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2" data-testid="hue-badges">
          <Badge tone="pink">pink</Badge>
          <Badge tone="purple">purple</Badge>
          <Badge tone="blue">blue</Badge>
          <Badge tone="green">green</Badge>
          <Badge tone="yellow">yellow</Badge>
          <Badge tone="orange">orange</Badge>
          <Badge tone="red">red</Badge>
        </div>
        <div className="mt-8">
          <ToggleDemo />
        </div>
      </Section>

      <Section sectionKey="kit-media">
        <Eyebrow index={3} label="Media + motion" className="mb-8" />
        <Reveal as="p" className="statement max-w-[28ch]">
          This paragraph reveals line by line the first time it scrolls into view, then restores its DOM.
        </Reveal>
        <div className="mt-12 grid grid-cols-3 gap-4 md:w-2/3">
          {[0, 1, 2].map((i) => (
            <VideoTile
              key={i}
              src={SAMPLE_VIDEO}
              label={`Sample clip ${i + 1}`}
              overlay={
                <div className="pointer-events-none absolute right-2 top-2">
                  <Chip variant="ink" size="sm" mono>
                    {97 - i * 9}
                  </Chip>
                </div>
              }
            />
          ))}
        </div>
        <Marquee className="mt-12" label="Marquee demo" gap={40}>
          {["TikTok", "Instagram Reels", "YouTube Shorts", "LinkedIn", "X"].map((p) => (
            <span key={p} className="display-m text-faint">
              {p}
            </span>
          ))}
        </Marquee>
      </Section>
    </Rails>
  );
}
