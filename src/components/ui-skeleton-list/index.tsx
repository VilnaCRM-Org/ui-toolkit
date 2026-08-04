import React from 'react';

import UiSkeletonBlock from '../ui-skeleton-block';
import { ComposedSkeleton, getSkeletonKeys, normalizeCount } from '../ui-skeletons';

import {
  DEFAULT_LIST_ROWS,
  LIST_ROW_HEIGHT,
  LIST_ROW_RADIUS,
  listContentStyles,
  listRootStyles,
} from './styles';
import type { UiSkeletonListProps } from './types';

/**
 * Board D list placeholder: a column of identical 64px rounded row bars on a
 * 6px gap, wrapped in the shared busy shell. The rows are decorative shapes —
 * no list/listitem semantics, because nothing is loaded yet.
 */
export default function UiSkeletonList({
  id,
  rows = DEFAULT_LIST_ROWS,
  loadingText,
  sx = [],
}: UiSkeletonListProps): React.ReactElement {
  return (
    <ComposedSkeleton
      id={id}
      loadingText={loadingText}
      sx={[listRootStyles, ...(Array.isArray(sx) ? sx : [sx])]}
      contentSx={listContentStyles}
    >
      {getSkeletonKeys('row', normalizeCount(rows, DEFAULT_LIST_ROWS)).map(key => (
        <UiSkeletonBlock key={key} height={LIST_ROW_HEIGHT} borderRadius={LIST_ROW_RADIUS} />
      ))}
    </ComposedSkeleton>
  );
}
