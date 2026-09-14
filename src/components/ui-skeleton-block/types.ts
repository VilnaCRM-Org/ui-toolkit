import type { SxProps, Theme } from '@mui/material';

export type SkeletonBlockLength = string | number;

export interface UiSkeletonBlockProps {
  id?: string | undefined;
  width?: SkeletonBlockLength | undefined;
  height?: SkeletonBlockLength | undefined;
  borderRadius?: SkeletonBlockLength | undefined;
  sx?: SxProps<Theme> | undefined;
}
