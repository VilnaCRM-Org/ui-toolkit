import { isSameMonth } from './calendar-month';
import { daysInMonth, formatISO, isValidISO, parseISO, startOfMonth } from './date-utils';

// Pure helpers that seed the calendar's uncontrolled state on first render.

/** Keeps a `YYYY-MM-DD` bound only when it is a real date, else drops it. */
export function toBoundISO(value: string | undefined): string | undefined {
  return value != null && isValidISO(value) ? value : undefined;
}

/** Month shown first: `defaultMonth` → first selected day → today. */
export function initialMonth(
  defaultMonth: string | undefined,
  firstSelected: string | undefined,
  today: Date
): Date {
  if (defaultMonth != null && isValidISO(defaultMonth)) {
    return startOfMonth(parseISO(defaultMonth));
  }
  if (firstSelected != null) {
    return startOfMonth(parseISO(firstSelected));
  }
  return startOfMonth(today);
}

/** `true` when `iso` sits within the optional [min, max] bounds (ISO compares chronologically). */
function inRange(iso: string, minISO?: string, maxISO?: string): boolean {
  return (minISO == null || iso >= minISO) && (maxISO == null || iso <= maxISO);
}

// First *selectable* day of the visible month: its 1st, nudged up to `minISO` when
// that bound falls mid-month, so the roving seed never lands on a disabled day
// while an enabled one exists in view. The initial visible month is clamped into
// range by `clampMonthToRange`, so a fully-disabled month only arises when the user
// navigates to one; there the 1st is kept as the (inert) roving target.
function firstFocusableISO(visibleMonth: Date, minISO?: string, maxISO?: string): string {
  const year: number = visibleMonth.getFullYear();
  const month: number = visibleMonth.getMonth();
  const firstISO: string = formatISO(new Date(year, month, 1));
  const lastISO: string = formatISO(new Date(year, month, daysInMonth(year, month)));
  const candidate: string = minISO != null && minISO > firstISO ? minISO : firstISO;
  return inRange(candidate, minISO, maxISO) && candidate <= lastISO ? candidate : firstISO;
}

export interface FocusSeed {
  visibleMonth: Date;
  selectedSorted: string[];
  today: Date;
  minISO?: string;
  maxISO?: string;
}

/**
 * Roving-focus seed: earliest selected day in view → today (if in view & enabled)
 * → the first selectable day of the visible month.
 */
export function initialFocus(seed: FocusSeed): string {
  const { visibleMonth, selectedSorted, today, minISO, maxISO } = seed;
  const inMonth: string | undefined = selectedSorted.find(iso =>
    isSameMonth(parseISO(iso), visibleMonth)
  );
  if (inMonth != null) {
    return inMonth;
  }
  const todayISO: string = formatISO(today);
  if (isSameMonth(today, visibleMonth) && inRange(todayISO, minISO, maxISO)) {
    return todayISO;
  }
  return firstFocusableISO(visibleMonth, minISO, maxISO);
}

/** Clamps a month into [min, max] so the initial view opens on a month that
 *  actually contains selectable days (min/max may exclude the base month). */
export function clampMonthToRange(month: Date, minISO?: string, maxISO?: string): Date {
  const monthISO: string = formatISO(startOfMonth(month));
  if (minISO != null && monthISO < formatISO(startOfMonth(parseISO(minISO)))) {
    return startOfMonth(parseISO(minISO));
  }
  if (maxISO != null && monthISO > formatISO(startOfMonth(parseISO(maxISO)))) {
    return startOfMonth(parseISO(maxISO));
  }
  return month;
}

export interface CalendarSeed {
  defaultMonth?: string;
  selectedSorted: string[];
  today: Date;
  minISO?: string;
  maxISO?: string;
}

/** Initial (uncontrolled) visible month + roving-focus day, both clamped into [min, max]. */
export function initialCalendarState(seed: CalendarSeed): {
  visibleMonth: Date;
  focusedISO: string;
} {
  const visibleMonth: Date = clampMonthToRange(
    initialMonth(seed.defaultMonth, seed.selectedSorted[0], seed.today),
    seed.minISO,
    seed.maxISO
  );
  const focusedISO: string = initialFocus({
    visibleMonth,
    selectedSorted: seed.selectedSorted,
    today: seed.today,
    minISO: seed.minISO,
    maxISO: seed.maxISO,
  });
  return { visibleMonth, focusedISO };
}
