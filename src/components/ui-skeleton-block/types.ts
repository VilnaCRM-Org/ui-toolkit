import type { SxProps, Theme } from '@mui/material';

/** A CSS length for the block's box: a unit string, or a pixel number. */
export type SkeletonBlockLength = string | number;

export interface UiSkeletonBlockProps {
  id?: string | undefined;
  width?: SkeletonBlockLength | undefined;
  height?: SkeletonBlockLength | undefined;
  borderRadius?: SkeletonBlockLength | undefined;
  sx?: SxProps<Theme> | undefined;
}
