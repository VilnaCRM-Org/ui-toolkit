// Styling for the calendar: layout, weekday/day-cell states, focus ring and the
// sr-only helper. Colours come from the shared theme; contrast hardening is
// deferred to the accessibility-visuals PR (see Story 1.3).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

import { crmBreakpointValues } from '../ui-breakpoints';

import type { DayDescriptor } from './view-model';

// Mobile breakpoint from the CRM scale (480px), not hardcoded.
const MOBILE_MAX: string = `@media (max-width: ${crmBreakpointValues.sm}px)`;

export { srOnlySx } from '../field-controls';

// Design tokens reused from the shared colour theme so the calendar matches the
// field controls (8px radius, grey400 stroke, brand-blue selection, danger error
// stroke, disabled greying) without duplicating hex values.
const palette: Theme['palette'] = colorTheme.palette;

export type CalendarSize = 'small' | 'medium';

// Figma lays the seven 24px day circles out with `justify-between` across a fixed
// grid width, so the outer circles sit flush to the grid edges and the six inner
// gaps are equal (≈15.3px at the medium size — the range band then runs edge-to-
// edge behind them). 24px is also the WCAG 2.5.8 target-size floor. The grid width
// is `7×24 + 6×gap`: medium = 260px (card 308px with the 24px padding, matching
// Figma node 606:42007), small keeps the tighter ~10px gap.
export const CIRCLE_PX: number = 24;
const GRID_PX: Record<CalendarSize, number> = { small: 228, medium: 260 };
export const BAND: string = 'rgba(30, 174, 255, 0.1)';

// Only merged into the consumer sx by `mergeRootSx`, so kept module-local. Block-
// level (not inline-flex) so it fills the container and the surface can size to the
// available width — the card itself caps at the Figma width via `surfaceSx`.
const rootSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.375rem',
  fontFamily: 'Inter',
};

export const labelSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: palette.grey200.main,
};

/** The bordered calendar surface; error swaps the stroke, disabled greys it. */
export function surfaceSx(error: boolean, disabled: boolean, size: CalendarSize): SxProps<Theme> {
  // Figma card: lighter Brand-gray stroke, 24px padding and the soft "Shadow
  // lighte" drop shadow (#313B43 @5%); error swaps the stroke, disabled greys it.
  const borderColor: string = error ? palette.strokeDanger.main : palette.brandGray.main;
  return {
    display: 'flex',
    flexDirection: 'column',
    // No uniform gap — the divider and grid carry their own Figma top margins so the
    // caption→divider (18px), divider→weekday (16px) and weekday→days (10px) spacings
    // can each differ.
    gap: 0,
    padding: '1.5rem',
    // Shrink the padding on narrow screens so the fluid grid keeps its room.
    [MOBILE_MAX]: { padding: '0.75rem' },
    borderRadius: '0.5rem',
    border: `1px solid ${borderColor}`,
    backgroundColor: disabled ? palette.brandGray.main : palette.white.main,
    opacity: disabled ? 0.6 : 1,
    boxShadow: disabled ? 'none' : '0px 8px 27px 0px rgba(49, 59, 67, 0.05)',
    // Fill the container up to the Figma card width (grid + 24px padding + 1px
    // border on each side), then shrink below it — so the grid never overflows and
    // clips the last day column on narrow screens.
    width: '100%',
    maxWidth: `${GRID_PX[size] + 50}px`,
    boxSizing: 'border-box',
  };
}

// Figma header: the month caption sits on the LEFT and both chevrons are grouped
// together on the RIGHT (24px apart), not split to opposite ends.
export const headerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
};

// Chevron spacing: Figma's gap-24 spec renders ~1px wider between the drawn glyphs
// (measured 41.5px vs 40px centre-to-centre), so the gap is 25px to match the
// design's visual chevron separation.
export const navGroupSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5625rem',
};

/** 1px rule under the month header (Figma separates header from the grid), 18px
 * below the caption. Figma insets it from the card content (node 606:42016 is 251px
 * inside the 260px content — ~5px left, ~4px right), so it does not span full width. */
export const dividerSx: SxProps<Theme> = {
  height: '1px',
  backgroundColor: palette.grey400.main,
  border: 0,
  margin: 0,
  marginTop: '1.125rem',
  marginLeft: '0.3125rem',
  marginRight: '0.25rem',
};

export const captionSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  // Figma 14/18 — the tighter line-height keeps the caption up near the top edge.
  lineHeight: '1.125rem',
  margin: 0,
  color: palette.darkSecondary.main,
  userSelect: 'none',
};

// The chevrons are 16px flush to the right (no button padding, Figma), 25px apart
// (the navGroup gap), so they sit tight against the card's right inset.
export const navButtonSx: SxProps<Theme> = {
  color: palette.grey300.main,
  padding: 0,
  '&.Mui-disabled': { color: palette.grey400.main },
};

// A `role="grid"` flex column: the Figma width at the medium size (card = 308px),
// but `maxWidth: 100%` lets it go fluid inside a narrow container (mobile), where
// justify-between simply tightens the gaps. The 16px gap gives both the weekday-to-
// grid and the row-to-row spacing.
export function gridSx(size: CalendarSize): SxProps<Theme> {
  return {
    display: 'flex',
    flexDirection: 'column',
    // 16px below the divider; 11px between the weekday row and the first week. Figma's
    // structural box-gap is 10px, but its weekday cell is 26px tall (node 606:42018) vs
    // our 24px heading box, so the extra 1px here reproduces Figma's 35px weekday-centre
    // to day-centre distance without shifting the weekday box (which keeps the divider→
    // weekday spacing at its already-correct 20px).
    marginTop: '1rem',
    gap: '0.6875rem',
    // Fill the card up to the Figma width, but genuinely shrink below it on narrow
    // screens (a fixed `width` would overflow and clip the last column instead).
    width: '100%',
    maxWidth: `${GRID_PX[size]}px`,
  };
}

/** The day-row group: the six week rows, 16px apart. */
export const rowGroupSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

// One week row: the seven 24px cells spread edge-to-edge like Figma's
// `justify-between`, so the outer circles sit flush to the grid (and band) edges.
export const weekRowSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
};

// Figma's weekday cells are wider than the 24px day circles (32px, node 606:42018),
// so `justify-between` packs the labels closer (≈6px apart) than the day columns.
export const weekdayHeadingSx: SxProps<Theme> = {
  width: '2rem',
  height: `${CIRCLE_PX}px`,
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.75rem',
  color: palette.grey300.main,
  textAlign: 'center',
  lineHeight: `${CIRCLE_PX}px`,
  userSelect: 'none',
};

export const paddingCellSx: SxProps<Theme> = {
  width: `${CIRCLE_PX}px`,
  height: `${CIRCLE_PX}px`,
  textAlign: 'center',
};

// The adjacent month's day number, shown muted so the previous/next month reads as
// context, not as selectable days of this month (they stay non-interactive).
export const adjacentDaySx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: `${CIRCLE_PX}px`,
  height: `${CIRCLE_PX}px`,
  fontFamily: 'Inter',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: palette.grey300.main,
};

// A two-colour focus ring stays visible on both the white surface and the blue
// endpoint fill (a single-colour ring vanishes on same-colour fill). Inner white
// ring vs the fill, outer dark ring vs the page — WCAG 2.4.7 / 2.4.11. It is drawn
// on the day circle when its cell is keyboard-focused.
const FOCUS_RING_INNER: string = `inset 0 0 0 2px ${palette.white.main}`;
const FOCUS_RING_OUTER: string = `0 0 0 2px ${palette.darkPrimary.main}`;
const FOCUS_RING: string = `${FOCUS_RING_INNER}, ${FOCUS_RING_OUTER}`;
const TODAY_RING: string = `inset 0 0 0 1px ${palette.primary.main}`;

/** One week row plus its range band. Figma insets the band 1px inside the 24px day
 * row — its band rectangles are 22px tall (e.g. node 606:42109) and sit centred, not
 * touching the row's top/bottom edges. Applied as a sized background image (not the
 * `background` shorthand, which would reset the size); `none` rows draw no band. */
export function dayRowSx(band: string): SxProps<Theme> {
  return {
    ...weekRowSx,
    backgroundImage: band,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: `100% ${CIRCLE_PX - 2}px`,
  };
}

/** Merges the consumer's `sx` over the calendar root styling. */
export function mergeRootSx(consumer: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = consumer ?? {};
  return [rootSx, ...(Array.isArray(extra) ? extra : [extra])];
}

// The day number's ink: white on an endpoint disc, brand-blue in-range (Figma),
// greyed when out of range, dark otherwise.
function dayInk(day: DayDescriptor): string {
  if (day.selected) return palette.white.main;
  if (day.disabled) return palette.grey400.main;
  if (day.inRange) return palette.primary.main;
  return palette.grey200.main;
}

/** One 24px day cell hosting the circle (the range band sits on the row behind). */
export function dayCellSx(day: DayDescriptor): SxProps<Theme> {
  const interactiveHover: object =
    day.disabled || day.selected ? {} : { '&:hover .ui-day-circle': { backgroundColor: BAND } };
  return {
    width: `${CIRCLE_PX}px`,
    height: `${CIRCLE_PX}px`,
    outline: 'none',
    cursor: day.disabled ? 'default' : 'pointer',
    '&:focus-visible .ui-day-circle': { boxShadow: FOCUS_RING },
    ...interactiveHover,
  };
}

/** The 24px day circle: a filled disc for range endpoints, a ring for today. */
export function dayCircleSx(day: DayDescriptor): SxProps<Theme> {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${CIRCLE_PX}px`,
    height: `${CIRCLE_PX}px`,
    borderRadius: '50%',
    boxSizing: 'border-box',
    fontFamily: 'Inter',
    fontSize: '0.875rem',
    // Figma draws every day number in Inter Medium (500), including the selected
    // endpoint; the filled blue disc (a shape/background change, not colour alone)
    // is the non-colour endpoint cue for WCAG 1.4.1. 600 is not a loaded Inter
    // weight, so it fell back to a faux-bold that read as a different font.
    fontWeight: 500,
    color: dayInk(day),
    backgroundColor: day.selected ? palette.primary.main : 'transparent',
    // Today ring only when it is neither an endpoint nor in-range (so it never
    // clobbers the focus ring or the endpoint disc).
    boxShadow: day.today && !day.selected && !day.inRange ? TODAY_RING : 'none',
  };
}
