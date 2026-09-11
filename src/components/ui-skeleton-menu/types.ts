import type { SxProps, Theme } from '@mui/material';

export interface UiSkeletonMenuProps {
  id?: string;
  /**
   * Screen-reader-only status text forwarded to the shared skeleton shell;
   * pass a localized string in consuming apps.
   */
  loadingText?: string;
  sx?: SxProps<Theme>;
}
