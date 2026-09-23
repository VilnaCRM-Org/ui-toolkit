import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme, mergeOptions, type OptionsRecord } from '@/utils/ui-theme';

import { helperTextTypography } from './helper-text';

type SlotStyle = SystemStyleObject<Theme>;

export interface FieldSlotStyles {
  inputRoot: SlotStyle;
  notchedOutline: SlotStyle;
  htmlInput: SlotStyle;
  formHelperText: SlotStyle;
}

function inputRootStyles(theme: Theme): SlotStyle {
  const { palette } = theme;
  return {
    borderRadius: '0.5rem',
    caretColor: palette.primary.main,
    '&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.grey400.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: `1px solid ${palette.grey250.main}`,
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.strokeDanger.main,
    },
    '&.Mui-disabled': {
      backgroundColor: palette.brandGray.main,
      color: palette.grey300.main,
    },
    '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
      borderWidth: 0,
    },
  };
}

function notchedOutlineStyles(theme: Theme): SlotStyle {
  return {
    border: `1px solid ${theme.palette.grey400.main}`,
    borderRadius: '0.5rem',
  };
}

function htmlInputStyles(theme: Theme): SlotStyle {
  return {
    '&::placeholder': {
      color: theme.palette.grey300.main,
      opacity: 1,
      fontFamily: fontFamilies.inter,
      fontWeight: '400',
    },
  };
}

export const outlinedFieldStyles: (theme: Theme) => FieldSlotStyles = cacheByTheme(
  (theme: Theme): FieldSlotStyles => ({
    inputRoot: inputRootStyles(theme),
    notchedOutline: notchedOutlineStyles(theme),
    htmlInput: htmlInputStyles(theme),
    formHelperText: helperTextTypography(theme.palette),
  })
);

export function mergeFieldStyles(
  base: FieldSlotStyles,
  overrides: Partial<FieldSlotStyles>
): FieldSlotStyles {
  return mergeOptions(
    base as unknown as OptionsRecord,
    overrides as unknown as OptionsRecord
  ) as unknown as FieldSlotStyles;
}
