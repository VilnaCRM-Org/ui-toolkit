// Styling for the calendar: layout, weekday/day-cell states, focus ring and the
// sr-only helper. Colours come from the shared theme; contrast hardening is
// deferred to the accessibility-visuals PR (see Story 1.3).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

import type { DayDescriptor } from './view-model';

export { srOnlySx } from '../field-controls';

// Design tokens reused from the shared colour theme so the calendar matches the
// field controls (8px radius, grey400 stroke, brand-blue selection, danger error
// stroke, disabled greying) without duplicating hex values.
const palette: Theme['palette'] = colorTheme.palette;

export type CalendarSize = 'small' | 'medium';

// Target size ≥24px (WCAG 2.5.8); 32/40 give comfortable hit areas.
const CELL_PX: Record<CalendarSize, number> = { small: 32, medium: 40 };

// Only merged into the consumer sx by `mergeRootSx`, so kept module-local.
const rootSx: SxProps<Theme> = {
  display: 'inline-flex',
  flexDirection: 'column',
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
export function surfaceSx(error: boolean, disabled: boolean): SxProps<Theme> {
  const borderColor: string = error ? palette.strokeDanger.main : palette.grey400.main;
  return {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: `1px solid ${borderColor}`,
    backgroundColor: disabled ? palette.brandGray.main : palette.white.main,
    opacity: disabled ? 0.6 : 1,
    width: 'fit-content',
  };
}

export const headerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
};

export const captionSx: SxProps<Theme> = {
  fontFamily: 'Inter',
  fontWeight: 600,
  fontSize: '1rem',
  margin: 0,
  color: palette.grey200.main,
  userSelect: 'none',
};

export const navButtonSx: SxProps<Theme> = {
  color: palette.grey250.main,
  padding: '0.25rem',
  '&.Mui-disabled': { color: palette.grey400.main },
};

/** ≥2px gap between cells (WCAG 1.4.11) so adjacent selected days don't merge. */
export const tableSx: SxProps<Theme> = {
  borderCollapse: 'separate',
  borderSpacing: '2px',
};

export function weekdayHeadingSx(size: CalendarSize): SxProps<Theme> {
  return {
    width: `${CELL_PX[size]}px`,
    height: `${CELL_PX[size]}px`,
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '0.75rem',
    color: palette.grey300.main,
    textAlign: 'center',
    verticalAlign: 'middle',
    userSelect: 'none',
  };
}

export function paddingCellSx(size: CalendarSize): SxProps<Theme> {
  return { width: `${CELL_PX[size]}px`, height: `${CELL_PX[size]}px` };
}

// A two-colour focus ring stays visible on both the white surface and the blue
// selected fill (a single-colour ring vanishes on same-colour fill). Inner white
// ring vs the fill, outer dark ring vs the page — WCAG 2.4.7 / 2.4.11.
const FOCUS_RING_INNER: string = `inset 0 0 0 2px ${palette.white.main}`;
const FOCUS_RING_OUTER: string = `0 0 0 2px ${palette.darkPrimary.main}`;
const FOCUS_RING: string = `${FOCUS_RING_INNER}, ${FOCUS_RING_OUTER}`;
const TODAY_RING: string = `inset 0 0 0 1px ${palette.primary.main}`;

// Static day-cell styling shared by every state; the state-dependent bits are
// merged over it in `daySx` (kept split so `daySx` stays within the metrics budget).
const dayStaticSx = {
  boxSizing: 'border-box',
  borderRadius: '0.5rem',
  fontFamily: 'Inter',
  fontSize: '0.875rem',
  textAlign: 'center',
  verticalAlign: 'middle',
  outline: 'none',
  '&[aria-disabled="true"]': {
    color: palette.grey400.main,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    cursor: 'default',
    // Higher-specificity than the base `&:hover` so a disabled/out-of-range day
    // shows no hover fill (it is not an interactive affordance).
    '&:hover': { backgroundColor: 'transparent' },
  },
  '&:focus-visible': { boxShadow: FOCUS_RING },
} as const;

function dayHoverBg(selected: boolean): string {
  return selected ? palette.containedButtonHover.main : palette.grey500.main;
}

/** Merges the consumer's `sx` over the calendar root styling. */
export function mergeRootSx(consumer: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = consumer ?? {};
  return [rootSx, ...(Array.isArray(extra) ? extra : [extra])];
}

/** Per-day cell styling for every visual state (rest/hover/selected/today/disabled). */
export function daySx(day: DayDescriptor, size: CalendarSize): SxProps<Theme> {
  const { selected, today, disabled } = day;
  return {
    ...dayStaticSx,
    width: `${CELL_PX[size]}px`,
    height: `${CELL_PX[size]}px`,
    // Weight is a non-colour cue for selection (WCAG 1.4.1).
    fontWeight: selected ? 600 : 500,
    color: selected ? palette.white.main : palette.grey200.main,
    backgroundColor: selected ? palette.primary.main : 'transparent',
    // Today ring only when not selected (the fill already marks selected days).
    boxShadow: today && !selected ? TODAY_RING : 'none',
    cursor: disabled ? 'default' : 'pointer',
    '&:hover': { backgroundColor: dayHoverBg(selected) },
  };
}
