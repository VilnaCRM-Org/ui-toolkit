import type { SxProps, Theme } from '@mui/material';

export type SkeletonTextSize = 's' | 'm' | 'l';

export interface SkeletonTextLine {
  key: string;
  width: string;
}

export interface UiSkeletonTextProps {
  id?: string;
  /**
   * Bar height preset. Defaults to `'m'` for a single line and to `'s'` (the
   * 8px Board D many-lines row) once `lines` is greater than 1; an explicit
   * value always wins in both cases.
   */
  size?: SkeletonTextSize;
  width?: string | number;
  /**
   * Number of stacked bars. `1` (the default) renders the single-bar markup
   * unchanged; a higher count renders a 6px-gapped column whose bar widths
   * taper 100% (first) to 80% (middle) to 50% (last). The count is normalized
   * to a whole number of bars: a fractional value is floored, and a non-finite
   * or non-positive one falls back to the single bar.
   */
  lines?: number;
  sx?: SxProps<Theme>;
}
