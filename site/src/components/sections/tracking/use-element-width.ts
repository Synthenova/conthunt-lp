"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Width of an element in CSS pixels, kept current with a ResizeObserver.
 * Returns `initial` for the server render and the first client render, so the
 * markup matches and hydration is clean.
 */
export function useElementWidth<T extends HTMLElement>(initial = 760) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setWidth(next);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}
