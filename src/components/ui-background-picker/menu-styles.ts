// Menu-surface recipes for UiBackgroundPicker, split out of `styles.ts` so
// neither file carries enough mass to sink under the maintainability floor.
// Figma open node 439:19689; the card chrome and trigger stay in `styles.ts`.
import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';

import { FOCUS_RING, FORCED_COLORS_RING, LABEL_TYPE } from './styles';

const palette: Theme['palette'] = colorTheme.palette;

/**
 * The selected row's fill: `primary` at 10%, the kit's established "chosen"
 * tint — the multi-select chip and its `aria-selected` option rows are the same
 * value, so a picked background reads the same as a picked anything else.
 *
 * Figma's open frame (node 439:19689) paints no selected row, so this is an
 * owner-requested addition rather than a port: without it the menu gives no
 * indication of which background is currently applied.
 */
const SELECTED_TINT: number = 0.1;

/**
 * The `role="menu"` surface: no border of its own, the card supplies it. The
 * 12px bottom padding is the option list's TRAILING inset. Figma insets the
 * list by 12px at BOTH ends -- divider to first row is 48->60, and last row to
 * the next divider is 187->199 -- so the final row must clear the card's
 * bottom border by the same 12px the first row clears the divider above it.
 */
export const menuSx: SxProps<Theme> = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  margin: 0,
  padding: '0 0 12px',
};

// Full-bleed 2px rule; 12px bottom margin is the divider-to-content gap. Every
// divider BUT the first also takes the list's 12px inset above it: the first
// sits directly under the trigger row, whose own 10px bottom padding already
// supplies that gap (Figma trigger content ends at 36, divider lands at 48).
export const dividerSx: SxProps<Theme> = {
  boxSizing: 'border-box',
  width: '100%',
  height: 0,
  margin: '0 0 12px',
  border: 0,
  borderTop: `2px solid ${palette.brandGray.main}`,
  '&:not(:first-of-type)': { marginTop: '12px' },
};

// Wraps a group's heading + rows (or just its rows) in a uniform 14px rhythm,
// deviating from Figma's inconsistent 49px/46px raw pitch (see `types.ts`).
export const sectionSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
};

export const headingSx: SxProps<Theme> = { ...LABEL_TYPE, margin: 0, padding: '0 19px' };

// One row: 32px tall, 21px inset (2px border + 19px padding). The selected fill
// keys off `aria-checked`, so the paint follows the ARIA state the row already
// publishes rather than a second source of truth; the focus ring is declared
// last so it still wins over a selected row's fill.
export const rowSx: SxProps<Theme> = {
  ...LABEL_TYPE,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
  minHeight: '2rem',
  margin: 0,
  padding: '0 19px',
  border: 0,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  color: palette.darkSecondary.main,
  '&[aria-checked="true"]': { backgroundColor: alpha(palette.primary.main, SELECTED_TINT) },
  '&:focus-visible': { outline: 'none', boxShadow: FOCUS_RING },
  ...FORCED_COLORS_RING,
};

/** The 32px circular board-preview image. */
export const imageMediaSx: SxProps<Theme> = {
  flexShrink: 0,
  display: 'block',
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  objectFit: 'cover',
};

/** The 32px circular colour swatch, filled with the consumer's own colour. */
export function colorMediaSx(color: string | undefined): SxProps<Theme> {
  return {
    flexShrink: 0,
    boxSizing: 'border-box',
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    backgroundColor: color,
  };
}
