"use client";

/**
 * MetalButton: the primary <Button> with the liquid-metal ring (our own WebGL shader, metal-ring.tsx),
 * for the "Get started" CTAs that carry the arrow. Same props as <Button>; nothing else on the site
 * wears it.
 *
 *   <MetalButton href={GET_STARTED_URL} size="lg">Get started <ArrowRight className="size-4" /></MetalButton>
 *
 * `metal` (optional) overrides the ring for a button sized off the default scale (the hero's, in its
 * --u unit): ring thickness and radius in CSS px, and `glow: false` for the ring without the halo.
 *
 * It server-renders and hydrates as the plain <Button> (the ring is a client-only canvas). Once the
 * page is idle the effect's code arrives in one chunk (a plain `import()`, which Next does not
 * preload, like lazy-motion.tsx) and the plain button is swapped for the same button with the ring
 * canvas inside, same size and position, so the first-load JS and CLS are untouched. Without WebGL the
 * canvas never shows and the button stays plain. The swap lives in metal-button-fx.tsx.
 */
import { useEffect, useState, type ComponentType } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Ring overrides for MetalButtonFx. Omitted fields keep its defaults (2px ring, 14px radius, halo on). */
export type MetalOptions = {
  /** Ring thickness, CSS px. */
  ringPx?: number;
  /** Outer corner radius, CSS px (the button's own border-radius should match). */
  radius?: number;
  /** The wandering halo over the ring. Default true. */
  glow?: boolean;
};

export type MetalButtonProps = ButtonProps & { metal?: MetalOptions };

type MetalButtonFxComponent = ComponentType<MetalButtonProps>;

// Kept across mounts so a second MetalButton on the same page swaps in on its first effect.
let loaded: MetalButtonFxComponent | null = null;
let loading: Promise<MetalButtonFxComponent> | null = null;

function loadFx(): Promise<MetalButtonFxComponent> {
  loading ??= import("@/components/ui/metal-button-fx").then((mod) => (loaded = mod.default));
  return loading;
}

export function MetalButton(props: MetalButtonProps) {
  const [Fx, setFx] = useState<MetalButtonFxComponent | null>(() => loaded);

  useEffect(() => {
    if (loaded) return; // already mounted as the wrapped button (state started from `loaded`)
    let cancelled = false;
    const start = () =>
      loadFx().then(
        (Component) => !cancelled && setFx(() => Component),
        () => {}, // chunk failed to load: the plain button stays
      );
    // Safari has no requestIdleCallback.
    const idle = "requestIdleCallback" in window;
    const id = idle ? window.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 200);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  if (Fx) return <Fx {...props} />;
  const button: MetalButtonProps = { ...props };
  delete button.metal; // not a DOM attribute
  return <Button {...(button as ButtonProps)} />;
}
