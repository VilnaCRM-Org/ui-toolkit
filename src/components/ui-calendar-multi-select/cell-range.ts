// The range-derived half of a day cell: which endpoint (if any) the day is,
// whether it sits inside the range, and which band segment it paints. Split out
// of `view-model.ts` so both modules stay within the complexity budget.

/** Which part of the cell carries the in-range band, so it joins edge-to-edge. */
export type BandSide = 'none' | 'left' | 'right' | 'full';

/** The three range roles a day can carry, bundled so the helpers below stay
 * within the argument budget. */
export interface RangeFlags {
  /** The range's start endpoint. */
  rangeStart: boolean;
  /** The range's end endpoint. */
  rangeEnd: boolean;
  /** A day strictly between the two endpoints — the faint-blue band. */
  inRange: boolean;
}

/** The range-derived fields of a day descriptor. */
export interface RangeState extends RangeFlags {
  /** A range endpoint (start or end) — rendered as the filled blue circle. */
  selected: boolean;
  /** The band segment this cell paints so the range reads as one continuous bar. */
  bandSide: BandSide;
}

/** The two range endpoints a cell is measured against. */
export interface RangeBounds {
  /** The range's start endpoint (earliest selected), or undefined when empty. */
  rangeStartISO?: string | undefined;
  /** The range's end endpoint (latest selected), or undefined for a pending range. */
  rangeEndISO?: string | undefined;
}

// True when `iso` sits strictly between the two range endpoints (the in-range band).
function isBetween(iso: string, startISO: string | undefined, endISO: string | undefined): boolean {
  return startISO != null && endISO != null && iso > startISO && iso < endISO;
}

// The band segment a cell paints so a completed range reads as one continuous bar:
// endpoints carry the inward half (`right` from the start, `left` into the end).
function bandSideOf(flags: RangeFlags, hasEnd: boolean): BandSide {
  if (flags.inRange) return 'full';
  if (flags.rangeEnd) return 'left';
  return flags.rangeStart && hasEnd ? 'right' : 'none';
}

// Appends the range role to the accessible name, date-first (WCAG 2.5.3): the
// endpoints and in-range extent reach assistive tech even when the band's colour
// does not. "selected" is intentionally omitted — `aria-selected` carries it.
export function roleSuffix(flags: RangeFlags): string {
  if (flags.rangeStart) return ', range start';
  if (flags.rangeEnd) return ', range end';
  return flags.inRange ? ', in range' : '';
}

/** Resolves every range-derived field of the day `iso` against `bounds`. */
export function rangeStateOf(iso: string, bounds: RangeBounds): RangeState {
  const flags: RangeFlags = {
    rangeStart: iso === bounds.rangeStartISO,
    rangeEnd: iso === bounds.rangeEndISO,
    inRange: isBetween(iso, bounds.rangeStartISO, bounds.rangeEndISO),
  };
  return {
    ...flags,
    selected: flags.rangeStart || flags.rangeEnd,
    bandSide: bandSideOf(flags, bounds.rangeEndISO != null),
  };
}
