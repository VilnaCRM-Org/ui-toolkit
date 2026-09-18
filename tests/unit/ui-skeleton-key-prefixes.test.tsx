import { render } from '@testing-library/react';
import React from 'react';

import UiSkeletonList from '../../src/components/ui-skeleton-list';
import { DEFAULT_LIST_ROWS } from '../../src/components/ui-skeleton-list/styles';
import UiSkeletonMenu from '../../src/components/ui-skeleton-menu';
import { NAV_ROW_COUNT, SUB_ROW_COUNT } from '../../src/components/ui-skeleton-menu/styles';
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

afterEach(() => {
  jest.clearAllMocks();
});

describe('UiSkeletonList row key prefix', () => {
  it('keys the default rows under the row prefix', () => {
    render(<UiSkeletonList />);

    expect(mockedGetSkeletonKeys).toHaveBeenCalledTimes(1);
    expect(mockedGetSkeletonKeys).toHaveBeenCalledWith('row', DEFAULT_LIST_ROWS);
    expect(getKeysFor('row')).toEqual(['row-1', 'row-2', 'row-3']);
  });

  it('keys a custom row count under the same prefix', () => {
    render(<UiSkeletonList rows={5} />);

    expect(mockedGetSkeletonKeys).toHaveBeenCalledWith('row', 5);
    expect(getKeysFor('row')).toHaveLength(5);
    expect(getKeysFor('row')).toContain('row-5');
  });
});

describe('UiSkeletonMenu key prefixes', () => {
  it('keys the five nav rows under the nav prefix', () => {
    render(<UiSkeletonMenu />);

    expect(mockedGetSkeletonKeys).toHaveBeenCalledWith('nav', NAV_ROW_COUNT);
    expect(getKeysFor('nav')).toEqual(['nav-1', 'nav-2', 'nav-3', 'nav-4', 'nav-5']);
  });

  it('keys the expanded section sub-rows under the sub prefix', () => {
    render(<UiSkeletonMenu />);

    expect(mockedGetSkeletonKeys).toHaveBeenCalledWith('sub', SUB_ROW_COUNT);
    expect(getKeysFor('sub')).toEqual(['sub-1', 'sub-2', 'sub-3']);
  });

  it('asks for exactly one nav and one sub key set', () => {
    render(<UiSkeletonMenu />);

    const prefixes: string[] = mockedGetSkeletonKeys.mock.calls.map(([prefix]) => prefix);

    expect(prefixes.sort()).toEqual(['nav', 'sub']);
  });
});

describe('UiSkeletonTable key prefixes', () => {
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
