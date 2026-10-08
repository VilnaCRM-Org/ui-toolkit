import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

type LinkStyle = SystemStyleObject<Theme>;

function buildTextLinkStyles(theme: Theme): LinkStyle {
  return {
    fontFamily: fontFamilies.golos,
    fontSize: '0.9375rem',
    fontWeight: '500',
    lineHeight: '1.125rem',
    letterSpacing: 0,
    '&:hover, &:focus-visible': { textDecoration: 'underline' },
    '&:focus-visible': {
      outline: `2px solid ${theme.palette.grey200.main}`,
      outlineOffset: '2px',
    },
  };
}

function buildTextLinkTabletStyles(theme: Theme): LinkStyle {
  return {
    [theme.breakpoints.between('md', 'xl')]: {
      fontSize: '1.125rem',
      fontWeight: '600',
      lineHeight: 'normal',
    },
  };
}

const textLinkStyles: (theme: Theme) => LinkStyle = cacheByTheme(buildTextLinkStyles);

const textLinkTabletStyles: (theme: Theme) => LinkStyle = cacheByTheme(buildTextLinkTabletStyles);

export function textLinkTypography(theme: Theme, responsive: boolean): LinkStyle[] {
  const tablet: LinkStyle[] = responsive ? [textLinkTabletStyles(theme)] : [];
  return [textLinkStyles(theme), ...tablet];
}
