import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { listItemSx, listSx } from './styles';
import type { UiItemsListProps } from './types';

// Wraps one child row in its own `<li>` (the row is the item's sole child).
// `React.Children.toArray` already assigns a stable key to every element, so that
// key rides onto the `<li>`; a non-element (text) child has none, so it falls back
// to its position. `key` accepts `string | null`, so no fallback branch is needed
// on the element path (its toArray key is always present).
function toListItem(child: React.ReactNode, index: number): React.ReactElement {
  const key: React.Key | null = React.isValidElement(child) ? child.key : index;
  return (
    <Box component="li" key={key} sx={listItemSx}>
      {child}
    </Box>
  );
}

function mergeListSx(consumer: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = consumer ?? {};
  return [listSx, ...(Array.isArray(extra) ? extra : [extra])];
}

// A semantic `<ul role="list">` stacking its `UiItemRow` children, 8px apart. It
// adds no interactive behaviour (no keydown, no tabindex) and renders NOTHING when
// there are no children, so an empty collection exposes no `list` role.
function UiItemsList({
  children,
  'aria-label': ariaLabel,
  sx,
}: Readonly<UiItemsListProps>): React.ReactElement | null {
  const items: React.ReactNode[] = React.Children.toArray(children);
  if (items.length === 0) {
    return null;
  }
  return (
    <Box component="ul" role="list" aria-label={ariaLabel} sx={mergeListSx(sx)}>
      {items.map(toListItem)}
    </Box>
  );
}

UiItemsList.displayName = 'UiItemsList';

export default UiItemsList;
