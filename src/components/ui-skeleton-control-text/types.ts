import type { SxProps, Theme } from '@mui/material';

export type SkeletonControlVariant = 'checkbox' | 'radio';

export interface UiSkeletonControlTextProps {
  id?: string;
  /**
   * Control placeholder shape. Board D draws the same 24x24 box twice and only
   * changes its corner radius: 8px for the checkbox (`538:39802`) and a full
   * circle for the radio (`538:39808`). The placeholder is a plain decorative
   * div — it never carries a `checkbox`/`radio` role, because there is no
   * checked state to expose while loading.
   */
  control?: SkeletonControlVariant;
  /**
   * Screen-reader-only status text forwarded to the shared skeleton shell;
   * pass a localized string in consuming apps.
   */
  loadingText?: string;
  sx?: SxProps<Theme>;
}
