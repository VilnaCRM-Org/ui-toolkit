// Layout styling for UiProfileSelectCard. The trigger owns every colour flip
// through the class hooks below, so the child styles stay static; the menu is a
// separate absolutely-positioned surface that reuses the same shadow token family.
// Geometry is identical in every state (the border is always 1px — transparent in
// disabled — so nothing jitters between rest, hover, open and disabled).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hooks so the trigger root owns the disabled/hover rules via
// descendant selectors instead of threading colours through the content tree.
export const NAME_CLASS: string = 'ui-profile-select-card__name';
export const AVATAR_CLASS: string = 'ui-profile-select-card__avatar';
export const CHEVRON_CLASS: string = 'ui-profile-select-card__chevron';

// The one raw colour literal in this module (3.1 recipe convention): the Figma
// "Landing shadow" effect (DROP_SHADOW #313B43 at 24/255 alpha) has no palette
// token behind it. Both surfaces are opaque, so it is a box-shadow rather than a
// `filter: drop-shadow` — the trigger uses it on hover, the menu permanently.
const LANDING_SHADOW: string = '0 8px 27px rgba(49, 59, 67, 0.14)';

// Single-layer inset ring (`UiItemRow` recipe, a11y contract §7.1/§7.2): this card
// paints its own white fill, so the task-card's second white layer is unnecessary,
// and inset keeps the ring inside the 8px radius when a consumer clips the card.
const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box (a11y contract §7.3).
const FORCED_COLORS_RING: object = {
  '@media (forced-colors: active)': {
    '&:focus-visible': { outline: '2px solid Highlight', outlineOffset: '-2px' },
  },
};

// The positioning wrapper: `relative` so the menu can hang off it, fluid width so
// the consumer sizes the card (the Figma master is 225px). No role, no ARIA.
const WRAPPER_BASE: object = {
  position: 'relative',
  width: '100%',
};

// The trigger box, 225×48 in the master and fluid here. Figma strokes INSIDE the
// frame while CSS draws the border outside the padding box, so the padding
// compensates: 7px left + 1px border puts the avatar at outer x=8, and 12px right
// + 1px border puts the 20px chevron box at outer x=192 (its right edge 13px in).
// Vertically the padding is asymmetric (6px top / 8px bottom) on purpose: it
// leaves a 32px content box, which centres the 32px avatar at outer y=7 and the
// 18px name line at outer y=14 — i.e. the 1px-above-centre offset the Figma
// masters draw (the 3.1 gotcha). `minHeight`, never `height`, so the name may wrap
// at 200% zoom without shearing (SC 1.4.4/1.4.10, §10.3).
const TRIGGER_BASE: object = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: '0.625rem',
  width: '100%',
  minHeight: '3rem',
  margin: 0,
  padding: '0.375rem 0.75rem 0.5rem 0.4375rem',
  backgroundColor: palette.white.main,
  // 1.4.11 decoration-exempt: the boundary carries no information of its own (the
  // card is legible without it); revisit if it ever becomes a state indicator.
  border: `1px solid ${palette.grey400.main}`,
  borderRadius: '0.5rem',
  textAlign: 'left',
  font: 'inherit',
};

// The profile photo: a real 32px circle, clipped to the radius.
export const avatarSx: SxProps<Theme> = {
  flexShrink: 0,
  display: 'block',
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  overflow: 'hidden',
  objectFit: 'cover',
};

// Inter Medium 14/18. Never clamped, never ellipsised, never overflow-hidden:
// `anywhere` is what keeps a single unbroken name from spilling out of the card.
export const nameSx: SxProps<Theme> = {
  minWidth: 0,
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  overflowWrap: 'anywhere',
  color: palette.darkPrimary.main,
};

// The chevron sits hard against the trailing edge. The 2px top margin pushes it
// back down to the exact vertical centre of the 48px box (outer y=14) after the
// asymmetric trigger padding lifted the flex line 1px — Figma centres the chevron
// but not the avatar/name (3.1's `marginBottom: 2px` trick, mirrored).
export const chevronWrapSx: SxProps<Theme> = {
  marginLeft: 'auto',
  marginTop: '0.125rem',
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  color: palette.grey300.main,
  '& svg': { display: 'block' },
};

// Disabled paint (a11y contract §6, design spec disabled row). Driven by a model
// flag rather than the `[aria-disabled]` selector so the STATIC branch — which
// carries no ARIA at all (§6.2) — shows the same treatment. The border stays 1px
// and merely turns transparent: the background is painted under it by the default
// `background-clip`, so this matches Figma's borderless disabled fill with zero
// geometry change.
function disabledTriggerSx(): object {
  return {
    backgroundColor: palette.brandGray.main,
    borderColor: 'transparent',
    [`& .${NAME_CLASS}`]: { color: palette.grey300.main },
    [`& .${AVATAR_CLASS}`]: { opacity: 0.5 },
  };
}

// Button-only additions. Hover is gated on the aria-disabled boundary (§6.1) AND
// on `aria-expanded="false"`: the Figma open state keeps the plain rest chrome, so
// an open card must not retain the hover border or shadow while the pointer rests
// on it. `:focus-visible` is declared LAST so the ring wins at equal specificity.
// No transition anywhere — the design specifies none (§9.1).
function interactiveTriggerSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&[aria-disabled="true"]': { cursor: 'default' },
    '&:hover:not([aria-disabled="true"]):not([aria-expanded="true"])': {
      borderColor: palette.grey300.main,
      boxShadow: LANDING_SHADOW,
    },
    '&:focus-visible': { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

// The popup surface: full card width, 11px below the trigger, clipped to its
// radius so the squared full-bleed row hover fill stops at the rounded corners.
// The 1px border is a real border (not a shadow) so the popup boundary survives
// forced-colors mode (§7.3). `zIndex` keeps it above later siblings in the
// consumer's flow — the menu is not portalled (§2.4), so it must win locally.
// The two edge margins are the inside-stroke compensation again (the 3.2 gotcha,
// mirrored from the trigger padding above): Figma strokes INSIDE the 136px
// master, so its boundary OVERLAPS the first row's top pixel and the last row's
// bottom one, while a CSS border stacks outside both and would inflate the popup
// to 138px with rows at 1/47/93. Sliding the two edge rows 1px back under the
// border restores the master exactly — (44-1) + 2 + 44 + 2 + (44-1) = 134 plus
// the 2px border = 136 outer, rows at 0/46/92 — and `overflow: hidden` clips the
// pixel each one now hides beneath. Margins rather than a shorter row: the rows
// keep `minHeight: 44px` (SC 2.5.8, §10.2) and must still grow when a label
// wraps (SC 1.4.4/1.4.10, §10.3), so the fix may not touch their box height.
const MENU_BASE: object = {
  boxSizing: 'border-box',
  position: 'absolute',
  top: 'calc(100% + 0.6875rem)',
  left: 0,
  right: 0,
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.125rem',
  backgroundColor: palette.white.main,
  border: `1px solid ${palette.grey400.main}`,
  borderRadius: '0.5rem',
  overflow: 'hidden',
  boxShadow: LANDING_SHADOW,
  // The menuitem buttons are direct children, so these select the edge rows.
  '& > :first-of-type': { marginTop: '-1px' },
  '& > :last-of-type': { marginBottom: '-1px' },
};

// One command row: full inner width, 44px minimum height (SC 2.5.8, §10.2), text
// at outer x=20 (19px padding inside the 1px menu border). The hover fill is
// decoration only and is NEVER the focus indicator (§7.2), so the inset ring is
// declared after it and paints on top on a hovered, focused row alike.
export const menuItemSx: SxProps<Theme> = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  minHeight: '2.75rem',
  margin: 0,
  padding: '0.375rem 1.1875rem',
  appearance: 'none',
  border: 0,
  borderRadius: 0,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  textAlign: 'left',
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  overflowWrap: 'anywhere',
  color: palette.darkPrimary.main,
  // 1.4.11 decoration-exempt: a 1.09:1 tint behind text that already passes.
  '&:hover': { backgroundColor: palette.backgroundGrey200.main },
  '&:focus-visible': { outline: 'none', boxShadow: FOCUS_RING },
  ...FORCED_COLORS_RING,
};

// Consumer `sx` always lands last, in the array form MUI merges left-to-right.
function mergeSx(base: object, sx: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}

/** The positioning wrapper `sx`, with the consumer `sx` merged last. */
export function profileWrapperSx(sx: SxProps<Theme> | undefined): SxProps<Theme> {
  return mergeSx(WRAPPER_BASE, sx);
}

/** The popup `sx`, with the consumer `menuSx` merged last. */
export function profileMenuSx(sx: SxProps<Theme> | undefined): SxProps<Theme> {
  return mergeSx(MENU_BASE, sx);
}

export interface ProfileTriggerStyleConfig {
  interactive: boolean;
  disabled: boolean;
}

/** The trigger `sx`: static layout, the disabled paint, then button-only chrome. */
export function profileTriggerSx(config: ProfileTriggerStyleConfig): SxProps<Theme> {
  return {
    ...TRIGGER_BASE,
    ...(config.disabled ? disabledTriggerSx() : null),
    ...(config.interactive ? interactiveTriggerSx() : null),
  };
}
