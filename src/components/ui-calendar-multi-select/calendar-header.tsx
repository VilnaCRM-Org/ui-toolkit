import { Box, IconButton, Typography } from '@mui/material';
import React from 'react';

import { ChevronGlyph } from './icons';
import { captionSx, headerSx, navButtonSx } from './styles';
import type { CalendarController } from './use-calendar';
import type { CalendarField } from './use-calendar-field';

export interface CalendarHeaderProps {
  field: CalendarField;
  calendar: CalendarController;
}

// Month caption flanked by previous/next navigation buttons. The caption is a
// plain `span` (not a heading — a fixed heading level would be an orphan on an
// arbitrary host page); it names the grid via `aria-labelledby`.
function CalendarHeader({ field, calendar }: Readonly<CalendarHeaderProps>): React.ReactElement {
  return (
    <Box sx={headerSx}>
      <IconButton
        aria-label="Previous month"
        disabled={field.disabled}
        onClick={calendar.onPrevMonth}
        sx={navButtonSx}
      >
        <ChevronGlyph direction="left" />
      </IconButton>
      <Typography component="span" id={field.captionId} sx={captionSx}>
        {calendar.caption}
      </Typography>
      <IconButton
        aria-label="Next month"
        disabled={field.disabled}
        onClick={calendar.onNextMonth}
        sx={navButtonSx}
      >
        <ChevronGlyph direction="right" />
      </IconButton>
    </Box>
  );
}

export default CalendarHeader;
