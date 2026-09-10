// Styling for UiClearButton (Figma Board A, state nodes 451:25793 rest /
// 451:25797 hover / 451:25801 active / 451:25805 disabled). The design paints NO
// fill, border, radius, shadow or padding in any state — the row hugs its
// content and only the label/glyph ink ever changes, so this module is far
// smaller than the pill-shaped precedents. The root drives every ink swap
// through its own state selectors; the child styles stay static.
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hook so the root can retint the glyph independently of the label
// (rest is the one state where their inks diverge).
export const GLYPH_CLASS: string = 'ui-clear-button__glyph';

// The toolkit's shared inset ring — the only non-Figma visual this component
// carries, since the design ships no focus indicator of its own.
export const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;
// Amendment A1, two selectors and one recipe. CSS keeps per-selector specificity
// inside a selector list, so the bare `:focus-visible` covers the disabled
// control, while the second copy repeats the hover rule's own negation to reach
// hover's specificity — declared later, it therefore wins on a control that is
// focused AND hovered, where the plain rule alone would lose its ring to the
// hover shadow.
export const FOCUS_SELECTORS: string =
  '&:focus-visible, &:focus-visible:not([aria-disabled="true"])';

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box. The fallback MUST repeat FOCUS_SELECTORS rather
// than a bare `:focus-visible`: a media query adds no specificity, so a
// single-selector rule loses to the negated copy above that declares
// `outline: none` — and loses on exactly the states a keyboard user is in.
const FORCED_COLORS_RING: object = {
  '@media (forced-colors: active)': {
    [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
  },
};

// Plain flex row, no padding, no border, no radius, no shadow, no fixed width:
// 18px glyph + 3px gap + content-driven label. `boxSizing: 'border-box'` is
// still set for parity with the repo's bordered-root convention even though no
// state here ever adds a border.
const CLEAR_BUTTON_BASE: object = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.1875rem',
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  textAlign: 'left',
  font: 'inherit',
  // The rest ink (grey250); the label inherits it via `currentColor` and the
  // glyph is retinted explicitly below because rest is the one state where the
  // two inks diverge.
  color: palette.grey250.main,
};

/** Inter Medium 14/18, tracking killed, never wraps — the label segment. */
export const clearButtonLabelSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  color: 'inherit',
  whiteSpace: 'nowrap',
};

// The 18x18 glyph box. Rest is the only state whose glyph ink diverges from the
// label (grey300 vs grey250), so this is the one place with an explicit colour
// rather than `currentColor`; hover/active/disabled retint it through the class
// hook below, back in step with the label.
export const clearButtonGlyphSx: SxProps<Theme> = {
  flexShrink: 0,
  display: 'flex',
  width: '1.125rem',
  height: '1.125rem',
  color: palette.grey300.main,
};

// Button-only additions: cursor, the three ink states and the shared focus ring.
// Hover and active are gated on the aria-disabled boundary so a disabled button
// keeps its rest ink instead of flashing through the interactive ramp.
function interactiveClearButtonSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&:hover:not([aria-disabled="true"])': {
      color: palette.darkPrimary.main,
      [`& .${GLYPH_CLASS}`]: { color: palette.darkPrimary.main },
    },
    '&:active:not([aria-disabled="true"])': {
      color: palette.darkSecondary.main,
      [`& .${GLYPH_CLASS}`]: { color: palette.darkSecondary.main },
    },
    '&[aria-disabled="true"]': {
      cursor: 'default',
      color: palette.grey300.main,
      [`& .${GLYPH_CLASS}`]: { color: palette.grey300.main },
    },
    [FOCUS_SELECTORS]: { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

export interface ClearButtonStyleConfig {
  interactive: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The button root `sx`: static layout, plus (button) state ink, consumer `sx` last. */
export function clearButtonSx(config: ClearButtonStyleConfig): SxProps<Theme> {
  const base: object = {
    ...CLEAR_BUTTON_BASE,
    ...(config.interactive ? interactiveClearButtonSx() : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
