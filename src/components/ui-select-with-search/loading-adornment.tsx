import { Box } from '@mui/material';
import React from 'react';

import { FieldSpinner, loadingSlotSx } from '../field-controls';

/**
 * The spinner takes the clear ×'s place at the field's trailing edge.
 *
 * MUI stacks `[clear][chevron]` inside an absolutely-positioned
 * `.MuiAutocomplete-endAdornment` pinned `right: 9px`, and this control's theme
 * leaves the chevron at MUI's own `marginRight: 8px` around a 24px glyph. So the
 * slot just left of the chevron starts at 9 + 8 + 24 = 41px from the field's
 * right edge; a further 2px lands the arc where the × sits. That position holds
 * whether or not a value is selected, because MUI only mounts the clear button
 * once the field is dirty — the spinner must not jump between those two cases.
 */
const SLOT_RIGHT: string = '2.6875rem';
const SLOT_TOP: string = '50%';

/**
 * Tri-state, matching the other fields: `undefined` renders nothing at all, so a
 * consumer that never opts in keeps today's DOM and today's baselines.
 */
export function selectLoadingAdornment(loading: boolean | undefined): React.ReactNode {
  if (loading === undefined) {
    return null;
  }
  return (
    <Box sx={loadingSlotSx(SLOT_RIGHT, SLOT_TOP, loading)}>
      <FieldSpinner />
    </Box>
  );
}
