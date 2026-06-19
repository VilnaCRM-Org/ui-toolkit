import { SKELETON_BORDER_RADIUS, baseSkeletonStyle } from '../UiSkeletons/base';

import { SkeletonTextSize } from './types';

const sizeHeights: Record<SkeletonTextSize, string> = {
  s: '8px',
  m: '12px',
  l: '18px',
};

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
