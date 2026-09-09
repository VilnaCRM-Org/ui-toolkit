import { Box } from '@mui/material';
import React from 'react';

import CalendarGrid from './calendar-grid';
import CalendarHeader from './calendar-header';
import { dividerSx, srOnlySx, surfaceSx } from './styles';
import type { CalendarController } from './use-calendar';
import type { CalendarField } from './use-calendar-field';

export interface CalendarSurfaceProps {
  field: CalendarField;
  calendar: CalendarController;
}

// The bordered calendar (header, a 1px rule, then the grid) plus the hidden
// polite month announcer. Takes the whole `field`/`calendar` bundles so the
// wiring stays compact.
function CalendarSurface({ field, calendar }: Readonly<CalendarSurfaceProps>): React.ReactElement {
  return (
    <>
      <Box sx={surfaceSx(field.invalid, field.disabled, field.size)}>
        <CalendarHeader field={field} calendar={calendar} />
        <Box component="hr" aria-hidden="true" sx={dividerSx} />
        <CalendarGrid field={field} calendar={calendar} />
      </Box>
      <Box role="status" aria-live="polite" aria-atomic="true" sx={srOnlySx}>
        {calendar.monthAnnouncement}
      </Box>
    </>
  );
}

export default CalendarSurface;
