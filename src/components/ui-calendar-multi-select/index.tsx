import { Box, ThemeProvider } from '@mui/material';
import React from 'react';

import { outlinedFieldTheme } from '../field-controls';

import CalendarLabel from './calendar-label';
import CalendarMessages from './calendar-messages';
import CalendarSurface from './calendar-surface';
import type { UiCalendarMultiSelectProps } from './types';
import { useCalendar } from './use-calendar';
import { useCalendarField } from './use-calendar-field';
import { useCalendarWarnings } from './use-warnings';

// A calendar-style control for selecting many discrete dates. Structure follows
// the WAI-ARIA APG grid pattern: an outer `role="group"` (the field, carrying the
// accessible name / disabled state) wraps the bordered calendar surface (a
// `role="grid"` month with `aria-multiselectable`, roving-tabindex day cells, and
// a hidden polite month announcer) and the helper/alert messages.
function UiCalendarMultiSelect(props: Readonly<UiCalendarMultiSelectProps>): React.ReactElement {
  useCalendarWarnings(props);
  const calendar: ReturnType<typeof useCalendar> = useCalendar(props);
  const field: ReturnType<typeof useCalendarField> = useCalendarField(props);

  return (
    <ThemeProvider theme={outlinedFieldTheme}>
      <Box
        role="group"
        aria-labelledby={field.labelledBy}
        aria-label={field.ariaLabel}
        aria-disabled={field.disabled || undefined}
        sx={field.sx}
      >
        <CalendarLabel
          label={props.label}
          required={field.required}
          show={field.hasVisibleLabel}
          id={field.labelId}
        />
        <CalendarSurface field={field} calendar={calendar} />
        <CalendarMessages field={field} helperText={props.helperText} />
      </Box>
    </ThemeProvider>
  );
}

UiCalendarMultiSelect.displayName = 'UiCalendarMultiSelect';

export default UiCalendarMultiSelect;
