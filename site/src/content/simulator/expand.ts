/**
 * Turns a run file (`SimRunData`, ./runs/<slug>.json) into the finished `SimDeepSearch` the
 * simulator renders: the tab's static copy from `data.ts`, the user's prompt as the first bubble,
 * then the run. Each card becomes one shared `SimVideoCard` (a video in two rails is the same
 * object) and its checks get their research question's name back. Pure, so the server (the active
 * tab) and the client (tabs loaded on demand, ../../components/sections/statement-simulator/simulator/runs.ts)
 * share it.
 */
import type { SimDeepSearch, SimRunData, SimVideoAnalysis, SimVideoCard } from "./types";

export function expandRun(base: SimDeepSearch, run: SimRunData): SimDeepSearch {
  const parameters = run.rubrics.map((r) => r.parameter);
  const cards = new Map<string, SimVideoCard>();
  const card = (id: string): SimVideoCard | null => {
    const hit = cards.get(id);
    if (hit) return hit;
    const raw = run.cards[id];
    if (!raw) return null;
    const { analysis, ...rest } = raw;
    const out: SimVideoCard = rest;
    if (analysis) {
      const checks: SimVideoAnalysis["checks"] = [];
      analysis.checks.forEach((pair, i) => {
        if (pair && parameters[i]) checks.push({ parameter: parameters[i], status: pair[0], probability: pair[1] });
      });
      out.analysis = { summary: analysis.summary, ...(analysis.hook ? { hook: analysis.hook } : {}), checks };
    }
    cards.set(id, out);
    return out;
  };

  return {
    ...base,
    approved_budget: run.approved_budget,
    messages: [{ kind: "user", id: "m1", text: base.prompt }, ...run.messages],
    sections: run.sections.map((s) => ({ ...s, videos: s.videos.map((v) => ({ ...v, card: card(v.card) })) })),
    rubrics: run.rubrics.map((r) => ({ ...r, videos: r.videos.map((v) => ({ ...v, card: card(v.card) })) })),
    skeleton: false,
  };
}
