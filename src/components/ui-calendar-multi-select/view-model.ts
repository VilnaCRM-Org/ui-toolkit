import {
  buildMonthMatrix,
  formatDayLabel,
  type CalendarCell,
  type CalendarWeek,
} from './calendar-month';
import { formatISO } from './date-utils';

// Turns a month matrix + selection/focus/range state into a ready-to-render grid
// of cell descriptors. All per-cell branching (padding vs day, selected,
// disabled, today, roving-focus target) is decided here — a pure, fully testable
// module — so the presentational `.tsx` cells stay trivial attribute maps.

export interface DayDescriptor {
  kind: 'day';
  iso: string;
  dayNumber: number;
  /** Full accessible date, e.g. `15 July 2026`. */
  label: string;
  selected: boolean;
  disabled: boolean;
  today: boolean;
  /** The single roving-tabindex target (`tabIndex=0`). */
  roving: boolean;
}

export interface PaddingDescriptor {
  kind: 'padding';
  /** Stable React key for the empty adjacent-month slot. */
  key: string;
}

export type CellDescriptor = DayDescriptor | PaddingDescriptor;

export interface CellRow {
  /** Stable React key for the week row: the ISO of its first (Monday) slot. */
  key: string;
  cells: CellDescriptor[];
}

export interface CellRowsParams {
  visibleMonth: Date;
  selected: ReadonlySet<string>;
  focusedISO: string;
  todayISO: string;
  minISO?: string | undefined;
  maxISO?: string | undefined;
}

function isOutOfRange(
  iso: string,
  minISO: string | undefined,
  maxISO: string | undefined
): boolean {
  // ISO `YYYY-MM-DD` compares lexicographically as chronologically.
  return (minISO != null && iso < minISO) || (maxISO != null && iso > maxISO);
}

function toDescriptor(cell: CalendarCell, params: CellRowsParams): CellDescriptor {
  const iso: string = formatISO(cell.date);
  if (!cell.inCurrentMonth) {
    return { kind: 'padding', key: iso };
  }
  return {
    kind: 'day',
    iso,
    dayNumber: cell.date.getDate(),
    label: formatDayLabel(cell.date),
    selected: params.selected.has(iso),
    disabled: isOutOfRange(iso, params.minISO, params.maxISO),
    today: iso === params.todayISO,
    roving: iso === params.focusedISO,
  };
}

function toRow(week: CalendarWeek, params: CellRowsParams): CellRow {
  return {
    key: formatISO(week.start),
    cells: week.cells.map(cell => toDescriptor(cell, params)),
  };
}

export function buildCellRows(params: CellRowsParams): CellRow[] {
  return buildMonthMatrix(params.visibleMonth).map(week => toRow(week, params));
}
