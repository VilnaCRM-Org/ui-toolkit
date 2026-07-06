import { Box } from '@mui/material';
import React from 'react';

import { deleteButtonSx } from './styles';

// The removable-chip delete affordance. MUI's `Chip` clones this element and
// injects the delete `onClick`/`className`, so it must be a real DOM element (a
// `Box`, not a nested custom component) for those to land. It is named for
// assistive tech ("Remove Kyiv"), meets the 24×24 target size (WCAG 2.5.8), and
// stays out of the tab order (removal is via Backspace / arrow-then-Delete).
const CROSS_PATH: string = 'M4 4l8 8M12 4l-8 8';

export function buildDeleteIcon(label: string): React.ReactElement {
  return (
    <Box
      component="span"
      role="button"
      aria-label={`Remove ${label}`}
      tabIndex={-1}
      sx={deleteButtonSx}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={CROSS_PATH} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </Box>
  );
}
