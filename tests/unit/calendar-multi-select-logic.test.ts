import { formatISO } from '../../src/components/ui-calendar-multi-select/date-utils';
import {
  SELECT_KEYS,
  nextFocusedDate,
} from '../../src/components/ui-calendar-multi-select/keyboard';
import {
  sanitizeSelection,
  toggleSelection,
} from '../../src/components/ui-calendar-multi-select/selection';
import {
  buildCellRows,
  type CellDescriptor,
  type DayDescriptor,
} from '../../src/components/ui-calendar-multi-select/view-model';

function dayByIso(rows: CellDescriptor[][], iso: string): DayDescriptor {
  const match: CellDescriptor | undefined = rows
    .flat()
    .find((cell): cell is DayDescriptor => cell.kind === 'day' && cell.iso === iso);
  if (match == null) {
    throw new Error(`no day cell for ${iso}`);
  }
  return match;
}

describe('calendar selection — sanitizeSelection', () => {
  it('returns an empty array for undefined', () => {
    expect(sanitizeSelection(undefined)).toEqual([]);
  });

  it('drops invalid ISO strings', () => {
    expect(sanitizeSelection(['2026-07-15', 'nope', '2026-02-30'])).toEqual(['2026-07-15']);
  });

  it('de-duplicates and sorts chronologically', () => {
    expect(sanitizeSelection(['2026-07-20', '2026-07-05', '2026-07-20', '2026-06-30'])).toEqual([
      '2026-06-30',
      '2026-07-05',
      '2026-07-20',
    ]);
  });
});

describe('calendar selection — toggleSelection', () => {
  it('adds a day that is not selected, keeping the result sorted', () => {
    expect(toggleSelection(['2026-07-10'], '2026-07-05')).toEqual(['2026-07-05', '2026-07-10']);
  });

  it('removes a day that is already selected', () => {
    expect(toggleSelection(['2026-07-05', '2026-07-10'], '2026-07-05')).toEqual(['2026-07-10']);
  });

  it('does not mutate the input array', () => {
    const input: string[] = ['2026-07-10'];
    toggleSelection(input, '2026-07-05');
    expect(input).toEqual(['2026-07-10']);
  });
});

describe('calendar keyboard — selection keys', () => {
  it('classifies the selection keys', () => {
    [' ', 'Enter', 'Spacebar'].forEach(key => expect(SELECT_KEYS.has(key)).toBe(true));
    expect(SELECT_KEYS.has('ArrowLeft')).toBe(false);
  });
});

describe('calendar keyboard — nextFocusedDate', () => {
  const focused: Date = new Date(2026, 6, 15); // Wed 2026-07-15

  it('moves by one day with Left/Right', () => {
    expect(formatISO(nextFocusedDate('ArrowLeft', focused, false)!)).toBe('2026-07-14');
    expect(formatISO(nextFocusedDate('ArrowRight', focused, false)!)).toBe('2026-07-16');
  });

  it('moves by one week with Up/Down', () => {
    expect(formatISO(nextFocusedDate('ArrowUp', focused, false)!)).toBe('2026-07-08');
    expect(formatISO(nextFocusedDate('ArrowDown', focused, false)!)).toBe('2026-07-22');
  });

  it('jumps to the Monday/Sunday of the week with Home/End', () => {
    expect(formatISO(nextFocusedDate('Home', focused, false)!)).toBe('2026-07-13');
    expect(formatISO(nextFocusedDate('End', focused, false)!)).toBe('2026-07-19');
  });

  it('moves by one month with PageUp/PageDown', () => {
    expect(formatISO(nextFocusedDate('PageUp', focused, false)!)).toBe('2026-06-15');
    expect(formatISO(nextFocusedDate('PageDown', focused, false)!)).toBe('2026-08-15');
  });

  it('moves by one year with Shift+PageUp/PageDown', () => {
    expect(formatISO(nextFocusedDate('PageUp', focused, true)!)).toBe('2025-07-15');
    expect(formatISO(nextFocusedDate('PageDown', focused, true)!)).toBe('2027-07-15');
  });

  it('returns null for a non-navigation key', () => {
    expect(nextFocusedDate('Enter', focused, false)).toBeNull();
    expect(nextFocusedDate('a', focused, false)).toBeNull();
  });

  it('crosses month boundaries with arrow keys', () => {
    expect(formatISO(nextFocusedDate('ArrowRight', new Date(2026, 6, 31), false)!)).toBe(
      '2026-08-01'
    );
    expect(formatISO(nextFocusedDate('ArrowLeft', new Date(2026, 0, 1), false)!)).toBe(
      '2025-12-31'
    );
  });
});

describe('calendar view-model — buildCellRows', () => {
  const base = {
    visibleMonth: new Date(2026, 6, 1), // July 2026
    selected: new Set(['2026-07-05', '2026-07-20']),
    focusedISO: '2026-07-05',
    todayISO: '2026-07-15',
  };

  it('produces a six-week by seven-day grid', () => {
    const rows: CellDescriptor[][] = buildCellRows(base);
    expect(rows).toHaveLength(6);
    rows.forEach(row => expect(row).toHaveLength(7));
  });

  it('marks adjacent-month slots as padding with stable keys', () => {
    const rows: CellDescriptor[][] = buildCellRows(base);
    const first: CellDescriptor = rows[0][0];
    expect(first.kind).toBe('padding');
    expect(first).toHaveProperty('key', '2026-06-29');
  });

  it('flags selected, today, and roving days', () => {
    const rows: CellDescriptor[][] = buildCellRows(base);
    expect(dayByIso(rows, '2026-07-05')).toMatchObject({
      selected: true,
      today: false,
      roving: true,
      disabled: false,
      dayNumber: 5,
      label: '5 July 2026',
    });
    expect(dayByIso(rows, '2026-07-15')).toMatchObject({ today: true, roving: false });
    expect(dayByIso(rows, '2026-07-20')).toMatchObject({ selected: true, roving: false });
    expect(dayByIso(rows, '2026-07-06')).toMatchObject({ selected: false, today: false });
  });

  it('disables days outside the min/max range', () => {
    const rows: CellDescriptor[][] = buildCellRows({
      ...base,
      minISO: '2026-07-10',
      maxISO: '2026-07-25',
    });
    expect(dayByIso(rows, '2026-07-05').disabled).toBe(true);
    expect(dayByIso(rows, '2026-07-09').disabled).toBe(true);
    expect(dayByIso(rows, '2026-07-10').disabled).toBe(false);
    expect(dayByIso(rows, '2026-07-25').disabled).toBe(false);
    expect(dayByIso(rows, '2026-07-26').disabled).toBe(true);
  });
});
