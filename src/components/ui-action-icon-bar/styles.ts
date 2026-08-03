// Layout styling for UiActionIconBar (Figma Board A row y = 1412-1422, state
// columns Rest/Hover/Active/Disabled at x = 56/348/640/932). Every state flip is
// owned by the action button root through the `[aria-disabled]` / `:hover` /
// `:active` / `:focus-visible` selectors below, so the glyph and the backdrop
// stay static and the STATIC branch — which carries no ARIA at all (a11y
// contract S2) — automatically paints the rest presentation.
//
// Geometry is frozen across all four columns: the slot is always 1.5rem square,
// the glyph bbox and stroke weight never move, opacity is always 1, and nothing
// but the stroke colour changes — plus the one authored piece of button chrome
// on the whole board, the danger lane's pressed backdrop.
import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';

import type { ActionIconName } from './types';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hook so the button root paints the danger backdrop through a
// descendant selector instead of threading the pointer state through the tree.
export const BACKDROP_CLASS: string = 'ui-action-icon-bar__backdrop';

/** The ink lanes the six icons fall into; the lane picks the whole colour ramp. */
export type ActionLane = 'neutral' | 'toggle' | 'danger';

const LANE_BY_ICON: Readonly<Record<ActionIconName, ActionLane>> = {
  'x-close': 'neutral',
  'dots-horizontal': 'neutral',
  'dots-vertical': 'neutral',
  settings: 'neutral',
  eye: 'toggle',
  trash: 'danger',
};

interface InkRamp {
  rest: string;
  hover: string;
  active: string;
}

// The per-lane stroke ramps, read straight off the four Figma columns. Two
// deliberate anomalies live in the `toggle` row: the eye hovers to grey200 and
// not primary (a visibility toggle is a neutral affordance, not a primary
// action), and its Figma "active" cell is the PRESSED rendering — grey300, i.e.
// identical to rest, with the eye-off glyph — not a pointer `:active`. Figma
// therefore ships no pointer-press cell for the eye, so it inherits its
// siblings' `containedButtonActive` press feedback rather than being the one
// control in the row with none.
const INK: Readonly<Record<ActionLane, InkRamp>> = {
  neutral: {
    rest: palette.grey300.main,
    hover: palette.primary.main,
    active: palette.containedButtonActive.main,
  },
  toggle: {
    rest: palette.grey300.main,
    hover: palette.grey200.main,
    active: palette.containedButtonActive.main,
  },
  danger: {
    rest: palette.error.main,
    hover: palette.strokeDanger.main,
    active: palette.strokeDanger.main,
  },
};

// One disabled ink for all three lanes — the Figma disabled column is grey400
// everywhere, danger included. Semantics-first: the column exists, so paint it.
const DISABLED_INK: string = palette.grey400.main;

// Single-layer inset ring (S5 / the `UiIntegrationCard` recipe). The slot has no
// fill and no border of its own, so an inset shadow draws the ring exactly on
// the 24px slot edge without changing one pixel of geometry.
const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// Amendment A1, two selectors and one recipe. CSS keeps per-selector specificity
// inside a selector list, so the bare `:focus-visible` (0,2,0) covers the
// disabled action while the second copy repeats the hover rule's OWN negation to
// tie hover's (0,3,0) — declared later, it therefore wins on an action that is
// focused AND hovered. The eye toggle needs no extra negation here because its
// hover rule negates nothing beyond `aria-disabled`: `pressed` does not change
// the eye's rest ink (see INK.toggle above), so there is no pressed-specific
// hover rule for the ring to tie.
const FOCUS_SELECTORS: string = '&:focus-visible, &:focus-visible:not([aria-disabled="true"])';

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box. The danger backdrop is decoration and may vanish
// in that mode; it is never the only pressed/rest distinction, because the glyph
// stroke colour carries the same channel.
//
// The fallback MUST repeat FOCUS_SELECTORS rather than a bare `:focus-visible`.
// A media query adds no specificity, so a single-selector rule loses to the
// `:not([aria-disabled="true"])` copy above that declares `outline: none` — and
// it loses on the ENABLED action, the one state a keyboard user is normally in.
// Repeating the list ties the specificity, and being declared later this wins.
const FORCED_COLORS_RING: object = {
  '@media (forced-colors: active)': {
    [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
  },
};

// The row. There is no auto-layout container in Figma — the six icons are loose,
// hand-placed instances — so the 0.75rem gap is the MODAL measured slot gap
// (12px), which reproduces x-close→dots-horizontal and settings→trash exactly
// and normalises the two collapsed dots gaps that read as a board mistake.
const BAR_BASE: object = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  margin: 0,
  padding: 0,
};

// The 24px slot. `settings-04` is normalised into it by rendering its native
// 30-unit viewBox at 24px, which resolves its 2.5 stroke to exactly 2. No
// border, background or radius at rest — and none in any other state either,
// except the danger backdrop, which is a separate layer rather than a change to
// this box, so the slot rhythm never reflows.
const SLOT_BASE: object = {
  position: 'relative',
  boxSizing: 'border-box',
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  margin: 0,
  padding: 0,
  border: 'none',
  borderRadius: 0,
  backgroundColor: 'transparent',
  font: 'inherit',
  lineHeight: 0,
};

/**
 * Frame 5441 (632:46709), the only authored button chrome anywhere on Board A:
 * a 40x40 8px-radius plate at 10% error, centred behind the 24px trash glyph.
 * It is an absolutely-positioned layer precisely so the 24px slot rhythm never
 * changes — the plate overflows the slot instead of resizing it.
 */
export const actionBackdropSx: SxProps<Theme> = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '2.5rem',
  height: '2.5rem',
  marginTop: '-1.25rem',
  marginLeft: '-1.25rem',
  borderRadius: '0.5rem',
  backgroundColor: 'transparent',
  pointerEvents: 'none',
};

const DANGER_BACKDROP: object = {
  backgroundColor: alpha(palette.error.main, 0.1),
};

/**
 * The glyph layer. Positioned so it paints ABOVE the absolutely-positioned
 * backdrop (both are positioned, so DOM order decides) without any z-index.
 */
export const glyphLayerSx: SxProps<Theme> = {
  position: 'relative',
  display: 'inline-flex',
};

/** True for the one lane that paints a pressed backdrop. */
export function hasBackdrop(icon: ActionIconName): boolean {
  return LANE_BY_ICON[icon] === 'danger';
}

// Button-only additions. Hover and press are both gated on the `aria-disabled`
// boundary, and the focus ring is declared after every state rule so it wins at
// equal specificity. No transition anywhere — the design specifies none.
function interactiveSlotSx(lane: ActionLane): object {
  const ink: InkRamp = INK[lane];
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&[aria-disabled="true"]': { cursor: 'default', color: DISABLED_INK },
    '&:hover:not([aria-disabled="true"])': { color: ink.hover },
    '&:active:not([aria-disabled="true"])': {
      color: ink.active,
      [`& .${BACKDROP_CLASS}`]: lane === 'danger' ? DANGER_BACKDROP : null,
    },
    [FOCUS_SELECTORS]: { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

export interface ActionButtonStyleConfig {
  icon: ActionIconName;
  interactive: boolean;
}

/** One action slot: the frozen 24px box, its lane's rest ink, plus button chrome. */
export function actionButtonSx(config: Readonly<ActionButtonStyleConfig>): SxProps<Theme> {
  const lane: ActionLane = LANE_BY_ICON[config.icon];
  return {
    ...SLOT_BASE,
    color: INK[lane].rest,
    ...(config.interactive ? interactiveSlotSx(lane) : null),
  };
}

export interface ActionIconBarStyleConfig {
  sx: SxProps<Theme> | undefined;
}

/** The bar root `sx`: the static row, consumer `sx` merged last. */
export function actionIconBarSx(config: Readonly<ActionIconBarStyleConfig>): SxProps<Theme> {
  const extra: SxProps<Theme> = config.sx ?? {};
  return [BAR_BASE, ...(Array.isArray(extra) ? extra : [extra])];
}
