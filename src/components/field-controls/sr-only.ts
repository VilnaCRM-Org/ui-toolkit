import type { SxProps, Theme } from '@mui/material';

/**
 * Visually hidden, but still exposed to assistive technology — the standard
 * clip-rect technique. Shared by every field control that owns a live region
 * (`role="status"` / `role="alert"`) or a supplementary label that must be
 * announced without being painted.
 */
export const srOnlySx: SxProps<Theme> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
