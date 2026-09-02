import type { SxProps, Theme } from '@mui/material';

export type SkeletonImageVariant = 'round' | 'block';

export interface UiSkeletonImageProps {
  id?: string;
  /**
   * Board D image pattern: `round` is the 48x48 avatar ellipse, `block` the
   * 260x195 media tile. Both design sizes stay overridable via width/height.
   */
  variant?: SkeletonImageVariant;
  width?: string | number;
  height?: string | number;
  sx?: SxProps<Theme>;
}
