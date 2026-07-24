// Chip and delete-affordance styling for the multi-select, plus the sr-only
// helper for the live region. Colours come from the shared theme; contrast
// hardening of the chip/delete tokens is deferred to the accessibility-visuals
// PR (see Story 1.3), consistent with the other Epic 2 controls.
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

export const chipSx: SxProps<Theme> = {
  borderRadius: '0.375rem',
  backgroundColor: palette.grey500.main,
  color: palette.grey200.main,
  fontFamily: 'Inter',
  // Inter Medium 14/18 keeps the chip label on the Figma form-UI type scale;
  // without an explicit size MUI's small Chip renders the label at 13px (off scale).
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: '1.125rem',
  '&.Mui-disabled': { opacity: 0.6 },
};

// ≥24×24 CSS px delete target (WCAG 2.5.8); the × glyph sits centred inside it.
export const deleteButtonSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 24,
  height: 24,
  padding: 0,
  cursor: 'pointer',
  color: palette.grey300.main,
  '&:hover': { color: palette.grey200.main },
};

/** Visually hidden but exposed to assistive tech (for the status live region). */
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
