// Layout styling for UiAddButton (Figma state nodes 451:25777 rest / 451:25781
// hover / 451:25785 active / 451:25789 disabled). Figma returns byte-identical
// child geometry across all four states — nothing moves — so the root owns
// every state flip through the `:hover`, `:active` and `[aria-disabled]`
// selectors below and every state keeps a constant 1px border, only its
// colour (or opacity) ever changing (the `ui-filter-chip` no-jitter precedent).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hooks so the root drives the label and glyph ink swap from its
// own state selectors, instead of threading state through the content tree.
export const ADD_BUTTON_LABEL_CLASS: string = 'ui-add-button__label';
export const ADD_BUTTON_GLYPH_CLASS: string = 'ui-add-button__glyph';

// The one raw colour literal in this module: the Figma hover/active drop
// shadow has no palette token behind it. Figma exports it as a
// `drop-shadow(0px 8px 7.5px …)` filter; on an opaque rounded rect the
// pixel-equivalent `box-shadow` doubles the blur, per the shared geometry rule.
export const ADD_BUTTON_SHADOW: string = '0 8px 15px rgba(49, 59, 67, 0.14)';

// Single-layer inset ring: the button paints its own opaque fill, so a second
// white layer buys nothing. Declared after hover, active and disabled — state
// chrome and focus chrome are orthogonal channels.
export const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// The 178x34 master hugs its contents, so width is `auto` — 178 is only what
// the sample string measures.
//
// Figma strokes INSIDE the frame: its own arithmetic is 12 + 128 + 8 + 18 + 12
// = 178 across and 8 + 18 + 8 = 34 down, leaving no room for the 1px stroke. CSS
// draws a border OUTSIDE the padding box, and `boxSizing` cannot absorb it here
// because both axes are `auto` — border-box only bites when a length is
// declared. So the border is subtracted from the padding instead: 7/11 + the 1px
// border reproduces the master's 8/12 inset exactly, landing
// 1+7+18+7+1 = 34 and 1+11+128+8+18+11+1 = 178. Same compensation
// `ui-filter-chip`, `ui-profile-select-card`, `ui-task-card` and
// `ui-integration-card` already apply.
//
// Disabled drops the border colour but keeps a transparent 1px, so nothing
// shifts between states.
const ADD_BUTTON_BASE: object = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  // Label pins left, glyph pins right — the master's own structure (text at the
  // 12px left inset, plus at the 12px right inset). At the natural hugging width
  // this is indistinguishable from `center` because there is no free space; it
  // only differs when a consumer gives the button a width, and there `center`
  // floated both children inward and broke the 12px insets. The Figma-parity
  // showcase pins each tile to the master's 178px, which is exactly that case:
  // our Ukrainian label is 8px shorter than the master's Russian one, so the
  // slack was being split 4px onto each side.
  justifyContent: 'space-between',
  gap: '0.5rem',
  margin: 0,
  padding: '7px 11px',
  backgroundColor: palette.white.main,
  border: `1px solid ${palette.brandGray.main}`,
  borderRadius: '0.25rem',
  textAlign: 'left',
  font: 'inherit',
};

/** Inter Medium 14/18, tracking killed, one un-wrapped line (the label). */
export const addButtonLabelSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  whiteSpace: 'nowrap',
  color: palette.grey250.main,
};

/** The 18x18 glyph box; primary ink at rest, retinted through the class hook. */
export const addButtonGlyphSx: SxProps<Theme> = {
  display: 'flex',
  flexShrink: 0,
  width: '1.125rem',
  height: '1.125rem',
  color: palette.primary.main,
};

// Disabled fills the pill and drops the border entirely (kept transparent
// rather than removed, so geometry never shifts) and is the only state that
// recolours both the label and the glyph.
const DISABLED_CHROME: object = {
  cursor: 'default',
  backgroundColor: palette.brandGray.main,
  borderColor: 'transparent',
  [`& .${ADD_BUTTON_LABEL_CLASS}`]: { color: palette.grey300.main },
  [`& .${ADD_BUTTON_GLYPH_CLASS}`]: { color: palette.grey300.main },
};

// Button-only additions. Hover and active differ ONLY by border colour — the
// design's own quirk, reported verbatim: active's border (brandGray) is
// LIGHTER than hover's (grey400), equal to rest. Both carry the identical
// elevated shadow and neither retints the glyph, which stays primary through
// rest/hover/active. No transition anywhere — the design specifies none.
function interactiveAddButtonSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&:hover:not([aria-disabled="true"])': {
      borderColor: palette.grey400.main,
      boxShadow: ADD_BUTTON_SHADOW,
    },
    '&:active:not([aria-disabled="true"])': {
      borderColor: palette.brandGray.main,
      boxShadow: ADD_BUTTON_SHADOW,
    },
    '&[aria-disabled="true"]': DISABLED_CHROME,
    '&:focus-visible': { outline: 'none', boxShadow: FOCUS_RING },
  };
}

export interface AddButtonStyleConfig {
  interactive: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The button root `sx`: static layout, plus (button) state chrome, consumer `sx` last. */
export function addButtonSx(config: AddButtonStyleConfig): SxProps<Theme> {
  const base: object = {
    ...ADD_BUTTON_BASE,
    ...(config.interactive ? interactiveAddButtonSx() : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
