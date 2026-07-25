import { Box } from '@mui/material';
import React from 'react';

import CalendarBody from './calendar-body';
import { tableSx } from './styles';
import type { CalendarController } from './use-calendar';
import type { CalendarField } from './use-calendar-field';
import WeekdayHeader from './weekday-header';

export interface CalendarGridProps {
  field: CalendarField;
  calendar: CalendarController;
}

// The month grid: a `role="grid"` table named by the caption. Keyboard navigation
// is handled once here; the roving tabindex lives on the day cells.
function CalendarGrid({ field, calendar }: Readonly<CalendarGridProps>): React.ReactElement {
  return (
    <Box
      component="table"
      role="grid"
      aria-multiselectable="true"
      aria-labelledby={field.captionId}
      aria-describedby={field.describedBy}
      aria-disabled={field.disabled || undefined}
      onKeyDown={calendar.onGridKeyDown}
      sx={tableSx}
    >
      <WeekdayHeader size={field.size} />
      <CalendarBody field={field} calendar={calendar} />
    </Box>
  );
}

export default CalendarGrid;
