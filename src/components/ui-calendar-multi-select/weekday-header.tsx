import { Box } from '@mui/material';
import React from 'react';

import { weekdaysLong, weekdaysShort } from './calendar-month';
import { weekRowSx, weekdayHeadingSx } from './styles';

export interface WeekdayHeaderProps {
  locale: string;
}

// Monday-first weekday header row: visible abbreviations with full-name
// `aria-label`s on each `columnheader`, both localised via `locale`.
function WeekdayHeader({ locale }: Readonly<WeekdayHeaderProps>): React.ReactElement {
  const short: string[] = weekdaysShort(locale);
  const long: string[] = weekdaysLong(locale);
  return (
    <Box role="rowgroup">
      <Box role="row" sx={weekRowSx}>
        {short.map((label, index) => (
          <Box role="columnheader" aria-label={long[index]} key={label} sx={weekdayHeadingSx}>
            {label}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default WeekdayHeader;
