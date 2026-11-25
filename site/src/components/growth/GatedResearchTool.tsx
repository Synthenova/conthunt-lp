"use client";
import { useState } from "react";
import { Panel, field, link } from "./shared";
export type ResearchToolKind = "hook-extractor" | "reels-breakdown" | "shorts-outlier";
function videoId(input: string, kind: ResearchToolKind): string | null {
  try {
    const u = new URL(input); if (!['https:', 'http:'].includes(u.protocol)) return null;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (kind === "hook-extractor" && ["tiktok.com", "m.tiktok.com"].includes(host)) return u.pathname.match(/^\/@[\w.-]+\/video\/(\d+)\/?$/)?.[1] ?? null;
    if (kind === "reels-breakdown" && ["instagram.com", "m.instagram.com"].includes(host)) return u.pathname.match(/^\/reels?\/([\w-]+)\/?$/)?.[1] ?? null;
    if (kind === "shorts-outlier" && ["youtube.com", "m.youtube.com"].includes(host)) return u.pathname.match(/^\/shorts\/([\w-]{11})\/?$/)?.[1] ?? null;
    return null;
  } catch { return null; }
}
export function GatedResearchTool({ kind }: { kind: ResearchToolKind }) {
  const [url,setUrl]=useState(""); const id=videoId(url,kind);
  const labels: Record<ResearchToolKind,string> = {"hook-extractor":"TikTok hook extractor","reels-breakdown":"Reels breakdown","shorts-outlier":"Shorts outlier research"};
  return <Panel><h2 className="text-xl font-medium">{labels[kind]}</h2><label className="block text-sm">Public video URL<input type="url" className={field} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://" /></label>{url && !id && <p>Enter a direct {kind === "hook-extractor" ? "TikTok video" : kind === "reels-breakdown" ? "Instagram Reel" : "YouTube Shorts"} URL. Short links are not supported.</p>}{id && <div><p>Video ID: {id}</p><p className="mt-3 font-medium">Sample output structure — not analysis of this video</p><dl className="text-sm text-ink-2"><dt>Opening hook</dt><dd>Example: opening line and visual.</dd><dt>Breakdown</dt><dd>Example: sequence, pacing and observations.</dd><dt>Export</dt><dd>Example: structured notes for your research.</dd></dl><a className={link} href={`https://agent.conthunt.app/?utm_source=conthunt_tool&utm_medium=gated_tool&utm_campaign=${kind}`}>Sign up free to research in ContHunt</a></div>}</Panel>;
}
export default GatedResearchTool;
