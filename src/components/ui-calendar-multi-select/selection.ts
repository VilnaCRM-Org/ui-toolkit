import { isValidISO } from './date-utils';

// The calendar is a two-endpoint DATE RANGE picker: the value is the range's
// endpoints as ISO `YYYY-MM-DD` strings — `[]` (empty), `[start]` (a pending
// range) or `[start, end]` (a complete range, sorted). The days strictly between
// the endpoints are the in-range band and are computed, never stored.
// Lexicographic order of zero-padded ISO dates is also chronological order, so a
// plain `localeCompare` sort keeps the endpoints tidy and deterministic.
function compareISO(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Normalises an incoming range value: keeps at most two valid, sorted endpoints. */
export function sanitizeSelection(value: string[] | undefined): string[] {
  if (value == null) {
    return [];
  }
  const valid: string[] = [...new Set(value.filter(isValidISO))].sort(compareISO);
  if (valid.length <= 2) {
    return valid;
  }
  // More than two endpoints is not a valid range — keep the earliest and latest.
  // Sliced rather than indexed so the pair stays a `string[]` under
  // `noUncheckedIndexedAccess` without an assertion.
  return [...valid.slice(0, 1), ...valid.slice(-1)];
}

/**
 * A range selection as produced by `applyRangeEndpoint`: a lone pending endpoint,
 * or a complete sorted pair. Typed as a tuple union so consumers can read both
 * endpoints without widening them to `string | undefined`.
 */
export type RangeSelection = [string] | [string, string];

/**
 * Applies a click at `iso` to the range endpoints. With none — or a complete range
 * — it begins a fresh range at `iso`; with one endpoint pending it completes the
 * range (sorted); re-clicking the pending endpoint keeps it as the sole endpoint.
 */
export function applyRangeEndpoint(current: string[], iso: string): RangeSelection {
  if (current.length !== 1) {
    return [iso];
  }
  if (current[0] === iso) {
    return [iso];
  }
  // `current` holds exactly one pending endpoint here, so appending `iso` always
  // yields the completed pair — the assertion states that contract for the tuple.
  return [...current, iso].sort(compareISO) as [string, string];
}
