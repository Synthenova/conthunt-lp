"use client";
import type { ReactNode } from "react";

export const card = "space-y-4 rounded-btn border border-hairline bg-paper p-5 text-ink";
export const field = "w-full rounded-btn border border-hairline bg-surface px-3 py-2 text-ink";
export const button = "inline-block rounded-btn border border-hairline bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50";
export const link = "inline-block text-sm font-medium underline underline-offset-4";
export type Platform = "tiktok" | "instagram" | "youtube";
export const platformNames: Record<Platform, string> = { tiktok: "TikTok", instagram: "Instagram Reels", youtube: "YouTube Shorts" };
export function PlatformSelect({ value, onChange }: { value: Platform; onChange: (v: Platform) => void }) {
  return <label className="block text-sm">Platform<select className={field} value={value} onChange={e => onChange(e.target.value as Platform)}>{Object.entries(platformNames).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>;
}
export function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="block text-sm">{label}<input className={field} type="number" min="0" step="any" value={value} onChange={e => onChange(e.target.value)} /></label>;
}
export function Panel({ children }: { children: ReactNode }) { return <section className={card}>{children}</section>; }
export function Copy({ text, label = "Copy" }: { text: string; label?: string }) {
  return <button className={button} type="button" onClick={() => { void navigator.clipboard.writeText(text); }}>{label}</button>;
}
export function positive(value: string) { const n = Number(value); return value.trim() && Number.isFinite(n) && n > 0 ? n : 0; }
