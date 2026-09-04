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

import { helperTextSx } from '../field-controls';

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

// The dark Amendment-A1 inset ring used to ship here IN ADDITION to the Figma
// chrome, because the active master (72:5174) draws no ring and a caret alone is
// not a 3:1 focus indicator. REMOVED by owner ruling (2026-08-26, recorded at
// gate review): the focused cell now shows exactly the Figma chrome — the
// elevation shadow plus the native pre-digit caret — and the accepted WCAG
// 2.4.7/2.4.13 regression is documented, not an oversight. Do not silently
// reinstate the ring in a parity pass; the forced-colors outline stays.

// The Figma active caret (72:5175) sits BEFORE the ghost digit, not on it. The
// caret stays the browser's own (owner ruling 2026-08-26: no painted caret);
// what moves is the PLACEHOLDER: while the cell is focused and still empty, the
// text lane left-aligns at 23px so the native caret lands on the Figma caret x
// (24), and the ghost is indented 4px past it — digits are tabular 11px at
// Golos Text 700 22, putting the ghost at 28..39 against the master's 29..40.
// Once a digit is typed `:placeholder-shown` stops matching and the value
// renders centred exactly as before (focus advances on entry anyway). A filled
// cell keeps select-on-focus, so it shows the selection highlight, never a
// mid-glyph caret.
// Both halves are gated on the aria-disabled boundary: a disabled cell hides the
// caret (`caretColor: transparent`), so shifting its ghost left to make room for
// one would move the digit for nothing. A disabled cell stays centred.
const EMPTY_FOCUS_CARET: object = {
  '&:focus:placeholder-shown:not([aria-disabled="true"])': {
    textAlign: 'left',
    paddingLeft: '23px',
  },
  '&:focus:not([aria-disabled="true"])::placeholder': { textIndent: '4px' },
};

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
 * The caret is the browser's own text cursor tinted `primary`; while the cell
 * is focused and empty, `EMPTY_FOCUS_CARET` places it before the ghost digit
 * exactly as the active master lays the pair out. Native is 1px where Figma
 * draws 2px: a documented parity deviation, not an oversight.
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
  // With the dark ring removed, the elevation shadow deliberately paints on a
  // focused DISABLED cell too (gate-review condition): a focusable read-only
  // cell must keep at least one visible focus cue.
  '&:focus': { boxShadow: PIN_FOCUS_SHADOW },
  ...EMPTY_FOCUS_CARET,
  // Declared after hover, disabled and active so it wins at equal specificity.
  // `outline: none` lives ONLY here; the forced-colors block below restores an
  // outline for the one mode that discards box-shadow and backgrounds.
  [FOCUS_SELECTORS]: { outline: 'none', boxShadow: PIN_FOCUS_SHADOW },
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

// The shared field-controls helper-text recipe, pulled in as a descendant rule
// because this control mounts no `ThemeProvider` of its own — the
// `ui-file-upload-input` precedent. Without it the message falls back to MUI's
// Roboto 12/19.92 at letterSpacing 0.4 and, on error, MUI's own `#D32F2F`
// instead of the palette `error.main` `#DC3939`. The error message is this
// field's non-colour signal, so it has to carry the Figma treatment, not a
// framework default — and it has to keep carrying it when the shared recipe
// changes, which is why the values are imported rather than re-declared.
const ROOT_BASE: object = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  ...helperTextSx,
};

/** The field root `sx`: the group column plus the consumer's `sx`, merged last. */
export function pinInputSx(sx: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = sx ?? {};
  return [ROOT_BASE, ...(Array.isArray(extra) ? extra : [extra])];
}
