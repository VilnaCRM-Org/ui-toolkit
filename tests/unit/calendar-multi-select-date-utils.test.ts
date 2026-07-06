import {
  WEEKDAYS_SHORT,
  WEEKDAYS_LONG,
  MONTHS_LONG,
  isSameDay,
  isSameMonth,
  buildMonthMatrix,
  formatDayLabel,
  formatMonthCaption,
  type CalendarCell,
} from '../../src/components/ui-calendar-multi-select/calendar-month';
import {
  pad2,
  formatISO,
  isValidISO,
  parseISO,
  addDays,
  addMonths,
  startOfMonth,
  daysInMonth,
  addMonthsKeepDay,
  mondayIndex,
} from '../../src/components/ui-calendar-multi-select/date-utils';

describe('calendar date-utils — constants', () => {
  it('orders weekdays Monday-first', () => {
    expect(WEEKDAYS_SHORT[0]).toBe('Mon');
    expect(WEEKDAYS_SHORT[6]).toBe('Sun');
    expect(WEEKDAYS_LONG[0]).toBe('Monday');
    expect(WEEKDAYS_LONG[6]).toBe('Sunday');
    expect(WEEKDAYS_SHORT).toHaveLength(7);
    expect(WEEKDAYS_LONG).toHaveLength(7);
  });

  it('lists twelve month names starting at January', () => {
    expect(MONTHS_LONG).toHaveLength(12);
    expect(MONTHS_LONG[0]).toBe('January');
    expect(MONTHS_LONG[11]).toBe('December');
  });
});

describe('calendar date-utils — pad2', () => {
  it('pads single digits and leaves two-digit values intact', () => {
    expect(pad2(0)).toBe('00');
    expect(pad2(3)).toBe('03');
    expect(pad2(12)).toBe('12');
  });
});

describe('calendar date-utils — formatISO / parseISO round-trip', () => {
  it('formats a local-midnight date as YYYY-MM-DD', () => {
    expect(formatISO(new Date(2026, 6, 15))).toBe('2026-07-15');
    expect(formatISO(new Date(2026, 0, 1))).toBe('2026-01-01');
    expect(formatISO(new Date(2026, 11, 9))).toBe('2026-12-09');
  });

  it('parses YYYY-MM-DD to the same local calendar day regardless of timezone', () => {
    const date: Date = parseISO('2026-07-15');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(15);
  });

  it('round-trips parse → format for a wide range of days', () => {
    for (const iso of ['2024-02-29', '2025-02-28', '2026-01-01', '2026-12-31']) {
      expect(formatISO(parseISO(iso))).toBe(iso);
    }
  });
});

describe('calendar date-utils — isValidISO', () => {
  it('accepts well-formed real dates', () => {
    expect(isValidISO('2026-07-15')).toBe(true);
    expect(isValidISO('2024-02-29')).toBe(true);
  });

  it('rejects malformed strings', () => {
    expect(isValidISO('2026-7-15')).toBe(false);
    expect(isValidISO('26-07-15')).toBe(false);
    expect(isValidISO('2026/07/15')).toBe(false);
    expect(isValidISO('not-a-date')).toBe(false);
    expect(isValidISO('')).toBe(false);
  });

  it('rejects overflowing calendar days', () => {
    expect(isValidISO('2026-02-30')).toBe(false);
    expect(isValidISO('2025-02-29')).toBe(false);
    expect(isValidISO('2026-13-01')).toBe(false);
    expect(isValidISO('2026-00-10')).toBe(false);
  });
});

describe('calendar date-utils — arithmetic', () => {
  it('adds days across a month boundary', () => {
    expect(formatISO(addDays(new Date(2026, 6, 31), 1))).toBe('2026-08-01');
    expect(formatISO(addDays(new Date(2026, 0, 1), -1))).toBe('2025-12-31');
  });

  it('adds months anchored to the first of the resulting month', () => {
    expect(formatISO(addMonths(new Date(2026, 6, 15), 1))).toBe('2026-08-01');
    expect(formatISO(addMonths(new Date(2026, 0, 15), -1))).toBe('2025-12-01');
    expect(formatISO(addMonths(new Date(2026, 6, 15), 12))).toBe('2027-07-01');
  });

  it('returns the first of the month for startOfMonth', () => {
    expect(formatISO(startOfMonth(new Date(2026, 6, 15)))).toBe('2026-07-01');
  });

  it('counts days in a month, including leap February', () => {
    expect(daysInMonth(2026, 6)).toBe(31); // July
    expect(daysInMonth(2026, 3)).toBe(30); // April
    expect(daysInMonth(2024, 1)).toBe(29); // Feb (leap)
    expect(daysInMonth(2025, 1)).toBe(28); // Feb (non-leap)
  });

  it('adds months keeping the day, clamping to the target month length', () => {
    expect(formatISO(addMonthsKeepDay(new Date(2026, 6, 15), 1))).toBe('2026-08-15');
    expect(formatISO(addMonthsKeepDay(new Date(2026, 6, 15), -1))).toBe('2026-06-15');
    // Jan 31 → Feb clamps to 28 (2025 is not a leap year).
    expect(formatISO(addMonthsKeepDay(new Date(2025, 0, 31), 1))).toBe('2025-02-28');
    // Crosses a year boundary.
    expect(formatISO(addMonthsKeepDay(new Date(2026, 0, 10), -1))).toBe('2025-12-10');
    expect(formatISO(addMonthsKeepDay(new Date(2026, 6, 20), 12))).toBe('2027-07-20');
  });
});

describe('calendar date-utils — comparisons', () => {
  it('compares calendar days', () => {
    expect(isSameDay(new Date(2026, 6, 15), new Date(2026, 6, 15))).toBe(true);
    expect(isSameDay(new Date(2026, 6, 15), new Date(2026, 6, 16))).toBe(false);
    expect(isSameDay(new Date(2026, 6, 15), new Date(2025, 6, 15))).toBe(false);
    expect(isSameDay(new Date(2026, 6, 15), new Date(2026, 5, 15))).toBe(false);
  });

  it('compares months', () => {
    expect(isSameMonth(new Date(2026, 6, 1), new Date(2026, 6, 28))).toBe(true);
    expect(isSameMonth(new Date(2026, 6, 1), new Date(2026, 7, 1))).toBe(false);
    expect(isSameMonth(new Date(2026, 6, 1), new Date(2025, 6, 1))).toBe(false);
  });

  it('maps weekdays Monday-first', () => {
    // 2026-07-13 is a Monday, 2026-07-19 a Sunday.
    expect(mondayIndex(new Date(2026, 6, 13))).toBe(0);
    expect(mondayIndex(new Date(2026, 6, 19))).toBe(6);
  });
});

describe('calendar date-utils — buildMonthMatrix', () => {
  const matrix: CalendarCell[][] = buildMonthMatrix(new Date(2026, 6, 1));

  it('is a fixed six-week by seven-day grid', () => {
    expect(matrix).toHaveLength(6);
    matrix.forEach(row => expect(row).toHaveLength(7));
  });

  it('starts on the Monday on or before the first of the month', () => {
    // July 2026 starts on a Wednesday, so the grid opens on Mon 2026-06-29.
    expect(formatISO(matrix[0][0].date)).toBe('2026-06-29');
    expect(matrix[0][0].inCurrentMonth).toBe(false);
  });

  it('flags in-month days and pads with adjacent months', () => {
    const inMonth: CalendarCell[] = matrix.flat().filter(cell => cell.inCurrentMonth);
    expect(inMonth).toHaveLength(31); // July has 31 days
    expect(formatISO(inMonth[0].date)).toBe('2026-07-01');
    expect(formatISO(inMonth[30].date)).toBe('2026-07-31');
    // Trailing pad belongs to the next month.
    const last: CalendarCell = matrix[5][6];
    expect(last.inCurrentMonth).toBe(false);
    expect(last.date.getMonth()).toBe(7);
  });

  it('handles a February that fits in a tidy grid', () => {
    const feb: CalendarCell[][] = buildMonthMatrix(new Date(2026, 1, 1));
    expect(feb).toHaveLength(6);
    expect(feb.flat().filter(cell => cell.inCurrentMonth)).toHaveLength(28);
  });
});

describe('calendar date-utils — formatting', () => {
  it('formats a day accessible label', () => {
    expect(formatDayLabel(new Date(2026, 6, 15))).toBe('15 July 2026');
    expect(formatDayLabel(new Date(2026, 0, 1))).toBe('1 January 2026');
  });

  it('formats the month caption', () => {
    expect(formatMonthCaption(new Date(2026, 6, 1))).toBe('July 2026');
    expect(formatMonthCaption(new Date(2025, 11, 20))).toBe('December 2025');
  });
});
