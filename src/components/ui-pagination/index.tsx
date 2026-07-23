import { Box } from '@mui/material';
import React from 'react';

import { PaginationChevron } from './page-chevron';
import { PAGINATION_ELLIPSIS, type PageItem } from './page-range';
import {
  ellipsisCellSx,
  navLabelSx,
  navLinkSx,
  pageCellSx,
  pageListSx,
  paginationNavSx,
  type PageCellVariant,
} from './styles';
import type { UiPaginationProps } from './types';
import { usePaginationModel, type PaginationModel } from './use-pagination-model';

function cellVariant(current: boolean, disabled: boolean): PageCellVariant {
  if (disabled) return 'disabled';
  if (current) return 'current';
  return 'rest';
}

interface PageButtonProps {
  page: number;
  current: boolean;
  disabled: boolean;
  onSelect: (page: number) => void;
}

// One operable page cell. The visible number is its accessible name (the
// Ukrainian `aria-label` keeps it in-name per WCAG 2.5.3); the current page also
// carries `aria-current="page"`.
function PageButton({
  page,
  current,
  disabled,
  onSelect,
}: Readonly<PageButtonProps>): React.ReactElement {
  const handleClick = (): void => onSelect(page);
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      aria-current={current ? 'page' : undefined}
      aria-label={`Сторінка ${page}`}
      onClick={disabled ? undefined : handleClick}
      sx={pageCellSx(cellVariant(current, disabled))}
    >
      {page}
    </Box>
  );
}

// The skipped-pages marker: styled like a rest cell but purely decorative — not a
// button, not focusable, hidden from the accessibility tree.
function EllipsisCell(): React.ReactElement {
  return (
    <Box component="span" aria-hidden="true" sx={ellipsisCellSx}>
      ...
    </Box>
  );
}

interface NavLinkProps {
  direction: 'left' | 'right';
  label: string;
  disabled: boolean;
  inactive: boolean;
  onActivate: () => void;
}

// The previous/next link: a bare text+chevron button. The chevron leads on the
// left link and trails on the right, matching the Figma order.
function NavLink({
  direction,
  label,
  disabled,
  inactive,
  onActivate,
}: Readonly<NavLinkProps>): React.ReactElement {
  // `inactive` is the self-disabling boundary case (first/last page): the button
  // stays in the tab order with `aria-disabled` so focus is never dropped to
  // <body> on activation, and `makeSelect` no-ops the out-of-range target.
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      aria-disabled={inactive || undefined}
      onClick={onActivate}
      sx={navLinkSx}
    >
      {direction === 'left' ? <PaginationChevron direction="left" /> : null}
      <Box component="span" sx={navLabelSx}>
        {label}
      </Box>
      {direction === 'right' ? <PaginationChevron direction="right" /> : null}
    </Box>
  );
}

function renderItem(item: PageItem, index: number, model: PaginationModel): React.ReactElement {
  if (item === PAGINATION_ELLIPSIS) {
    return <EllipsisCell key={`ellipsis-${index}`} />;
  }
  return (
    <PageButton
      key={item}
      page={item}
      current={model.isCurrent(item)}
      disabled={model.disabled}
      onSelect={model.select}
    />
  );
}

// A page navigator (Figma "Frame 391", node 360:12218): a `<nav>` landmark
// wrapping a previous-page link, the page-cell row (boundary/sibling pages with
// start/end ellipses), and a next-page link. Always controlled via
// `value`/`onChange`; page cells are real buttons with `aria-current="page"` on
// the current page. Prev is disabled at the first page, next at the last, and the
// whole bar when `disabled`.
function UiPagination(props: Readonly<UiPaginationProps>): React.ReactElement {
  const model: PaginationModel = usePaginationModel(props);

  return (
    <Box component="nav" aria-label={model.navLabel} sx={paginationNavSx(props.sx)}>
      <NavLink
        direction="left"
        label={model.previousLabel}
        disabled={model.disabled}
        inactive={model.prevAtBoundary && !model.disabled}
        onActivate={model.goPrevious}
      />
      <Box sx={pageListSx}>
        {model.items.map((item: PageItem, index: number) => renderItem(item, index, model))}
      </Box>
      <NavLink
        direction="right"
        label={model.nextLabel}
        disabled={model.disabled}
        inactive={model.nextAtBoundary && !model.disabled}
        onActivate={model.goNext}
      />
    </Box>
  );
}

UiPagination.displayName = 'UiPagination';

export default UiPagination;
