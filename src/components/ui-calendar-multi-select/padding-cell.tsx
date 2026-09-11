import { Box } from '@mui/material';
import React from 'react';

import { adjacentDaySx, paddingCellSx } from './styles';

export interface PaddingCellProps {
  /** The adjacent month's day number, shown muted. */
  dayNumber: number;
}

// An adjacent-month slot (previous month up top, next month at the bottom). It
// stays a real `gridcell` (not `aria-hidden`) so the grid keeps seven cells per
// row; it is non-focusable and non-selectable, and its faint day number is
// `aria-hidden` so assistive tech reads it as an empty out-of-month cell.
function PaddingCell({ dayNumber }: Readonly<PaddingCellProps>): React.ReactElement {
  return (
    <Box role="gridcell" aria-disabled tabIndex={-1} sx={paddingCellSx}>
      <Box component="span" aria-hidden sx={adjacentDaySx}>
        {dayNumber}
      </Box>
    </Box>
  );
}

export default PaddingCell;
