import { isSameMonth } from './calendar-month';
import { formatISO, isValidISO, parseISO, startOfMonth } from './date-utils';

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

/** Roving-focus seed: earliest selected day in view → today (if in view) → the 1st. */
export function initialFocus(visibleMonth: Date, selectedSorted: string[], today: Date): string {
  const inMonth: string | undefined = selectedSorted.find(iso =>
    isSameMonth(parseISO(iso), visibleMonth)
  );
  if (inMonth != null) {
    return inMonth;
  }
  if (isSameMonth(today, visibleMonth)) {
    return formatISO(today);
  }
  return formatISO(visibleMonth);
}
