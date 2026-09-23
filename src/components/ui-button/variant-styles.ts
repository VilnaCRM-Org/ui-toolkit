import type { Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

export type ButtonStyle = Record<string, unknown>;

export type ButtonVariantProps = {
  variant?: string | undefined;
  size?: string | undefined;
  name?: string | undefined;
};

export type ButtonVariantRule = {
  props: ButtonVariantProps;
  style: ButtonStyle;
};

export type ButtonSxState = ButtonVariantProps & { busy: boolean };

const baseButtonStyles: ButtonStyle = {
  textTransform: 'none',
  textDecoration: 'none',
  fontSize: '0.938rem',
  fontFamily: fontFamilies.golos,
  fontWeight: '500',
  lineHeight: '1.125rem',
  letterSpacing: '0',
  borderRadius: '3.563rem',
};

export const mediumLabelBox: ButtonStyle = {
  fontWeight: '600',
  fontSize: '1.125rem',
  lineHeight: '1.375rem',
  padding: '1.25rem 2rem',
};

export const containedStyles: (theme: Theme) => ButtonStyle = cacheByTheme(
  (theme: Theme): ButtonStyle => ({
    ...baseButtonStyles,
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.containedButtonHover.main,
    },
    '&:active': {
      backgroundColor: theme.palette.containedButtonActive.main,
    },
    '&:disabled': {
      backgroundColor: theme.palette.brandGray.main,
      color: theme.palette.white.main,
    },
  })
);

export const outlinedStyles: (theme: Theme) => ButtonStyle = cacheByTheme(
  (theme: Theme): ButtonStyle => ({
    ...baseButtonStyles,
    color: theme.palette.darkSecondary.main,
    backgroundColor: theme.palette.white.main,
    border: `1px solid ${theme.palette.grey300.main}`,
    '&:hover': {
      backgroundColor: theme.palette.grey500.main,
      border: '1px solid rgba(0,0,0,0)',
    },
    '&:active': {
      border: `1px solid ${theme.palette.grey500.main}`,
    },
    '&:disabled': {
      backgroundColor: theme.palette.brandGray.main,
      color: theme.palette.white.main,
      border: '1px solid transparent',
    },
  })
);

function dangerPressed(theme: Theme, fill: string): ButtonStyle {
  return {
    backgroundColor: fill,
    border: '1px solid transparent',
    color: theme.palette.white.main,
  };
}

export const dangerStyles: (theme: Theme) => ButtonStyle = cacheByTheme(
  (theme: Theme): ButtonStyle => ({
    ...baseButtonStyles,
    padding: '0.6875rem 1.4375rem',
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    border: `1px solid ${theme.palette.strokeDanger.main}`,
    color: theme.palette.error.main,
    '&:hover': dangerPressed(theme, theme.palette.error.main),
    '&:active': dangerPressed(theme, theme.palette.strokeDanger.main),
    '&:disabled': dangerPressed(theme, theme.palette.brandGray.main),
  })
);

export function containedMediumStyles(theme: Theme): ButtonStyle {
  return {
    ...containedStyles(theme),
    ...mediumLabelBox,
    alignSelf: 'center',
    [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
      fontSize: '0.9375rem',
      fontWeight: '400',
      lineHeight: '1.125rem',
      padding: '1rem 1.438rem',
    },
  };
}
