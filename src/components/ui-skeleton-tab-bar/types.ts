import type { SxProps, Theme } from '@mui/material';

/** Shared shape of the two internal column builders (labels and underlines). */
export interface SkeletonTabsProps {
  tabs: number;
}

export interface UiSkeletonTabBarProps {
  id?: string;
  /**
   * Number of tab placeholders. Board D draws six equal columns across the
   * 1132px bar; the first underline segment is the active one.
   */
  tabs?: number;
  /**
   * Screen-reader-only status text forwarded to the shared skeleton shell;
   * pass a localized string in consuming apps.
   */
  loadingText?: string;
  sx?: SxProps<Theme>;
}
