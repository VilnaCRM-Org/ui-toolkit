import { isValidISO } from './date-utils';

// Selection is a sorted list of ISO `YYYY-MM-DD` strings. Lexicographic order of
// zero-padded ISO dates is also chronological order, so a plain sort keeps the
// value tidy and deterministic (stable snapshots, easy assertions).

/** Normalises an incoming value: drops invalid/duplicate days and sorts. */
export function sanitizeSelection(value: string[] | undefined): string[] {
  if (value == null) {
    return [];
  }
  return [...new Set(value.filter(isValidISO))].sort();
}

/** Toggles `iso` in the selection, returning a new sorted array. */
export function toggleSelection(current: string[], iso: string): string[] {
  const next: Set<string> = new Set(current);
  if (next.has(iso)) {
    next.delete(iso);
  } else {
    next.add(iso);
  }
  return [...next].sort();
}
