import { Box, Typography } from '@mui/material';
import React from 'react';

import { labelSx, srOnlySx } from './styles';

export interface CalendarLabelProps {
  label?: string | undefined;
  required: boolean;
  show: boolean;
  id: string;
}

// The visible field label. A `required` field shows an `aria-hidden` asterisk for
// sighted users plus a visually-hidden " required" folded into the accessible
// name (the `role="group"` container cannot host `aria-required`).
function CalendarLabel({
  label,
  required,
  show,
  id,
}: Readonly<CalendarLabelProps>): React.ReactElement | null {
  if (!show) {
    return null;
  }
  return (
    <Typography component="span" id={id} sx={labelSx}>
      {label}
      {required && (
        <>
          <Box component="span" aria-hidden="true">
            {' *'}
          </Box>
          <Box component="span" sx={srOnlySx}>
            {' required'}
          </Box>
        </>
      )}
    </Typography>
  );
}

export default CalendarLabel;
