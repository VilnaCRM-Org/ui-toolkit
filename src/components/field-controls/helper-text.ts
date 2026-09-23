import type { Palette, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import colorTheme from '@/components/ui-color-theme';
import { fontFamilies } from '@/utils/font-tokens';

export function helperTextTypography(palette: Palette): SystemStyleObject<Theme> {
  return {
    margin: '0.25rem 0 0 0',
    fontFamily: fontFamilies.inter,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: '1.125rem',
    letterSpacing: 0,
    color: palette.grey250.main,
    '&.Mui-error': { color: palette.error.main },
  };
}

export const helperTextSx: SystemStyleObject<Theme> = {
  '& .MuiFormHelperText-root': helperTextTypography(colorTheme.palette),
};
