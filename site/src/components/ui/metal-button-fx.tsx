"use client";

/**
 * MetalButtonFx: the primary <Button> wearing <MetalRing>, our own WebGL ring (metal-ring.tsx). Loaded
 * on demand by metal-button.tsx.
 *
 * The ring canvas is the button's last child, absolutely positioned over its border box, so the
 * button itself is unchanged: same element, size, radius, label, arrow, ink fill and hover, 0.98
 * active scale (the ring scales with it) and the site's 2px accent focus outline. The canvas stays
 * hidden until its first frame, so swapping in from the plain button never blinks or shifts.
 *
 * `data-metal-ring="on"` marks a button whose ring is on screen, for a button that draws a stand-in
 * ring of its own until then (the hero's static gradient, hero.module.css .cta). No WebGL, or a lost
 * context: the attribute is absent and the button looks plain.
 */
import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { MetalButtonProps } from "@/components/ui/metal-button";
import { MetalRing } from "@/components/ui/metal-ring";

/** The button radius token (--r-btn); the ring follows it. */
const BUTTON_RADIUS = 14;
/** Ring thickness: 1px is a hairline that vanishes on a near-black fill; 2px reads as metal. */
const RING_PX = 2;

export default function MetalButtonFx({ metal, ...rest }: MetalButtonProps) {
  const [on, setOn] = useState(false);
  const props = rest as ButtonProps;
  return (
    <Button {...props} data-metal-ring={on ? "on" : undefined}>
      {props.children}
      <MetalRing
        ringPx={metal?.ringPx ?? RING_PX}
        radius={metal?.radius ?? BUTTON_RADIUS}
        glow={metal?.glow ?? true}
        onGl={setOn}
      />
    </Button>
  );
}
