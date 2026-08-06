// Chip and delete-affordance styling for the multi-select. Colours come from the
// shared theme; contrast hardening of the chip/delete tokens is deferred to the
// accessibility-visuals PR (see Story 1.3), consistent with the other Epic 2
// controls. The sr-only helper for the live region is shared via field-controls.
import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';

export { srOnlySx } from '../field-controls';

const palette: Theme['palette'] = colorTheme.palette;

// Figma "Multiselect" chip. REST (node 535:37538): a faint-blue fill with a
// brand-blue Inter Medium 16/18 label and a plain brand-blue × — no border, no
// circle. HOVER (node 622:44563): the chip gains a 1px brand-blue border and its ×
// becomes a filled brand-blue circle with a white glyph. 8px radius, 9px/12px
// inset, 4px gap to the ×. (Blue-on-faint-blue is below AA text contrast — the
// deferred accessibility-visuals hardening, consistent with the other controls.)
export const chipSx: SxProps<Theme> = {
  height: 'auto',
  borderRadius: '0.5rem',
  backgroundColor: alpha(palette.primary.main, 0.1),
  // Transparent 1px border at rest reserves the space so the hover border adds no
  // layout shift; it colours in on hover.
  border: '1px solid transparent',
  color: palette.primary.main,
  fontFamily: 'Inter',
  fontSize: '1rem',
  fontWeight: 500,
  lineHeight: '1.125rem',
  // Figma Inter Medium 16/18 has letterSpacing 0; MUI's Chip adds ~0.15px, which
  // widens the label — pin it to 0 so the badge is the Figma width.
  letterSpacing: 0,
  '& .MuiChip-label': {
    padding: '0.5625rem 0 0.5625rem 0.75rem',
  },
  '& .MuiChip-deleteIcon': {
    margin: '0 0.75rem 0 0.25rem',
  },
  '&:hover': {
    borderColor: palette.primary.main,
    '& .ui-chip-x': {
      backgroundColor: palette.primary.main,
      color: palette.white.main,
    },
  },
  '&.Mui-disabled': { opacity: 0.6 },
};

// The delete affordance is the Figma 20px × (node 535:37540) so the badge is the
// exact design width; removal also has a keyboard path (Backspace / arrow-then-
// Delete), the WCAG 2.5.8 equivalent-control exception (DEV-24). A plain brand-blue
// glyph at rest, a filled brand-blue circle with a white glyph on chip hover (from
// `chipSx`).
export const deleteButtonSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  padding: 0,
  cursor: 'pointer',
};

export const deleteCircleSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: 'transparent',
  color: palette.primary.main,
};
