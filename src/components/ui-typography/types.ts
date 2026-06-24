import type { SxProps, Theme } from '@mui/material';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export interface UiTypographyProps extends HTMLAttributes<HTMLElement> {
  sx?: SxProps<Theme>;
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'medium16'
    | 'medium15'
    | 'medium14'
    | 'regular16'
    | 'bodyText18'
    | 'bodyText16'
    | 'bold22'
    | 'demi18'
    | 'button'
    | 'mobileText';
  children: ReactNode;
  component?: ElementType;
  id?: string;
  htmlFor?: string;
}
