import { Box } from '@mui/material';
import React from 'react';

import { WEEKDAYS_LONG, WEEKDAYS_SHORT } from './calendar-month';
import { weekdayHeadingSx, type CalendarSize } from './styles';

export interface WeekdayHeaderProps {
  size: CalendarSize;
}

// Monday-first weekday header row: visible abbreviations with full-name
// `aria-label`s on each `columnheader`.
function WeekdayHeader({ size }: Readonly<WeekdayHeaderProps>): React.ReactElement {
  return (
    <Box component="thead" role="rowgroup">
      <Box component="tr" role="row">
        {WEEKDAYS_SHORT.map((short, index) => (
          <Box
            component="th"
            role="columnheader"
            scope="col"
            key={short}
            aria-label={WEEKDAYS_LONG[index]}
            sx={weekdayHeadingSx(size)}
          >
            {short}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default WeekdayHeader;
