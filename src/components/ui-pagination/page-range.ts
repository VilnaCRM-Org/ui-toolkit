// Pure, deterministic page-range builder implementing MUI `usePagination`
// semantics: the always-visible boundary pages at each end, `siblingCount` pages
// around the current page, and start/end ellipses that collapse to a single page
// (or vanish) when the window already touches the boundaries. No React, no side
// effects — directly unit-testable.

/** Sentinel for a collapsed run of skipped pages ("..."). */
export const PAGINATION_ELLIPSIS = 'ellipsis';
export type PaginationEllipsis = typeof PAGINATION_ELLIPSIS;
/** One rendered slot: a concrete page number or the ellipsis sentinel. */
export type PageItem = number | PaginationEllipsis;

/** Everything the range maths needs, with `siblingCount`/`boundaryCount` resolved. */
export interface PageRangeInput {
  /** Current page, 1-based. */
  page: number;
  /** Total number of pages. */
  count: number;
  /** Pages shown either side of the current page (default 1). */
  siblingCount?: number;
  /** Always-visible pages at each end (default 1). */
  boundaryCount?: number;
}

interface RangeConfig {
  page: number;
  count: number;
  siblingCount: number;
  boundaryCount: number;
}

function range(start: number, end: number): number[] {
  const length: number = end - start + 1;
  return length > 0 ? Array.from({ length }, (_, index) => start + index) : [];
}

function normalizeConfig(input: PageRangeInput): RangeConfig {
  return {
    page: input.page,
    count: input.count,
    siblingCount: input.siblingCount ?? 1,
    boundaryCount: input.boundaryCount ?? 1,
  };
}

function startPages(config: RangeConfig): number[] {
  return range(1, Math.min(config.boundaryCount, config.count));
}

function endPages(config: RangeConfig): number[] {
  const start: number = Math.max(config.count - config.boundaryCount + 1, config.boundaryCount + 1);
  return range(start, config.count);
}

function siblingsStart(config: RangeConfig): number {
  const { page, count, siblingCount, boundaryCount } = config;
  const upperBound: number = count - boundaryCount - siblingCount * 2 - 1;
  return Math.max(Math.min(page - siblingCount, upperBound), boundaryCount + 2);
}

function siblingsEnd(config: RangeConfig): number {
  const { page, count, siblingCount, boundaryCount } = config;
  const ends: number[] = endPages(config);
  const cap: number = ends.length > 0 ? ends[0] - 2 : count - 1;
  return Math.min(Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2), cap);
}

// The slot(s) bridging the start boundary and the sibling window: an ellipsis
// when at least one page is hidden, the single hidden page when exactly one is,
// otherwise nothing.
function startBridge(config: RangeConfig): PageItem[] {
  if (siblingsStart(config) > config.boundaryCount + 2) return [PAGINATION_ELLIPSIS];
  if (config.boundaryCount + 1 < config.count - config.boundaryCount)
    return [config.boundaryCount + 1];
  return [];
}

function endBridge(config: RangeConfig): PageItem[] {
  if (siblingsEnd(config) < config.count - config.boundaryCount - 1) return [PAGINATION_ELLIPSIS];
  if (config.count - config.boundaryCount > config.boundaryCount)
    return [config.count - config.boundaryCount];
  return [];
}

function middlePages(config: RangeConfig): number[] {
  return range(siblingsStart(config), siblingsEnd(config));
}

/** Builds the ordered list of page slots for the given range configuration. */
export function buildPageRange(input: PageRangeInput): PageItem[] {
  const config: RangeConfig = normalizeConfig(input);
  return [
    ...startPages(config),
    ...startBridge(config),
    ...middlePages(config),
    ...endBridge(config),
    ...endPages(config),
  ];
}
