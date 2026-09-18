import { render } from '@testing-library/react';
import React from 'react';

import UiSkeletonMenu from '../../src/components/ui-skeleton-menu';
import { NAV_ROW_COUNT, SUB_ROW_COUNT } from '../../src/components/ui-skeleton-menu/styles';
import { getSkeletonKeys } from '../../src/components/ui-skeletons/counts';

jest.mock('../../src/components/ui-skeletons/counts', () => {
  const actual: typeof import('../../src/components/ui-skeletons/counts') = jest.requireActual(
    '../../src/components/ui-skeletons/counts'
  );

  return { ...actual, getSkeletonKeys: jest.fn(actual.getSkeletonKeys) };
});

const mockedGetSkeletonKeys: jest.Mock = getSkeletonKeys as unknown as jest.Mock;

const getKeysFor = (prefix: string): string[] => {
  const index: number = mockedGetSkeletonKeys.mock.calls.findIndex(([called]) => called === prefix);
  const result: jest.MockResult<string[]> | undefined = mockedGetSkeletonKeys.mock.results[index];
  if (result?.type !== 'return') {
    throw new Error(`getSkeletonKeys was never asked for the ${prefix} prefix`);
  }
  return result.value;
};

describe('UiSkeletonMenu key prefixes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
