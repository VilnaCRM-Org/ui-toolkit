import { buildPageRange, type PageItem } from './page-range';
import type { UiPaginationProps } from './types';

const DEFAULT_PREVIOUS_LABEL: string = 'Попередня';
const DEFAULT_NEXT_LABEL: string = 'Наступна';
const DEFAULT_NAV_LABEL: string = 'Пагінація';

/** The derived view model the component renders from — keeps `UiPagination` thin. */
export interface PaginationModel {
  items: PageItem[];
  navLabel: string;
  previousLabel: string;
  nextLabel: string;
  prevDisabled: boolean;
  nextDisabled: boolean;
  /** True at the first page — the prev link self-disables (aria-disabled, keeps focus). */
  prevAtBoundary: boolean;
  /** True at the last page — the next link self-disables (aria-disabled, keeps focus). */
  nextAtBoundary: boolean;
  disabled: boolean;
  goPrevious: () => void;
  goNext: () => void;
  select: (page: number) => void;
  isCurrent: (page: number) => boolean;
}

interface ResolvedPagination {
  value: number;
  count: number;
  disabled: boolean;
  siblingCount: number;
  boundaryCount: number;
  previousLabel: string;
  nextLabel: string;
  navLabel: string;
}

function resolveProps(props: UiPaginationProps): ResolvedPagination {
  return {
    value: props.value,
    count: props.count,
    disabled: props.disabled ?? false,
    siblingCount: props.siblingCount ?? 1,
    boundaryCount: props.boundaryCount ?? 1,
    previousLabel: props.previousLabel ?? DEFAULT_PREVIOUS_LABEL,
    nextLabel: props.nextLabel ?? DEFAULT_NEXT_LABEL,
    navLabel: props['aria-label'] ?? DEFAULT_NAV_LABEL,
  };
}

function resolvedItems(resolved: ResolvedPagination): PageItem[] {
  return buildPageRange({
    page: resolved.value,
    count: resolved.count,
    siblingCount: resolved.siblingCount,
    boundaryCount: resolved.boundaryCount,
  });
}

// Emits the next page only when the navigator is operable and the target page is
// within `[1, count]`, so boundary/disabled clicks are inert no-ops.
function makeSelect(
  resolved: ResolvedPagination,
  onChange: UiPaginationProps['onChange']
): (page: number) => void {
  return (page: number): void => {
    if (resolved.disabled || page < 1 || page > resolved.count) return;
    onChange?.(page);
  };
}

/** Builds the pagination view model (page slots, labels, disabled flags, handlers). */
export function usePaginationModel(props: UiPaginationProps): PaginationModel {
  const resolved: ResolvedPagination = resolveProps(props);
  const select: (page: number) => void = makeSelect(resolved, props.onChange);
  const goPrevious = (): void => select(resolved.value - 1);
  const goNext = (): void => select(resolved.value + 1);

  return {
    items: resolvedItems(resolved),
    navLabel: resolved.navLabel,
    previousLabel: resolved.previousLabel,
    nextLabel: resolved.nextLabel,
    prevDisabled: resolved.disabled || resolved.value <= 1,
    nextDisabled: resolved.disabled || resolved.value >= resolved.count,
    prevAtBoundary: resolved.value <= 1,
    nextAtBoundary: resolved.value >= resolved.count,
    disabled: resolved.disabled,
    goPrevious,
    goNext,
    select,
    isCurrent: (page: number): boolean => page === resolved.value,
  };
}
