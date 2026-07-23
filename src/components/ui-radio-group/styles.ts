import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Figma "radiobutton" (node 151:6441): a 20px circle with a white fill. The
// unselected state is a 1px #D0D4D8 stroke; the selected state is a 5px #1EAEFF
// ring — the thick primary border leaves a white centre, the classic filled
// radio look. Both colours are existing tokens (grey400 / primary). States the
// Figma frame does not specify (hover / disabled / error) reuse the established
// UiCheckbox / multi-select treatments — see the Story 2.4 implementation
// artifact. Contrast hardening of the tokens is deferred to the
// accessibility-visuals PR (per Story 1.3), consistent with the other controls.
const dotBase: SxProps<Theme> = {
  display: 'block',
  width: '1.25rem',
  height: '1.25rem',
  borderRadius: '50%',
  boxSizing: 'border-box',
  backgroundColor: palette.white.main,
} as const;

const checkedDot: SxProps<Theme> = {
  border: `5px solid ${palette.primary.main}`,
};

const baseRadio: SxProps<Theme> = {
  padding: 0,
  marginRight: '0.5rem',
  // Compound selector (.ui-radio-dot.ui-radio-dot--checked) so the selected ring
  // wins over the base `.ui-radio-dot` rule regardless of emitted order.
  '& .ui-radio-dot.ui-radio-dot--checked': checkedDot,
  '&:hover:not(.Mui-disabled) .ui-radio-dot': {
    cursor: 'pointer',
    borderColor: palette.primary.main,
  },
  // Preserve the selection indicator when disabled (unlike a checkbox, a radio
  // is often pre-selected + disabled) by dimming rather than flattening to grey.
  '&.Mui-disabled': {
    opacity: 0.6,
    '& .ui-radio-dot': { cursor: 'default' },
  },
};

export default {
  radio: {
    ...baseRadio,
    '& .ui-radio-dot': {
      ...dotBase,
      border: `1px solid ${palette.grey400.main}`,
    },
  },
  radioError: {
    ...baseRadio,
    '& .ui-radio-dot': {
      ...dotBase,
      border: `1px solid ${palette.error.main}`,
    },
  },
  groupLabel: {
    marginBottom: '0.5rem',
    fontFamily: 'Inter',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    color: palette.grey200.main,
    '&.Mui-focused': { color: palette.grey200.main },
  },
  // Figma "radiobutton" group (node 448:25598): the options are stacked with a
  // 16px row gap.
  group: {
    gap: '1rem',
  },
  // Each option: no MUI negative offset (so the radio aligns to the group edge),
  // an 8px radio→label gap (owned by the radio's marginRight), and an Inter Medium
  // 16/18 #1B2327 label.
  option: {
    marginLeft: 0,
    marginRight: 0,
    '& .MuiFormControlLabel-label': {
      fontFamily: 'Inter',
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: '1.125rem',
      // Figma sets no tracking on the label; drop MUI's default body1 letter
      // spacing (0.00938em) so the copy matches the design 1:1.
      letterSpacing: 0,
      color: palette.darkSecondary.main,
    },
    '& .MuiFormControlLabel-label.Mui-disabled': {
      color: palette.darkSecondary.main,
    },
  },
};
