/** Calendar helpers for the planning screen. Dates are `YYYY-MM-DD` strings in the maqraa's base timezone. */

export const BASE_TZ = 'Africa/Tunis';

const DAY_MS = 86_400_000;
const toMs = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
const toIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const addDays = (iso: string, days: number): string => toIso(toMs(iso) + days * DAY_MS);

/** Monday = 0 … Sunday = 6, as in the backend (Python's `date.weekday()`). */
export const weekdayOf = (iso: string): number => (new Date(toMs(iso)).getUTCDay() + 6) % 7;

/** Calendar date of an instant in the given timezone. */
export function dateInZone(instant: Date | string, timeZone = BASE_TZ): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(instant)
  );
}

export interface Week {
  from: string;
  to: string;
  days: string[];
}

/** The Monday-to-Sunday week containing `iso`. */
export function weekOf(iso: string): Week {
  const from = addDays(iso, -weekdayOf(iso));
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  return { from, to: days[6], days };
}

/** Buckets items by their local start date, in chronological order. Items outside `days` are dropped. */
export function groupByDay<T extends { start_utc: string }>(items: T[], days: string[], timeZone = BASE_TZ): Map<string, T[]> {
  const out = new Map<string, T[]>(days.map((d) => [d, []]));
  const sorted = [...items].sort((a, b) => Date.parse(a.start_utc) - Date.parse(b.start_utc));
  for (const item of sorted) out.get(dateInZone(item.start_utc, timeZone))?.push(item);
  return out;
}
