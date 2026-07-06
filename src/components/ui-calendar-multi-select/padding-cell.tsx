import { Box } from '@mui/material';
import React from 'react';

import { paddingCellSx, type CalendarSize } from './styles';

export interface PaddingCellProps {
  size: CalendarSize;
}

// An empty adjacent-month slot. It stays a real `gridcell` (not `aria-hidden`) so
// the grid keeps seven cells per row; it is non-focusable and non-selectable.
function PaddingCell({ size }: Readonly<PaddingCellProps>): React.ReactElement {
  return (
    <Box component="td" role="gridcell" aria-disabled tabIndex={-1} sx={paddingCellSx(size)} />
  );
}

export default PaddingCell;
