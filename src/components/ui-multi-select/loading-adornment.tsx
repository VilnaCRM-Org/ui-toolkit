import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { FieldSpinner, FIELD_SPINNER_RING } from '../field-controls';

/**
 * The ring is drawn AROUND the clear-all ×, not in place of it.
 *
 * This control differs from UiSelectWithSearch on purpose: its × is
 * Figma-mandated always-visible (node 622:44553 — the theme forces
 * `visibility: 'visible'`), so suppressing it while loading would remove a
 * design-mandated affordance rather than an MUI-stock one. Encircling keeps both
 * the control and the busy signal.
 *
 * Concentric by construction. MUI pins `.MuiAutocomplete-endAdornment` at
 * `right: 9px`, this theme insets the 24px chevron by a further 15px and gives
 * the clear button `marginRight: 2px`, so the clear button's right edge lands
 * 9 + 15 + 24 + 2 = 50px in from the field's right edge; its box is 32px (a 24px
 * glyph plus MUI's 4px IconButton padding on each side), which is exactly the
 * ring diameter. `top` matches the theme's own `endAdornment` pin — that rule
 * deliberately does NOT re-centre when chips wrap onto a second row, so the ring
 * must not either.
 */
const RING_SX: SxProps<Theme> = {
  position: 'absolute',
  right: '3.125rem',
  top: '1rem',
  display: 'inline-flex',
};

const RESERVED_SX: SxProps<Theme> = [RING_SX, { visibility: 'hidden' }];

/**
 * Tri-state, matching the other fields: `undefined` renders nothing at all, so a
 * consumer that never opts in keeps today's DOM and today's baselines.
 */
export function multiSelectLoadingAdornment(loading: boolean | undefined): React.ReactNode {
  if (loading === undefined) {
    return null;
  }
  return (
    <Box sx={loading ? RING_SX : RESERVED_SX}>
      <FieldSpinner size={FIELD_SPINNER_RING} />
    </Box>
  );
}
