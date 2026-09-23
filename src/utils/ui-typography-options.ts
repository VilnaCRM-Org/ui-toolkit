import type { Palette } from '@mui/material';
import type { TypographyVariantsOptions } from '@mui/material/styles';
import type { CSSProperties } from 'react';

import { fontFamilies } from './font-tokens';

export const uiTypographyVariantMapping: Record<string, string> = {
  medium16: 'p',
  medium15: 'p',
  medium14: 'p',
  regular16: 'p',
  bodyText18: 'p',
  bodyText16: 'p',
  bold22: 'p',
  demi18: 'p',
  button: 'p',
  mobileText: 'p',
};

function headingStyles(palette: Palette): CSSProperties {
  return {
    color: palette.darkPrimary.main,
    fontWeight: '700',
    lineHeight: 'normal',
    fontFamily: fontFamilies.golos,
    letterSpacing: 'normal',
  };
}

function headingVariants(palette: Palette): TypographyVariantsOptions {
  const hStyles: CSSProperties = headingStyles(palette);
  return {
    h1: { ...hStyles, fontSize: '3.5rem' },
    h2: { ...hStyles, fontSize: '2.875rem' },
    h3: { ...hStyles, fontSize: '2.25rem', fontWeight: '600' },
    h4: { ...hStyles, color: '#484848', fontSize: '1.875rem', fontWeight: '600' },
    h5: { ...hStyles, fontSize: '1.75rem' },
    h6: { ...hStyles, fontSize: '1.375rem' },
  };
}

function labelVariants(palette: Palette): TypographyVariantsOptions {
  return {
    medium16: {
      fontFamily: fontFamilies.inter,
      fontWeight: '500',
      fontSize: '1rem',
      lineHeight: '1.125rem',
      color: palette.grey300.main,
    },
    medium15: {
      fontFamily: fontFamilies.golos,
      fontWeight: '500',
      fontSize: '0.9375rem',
      lineHeight: '1.125rem',
      color: palette.grey250.main,
    },
    medium14: {
      fontWeight: '500',
      fontSize: '0.875rem',
      lineHeight: '1.125rem',
      color: palette.grey200.main,
      fontFamily: fontFamilies.inter,
    },
    regular16: {
      fontWeight: '500',
      fontSize: '1rem',
      lineHeight: '1.125rem',
      color: palette.grey300.main,
      fontFamily: fontFamilies.golos,
    },
  };
}

function bodyVariants(palette: Palette): TypographyVariantsOptions {
  return {
    bodyText18: {
      fontWeight: '400',
      fontSize: '1.125rem',
      lineHeight: '1.875rem',
      color: palette.darkPrimary.main,
      fontFamily: fontFamilies.golos,
    },
    bodyText16: {
      fontWeight: '400',
      fontSize: '1rem',
      lineHeight: '1.625rem',
      color: palette.darkPrimary.main,
      fontFamily: fontFamilies.golos,
    },
    mobileText: {
      fontWeight: '400',
      fontSize: '0.9375rem',
      lineHeight: '1.563rem',
      color: palette.darkPrimary.main,
      fontFamily: fontFamilies.golos,
    },
  };
}

function displayVariants(palette: Palette): TypographyVariantsOptions {
  return {
    bold22: {
      fontWeight: '700',
      fontSize: '1.375rem',
      lineHeight: 'normal',
      color: palette.grey250.main,
      fontFamily: fontFamilies.golos,
    },
    demi18: {
      fontWeight: '600',
      fontSize: '1.125rem',
      lineHeight: 'normal',
      color: palette.darkPrimary.main,
      fontFamily: fontFamilies.golos,
    },
    button: {
      fontWeight: '600',
      fontSize: '1.125rem',
      lineHeight: 'normal',
      color: palette.white.main,
      fontFamily: fontFamilies.golos,
    },
  };
}

export function uiTypographyOptions(palette: Palette): TypographyVariantsOptions {
  return {
    fontFamily: fontFamilies.golos,
    ...headingVariants(palette),
    ...labelVariants(palette),
    ...bodyVariants(palette),
    ...displayVariants(palette),
  };
}
