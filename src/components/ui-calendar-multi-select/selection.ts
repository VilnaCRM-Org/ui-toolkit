import { isValidISO } from './date-utils';

// Selection is a sorted list of ISO `YYYY-MM-DD` strings. Lexicographic order of
// zero-padded ISO dates is also chronological order, so sorting keeps the value
// tidy and deterministic (stable snapshots, easy assertions). An explicit
// `localeCompare` comparator is used (the codepoint order is identical for these
// ASCII strings) so the sort is reliable regardless of default locale.
function compareISO(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Normalises an incoming value: drops invalid/duplicate days and sorts. */
export function sanitizeSelection(value: string[] | undefined): string[] {
  if (value == null) {
    return [];
  }
  return [...new Set(value.filter(isValidISO))].sort(compareISO);
}

/** Toggles `iso` in the selection, returning a new sorted array. */
export function toggleSelection(current: string[], iso: string): string[] {
  const next: Set<string> = new Set(current);
  if (next.has(iso)) {
    next.delete(iso);
  } else {
    next.add(iso);
  }
  return [...next].sort(compareISO);
}
