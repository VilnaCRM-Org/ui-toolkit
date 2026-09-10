import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { baseSkeletonStyle } from '../ui-skeletons';

import type { SkeletonImageVariant } from './types';

// Board D geometry measured from Figma file `xZ7ccrH6d4QyqLQsayFSEX`: the round
// pattern is the 48x48 ellipse (`538:38680` / `538:38681`) and the block pattern
// the 260x195 rectangle (`538:39440`), whose corner radius is 8px. Both nodes
// are painted with the shared shimmer gradient, so no fill is added here.
export const ROUND_IMAGE_SIZE: number = 48;
export const ROUND_IMAGE_RADIUS: string = '50%';
export const BLOCK_IMAGE_WIDTH: number = 260;
export const BLOCK_IMAGE_HEIGHT: number = 195;
export const BLOCK_IMAGE_RADIUS: string = '8px';

interface ImageVariantGeometry {
  width: number;
  height: number;
  borderRadius: string;
}

const variantGeometry: Record<SkeletonImageVariant, ImageVariantGeometry> = {
  round: {
    width: ROUND_IMAGE_SIZE,
    height: ROUND_IMAGE_SIZE,
    borderRadius: ROUND_IMAGE_RADIUS,
  },
  block: {
    width: BLOCK_IMAGE_WIDTH,
    height: BLOCK_IMAGE_HEIGHT,
    borderRadius: BLOCK_IMAGE_RADIUS,
  },
};

// Returns a plain style object (not `SxProps`) so it stays a valid element of a
// merged `sx` array in UiSkeletonImage.
export default function getImageSkeletonStyles(
  variant: SkeletonImageVariant,
  width?: string | number,
  height?: string | number
): SystemStyleObject<Theme> {
  const geometry: ImageVariantGeometry = variantGeometry[variant];

  return {
    ...baseSkeletonStyle,
    width: width ?? geometry.width,
    height: height ?? geometry.height,
    borderRadius: geometry.borderRadius,
  };
}
