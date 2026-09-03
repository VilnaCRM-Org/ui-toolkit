// Layout styling for UiChevronButton (Figma nodes 451:25765 rest / 451:25768
// hover / 451:25771 active / 451:25774 disabled, Board A y=1622). The circular
// 30px root owns every state flip through the `:hover`, `:active` and
// `[aria-disabled]` selectors below, so the glyph stays static and the STATIC
// branch — which carries no ARIA at all (the `UiActionIconBar` unwired rule) —
// automatically paints the rest presentation. Geometry is frozen across all
// four states: the border stays 1px everywhere (transparent on disabled) so the
// box never shifts by a pixel, and the glyph ink stays grey300 in every state,
// including disabled.
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// The one raw colour literal in this module: the Figma hover drop shadow (node
// 451:25768) has no palette token behind it.
export const CHEVRON_HOVER_SHADOW_TINT: string = 'rgba(0, 0, 0, 0.25)';

// Single-layer inset ring (repo convention, `00-shared.md`): the button paints
// its own opaque fill, so a second white layer buys nothing.
export const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// The 30x30 circle (radius 20px ⇒ a full pill on a 30px box). Figma strokes
// inside the frame, so `boxSizing: 'border-box'` keeps the outer box exact.
const CHEVRON_BASE: object = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.875rem',
  height: '1.875rem',
  padding: 0,
  margin: 0,
  border: `1px solid ${palette.brandGray.main}`,
  borderRadius: '50%',
  backgroundColor: palette.white.main,
  color: palette.grey300.main,
};

// Button-only additions. Hover and active are both gated on the aria-disabled
// boundary, so a disabled button keeps its rest fill. No transition anywhere —
// the design specifies none.
function interactiveChevronSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&:hover:not([aria-disabled="true"])': {
      borderColor: palette.grey300.main,
      boxShadow: `0 4px 13px 0 ${CHEVRON_HOVER_SHADOW_TINT}`,
    },
    '&:active:not([aria-disabled="true"])': { borderColor: palette.grey300.main },
    '&[aria-disabled="true"]': {
      backgroundColor: palette.brandGray.main,
      borderColor: 'transparent',
      cursor: 'default',
    },
    '&:focus-visible': { outline: 'none', boxShadow: FOCUS_RING },
  };
}

export interface ChevronButtonStyleConfig {
  interactive: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The root `sx`: static layout, plus (button) state chrome, consumer `sx` last. */
export function chevronButtonSx(config: ChevronButtonStyleConfig): SxProps<Theme> {
  const base: object = {
    ...CHEVRON_BASE,
    ...(config.interactive ? interactiveChevronSx() : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
