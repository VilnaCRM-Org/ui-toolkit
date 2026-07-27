import type React from 'react';

import {
  isPrefixMatch,
  splitOnPrefix,
  firstGhostMatch,
  isGhostAcceptKey,
} from '../../src/components/field-controls/ghost-completion';

function acceptKeyEvent(
  key: string,
  opts: { shiftKey?: boolean; value?: string; caret?: number } = {}
): React.KeyboardEvent<HTMLInputElement> {
  const value: string = opts.value ?? '';
  const caret: number = opts.caret ?? value.length;
  return {
    key,
    shiftKey: opts.shiftKey ?? false,
    currentTarget: { value, selectionStart: caret, selectionEnd: caret },
  } as unknown as React.KeyboardEvent<HTMLInputElement>;
}

describe('isPrefixMatch', () => {
  it('matches a case-insensitive prefix', () => {
    expect(isPrefixMatch('top', 'Top performers')).toBe(true);
  });

  it('does not match when the option is not a prefix', () => {
    expect(isPrefixMatch('sales', 'Top sales this month')).toBe(false);
  });

  it('does not match an empty query', () => {
    expect(isPrefixMatch('', 'Top performers')).toBe(false);
  });
});

describe('splitOnPrefix', () => {
  it('splits a matching option into the typed length and the remainder', () => {
    expect(splitOnPrefix('Top performers', 'Top perf')).toEqual(['Top perf', 'ormers']);
  });

  it('keeps a non-prefix option whole in the head, empty tail', () => {
    expect(splitOnPrefix('Top sales this month', 'sales')).toEqual(['Top sales this month', '']);
  });

  it('keeps the option whole before anything is typed', () => {
    expect(splitOnPrefix('Top performers', '')).toEqual(['Top performers', '']);
  });
});

describe('firstGhostMatch', () => {
  const options: string[] = ['Top performers', 'Top sales this month', 'Top sales this year'];

  it('returns the whole first prefix-matching option', () => {
    expect(firstGhostMatch('Top perf', options)).toBe('Top performers');
  });

  it('returns the option in its canonical casing for a lowercase query', () => {
    expect(firstGhostMatch('top perf', options)).toBe('Top performers');
  });

  it('skips options whose completion is empty (an exact match)', () => {
    expect(firstGhostMatch('Top performers', options)).toBe('');
  });

  it('returns empty when nothing prefix-matches', () => {
    expect(firstGhostMatch('zzz', options)).toBe('');
  });

  it('returns empty for an empty query', () => {
    expect(firstGhostMatch('', options)).toBe('');
  });

  it('returns empty when there are no options', () => {
    expect(firstGhostMatch('Top', [])).toBe('');
  });
});

describe('isGhostAcceptKey', () => {
  it('accepts on Tab', () => {
    expect(isGhostAcceptKey(acceptKeyEvent('Tab'))).toBe(true);
  });

  it('does not accept on Shift+Tab (focus must move backward)', () => {
    expect(isGhostAcceptKey(acceptKeyEvent('Tab', { shiftKey: true }))).toBe(false);
  });

  it('accepts on ArrowRight only when the caret is at the very end', () => {
    expect(isGhostAcceptKey(acceptKeyEvent('ArrowRight', { value: 'Top', caret: 3 }))).toBe(true);
    expect(isGhostAcceptKey(acceptKeyEvent('ArrowRight', { value: 'Top', caret: 1 }))).toBe(false);
    expect(isGhostAcceptKey(acceptKeyEvent('ArrowRight', { value: '', caret: 0 }))).toBe(true);
  });

  it('ignores any other key', () => {
    expect(isGhostAcceptKey(acceptKeyEvent('a'))).toBe(false);
  });
});
