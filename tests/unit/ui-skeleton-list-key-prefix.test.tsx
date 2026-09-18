import { render } from '@testing-library/react';
import React from 'react';

import UiSkeletonList from '../../src/components/ui-skeleton-list';
import { DEFAULT_LIST_ROWS } from '../../src/components/ui-skeleton-list/styles';
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

describe('UiSkeletonList row key prefix', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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
