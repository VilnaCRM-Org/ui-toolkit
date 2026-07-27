// Layout styling for UiItemRow. One DOM tree serves both breakpoints — every rule
// below carries its mobile override inline under MOBILE_MAX, so the layout switch
// is CSS-only and the reading order never changes. The per-method colours arrive
// pre-resolved as a `RowRecipe` (see `recipe.ts`); this module only positions the
// pieces and threads the recipe onto the container.
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

import { crmBreakpointValues } from '../ui-breakpoints';

import type { RowRecipe } from './recipe';

const palette: Theme['palette'] = colorTheme.palette;

// Mobile breakpoint from the CRM scale (480px), matching the calendar control.
const MOBILE_MAX: string = `@media (max-width: ${crmBreakpointValues.sm}px)`;

// Stable class hooks so the container owns every colour/hover/expanded rule via
// descendant selectors, keeping the child element styles static and recipe-free.
export const BADGE_CLASS: string = 'ui-item-row__badge';
export const PATH_CLASS: string = 'ui-item-row__path';
export const DESC_CLASS: string = 'ui-item-row__description';
export const CHEVRON_CLASS: string = 'ui-item-row__chevron';

// --- Static element layout (colour injected by the container) -----------------

// The container box: 52px tall, 8px radius, 1px accent border, tint fill, overflow
// clipped. Badge is inset 4px inside the border on desktop. The right icon sits
// 19px from the outer edge (18px padding + 1px border). On mobile the padded box
// tightens (10px left / 16px right, +1px border) and the 16px container gap carries
// the badge→path separation the mobile badge's dropped side pads used to supply.
const CONTAINER_BASE: object = {
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
  [MOBILE_MAX]: {
    gap: '1rem',
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

export const pathSx: SxProps<Theme> = {
  fontFamily: 'Golos Text',
  fontWeight: 600,
  fontSize: '1.125rem',
  lineHeight: 'normal',
  letterSpacing: 0,
  whiteSpace: 'nowrap',
  // A long path must not spill past the fixed-height, overflow-clipped row: it
  // shrinks (min-width:0) and truncates with an ellipsis instead of vanishing.
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
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
  // Same overflow guard as the path: shrink + ellipsis rather than clip a long
  // description behind the row boundary.
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
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

// --- Container recipe assembly ------------------------------------------------

// The mobile badge is transparent, so `box-shadow` would paint a rounded-rectangle
// smudge behind the glyphs Figma does not have — Figma shadows the text itself.
// Re-express the recipe's box-shadow as a `drop-shadow` filter, which follows the
// glyph alpha. Derived mechanically from `recipe.badgeShadow` (no colour table).
function toDropShadow(shadow: string): string {
  return `drop-shadow(${shadow})`;
}

// Border + tint + the child ink/shadow rules driven by the recipe.
function containerColorSx(recipe: RowRecipe): object {
  return {
    borderColor: recipe.accent,
    backgroundColor: recipe.tint,
    [`& .${BADGE_CLASS}`]: {
      color: recipe.badgeInk,
      boxShadow: recipe.badgeShadow,
      [MOBILE_MAX]: { boxShadow: 'none', filter: toDropShadow(recipe.badgeShadow) },
    },
    [`& .${PATH_CLASS}`]: { color: recipe.pathInk },
    [`& .${DESC_CLASS}`]: { color: recipe.descInk },
    [`& .${CHEVRON_CLASS}`]: { color: recipe.chevronInk },
  };
}

// Button-only additions: pointer cursor, hover recipe (accent border/ink darken +
// row shadow), and the inset focus ring (inset so the overflow:hidden radius
// never clips it — a11y contract §3.5). Focus-visible is declared last so the ring
// wins over the hover shadow when a row is both hovered and focused.
function interactiveContainerSx(recipe: RowRecipe): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&:hover': {
      borderColor: recipe.accentHover,
      boxShadow: recipe.rowHoverShadow,
      [`& .${BADGE_CLASS}`]: { color: recipe.badgeInkHover },
      [`& .${PATH_CLASS}`]: { color: recipe.pathInkHover },
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `inset 0 0 0 2px ${palette.darkPrimary.main}`,
    },
  };
}

// Expanded state: chevron flips up and tints to the recipe accent (grey rows keep
// their brand-gray, since that is their accent).
function expandedChevronSx(recipe: RowRecipe): object {
  return {
    [`& .${CHEVRON_CLASS}`]: { color: recipe.accent, transform: 'rotate(180deg)' },
  };
}

export interface RowStyleConfig {
  recipe: RowRecipe;
  interactive: boolean;
  expanded: boolean;
  sx: SxProps<Theme> | undefined;
}

// The container `sx`: static layout + recipe colours + (button) hover/focus +
// (expanded) chevron flip, with the consumer `sx` merged last.
export function rowContainerSx(config: RowStyleConfig): SxProps<Theme> {
  const base: object = {
    ...CONTAINER_BASE,
    ...containerColorSx(config.recipe),
    ...(config.interactive ? interactiveContainerSx(config.recipe) : null),
    // The expanded chevron flip/tint is a disclosure affordance, so it is gated to
    // wired rows: a static row (no `onToggle`) exposes no `aria-expanded`, so it
    // must never show the expanded visual either, matching the "wired rows only"
    // contract in `types.ts`.
    ...(config.interactive && config.expanded ? expandedChevronSx(config.recipe) : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
