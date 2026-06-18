import { SxProps, Theme } from '@mui/material';

export interface UiSkeletonBlockProps {
  id?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  sx?: SxProps<Theme>;
}
