import { addDays, addMonthsKeepDay, mondayIndex } from './date-utils';

// Maps a keyboard event to the next focused day for the roving-tabindex grid,
// following the WAI-ARIA APG grid / date-picker keyboard model. Pure and
// timezone-safe: given a focused day and a key, it returns the day focus should
// move to, or `null` when the key is not a navigation key.

const DAYS_IN_WEEK: number = 7;

/** Keys that toggle the focused day's selection. */
export const SELECT_KEYS: ReadonlySet<string> = new Set([' ', 'Enter', 'Spacebar']);

/** Whole-day / whole-week arrow steps as day deltas. */
const DAY_DELTAS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -DAYS_IN_WEEK,
  ArrowDown: DAYS_IN_WEEK,
};

function weekEdgeDate(key: string, focused: Date): Date | null {
  if (key === 'Home') {
    return addDays(focused, -mondayIndex(focused));
  }
  if (key === 'End') {
    return addDays(focused, DAYS_IN_WEEK - 1 - mondayIndex(focused));
  }
  return null;
}

function monthStepDate(key: string, focused: Date, shiftKey: boolean): Date | null {
  if (key === 'PageUp') {
    return addMonthsKeepDay(focused, shiftKey ? -12 : -1);
  }
  if (key === 'PageDown') {
    return addMonthsKeepDay(focused, shiftKey ? 12 : 1);
  }
  return null;
}

export function nextFocusedDate(key: string, focused: Date, shiftKey: boolean): Date | null {
  const dayDelta: number | undefined = DAY_DELTAS[key];
  if (dayDelta !== undefined) {
    return addDays(focused, dayDelta);
  }
  return weekEdgeDate(key, focused) ?? monthStepDate(key, focused, shiftKey);
}
