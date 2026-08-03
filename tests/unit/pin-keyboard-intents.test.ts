import {
  pinEventIntent,
  pinKeyIntent,
  resolvePinKey,
  type PinKeyEvent,
  type PinKeyIntent,
} from '../../src/components/ui-pin-input/pin-keyboard';
import type { PinCellContext, PinOutcome } from '../../src/components/ui-pin-input/pin-value';

// The keyboard table from the binding contract, exercised as pure data: which keys
// the cells intercept at all, and what each one asks the field to do. `value: null`
// means "the value does not change" and `focusIndex: null` means "leave focus
// alone" — neither may be conflated with an empty string or with cell 0.

function ctx(value: string, index: number, length: number = 6): PinCellContext {
  return { value, index, length };
}

describe('pinKeyIntent — which keys a cell intercepts', () => {
  it('maps exactly the four editing/navigation keys', () => {
    expect(pinKeyIntent('Backspace')).toBe('backspace');
    expect(pinKeyIntent('Delete')).toBe('delete');
    expect(pinKeyIntent('ArrowLeft')).toBe('prev');
    expect(pinKeyIntent('ArrowRight')).toBe('next');
  });

  it('leaves every other key to the platform (S6 — no manual Enter/Space handler)', () => {
    expect(pinKeyIntent('Enter')).toBeNull();
    expect(pinKeyIntent(' ')).toBeNull();
    expect(pinKeyIntent('Tab')).toBeNull();
    expect(pinKeyIntent('4')).toBeNull();
    expect(pinKeyIntent('a')).toBeNull();
    expect(pinKeyIntent('ArrowUp')).toBeNull();
    expect(pinKeyIntent('ArrowDown')).toBeNull();
    expect(pinKeyIntent('Home')).toBeNull();
    expect(pinKeyIntent('End')).toBeNull();
    expect(pinKeyIntent('')).toBeNull();
  });

  it('is case-sensitive, so a lowercase spelling is not an intent', () => {
    expect(pinKeyIntent('backspace')).toBeNull();
    expect(pinKeyIntent('arrowleft')).toBeNull();
  });

  it('never resolves an INHERITED Object property as an intent', () => {
    // `event.key` is an arbitrary string from the UA, and a synthetic event can
    // carry any of these. A prototype-chain hit would return a Function here and
    // throw downstream in `resolvePinKey`, inside the keydown handler.
    expect(pinKeyIntent('toString')).toBeNull();
    expect(pinKeyIntent('constructor')).toBeNull();
    expect(pinKeyIntent('valueOf')).toBeNull();
    expect(pinKeyIntent('hasOwnProperty')).toBeNull();
  });
});

describe('pinEventIntent — a modified combination belongs to the browser', () => {
  function keyEvent(key: string, modifier?: 'altKey' | 'ctrlKey' | 'metaKey'): PinKeyEvent {
    return {
      key,
      altKey: modifier === 'altKey',
      ctrlKey: modifier === 'ctrlKey',
      metaKey: modifier === 'metaKey',
    };
  }

  it('resolves the table normally when no modifier is held', () => {
    expect(pinEventIntent(keyEvent('ArrowRight'))).toBe('next');
    expect(pinEventIntent(keyEvent('Backspace'))).toBe('backspace');
    expect(pinEventIntent(keyEvent('Enter'))).toBeNull();
  });

  it('declines Alt/Ctrl/Meta combinations — history, word and line shortcuts', () => {
    // Alt+Arrow is browser history, Ctrl/Cmd+Arrow is word and line caret
    // movement. Claiming them (and preventing their default) would break the
    // pass-through the component's own header promises.
    expect(pinEventIntent(keyEvent('ArrowLeft', 'altKey'))).toBeNull();
    expect(pinEventIntent(keyEvent('ArrowRight', 'ctrlKey'))).toBeNull();
    expect(pinEventIntent(keyEvent('Backspace', 'metaKey'))).toBeNull();
    expect(pinEventIntent(keyEvent('Delete', 'ctrlKey'))).toBeNull();
  });

  it('still intercepts a SHIFTED arrow, which only extends a one-character box', () => {
    expect(pinEventIntent({ ...keyEvent('ArrowLeft'), key: 'ArrowLeft' })).toBe('prev');
  });
});

describe('resolvePinKey — Backspace', () => {
  it('clears a FILLED cell in place and leaves focus alone', () => {
    const outcome: PinOutcome = resolvePinKey('backspace', ctx('482100', 2));
    expect(outcome).toEqual({ value: '48100', focusIndex: null });
  });

  it('steps back from an EMPTY cell and clears the previous one', () => {
    const outcome: PinOutcome = resolvePinKey('backspace', ctx('48', 2));
    expect(outcome).toEqual({ value: '4', focusIndex: 1 });
  });

  it('clamps at cell 0, where stepping back degrades to clearing cell 0', () => {
    expect(resolvePinKey('backspace', ctx('', 0))).toEqual({ value: '', focusIndex: 0 });
    // Cell 0 is filled here, so the in-place branch runs and focus stays.
    expect(resolvePinKey('backspace', ctx('4', 0))).toEqual({ value: '', focusIndex: null });
  });

  it('reports the unchanged value when the previous cell was already empty', () => {
    // The handler compares against the current value before calling back, so this
    // shape is what makes a dead Backspace a focus move and nothing more.
    expect(resolvePinKey('backspace', ctx('48', 4))).toEqual({ value: '48', focusIndex: 3 });
  });
});

describe('resolvePinKey — Delete', () => {
  it('clears the current cell and never moves focus', () => {
    expect(resolvePinKey('delete', ctx('482100', 0))).toEqual({ value: '82100', focusIndex: null });
    expect(resolvePinKey('delete', ctx('482100', 5))).toEqual({ value: '48210', focusIndex: null });
  });

  it('produces an unchanged value on an empty cell', () => {
    expect(resolvePinKey('delete', ctx('48', 4))).toEqual({ value: '48', focusIndex: null });
  });
});

describe('resolvePinKey — arrows are a convenience layer, never a roving model', () => {
  it('moves focus one cell and never touches the value', () => {
    expect(resolvePinKey('prev', ctx('482100', 3))).toEqual({ value: null, focusIndex: 2 });
    expect(resolvePinKey('next', ctx('482100', 3))).toEqual({ value: null, focusIndex: 4 });
  });

  it('clamps at both ends rather than wrapping', () => {
    expect(resolvePinKey('prev', ctx('482100', 0))).toEqual({ value: null, focusIndex: 0 });
    expect(resolvePinKey('next', ctx('482100', 5))).toEqual({ value: null, focusIndex: 5 });
  });

  it('clamps against the LENGTH, not against the value', () => {
    // An empty four-cell field still lets ArrowRight reach cell 3.
    expect(resolvePinKey('next', ctx('', 2, 4))).toEqual({ value: null, focusIndex: 3 });
    expect(resolvePinKey('next', ctx('', 3, 4))).toEqual({ value: null, focusIndex: 3 });
    // A single-cell field cannot move at all.
    expect(resolvePinKey('next', ctx('', 0, 1))).toEqual({ value: null, focusIndex: 0 });
  });
});

describe('resolvePinKey — table totality', () => {
  const INTENTS: PinKeyIntent[] = ['backspace', 'delete', 'prev', 'next'];

  it('resolves every intent the mapper can produce', () => {
    INTENTS.forEach((intent: PinKeyIntent): void => {
      const outcome: PinOutcome = resolvePinKey(intent, ctx('4821', 1));
      expect(outcome).toHaveProperty('value');
      expect(outcome).toHaveProperty('focusIndex');
    });
  });
});
