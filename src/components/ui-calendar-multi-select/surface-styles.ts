// The calendar's outer chrome: the root layout, the field label, the bordered card
// surface, the month header row, the nav-chevron group and the divider rule.
import type { SxProps, Theme } from '@mui/material';

import { GRID_PX, MOBILE_MAX, palette } from './style-tokens';
import type { CalendarSize } from './style-tokens';

// Only merged into the consumer sx by `mergeRootSx`, so kept module-local. Block-
// level (not inline-flex) so it fills the container and the surface can size to the
// available width — the card itself caps at the Figma width via `surfaceSx`.
const rootSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.375rem',
  fontFamily: 'Inter',
};

/** Merges the consumer's `sx` over the calendar root styling. */
export function mergeRootSx(consumer: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = consumer ?? {};
  return [rootSx, ...(Array.isArray(extra) ? extra : [extra])];
}

export const labelSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: palette.grey200.main,
};

/** The bordered calendar surface; error swaps the stroke, disabled greys it. */
export function surfaceSx(error: boolean, disabled: boolean, size: CalendarSize): SxProps<Theme> {
  // Figma card: lighter Brand-gray stroke, 24px padding and the soft "Shadow
  // lighte" drop shadow (#313B43 @5%); error swaps the stroke, disabled greys it.
  const borderColor: string = error ? palette.strokeDanger.main : palette.brandGray.main;
  return {
    display: 'flex',
    flexDirection: 'column',
    // No uniform gap — the divider and grid carry their own Figma top margins so the
    // caption→divider (18px), divider→weekday (16px) and weekday→days (10px) spacings
    // can each differ.
    gap: 0,
    padding: '1.5rem',
    // Shrink the padding on narrow screens so the fluid grid keeps its room.
    [MOBILE_MAX]: { padding: '0.75rem' },
    borderRadius: '0.5rem',
    border: `1px solid ${borderColor}`,
    backgroundColor: disabled ? palette.brandGray.main : palette.white.main,
    opacity: disabled ? 0.6 : 1,
    boxShadow: disabled ? 'none' : '0px 8px 27px 0px rgba(49, 59, 67, 0.05)',
    // Fill the container up to the Figma card width (grid + 24px padding + 1px
    // border on each side), then shrink below it — so the grid never overflows and
    // clips the last day column on narrow screens.
    width: '100%',
    maxWidth: `${GRID_PX[size] + 50}px`,
    boxSizing: 'border-box',
  };
}

// Figma header: the month caption sits on the LEFT and both chevrons are grouped
// together on the RIGHT (24px apart), not split to opposite ends.
export const headerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
};

// Chevron spacing: Figma's gap-24 spec renders ~1px wider between the drawn glyphs
// (measured 41.5px vs 40px centre-to-centre), so the gap is 25px to match the
// design's visual chevron separation.
export const navGroupSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5625rem',
};

/** 1px rule under the month header (Figma separates header from the grid), 18px
 * below the caption. Figma insets it from the card content (node 606:42016 is 251px
 * inside the 260px content — ~5px left, ~4px right), so it does not span full width. */
export const dividerSx: SxProps<Theme> = {
  height: '1px',
  backgroundColor: palette.grey400.main,
  border: 0,
  margin: 0,
  marginTop: '1.125rem',
  marginLeft: '0.3125rem',
  marginRight: '0.25rem',
};

export const captionSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  // Figma 14/18 — the tighter line-height keeps the caption up near the top edge.
  lineHeight: '1.125rem',
  margin: 0,
  color: palette.darkSecondary.main,
  userSelect: 'none',
};

// The chevrons are 16px flush to the right (no button padding, Figma), 25px apart
// (the navGroup gap), so they sit tight against the card's right inset.
export const navButtonSx: SxProps<Theme> = {
  color: palette.grey300.main,
  padding: 0,
  '&.Mui-disabled': { color: palette.grey400.main },
};
