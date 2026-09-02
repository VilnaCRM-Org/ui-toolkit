// Layout styling for UiOptionCard (Figma Board A row y=1486, state nodes
// 439:19838 rest / 439:19845 hover / 439:19850 selected / 439:19855 disabled). The
// card root owns every state flip through the `[aria-checked]` / `[aria-disabled]`
// / `:hover` selectors below, so the child styles stay static and the STATIC
// branch — which carries no ARIA at all — automatically paints the rest
// presentation. The box keeps a constant 1px border in every state (transparent
// where Figma drops it) so the box never moves (the `ui-filter-chip` precedent).
import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hooks so the root drives the value box and text repaint via
// descendant selectors instead of threading state through the content tree.
export const CAPTION_CLASS: string = 'ui-option-card__caption';
export const BOX_CLASS: string = 'ui-option-card__box';
export const VALUE_CLASS: string = 'ui-option-card__value';

// The one raw colour literal in this module: the Figma hover shadow tint has no
// palette token behind it (the same literal `ui-integration-card` carries).
const HOVER_SHADOW: string = '0 8px 15px rgba(49, 59, 67, 0.14)';

// Primary at 10% alpha — the selected box wash. No flat hex exists for this in
// Figma; it is `primary` painted through `alpha()`.
const SELECTED_FILL: string = alpha(palette.primary.main, 0.1);

// Single-layer inset ring (the repo recipe): declared after hover/checked/
// disabled so it wins at equal specificity on a focused card in any state. This
// is the ONLY non-Figma visual the card paints.
const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

const ROOT_BASE: object = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.625rem',
  width: '16.375rem',
  margin: 0,
  padding: 0,
  border: 'none',
  backgroundColor: 'transparent',
  textAlign: 'left',
  font: 'inherit',
};

/** The caption text, Golos Text 500 15/18, grey250 at rest/hover/selected. */
export const captionSx: SxProps<Theme> = {
  fontFamily: "'Golos Text'",
  fontWeight: 500,
  fontSize: '0.938rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  color: palette.grey250.main,
};

/** The 262x60 value box: border-inside, radius 8px, text inset 24px from left. */
export const boxSx: SxProps<Theme> = {
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  width: '16.375rem',
  height: '3.75rem',
  padding: '0 0 0 1.5rem',
  borderRadius: '0.5rem',
  border: '1px solid transparent',
  borderColor: palette.brandGray.main,
  backgroundColor: palette.white.main,
};

/**
 * The value text, Golos Text 400 18/30, darkSecondary at rest. Line-height stays
 * 30px in every state, including selected — Figma's `normal` on that node is a
 * style artefact (the text centres either way); a deliberate deviation (DEV-54)
 * from the raw extraction, recorded in the deviation ledger.
 */
export const valueSx: SxProps<Theme> = {
  fontFamily: "'Golos Text'",
  fontWeight: 400,
  fontSize: '1.125rem',
  lineHeight: '1.875rem',
  letterSpacing: 0,
  color: palette.darkSecondary.main,
};

// Button-only additions. Hover is gated off while checked or disabled (no
// hover-on-selected/-disabled master exists). The checked and disabled rules are
// declared in that order so a selected+disabled card (no Figma master for the
// combination) resolves to the disabled chrome, matching the repo's existing
// checked/disabled precedence.
function interactiveCardSx(): object {
  return {
    cursor: 'pointer',
    '&[aria-disabled="true"]': { cursor: 'default' },
    [`&:hover:not([aria-checked="true"]):not([aria-disabled="true"]) .${BOX_CLASS}`]: {
      borderColor: palette.grey400.main,
      boxShadow: HOVER_SHADOW,
    },
    [`&[aria-checked="true"] .${BOX_CLASS}`]: {
      backgroundColor: SELECTED_FILL,
      borderColor: 'transparent',
    },
    [`&[aria-checked="true"] .${VALUE_CLASS}`]: {
      color: palette.primary.main,
      fontWeight: 600,
    },
    [`&[aria-disabled="true"] .${BOX_CLASS}`]: {
      backgroundColor: palette.grey500.main,
      borderColor: 'transparent',
    },
    [`&[aria-disabled="true"] .${VALUE_CLASS}`]: {
      color: palette.grey300.main,
    },
    [`&[aria-disabled="true"] .${CAPTION_CLASS}`]: {
      color: palette.grey400.main,
    },
    '&:focus-visible': { outline: 'none', boxShadow: FOCUS_RING },
  };
}

export interface OptionCardStyleConfig {
  interactive: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The card root `sx`: static layout, plus (button) state chrome, consumer `sx` last. */
export function optionCardSx(config: OptionCardStyleConfig): SxProps<Theme> {
  const base: object = {
    ...ROOT_BASE,
    ...(config.interactive ? interactiveCardSx() : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
