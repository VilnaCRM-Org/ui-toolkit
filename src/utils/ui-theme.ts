import { createTheme, useTheme } from '@mui/material';
import type { Palette, Theme, ThemeOptions } from '@mui/material';
import type { TypographyVariantsOptions } from '@mui/material/styles';

import { crmBreakpointValues, websiteBreakpointValues } from '@/components/ui-breakpoints';
import { sharedPalette } from '@/components/ui-color-theme';

import { cacheByTheme, isPlainObject, mergeOptions, type OptionsRecord } from './theme-options';
import { uiTypographyOptions, uiTypographyVariantMapping } from './ui-typography-options';

export { cacheByTheme, mergeOptions, type OptionsRecord } from './theme-options';

export type UiThemeVariant = 'website' | 'crm';

export interface UiThemeOptions extends ThemeOptions {
  variant?: UiThemeVariant | undefined;
}

type TypographyInput = ThemeOptions['typography'];

const breakpointValues: Record<UiThemeVariant, Readonly<Record<string, number>>> = {
  website: websiteBreakpointValues,
  crm: crmBreakpointValues,
};

function resolveTypography(input: TypographyInput, palette: Palette): OptionsRecord {
  return typeof input === 'function' ? { ...input(palette) } : { ...input };
}

function composeTypography(
  overrides: TypographyInput
): (palette: Palette) => TypographyVariantsOptions {
  return (palette: Palette): TypographyVariantsOptions =>
    mergeOptions(
      { ...uiTypographyOptions(palette) },
      resolveTypography(overrides, palette)
    ) as TypographyVariantsOptions;
}

function baseOptions(variant: UiThemeVariant): OptionsRecord {
  return {
    breakpoints: { values: { ...breakpointValues[variant] } },
    palette: {
      ...sharedPalette,
      primary: { ...sharedPalette.primary, contrastText: sharedPalette.white.main },
    },
    components: {
      MuiTypography: { defaultProps: { variantMapping: uiTypographyVariantMapping } },
    },
  };
}

export function createUiTheme(options: UiThemeOptions = {}): Theme {
  const { variant = 'website', typography, ...rest } = options;
  const merged: OptionsRecord = mergeOptions(baseOptions(variant), rest as OptionsRecord);
  return createTheme({ ...merged, typography: composeTypography(typography) } as ThemeOptions);
}

const uiPaletteKeys: string[] = Object.keys(sharedPalette);
const uiTypographyKeys: string[] = Object.keys(uiTypographyVariantMapping);

function hasUiTokens(theme: Theme): boolean {
  const palette: OptionsRecord = theme.palette as unknown as OptionsRecord;
  const typography: OptionsRecord = theme.typography as unknown as OptionsRecord;
  return (
    uiPaletteKeys.every(
      key => isPlainObject(palette[key]) && typeof palette[key].main === 'string'
    ) && uiTypographyKeys.every(key => isPlainObject(typography[key]))
  );
}

export const uiTheme: Theme = createUiTheme();

export const isUiTheme: (theme: Theme) => boolean = cacheByTheme(hasUiTokens);

export function resolveUiTheme(theme: Theme): Theme {
  return isUiTheme(theme) ? theme : uiTheme;
}

export function useUiTheme(): Theme {
  return resolveUiTheme(useTheme());
}
