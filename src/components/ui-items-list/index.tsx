import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { listItemSx, listSx } from './styles';
import type { UiItemsListProps } from './types';

// One flattened row plus the stable key its `<li>` carries.
interface FlatRow {
  node: React.ReactNode;
  key: React.Key;
}

// Flattens `children` into the individual rows, unwrapping any React Fragment so a
// fragment holding several rows still yields ONE `<li>` per row — `toArray` keeps a
// fragment as a single child, which would otherwise nest multiple rows inside one
// list item and break the one-row-per-`<li>` contract. Recurses for nested
// fragments. Keys: `toArray` assigns each level a stable key (explicit keys ride
// through; text/positional children fall back to their index), and the fragment
// path prefix keeps auto-keyed siblings unique across fragment boundaries.
function flattenRows(children: React.ReactNode, prefix: string, out: FlatRow[]): void {
  React.Children.toArray(children).forEach((child: React.ReactNode, index: number): void => {
    if (React.isValidElement(child) && child.type === React.Fragment) {
      const inner: React.ReactNode = (child.props as { children?: React.ReactNode }).children;
      // `toArray` always assigns a key here — an explicit fragment key rides
      // through, an unkeyed fragment gets a positional one — so prefix the
      // recursion with it: a reordered *keyed* fragment then keeps its
      // descendants' identity instead of remounting them.
      flattenRows(inner, `${prefix}${String(child.key)}.`, out);
      return;
    }
    const ownKey: React.Key | null = React.isValidElement(child) ? child.key : null;
    out.push({ node: child, key: `${prefix}${ownKey ?? index}` });
  });
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
  const rows: FlatRow[] = [];
  flattenRows(children, '', rows);
  if (rows.length === 0) {
    return null;
  }
  return (
    <Box component="ul" role="list" aria-label={ariaLabel} sx={mergeListSx(sx)}>
      {rows.map(
        ({ node, key }: FlatRow): React.ReactElement => (
          <Box component="li" key={key} sx={listItemSx}>
            {node}
          </Box>
        )
      )}
    </Box>
  );
}

UiItemsList.displayName = 'UiItemsList';

export default UiItemsList;
