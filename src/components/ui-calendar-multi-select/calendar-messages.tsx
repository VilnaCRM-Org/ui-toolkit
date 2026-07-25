import { Box, FormHelperText } from '@mui/material';
import React from 'react';

import { srOnlySx } from './styles';
import type { CalendarField } from './use-calendar-field';

export interface CalendarMessagesProps {
  field: CalendarField;
  helperText?: React.ReactNode;
}

// The visible helper text (a description linked via `aria-describedby`) plus a
// dedicated, always-present visually-hidden `role="alert"` region populated only
// while invalid — so the error is announced even when the helper-text content
// itself does not change (a `role` toggled onto a static node does not announce).
function CalendarMessages({
  field,
  helperText,
}: Readonly<CalendarMessagesProps>): React.ReactElement {
  return (
    <>
      {helperText != null && (
        <FormHelperText id={field.helperId} error={field.invalid}>
          {helperText}
        </FormHelperText>
      )}
      <Box role="alert" sx={srOnlySx}>
        {field.invalid ? helperText : null}
      </Box>
    </>
  );
}

export default CalendarMessages;
