/**
 * Hero (home, full-bleed). Server shell: the section frame, the platform glyphs
 * (simple-icons stays on the server) and the platforms strip. Everything
 * interactive lives in <HeroBoard> (client).
 *
 * Preview: /preview/hero. Spec: docs/revamp/sections/hero.md.
 *
 * First paint waits until the whole hero is parsed (`rel="expect"` + `blocking="render"`,
 * hoisted into <head> by React, pointing at the #hero-parsed marker after the board). Without
 * it a slow parse could paint a half-parsed board (one right-aligned column) that then jumps
 * into place: a 0.2 layout shift. Browsers without support ignore it; the block also ends
 * if the document finishes parsing first.
 */
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/cn";
import { HeroBoard } from "./hero-board";
import s from "./hero.module.css";
import { PLATFORM_GLYPHS } from "./icons";
import { PlatformStrip } from "./platform-strip";
import { heroVideoBytes } from "./video-bytes";

export default function HeroSection() {
  return (
    <Section sectionKey="hero" letterbox={false} padding="none" className={cn("isolate overflow-hidden", s.hero)}>
      <link rel="expect" href="#hero-parsed" blocking="render" />
      <HeroBoard glyphs={PLATFORM_GLYPHS} strip={<PlatformStrip />} videoBytes={heroVideoBytes()} />
      <span id="hero-parsed" hidden />
    </Section>
  );
}
