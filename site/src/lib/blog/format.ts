/** Date helpers. Dates are ISO `YYYY-MM-DD` strings, formatted in UTC so server and client agree. */
const FULL = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const SHORT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);

/** "15 Sep 2026" */
export const formatDate = (iso: string): string => FULL.format(parse(iso));
/** "15 Sep" */
export const formatDateShort = (iso: string): string => SHORT.format(parse(iso));
/** "6 min read" */
export const formatReading = (minutes: number): string => `${minutes} min read`;
