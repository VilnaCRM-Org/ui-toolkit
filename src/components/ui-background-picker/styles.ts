// UiBackgroundPicker layout (Figma 439:19673 rest / 439:19677 hover /
// 439:19689 open / 439:19715 disabled). One box grows downward when open, so
// chrome resolves from `{interactive, open, disabled}`, not CSS selectors —
// disabled paint must also hit the static no-ARIA branch (`ui-profile-select-card`).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Module's one raw colour (Figma's untokened "Landing shadow" tint): rest and
// open share it at 27px; hover is a distinct, tighter 15px.
export const CARD_SHADOW_TINT: string = 'rgba(49, 59, 67, 0.14)';
const REST_SHADOW: string = `0 8px 27px ${CARD_SHADOW_TINT}`;
const HOVER_SHADOW: string = `0 8px 15px ${CARD_SHADOW_TINT}`;

// Single-layer inset ring: the card's own opaque fill needs no white layer.
const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// Forced-colors drops box-shadow, so the ring becomes an inset outline.
const FORCED_COLORS_RING: object = {
  '@media (forced-colors: active)': {
    '&:focus-visible': { outline: '2px solid Highlight', outlineOffset: '-2px' },
  },
};

export interface PickerVisualState {
  interactive: boolean;
  open: boolean;
  disabled: boolean;
}

// 220px, 12px-radius, 2px box (border-box lands Figma's inside stroke on the
// outer edge; overflow hidden clips the last row's corner). Disabled turns
// the border transparent, not 0, so the box never shifts between states.
const CARD_BASE: object = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  width: '220px',
  margin: 0,
  border: '2px solid transparent',
  borderRadius: '12px',
  overflow: 'hidden',
};

// The four painted chromes, verbatim from the state table — no row hover.
const REST_CHROME: object = {
  backgroundColor: palette.white.main,
  borderColor: palette.brandGray.main,
  boxShadow: REST_SHADOW,
};
const OPEN_CHROME: object = {
  backgroundColor: palette.white.main,
  borderColor: palette.brandGray.main,
  boxShadow: REST_SHADOW,
};
const DISABLED_CHROME: object = {
  backgroundColor: palette.grey500.main,
  borderColor: 'transparent',
  boxShadow: 'none',
};

// Hover only exists closed and enabled — no combined open/disabled+hover.
function cardChrome(state: Readonly<PickerVisualState>): object {
  if (state.disabled) {
    return DISABLED_CHROME;
  }
  if (state.open) {
    return OPEN_CHROME;
  }
  return { ...REST_CHROME, ...restHoverRule(state.interactive) };
}

const HOVER_CHROME: object = { boxShadow: HOVER_SHADOW, borderColor: palette.grey400.main };

function restHoverRule(interactive: boolean): object {
  return interactive ? { '&:hover': HOVER_CHROME } : {};
}

function mergeSx(base: object, sx: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}

/** The card root `sx`: static box model, the resolved chrome, consumer `sx` last. */
export function cardRootSx(
  state: Readonly<PickerVisualState>,
  sx: SxProps<Theme> | undefined
): SxProps<Theme> {
  const base: object = { ...CARD_BASE, ...cardChrome(state) };
  return mergeSx(base, sx);
}

// Trigger row: padding 10/19 + the card's 2px border lands x=21/y=12, per Figma.
const TRIGGER_BASE: object = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5625rem',
  width: '100%',
  margin: 0,
  padding: '10px 19px',
  border: 0,
  borderRadius: 0,
  backgroundColor: 'transparent',
  textAlign: 'left',
  font: 'inherit',
};

/** The trigger `sx`: static layout, plus (wired) cursor and the focus ring. */
export function triggerButtonSx(state: Readonly<PickerVisualState>): SxProps<Theme> {
  if (!state.interactive) {
    return TRIGGER_BASE;
  }
  return {
    ...TRIGGER_BASE,
    cursor: state.disabled ? 'default' : 'pointer',
    '&:focus-visible': { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

const LABEL_TYPE: object = {
  fontFamily: 'Golos Text',
  fontWeight: 500,
  fontSize: '0.938rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
};

/** The trigger label ink: darkSecondary everywhere but the disabled paint. */
export function triggerLabelSx(disabled: boolean): SxProps<Theme> {
  return { ...LABEL_TYPE, color: disabled ? palette.grey300.main : palette.darkSecondary.main };
}

// 24x24 chevron footprint, glyph centred in the shared 20px box; grey300 ink.
export const chevronWrapSx: SxProps<Theme> = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  color: palette.grey300.main,
};

/** The `role="menu"` surface: no border of its own, the card supplies it. */
export const menuSx: SxProps<Theme> = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  margin: 0,
  padding: 0,
};

// Full-bleed 2px rule; 12px bottom margin is the divider-to-content gap.
export const dividerSx: SxProps<Theme> = {
  boxSizing: 'border-box',
  width: '100%',
  height: 0,
  margin: '0 0 12px',
  border: 0,
  borderTop: `2px solid ${palette.brandGray.main}`,
};

// Wraps a group's heading + rows (or just its rows) in a uniform 14px rhythm,
// deviating from Figma's inconsistent 49px/46px raw pitch (see `types.ts`).
export const sectionSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.875rem',
};

export const headingSx: SxProps<Theme> = { ...LABEL_TYPE, margin: 0, padding: '0 19px' };

// One row: 32px tall, 21px inset (2px border + 19px padding); focus ring last
// so it wins. No hover/selected paint exists, so this stays a flat constant.
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
