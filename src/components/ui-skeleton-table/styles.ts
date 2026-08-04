import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import type { SkeletonTableColumn, SkeletonTableColumnSlot } from './types';

// Geometry measured live from Figma `538:40309` ("Group 324", 1166x692) in file
// xZ7ccrH6d4QyqLQsayFSEX, Board D: a strip of five 63x14 header bars, a 10px
// gap, then ten 1166x56 rows on a 68px pitch. Every grey in the node is the
// shared rgba(211, 216, 224, ...) shimmer, so all visible shapes come from the
// `UiSkeleton*` primitives and this module only carries layout geometry.
const TABLE_MAX_WIDTH: string = '1166px';
const ROW_HEIGHT: string = '56px';
const ROW_GAP: string = '12px';
const ROW_RADIUS: string = '8px';
const ROW_PADDING_LEFT: string = '42px';
const ROW_PADDING_RIGHT: string = '16px';
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
const GLYPH_SIZE: string = '24px';
export const GLYPH_DOT_SIZE: string = '4px';
const GLYPH_DOT_GAP: string = '3px';
export const GLYPH_DOTS: number = 3;
export const DOT_RADIUS: string = '50%';
export const DEFAULT_ROWS: number = 10;
export const DEFAULT_COLUMNS: number = 5;

// Measured column x-positions 42 / 270 / 466 / 583 / 802 (tracks below) with
// placeholder widths 190 / 136 / 63 / 104 / 280. The fourth column is the
// 104x28 chip frame, the fifth a two-line 280px text block.
export const TABLE_COLUMNS: SkeletonTableColumn[] = [
  { track: '228px', width: '190px', kind: 'bar' },
  { track: '196px', width: '136px', kind: 'bar' },
  { track: '117px', width: '63px', kind: 'bar' },
  { track: '219px', width: '104px', kind: 'chip' },
  { track: '324px', width: '280px', kind: 'stacked' },
];

export function getKeys(prefix: string, count: number): string[] {
  return Array.from({ length: count }, (_unused, index) => `${prefix}-${index + 1}`);
}

export function getColumnSlots(columns: number): SkeletonTableColumnSlot[] {
  return getKeys('column', columns).map((key, index) => ({
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
  paddingLeft: ROW_PADDING_LEFT,
  paddingRight: ROW_PADDING_RIGHT,
};

export const rootStyles: SystemStyleObject<Theme> = {
  width: '100%',
  maxWidth: TABLE_MAX_WIDTH,
};

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
// to the row's right edge (the measured 1166px width leaves no slack).
export const glyphStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  gap: GLYPH_DOT_GAP,
  width: GLYPH_SIZE,
  height: GLYPH_SIZE,
  marginLeft: 'auto',
};

export const stackedStyles: SystemStyleObject<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: STACKED_GAP,
};

/** The dot is centred in the 18px chip content box; the pill sits flush top. */
export const chipDotStyles: SystemStyleObject<Theme> = { alignSelf: 'center' };

export function getCellStyles(track: string): SystemStyleObject<Theme> {
  return { width: track, flexShrink: 0 };
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
