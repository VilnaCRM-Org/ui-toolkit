import type { SxProps, Theme } from '@mui/material';

import type { SkeletonTextSize } from '../ui-skeleton-text/types';

/** Board D widget footprints: the 375/774 wide cards vs the 1167 wide board. */
export type SkeletonWidgetSize = 'small' | 'medium';

/** Content anatomy carried under the shared 48px widget header. */
export type SkeletonWidgetVariant = 'task-list' | 'block' | 'chart';

/** Task-list column count; only the medium task-list board draws two. */
export type SkeletonWidgetColumns = 1 | 2;

export interface SkeletonWidgetCard {
  width: number;
  height: number;
}

export interface SkeletonTaskRow {
  key: string;
}

export interface SkeletonTaskColumn {
  key: string;
  rows: SkeletonTaskRow[];
}

/** One text bar of a task row: its primitive size plus its absolute placement. */
export interface SkeletonTaskBar {
  key: string;
  size: SkeletonTextSize;
  width: string;
  left: string;
  top: string;
}

export interface SkeletonChartBar {
  key: string;
  height: number;
}

export interface UiSkeletonWidgetProps {
  id?: string;
  /**
   * Card footprint. `small` is the 375x410 board card; `medium` is the 774x410
   * card, widening to 1167x540 once `columns` is 2.
   */
  size?: SkeletonWidgetSize;
  /** Content anatomy under the header. Defaults to the task list. */
  variant?: SkeletonWidgetVariant;
  /**
   * Task rows drawn *per column* (design default 4). Ignored by the `block`
   * and `chart` variants, which have no repeated row.
   */
  rows?: number;
  /**
   * Task-list column count. Board D draws the single column on the 774x410
   * card (`632:46444`) and two 561-wide columns on the 1167x540 card
   * (`632:46446`), so the count doubles as the card-footprint switch: `1`
   * keeps 774x410, `2` selects 1167x540. It applies to `size='medium'` +
   * `variant='task-list'` only — every other combination resolves to 1.
   */
  columns?: SkeletonWidgetColumns;
  /**
   * Screen-reader-only status text forwarded to the shared skeleton shell;
   * pass a localized string in consuming apps.
   */
  loadingText?: string;
  sx?: SxProps<Theme>;
}
