import resolvePinEntry from '../../src/components/ui-pin-input/pin-paste';
import type { PinCellContext, PinOutcome } from '../../src/components/ui-pin-input/pin-value';

// The single write path shared by paste, OS one-time-code autofill and ordinary
// typing: a typed digit is just a one-character run, so no entry route can be
// validated differently from another (the 2.4A file-upload lesson).

function ctx(value: string, index: number, length: number = 6): PinCellContext {
  return { value, index, length };
}

describe('resolvePinEntry — a whole pasted code', () => {
  it('distributes a full code from the first cell and parks focus on the last', () => {
    const outcome: PinOutcome = resolvePinEntry('482100', ctx('', 0));
    // Focus stops at the LAST cell, not one past it: there is nowhere else to go
    // once the code is complete.
    expect(outcome).toEqual({ value: '482100', focusIndex: 5 });
  });

  it('strips non-digits before distributing, so formatted codes still land', () => {
    expect(resolvePinEntry('48-21', ctx('', 0))).toEqual({ value: '4821', focusIndex: 4 });
    expect(resolvePinEntry('код: 4821', ctx('', 0))).toEqual({ value: '4821', focusIndex: 4 });
    expect(resolvePinEntry(' 4 8 2 1 ', ctx('', 0))).toEqual({ value: '4821', focusIndex: 4 });
  });

  it('truncates at the cell count instead of overflowing the field', () => {
    expect(resolvePinEntry('1234567890', ctx('', 0))).toEqual({ value: '123456', focusIndex: 5 });
  });
});

describe('resolvePinEntry — pasting into a cell other than the first', () => {
  it('starts the run at the focused cell and truncates against the tail', () => {
    expect(resolvePinEntry('99', ctx('48', 2))).toEqual({ value: '4899', focusIndex: 4 });
    expect(resolvePinEntry('999999', ctx('48', 2))).toEqual({ value: '489999', focusIndex: 5 });
  });

  it('densifies the start, so a paste into an empty far cell still appends', () => {
    // Cell 5 of a two-digit value is empty; the run lands at index 2 rather than
    // opening a three-cell hole.
    expect(resolvePinEntry('99', ctx('48', 5))).toEqual({ value: '4899', focusIndex: 4 });
  });

  it('overwrites in place when the field is already full', () => {
    expect(resolvePinEntry('7', ctx('482100', 0))).toEqual({ value: '782100', focusIndex: 1 });
    expect(resolvePinEntry('12', ctx('482100', 5))).toEqual({ value: '482101', focusIndex: 5 });
  });
});

describe('resolvePinEntry — degenerate inputs', () => {
  it('changes nothing when the payload carries no digits at all', () => {
    // The value comes back UNCHANGED rather than null, which is what lets the
    // handler decline the callback by simple comparison.
    expect(resolvePinEntry('abc', ctx('48', 1))).toEqual({ value: '48', focusIndex: 1 });
    expect(resolvePinEntry('', ctx('48', 1))).toEqual({ value: '48', focusIndex: 1 });
  });

  it('handles a single-cell field, where focus can never advance', () => {
    expect(resolvePinEntry('12', ctx('', 0, 1))).toEqual({ value: '1', focusIndex: 0 });
    expect(resolvePinEntry('9', ctx('4', 0, 1))).toEqual({ value: '9', focusIndex: 0 });
  });

  it('treats one typed digit as a one-character run — the same code path', () => {
    expect(resolvePinEntry('4', ctx('', 0))).toEqual({ value: '4', focusIndex: 1 });
    expect(resolvePinEntry('2', ctx('48', 2))).toEqual({ value: '482', focusIndex: 3 });
  });
});
