/**
 * PostHog for the static pages: /blog, /docs, /privacy, /terms.
 * The Next site uses site/src/lib/analytics.ts. Event names match that module.
 *
 * The page sets window.CONTHUNT_ANALYTICS = { pageType, slug, category } before this file.
 * pageType is blog_post, blog_index, docs, or legal.
 */
(function () {
  var KEY = "phc_xYSuTFpO0h1u15WCJBqls5qzDc93YTmY0IXZST6t4J7";
  var CAMPAIGN = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid", "ttclid", "msclkid", "li_fat_id"];
  var APP = "https://agent.conthunt.app";
  var page = window.CONTHUNT_ANALYTICS || { pageType: "blog_index" };
  var queue = [];
  var client = null;
  var hadIntent = false;
  var maxScroll = 0;
  var visibleMs = 0;
  var visibleAt = 0;
  var exitSent = false;
  var readSent = false;
  var scrollSent = {};

  function allowed() {
    var host = location.hostname;
    if (location.pathname.indexOf("/preview") === 0) return false;
    return host === "conthunt.app" || host.slice(-13) === ".conthunt.app";
  }

  function campaignFrom(search) {
    var params = new URLSearchParams(search || "");
    var out = {};
    for (var i = 0; i < CAMPAIGN.length; i++) {
      var value = params.get(CAMPAIGN[i]);
      if (value) out[CAMPAIGN[i]] = value;
    }
    return out;
  }

  function hasCampaign(obj) {
    for (var i = 0; i < CAMPAIGN.length; i++) if (obj[CAMPAIGN[i]]) return true;
    return false;
  }

  function readLast() {
    try {
      return campaignFrom(sessionStorage.getItem("ch_utm") || "");
    } catch (error) {
      return {};
    }
  }

  function remember() {
    var incoming = campaignFrom(location.search);
    var last = readLast();
    if (hasCampaign(incoming)) {
      for (var i = 0; i < CAMPAIGN.length; i++) if (incoming[CAMPAIGN[i]]) last[CAMPAIGN[i]] = incoming[CAMPAIGN[i]];
      try {
        sessionStorage.setItem("ch_utm", new URLSearchParams(last).toString());
      } catch (error) {}
      if (document.cookie.indexOf("ch_ft=") === -1) {
        var secure = location.protocol === "https:" ? "; Secure" : "";
        document.cookie =
          "ch_ft=" +
          encodeURIComponent(new URLSearchParams(incoming).toString()) +
          "; Max-Age=7776000; Path=/; Domain=.conthunt.app; SameSite=Lax" +
          secure;
      }
    }
    return last;
  }

  function isIntent(name, props) {
    if (name === "viral_outbound_clicked" || name === "hero_search_submitted") return true;
    if (name === "cta_clicked" && (props.destination === "app" || props.destination === "login")) return true;
    if (name === "copy_succeeded" && String(props.target || "").indexOf("mcp") === 0) return true;
    return false;
  }

  function deliver(event) {
    if (!client) {
      queue.push(event);
      return;
    }
    client.capture(event.name, event.properties, event.beacon ? { transport: "sendBeacon", send_instantly: true } : undefined);
  }

  function capture(name, properties, beacon) {
    if (!allowed()) return;
    if (isIntent(name, properties || {})) hadIntent = true;
    deliver({ name: name, properties: properties || {}, beacon: !!beacon });
  }

  function init(posthog) {
    var touch = remember();
    posthog.init(KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      person_profiles: "always",
      cross_subdomain_cookie: true,
      capture_pageview: true,
      capture_pageleave: true,
      capture_performance: { web_vitals: true, network_timing: false },
      autocapture: false,
      rageclick: false,
      disable_session_recording: true,
      capture_exceptions: false,
      loaded: function (ph) {
        client = ph;
        ph.register(Object.assign({ site_area: "legacy", page_type: page.pageType }, touch));
        var waiting = queue.splice(0, queue.length);
        for (var i = 0; i < waiting.length; i++) {
          ph.capture(
            waiting[i].name,
            waiting[i].properties,
            waiting[i].beacon ? { transport: "sendBeacon", send_instantly: true } : undefined,
          );
        }
      },
    });
  }

  function load() {
    if (!allowed() || document.querySelector('script[src="/ingest/static/array.js"]')) return;
    var script = document.createElement("script");
    script.src = "/ingest/static/array.js";
    script.async = true;
    script.onload = function () {
      if (window.posthog) init(window.posthog);
    };
    document.head.appendChild(script);
  }

  function scrollPercent() {
    var range = document.documentElement.scrollHeight - window.innerHeight;
    if (range <= 0) return 100;
    return Math.min(100, Math.max(0, (window.scrollY / range) * 100));
  }

  function onScroll() {
    var percent = scrollPercent();
    if (percent > maxScroll) maxScroll = percent;
    var marks = [25, 50, 75, 90, 100];
    for (var i = 0; i < marks.length; i++) {
      if (percent >= marks[i] && !scrollSent[marks[i]]) {
        scrollSent[marks[i]] = true;
        if (page.pageType === "blog_post" || page.pageType === "blog_index") {
          capture("scroll_depth", { depth: marks[i], page_type: page.pageType });
        }
      }
    }
    if (page.pageType === "blog_post" && !readSent && percent >= 50) maybeRead();
  }

  function maybeRead() {
    if (readSent) return;
    var soFar = visibleMs + (visibleAt ? performance.now() - visibleAt : 0);
    if (soFar >= 30000 && scrollPercent() >= 50) {
      readSent = true;
      capture("article_read", {
        slug: page.slug || location.pathname.replace(/^\/blog\/|\/$/g, ""),
        category: page.category || "",
        surface: "blog",
      });
    }
  }

  function sendExit() {
    if (exitSent) return;
    exitSent = true;
    if (visibleAt) visibleMs += performance.now() - visibleAt;
    visibleAt = 0;
    var visible = Math.round(visibleMs);
    var bounce = visible < 10000 && maxScroll < 25 && !hadIntent;
    var engaged = maxScroll >= 50 || hadIntent;
    capture(
      "page_exit",
      {
        visible_ms: visible,
        max_scroll: Math.round(maxScroll),
        bounce: bounce,
        engaged: engaged,
        had_intent: hadIntent,
        page_type: page.pageType,
        site_area: "legacy",
      },
      true,
    );
  }

  function appHref(href) {
    var url = new URL(href, location.origin);
    var touch = readLast();
    for (var i = 0; i < CAMPAIGN.length; i++) {
      if (touch[CAMPAIGN[i]] && !url.searchParams.has(CAMPAIGN[i])) url.searchParams.set(CAMPAIGN[i], touch[CAMPAIGN[i]]);
    }
    var paid = false;
    for (var j = 0; j < CAMPAIGN.length; j++) if (url.searchParams.get(CAMPAIGN[j])) paid = true;
    if (!paid && (page.pageType === "blog_post" || page.pageType === "blog_index" || page.pageType === "docs")) {
      url.searchParams.set("utm_source", page.pageType === "docs" ? "docs" : "blog");
      url.searchParams.set("utm_medium", "cta");
      url.searchParams.set("utm_campaign", page.pageType === "docs" ? location.pathname : page.slug || "index");
    }
    url.searchParams.set("ch_placement", page.pageType === "docs" ? "docs" : "blog");
    return url.toString();
  }

  function appAnchor(event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return null;
    var absolute;
    try {
      absolute = new URL(link.getAttribute("href") || "", location.origin);
    } catch (error) {
      return null;
    }
    if (absolute.origin !== APP) return null;
    if (absolute.pathname !== "/app" && absolute.pathname !== "/login" && absolute.pathname.indexOf("/app/") !== 0) return null;
    return link;
  }

  function onPointerDown(event) {
    var link = appAnchor(event);
    if (link) link.href = appHref(link.href);
  }

  function onClick(event) {
    if (event.type === "click" && event.button !== 0) return;
    if (event.type === "auxclick" && event.button !== 1) return;
    var link = appAnchor(event);
    if (!link) return;
    var next = appHref(link.href);
    link.href = next;
    var destination = new URL(next).pathname.indexOf("/login") === 0 ? "login" : "app";
    var placement = page.pageType === "docs" ? "docs" : "blog";
    var had = false;
    for (var i = 0; i < CAMPAIGN.length; i++) if (new URL(next).searchParams.get(CAMPAIGN[i])) had = true;
    capture("cta_clicked", { placement: placement, destination: destination });
    capture("outbound_app", { placement: placement, destination: destination, had_utm: had }, true);
  }

  function copyTarget(text) {
    var trimmed = (text || "").trim();
    if (trimmed === "https://mcp.conthunt.app") return "mcp_url";
    if (trimmed.charAt(0) === "{") return "mcp_config";
    return "mcp_command";
  }

  function copyClient(button) {
    var panel = button.closest("[data-panel]");
    if (panel && panel.getAttribute("data-panel")) return panel.getAttribute("data-panel");
    var root = button.closest("[data-install]") || document;
    var tab = root.querySelector("[data-tab].is-active");
    if (tab) return tab.getAttribute("data-tab") || "";
    var mode = root.querySelector("[data-install-mode].is-active");
    return mode ? mode.getAttribute("data-install-mode") || "" : "";
  }

  if (!allowed()) return;
  remember();
  visibleAt = document.visibilityState === "visible" ? performance.now() : 0;

  if (hasCampaign(campaignFrom(location.search))) load();
  else {
    var started = false;
    var start = function () {
      if (started) return;
      started = true;
      load();
    };
    ["pointerdown", "keydown", "touchstart", "scroll", "wheel"].forEach(function (type) {
      window.addEventListener(type, start, { passive: true, once: true });
    });
    window.addEventListener("load", function () {
      if (window.requestIdleCallback) requestIdleCallback(start, { timeout: 5000 });
      else setTimeout(start, 5000);
    });
  }

  if (page.pageType !== "legal") {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  if (page.pageType === "blog_post") window.setInterval(maybeRead, 1000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      if (visibleAt) visibleMs += performance.now() - visibleAt;
      visibleAt = 0;
    } else if (!visibleAt) visibleAt = performance.now();
  });
  if (page.pageType !== "legal") {
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
  }
  window.addEventListener("pagehide", sendExit);
  document.addEventListener("ch:docs-copy", function (event) {
    if (page.pageType !== "docs") return;
    var detail = event.detail || {};
    capture("copy_succeeded", { target: copyTarget(detail.text), client: copyClient(detail.button) });
  });
})();
