import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

type LinkStyle = SystemStyleObject<Theme>;

export const accessibleLinkPalette = {
  rest: '#0074B5',
  hover: '#00588A',
} as const;

export type LinkAppearance = {
  tone: 'brand' | 'accessible' | 'inherit';
  underline: 'always' | 'hover' | 'none';
  responsiveSize: boolean;
  appearance: 'default' | 'text';
};

export const restUnderlineByAppearance: Record<
  LinkAppearance['appearance'],
  LinkAppearance['underline']
> = {
  default: 'always',
  text: 'none',
};

const accessibleTone: LinkStyle = {
  color: accessibleLinkPalette.rest,
  '&:hover': { color: accessibleLinkPalette.hover },
  '&:active': { color: accessibleLinkPalette.hover },
};

const underlineStyles: Record<LinkAppearance['underline'], LinkStyle> = {
  always: { textDecoration: 'underline' },
  hover: { textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
  none: { textDecoration: 'none' },
};

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

const toneKeys: readonly string[] = ['color', '&:hover', '&:active'];

function keepsBaseMediaRules(appearance: LinkAppearance): boolean {
  return appearance.responsiveSize && appearance.appearance === 'default';
}

function isDroppedKey(key: string, appearance: LinkAppearance): boolean {
  const toneDropped: boolean = appearance.tone === 'inherit' && toneKeys.includes(key);
  return toneDropped || (!keepsBaseMediaRules(appearance) && key.startsWith('@media'));
}

function baseStyles(theme: Theme, appearance: LinkAppearance): LinkStyle {
  const base: LinkStyle = linkStyles(theme);
  if (appearance.tone !== 'inherit' && keepsBaseMediaRules(appearance)) {
    return base;
  }
  return Object.fromEntries(
    Object.entries(base as Record<string, unknown>).filter(
      ([key]: [string, unknown]): boolean => !isDroppedKey(key, appearance)
    )
  ) as LinkStyle;
}

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

function typographyStyles(theme: Theme, appearance: LinkAppearance): LinkStyle[] {
  if (appearance.appearance === 'default') {
    return [];
  }
  const tablet: LinkStyle[] = appearance.responsiveSize ? [textLinkTabletStyles(theme)] : [];
  return [textLinkStyles(theme), ...tablet];
}

function consumerSxArray(sx: SxProps<Theme> | undefined): LinkStyle[] {
  if (sx === undefined) {
    return [];
  }
  return (Array.isArray(sx) ? sx : [sx]) as LinkStyle[];
}

function appearanceStyles(appearance: LinkAppearance): LinkStyle[] {
  const tone: LinkStyle[] = appearance.tone === 'accessible' ? [accessibleTone] : [];
  return [...tone, underlineStyles[appearance.underline]];
}

export function linkSx(
  theme: Theme,
  appearance: LinkAppearance,
  sx: SxProps<Theme> | undefined
): SxProps<Theme> {
  return [
    baseStyles(theme, appearance),
    ...typographyStyles(theme, appearance),
    ...appearanceStyles(appearance),
    ...consumerSxArray(sx),
  ];
}
