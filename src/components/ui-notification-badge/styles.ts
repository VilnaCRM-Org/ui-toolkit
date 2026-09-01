// Layout styling for UiNotificationBadge (Figma Board A, state nodes 451:26194
// rest / 451:26199 hover / 451:26209 active / 451:26214 disabled). The badge root
// owns every state flip through the `:hover` / `:active` / `[aria-expanded]` /
// `[aria-disabled]` selectors below, so the bell and the counter chip stay static
// and the STATIC branch — which carries no ARIA at all (S2) — automatically paints
// the rest presentation. Geometry never moves between states: the border is a
// constant 1px everywhere and only its colour swaps (the UiPagination no-jitter
// precedent), and the active chip ring is an OUTSIDE box-shadow rather than a
// border, so it cannot eat into the 18px chip.
import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hook so the root owns the chip's per-state fill and its active ring
// via a descendant selector, instead of threading the state through the content
// tree as a React-conditional style.
export const COUNT_CLASS: string = 'ui-notification-badge__count';

// BOTH ring layers are inset (the UiTaskCard recipe): the rest, hover and active
// circle fills differ sharply — near-white, a pale blue tint and solid primary —
// so the white 2–4px separator is what keeps the dark 0–2px ring legible on all
// three. Exported so the unit test can pin the exact string.
const FOCUS_RING_OUTER: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;
const FOCUS_RING_INNER: string = `inset 0 0 0 4px ${palette.white.main}`;
export const FOCUS_RING: string = `${FOCUS_RING_OUTER}, ${FOCUS_RING_INNER}`;

// Two selectors, one recipe (Amendment A1). CSS keeps per-selector specificity
// inside a selector list, so the bare `:focus-visible` (0,2,0) covers the disabled
// badge while the second copy repeats the hover rule's own negation to reach
// hover's (0,3,0) — declared later, it therefore wins on a badge that is focused
// AND hovered, where the plain rule alone would lose its ring to the hover tint.
const FOCUS_SELECTORS: string = '&:focus-visible, &:focus-visible:not([aria-disabled="true"])';

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box. The circle keeps a REAL border in that mode, so
// the badge boundary survives it; the counter chip keeps its own text, so the
// count survives it too.
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

// Hover also yields to the open state: without the `[aria-expanded]` guard the
// hover tint (higher specificity) would repaint the solid open-blue bell while
// the pointer rests on the trigger (the 3.3/3.4 hover-gate convention).
const HOVER_SELECTOR: string =
  '&:hover:not([aria-disabled="true"]):not([aria-expanded="true"])';

// The Figma "active" column is the pressed visual, but a solid-blue bell equally
// reads as "the panel is open" — the same picture serves both, so the recipe keys
// off the pointer state AND `aria-expanded`, and no extra prop is invented. Each
// selector in the list keeps its own specificity, so the disabled rule below
// (equal 0,2,0 against `[aria-expanded]`, declared later) still wins.
const ACTIVE_SELECTORS: string = '&:active:not([aria-disabled="true"]), &[aria-expanded="true"]';

const DISABLED_SELECTOR: string = '&[aria-disabled="true"]';

// The 48px circle. Fixed `width`/`height` in rem — it is a round icon target with
// no text of its own, so it scales with the user's font size but never reflows.
// `overflow` is deliberately never set anywhere in this module: the chip overhangs
// the circle by 4px (and by another 2px of ring when active), so any clipping
// container would cut the counter off. Figma strokes INSIDE the frame, which
// `boxSizing: border-box` reproduces, keeping the painted circle 48px in the one
// state that has a visible border.
const BADGE_BASE: object = {
  position: 'relative',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: '3rem',
  height: '3rem',
  margin: 0,
  padding: 0,
  borderRadius: '50%',
  // Rest is the only state with a visible border; the other three swap the colour
  // to `transparent` so the box model never changes under the user's pointer.
  border: `1px solid ${palette.grey400.main}`,
  backgroundColor: palette.backgroundGrey100.main,
  // The bell inherits this through `currentColor`, so one declaration per state
  // recolours the glyph.
  color: palette.grey300.main,
  font: 'inherit',
};

// Inside-stroke compensation (the UiTaskCard/payment-circle precedent). The root
// declares a PERMANENT 1px border — only its colour swaps between states — and an
// absolute offset resolves against the padding box, i.e. 1px inside the outer box
// Figma measures. Both offsets therefore push back out by that border width, and
// the correction is constant in every state because the border always exists.
const CHIP_BORDER_COMPENSATION: string = '1px';

/**
 * The counter chip: an 18px circle anchored to the circle's bottom-right, hanging
 * 4px past its right edge exactly as the master draws it (Figma x=34, y=30 inside
 * the 48px frame — chip right edge = outer right +4px, chip bottom flush with the
 * outer bottom). Inter Medium 12/18 centred on both axes, and always white ink —
 * it must not inherit the root's per-state `color`, which drives the bell alone.
 */
export const countChipSx: SxProps<Theme> = {
  position: 'absolute',
  right: `calc(-0.25rem - ${CHIP_BORDER_COMPENSATION})`,
  bottom: `-${CHIP_BORDER_COMPENSATION}`,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.125rem',
  height: '1.125rem',
  borderRadius: '50%',
  // 1.4.11 decoration-exempt: the fill sits behind real text and the count is also
  // carried by the button's accessible name, so nothing depends on the tint alone.
  backgroundColor: palette.primary.main,
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  color: palette.white.main,
};

// The active chip's 2px ring is an OUTSIDE stroke in Figma (proven by the 54×50
// painted bounds against 52×48 elsewhere), so it is a spread box-shadow: a CSS
// `border` would be drawn inside the 18px box and shrink the chip. The colour is
// the page-background grey, not white — Figma cuts the chip out of the surface it
// sits on, which is why the story and showcase surfaces are #FBFBFB too.
const CHIP_ACTIVE_RING: object = {
  boxShadow: `0 0 0 2px ${palette.backgroundGrey100.main}`,
};

const CHIP_DISABLED_FILL: object = {
  backgroundColor: palette.grey400.main,
};

// Button-only additions. Hover and the pressed half of the active rule are both
// gated on the aria-disabled boundary, so a disabled badge keeps its own paint
// while remaining a real, focusable button. The disabled rule is declared after
// the active one so it also beats `[aria-expanded="true"]` at equal specificity,
// and the focus ring is declared after everything so it wins at equal specificity
// against hover. No transition anywhere — the design specifies none.
function interactiveBadgeSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    [HOVER_SELECTOR]: {
      backgroundColor: alpha(palette.primary.main, 0.1),
      borderColor: 'transparent',
      color: palette.primary.main,
    },
    [ACTIVE_SELECTORS]: {
      backgroundColor: palette.primary.main,
      borderColor: 'transparent',
      color: palette.white.main,
      [`& .${COUNT_CLASS}`]: CHIP_ACTIVE_RING,
    },
    [DISABLED_SELECTOR]: {
      cursor: 'default',
      backgroundColor: palette.brandGray.main,
      borderColor: 'transparent',
      color: palette.grey400.main,
      [`& .${COUNT_CLASS}`]: CHIP_DISABLED_FILL,
    },
    [FOCUS_SELECTORS]: { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

export interface NotificationBadgeStyleConfig {
  interactive: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The badge root `sx`: static circle, plus (button) state chrome, consumer `sx` last. */
export function notificationBadgeSx(
  config: Readonly<NotificationBadgeStyleConfig>
): SxProps<Theme> {
  const base: object = {
    ...BADGE_BASE,
    ...(config.interactive ? interactiveBadgeSx() : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
