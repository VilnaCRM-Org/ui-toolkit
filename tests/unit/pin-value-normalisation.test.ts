import {
  DEFAULT_PIN_LENGTH,
  charAt,
  digitsOnly,
  normalizeLength,
  normalizeValue,
  pinAxes,
  withDigitsAt,
  withoutDigitAt,
  writeIndex,
  type PinAxes,
} from '../../src/components/ui-pin-input/pin-value';
import type { UiPinInputProps } from '../../src/components/ui-pin-input/types';

// The value vocabulary UiPinInput speaks. Every other module in the component —
// the keyboard table, the paste distributor, the warnings and the view model —
// resolves through these functions, so their edges are pinned here once, as pure
// string maths with no React and no DOM in the way.

describe('digitsOnly — the single filter both entry paths run through', () => {
  it('keeps digits and strips everything else', () => {
    expect(digitsOnly('123456')).toBe('123456');
    expect(digitsOnly('12-34 56')).toBe('123456');
    expect(digitsOnly('code: 4821')).toBe('4821');
    expect(digitsOnly('٤٨٢')).toBe('');
    expect(digitsOnly('')).toBe('');
    expect(digitsOnly('abc')).toBe('');
  });

  it('is global, not first-match — a stale lastIndex would leak between calls', () => {
    // The module keeps ONE `/\D/g` instance; a `String.replace` with a global
    // regex does not advance `lastIndex`, but a mutation to `/\D/` (no `g`) would
    // strip only the first non-digit. Two runs of the same dirty input catch it.
    expect(digitsOnly('a1b2c3')).toBe('123');
    expect(digitsOnly('a1b2c3')).toBe('123');
  });
});

describe('normalizeLength — a whole number of at least one cell', () => {
  it('defaults to six when no length is supplied', () => {
    expect(DEFAULT_PIN_LENGTH).toBe(6);
    expect(normalizeLength(undefined)).toBe(6);
  });

  it('passes whole positive lengths through untouched', () => {
    expect(normalizeLength(1)).toBe(1);
    expect(normalizeLength(4)).toBe(4);
    expect(normalizeLength(8)).toBe(8);
  });

  it('floors a fractional length rather than rendering an impossible grid', () => {
    expect(normalizeLength(4.9)).toBe(4);
    expect(normalizeLength(1.5)).toBe(1);
  });

  it('raises zero and negatives to one cell', () => {
    expect(normalizeLength(0)).toBe(1);
    expect(normalizeLength(-3)).toBe(1);
    // `Math.floor(-0.5)` is -1, so the clamp — not the floor — is what saves it.
    expect(normalizeLength(-0.5)).toBe(1);
  });

  it('falls back to the default for a non-finite length', () => {
    expect(normalizeLength(Number.NaN)).toBe(6);
    expect(normalizeLength(Number.POSITIVE_INFINITY)).toBe(6);
    expect(normalizeLength(Number.NEGATIVE_INFINITY)).toBe(6);
  });
});

describe('normalizeValue — the always-controlled value', () => {
  it('turns a nullish value into the empty string', () => {
    expect(normalizeValue(undefined, 6)).toBe('');
  });

  it('filters non-digits and clamps to the cell count, in that order', () => {
    expect(normalizeValue('4821', 6)).toBe('4821');
    expect(normalizeValue('48-21', 6)).toBe('4821');
    expect(normalizeValue('1234567890', 6)).toBe('123456');
    // Filtering FIRST is what makes a dirty over-long value keep six real digits
    // instead of six characters of which some are junk.
    expect(normalizeValue('1-2-3-4-5-6-7', 6)).toBe('123456');
    expect(normalizeValue('4821', 2)).toBe('48');
  });

  it('round-trips: a normalised value normalises to itself', () => {
    const once: string = normalizeValue('12a34b5678', 6);
    expect(normalizeValue(once, 6)).toBe(once);
  });
});

describe('charAt — what a cell paints', () => {
  it('returns the digit at the index, or the empty string past the end', () => {
    expect(charAt('482', 0)).toBe('4');
    expect(charAt('482', 2)).toBe('2');
    expect(charAt('482', 3)).toBe('');
    expect(charAt('', 0)).toBe('');
  });
});

describe('writeIndex — the dense-write landing position', () => {
  it('keeps the value dense by clamping a write to the end of it', () => {
    // Clicking cell 5 of an empty field and typing appends rather than opening a
    // hole, so every emitted string stays a digits-only prefix.
    expect(writeIndex('', 5)).toBe(0);
    expect(writeIndex('48', 5)).toBe(2);
  });

  it('leaves a write inside the current value where it is', () => {
    expect(writeIndex('482100', 3)).toBe(3);
    expect(writeIndex('482', 2)).toBe(2);
    expect(writeIndex('482', 3)).toBe(3);
  });
});

describe('withDigitsAt — one write path for a keystroke and a whole paste', () => {
  it('overwrites a single cell', () => {
    expect(withDigitsAt({ value: '482', index: 1, digits: '9' })).toBe('492');
  });

  it('appends at the end of the value', () => {
    expect(withDigitsAt({ value: '482', index: 3, digits: '1' })).toBe('4821');
    expect(withDigitsAt({ value: '', index: 0, digits: '4' })).toBe('4');
  });

  it('overwrites a RUN of cells — a paste is the same write as a keystroke', () => {
    expect(withDigitsAt({ value: '482100', index: 2, digits: '77' })).toBe('487700');
    expect(withDigitsAt({ value: '48', index: 2, digits: '2100' })).toBe('482100');
  });

  it('changes nothing when the run is empty', () => {
    expect(withDigitsAt({ value: '482', index: 1, digits: '' })).toBe('482');
  });
});

describe('withoutDigitAt — deletion closes the gap', () => {
  it('removes the digit at the index', () => {
    expect(withoutDigitAt('482100', 0)).toBe('82100');
    expect(withoutDigitAt('482100', 3)).toBe('48200');
    expect(withoutDigitAt('482100', 5)).toBe('48210');
  });

  it('is a no-op past the end of the value', () => {
    expect(withoutDigitAt('482', 3)).toBe('482');
    expect(withoutDigitAt('', 0)).toBe('');
  });
});

describe('pinAxes — the four coerced props every cell shares', () => {
  function axesOf(props: UiPinInputProps): PinAxes {
    return pinAxes(props);
  }

  it('defaults to six empty, non-interactive, enabled cells', () => {
    expect(axesOf({})).toEqual({ length: 6, value: '', interactive: false, disabled: false });
  });

  it('normalises the length BEFORE clamping the value against it', () => {
    expect(axesOf({ length: 4.7, value: '482100' })).toEqual({
      length: 4,
      value: '4821',
      interactive: false,
      disabled: false,
    });
  });

  it('marks the field interactive on the presence of onChange alone', () => {
    expect(axesOf({ onChange: (): void => undefined }).interactive).toBe(true);
    expect(axesOf({ onChange: undefined }).interactive).toBe(false);
  });

  it('coerces disabled, so a nullish flag never flips the field uncontrolled', () => {
    expect(axesOf({ disabled: true }).disabled).toBe(true);
    expect(axesOf({ disabled: false }).disabled).toBe(false);
    expect(axesOf({ disabled: undefined }).disabled).toBe(false);
  });
});
