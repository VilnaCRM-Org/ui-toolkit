import { Box } from '@mui/material';
import React from 'react';

import { deleteButtonSx, deleteCircleSx } from './styles';

// The removable-chip delete affordance. MUI's `Chip` clones this element and
// injects the delete `onClick`/`className`, so the outer `Box` must be a real DOM
// element for those to land. It is named for assistive tech ("Remove Kyiv") and
// stays out of the tab order. It is the Figma-exact 20×20 affordance (node
// 535:37540), NOT a 24×24 target, and DEV-24 records that no SC 2.5.8 exception
// closes the gap: the "Equivalent" exception needs a DIFFERENT control on the same
// page that itself meets 24 CSS px, which a keyboard path is not (keyboard
// operability is SC 2.1.1). The undersized pointer target is therefore an accepted
// deviation, mitigated by a full keyboard removal path (Backspace, or
// arrow-then-Delete) — see `deleteButtonSx` in `./styles`. Inside sits the Figma
// 20px brand-blue circle with a white × glyph.
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
      <Box component="span" className="ui-chip-x" sx={deleteCircleSx}>
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
    </Box>
  );
}
