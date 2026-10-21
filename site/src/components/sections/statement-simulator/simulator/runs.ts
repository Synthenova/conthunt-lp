/**
 * Tabs whose run loads on demand (src/content/simulator/data.ts: only the active tab's run ships
 * with the page).
 *
 * A tab that arrives as a `skeleton` stub and has a run file (`RUN_LOADERS`, generated) loads it on
 * intent: tab hover or focus, a Recents row, or the first hover inside the frame (which also warms
 * the tab's posters). A click on a tab that is still loading waits for it, so a switch never shows
 * a skeleton. Loaded runs live in one module-level store, so the inline simulator, Full Control and
 * the run caption share them.
 */
import { useMemo, useSyncExternalStore } from "react";
import { expandRun } from "@/content/simulator/expand";
import { RUN_LOADERS } from "@/content/simulator/runs";
import type { SimDeepSearch, SimRunData } from "@/content/simulator/types";

const loaded = new Map<string, SimRunData>();
const pending = new Map<string, Promise<boolean>>();
const listeners = new Set<() => void>();
/** One finished search per stub object, so a later load rebuilds nothing. */
const expanded = new WeakMap<SimDeepSearch, SimDeepSearch>();
let version = 0;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const isStub = (s: SimDeepSearch) => !!s.skeleton && s.messages.length === 0 && s.sections.length === 0;

/** True while `search` is a stub whose run file exists but has not loaded yet. */
export function runPending(search: SimDeepSearch | undefined): boolean {
  return !!search && isStub(search) && !!RUN_LOADERS[search.id] && !loaded.has(search.id);
}

/** Loads a tab's run file once. Resolves true when the run is in (or there is none to load). */
export function loadRun(id: string): Promise<boolean> {
  const loader = RUN_LOADERS[id];
  if (!loader || loaded.has(id)) return Promise.resolve(true);
  let p = pending.get(id);
  if (!p) {
    p = loader().then(
      (run) => {
        loaded.set(id, run);
        version += 1;
        for (const listener of listeners) listener();
        return true;
      },
      () => {
        // A failed chunk can be retried by the next intent.
        pending.delete(id);
        return false;
      },
    );
    pending.set(id, p);
  }
  return p;
}

/** `searches` with every loaded run expanded (a stub stays a stub until its run loads). */
export function useRuns(searches: SimDeepSearch[]): SimDeepSearch[] {
  const v = useSyncExternalStore(subscribe, () => version, () => 0);
  return useMemo(() => {
    void v;
    let changed = false;
    const next = searches.map((s) => {
      if (!isStub(s)) return s;
      const run = loaded.get(s.id);
      if (!run) return s;
      let out = expanded.get(s);
      if (!out) {
        out = expandRun(s, run);
        expanded.set(s, out);
      }
      if (out !== s) changed = true;
      return out;
    });
    return changed ? next : searches;
  }, [searches, v]);
}
