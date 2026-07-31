// Layout styling for UiPaymentOptionCard (Figma Board A row y=1004, state nodes
// 439:19625 rest / 439:19643 hover / 439:19640 selected / 439:19658 disabled). The
// card root owns every state flip through the `[aria-checked]` / `[aria-disabled]`
// / `:hover` selectors below, so the child styles stay static and the STATIC
// branch — which carries no ARIA at all — automatically paints the rest
// presentation.
//
// Geometry never moves between states. Figma draws a 0 / 1 / 2px border ladder
// across rest / hover / selected; shipping that literally would reflow the content
// box by 2px on selection, so the border is a CONSTANT `1px` everywhere and only
// its colour swaps — `backgroundGrey200` at rest and disabled (invisible against
// the identical card fill), `primary` on hover and when selected — and the
// selected state adds its second pixel as an `inset 0 0 0 1px` box-shadow layer
// instead of a thicker border (the UiPagination no-jitter precedent).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hooks so the root owns the circle and wordmark flips via descendant
// selectors instead of threading the state through the content tree.
export const CIRCLE_CLASS: string = 'ui-payment-option-card__circle';
export const LOGO_CLASS: string = 'ui-payment-option-card__logo';

// The selected card's second border pixel, painted as a shadow layer so the box
// model is identical in every state (see the header note).
const SELECTED_RING: string = `inset 0 0 0 1px ${palette.primary.main}`;

// Single-layer inset ring (the 3.3/3.4 recipe): the selected card paints its own
// white fill, so a second white layer buys nothing, and inset keeps the ring inside
// the 8px radius when a consumer clips the card. It paints just inside the constant
// 1px border, so a focused SELECTED card shows the primary border AND the
// darkPrimary ring at once — state and focus are orthogonal channels and neither
// may ever substitute for the other.
const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// Amendment A1, two selectors and one recipe. CSS keeps per-selector specificity
// inside a selector list, so the bare `:focus-visible` (0,2,0) covers the disabled
// and selected cards while the second copy repeats the hover rule's own negations
// to reach hover's (0,4,0) — declared later, it therefore wins on a card that is
// focused AND hovered, where the plain rule alone would lose its ring. The ring is
// declared after hover and after the checked rule.
const FOCUS_SELECTORS: string =
  '&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-checked="true"])';

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box. The card border stays a REAL border, so the card
// boundary survives that mode; checked vs unchecked also survives, because the
// circle's distinction is border WIDTH (5px vs 1px) rather than colour alone — do
// not refactor that away.
const FORCED_COLORS_RING: object = {
  '@media (forced-colors: active)': {
    '&:focus-visible': { outline: '2px solid Highlight', outlineOffset: '-2px' },
  },
};

// The card box, 279x90 in the master and fluid here: `width: 100%` with a
// `minHeight`, never a `height`, so an oversized wordmark may grow the card at 200%
// zoom without shearing (SC 1.4.4/1.4.10). `position: relative` anchors the
// selection circle; the wordmark is centred by the flex box on the CARD's own axis
// — Figma writes `left: calc(50% + 0.5px)`, i.e. it is NOT centred in the space
// beside the circle, which a naive flex row would push it ~16px off.
const CARD_BASE: object = {
  boxSizing: 'border-box',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '5.625rem',
  margin: 0,
  padding: 0,
  backgroundColor: palette.backgroundGrey200.main,
  // 1.4.11 decoration-exempt at rest — it is the same colour as the fill and
  // carries no information of its own. It DOES become a state indicator on hover
  // and when selected; that primary tint is inventoried and routed to the
  // accessibility-visuals PR, exactly as `UiRadioGroup` already ships.
  border: `1px solid ${palette.backgroundGrey200.main}`,
  borderRadius: '0.5rem',
  font: 'inherit',
};

/**
 * The selection circle, PAINT and never a control: the exact `UiIntegrationCard`
 * radio-dot recipe — a 20px white disc with a 1px grey400 stroke unchecked, and a
 * 5px primary ring leaving the white centre when checked. Figma places it at
 * (12, 12) from the card's OUTER edge and the CSS border sits outside the padding
 * box, so the offset compensates by the border width: 12 - 1 = 11px (0.6875rem),
 * the 3.2/3.4 inside-stroke precedent.
 */
export const selectionCircleSx: SxProps<Theme> = {
  position: 'absolute',
  left: '0.6875rem',
  top: '0.6875rem',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '50%',
  boxSizing: 'border-box',
  backgroundColor: palette.white.main,
  border: `1px solid ${palette.grey400.main}`,
};

const HOVER_CIRCLE: object = {
  border: `1px solid ${palette.primary.main}`,
};

const CHECKED_CIRCLE: object = {
  border: `5px solid ${palette.primary.main}`,
};

// The ONE divergence from the 3.4 glyph: Figma's disabled master draws a solid
// brandGray disc with no stroke at all, where 3.4 keeps a stroked glyph.
const DISABLED_CIRCLE: object = {
  backgroundColor: palette.brandGray.main,
  border: 'none',
};

/**
 * The provider wordmark: centred on the card axis by the flex box, sized by its
 * own intrinsic `width`/`height` attributes. `max-width` with `height: auto` lets a
 * narrow consumer width scale it — the aspect ratio is preserved by those
 * attributes — instead of shearing it.
 */
export const paymentLogoSx: SxProps<Theme> = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
};

// Button-only additions. Hover is gated on the aria-disabled boundary AND on
// `aria-checked="false"`: no hover-on-selected master exists, and the selected
// chrome must win on both the card border and the circle, so hovering a selected
// card is a deliberate no-op (pixel-identical to selected). The disabled circle is
// declared BEFORE the checked rule so a selected + disabled card keeps its full
// selected chrome. `cursor: pointer` stays on a selected card — a checked native
// radio still shows one. No transition anywhere — the design specifies none.
function interactiveCardSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&[aria-disabled="true"]': {
      cursor: 'default',
      [`& .${CIRCLE_CLASS}`]: DISABLED_CIRCLE,
    },
    '&:hover:not([aria-disabled="true"]):not([aria-checked="true"])': {
      backgroundColor: palette.white.main,
      borderColor: palette.primary.main,
      [`& .${CIRCLE_CLASS}`]: HOVER_CIRCLE,
    },
    '&[aria-checked="true"]': {
      backgroundColor: palette.white.main,
      borderColor: palette.primary.main,
      boxShadow: SELECTED_RING,
      [`& .${CIRCLE_CLASS}`]: CHECKED_CIRCLE,
    },
    [FOCUS_SELECTORS]: { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

export interface PaymentOptionCardStyleConfig {
  interactive: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The card root `sx`: static layout, plus (button) state chrome, consumer `sx` last. */
export function paymentOptionCardSx(config: PaymentOptionCardStyleConfig): SxProps<Theme> {
  const base: object = {
    ...CARD_BASE,
    ...(config.interactive ? interactiveCardSx() : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
