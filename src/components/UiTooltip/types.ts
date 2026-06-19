import { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

export interface UiTooltipProps {
  children: ReactNode;
  title: string | ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  arrow?: boolean;
  sx?: SxProps<Theme>;
  /**
   * Accessible name for the tooltip trigger. Required when `children` is a
   * non-text node (e.g. an icon), otherwise the trigger button has no name.
   */
  triggerLabel?: string;
}
