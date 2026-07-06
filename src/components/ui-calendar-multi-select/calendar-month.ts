import { addDays, mondayIndex, startOfMonth } from './date-utils';

// Month-matrix construction, day comparisons and human labels for the calendar
// grid. Split from `date-utils.ts` to stay within the per-file module budget.

/** Monday-first weekday order — the toolkit's locale starts the week on Monday. */
export const WEEKDAYS_SHORT: readonly string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAYS_LONG: readonly string[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
export const MONTHS_LONG: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** A single day slot in the month matrix. */
export interface CalendarCell {
  date: Date;
  inCurrentMonth: boolean;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

const WEEKS_IN_GRID: number = 6;
const DAYS_IN_WEEK: number = 7;

/**
 * Builds a fixed 6×7 matrix of days for the month containing `anchor`. Leading
 * and trailing slots are filled with the adjacent months' days (flagged
 * `inCurrentMonth: false`) so arrow-key navigation can cross month boundaries.
 * The height is always six weeks so the grid never reflows between months.
 */
export function buildMonthMatrix(anchor: Date): CalendarCell[][] {
  const first: Date = startOfMonth(anchor);
  const gridStart: Date = addDays(first, -mondayIndex(first));
  const weeks: CalendarCell[][] = [];

  for (let week: number = 0; week < WEEKS_IN_GRID; week += 1) {
    const row: CalendarCell[] = [];
    for (let weekday: number = 0; weekday < DAYS_IN_WEEK; weekday += 1) {
      const date: Date = addDays(gridStart, week * DAYS_IN_WEEK + weekday);
      row.push({ date, inCurrentMonth: isSameMonth(date, anchor) });
    }
    weeks.push(row);
  }

  return weeks;
}

/** Accessible name for a day cell, e.g. `15 July 2026`. */
export function formatDayLabel(date: Date): string {
  return `${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

/** Caption for the month header, e.g. `July 2026`. */
export function formatMonthCaption(anchor: Date): string {
  return `${MONTHS_LONG[anchor.getMonth()]} ${anchor.getFullYear()}`;
}
