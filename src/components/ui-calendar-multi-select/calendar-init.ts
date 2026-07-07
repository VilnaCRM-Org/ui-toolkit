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
// while an enabled one exists in view. If the whole month is out of range there is
// no enabled day, so the 1st is kept (that degenerate case is a `visibleMonth`
// concern, handled by `initialMonth`).
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
