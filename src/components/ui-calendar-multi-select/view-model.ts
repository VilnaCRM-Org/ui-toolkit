import { buildMonthMatrix, formatDayLabel, type CalendarCell } from './calendar-month';
import { formatISO } from './date-utils';

// Turns a month matrix + selection/focus/range state into a ready-to-render grid
// of cell descriptors. All per-cell branching (padding vs day, selected,
// disabled, today, roving-focus target) is decided here — a pure, fully testable
// module — so the presentational `.tsx` cells stay trivial attribute maps.

/** Which part of the cell carries the in-range band, so it joins edge-to-edge. */
export type BandSide = 'none' | 'left' | 'right' | 'full';

export interface DayDescriptor {
  kind: 'day';
  iso: string;
  dayNumber: number;
  /** Full accessible date, e.g. `15 July 2026`. */
  label: string;
  /** A range endpoint (start or end) — rendered as the filled blue circle. */
  selected: boolean;
  /** The range's start endpoint. */
  rangeStart: boolean;
  /** The range's end endpoint. */
  rangeEnd: boolean;
  /** A day strictly between the two endpoints — the faint-blue band. */
  inRange: boolean;
  /** The band segment this cell paints so the range reads as one continuous bar. */
  bandSide: BandSide;
  disabled: boolean;
  today: boolean;
  /** The single roving-tabindex target (`tabIndex=0`). */
  roving: boolean;
}

export interface PaddingDescriptor {
  kind: 'padding';
  /** Stable React key for the adjacent-month slot. */
  key: string;
  /** The adjacent month's day number, shown faint (previous month up top, next
   * month at the bottom) like Figma. */
  dayNumber: number;
}

export type CellDescriptor = DayDescriptor | PaddingDescriptor;

export interface CellRowsParams {
  visibleMonth: Date;
  /** The range's start endpoint (earliest selected), or undefined when empty. */
  rangeStartISO?: string;
  /** The range's end endpoint (latest selected), or undefined for a pending range. */
  rangeEndISO?: string;
  focusedISO: string;
  todayISO: string;
  minISO?: string;
  maxISO?: string;
  /** BCP-47 locale for the day accessible names. */
  locale: string;
}

function isOutOfRange(
  iso: string,
  minISO: string | undefined,
  maxISO: string | undefined
): boolean {
  // ISO `YYYY-MM-DD` compares lexicographically as chronologically.
  return (minISO != null && iso < minISO) || (maxISO != null && iso > maxISO);
}

// True when `iso` sits strictly between the two range endpoints (the in-range band).
function isBetween(iso: string, startISO: string | undefined, endISO: string | undefined): boolean {
  return startISO != null && endISO != null && iso > startISO && iso < endISO;
}

// The band segment a cell paints so a completed range reads as one continuous bar:
// endpoints carry the inward half (`right` from the start, `left` into the end).
function bandSideOf(
  rangeStart: boolean,
  rangeEnd: boolean,
  inRange: boolean,
  hasEnd: boolean
): BandSide {
  if (inRange) return 'full';
  if (rangeEnd) return 'left';
  if (rangeStart && hasEnd) return 'right';
  return 'none';
}

// Appends the range role to the accessible name, date-first (WCAG 2.5.3): the
// endpoints and in-range extent reach assistive tech even when the band's colour
// does not. "selected" is intentionally omitted — `aria-selected` carries it.
function roleSuffix(rangeStart: boolean, rangeEnd: boolean, inRange: boolean): string {
  if (rangeStart) return ', range start';
  if (rangeEnd) return ', range end';
  if (inRange) return ', in range';
  return '';
}

function toDescriptor(cell: CalendarCell, params: CellRowsParams): CellDescriptor {
  const iso: string = formatISO(cell.date);
  if (!cell.inCurrentMonth) {
    return { kind: 'padding', key: iso, dayNumber: cell.date.getDate() };
  }
  const rangeStart: boolean = iso === params.rangeStartISO;
  const rangeEnd: boolean = iso === params.rangeEndISO;
  const inRange: boolean = isBetween(iso, params.rangeStartISO, params.rangeEndISO);
  return {
    kind: 'day',
    iso,
    dayNumber: cell.date.getDate(),
    label: formatDayLabel(cell.date, params.locale) + roleSuffix(rangeStart, rangeEnd, inRange),
    selected: rangeStart || rangeEnd,
    rangeStart,
    rangeEnd,
    inRange,
    bandSide: bandSideOf(rangeStart, rangeEnd, inRange, params.rangeEndISO != null),
    disabled: isOutOfRange(iso, params.minISO, params.maxISO),
    today: iso === params.todayISO,
    roving: iso === params.focusedISO,
  };
}

export function buildCellRows(params: CellRowsParams): CellDescriptor[][] {
  return buildMonthMatrix(params.visibleMonth).map(week =>
    week.map(cell => toDescriptor(cell, params))
  );
}
