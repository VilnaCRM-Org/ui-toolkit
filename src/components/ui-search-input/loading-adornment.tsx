import { InputAdornment } from '@mui/material';
import React from 'react';

import { FieldSpinner } from '../field-controls';

// `false` keeps the slot in the layout but unpainted, so the typed text does not
// reflow the moment a fetch starts; `visibility` (not `display`) is what reserves
// the box.
const RESERVED_SX = { visibility: 'hidden' } as const;

/**
 * The trailing loading slot, mirroring the leading magnifier: the shared field
 * spinner in an end `InputAdornment`, which the theme insets by the same 10px
 * gap the magnifier uses on the other side.
 *
 * It can sit in the flow (rather than absolutely, as in the two selects) because
 * MUI emits no end adornment of its own for this field — `freeSolo` +
 * `disableClearable` + `popupIcon={null}` leave both `hasClearIcon` and
 * `hasPopupIcon` false — so the slot is genuinely free, and an in-flow adornment
 * also shortens the input box, which is what keeps a long typed value from
 * running underneath the arc.
 *
 * Tri-state: `undefined` renders nothing at all, so a consumer that never opts
 * into the loading contract gets exactly today's DOM and today's baselines.
 */
export function searchLoadingAdornment(loading: boolean | undefined): React.ReactNode {
  if (loading === undefined) {
    return null;
  }
  return (
    <InputAdornment position="end" sx={loading ? undefined : RESERVED_SX}>
      <FieldSpinner />
    </InputAdornment>
  );
}
