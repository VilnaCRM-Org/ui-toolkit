import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

type LinkStyle = SystemStyleObject<Theme>;

function disabledStyles(theme: Theme): LinkStyle {
  const color: string = theme.palette.brandGray.main;
  return { color, cursor: 'default', '&:hover': { color }, '&:active': { color } };
}

function buildLinkStyles(theme: Theme): LinkStyle {
  return {
    color: theme.palette.primary.main,
    fontFamily: fontFamilies.inter,
    fontSize: '0.875rem',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '1.125rem',
    textDecoration: 'underline',
    [`@media (max-width: 1130px)`]: { fontSize: '1rem' },
    [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: { fontSize: '0.875rem' },
    '&:hover': { color: theme.palette.textLinkHover.main },
    '&:active': { color: theme.palette.textLinkActive.main },
    '&[aria-disabled="true"]': disabledStyles(theme),
  };
}

const linkStyles: (theme: Theme) => LinkStyle = cacheByTheme(buildLinkStyles);

function consumerSxArray(sx: SxProps<Theme> | undefined): LinkStyle[] {
  if (sx === undefined) {
    return [];
  }
  return (Array.isArray(sx) ? sx : [sx]) as LinkStyle[];
}

export function linkSx(theme: Theme, sx: SxProps<Theme> | undefined): SxProps<Theme> {
  return [linkStyles(theme), ...consumerSxArray(sx)];
}
