// Timezone-safe, dependency-free date arithmetic for the calendar. Dates are
// exchanged with consumers as ISO `YYYY-MM-DD` strings and represented
// internally as *local-midnight* `Date` objects. Parsing splits the string
// rather than using `new Date(iso)` (which parses as UTC and shifts the day in
// negative-offset zones), so a `YYYY-MM-DD` round-trips to the same calendar day
// in every timezone. Month-matrix, comparison and label helpers live in
// `calendar-month.ts` to keep this file within the module-size budget.

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Formats a local-midnight `Date` as `YYYY-MM-DD`. */
export function formatISO(date: Date): string {
  const year: string = String(date.getFullYear()).padStart(4, '0');
  return `${year}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** `true` for a well-formed `YYYY-MM-DD` string that names a real calendar day. */
export function isValidISO(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day]: number[] = value.split('-').map(Number);
  const date: Date = new Date(year, month - 1, day);
  // Round-tripping catches overflow (e.g. `2026-02-30` rolls into March).
  return formatISO(date) === value;
}

/** Parses a `YYYY-MM-DD` string to a local-midnight `Date`. */
export function parseISO(value: string): Date {
  const [year, month, day]: number[] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Adds `amount` months, anchoring to the first of the resulting month. */
export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Number of days in the given 0-based month of the given year. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Adds `amount` months while keeping the day-of-month, clamping to the target
 * month's length (e.g. Jan 31 + 1 month → Feb 28). Used by PageUp/PageDown
 * month navigation so focus lands on a real day.
 */
export function addMonthsKeepDay(date: Date, amount: number): Date {
  const anchor: Date = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  const clampedDay: number = Math.min(
    date.getDate(),
    daysInMonth(anchor.getFullYear(), anchor.getMonth())
  );
  return new Date(anchor.getFullYear(), anchor.getMonth(), clampedDay);
}

/** 0-based weekday with Monday as 0 … Sunday as 6. */
export function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}
