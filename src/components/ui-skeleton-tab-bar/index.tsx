import Box from '@mui/material/Box';
import React from 'react';

import UiSkeletonBlock from '../ui-skeleton-block';
import UiSkeletonText from '../ui-skeleton-text';
import { ComposedSkeleton, normalizeCount } from '../ui-skeletons';

import {
  DEFAULT_TAB_COUNT,
  LABEL_WIDTH,
  TRACK_HEIGHT,
  TRACK_RADIUS,
  activeSegmentStyles,
  getTabs,
  labelBarStyles,
  labelCellStyles,
  labelRowStyles,
  segmentStyles,
  tabBarContentStyles,
  tabBarRootStyles,
  trackStyles,
} from './styles';
import type { SkeletonTabsProps, UiSkeletonTabBarProps } from './types';

/** One 147x18 label bar per column, each inset 21px from its column edge. */
function TabLabels({ tabs }: SkeletonTabsProps): React.ReactElement {
  return (
    <Box sx={labelRowStyles}>
      {getTabs(tabs).map(tab => (
        <Box key={tab.key} sx={labelCellStyles}>
          <UiSkeletonText size="l" width={`${LABEL_WIDTH}px`} sx={labelBarStyles} />
        </Box>
      ))}
    </Box>
  );
}

/** The 4px track with one underline segment per column; the first is active. */
function TabUnderlines({ tabs }: SkeletonTabsProps): React.ReactElement {
  return (
    <Box sx={trackStyles}>
      {getTabs(tabs).map(tab =>
        tab.active ? (
          <Box key={tab.key} sx={activeSegmentStyles} />
        ) : (
          <UiSkeletonBlock
            key={tab.key}
            height={TRACK_HEIGHT}
            borderRadius={TRACK_RADIUS}
            sx={segmentStyles}
          />
        )
      )}
    </Box>
  );
}

/**
 * Board D tab bar placeholder: one 147x18 label bar per equal-width column over
 * a full-width track whose first segment carries the active-tab colour. The
 * shapes are decorative divs — deliberately no `tablist`/`tab` roles, no tab
 * selection state and nothing focusable, because no tab exists to activate yet.
 */
export default function UiSkeletonTabBar({
  id,
  tabs = DEFAULT_TAB_COUNT,
  loadingText,
  sx = [],
}: UiSkeletonTabBarProps): React.ReactElement {
  const count: number = normalizeCount(tabs, DEFAULT_TAB_COUNT);

  return (
    <ComposedSkeleton
      id={id}
      loadingText={loadingText}
      sx={[tabBarRootStyles, ...(Array.isArray(sx) ? sx : [sx])]}
      contentSx={tabBarContentStyles}
    >
      <TabLabels tabs={count} />
      <TabUnderlines tabs={count} />
    </ComposedSkeleton>
  );
}
