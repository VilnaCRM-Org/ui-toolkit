import { Box } from '@mui/material';
import React from 'react';

import { FieldSpinner } from './field-spinner';
import { loadingSlotSx } from './field-spinner-styles';

/**
 * The busy arc for a field whose slot must be positioned absolutely — the two
 * selects, where MUI already fills the trailing flow with its own clear and
 * popup indicators. `UiSearchInput` is deliberately not built on this: it emits
 * no end adornment of its own, so its arc sits in the flow instead.
 *
 * The two selects differ only in WHERE that slot sits, so the markup lives here
 * once and they cannot drift apart in their busy state. Each passes its own
 * coordinates, derived from its own theme's indicator geometry.
 *
 * Tri-state, like every other loading surface in the kit: `undefined` renders
 * nothing at all, so a consumer that never opts into the loading contract keeps
 * exactly today's DOM and today's baselines; `false` reserves the slot
 * invisibly so nothing reflows when a fetch starts; `true` paints the arc.
 */
export function slotAdornment(
  right: string,
  top: string,
  loading: boolean | undefined
): React.ReactNode {
  if (loading === undefined) {
    return null;
  }
  return (
    <Box sx={loadingSlotSx(right, top, loading)}>
      <FieldSpinner />
    </Box>
  );
}
