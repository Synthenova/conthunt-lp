/**
 * Number and date formatting for the tracking section.
 *
 * Fixed locale and UTC timezone so server and client render identical strings
 * (no hydration mismatch).
 */
import { OBSERVED_ON, SERIES_DAYS } from "./data";

const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthDayYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

/** 1,100,000 -> "1.1M". Same style as the app's compactCount. */
export const compact = (n: number): string => compactFormat.format(Math.round(n));

/** +3.1K */
export const signedCompact = (n: number): string => `${n < 0 ? "-" : "+"}${compactFormat.format(Math.abs(Math.round(n)))}`;

/** +2.0% (one decimal). */
export const signedPct = (n: number): string => `${n < 0 ? "-" : "+"}${Math.abs(n).toFixed(1)}%`;

/** +2% / -1% axis tick. */
export const axisPct = (n: number): string => (n === 0 ? "0%" : `${n < 0 ? "-" : "+"}${Math.abs(n)}%`);

const OBSERVED_MS = Date.parse(`${OBSERVED_ON}T00:00:00Z`);

/** Date of the chart's day `i` (0 = oldest, SERIES_DAYS - 1 = observed day). */
export const dayDate = (i: number, total = SERIES_DAYS): Date =>
  new Date(OBSERVED_MS - (total - 1 - i) * 86_400_000);

export const dayLabel = (i: number, total = SERIES_DAYS): string => monthDay.format(dayDate(i, total));

/** "2025-05-10" -> "May 10, 2025" */
export const postedLabel = (iso: string): string => monthDayYear.format(new Date(`${iso}T00:00:00Z`));

export const observedLabel = monthDayYear.format(new Date(OBSERVED_MS));
