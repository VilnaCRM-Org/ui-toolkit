import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';
import { fontFamilies } from '@/utils/font-tokens';

const palette: Theme['palette'] = colorTheme.palette;

export const chipSx: SxProps<Theme> = {
  height: 'auto',
  borderRadius: '0.5rem',
  backgroundColor: alpha(palette.primary.main, 0.1),
  border: '1px solid transparent',
  color: palette.primary.main,
  fontFamily: fontFamilies.inter,
  fontSize: '1rem',
  fontWeight: 500,
  lineHeight: '1.125rem',
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
