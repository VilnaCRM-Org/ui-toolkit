import type { Theme } from '@mui/material';

import { fontFamilies } from '@/utils/font-tokens';

import type { ButtonStyle } from './variant-styles';

export function socialButtonStyles(theme: Theme): ButtonStyle {
  const white: string = theme.palette.white.main;
  return {
    fontFamily: fontFamilies.golos,
    textTransform: 'none',
    lineHeight: '1.375rem',
    borderRadius: '0.75rem',
    padding: '1.0625rem',
    gap: '0.563rem',
    border: `1px solid ${theme.palette.brandGray.main}`,
    background: white,
    color: theme.palette.darkPrimary.main,
    '&:hover': {
      background: white,
      boxShadow: '0px 4px 7px 0px rgba(116, 134, 151, 0.17)',
      border: `1px solid ${theme.palette.brandGray.main}`,
    },
    '&:active': {
      background: white,
      boxShadow: '0px 4px 7px 0px rgba(71, 85, 99, 0.21)',
      border: `1px solid ${theme.palette.grey300.main}`,
    },
    '&:disabled': socialDisabledStyles(theme),
  };
}

function socialDisabledStyles(theme: Theme): ButtonStyle {
  return {
    background: theme.palette.brandGray.main,
    boxShadow: 'none',
    border: '1px solid transparent',
    img: {
      opacity: '0.2',
    },
    div: {
      color: theme.palette.white.main,
    },
  };
}
