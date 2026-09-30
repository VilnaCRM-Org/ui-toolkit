import type { Theme } from '@mui/material';

import { fontFamilies } from '@/utils/font-tokens';
import { uiBreakpointValues } from '@/utils/ui-breakpoint-queries';
import { cacheByTheme, type OptionsRecord } from '@/utils/ui-theme';

import { disabledNativeInputStyles, inputSlotStyles, type InputSlotStyles } from './slot-styles';

function minWidth(px: number): string {
  return `@media (min-width:${px}px)`;
}

function crmPlaceholderStyles(theme: Theme): OptionsRecord {
  return {
    color: theme.palette.grey300.main,
    fontFamily: fontFamilies.inter,
    fontSize: '0.875rem',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '1.125rem',
  };
}

function crmValueStyles(theme: Theme): OptionsRecord {
  return {
    fontFamily: fontFamilies.inter,
    fontSize: '1rem',
    fontWeight: '500',
    lineHeight: '1.125rem',
    letterSpacing: 0,
    color: theme.palette.grey250.main,
  };
}

function crmBreakpointStyles(theme: Theme): OptionsRecord {
  const { md, xl } = uiBreakpointValues(theme);
  return {
    [minWidth(md)]: {
      height: '4.9375rem',
      '&::placeholder': { fontSize: '1.125rem', fontWeight: '400' },
    },
    [minWidth(xl)]: {
      maxHeight: '4rem',
      '&::placeholder': { fontSize: '1rem' },
    },
  };
}

function crmNativeInputStyles(theme: Theme): OptionsRecord {
  return {
    ...crmValueStyles(theme),
    boxSizing: 'border-box',
    height: 'clamp(3rem, 4vw, 4rem)',
    padding: '0 clamp(1.25rem, 2vw, 1.75rem)',
    background: 'transparent',
    '&::placeholder': crmPlaceholderStyles(theme),
    ...crmBreakpointStyles(theme),
    '&:disabled': disabledNativeInputStyles(theme),
  };
}

export const crmInputSlotStyles: (theme: Theme) => InputSlotStyles = cacheByTheme(
  (theme: Theme): InputSlotStyles => ({
    ...inputSlotStyles(theme),
    root: { input: crmNativeInputStyles(theme) },
  })
);

export function densitySlotStyles(theme: Theme, density: 'crm' | undefined): InputSlotStyles {
  return density === 'crm' ? crmInputSlotStyles(theme) : inputSlotStyles(theme);
}
