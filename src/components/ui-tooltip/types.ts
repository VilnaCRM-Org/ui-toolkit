import type { SxProps, Theme, TooltipProps } from '@mui/material';
import type { ReactNode } from 'react';

type WrapperControlledProps =
  | 'open'
  | 'onOpen'
  | 'onClose'
  | 'children'
  | 'title'
  | 'id'
  | 'placement'
  | 'arrow'
  | 'sx';

export interface UiTooltipProps extends Omit<TooltipProps, WrapperControlledProps> {
  children: ReactNode;
  title: string | ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | undefined;
  arrow?: boolean | undefined;
  sx?: SxProps<Theme> | undefined;
  triggerLabel?: string | undefined;
}
