// The calendar grid frame: the `role="grid"` column, the weekday heading row, the
// week rows (with their range band) and the adjacent-month padding cells.
import type { SxProps, Theme } from '@mui/material';

import { CIRCLE_PX, GRID_PX, palette } from './style-tokens';
import type { CalendarSize } from './style-tokens';

// A `role="grid"` flex column: the Figma width at the medium size (card = 308px),
// but `maxWidth: 100%` lets it go fluid inside a narrow container (mobile), where
// justify-between simply tightens the gaps. The 16px gap gives both the weekday-to-
// grid and the row-to-row spacing.
export function gridSx(size: CalendarSize): SxProps<Theme> {
  return {
    display: 'flex',
    flexDirection: 'column',
    // 16px below the divider; 11px between the weekday row and the first week. Figma's
    // structural box-gap is 10px, but its weekday cell is 26px tall (node 606:42018) vs
    // our 24px heading box, so the extra 1px here reproduces Figma's 35px weekday-centre
    // to day-centre distance without shifting the weekday box (which keeps the divider→
    // weekday spacing at its already-correct 20px).
    marginTop: '1rem',
    gap: '0.6875rem',
    // Fill the card up to the Figma width, but genuinely shrink below it on narrow
    // screens (a fixed `width` would overflow and clip the last column instead).
    width: '100%',
    maxWidth: `${GRID_PX[size]}px`,
  };
}

/** The day-row group: the six week rows, 16px apart. */
export const rowGroupSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

// One week row: the seven 24px cells spread edge-to-edge like Figma's
// `justify-between`, so the outer circles sit flush to the grid (and band) edges.
export const weekRowSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
};

/** One week row plus its range band. Figma insets the band 1px inside the 24px day
 * row — its band rectangles are 22px tall (e.g. node 606:42109) and sit centred, not
 * touching the row's top/bottom edges. Applied as a sized background image (not the
 * `background` shorthand, which would reset the size); `none` rows draw no band. */
export function dayRowSx(band: string): SxProps<Theme> {
  return {
    ...weekRowSx,
    backgroundImage: band,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: `100% ${CIRCLE_PX - 2}px`,
  };
}

// Figma's weekday cells are wider than the 24px day circles (32px, node 606:42018),
// so `justify-between` packs the labels closer (≈6px apart) than the day columns.
export const weekdayHeadingSx: SxProps<Theme> = {
  width: '2rem',
  height: `${CIRCLE_PX}px`,
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.75rem',
  color: palette.grey300.main,
  textAlign: 'center',
  lineHeight: `${CIRCLE_PX}px`,
  userSelect: 'none',
};

export const paddingCellSx: SxProps<Theme> = {
  width: `${CIRCLE_PX}px`,
  height: `${CIRCLE_PX}px`,
  textAlign: 'center',
};

// The adjacent month's day number, shown muted so the previous/next month reads as
// context, not as selectable days of this month (they stay non-interactive).
export const adjacentDaySx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: `${CIRCLE_PX}px`,
  height: `${CIRCLE_PX}px`,
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: palette.grey300.main,
};
