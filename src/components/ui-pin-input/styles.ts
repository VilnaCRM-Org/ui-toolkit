// Layout styling for UiPinInput (Figma "2FA item", component-set master 72:5172,
// state nodes 439:19615 rest / 439:19617 hover / 439:19619 active / 439:19623
// disabled). Every state flip is an attribute selector on the cell itself, so no
// React-conditional style object exists and a state the DOM cannot expose is
// unpaintable by construction. Geometry never moves between states: the border is
// a constant 1px everywhere and only its colour swaps (the UiPagination no-jitter
// precedent), which is also why the disabled cell keeps a border painted in its
// own fill colour instead of deleting the stroke the way Figma does.
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hook so the showcase board (and a consumer) can force a cell's
// pointer/focus chrome from the group root instead of threading state down.
export const PIN_CELL_CLASS: string = 'ui-pin-input__cell';

// The one raw colour literal in this module (3.1 recipe convention): the Figma
// active-state drop shadow has no palette token behind it. Independently verified
// by bleed — the active node renders 88x110 against the 64x86 box (12px left and
// right, 5px top, 19px bottom = blur 12 offset by y 7). It is a DIFFERENT shadow
// from `ui-item-row`'s Landing shadow and from the filter chip's; do not merge
// them. Rest, hover and disabled all render at exactly 64x86, so no other state
// carries a shadow.
export const PIN_FOCUS_SHADOW: string = '0 7px 12px rgba(76, 90, 126, 0.15)';

// Single-layer inset ring (the 3.3/3.4 recipe): the cell paints its own white
// fill, and inset keeps the ring inside the 12px radius. Figma provides no focus
// spec at all — its "Active" column is the FOCUSED cell (caret + shadow) — and a
// text caret alone is not a 3:1 focus indicator, so the ring ships in addition to
// the Figma chrome rather than instead of it.
const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// The focused cell keeps BOTH channels at once: the Figma active shadow and the
// Amendment-A1 ring. They travel in one `box-shadow` list because the ring rule
// replaces the property wholesale.
const FOCUS_SHADOWS: string = `${FOCUS_RING}, ${PIN_FOCUS_SHADOW}`;

// Two selectors, one recipe (Amendment A1). CSS keeps per-selector specificity
// inside a selector list, so the bare `:focus-visible` (0,2,0) still covers a
// disabled cell — which keeps its ring, because focus chrome is never suppressed
// by state chrome — while the second copy repeats the hover rule's own negation
// to tie hover's (0,3,0) and, declared later, win on a cell that is focused AND
// hovered. The error rule is an attribute selector at the same level as hover,
// hence the negation list is the disabled one only.
const FOCUS_SELECTORS: string = '&:focus-visible, &:focus-visible:not([aria-disabled="true"])';

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box. The cell border stays a REAL border, so the cell
// boundary survives that mode; the active shadow is decoration and may vanish.
//
// The fallback MUST repeat FOCUS_SELECTORS rather than a bare `:focus-visible`.
// A media query adds no specificity, so a single-selector rule loses to the
// negated copy above that declares `outline: none` — and it loses on exactly the
// states a keyboard user is normally in. Repeating the list ties the specificity,
// and being declared later this wins.
const FORCED_COLORS_RING: object = {
  '@media (forced-colors: active)': {
    [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
  },
};

/**
 * One digit cell — the whole 64x86 Figma master. `minHeight` rather than `height`
 * so the box may grow at 200% zoom instead of shearing the glyph (SC 1.4.4), and
 * the digit is optically centred by flex-free `textAlign`/`lineHeight` rather
 * than by Figma's `calc(50% - 0.5px)` sub-pixel nudges, which are rounding
 * artefacts and not a layout instruction.
 *
 * Typography is identical in all four masters: Golos Text 700, 22/26, no
 * tracking. The design paints the same grey "0" in every state, so it reads as a
 * PLACEHOLDER: grey400 while the cell is empty, darkPrimary once a digit is
 * entered (matching every other text input in the kit).
 *
 * The caret is the browser's own text cursor tinted `primary` — Figma draws a
 * 2x26 blue bar, and painting a decorative span on top of the native caret would
 * double-draw it. The native caret is 1px where Figma draws 2px: a documented
 * parity deviation, not an oversight.
 */
export const pinCellSx: SxProps<Theme> = {
  boxSizing: 'border-box',
  flexShrink: 0,
  width: '4rem',
  minHeight: '5.375rem',
  margin: 0,
  padding: 0,
  textAlign: 'center',
  fontFamily: "'Golos Text'",
  fontWeight: 700,
  fontSize: '1.375rem',
  lineHeight: '1.625rem',
  letterSpacing: 0,
  color: palette.darkPrimary.main,
  backgroundColor: palette.white.main,
  // 1.4.11 decoration-exempt (DEV-30) at rest: the boundary carries no information
  // of its own. Always 1px, colour-only swaps — see the module header.
  border: `1px solid ${palette.brandGray.main}`,
  borderRadius: '0.75rem',
  caretColor: palette.primary.main,
  appearance: 'none',
  cursor: 'text',
  '&::placeholder': { color: palette.grey400.main, opacity: 1 },
  '&:hover:not([aria-disabled="true"])': { borderColor: palette.grey400.main },
  // Figma genuinely deletes the stroke here. Porting that literally would shift
  // the content box by 1px per edge, so the border is kept and repainted in the
  // disabled fill — pixel-identical to a borderless #EAECEE cell (verified by
  // histogram: the disabled master contains only #EAECEE and the #D0D4D8 digit).
  '&[aria-disabled="true"]': {
    backgroundColor: palette.grey500.main,
    borderColor: palette.grey500.main,
    caretColor: 'transparent',
    cursor: 'default',
  },
  // Board A's "Active" column IS the focused cell; there is no pressed state.
  // Gated on the disabled boundary so a focusable read-only cell does not claim
  // the active chrome.
  '&:focus:not([aria-disabled="true"])': { boxShadow: PIN_FOCUS_SHADOW },
  // Declared after hover, disabled and active, so the ring wins at equal
  // specificity. `outline: none` lives ONLY here.
  [FOCUS_SELECTORS]: { outline: 'none', boxShadow: FOCUS_SHADOWS },
  ...FORCED_COLORS_RING,
};

/**
 * The `role="group"` row. The 12px gap is a RULING, not a Figma measurement (the
 * master is one cell and specifies no group), matching the icon-bar rhythm; it is
 * deliberately not a prop, because no variant axis exists behind it.
 */
export const pinGroupSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.75rem',
};

// The shared field-controls helper-text recipe (`field-controls/theme.ts`,
// `MuiFormHelperText`), inlined here as a descendant rule because this control
// mounts no `ThemeProvider` of its own — the `ui-file-upload-input` precedent.
// Without it the message falls back to MUI's Roboto 12/19.92 at letterSpacing
// 0.4 and, on error, MUI's own `#D32F2F` instead of the palette `error.main`
// `#DC3939`. The error message is this field's non-colour signal, so it has to
// carry the Figma treatment, not a framework default.
const HELPER_TEXT_SX: object = {
  '& .MuiFormHelperText-root': {
    margin: '0.25rem 0 0 0',
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    // Figma "14 medium" tracks at 0; without this the helper text inherits MUI's
    // default caption letterSpacing (0.03333em) and reads looser than the design.
    letterSpacing: 0,
    color: palette.grey250.main,
    '&.Mui-error': { color: palette.error.main },
  },
};

const ROOT_BASE: object = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  ...HELPER_TEXT_SX,
};

/** The field root `sx`: the group column plus the consumer's `sx`, merged last. */
export function pinInputSx(sx: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = sx ?? {};
  return [ROOT_BASE, ...(Array.isArray(extra) ? extra : [extra])];
}
