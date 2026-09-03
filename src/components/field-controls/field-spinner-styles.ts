import type { SxProps, Theme } from '@mui/material';

import colorTheme from '../ui-color-theme';

/** 20px — the shared `field-controls` Glyph box, and the default. */
export const FIELD_SPINNER_MD: string = '1.25rem';

/**
 * The submit spinner's thickness (`ui-form/submit-spinner.tsx`), reused so every
 * loading arc in the kit is drawn at one weight. MUI measures `thickness` in the
 * 44-unit viewBox, so the painted stroke scales with the box: 4.5 over a 20px
 * spinner is ~2.05px — the ring weight `ui-status-badge` already uses.
 */
export const FIELD_SPINNER_THICKNESS: number = 4.5;

/**
 * Ink is `grey300` #969B9D — the same ink the resting magnifier and chevron
 * already use, so the arc reads as part of the field's own icon language rather
 * than as a heavier foreign mark. Owner direction (2026-09-03): the indicator
 * should sit in the light-grey family the skeletons use, and match the CRM
 * loader's light appearance.
 *
 * That is a deliberate contrast position, not an oversight: #969B9D is 2.81:1 on
 * white, under the 3:1 non-text floor (SC 1.4.11, DEV-62), the same call CRM
 * already ratified for its own white-on-`brandGray` loader. It is not the sole
 * channel — the busy state is also spoken by a polite `role="status"` region —
 * and the darker `grey250` #57595B (7.03:1) is a one-token swap if the ruling is
 * ever overturned. On the contained button the arc goes white instead, over the
 * brand fill (see `ui-button/loading.tsx`).
 *
 * `pointerEvents: 'none'` is load-bearing, not polish. In UiMultiSelect the ring
 * is drawn ON TOP OF the real clear-all button, and a CircularProgress is an HTML
 * box whose whole rectangle captures clicks — transparent centre or not. Without
 * this, turning on `loading` would silently stop "clear all" from working.
 * `cursor: 'default'` keeps the trailing edge from reading as an affordance: it
 * sits in the slot where fields elsewhere in this kit put clear/submit controls,
 * and nothing here is actionable.
 *
 * Reduced motion freezes the arc but never hides it — the indicator is the only
 * thing painting "busy", so removing it would drop the information rather than
 * the animation. MUI does route CircularProgress through its reduced-motion
 * styles, but `theme.motion.reducedMotion` defaults to `'never'` and this kit
 * never sets it, so the media query is written here — the same per-primitive
 * shape `ui-skeletons/base.ts` uses.
 */
export const fieldSpinnerSx: SxProps<Theme> = {
  color: colorTheme.palette.grey300.main,
  pointerEvents: 'none',
  cursor: 'default',
  flexShrink: 0,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
    '& .MuiCircularProgress-circle': { animation: 'none' },
  },
};

/**
 * The one loading-slot recipe. Every field paints the SAME thing while busy —
 * the arc on its own, at the control's trailing indicator slot — so the busy
 * state reads identically across the kit rather than per-control.
 *
 * The two selects overlay their indicator slot absolutely (their trailing edge
 * is already occupied by MUI's clear/chevron stack, and the clear is hidden
 * underneath while the arc shows); UiSearchInput renders the same arc in flow,
 * because `freeSolo` + `disableClearable` + `popupIcon={null}` leave its end
 * slot genuinely empty. Same glyph, same size, same ink — only the anchoring
 * differs, because the DOM underneath differs.
 *
 * `painted: false` reserves the slot invisibly so nothing reflows when a fetch
 * starts.
 */
export function loadingSlotSx(right: string, top: string, painted: boolean): SxProps<Theme> {
  return {
    position: 'absolute',
    right,
    top,
    display: 'inline-flex',
    ...(painted ? {} : { visibility: 'hidden' }),
  };
}
