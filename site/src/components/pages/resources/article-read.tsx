"use client";

/**
 * Qualified read: half the article scrolled and 30 seconds of the tab actually visible.
 * One event per article view.
 */
import { useEffect } from "react";
import { capture, setPageContext } from "@/lib/analytics";
import { scrollPercent } from "@/lib/analytics-model";

export function ArticleRead({ slug, category }: { slug: string; category: string }) {
  useEffect(() => {
    setPageContext({ pageType: "article", slug });
    let visible = 0;
    let since = document.visibilityState === "visible" ? performance.now() : 0;
    let sent = false;

    const tick = () => {
      if (document.visibilityState === "hidden") {
        if (since) visible += performance.now() - since;
        since = 0;
      } else if (!since) {
        since = performance.now();
      }
      if (sent) return;
      const soFar = visible + (since ? performance.now() - since : 0);
      const depth = scrollPercent(window.scrollY, window.innerHeight, document.documentElement.scrollHeight);
      if (depth >= 50 && soFar >= 30_000) {
        sent = true;
        capture("article_read", { slug, category, surface: "resources" });
      }
    };

    const id = window.setInterval(tick, 1000);
    window.addEventListener("scroll", tick, { passive: true });
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("scroll", tick);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [slug, category]);

  return null;
}
