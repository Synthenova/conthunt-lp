"use client";
import { useState } from "react";
import benchmarks from "@/lib/growth/benchmark-2026.json";
import { Copy, NumberField, Panel, PlatformSelect, link, platformNames, positive, type Platform } from "./shared";

const niches = { all: "All", "beauty-skincare": "Beauty & Skincare", "ecommerce-product-finds": "Ecommerce & Product Finds", "fitness-wellness": "Fitness & Wellness", "tech-ai-tools": "Tech & AI Tools", "food-recipes": "Food & Recipes" };
type Niche = keyof typeof niches;
export function BenchmarkPercentileWidget() {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [niche, setNiche] = useState<Niche>("all");
  const [views, setViews] = useState(""); const [likes, setLikes] = useState(""); const [comments, setComments] = useState("");
  const data = niche === "all" ? benchmarks.by_platform[platform] : benchmarks.by_niche_platform[niche][platform];
  const pct = data.like_to_view_pct; const v = positive(views); const l = Number(likes); const valid = v > 0 && likes.trim() !== "" && Number.isFinite(l) && l >= 0;
  const rate = valid ? l / v * 100 : null;
  const tier = rate == null ? "" : rate < pct.p25 ? "Below p25" : rate < pct.median ? "p25–p50" : rate < pct.p75 ? "p50–p75" : rate <= pct.p90 ? "p75–p90" : "Above p90 for like-to-view rate";
  const text = rate == null ? "" : `${platformNames[platform]} · ${niches[niche]} · like-to-view ${rate.toFixed(2)}% · ${tier} · ContHunt 2026 sample (n=${data.n}).`;
  return <Panel><h2 className="text-xl font-medium">Compare like-to-view rate</h2><PlatformSelect value={platform} onChange={setPlatform}/><label className="block text-sm">Niche<select className="w-full rounded-btn border border-hairline bg-surface px-3 py-2" value={niche} onChange={e => setNiche(e.target.value as Niche)}>{Object.entries(niches).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></label><NumberField label="Views" value={views} onChange={setViews}/><NumberField label="Likes" value={likes} onChange={setLikes}/><NumberField label="Comments (optional)" value={comments} onChange={setComments}/>{rate != null && <div aria-live="polite"><p>{text}</p>{comments.trim() !== "" && Number(comments) >= 0 && <p>Comment-to-view: {(Number(comments)/v*100).toFixed(2)}% (not included in tier).</p>}<Copy text={text} label="Copy benchmark summary"/></div>}<p className="text-sm text-muted">Like-to-view percentiles from the 2026 sample, not a prediction of virality. Sample n={data.n}; extracted {benchmarks.extracted_at_utc.slice(0,10)}.</p><a className={link} href="https://agent.conthunt.app/">Research videos in ContHunt</a></Panel>;
}
export default BenchmarkPercentileWidget;
