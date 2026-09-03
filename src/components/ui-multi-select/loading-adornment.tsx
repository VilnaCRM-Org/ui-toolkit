import { Box } from '@mui/material';
import React from 'react';

import { FieldSpinner, loadingSlotSx } from '../field-controls';

/**
 * The arc takes the clear-all ×'s slot and the × is hidden underneath — the same
 * treatment UiSelectWithSearch and UiSearchInput use, so a busy field looks the
 * same wherever it appears. (It previously drew a 32px ring AROUND the ×, which
 * made this the only control whose busy state looked different.)
 *
 * Geometry from MUI's own layout: `.MuiAutocomplete-endAdornment` is pinned
 * `right: 9px`, this theme insets the 24px chevron by a further 15px and gives
 * the clear button `marginRight: 2px`, so the clear slot starts 9 + 15 + 24 + 2
 * = 50px in from the field's right edge. `top` centres the 20px arc on the 32px
 * indicator row the theme pins at `top: 1rem` — that row deliberately does NOT
 * re-centre when chips wrap to a second line, so the arc must not either.
 */
const SLOT_RIGHT: string = '3.125rem';
const SLOT_TOP: string = '1.375rem';

/**
 * Tri-state, matching the other fields: `undefined` renders nothing at all, so a
 * consumer that never opts in keeps today's DOM and today's baselines.
 */
export function multiSelectLoadingAdornment(loading: boolean | undefined): React.ReactNode {
  if (loading === undefined) {
    return null;
  }
  return (
    <Box sx={loadingSlotSx(SLOT_RIGHT, SLOT_TOP, loading)}>
      <FieldSpinner />
    </Box>
  );
}
