import {
  buildPageRange,
  PAGINATION_ELLIPSIS,
  type PageItem,
  type PageRangeInput,
} from '../../src/components/ui-pagination/page-range';

// Short alias for the collapsed-run sentinel so the expected arrays read cleanly.
const E: typeof PAGINATION_ELLIPSIS = PAGINATION_ELLIPSIS;

// Every expectation below is the EXACT ordered slot list `buildPageRange` returns
// (numbers plus the ellipsis sentinel), hand-derived from the MUI `usePagination`
// maths the module ports. Full-array assertions so a mutated boundary, sibling, or
// bridge branch changes the output and fails.

describe('buildPageRange — the sentinel', () => {
  it('uses the string "ellipsis" as the collapsed-run marker', () => {
    expect(PAGINATION_ELLIPSIS).toBe('ellipsis');
  });
});

describe('buildPageRange — small counts render every page with no ellipsis', () => {
  it.each<[string, PageRangeInput, PageItem[]]>([
    ['count 1, page 1', { page: 1, count: 1 }, [1]],
    ['count 2, page 1', { page: 1, count: 2 }, [1, 2]],
    ['count 2, page 2', { page: 2, count: 2 }, [1, 2]],
    ['count 5, page 1', { page: 1, count: 5 }, [1, 2, 3, 4, 5]],
    ['count 5, page 3', { page: 3, count: 5 }, [1, 2, 3, 4, 5]],
    ['count 5, page 5', { page: 5, count: 5 }, [1, 2, 3, 4, 5]],
    ['count 7, page 1', { page: 1, count: 7 }, [1, 2, 3, 4, 5, 6, 7]],
    ['count 7, page 4', { page: 4, count: 7 }, [1, 2, 3, 4, 5, 6, 7]],
    ['count 7, page 7', { page: 7, count: 7 }, [1, 2, 3, 4, 5, 6, 7]],
  ])('%s', (_name: string, input: PageRangeInput, expected: PageItem[]) => {
    expect(buildPageRange(input)).toEqual(expected);
  });
});

describe('buildPageRange — early pages produce a single end ellipsis', () => {
  it.each<[string, PageRangeInput, PageItem[]]>([
    ['count 8, page 1', { page: 1, count: 8 }, [1, 2, 3, 4, 5, E, 8]],
    ['count 10, page 1', { page: 1, count: 10 }, [1, 2, 3, 4, 5, E, 10]],
    ['count 10, page 2', { page: 2, count: 10 }, [1, 2, 3, 4, 5, E, 10]],
    ['count 10, page 3', { page: 3, count: 10 }, [1, 2, 3, 4, 5, E, 10]],
    ['count 10, page 4', { page: 4, count: 10 }, [1, 2, 3, 4, 5, E, 10]],
    ['count 20, page 1', { page: 1, count: 20 }, [1, 2, 3, 4, 5, E, 20]],
  ])('%s', (_name: string, input: PageRangeInput, expected: PageItem[]) => {
    expect(buildPageRange(input)).toEqual(expected);
  });
});

describe('buildPageRange — middle pages produce ellipses on both sides', () => {
  it.each<[string, PageRangeInput, PageItem[]]>([
    ['count 10, page 5', { page: 5, count: 10 }, [1, E, 4, 5, 6, E, 10]],
    ['count 10, page 6', { page: 6, count: 10 }, [1, E, 5, 6, 7, E, 10]],
    ['count 20, page 10', { page: 10, count: 20 }, [1, E, 9, 10, 11, E, 20]],
  ])('%s', (_name: string, input: PageRangeInput, expected: PageItem[]) => {
    expect(buildPageRange(input)).toEqual(expected);
  });
});

describe('buildPageRange — late pages produce a single start ellipsis', () => {
  it.each<[string, PageRangeInput, PageItem[]]>([
    ['count 10, page 7', { page: 7, count: 10 }, [1, E, 6, 7, 8, 9, 10]],
    ['count 10, page 8', { page: 8, count: 10 }, [1, E, 6, 7, 8, 9, 10]],
    ['count 10, page 9', { page: 9, count: 10 }, [1, E, 6, 7, 8, 9, 10]],
    ['count 10, page 10', { page: 10, count: 10 }, [1, E, 6, 7, 8, 9, 10]],
    ['count 8, page 8', { page: 8, count: 8 }, [1, E, 4, 5, 6, 7, 8]],
    ['count 20, page 20', { page: 20, count: 20 }, [1, E, 16, 17, 18, 19, 20]],
  ])('%s', (_name: string, input: PageRangeInput, expected: PageItem[]) => {
    expect(buildPageRange(input)).toEqual(expected);
  });
});

describe('buildPageRange — siblingCount widens or collapses the window', () => {
  it.each<[string, PageRangeInput, PageItem[]]>([
    ['siblingCount 0, page 1', { page: 1, count: 10, siblingCount: 0 }, [1, 2, 3, E, 10]],
    ['siblingCount 0, page 6', { page: 6, count: 10, siblingCount: 0 }, [1, E, 6, E, 10]],
    ['siblingCount 0, page 10', { page: 10, count: 10, siblingCount: 0 }, [1, E, 8, 9, 10]],
    [
      'siblingCount 2, page 6',
      { page: 6, count: 10, siblingCount: 2 },
      [1, E, 4, 5, 6, 7, 8, 9, 10],
    ],
    [
      'siblingCount 3, page 6',
      { page: 6, count: 10, siblingCount: 3 },
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    ],
  ])('%s', (_name: string, input: PageRangeInput, expected: PageItem[]) => {
    expect(buildPageRange(input)).toEqual(expected);
  });
});

describe('buildPageRange — boundaryCount changes the always-visible ends', () => {
  it.each<[string, PageRangeInput, PageItem[]]>([
    [
      'boundaryCount 2, page 1',
      { page: 1, count: 10, boundaryCount: 2 },
      [1, 2, 3, 4, 5, 6, E, 9, 10],
    ],
    [
      'boundaryCount 2, page 6',
      { page: 6, count: 10, boundaryCount: 2 },
      [1, 2, E, 5, 6, 7, 8, 9, 10],
    ],
    [
      'boundaryCount 2, page 10',
      { page: 10, count: 10, boundaryCount: 2 },
      [1, 2, E, 5, 6, 7, 8, 9, 10],
    ],
    // boundaryCount 0 empties both boundary runs — the empty-endPages fallback path.
    ['boundaryCount 0, page 1', { page: 1, count: 10, boundaryCount: 0 }, [1, 2, 3, 4, E]],
    ['boundaryCount 0, page 6', { page: 6, count: 10, boundaryCount: 0 }, [E, 5, 6, 7, E]],
  ])('%s', (_name: string, input: PageRangeInput, expected: PageItem[]) => {
    expect(buildPageRange(input)).toEqual(expected);
  });
});

describe('buildPageRange — out-of-range current pages clamp the window, not the value', () => {
  // The builder does not itself clamp `page`; the sibling min/max naturally bound
  // the window, so a page past either end mirrors the nearest in-range page.
  it.each<[string, PageRangeInput, PageItem[]]>([
    ['page 0', { page: 0, count: 10 }, [1, 2, 3, 4, 5, E, 10]],
    ['page -3', { page: -3, count: 10 }, [1, 2, 3, 4, 5, E, 10]],
    ['page 11', { page: 11, count: 10 }, [1, E, 6, 7, 8, 9, 10]],
    ['page 15', { page: 15, count: 10 }, [1, E, 6, 7, 8, 9, 10]],
  ])('%s', (_name: string, input: PageRangeInput, expected: PageItem[]) => {
    expect(buildPageRange(input)).toEqual(expected);
  });
});
