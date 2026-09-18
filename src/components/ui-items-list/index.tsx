import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { listItemSx, listSx } from './styles';
import type { UiItemsListProps } from './types';

// Flattens `children` into the individual rows, unwrapping any React Fragment so a
// fragment holding several rows still yields ONE `<li>` per row. Recurses for nested
// fragments. `Children.map` keys each `<li>` from its child (an explicit key rides
// through; text/positional children fall back to their index), hands nullish and
// boolean children over as `null` (dropped), and prefixes a fragment's rows with the
// fragment's own key, so auto-keyed siblings stay unique across fragment boundaries
// and a reordered keyed fragment keeps its rows' identity.
function isFragment(
  child: React.ReactNode
): child is React.ReactElement<{ children?: React.ReactNode }> {
  return React.isValidElement(child) && child.type === React.Fragment;
}

// Wraps one flattened row in its own `<li>` (the row is the item's sole child).
function toListItem(node: React.ReactNode): React.ReactElement {
  return (
    <Box component="li" sx={listItemSx}>
      {node}
    </Box>
  );
}

function toRows(child: React.ReactNode): React.ReactNode {
  if (child === null) {
    return null;
  }
  return isFragment(child) ? flattenRows(child.props.children) : toListItem(child);
}

function flattenRows(children: React.ReactNode): React.ReactNode[] {
  return React.Children.map(children, toRows) ?? [];
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
  const rows: React.ReactNode[] = flattenRows(children);
  if (rows.length === 0) {
    return null;
  }
  return (
    <Box component="ul" role="list" aria-label={ariaLabel} sx={mergeListSx(sx)}>
      {rows}
    </Box>
  );
}

UiItemsList.displayName = 'UiItemsList';

export default UiItemsList;
