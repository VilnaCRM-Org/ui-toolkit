import { buildMonthMatrix, formatDayLabel, type CalendarCell } from './calendar-month';
import { rangeStateOf, roleSuffix, type BandSide, type RangeState } from './cell-range';
import { formatISO } from './date-utils';

// Turns a month matrix + selection/focus/range state into a ready-to-render grid
// of cell descriptors. All per-cell branching (padding vs day, selected,
// disabled, today, roving-focus target) is decided here — a pure, fully testable
// module — so the presentational `.tsx` cells stay trivial attribute maps. The
// range-derived half of a day cell lives in `cell-range.ts`.

export type { BandSide };

export interface DayDescriptor extends RangeState {
  kind: 'day';
  iso: string;
  dayNumber: number;
  /** Full accessible date, e.g. `15 July 2026`. */
  label: string;
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

function toDay(cell: CalendarCell, iso: string, params: CellRowsParams): DayDescriptor {
  const range: RangeState = rangeStateOf(iso, params);
  return {
    kind: 'day',
    iso,
    dayNumber: cell.date.getDate(),
    label: formatDayLabel(cell.date, params.locale) + roleSuffix(range),
    ...range,
    disabled: isOutOfRange(iso, params.minISO, params.maxISO),
    today: iso === params.todayISO,
    roving: iso === params.focusedISO,
  };
}

function toDescriptor(cell: CalendarCell, params: CellRowsParams): CellDescriptor {
  const iso: string = formatISO(cell.date);
  if (cell.inCurrentMonth) {
    return toDay(cell, iso, params);
  }
  return { kind: 'padding', key: iso, dayNumber: cell.date.getDate() };
}

export function buildCellRows(params: CellRowsParams): CellDescriptor[][] {
  return buildMonthMatrix(params.visibleMonth).map(week =>
    week.map(cell => toDescriptor(cell, params))
  );
}
