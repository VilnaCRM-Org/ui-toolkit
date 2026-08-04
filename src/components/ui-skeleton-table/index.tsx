import Box from '@mui/material/Box';
import React from 'react';

import { ComposedSkeleton } from '../ui-skeletons';

import {
  DEFAULT_COLUMNS,
  DEFAULT_ROWS,
  bodyRowStyles,
  bodyStyles,
  contentStyles,
  getColumnSlots,
  getHeaderSlots,
  getKeys,
  headerRowStyles,
  rootStyles,
} from './styles';
import SkeletonTableRow from './table-row';
import type { SkeletonTableColumnSlot, UiSkeletonTableProps } from './types';

/**
 * Decorative loading placeholder for a data table (Figma Board D `538:40309`).
 *
 * The subtree is deliberately a column-aligned grid of plain `div`s: it carries
 * no `table`/`thead`/`tr`/`td` element and no `table`/`grid`/`row`/`cell` role,
 * so assistive technology is never handed an empty table to navigate. The
 * shared `ComposedSkeleton` shell marks the block `aria-busy`, owns the
 * visually-hidden status text and hides the shapes from the accessibility tree;
 * the shimmer, reduced-motion guard and forced-colors outline all come from the
 * `UiSkeletonBlock` primitive, so nothing is redefined here.
 */
export default function UiSkeletonTable({
  id,
  rows = DEFAULT_ROWS,
  columns = DEFAULT_COLUMNS,
  loadingText,
  sx = [],
}: UiSkeletonTableProps): React.ReactElement {
  const slots: SkeletonTableColumnSlot[] = getColumnSlots(columns);

  return (
    <ComposedSkeleton
      id={id}
      loadingText={loadingText}
      sx={[rootStyles, ...(Array.isArray(sx) ? sx : [sx])]}
      contentSx={contentStyles}
    >
      <SkeletonTableRow slots={getHeaderSlots(columns)} sx={headerRowStyles} />
      <Box sx={bodyStyles}>
        {getKeys('row', rows).map(key => (
          <SkeletonTableRow key={key} slots={slots} sx={bodyRowStyles} glyph />
        ))}
      </Box>
    </ComposedSkeleton>
  );
}
