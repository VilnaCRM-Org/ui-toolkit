import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';

// Colours resolve to the shared theme tokens so the navigator matches the rest
// of the kit without duplicating hex values. The Figma numbers (48px cell, 8px
// radius, Inter Medium 16/18, 48px group gap, 6px cell gap, 20px chevron) are
// mapped straight onto these recipes.
const palette: Theme['palette'] = colorTheme.palette;

// The bar (Figma node 360:12218): the three groups (prev link / page cells / next
// link) laid out in a horizontal flow, vertically centred, 48px apart.
export function paginationNavSx(consumer: SxProps<Theme> | undefined): SxProps<Theme> {
  const base: SxProps<Theme> = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3rem',
    fontFamily: 'Inter',
  };
  const extra: SxProps<Theme> = consumer ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}

/** The page-cell row: horizontal flex, 6px between cells (Figma). */
export const pageListSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
};

// A 48x48 cell: 8px radius, Inter Medium 16/18, centred. The border stays 1px so
// the box geometry never shifts by a pixel between states — only its colour flips
// (rest shows Brand-gray, the filled states go transparent).
const cellBase: SxProps<Theme> = {
  boxSizing: 'border-box',
  width: '3rem',
  height: '3rem',
  minWidth: '3rem',
  padding: 0,
  margin: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid transparent',
  borderRadius: '0.5rem',
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '1rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  cursor: 'pointer',
  appearance: 'none',
  outline: 'none',
  // Two-layer focus ring (repo/calendar convention): an inner white offset keeps
  // the outer dark ring legible even over the Primary-filled current cell.
  '&:focus-visible': {
    boxShadow: `inset 0 0 0 2px ${palette.white.main}, 0 0 0 2px ${palette.darkPrimary.main}`,
  },
};

// Rest (Figma node 439:19463): White fill, Brand-gray stroke, Font/250 ink.
const restVisual: object = {
  backgroundColor: palette.white.main,
  borderColor: palette.brandGray.main,
  color: palette.grey250.main,
};

// Hover (node 439:19464): Primary @10% fill, no border, Primary ink.
const hoverVisual: object = {
  backgroundColor: alpha(palette.primary.main, 0.1),
  borderColor: 'transparent',
  color: palette.primary.main,
};

// Current (node 439:19465): Primary fill, no border, White ink.
const currentVisual: object = {
  backgroundColor: palette.primary.main,
  borderColor: 'transparent',
  color: palette.white.main,
};

// Disabled (node 439:19466): Brand-gray fill, no border, Placeholder ink.
const disabledVisual: object = {
  backgroundColor: palette.brandGray.main,
  borderColor: 'transparent',
  color: palette.grey300.main,
  cursor: 'default',
};

export type PageCellVariant = 'rest' | 'current' | 'disabled';

function cellVisual(variant: PageCellVariant): object {
  if (variant === 'current') return currentVisual;
  if (variant === 'disabled') return disabledVisual;
  return { ...restVisual, '&:hover': hoverVisual };
}

/** The sx for one operable page cell in the given visual state. */
export function pageCellSx(variant: PageCellVariant): SxProps<Theme> {
  return { ...cellBase, ...cellVisual(variant) };
}

// The ellipsis cell is styled exactly like Rest but is non-interactive: no hover,
// no focus ring, default cursor.
export const ellipsisCellSx: SxProps<Theme> = {
  ...cellBase,
  ...restVisual,
  cursor: 'default',
};

// Prev/next link (Figma nodes 439:19467+): a bare text+chevron row — no
// background, no border, no underline — 6px between the chevron and the label.
// Font/100 at rest, the theme hover blue on hover, Primary while pressed,
// Placeholder when disabled. The chevron inherits `currentColor`, so it tints
// with the row.
export const navLinkSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: 0,
  margin: 0,
  border: 0,
  background: 'none',
  cursor: 'pointer',
  appearance: 'none',
  color: palette.darkPrimary.main,
  outline: 'none',
  // At rest the chevron is Font/300 grey — one shade lighter than the Font/100
  // label (Figma nodes 439:19467+). Hover/pressed/disabled tint label + chevron
  // together, so those states keep inheriting the row's `currentColor`.
  '&:not(:hover):not(:active):not(:disabled):not([aria-disabled="true"]) svg': {
    color: palette.grey300.main,
  },
  '&:hover:not(:disabled):not([aria-disabled="true"])': {
    color: palette.containedButtonHover.main,
  },
  '&:active:not(:disabled):not([aria-disabled="true"])': { color: palette.primary.main },
  // The whole-bar `disabled` prop uses native `disabled` (consistent with
  // ui-radio-group); a self-disabling boundary link instead stays focusable with
  // `aria-disabled` so keyboard focus is never dropped to <body> (WCAG 2.4.3).
  '&:disabled, &[aria-disabled="true"]': { color: palette.grey300.main, cursor: 'default' },
  '&:focus-visible': {
    boxShadow: `inset 0 0 0 2px ${palette.white.main}, 0 0 0 2px ${palette.darkPrimary.main}`,
    borderRadius: '0.25rem',
  },
};

/** The prev/next label: Inter Medium 16/18, colour inherited from the link row. */
export const navLabelSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '1rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  color: 'inherit',
  whiteSpace: 'nowrap',
};
