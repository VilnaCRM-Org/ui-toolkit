import type { Theme } from '@mui/material';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme, type OptionsRecord } from '@/utils/ui-theme';

export interface InputSlotStyles {
  root: OptionsRecord;
  inputRoot: OptionsRecord;
  notchedOutline: OptionsRecord;
  inputLabel: OptionsRecord;
  formHelperText: OptionsRecord;
}

function inputRootStyles(theme: Theme): OptionsRecord {
  const { palette } = theme;
  return {
    fontFamily: fontFamilies.inter,
    letterSpacing: 'inherit',
    borderRadius: '0.5rem',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.grey300.main },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: `1px solid ${palette.grey250.main}`,
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: palette.strokeDanger.main },
    '&.Mui-disabled': {
      backgroundColor: palette.brandGray.main,
      color: palette.grey300.main,
    },
    '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderWidth: 0 },
  };
}

function notchedOutlineStyles(theme: Theme): OptionsRecord {
  return {
    border: `1px solid ${theme.palette.grey400.main}`,
    borderRadius: '0.5rem',
    '&:hover': { borderColor: theme.palette.grey300.main },
  };
}

function placeholderStyles(theme: Theme): OptionsRecord {
  return {
    color: theme.palette.grey300.main,
    fontFamily: fontFamilies.inter,
    fontSize: '1rem',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '1.125rem',
  };
}

function smallScreenStyles(): OptionsRecord {
  return {
    padding: '0 1.25rem',
    height: '3rem',
    '&::placeholder': { fontSize: '0.875rem', fontWeight: '500', lineHeight: '1.125rem' },
  };
}

function nativeInputStyles(theme: Theme): OptionsRecord {
  const { palette } = theme;
  return {
    padding: '0 1.75rem',
    height: '4rem',
    borderRadius: '0.5rem',
    background: palette.white.main,
    '&::placeholder': placeholderStyles(theme),
    '@media (max-width: 1130px)': {
      height: '4.938rem',
      '&::placeholder': { fontSize: '1.125rem' },
    },
    [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: smallScreenStyles(),
    '&:disabled': {
      backgroundColor: palette.brandGray.main,
      color: palette.grey300.main,
      WebkitTextFillColor: palette.grey300.main,
    },
  };
}

function formHelperTextStyles(theme: Theme): OptionsRecord {
  return {
    fontFamily: fontFamilies.inter,
    letterSpacing: 'inherit',
    '&.Mui-error': {
      margin: '0.25rem 0 0 0',
      fontFamily: fontFamilies.inter,
      fontWeight: '500',
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
      letterSpacing: 0,
      color: theme.palette.error.main,
    },
  };
}

export const inputSlotStyles: (theme: Theme) => InputSlotStyles = cacheByTheme(
  (theme: Theme): InputSlotStyles => ({
    root: { input: nativeInputStyles(theme) },
    inputRoot: inputRootStyles(theme),
    notchedOutline: notchedOutlineStyles(theme),
    inputLabel: { fontFamily: fontFamilies.inter, letterSpacing: 'inherit' },
    formHelperText: formHelperTextStyles(theme),
  })
);
