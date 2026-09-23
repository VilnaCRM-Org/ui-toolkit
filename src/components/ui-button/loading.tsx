import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { FieldSpinner, useFieldLoadingAnnouncement } from '../field-controls';

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

/**
 * Activation guard for the busy state.
 *
 * `aria-disabled` is a promise to assistive technology, not a browser
 * behaviour: the control stays focusable and still fires its default action.
 * Simply omitting `onClick` hides the consumer's handler while leaving that
 * default intact, so a busy submit button would still submit and a busy link
 * button would still navigate on a keyboard Enter. Preventing the default is
 * what actually closes the path, for pointer and keyboard alike.
 */
export function useBusyClick(
  busy: boolean,
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined
): React.MouseEventHandler<HTMLButtonElement> {
  return React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      if (busy) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    [busy, onClick]
  );
}

/** The centred, decorative arc drawn over the transparent label. */
export function ButtonSpinner(): React.ReactElement {
  return (
    <Box sx={CENTRE_SX}>
      <FieldSpinner />
    </Box>
  );
}
