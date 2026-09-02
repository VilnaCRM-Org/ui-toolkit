import type { SxProps, Theme } from '@mui/material';

export interface UiSkeletonListProps {
  id?: string;
  /**
   * Number of stacked row placeholders. Board D draws three (`538:39708`,
   * `538:39713`, `538:39719`) — identical bars, so the count is the only
   * variable and the anatomy never cycles.
   */
  rows?: number;
  /**
   * Screen-reader-only status text forwarded to the shared skeleton shell;
   * pass a localized string in consuming apps.
   */
  loadingText?: string;
  sx?: SxProps<Theme>;
}
