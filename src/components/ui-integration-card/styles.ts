// Layout styling for UiIntegrationCard (Figma Cards frame node 439:19893, state
// nodes 451:26264 rest / 451:26277 hover / 451:26269 selected). The card root owns
// every state flip through the `[aria-checked]` / `:hover` selectors below, so the
// child styles stay static and the STATIC branch — which carries no ARIA at all
// (a11y contract §2.3) — automatically paints the rest presentation (§3.4).
// Geometry never moves between states: the border is a constant 1px everywhere and
// only its colour swaps (§7.5, the UiPagination no-jitter precedent).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hook so the root owns the checked glyph flip via a descendant
// selector instead of threading the state through the content tree.
export const GLYPH_CLASS: string = 'ui-integration-card__glyph';
export const NAME_CLASS: string = 'ui-integration-card__name';

// The one raw colour literal in this module (3.1 recipe convention): the Figma
// "Landing shadow" effect (DROP_SHADOW #313B43 at 24/255 alpha) has no palette
// token behind it. The card is an opaque filled box, so it is a box-shadow rather
// than a `filter: drop-shadow`. Hover and selected share it.
const LANDING_SHADOW: string = '0 8px 27px rgba(49, 59, 67, 0.14)';

// Single-layer inset ring (the `UiItemRow`/3.3 recipe, §7.1/§7.2): the card paints
// its own white fill, so the task-card's second white layer buys nothing, and
// inset keeps the ring inside the 12px radius when a consumer clips the card. It
// paints just inside the constant 1px border, so a focused SELECTED card shows the
// primary border and the darkPrimary ring at once — state and focus are orthogonal
// channels and neither may ever substitute for the other.
const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// Two selectors, one recipe. CSS keeps per-selector specificity inside a selector
// list, so the bare `:focus-visible` (0,2,0) covers the disabled and selected
// cards while the second copy repeats the hover rule's own negations to reach
// hover's (0,4,0) — declared later, it therefore wins on a card that is focused
// AND hovered, where the plain rule alone would lose its ring to the Landing
// shadow. §7.1 requires the ring to be declared after both hover and selected.
const FOCUS_SELECTORS: string =
  '&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-checked="true"])';

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box (§7.3). The card border stays a REAL border, so the
// card boundary survives that mode; the Landing shadow is decoration and may
// vanish. Checked vs unchecked also survives, because the glyph's distinction is
// border WIDTH (5px vs 1px) rather than colour alone — do not refactor that away.
//
// The fallback MUST repeat FOCUS_SELECTORS rather than a bare `:focus-visible`.
// A media query adds no specificity, so a single-selector rule loses to the
// negated copy above that declares `outline: none` — and it loses on exactly the
// state a keyboard user is normally in (enabled, unchecked), leaving no indicator
// at all while the disabled card keeps one. Repeating the list ties the
// specificity, and being declared later this wins.
const FORCED_COLORS_RING: object = {
  '@media (forced-colors: active)': {
    [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
  },
};

// The card box, 312x142 in the master and fluid here: `width: 100%` with a
// `minHeight`, never a `height`, so the brand name may wrap at 200% zoom without
// shearing (SC 1.4.4/1.4.10, §10.1). Figma strokes INSIDE the frame while CSS
// draws the border outside the padding box, so the padding compensates: 15px +
// the 1px border puts the header row at outer (16, 15.5). The side padding is
// symmetric, which is what centres the logo on the card's own axis.
const CARD_BASE: object = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  minHeight: '8.875rem',
  margin: 0,
  padding: '0.90625rem 0.9375rem 0.9375rem',
  backgroundColor: palette.white.main,
  // 1.4.11 decoration-exempt (DEV-27) at rest: the boundary carries no information
  // of its own. It DOES become a state indicator when selected — that primary tint
  // is inventoried at 2.46:1 and routed to the accessibility-visuals PR, exactly as
  // `UiRadioGroup` already ships (a11y contract Escalation 2).
  border: `1px solid ${palette.brandGray.main}`,
  borderRadius: '0.75rem',
  textAlign: 'left',
  font: 'inherit',
};

/** The glyph + brand name row; the glyph aligns to the FIRST text line (§10.2). */
export const headerRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.5625rem',
};

// The radio glyph, PAINT and never a control (§1.3): the exact `ui-radio-group`
// dot recipe — a 20px white circle with a 1px grey400 stroke unchecked, and a 5px
// primary ring leaving the white centre when checked (see the checked override in
// `interactiveCardSx`). The 3px top margin centres it on the 26px first text line,
// which is what keeps it put when a long brand name wraps. Contrast hardening of
// both tints is deferred to the accessibility-visuals PR (Escalations 2 and 3),
// consistent with every other control in the toolkit.
export const radioGlyphSx: SxProps<Theme> = {
  flexShrink: 0,
  display: 'block',
  marginTop: '0.1875rem',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '50%',
  boxSizing: 'border-box',
  backgroundColor: palette.white.main,
  border: `1px solid ${palette.grey400.main}`,
};

const CHECKED_GLYPH: object = {
  border: `5px solid ${palette.primary.main}`,
};

// Golos Text Regular 16/26. Never clamped, never ellipsised, never
// overflow-hidden: `anywhere` is what keeps a single unbroken brand name from
// spilling out of the card. Figma sets no tracking, so MUI's default body letter
// spacing is dropped explicitly (the radio-group precedent).
export const nameSx: SxProps<Theme> = {
  minWidth: 0,
  fontFamily: "'Golos Text'",
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: '1.625rem',
  letterSpacing: 0,
  overflowWrap: 'anywhere',
  color: palette.darkPrimary.main,
};

// The master centres each logo on `logoTop = (142 - h/2) / 2`, measured from the
// card's outer edge; the header line ends at outer y=41.5, so the gap below it is
// `(142 - h/2)/2 - 41` — 20px for the 40px HubSpot mark, 17px for the 52px AmoCRM
// one. Expressed from `logo.height` so any brand mark lands where Figma would put
// it, and floored at 0 so an oversized mark cannot pull itself up into the name.
function logoGapRem(height: number): string {
  return `${Math.max(0, 30 - height / 4) / 16}rem`;
}

/**
 * The brand mark: horizontally centred by the symmetric card padding plus auto
 * margins, and vertically placed by the master's own rule above. `max-width` with
 * `height: auto` lets a narrow consumer width scale it — the aspect ratio is
 * preserved by the `width`/`height` attributes — instead of shearing it (§10.2).
 */
export function integrationLogoSx(height: number): SxProps<Theme> {
  return {
    display: 'block',
    marginTop: logoGapRem(height),
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '100%',
    height: 'auto',
  };
}

// Button-only additions. Hover is gated on the aria-disabled boundary (§6.1) AND
// on `aria-checked="false"` (§7.4): no hover-on-selected master exists, and hover's
// grey border is LOWER emphasis than the selected primary one, so letting hover win
// would visually demote the selected card mid-flow. `cursor: pointer` stays on a
// selected card — a checked native radio still shows one. The selected rule is
// declared after hover and the focus ring after both, so the ring wins at equal
// specificity. No transition anywhere — the design specifies none (§9.1).
function interactiveCardSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&[aria-disabled="true"]': { cursor: 'default' },
    '&:hover:not([aria-disabled="true"]):not([aria-checked="true"])': {
      borderColor: palette.grey400.main,
      boxShadow: LANDING_SHADOW,
    },
    '&[aria-checked="true"]': {
      borderColor: palette.primary.main,
      boxShadow: LANDING_SHADOW,
      [`& .${GLYPH_CLASS}`]: CHECKED_GLYPH,
    },
    [FOCUS_SELECTORS]: { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

export interface IntegrationCardStyleConfig {
  interactive: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The card root `sx`: static layout, plus (button) state chrome, consumer `sx` last. */
export function integrationCardSx(config: IntegrationCardStyleConfig): SxProps<Theme> {
  const base: object = {
    ...CARD_BASE,
    ...(config.interactive ? interactiveCardSx() : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
