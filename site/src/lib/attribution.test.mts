import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appUrl, destinationForHref, hadUtm, mergeLastTouch, parseCampaign } from "./attribution.ts";

const BASE = "https://agent.conthunt.app/app";

describe("appUrl", () => {
  it("appends last-touch parameters and keeps q", () => {
    const href = appUrl(BASE, {
      placement: "hero_submit",
      query: "skincare hooks for Priya",
      attribution: { utm_source: "google", utm_campaign: "spring", gclid: "abc" },
    });
    const url = new URL(href);
    assert.equal(url.searchParams.get("q"), "skincare hooks for Priya");
    assert.equal(url.searchParams.get("utm_source"), "google");
    assert.equal(url.searchParams.get("utm_campaign"), "spring");
    assert.equal(url.searchParams.get("gclid"), "abc");
    assert.equal(url.searchParams.get("ch_placement"), "hero_submit");
    assert.equal(hadUtm(href), true);
  });

  it("adds plan and billing without dropping q", () => {
    const href = appUrl(`${BASE}?q=kept`, {
      placement: "pricing_page",
      plan: "pro",
      billing: "yearly",
      attribution: { utm_source: "newsletter" },
    });
    const url = new URL(href);
    assert.equal(url.searchParams.get("q"), "kept");
    assert.equal(url.searchParams.get("plan"), "pro");
    assert.equal(url.searchParams.get("billing"), "yearly");
    assert.equal(url.searchParams.get("utm_source"), "newsletter");
  });

  it("leaves an incoming campaign as-is and only then adds an internal one", () => {
    const paid = appUrl(BASE, {
      placement: "article_cta",
      attribution: { utm_source: "google", utm_medium: "cpc" },
      internal: { source: "resources", campaign: "hooks" },
    });
    assert.equal(new URL(paid).searchParams.get("utm_source"), "google");
    assert.equal(new URL(paid).searchParams.get("utm_medium"), "cpc");

    const organic = appUrl(BASE, {
      placement: "article_cta",
      internal: { source: "resources", campaign: "hooks" },
    });
    const url = new URL(organic);
    assert.equal(url.searchParams.get("utm_source"), "resources");
    assert.equal(url.searchParams.get("utm_medium"), "cta");
    assert.equal(url.searchParams.get("utm_campaign"), "hooks");
  });

  it("does not put the query on a non-submit link", () => {
    const href = appUrl(BASE, { placement: "nav", attribution: { utm_source: "x" } });
    assert.equal(new URL(href).searchParams.get("q"), null);
  });
});

describe("last touch", () => {
  it("keeps stored parameters when the next URL has none", () => {
    assert.deepEqual(mergeLastTouch({ utm_source: "google" }, {}), { utm_source: "google" });
    assert.deepEqual(mergeLastTouch({ utm_source: "google" }, parseCampaign("?utm_source=newsletter&utm_medium=email")), {
      utm_source: "newsletter",
      utm_medium: "email",
    });
  });
});

describe("destinations", () => {
  it("names the app, login, docs and on-site pages", () => {
    assert.equal(destinationForHref("https://agent.conthunt.app/app"), "app");
    assert.equal(destinationForHref("https://agent.conthunt.app/login"), "login");
    assert.equal(destinationForHref("https://conthunt.app/docs/integrations/mcp"), "mcp_docs");
    assert.equal(destinationForHref("https://conthunt.app/docs"), "docs");
    assert.equal(destinationForHref("/pricing"), "pricing");
    assert.equal(destinationForHref("/resources"), "resources");
    assert.equal(destinationForHref("/resources/hooks"), "article");
    assert.equal(destinationForHref("mailto:support@conthunt.app"), "mailto");
    assert.equal(destinationForHref("/blog"), null);
  });
});
