import Box from '@mui/material/Box';
import React from 'react';

import UiSkeletonBlock from '../ui-skeleton-block';
import UiSkeletonImage from '../ui-skeleton-image';
import UiSkeletonText from '../ui-skeleton-text';
import { ComposedSkeleton, SKELETON_BORDER_RADIUS, getSkeletonKeys } from '../ui-skeletons';

import {
  ICON_SIZE,
  NAV_ROW_COUNT,
  SUB_ROW_COUNT,
  SUB_ROW_HEIGHT,
  SUB_ROW_WIDTH,
  TITLE_WIDTH,
  dividerStyles,
  menuContentStyles,
  menuRootStyles,
  navRowStyles,
  sectionStyles,
  subListStyles,
} from './styles';
import type { UiSkeletonMenuProps } from './types';

/** One 54px nav row: the 24px icon circle and the 147x18 title bar. */
function MenuNavRow(): React.ReactElement {
  return (
    <Box sx={navRowStyles}>
      <UiSkeletonImage variant="round" width={ICON_SIZE} height={ICON_SIZE} />
      <UiSkeletonText size="l" width={`${TITLE_WIDTH}px`} />
    </Box>
  );
}

/** The three indented 115x14 sub-rows of the expanded section. */
function MenuSubRows(): React.ReactElement {
  return (
    <Box sx={subListStyles}>
      {getSkeletonKeys('sub', SUB_ROW_COUNT).map(key => (
        <UiSkeletonBlock
          key={key}
          width={SUB_ROW_WIDTH}
          height={SUB_ROW_HEIGHT}
          borderRadius={SKELETON_BORDER_RADIUS}
        />
      ))}
    </Box>
  );
}

/** Expanded section: the same nav row anatomy plus its sub-row list. */
function MenuSection(): React.ReactElement {
  return (
    <Box sx={sectionStyles}>
      <MenuNavRow />
      <MenuSubRows />
    </Box>
  );
}

/**
 * Board D sidebar placeholder: five nav rows, one expanded section, then a
 * bottom-anchored divider and trailing row inside the shared busy shell. Every
 * shape is decorative — no navigation, list or heading semantics, because
 * nothing is loaded yet — and nothing in the subtree is focusable.
 */
export default function UiSkeletonMenu({
  id,
  loadingText,
  sx = [],
}: UiSkeletonMenuProps): React.ReactElement {
  return (
    <ComposedSkeleton
      id={id}
      loadingText={loadingText}
      sx={[menuRootStyles, ...(Array.isArray(sx) ? sx : [sx])]}
      contentSx={menuContentStyles}
    >
      {getSkeletonKeys('nav', NAV_ROW_COUNT).map(key => (
        <MenuNavRow key={key} />
      ))}
      <MenuSection />
      <Box sx={dividerStyles} />
      <MenuNavRow />
    </ComposedSkeleton>
  );
}
