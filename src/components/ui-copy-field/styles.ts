// Layout styling for UiCopyField (Figma Board A, state nodes 451:25827 rest /
// 451:25831 hover / 451:25835 active / 451:25839 disabled, all 226x36). The
// chip root owns every state flip through the `:hover`, `:active` and
// `[aria-disabled]` selectors below, so the child styles stay static. Figma
// returns byte-identical child geometry across all four states, so nothing
// here may move between them: the border is a constant 1px everywhere and
// only its colour swaps (the `UiFilterChip` no-jitter precedent).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hooks so the root drives both descendant ink swaps from its own
// state selectors, instead of threading state through the content tree. A
// single `currentColor` on the root cannot do this alone: hover/active tint
// the text darkPrimary but the glyph a DIFFERENT colour (primary), so text and
// glyph need independent hooks.
/** Reflects the post-copy confirmation latch onto the root for the chrome below. */
export const COPY_FIELD_COPIED_ATTR: string = 'data-copied';

export const COPY_FIELD_VALUE_CLASS: string = 'ui-copy-field__value';
export const COPY_FIELD_GLYPH_CLASS: string = 'ui-copy-field__glyph';

// The one raw colour literal in this module (recipe convention): the Figma
// hover drop shadow has no palette token behind it. Figma exports it as a
// `drop-shadow(0px 8px 7.5px rgba(49,59,67,0.14))` filter; on an opaque
// rounded rect a `box-shadow` is pixel-equivalent, doubling the blur per the
// shared conversion rule.
export const HOVER_SHADOW: string = '0 8px 15px rgba(49, 59, 67, 0.14)';

// Single-layer inset ring: the chip paints its own opaque fill, so a second
// white layer buys nothing, and inset keeps the ring inside the 4px radius. It
// is declared AFTER hover, active and disabled — state chrome and focus chrome
// are orthogonal channels and neither may substitute for the other.
export const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// Two selectors, one recipe (the `UiFilterChip` Amendment-A1 precedent). CSS
// keeps per-selector specificity inside a selector list, so the bare
// `:focus-visible` (0,2,0) covers the disabled chip while the second copy
// repeats the hover rule's own negation to reach hover's (0,3,0) — declared
// later, it therefore wins on a chip that is focused AND hovered, where the
// plain rule alone would lose its ring to HOVER_SHADOW.
export const FOCUS_SELECTORS: string =
  '&:focus-visible, &:focus-visible:not([aria-disabled="true"])';

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box. The chip border stays a REAL border, so the
// pill boundary survives that mode; HOVER_SHADOW is decoration and may vanish.
//
// The fallback MUST repeat FOCUS_SELECTORS rather than a bare `:focus-visible`.
// A media query adds no specificity, so a single-selector rule loses to the
// negated copy above that declares `outline: none` — and it loses on exactly
// the state a keyboard user is normally in. Repeating the list ties the
// specificity, and being declared later this wins.
const FORCED_COLORS_RING: object = {
  '@media (forced-colors: active)': {
    [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
  },
};

// The 226x36 master hugs its contents, so the width is `auto` — 226 is only
// what the sample string measures.
//
// Figma strokes INSIDE the frame: 14 + 170 + 8 + 20 + 14 = 226 across and
// 8 + 20 + 8 = 36 down, with no allowance for the stroke. CSS draws a border
// OUTSIDE the padding box, and `boxSizing: 'border-box'` cannot absorb it here —
// it only applies to a DECLARED length, and both axes are content-driven (the
// `minHeight` floor below is not a declared height). The constant 1px border was
// therefore purely additive, rendering 227.6x38. The border is subtracted from
// the padding instead: 7/13 + 1px reproduces the master's 8/14 inset, landing
// the box on 36 tall with `minHeight` now exactly binding.
//
// `rest` is borderless in Figma; keeping a constant `1px solid transparent`
// avoids a 1px reflow when hover/active paint the border (the no-jitter
// precedent), and it is what the padding compensation is measured against.
const COPY_FIELD_BASE: object = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  minHeight: '2.25rem',
  margin: 0,
  padding: '0.4375rem 0.8125rem',
  backgroundColor: palette.grey500.main,
  border: '1px solid transparent',
  borderRadius: '0.25rem',
  textAlign: 'left',
  font: 'inherit',
  cursor: 'pointer',
  appearance: 'none',
};

// Golos DemiBold 16/normal, the master's own metrics. Figma sets no tracking,
// so MUI's default body letter spacing is dropped explicitly (the
// `UiFilterChip` / radio-group precedent). Rest ink `grey250`; hover/active/
// disabled retint through the state selectors below.
export const copyFieldValueSx: SxProps<Theme> = {
  fontFamily: 'Golos Text',
  fontWeight: 600,
  fontSize: '1rem',
  lineHeight: 'normal',
  letterSpacing: 0,
  whiteSpace: 'nowrap',
  color: palette.grey250.main,
};

// The 20x20 glyph box. `flexShrink: 0` keeps it square when a long code string
// pushes the value. The colour arrives through `currentColor` on the shared
// `Glyph` wrapper, so the root's state selectors tint it independently of the
// value text.
export const copyFieldGlyphSx: SxProps<Theme> = {
  flexShrink: 0,
  display: 'flex',
  width: '1.25rem',
  height: '1.25rem',
  color: palette.grey250.main,
};

// Hover and active are both gated on the aria-disabled boundary, so a
// disabled chip keeps its rest fill. Active is hover minus the shadow (a
// flattened, pressed look) — the extraction confirms the glyph stays
// `primary` in both, with NO extra darken step the way `UiFilterChip` has.

// The confirmation latch reuses the ACTIVE paint rather than inventing a
// fifth chrome: after a successful copy the chip simply stays pressed-looking
// until COPIED_RESET_MS elapses, so the feedback is a state the design already
// draws. Selector-only, like every other state here.
function hoverActiveChrome(shadow: string | undefined): object {
  return {
    backgroundColor: palette.white.main,
    borderColor: palette.grey400.main,
    boxShadow: shadow,
    [`& .${COPY_FIELD_VALUE_CLASS}`]: { color: palette.darkPrimary.main },
    [`& .${COPY_FIELD_GLYPH_CLASS}`]: { color: palette.primary.main },
  };
}

// Figma paints the disabled column as the rest fill with grey300 ink on both
// segments — no border, no opacity dimming.
const DISABLED_CHROME: object = {
  cursor: 'default',
  [`& .${COPY_FIELD_VALUE_CLASS}`]: { color: palette.grey300.main },
  [`& .${COPY_FIELD_GLYPH_CLASS}`]: { color: palette.grey300.main },
};

// The chip's full state chrome, always present — unlike `UiFilterChip` there
// is no static/unwired branch, so this is unconditional. No transition
// anywhere — the design specifies none.
function copyFieldStateChrome(): object {
  return {
    '&:hover:not([aria-disabled="true"])': hoverActiveChrome(HOVER_SHADOW),
    '&:active:not([aria-disabled="true"])': hoverActiveChrome(undefined),
    [`&[${COPY_FIELD_COPIED_ATTR}="true"]:not([aria-disabled="true"])`]:
      hoverActiveChrome(undefined),
    '&[aria-disabled="true"]': DISABLED_CHROME,
    [FOCUS_SELECTORS]: { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

/** The chip root `sx`: static layout plus state chrome, consumer `sx` last. */
export function copyFieldSx(sx: SxProps<Theme> | undefined): SxProps<Theme> {
  const base: object = { ...COPY_FIELD_BASE, ...copyFieldStateChrome() };
  const extra: SxProps<Theme> = sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
