import { addDays, daysInMonth, mondayIndex, startOfMonth } from './date-utils';

// Month-matrix construction, day comparisons and human labels for the calendar
// grid. Split from `date-utils.ts` to stay within the per-file module budget.
// Month/weekday names come from `Intl` so the calendar localises with its
// `locale` prop; the default `en-US` reproduces the toolkit's English labels.

/** The default calendar locale — reproduces the English labels tests assert. */
export const DEFAULT_LOCALE: string = 'en-US';

// 2024-01-01 is a Monday, so offsetting it 0..6 gives Monday-first weekday names.
const REFERENCE_MONDAY: Date = new Date(2024, 0, 1);

function weekdayName(index: number, locale: string, style: 'short' | 'long'): string {
  return new Intl.DateTimeFormat(locale, { weekday: style }).format(
    addDays(REFERENCE_MONDAY, index)
  );
}

/** Monday-first short weekday labels (e.g. `Mon`…`Sun`) for `locale`, capitalised —
 * `Intl` yields lowercase in some locales (uk `пн`), Figma shows them title-cased. */
export function weekdaysShort(locale: string): string[] {
  return Array.from({ length: 7 }, (_unused, index) => {
    const name: string = weekdayName(index, locale, 'short');
    return name.charAt(0).toUpperCase() + name.slice(1);
  });
}

/** Monday-first full weekday names (e.g. `Monday`…`Sunday`) for `locale`. */
export function weekdaysLong(locale: string): string[] {
  return Array.from({ length: 7 }, (_unused, index) => weekdayName(index, locale, 'long'));
}

function monthName(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
}

/** A single day slot in the month matrix. */
export interface CalendarCell {
  date: Date;
  inCurrentMonth: boolean;
}

/** One week row of the month matrix. */
export interface CalendarWeek {
  /** Local-midnight date of the row's first (Monday) slot — the row's identity. */
  start: Date;
  cells: CalendarCell[];
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

const DAYS_IN_WEEK: number = 7;

/**
 * Builds a 7-column matrix for the month containing `anchor`. Leading and trailing
 * slots hold the adjacent months' days (flagged `inCurrentMonth: false`) so the
 * previous month bleeds into the top row and the next month into the bottom (Figma),
 * and arrow-key navigation can cross month boundaries. The row count is exactly the
 * weeks the month spans — `ceil((leading offset + month length) / 7)`, i.e. 4–6 —
 * so no fully-next-month week is ever appended. Each week carries its own start
 * date, so callers get a row identity without having to reach into the row's cells.
 */
export function buildMonthMatrix(anchor: Date): CalendarWeek[] {
  const first: Date = startOfMonth(anchor);
  const gridStart: Date = addDays(first, -mondayIndex(first));
  const span: number = mondayIndex(first) + daysInMonth(anchor.getFullYear(), anchor.getMonth());
  const weekCount: number = Math.ceil(span / DAYS_IN_WEEK);
  return Array.from({ length: weekCount }, (_unusedWeek, week) => {
    const start: Date = addDays(gridStart, week * DAYS_IN_WEEK);
    return {
      start,
      cells: Array.from({ length: DAYS_IN_WEEK }, (_unusedDay, weekday) => {
        const date: Date = addDays(start, weekday);
        return { date, inCurrentMonth: isSameMonth(date, anchor) };
      }),
    };
  });
}

/** Accessible name for a day cell, e.g. `15 July 2026` (day-first, localised month). */
export function formatDayLabel(date: Date, locale: string): string {
  // Day-context month form (genitive in inflected locales, e.g. uk "6 липня"),
  // built branchlessly so the 100% gate has no unreachable fallback: filter→join
  // yields the month part's value, or '' in the (never-hit) no-part case.
  const month: string = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' })
    .formatToParts(date)
    .filter(part => part.type === 'month')
    .map(part => part.value)
    .join('');
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}

/** Caption for the month header, e.g. `July 2026`. The month is capitalised —
 * `Intl` yields lowercase names in some locales (uk `вересень`), Figma shows them
 * title-cased (`Вересень`). */
export function formatMonthCaption(anchor: Date, locale: string): string {
  const name: string = monthName(anchor, locale);
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${anchor.getFullYear()}`;
}
