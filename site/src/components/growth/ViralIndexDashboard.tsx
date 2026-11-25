"use client";
import { useState } from "react";
import type { getViralityIndexSnapshot } from "@/lib/growth/viral-data";
import { Copy, Panel, field, platformNames, type Platform } from "./shared";
type Snapshot = ReturnType<typeof getViralityIndexSnapshot>;
export function ViralIndexDashboard({ snapshot }: { snapshot: Snapshot }) {
  const [platform,setPlatform]=useState<Platform>("tiktok");
  const data=snapshot.platforms.find(p=>p.platform===platform); const videos=snapshot.videos.filter(v=>v.platform===platform);
  const stat = `${platformNames[platform]} Viral Now snapshot median: ${data?.medianViews?.toLocaleString() ?? "unavailable"} views. Powered by ContHunt 2026 Short-Form Index. Snapshot ${snapshot.snapshotDate.slice(0,10)}.`;
  const html = `<a href="https://conthunt.app/viral-now">${stat}</a>`; const markdown = `[${stat}](https://conthunt.app/viral-now)`;
  return <Panel><h2 className="text-xl font-medium">Short-form virality index</h2><p className="text-sm text-muted">Bundled Viral Now breakout snapshot: {snapshot.snapshotDate.slice(0,10)}. This selected sample is not representative of all videos. Platform baseline: 2026 benchmark sampled {snapshot.benchmarkDate.slice(0,10)}.</p><label className="block text-sm">Platform<select className={field} value={platform} onChange={e=>setPlatform(e.target.value as Platform)}>{Object.entries(platformNames).map(([p,n])=><option key={p} value={p}>{n}</option>)}</select></label><p>{stat} Sample: {data?.sampleSize ?? 0}. Largest clip relative to 2026 platform median: {data?.topOutlierMultiple?.toFixed(1) ?? "unavailable"}×.</p><h3 className="font-medium">Niche breakdown · all platforms</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th>Niche</th><th>Clips with views</th><th>Median views</th></tr></thead><tbody>{snapshot.niches.map(n=><tr key={n.slug}><td>{n.name}</td><td>{n.sampleSize}</td><td>{n.medianViews?.toLocaleString() ?? "Unavailable"}</td></tr>)}</tbody></table></div><p>Most frequent hashtag in snapshot titles: {snapshot.topHashtag ?? "unavailable"}. Change over time is unavailable.</p><h3 className="font-medium">Top snapshot clips</h3><ul className="space-y-2">{videos.slice(0,5).map(v=><li key={`${v.platform}:${v.id}`}><a className="underline" href={v.url}>{v.title}</a> · {v.views?.toLocaleString() ?? "Unknown"} views</li>)}</ul><div className="flex flex-wrap gap-2"><Copy text={html} label="Copy HTML badge"/><Copy text={markdown} label="Copy Markdown badge"/></div></Panel>;
}
export default ViralIndexDashboard;
