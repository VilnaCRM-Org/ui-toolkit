import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { FieldSpinner } from '../field-controls';

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
const SLOT_SX: SxProps<Theme> = {
  position: 'absolute',
  right: '2.6875rem',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'inline-flex',
};

// `false` reserves nothing here — the slot is absolutely positioned, so it
// displaces no text and only needs to be painted or not.
const RESERVED_SX: SxProps<Theme> = [SLOT_SX, { visibility: 'hidden' }];

/**
 * Tri-state, matching the other fields: `undefined` renders nothing at all, so a
 * consumer that never opts in keeps today's DOM and today's baselines.
 */
export function selectLoadingAdornment(loading: boolean | undefined): React.ReactNode {
  if (loading === undefined) {
    return null;
  }
  return (
    <Box sx={loading ? SLOT_SX : RESERVED_SX}>
      <FieldSpinner />
    </Box>
  );
}
