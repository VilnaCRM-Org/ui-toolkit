import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import colorTheme from '../ui-color-theme';
import { getSkeletonKeys } from '../ui-skeletons';

// Board D tab bar, measured live from Figma file `xZ7ccrH6d4QyqLQsayFSEX` node
// `538:39646`: a 1132x39 bar holding six 147x18 label bars at y 1 (x 21, 209,
// 398, 587, 776, 965 — a 21px inset into each column) over a full-width 4px
// `#EAECEE` track at y 35 (`538:39647`, 48px radius). Six 4px underline
// segments sit on that track at x 0 / 189 / 377 / 566 / 755 / 943 and are 189
// or 188 wide, i.e. the 1132 / 6 = 188.67 column pitch rounded per segment.
// Only the first segment is painted (`#1EAEFF`); the other five carry the
// shared shimmer gradient and let the track show through their alpha.
export const TAB_BAR_WIDTH: number = 1132;
export const TAB_BAR_HEIGHT: number = 39;
export const DEFAULT_TAB_COUNT: number = 6;
/** Rounded per-segment pitch, i.e. `TAB_BAR_WIDTH / DEFAULT_TAB_COUNT` at design width. */
export const TAB_PITCH: number = 189;
export const TRACK_HEIGHT: number = 4;
export const TRACK_TOP: number = 35;
export const TRACK_RADIUS: string = '48px';
export const LABEL_WIDTH: number = 147;
export const LABEL_HEIGHT: number = 18;
export const LABEL_TOP: number = 1;
export const LABEL_INSET: number = 21;
export const ACTIVE_TAB_INDEX: number = 0;

export interface SkeletonTab {
  key: string;
  active: boolean;
}

/** One entry per tab; Board D paints only the first underline in the brand blue. */
export function getTabs(tabs: number): SkeletonTab[] {
  return getSkeletonKeys('tab', tabs).map((key, index) => ({
    key,
    active: index === ACTIVE_TAB_INDEX,
  }));
}

// The bar fills its container and caps at the 1132px board width, so the six
// columns keep the designed pitch at design width and share the space evenly
// anywhere else. Consumers override both through `sx`.
export const tabBarRootStyles: SystemStyleObject<Theme> = {
  width: '100%',
  maxWidth: `${TAB_BAR_WIDTH}px`,
  height: `${TAB_BAR_HEIGHT}px`,
};

export const tabBarContentStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

export const labelRowStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  paddingTop: `${LABEL_TOP}px`,
};

export const labelCellStyles: SystemStyleObject<Theme> = {
  boxSizing: 'border-box',
  flexGrow: 1,
  flexBasis: 0,
  minWidth: 0,
  paddingLeft: `${LABEL_INSET}px`,
};

export const labelBarStyles: SystemStyleObject<Theme> = {
  maxWidth: '100%',
};

// `marginTop: auto` drops the track onto the measured y 35 baseline whatever the
// label row costs, and the segments ride on top of the track fill.
export const trackStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  marginTop: 'auto',
  height: `${TRACK_HEIGHT}px`,
  borderRadius: TRACK_RADIUS,
  backgroundColor: colorTheme.palette.grey500.main,
};

export const segmentStyles: SystemStyleObject<Theme> = {
  flexGrow: 1,
  flexBasis: 0,
  minWidth: 0,
};

export const activeSegmentStyles: SystemStyleObject<Theme> = {
  ...segmentStyles,
  height: `${TRACK_HEIGHT}px`,
  borderRadius: TRACK_RADIUS,
  backgroundColor: colorTheme.palette.primary.main,
  // Contrast Themes drop background fills, which would erase the only mark that
  // separates the active tab from the rest; `Highlight` is the system colour for
  // a selected surface, so the indicator survives as one.
  '@media (forced-colors: active)': { backgroundColor: 'Highlight' },
};
