import type { SxProps, Theme, TooltipProps } from '@mui/material';
import type { ReactNode } from 'react';

type DisclosureProps = 'open' | 'onOpen' | 'onClose' | 'children' | 'title' | 'id';
type PresentationProps = 'placement' | 'arrow' | 'sx';

export interface UiTooltipProps extends Omit<TooltipProps, DisclosureProps | PresentationProps> {
  children: ReactNode;
  title: string | ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | undefined;
  arrow?: boolean | undefined;
  sx?: SxProps<Theme> | undefined;
  triggerLabel?: string | undefined;
}
