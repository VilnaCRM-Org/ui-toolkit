import type { SxProps, Theme } from '@mui/material';

export interface UiSkeletonBlockProps {
  id?: string | undefined;
  width?: string | number | undefined;
  height?: string | number | undefined;
  borderRadius?: string | number | undefined;
  sx?: SxProps<Theme> | undefined;
}
