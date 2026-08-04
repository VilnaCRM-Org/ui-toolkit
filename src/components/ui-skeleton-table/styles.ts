import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { getSkeletonKeys } from '../ui-skeletons';

import type { SkeletonTableColumn, SkeletonTableColumnSlot } from './types';

// Geometry measured live from Figma `538:40309` ("Group 324", 1166x692) in file
// xZ7ccrH6d4QyqLQsayFSEX, Board D: a strip of five 63x14 header bars, a 10px
// gap, then ten 1166x56 rows on a 68px pitch. Every grey in the node is the
// shared rgba(211, 216, 224, ...) shimmer, so all visible shapes come from the
// `UiSkeleton*` primitives and this module only carries layout geometry.
const ROW_HEIGHT: string = '56px';
const ROW_GAP: string = '12px';
const ROW_RADIUS: string = '8px';
const ROW_PADDING_LEFT: number = 42;
const ROW_PADDING_RIGHT: number = 16;
const HEADER_GAP: string = '10px';
const HEADER_BAR_WIDTH: string = '63px';
export const BAR_HEIGHT: string = '14px';
export const BAR_RADIUS: string = '20px';
const CHIP_HEIGHT: string = '28px';
const CHIP_PADDING: string = '5px 8px';
const CHIP_GAP: string = '4px';
export const CHIP_DOT_SIZE: string = '5px';
export const CHIP_BAR_WIDTH: string = '79px';
export const CHIP_BAR_HEIGHT: string = '12.25px';
export const CHIP_BAR_RADIUS: string = '6.125px';
export const STACKED_BAR_HEIGHT: string = '12.25px';
export const STACKED_BAR_RADIUS: string = '17.5px';
const STACKED_GAP: string = '5.25px';
export const STACKED_LINES: number = 2;
const GLYPH_SIZE: number = 24;
export const GLYPH_DOT_SIZE: string = '4px';
const GLYPH_DOT_GAP: string = '3px';
export const GLYPH_DOTS: number = 3;
export const DOT_RADIUS: string = '50%';
export const DEFAULT_ROWS: number = 10;
export const DEFAULT_COLUMNS: number = 5;

// Measured column x-positions 42 / 270 / 466 / 583 / 802 (tracks below) with
// placeholder widths 190 / 136 / 63 / 104 / 280. The fourth column is the
// 104x28 chip frame, the fifth a two-line 280px text block. Tracks stay numeric
// so the component footprint can be summed from them.
export const TABLE_COLUMNS: SkeletonTableColumn[] = [
  { track: 228, width: '190px', kind: 'bar' },
  { track: 196, width: '136px', kind: 'bar' },
  { track: 117, width: '63px', kind: 'bar' },
  { track: 219, width: '104px', kind: 'chip' },
  { track: 324, width: '280px', kind: 'stacked' },
];

export function getColumnSlots(columns: number): SkeletonTableColumnSlot[] {
  return getSkeletonKeys('column', columns).map((key, index) => ({
    ...TABLE_COLUMNS[index % TABLE_COLUMNS.length],
    key,
  }));
}

/** Header columns keep the body tracks but carry one uniform 63x14 bar each. */
export function getHeaderSlots(columns: number): SkeletonTableColumnSlot[] {
  return getColumnSlots(columns).map(slot => ({
    ...slot,
    width: HEADER_BAR_WIDTH,
    kind: 'bar',
  }));
}

const rowLayout: SystemStyleObject<Theme> = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  paddingLeft: `${ROW_PADDING_LEFT}px`,
  paddingRight: `${ROW_PADDING_RIGHT}px`,
};

/**
 * Footprint of a row at `columns` columns: the tracks the count actually cycles
 * through, plus the row padding and the trailing glyph lane. The five design
 * columns derive the measured 1166px board width; a larger count widens the
 * component instead of pushing its extra tracks under the clipped edge.
 */
export function getTableWidth(columns: number): number {
  return getColumnSlots(columns).reduce(
    (total, slot) => total + slot.track,
    ROW_PADDING_LEFT + ROW_PADDING_RIGHT + GLYPH_SIZE
  );
}

export function getRootStyles(columns: number): SystemStyleObject<Theme> {
  return { width: '100%', maxWidth: `${getTableWidth(columns)}px` };
}

export const contentStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  overflow: 'hidden',
};

export const headerRowStyles: SystemStyleObject<Theme> = {
  ...rowLayout,
  height: BAR_HEIGHT,
  marginBottom: HEADER_GAP,
};

export const bodyStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: ROW_GAP,
  width: '100%',
};

export const bodyRowStyles: SystemStyleObject<Theme> = {
  ...rowLayout,
  height: ROW_HEIGHT,
  borderRadius: ROW_RADIUS,
  overflow: 'hidden',
};

// Three 4px dots on a 7px pitch inside the 24x24 `dots-vertical` slot, pinned
// to the row's right edge (the derived row width leaves no slack).
export const glyphStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  gap: GLYPH_DOT_GAP,
  width: `${GLYPH_SIZE}px`,
  height: `${GLYPH_SIZE}px`,
  marginLeft: 'auto',
};

export const stackedStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: STACKED_GAP,
};

/** The dot is centred in the 18px chip content box; the pill sits flush top. */
export const chipDotStyles: SystemStyleObject<Theme> = { alignSelf: 'center' };

export function getCellStyles(track: number): SystemStyleObject<Theme> {
  return { width: `${track}px`, flexShrink: 0 };
}

// The measured chip frame (104x28, 4px radius) has no fill of its own, so only
// its box model survives here: 5px/8px padding around an 18px content row.
export function getChipStyles(width: string): SystemStyleObject<Theme> {
  return {
    display: 'flex',
    alignItems: 'flex-start',
    gap: CHIP_GAP,
    width,
    height: CHIP_HEIGHT,
    padding: CHIP_PADDING,
  };
}
