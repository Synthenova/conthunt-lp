import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyticsAllowed,
  createCaptureQueue,
  exceptionMessage,
  heroQuerySource,
  isIntent,
  newlyReached,
  pageExitFlags,
  scrollPercent,
} from "./analytics-model.ts";

describe("capture queue", () => {
  it("flushes waiting events in order, then sends later events immediately", () => {
    const queue = createCaptureQueue();
    queue.push({ name: "a", properties: { n: 1 } });
    queue.push({ name: "b", properties: { n: 2 }, beacon: true });
    const seen: string[] = [];
    const flushed = queue.flush((event) => seen.push(event.name));
    queue.push({ name: "c", properties: {} });
    assert.deepEqual(
      flushed.map((event) => event.name),
      ["a", "b"],
    );
    assert.deepEqual(seen, ["a", "b", "c"]);
    assert.equal(flushed[1]?.beacon, true);
  });
});

describe("host gate", () => {
  it("sends on production conthunt.app and nowhere else, including preview paths", () => {
    assert.equal(analyticsAllowed({ nodeEnv: "production", anywhere: false, hostname: "conthunt.app", pathname: "/" }), true);
    assert.equal(
      analyticsAllowed({ nodeEnv: "production", anywhere: false, hostname: "www.conthunt.app", pathname: "/pricing" }),
      true,
    );
    assert.equal(analyticsAllowed({ nodeEnv: "development", anywhere: true, hostname: "conthunt.app", pathname: "/" }), false);
    assert.equal(analyticsAllowed({ nodeEnv: "production", anywhere: false, hostname: "localhost", pathname: "/" }), false);
    assert.equal(
      analyticsAllowed({ nodeEnv: "production", anywhere: true, hostname: "preview.example", pathname: "/pricing" }),
      true,
    );
    assert.equal(
      analyticsAllowed({ nodeEnv: "production", anywhere: true, hostname: "preview.example", pathname: "/preview/hero" }),
      false,
    );
  });
});

describe("page exit flags", () => {
  it("counts a short shallow visit with no intent as a bounce", () => {
    assert.deepEqual(pageExitFlags({ visibleMs: 4000, maxScroll: 10, hadIntent: false, sectionEngaged: false }), {
      bounce: true,
      engaged: false,
    });
  });

  it("is engaged when scroll, a lower section, or an intent event says so", () => {
    assert.equal(pageExitFlags({ visibleMs: 2000, maxScroll: 50, hadIntent: false, sectionEngaged: false }).engaged, true);
    assert.equal(pageExitFlags({ visibleMs: 2000, maxScroll: 0, hadIntent: false, sectionEngaged: true }).engaged, true);
    assert.equal(pageExitFlags({ visibleMs: 1000, maxScroll: 0, hadIntent: true, sectionEngaged: false }).bounce, false);
  });
});

describe("intent", () => {
  it("includes the named exits and ignores other clicks", () => {
    assert.equal(isIntent("hero_search_submitted", {}), true);
    assert.equal(isIntent("cta_clicked", { destination: "app" }), true);
    assert.equal(isIntent("cta_clicked", { destination: "docs" }), false);
    assert.equal(isIntent("copy_succeeded", { target: "mcp_config" }), true);
    assert.equal(isIntent("copy_succeeded", { target: "article_link" }), false);
    assert.equal(isIntent("viral_outbound_clicked", {}), true);
  });
});

describe("scroll", () => {
  it("reports each milestone once", () => {
    assert.deepEqual(newlyReached(50, new Set()), [25, 50]);
    assert.deepEqual(newlyReached(50, new Set([25])), [50]);
    assert.equal(scrollPercent(0, 800, 800), 100);
    assert.equal(scrollPercent(250, 500, 1500), 25);
  });
});

describe("hero query source", () => {
  it("distinguishes an example, an edit, and typed text", () => {
    assert.equal(heroQuerySource("skincare hooks", "skincare hooks", ""), "example");
    assert.equal(heroQuerySource("skincare hooks for Priya", "skincare hooks", "skincare hooks"), "edited_example");
    assert.equal(heroQuerySource("my own brief", "skincare hooks", ""), "typed");
  });
});

describe("exception messages", () => {
  it("drops a query string or an email and truncates the rest", () => {
    assert.equal(exceptionMessage("failed at /app?q=secret"), null);
    assert.equal(exceptionMessage("mail user@example.com"), null);
    assert.equal(exceptionMessage("x".repeat(250))?.length, 200);
    assert.equal(exceptionMessage("ResizeObserver loop"), "ResizeObserver loop");
  });
});
