import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { FieldSpinner, useFieldLoadingAnnouncement } from '../field-controls';
import colorTheme from '../ui-color-theme';

/**
 * The busy paint. Only the label's INK goes transparent — the text stays in the
 * DOM, so the button keeps both its width and its accessible name. Never
 * `visibility: hidden`, `display: none` or `aria-hidden` on the label: each of
 * those would strip the name and leave a nameless control.
 *
 * `pointerEvents` closes the mouse path; the keyboard path is closed by not
 * wiring `onClick` while busy (see `index.tsx`), because a button that is
 * `aria-disabled` rather than natively disabled still receives Enter/Space.
 */
const BUSY_SX: SxProps<Theme> = {
  position: 'relative',
  color: 'transparent',
  pointerEvents: 'none',
  cursor: 'default',
  // The shared field ink is a light grey tuned for a white field; over the
  // contained button's brand fill it reads muddy. CRM draws this exact case in
  // white (`ui-form/submit-spinner.tsx`, `route-fallback/styles.ts`), so the
  // contained variant — brand blue, and the `danger` red that also builds on it —
  // takes white. Scoped by variant so `outlined`/`text`, which sit on white,
  // keep the grey arc that is legible there. Two class selectors, so this wins
  // over the spinner's own single-class colour without an `!important`.
  '&.MuiButton-contained .MuiCircularProgress-root': {
    color: colorTheme.palette.white.main,
  },
};

const CENTRE_SX: SxProps<Theme> = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'inline-flex',
};

export interface ButtonBusyState {
  /** True only for an explicit `loading` — `undefined` opts out entirely. */
  busy: boolean;
  /** Polite live-region text: empty until the fetch crosses the announce delay. */
  announced: string;
}

/**
 * A standalone button is not inside a form carrying `aria-busy`, so without this
 * a screen-reader user can activate it and get no confirmation at all that
 * anything happened — the spinner is decorative by design, and MUI's own
 * indicator is only heard while focus stays on the control.
 */
export function useButtonBusy(loading?: boolean | null, loadingText?: string): ButtonBusyState {
  const announced: string = useFieldLoadingAnnouncement({ loading, loadingText });
  return { busy: loading === true, announced };
}

/** Layers the busy paint UNDER the consumer `sx`, so a consumer override wins. */
export function busySx(busy: boolean, sx: SxProps<Theme> | undefined): SxProps<Theme> | undefined {
  if (!busy) {
    return sx;
  }
  const consumerSx: SxProps<Theme> = sx ?? {};
  return [BUSY_SX, ...(Array.isArray(consumerSx) ? consumerSx : [consumerSx])];
}

/** The centred, decorative arc drawn over the transparent label. */
export function ButtonSpinner(): React.ReactElement {
  return (
    <Box sx={CENTRE_SX}>
      <FieldSpinner />
    </Box>
  );
}
