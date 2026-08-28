// Element layout for UiItemRow. One DOM tree serves every breakpoint — each rule
// below carries its tablet/mobile overrides inline under TABLET_MAX/MOBILE_MAX, so
// the layout switch is CSS-only and the reading order never changes. The colour half
// (the recipe-driven container `sx`) lives in `container-sx.ts`, so each module stays
// within the maintainability budget.
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

import { websiteBreakpointValues } from '../ui-breakpoints';

const palette: Theme['palette'] = colorTheme.palette;

// The row mirrors the website's swagger operation block, so it uses the WEBSITE
// breakpoint scale, not the CRM one: `for-small-screens` is max-width 640px and
// `for-large-screens` max-width 1024px. Declared (and applied) tablet-first so the
// narrower mobile rule always wins where the two overlap.
const TABLET_MAX: string = `@media (max-width: ${websiteBreakpointValues.lg}px)`;
export const MOBILE_MAX: string = `@media (max-width: ${websiteBreakpointValues.sm}px)`;

// Stable class hooks so the container owns every colour/hover/expanded rule via
// descendant selectors, keeping the child element styles static and recipe-free.
export const BADGE_CLASS: string = 'ui-item-row__badge';
export const PATH_CLASS: string = 'ui-item-row__path';
export const DESC_CLASS: string = 'ui-item-row__description';
export const CHEVRON_CLASS: string = 'ui-item-row__chevron';

// --- Static element layout (colour injected by the container) -----------------

// The container box: 52px tall, 8px radius, 1px accent border, tint fill, overflow
// clipped. Badge is inset 4px inside the border on desktop. The right icon sits
// 19px from the outer edge (18px padding + 1px border); at or below 1024px the
// website widens that right inset to 24px. On mobile the padded box tightens (10px
// left / 16px right, +1px border) and the 12px container gap carries the badge→path
// separation the mobile badge's dropped side pads used to supply.
export const CONTAINER_BASE: object = {
  boxSizing: 'border-box',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  width: '100%',
  height: '3.25rem',
  margin: 0,
  paddingLeft: '0.25rem',
  paddingRight: '1.125rem',
  border: '1px solid',
  borderRadius: '0.5rem',
  overflow: 'hidden',
  textAlign: 'left',
  font: 'inherit',
  [TABLET_MAX]: {
    paddingRight: '1.5rem',
  },
  [MOBILE_MAX]: {
    gap: '0.75rem',
    paddingLeft: '0.625rem',
    paddingRight: '1rem',
  },
};

// The badge pill: white fill, Golos DemiBold 16/26 desktop. Mobile drops the pill
// (transparent fill, Golos DemiBold 14, no side padding) but keeps the drop shadow.
// Ink + shadow are set by the container from the recipe.
export const badgeSx: SxProps<Theme> = {
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: palette.white.main,
  borderRadius: '0.5rem',
  padding: '0.5rem 1.25rem',
  fontFamily: 'Golos Text',
  fontWeight: 600,
  fontSize: '1rem',
  lineHeight: '1.625rem',
  letterSpacing: 0,
  whiteSpace: 'nowrap',
  [MOBILE_MAX]: {
    backgroundColor: 'transparent',
    padding: '0.5rem 0',
    fontSize: '0.875rem',
    lineHeight: 'normal',
  },
};

// Path + description column: a horizontal pair on desktop (16px apart), stacked on
// mobile (2px apart) with the family switching Golos → Inter.
export const textColumnSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '1rem',
  minWidth: 0,
  [MOBILE_MAX]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.125rem',
  },
};

// A long value must not spill past the fixed-height, overflow-clipped row: it
// shrinks (min-width:0) and truncates with an ellipsis instead of vanishing.
// Shared by the path and description spans so the two stay in lockstep.
const ellipsisOverflow = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

export const pathSx: SxProps<Theme> = {
  fontFamily: 'Golos Text',
  fontWeight: 600,
  fontSize: '1.125rem',
  lineHeight: 'normal',
  letterSpacing: 0,
  whiteSpace: 'nowrap',
  ...ellipsisOverflow,
  [MOBILE_MAX]: {
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: '1.125rem',
  },
};

export const descriptionSx: SxProps<Theme> = {
  fontFamily: 'Golos Text',
  fontWeight: 500,
  fontSize: '0.9375rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  whiteSpace: 'nowrap',
  ...ellipsisOverflow,
  [MOBILE_MAX]: {
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: '1.125rem',
  },
};

// Right icon group: pushed to the trailing edge, 24px glyphs 10px apart desktop /
// 20px glyphs 8px apart mobile. A 2px bottom margin nudges the glyphs 1px above the
// row centre (Figma draws them a hair high): desktop top 13px, mobile top 15px.
export const iconGroupSx: SxProps<Theme> = {
  marginLeft: 'auto',
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.625rem',
  marginBottom: '2px',
  '& svg': { display: 'block', width: '1.5rem', height: '1.5rem' },
  [MOBILE_MAX]: {
    gap: '0.5rem',
    '& svg': { display: 'block', width: '1.25rem', height: '1.25rem' },
  },
};

// The chevron wrapper: colour comes from the container (rest ink, or accent when
// expanded); the flip is a rotate on this span so it animates smoothly.
export const chevronWrapSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  transition: 'transform 0.2s ease',
};
