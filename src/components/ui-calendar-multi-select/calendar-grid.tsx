import { Box } from '@mui/material';
import React from 'react';

import CalendarBody from './calendar-body';
import { gridSx } from './styles';
import type { CalendarController } from './use-calendar';
import type { CalendarField } from './use-calendar-field';
import WeekdayHeader from './weekday-header';

export interface CalendarGridProps {
  field: CalendarField;
  calendar: CalendarController;
}

// The month grid: a `role="grid"` named by the caption. A completed range marks
// both endpoints `aria-selected`, so the grid is `aria-multiselectable` to keep the
// two selected cells consistent with the grid's selection model (WAI-ARIA). Keyboard
// navigation is handled once here; the roving tabindex lives on the day cells.
function CalendarGrid({ field, calendar }: Readonly<CalendarGridProps>): React.ReactElement {
  return (
    <Box
      role="grid"
      aria-labelledby={field.captionId}
      aria-describedby={field.describedBy}
      aria-multiselectable
      aria-disabled={field.disabled || undefined}
      onKeyDown={calendar.onGridKeyDown}
      sx={gridSx(field.size)}
    >
      <WeekdayHeader locale={calendar.locale} />
      <CalendarBody field={field} calendar={calendar} />
    </Box>
  );
}

export default CalendarGrid;
