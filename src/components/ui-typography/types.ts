import type { SxProps, Theme } from '@mui/material';
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export interface UiTypographyProps extends HTMLAttributes<HTMLElement> {
  sx?: SxProps<Theme> | undefined;
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
    | 'mobileText'
    | undefined;
  children: ReactNode;
  component?: ElementType | undefined;
  id?: string | undefined;
  htmlFor?: string | undefined;
  /**
   * Style `variant` from the ambient MUI theme instead of the kit's typography.
   * By default the kit's tokens apply unless an ancestor theme already carries
   * them, so an app with its own typography theme (CRM) would otherwise have to
   * mount the kit theme at its root to keep its own look.
   */
  inheritTheme?: boolean | undefined;
}
