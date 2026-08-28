import { Box } from '@mui/material';
import React from 'react';

// Internal port of CRM's `ui-live-status`: a visually-hidden `role="status"`
// region that announces the submitting state — the in-button spinner is
// aria-hidden and `aria-busy` alone is not announced by major screen readers
// (WCAG 4.1.3). Kept inside ui-form (not exported) so the public export
// register stays untouched; promote to a shared component when another
// consumer appears.
const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
} as const;

export default function LiveStatus({ message }: { message: string }): React.ReactElement {
  return (
    <Box component="span" role="status" aria-atomic="true" sx={visuallyHidden}>
      {message}
    </Box>
  );
}
