"use client";

/**
 * Named events that are not owned by a single control: CTA clicks, section time, scroll
 * depth, page exit, and client exceptions. Mounted once from the root layout.
 */
import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { appUrl, hadUtm, readLastTouch, rememberAttribution } from "@/lib/attribution";
import {
  capture,
  engagement,
  getPageType,
  internalCampaign,
  markSectionEngaged,
  pageTypeFromPath,
  resetPageEngagement,
  setPageContext,
} from "@/lib/analytics";
import { exceptionMessage, newlyReached, pageExitFlags, scrollPercent } from "@/lib/analytics-model";

function closestPlacement(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest("[data-ph-placement]");
  return el instanceof HTMLElement ? el : null;
}

function rewriteAppHref(el: HTMLElement): string | null {
  if (!(el instanceof HTMLAnchorElement)) return null;
  const destination = el.dataset.phDestination;
  if (destination !== "app" && destination !== "login") return null;
  const href = el.getAttribute("href");
  const placement = el.dataset.phPlacement;
  if (!href || !placement) return null;
  const next = appUrl(href, {
    placement,
    plan: el.dataset.phPlan,
    billing: el.dataset.phBilling,
    attribution: readLastTouch(),
    internal: internalCampaign(),
  });
  if (el.href !== next) el.href = next;
  return next;
}

export function AnalyticsProvider() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    rememberAttribution(window.location.search);
    setPageContext({ pageType: pageTypeFromPath(pathname || "/"), slug: "" });
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const el = closestPlacement(event.target);
      if (el) rewriteAppHref(el);
    };
    const onClick = (event: MouseEvent) => {
      if (event.type === "click" && event.button !== 0) return;
      if (event.type === "auxclick" && event.button !== 1) return;
      const el = closestPlacement(event.target);
      if (!el) return;
      const placement = el.dataset.phPlacement;
      const destination = el.dataset.phDestination;
      if (!placement || !destination) return;
      const href = rewriteAppHref(el);
      const properties: Record<string, unknown> = { placement, destination };
      if (el.dataset.phPlan) properties.plan = el.dataset.phPlan;
      if (el.dataset.phBilling) properties.billing = el.dataset.phBilling;
      capture("cta_clicked", properties);
      if (destination === "app" || destination === "login") {
        capture("outbound_app", { ...properties, had_utm: href ? hadUtm(href) : false }, true);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const message = exceptionMessage(event.message || "");
      capture("client_exception", message === null ? { path: location.pathname } : { message, path: location.pathname });
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const raw = event.reason instanceof Error ? event.reason.message : String(event.reason ?? "");
      const message = exceptionMessage(raw);
      capture("client_exception", message === null ? { path: location.pathname } : { message, path: location.pathname });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  useEffect(() => {
    resetPageEngagement();
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const visibleSince = new Map<string, number>();
    const viewed = new Set<string>();
    const engageTimers = new Map<string, number>();
    const sentScroll = new Set<number>();
    let maxScroll = 0;
    let visibleMs = 0;
    let visibleAt = document.visibilityState === "visible" ? performance.now() : 0;
    let exitSent = false;

    const leaveSection = (section: string) => {
      const start = visibleSince.get(section);
      visibleSince.delete(section);
      const timer = engageTimers.get(section);
      if (timer !== undefined) window.clearTimeout(timer);
      engageTimers.delete(section);
      if (start === undefined) return;
      const ms = Math.round(performance.now() - start);
      if (ms < 1000) return;
      capture("section_dwell", { section, visible_ms: ms, page_type: getPageType() });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = (entry.target as HTMLElement).dataset.section;
          if (!section) continue;
          const showing = entry.isIntersecting && entry.intersectionRatio >= 0.5;
          if (showing) {
            if (!viewed.has(section)) {
              viewed.add(section);
              capture("section_viewed", {
                section,
                page_type: getPageType(),
                index: nodes.indexOf(entry.target as HTMLElement),
              });
            }
            if (!visibleSince.has(section)) {
              visibleSince.set(section, performance.now());
              if (section !== "hero") {
                engageTimers.set(
                  section,
                  window.setTimeout(() => markSectionEngaged(), 5000),
                );
              }
            }
          } else if (visibleSince.has(section)) {
            leaveSection(section);
          }
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    for (const node of nodes) observer.observe(node);

    const onScroll = () => {
      const percent = scrollPercent(window.scrollY, window.innerHeight, document.documentElement.scrollHeight);
      maxScroll = Math.max(maxScroll, percent);
      for (const depth of newlyReached(percent, sentScroll)) {
        sentScroll.add(depth);
        capture("scroll_depth", { depth, page_type: getPageType() });
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (visibleAt) visibleMs += performance.now() - visibleAt;
        visibleAt = 0;
      } else if (!visibleAt) {
        visibleAt = performance.now();
      }
    };

    const sendExit = () => {
      if (exitSent) return;
      exitSent = true;
      onVisibility();
      if (document.visibilityState === "visible" && visibleAt) visibleMs += performance.now() - visibleAt;
      visibleAt = 0;
      for (const section of [...visibleSince.keys()]) leaveSection(section);
      const flags = engagement();
      const visible = Math.round(visibleMs);
      const rates = pageExitFlags({
        visibleMs: visible,
        maxScroll,
        hadIntent: flags.hadIntent,
        sectionEngaged: flags.sectionEngaged,
      });
      capture(
        "page_exit",
        {
          visible_ms: visible,
          max_scroll: Math.round(maxScroll),
          bounce: rates.bounce,
          engaged: rates.engaged,
          had_intent: flags.hadIntent,
          page_type: getPageType(),
          site_area: "marketing",
        },
        true,
      );
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", sendExit);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", sendExit);
      for (const timer of engageTimers.values()) window.clearTimeout(timer);
      sendExit();
    };
  }, [pathname]);

  return null;
}
