import { render } from '@testing-library/react';
import React from 'react';

import UiSkeletonTable from '../../src/components/ui-skeleton-table';
import {
  DEFAULT_ROWS,
  GLYPH_DOTS,
  STACKED_LINES,
} from '../../src/components/ui-skeleton-table/styles';
import { getSkeletonKeys } from '../../src/components/ui-skeletons/counts';

jest.mock('../../src/components/ui-skeletons/counts', () => {
  const actual: typeof import('../../src/components/ui-skeletons/counts') = jest.requireActual(
    '../../src/components/ui-skeletons/counts'
  );

  return { ...actual, getSkeletonKeys: jest.fn(actual.getSkeletonKeys) };
});

const mockedGetSkeletonKeys: jest.Mock = getSkeletonKeys as unknown as jest.Mock;

const countCallsWith = (prefix: string): number =>
  mockedGetSkeletonKeys.mock.calls.filter(([called]) => called === prefix).length;

const getKeysFor = (prefix: string): string[] => {
  const index: number = mockedGetSkeletonKeys.mock.calls.findIndex(([called]) => called === prefix);
  const result: jest.MockResult<string[]> | undefined = mockedGetSkeletonKeys.mock.results[index];
  if (result?.type !== 'return') {
    throw new Error(`getSkeletonKeys was never asked for the ${prefix} prefix`);
  }
  return result.value;
};

describe('UiSkeletonTable key prefixes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('keys the body rows under the row prefix', () => {
    render(<UiSkeletonTable rows={2} />);

    expect(mockedGetSkeletonKeys).toHaveBeenCalledWith('row', 2);
    expect(countCallsWith('row')).toBe(1);
    expect(getKeysFor('row')).toEqual(['row-1', 'row-2']);
  });

  it('keys every body row glyph under the glyph-dot prefix', () => {
    render(<UiSkeletonTable />);

    expect(mockedGetSkeletonKeys).toHaveBeenCalledWith('glyph-dot', GLYPH_DOTS);
    expect(countCallsWith('glyph-dot')).toBe(DEFAULT_ROWS);
    expect(getKeysFor('glyph-dot')).toEqual(['glyph-dot-1', 'glyph-dot-2', 'glyph-dot-3']);
  });

  it('keys every stacked cell line under the stacked-line prefix', () => {
    render(<UiSkeletonTable />);

    expect(mockedGetSkeletonKeys).toHaveBeenCalledWith('stacked-line', STACKED_LINES);
    expect(countCallsWith('stacked-line')).toBe(DEFAULT_ROWS);
    expect(getKeysFor('stacked-line')).toEqual(['stacked-line-1', 'stacked-line-2']);
  });

  it('never asks for a key set without a prefix', () => {
    render(<UiSkeletonTable />);

    const prefixes: string[] = mockedGetSkeletonKeys.mock.calls.map(([prefix]) => prefix);

    expect(prefixes).not.toContain('');
    expect(new Set(prefixes)).toEqual(new Set(['row', 'glyph-dot', 'stacked-line']));
  });
});
