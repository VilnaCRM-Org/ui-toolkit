// Layout + state styling for UiSocialIconButton (Figma Board A, state rows
// rest `439:19285` / hover `439:19296` / active `439:19307` / disabled
// `439:19318`). Every chip in every row is byte-identical box-wise (40x40,
// fully round, no border, no shadow) — only the fill and the glyph ink change,
// so the state chrome lives entirely in this module and the content tree
// (`SocialGlyph`) never branches on state itself.
import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

/** The rest fill's tint strength: `primary` at 10% opacity. */
const REST_TINT: number = 0.1;

// Single-layer inset ring, the shared toolkit recipe (the ONLY non-Figma
// visual this component adds).
export const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// 40x40, fully round (any radius >= 20px on a 40px box renders a circle — the
// extraction's own note on the master's literal 36px). No shadow in any of the
// four states, so that property is not declared at all — nothing draws one.
// The border is different: Figma paints none either, but leaving it undeclared
// let the UA default through, because the `href`-less branch renders a native
// `<button>` — a dark ring around every chip in button mode, which the `<a>`
// branch never had. `border`/`appearance` are therefore reset explicitly, the
// `ui-clear-button` recipe for a bare native button (`appearance` kills the
// residual WebKit chrome that would otherwise distort the circular clip).
// `boxSizing: border-box` keeps the root exactly 40x40 even if a consumer's
// `sx` ever adds a border back via the `sx` merge.
const CHIP_BASE: object = {
  boxSizing: 'border-box',
  border: 'none',
  appearance: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  height: '2.5rem',
  padding: 0,
  borderRadius: '50%',
  cursor: 'pointer',
  textDecoration: 'none',
  backgroundColor: alpha(palette.primary.main, REST_TINT),
  color: palette.primary.main,
};

// Hover/active/disabled all invert the glyph ink to white over a solid fill;
// only the fill token changes between them. Declared after the base so each
// selector wins on its own state, and the focus ring last so it wins over all
// three (the `ui-filter-chip` precedent).
function stateChromeSx(): object {
  return {
    '&:hover:not([aria-disabled="true"])': {
      backgroundColor: palette.containedButtonHover.main,
      color: palette.white.main,
    },
    '&:active:not([aria-disabled="true"])': {
      backgroundColor: palette.containedButtonActive.main,
      color: palette.white.main,
    },
    '&[aria-disabled="true"]': {
      backgroundColor: palette.brandGray.main,
      color: palette.white.main,
      cursor: 'default',
    },
    '&:focus-visible': { outline: 'none', boxShadow: FOCUS_RING },
  };
}

export interface SocialIconButtonStyleConfig {
  sx: SxProps<Theme> | undefined;
}

/** The chip root `sx`: static layout, state chrome, consumer `sx` merged last. */
export function socialIconButtonSx(config: SocialIconButtonStyleConfig): SxProps<Theme> {
  const base: object = { ...CHIP_BASE, ...stateChromeSx() };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
