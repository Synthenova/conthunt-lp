/**
 * Display formatting for Viral Now. Everything here is deterministic and UTC-based, so
 * the server render and the client hydration always produce the same strings.
 */

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-US");

/** 1677021 becomes "1.7M". Null (unknown) becomes an en dash, never zero. */
export function formatCount(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? compact.format(value) : "–";
}

/** 1677021 becomes "1,677,021". */
export function formatWhole(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? whole.format(value) : "–";
}

/** 0.2764 becomes "27.6%". Values under 10% keep one decimal, larger ones too. */
export function formatPercent(value: number | null | undefined, digits = 1): string {
  return typeof value === "number" && Number.isFinite(value) ? `${(value * 100).toFixed(digits)}%` : "–";
}

const SHORT_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const MONTH_YEAR = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const LONG_DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function toDate(input: string | null | undefined): Date | null {
  if (!input) return null;
  const date = new Date(input.length === 10 ? `${input}T00:00:00Z` : input);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "2026-10-12" or any ISO string becomes "Oct 12". */
export function formatShortDate(input: string | null | undefined): string | null {
  const date = toDate(input);
  return date ? SHORT_DATE.format(date) : null;
}

/**
 * A ranking week's Monday ("2026-10-12") becomes "Week 2 of Oct 2026": the week is counted by the Mondays of
 * its month, so the week of Oct 5 is week 1 and the week of Oct 12 week 2.
 */
export function formatWeekOfMonth(input: string | null | undefined): string | null {
  const date = toDate(input);
  return date ? `Week ${Math.ceil(date.getUTCDate() / 7)} of ${MONTH_YEAR.format(date)}` : null;
}

/** ISO string becomes "Oct 12, 2026". */
export function formatLongDate(input: string | null | undefined): string | null {
  const date = toDate(input);
  return date ? LONG_DATE.format(date) : null;
}

/** ISO string becomes "23:50 UTC". */
export function formatUtcTime(input: string | null | undefined): string | null {
  const date = toDate(input);
  if (!date) return null;
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC`;
}

/** ISO string becomes "Oct 14, 23:50 UTC". */
export function formatUtcStamp(input: string | null | undefined): string | null {
  const date = formatShortDate(input);
  const time = formatUtcTime(input);
  return date && time ? `${date}, ${time}` : (date ?? time);
}

/** 12.4 seconds becomes "0:12". */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return null;
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** 1 becomes "1st", 22 becomes "22nd". */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const suffix = ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th";
  return `${n}${suffix}`;
}

/** Initials for an avatar fallback: "KK" from "KK", "SB" from "sophiebye". */
export function initialsOf(name: string | null | undefined, handle: string | null | undefined): string {
  const source = (name ?? handle ?? "?").replace(/^@/, "").trim();
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase() || "?";
}

/** "@handle" when there is one, else the display name, else a neutral fallback. */
export function creatorLabel(creator: { handle: string | null; name: string | null }): string {
  if (creator.handle) return `@${creator.handle}`;
  return creator.name ?? "Unknown creator";
}
