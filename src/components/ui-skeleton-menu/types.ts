import type { SxProps, Theme } from '@mui/material';

export interface UiSkeletonMenuProps {
  id?: string | undefined;
  /**
   * Screen-reader-only status text forwarded to the shared skeleton shell;
   * pass a localized string in consuming apps.
   */
  loadingText?: string | undefined;
  sx?: SxProps<Theme> | undefined;
}
