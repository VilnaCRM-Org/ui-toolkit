// Layout styling for UiTaskCard. The card paints no fill of its own — the board
// column behind it does — so the only chrome is the bottom divider that separates
// cards stacked flush at a 94px pitch. Every colour flip between rest and hover is
// owned by the card root through the class hooks below, keeping the child styles
// static; the wired (button) branch adds cursor, hover and the focus ring.
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hooks so the root owns every hover rule via descendant selectors.
export const TITLE_CLASS: string = 'ui-task-card__title';
export const LABEL_CLASS: string = 'ui-task-card__label';
export const CHIP_CLASS: string = 'ui-task-card__chip';

// The one raw colour literal in this module (3.1 recipe convention): a shadow
// tint with no palette token behind it. Figma exports it as a drop-shadow, but the
// chip is an opaque filled box, so it is a box-shadow here.
const CHIP_HOVER_SHADOW: string = '0 4px 2px rgba(174, 181, 186, 0.25)';

// BOTH ring layers are inset: the card has no fill of its own to sit on and board
// columns clip outset rings. First-listed paints on top — dark 0–2px over white
// 2–4px — so the ring reads on a light column and a dark one alike.
const FOCUS_RING_OUTER: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;
const FOCUS_RING_INNER: string = `inset 0 0 0 4px ${palette.white.main}`;
export const FOCUS_RING: string = `${FOCUS_RING_OUTER}, ${FOCUS_RING_INNER}`;

// The card box: transparent, no radius, a single bottom divider, 14px top / 16px
// side / 13px bottom padding (wide enough that the 4px focus ring never lands on a
// glyph or the photo). The bottom is 13px because CSS draws `border-bottom` OUTSIDE
// the padding while Figma strokes it INSIDE: 13px surface + the 1px divider is the
// master's 14px bottom band, and the canonical two-line card lands on exactly 94px
// (14 + 36 title + 8 gap + 22 chip + 13 + 1) so cards stack flush at the board
// pitch. The avatar track is a fixed 34px column that stays reserved for unassigned
// tasks, so titles left-align across the whole column with no placeholder DOM.
const CARD_BASE: object = {
  boxSizing: 'border-box',
  display: 'grid',
  gridTemplateColumns: '2.125rem 1fr',
  columnGap: '0.75rem',
  alignItems: 'start',
  width: '100%',
  // minHeight, never height, and no `overflow` at all: the title wraps freely, the
  // card grows with it and nothing clips at 200% zoom (1.4.4/1.4.10).
  minHeight: '5.875rem',
  margin: 0,
  padding: '0.875rem 1rem 0.8125rem',
  backgroundColor: 'transparent',
  border: 0,
  // 1.4.11 decoration-exempt: the divider carries no information (it separates
  // flush-stacked cards); revisit if it ever becomes a state indicator.
  borderBottom: `1px solid ${palette.brandGray.main}`,
  textAlign: 'left',
  font: 'inherit',
  scrollMarginBlock: '0.5rem',
};

// The assignee photo: a real 34px circle in the reserved track, clipped to the
// radius. Pinned to row 1 so it never drifts when the title wraps to three lines.
export const avatarSx: SxProps<Theme> = {
  gridColumnStart: 1,
  gridRowStart: 1,
  display: 'block',
  width: '2.125rem',
  height: '2.125rem',
  borderRadius: '50%',
  overflow: 'hidden',
  objectFit: 'cover',
};

// Title over meta row, 8px apart, explicitly in the second column so an
// unassigned card does not slide into the empty avatar track.
export const textColumnSx: SxProps<Theme> = {
  gridColumnStart: 2,
  gridRowStart: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.5rem',
  minWidth: 0,
};

// Inter Medium 16/18. Never clamped, never ellipsised: `anywhere` is what keeps an
// unbroken `@mention` token from overflowing the column.
export const titleSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '1rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  overflowWrap: 'anywhere',
  color: palette.grey200.main,
};

/** Deadline label + chip, 8px apart on one baseline. */
export const metaRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

export const labelSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  whiteSpace: 'nowrap',
  color: palette.grey300.main,
};

// The deadline chip: 4px radius, Inter Medium 14/18 on one line, 22px tall. The
// border is present in BOTH states — transparent at rest — so the hover flip
// changes a colour and never the geometry (UiPagination no-jitter precedent); since
// that 1px border sits OUTSIDE the padding box (unlike Figma's inside stroke), the
// padding is 1px/3px so border+padding reproduce the master's 2px/4px visual text
// inset: 18px line + 2 + 2 = 22px tall, 8px total horizontal inset either way.
export const chipSx: SxProps<Theme> = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.0625rem 0.1875rem',
  borderRadius: '0.25rem',
  border: '1px solid transparent',
  // 1.4.11 decoration-exempt: the fill and its hover border are decoration behind
  // real text; revisit if the chip ever becomes interactive or state-bearing.
  backgroundColor: palette.brandGray.main,
  color: palette.darkPrimary.main,
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: '1.125rem',
  letterSpacing: 0,
  whiteSpace: 'nowrap',
};

// Button-only additions. Hover is gated on the aria-disabled boundary so a
// disabled card keeps its rest paint, and `:focus-visible` is declared LAST so the
// ring wins over the equal-specificity hover rule. No transition anywhere: the
// design specifies none, and the root must never animate its box-shadow (the ring).
function interactiveCardSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&[aria-disabled="true"]': { cursor: 'default' },
    '&:hover:not([aria-disabled="true"])': {
      [`& .${TITLE_CLASS}`]: { color: palette.darkPrimary.main },
      [`& .${LABEL_CLASS}`]: { color: palette.grey200.main },
      [`& .${CHIP_CLASS}`]: {
        backgroundColor: palette.white.main,
        borderColor: palette.brandGray.main,
        boxShadow: CHIP_HOVER_SHADOW,
      },
    },
    '&:focus-visible': { outline: 'none', boxShadow: FOCUS_RING },
    '@media (forced-colors: active)': {
      '&:focus-visible': { outline: '2px solid Highlight', outlineOffset: '-2px' },
    },
  };
}

export interface TaskCardStyleConfig {
  interactive: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The card root `sx`: static layout, plus (button) hover/focus, consumer `sx` last. */
export function taskCardSx(config: TaskCardStyleConfig): SxProps<Theme> {
  const base: object = {
    ...CARD_BASE,
    ...(config.interactive ? interactiveCardSx() : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
