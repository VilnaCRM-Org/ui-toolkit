import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { SKELETON_BORDER_COLOR } from '../ui-skeletons';

import type { SkeletonTaskBar } from './types';

/** Task row (`538:39359`): 94px tall, 34x34 avatar pinned at 16/14. */
export const TASK_ROW_HEIGHT: string = '94px';
export const AVATAR_SIZE: number = 34;
const AVATAR_LEFT: string = '16px';
const AVATAR_TOP: string = '14px';

// The three bars keep one ratio recipe at every board width: 372px (small),
// 771px (medium) and 561px (two column) rows all place them at the same
// percentages, so the row scales instead of carrying per-size pixel offsets.
export const TASK_BARS: SkeletonTaskBar[] = [
  { key: 'primary', size: 'm', width: '81.99%', left: '15.05%', top: '14px' },
  { key: 'secondary', size: 'm', width: '65.32%', left: '15.05%', top: '36px' },
  { key: 'meta', size: 's', width: '25.81%', left: '16.13%', top: '65px' },
];

// Two-column rows are separated tiles (8px radius over a 21%-alpha tint) on a
// 14px gap, where single-column rows are flush and divided by a hairline.
const TASK_TILE_RADIUS: string = '8px';
const TASK_TILE_BACKGROUND: string = 'rgba(231, 235, 240, 0.21)';
const TASK_TILE_GAP: string = '14px';
const TASK_COLUMN_GAP: string = '12px';
const TASK_GRID_PADDING: string = '26px 13px 0 16px';

/** Scroll affordance (`297:15891`): a 4px brand-grey track, thumb at 27.8%. */
export const SCROLLBAR_WIDTH: string = '4px';
export const SCROLL_THUMB_HEIGHT: string = '27.8%';
const SCROLL_THUMB_COLOR: string = '#D0D4D8';

export const taskBodyStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
};

export const avatarStyles: SystemStyleObject<Theme> = {
  position: 'absolute',
  left: AVATAR_LEFT,
  top: AVATAR_TOP,
};

export const scrollTrackStyles: SystemStyleObject<Theme> = {
  flexShrink: 0,
  width: SCROLLBAR_WIDTH,
  backgroundColor: SKELETON_BORDER_COLOR,
};

export const scrollThumbStyles: SystemStyleObject<Theme> = {
  width: '100%',
  height: SCROLL_THUMB_HEIGHT,
  backgroundColor: SCROLL_THUMB_COLOR,
};

/** Text bar placement inside a task row; the width rides the primitive prop. */
export function getTaskBarStyles(bar: SkeletonTaskBar): SystemStyleObject<Theme> {
  return { position: 'absolute', left: bar.left, top: bar.top };
}

export function getTaskRowStyles(gapped: boolean): SystemStyleObject<Theme> {
  return {
    position: 'relative',
    flexShrink: 0,
    height: TASK_ROW_HEIGHT,
    borderRadius: gapped ? TASK_TILE_RADIUS : 0,
    backgroundColor: gapped ? TASK_TILE_BACKGROUND : 'transparent',
    borderBottom: gapped ? 'none' : `1px solid ${SKELETON_BORDER_COLOR}`,
  };
}

export function getTaskColumnStyles(gapped: boolean): SystemStyleObject<Theme> {
  return {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    gap: gapped ? TASK_TILE_GAP : 0,
  };
}

export function getTaskGridStyles(gapped: boolean): SystemStyleObject<Theme> {
  return {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
    gap: gapped ? TASK_COLUMN_GAP : 0,
    padding: gapped ? TASK_GRID_PADDING : 0,
  };
}
