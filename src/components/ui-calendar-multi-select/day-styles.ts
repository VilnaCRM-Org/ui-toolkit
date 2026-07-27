// The individual day cell: its focus ring, hover affordance and the 24px circle
// that carries the endpoint disc, the today ring and the day-number ink.
import type { SxProps, Theme } from '@mui/material';

import { BAND, CIRCLE_PX, palette } from './style-tokens';
import type { DayDescriptor } from './view-model';

// A two-colour focus ring stays visible on both the white surface and the blue
// endpoint fill (a single-colour ring vanishes on same-colour fill). Inner white
// ring vs the fill, outer dark ring vs the page — WCAG 2.4.7 / 2.4.11. It is drawn
// on the day circle when its cell is keyboard-focused.
const FOCUS_RING_INNER: string = `inset 0 0 0 2px ${palette.white.main}`;
const FOCUS_RING_OUTER: string = `0 0 0 2px ${palette.darkPrimary.main}`;
const FOCUS_RING: string = `${FOCUS_RING_INNER}, ${FOCUS_RING_OUTER}`;
const TODAY_RING: string = `inset 0 0 0 1px ${palette.primary.main}`;

// The day number's ink: white on an endpoint disc, brand-blue in-range (Figma),
// greyed when out of range, dark otherwise. Layered as fallbacks rather than an
// if/return chain so the helper keeps a single exit.
function dayInk(day: DayDescriptor): string {
  const rangeInk: string = day.inRange ? palette.primary.main : palette.grey200.main;
  const enabledInk: string = day.disabled ? palette.grey400.main : rangeInk;
  return day.selected ? palette.white.main : enabledInk;
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
