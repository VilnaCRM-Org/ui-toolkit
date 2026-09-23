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

type Metrics = readonly [fontWeight: string, fontSize: string, lineHeight: string];

function textVariant(metrics: Metrics, color: string, fontFamily: string): CSSProperties {
  const [fontWeight, fontSize, lineHeight] = metrics;
  return { fontWeight, fontSize, lineHeight, color, fontFamily };
}

function labelVariants(palette: Palette): TypographyVariantsOptions {
  return {
    medium16: textVariant(['500', '1rem', '1.125rem'], palette.grey300.main, fontFamilies.inter),
    medium15: textVariant(
      ['500', '0.9375rem', '1.125rem'],
      palette.grey250.main,
      fontFamilies.golos
    ),
    medium14: textVariant(
      ['500', '0.875rem', '1.125rem'],
      palette.grey200.main,
      fontFamilies.inter
    ),
    regular16: textVariant(['500', '1rem', '1.125rem'], palette.grey300.main, fontFamilies.golos),
  };
}

function bodyVariants(palette: Palette): TypographyVariantsOptions {
  const ink: string = palette.darkPrimary.main;
  return {
    bodyText18: textVariant(['400', '1.125rem', '1.875rem'], ink, fontFamilies.golos),
    bodyText16: textVariant(['400', '1rem', '1.625rem'], ink, fontFamilies.golos),
    mobileText: textVariant(['400', '0.9375rem', '1.563rem'], ink, fontFamilies.golos),
  };
}

function displayVariants(palette: Palette): TypographyVariantsOptions {
  return {
    bold22: textVariant(['700', '1.375rem', 'normal'], palette.grey250.main, fontFamilies.golos),
    demi18: textVariant(
      ['600', '1.125rem', 'normal'],
      palette.darkPrimary.main,
      fontFamilies.golos
    ),
    button: textVariant(['600', '1.125rem', 'normal'], palette.white.main, fontFamilies.golos),
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
