import type { SxProps, Theme } from '@mui/material';

export interface UiImageProps {
  sx?: SxProps<Theme>;
  src: { src: string } | string;
  alt: string;
}
