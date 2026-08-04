import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { SKELETON_BORDER_RADIUS, baseSkeletonStyle } from '../ui-skeletons';

import type { SkeletonTextLine, SkeletonTextSize } from './types';

const sizeHeights: Record<SkeletonTextSize, string> = {
  s: '8px',
  m: '12px',
  l: '18px',
};

// Board D many-lines pattern, measured from Figma `538:38695` / `538:38696` /
// `538:38697`: three 8px rows on a 14px pitch (a 6px gap) measuring 197, 157 and
// 96 wide, which is the full / ~4-5ths / ~half taper below.
export const SINGLE_LINE_SIZE: SkeletonTextSize = 'm';
export const MANY_LINES_SIZE: SkeletonTextSize = 's';
export const MANY_LINES_GAP: string = '6px';
export const FIRST_LINE_WIDTH: string = '100%';
export const MIDDLE_LINE_WIDTH: string = '80%';
export const LAST_LINE_WIDTH: string = '50%';

export default function getTextSkeletonStyles(
  size: SkeletonTextSize,
  width: string | number
): typeof baseSkeletonStyle & {
  height: string;
  width: string | number;
  borderRadius: string;
} {
  return {
    ...baseSkeletonStyle,
    height: sizeHeights[size],
    width,
    borderRadius: SKELETON_BORDER_RADIUS,
  };
}

export function resolveTextSize(
  size: SkeletonTextSize | undefined,
  lines: number
): SkeletonTextSize {
  return size ?? (lines > 1 ? MANY_LINES_SIZE : SINGLE_LINE_SIZE);
}

function getLineWidth(index: number, lines: number): string {
  if (index === lines - 1) {
    return LAST_LINE_WIDTH;
  }

  return index === 0 ? FIRST_LINE_WIDTH : MIDDLE_LINE_WIDTH;
}

export function getTextLines(lines: number): SkeletonTextLine[] {
  return Array.from({ length: lines }, (_unused, index) => ({
    key: `line-${index + 1}`,
    width: getLineWidth(index, lines),
  }));
}

export function getTextLinesContainerStyles(width: string | number): SystemStyleObject<Theme> {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: MANY_LINES_GAP,
    width,
  };
}
