import { getSkeletonKeys, normalizeCount } from '../../src/components/ui-skeletons';

describe('normalizeCount', () => {
  it('passes a whole, positive count through untouched', () => {
    expect(normalizeCount(3, 10)).toBe(3);
    expect(normalizeCount(1, 10)).toBe(1);
    expect(normalizeCount(0, 10)).toBe(0);
  });

  it('falls back to the design default for a non-finite count', () => {
    expect(normalizeCount(Number.NaN, 4)).toBe(4);
    expect(normalizeCount(Number.POSITIVE_INFINITY, 4)).toBe(4);
    expect(normalizeCount(Number.NEGATIVE_INFINITY, 4)).toBe(4);
  });

  it('floors a fractional count instead of letting Array.from truncate it', () => {
    expect(normalizeCount(2.5, 1)).toBe(2);
    expect(normalizeCount(0.9, 6)).toBe(0);
    expect(normalizeCount(9.999, 1)).toBe(9);
  });

  it('clamps a negative count to nothing rather than to the default', () => {
    expect(normalizeCount(-3, 5)).toBe(0);
    expect(normalizeCount(-0.5, 5)).toBe(0);
  });
});

describe('getSkeletonKeys', () => {
  it('builds one unique, 1-based key per requested shape', () => {
    expect(getSkeletonKeys('row', 3)).toEqual(['row-1', 'row-2', 'row-3']);
    expect(getSkeletonKeys('column-2-row', 2)).toEqual(['column-2-row-1', 'column-2-row-2']);
  });

  it('returns none for a non-positive count', () => {
    expect(getSkeletonKeys('glyph-dot', 0)).toEqual([]);
    expect(getSkeletonKeys('nav', -4)).toEqual([]);
  });

  it('normalizes the count so no caller can hand Array.from a bad length', () => {
    expect(getSkeletonKeys('tab', 2.9)).toEqual(['tab-1', 'tab-2']);
    expect(getSkeletonKeys('line', Number.POSITIVE_INFINITY)).toEqual([]);
    expect(getSkeletonKeys('line', Number.NaN)).toEqual([]);
  });
});
