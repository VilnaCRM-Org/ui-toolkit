// Layout styling for UiFilterChip (Figma "Tags" master 397:19014, state nodes
// 439:19370 rest / 439:19372 hover / 439:19373 active / 439:19371 disabled). The
// chip root owns every state flip through the `:hover`, `:active` and
// `[aria-disabled]` selectors below, so the child styles stay static and the
// STATIC branch — which carries no ARIA and no interactive chrome at all — paints
// the rest presentation automatically. Figma returns byte-identical child
// geometry for all four states, so nothing here may move between them: the border
// is a constant 1px everywhere and only its colour swaps (the UiPagination
// no-jitter precedent).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hooks so the root drives every descendant ink swap from its own
// state selectors, instead of threading state through the content tree.
export const CHIP_LABEL_CLASS: string = 'ui-filter-chip__label';
export const CHIP_VALUE_CLASS: string = 'ui-filter-chip__value';
export const CHIP_GLYPH_CLASS: string = 'ui-filter-chip__glyph';

// The one raw colour literal in this module (3.1 recipe convention): the Figma
// hover/active drop shadow has no palette token behind it. Figma exports it as a
// `drop-shadow()` filter; on an opaque rounded rect a `box-shadow` is
// pixel-equivalent, far cheaper, and creates no containing block.
export const CHIP_SHADOW: string = '0 4px 4px rgba(26, 27, 36, 0.09)';

// Single-layer inset ring: the chip paints its own opaque fill, so a second white
// layer buys nothing, and inset keeps the ring inside the 4px radius. It is
// declared AFTER hover, active and disabled — state chrome and focus chrome are
// orthogonal channels and neither may substitute for the other.
export const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// Amendment A1, two selectors and one recipe. CSS keeps per-selector specificity
// inside a selector list, so the bare `:focus-visible` (0,2,0) covers the disabled
// chip while the second copy repeats the hover rule's own negation to reach
// hover's (0,3,0) — declared later, it therefore wins on a chip that is focused
// AND hovered, where the plain rule alone would lose its ring to CHIP_SHADOW.
export const FOCUS_SELECTORS: string =
  '&:focus-visible, &:focus-visible:not([aria-disabled="true"])';

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box. The chip border stays a REAL border, so the pill
// boundary survives that mode; CHIP_SHADOW is decoration and may vanish.
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

// The 256x30 master hugs its contents, so the width is `auto` — 256 is only what
// the sample string measures. Figma strokes INSIDE the frame while CSS draws the
// border outside the padding box, so the padding compensates: 1 + 7 + 212 + 8 + 20
// + 7 + 1 = 256 across and 1 + 4 + 20 + 4 + 1 = 30 down, which is why the children
// never move when the hover border appears. `flex-start` is faithful to the master
// (the 18px label row and the 20px glyph box both start at y=5, leaving the label
// optically 1px high); `center` would diverge from the Figma pixels.
const CHIP_BASE: object = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'flex-start',
  gap: '0.5rem',
  minHeight: '1.875rem',
  margin: 0,
  padding: '4px 7px',
  backgroundColor: palette.grey500.main,
  // 1.4.11 decoration-exempt (DEV-32): the boundary carries no information of its
  // own at rest, and it is present in every state so only its colour ever changes.
  border: '1px solid transparent',
  borderRadius: '0.25rem',
  textAlign: 'left',
  font: 'inherit',
};

/** The two text segments, 212x18 in the master: one line, never wrapped (A4). */
export const chipLabelRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  minWidth: 0,
  whiteSpace: 'nowrap',
};

// Inter Medium 14/18 in both segments; only the ink differs, which is why the
// label is two props rather than one string. Figma sets no tracking, so MUI's
// default body letter spacing is dropped explicitly (the radio-group precedent).
const SEGMENT_TYPE: object = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
};

/** The prefix segment ("Фільтр:"), grey250 in every state but disabled. */
export const chipLabelSx: SxProps<Theme> = { ...SEGMENT_TYPE, color: palette.grey250.main };

/** The filter value, darkPrimary in every state but disabled. */
export const chipValueSx: SxProps<Theme> = { ...SEGMENT_TYPE, color: palette.darkPrimary.main };

// The 20x20 glyph box. `overflow: clip` is the master's own rule (the 10x10 paint
// box sits centred inside it) and `flex-shrink: 0` keeps it square when a long
// filter value pushes the label row. The colour arrives through `currentColor` on
// the shared `Glyph` wrapper, so the root's state selectors tint it.
export const chipGlyphSx: SxProps<Theme> = {
  flexShrink: 0,
  display: 'flex',
  width: '1.25rem',
  height: '1.25rem',
  overflow: 'clip',
  color: palette.grey300.main,
};

// Figma hoists the disabled grey onto the label-row container; it is implemented
// as an explicit per-segment override instead, so nothing depends on inheritance
// and the static branch (which never has this attribute) cannot pick it up.
const DISABLED_CHROME: object = {
  cursor: 'default',
  [`& .${CHIP_LABEL_CLASS}`]: { color: palette.grey300.main },
  [`& .${CHIP_VALUE_CLASS}`]: { color: palette.grey300.main },
  [`& .${CHIP_GLYPH_CLASS}`]: { color: palette.grey300.main },
};

// Button-only additions. Hover and active are both gated on the aria-disabled
// boundary, so a disabled chip keeps its rest fill; active is hover plus one
// darker step on the border and the glyph (A2 — "active" is the PRESSED state,
// not an "applied filter" variant, which has no Figma source). The ring is
// declared after all three so it wins at equal specificity. No transition
// anywhere — the design specifies none.
function interactiveChipSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&:hover:not([aria-disabled="true"])': {
      backgroundColor: palette.white.main,
      borderColor: palette.grey400.main,
      boxShadow: CHIP_SHADOW,
      [`& .${CHIP_GLYPH_CLASS}`]: { color: palette.primary.main },
    },
    '&:active:not([aria-disabled="true"])': {
      backgroundColor: palette.white.main,
      borderColor: palette.grey300.main,
      boxShadow: CHIP_SHADOW,
      [`& .${CHIP_GLYPH_CLASS}`]: { color: palette.containedButtonActive.main },
    },
    '&[aria-disabled="true"]': DISABLED_CHROME,
    [FOCUS_SELECTORS]: { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

export interface FilterChipStyleConfig {
  interactive: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The chip root `sx`: static layout, plus (button) state chrome, consumer `sx` last. */
export function filterChipSx(config: FilterChipStyleConfig): SxProps<Theme> {
  const base: object = {
    ...CHIP_BASE,
    ...(config.interactive ? interactiveChipSx() : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
