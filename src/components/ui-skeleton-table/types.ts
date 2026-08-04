import type { SxProps, Theme } from '@mui/material';

/** Placeholder shape rendered inside one body-row column cell. */
export type SkeletonTableColumnKind = 'bar' | 'chip' | 'stacked';

export interface SkeletonTableColumn {
  /**
   * Column track width: the measured distance from this column's left edge to
   * the next column's left edge (the last track runs up to the row glyph).
   */
  track: string;
  /** Width of the visible placeholder sitting inside the track. */
  width: string;
  kind: SkeletonTableColumnKind;
}

/** A column spec bound to a stable React key for one rendered row. */
export interface SkeletonTableColumnSlot extends SkeletonTableColumn {
  key: string;
}

export interface UiSkeletonTableProps {
  id?: string;
  /** Body row count. Defaults to the ten rows measured on Board D. */
  rows?: number;
  /**
   * Column count. Defaults to the five measured columns; the measured width
   * pattern cycles when a larger count is requested.
   */
  columns?: number;
  /** Screen-reader-only status text, forwarded to the shared composed shell. */
  loadingText?: string;
  sx?: SxProps<Theme>;
}
