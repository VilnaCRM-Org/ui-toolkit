import type { ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material';

export interface UiTooltipProps {
  children: ReactNode;
  title: string | ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  arrow?: boolean;
  sx?: SxProps<Theme>;
}
