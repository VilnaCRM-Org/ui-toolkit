import { ThemeProvider, createTheme, type Theme } from '@mui/material';
import { renderHook } from '@testing-library/react';
import React from 'react';

import { crmBreakpointValues, websiteBreakpointValues } from '../../src/components/ui-breakpoints';
import { sharedPalette } from '../../src/components/ui-color-theme';
import { fontFamilies } from '../../src/utils/font-tokens';
import {
  cacheByTheme,
  createUiTheme,
  isUiTheme,
  mergeOptions,
  resolveUiTheme,
  uiTheme,
  useUiTheme,
  type UiThemeOptions,
} from '../../src/utils/ui-theme';
import { uiTypographyVariantMapping } from '../../src/utils/ui-typography-options';

const RED: string = '#ff0000';

function themeFromHook(wrapperTheme?: Theme): Theme {
  const wrapper = wrapperTheme
    ? ({ children }: { children: React.ReactNode }): React.ReactElement => (
        <ThemeProvider theme={wrapperTheme}>{children}</ThemeProvider>
      )
    : undefined;
  return renderHook(() => useUiTheme(), { wrapper }).result.current;
}

describe('createUiTheme', () => {
  it('carries every sharedPalette token and a white label on the brand blue', () => {
    Object.entries(sharedPalette).forEach(([token, colour]) => {
      expect(uiTheme.palette[token as keyof typeof sharedPalette].main).toBe(colour.main);
    });
    expect(uiTheme.palette.primary.contrastText).toBe(sharedPalette.white.main);
  });

  it('uses the website breakpoints unless the crm variant is asked for', () => {
    expect(uiTheme.breakpoints.values).toEqual(websiteBreakpointValues);
    expect(createUiTheme({ variant: 'website' }).breakpoints.values).toEqual(
      websiteBreakpointValues
    );
    expect(createUiTheme({ variant: 'crm' }).breakpoints.values).toEqual(crmBreakpointValues);
  });

  it('ships the toolkit typography and the paragraph variant mapping', () => {
    expect(uiTheme.typography.fontFamily).toBe(fontFamilies.golos);
    expect(uiTheme.typography.bodyText18).toMatchObject({
      fontSize: '1.125rem',
      color: sharedPalette.darkPrimary.main,
    });
    expect(uiTheme.components?.MuiTypography?.defaultProps?.variantMapping).toEqual(
      uiTypographyVariantMapping
    );
  });

  it('deep-merges a palette override over the toolkit tokens', () => {
    const theme: Theme = createUiTheme({ palette: { primary: { main: RED } } });

    expect(theme.palette.primary.main).toBe(RED);
    expect(theme.palette.primary.contrastText).toBe(sharedPalette.white.main);
    expect(theme.palette.brandGray.main).toBe(sharedPalette.brandGray.main);
  });

  it('derives the typography colours from the overridden palette', () => {
    const theme: Theme = createUiTheme({
      palette: { darkPrimary: { main: RED } } as UiThemeOptions['palette'],
    });

    expect(theme.typography.h1.color).toBe(RED);
  });

  it('merges a typography object override into the toolkit variants', () => {
    const theme: Theme = createUiTheme({ typography: { h1: { fontSize: '9rem' } } });

    expect(theme.typography.h1).toMatchObject({
      fontSize: '9rem',
      color: sharedPalette.darkPrimary.main,
    });
    expect(theme.typography.medium16).toBeDefined();
  });

  it('merges a typography function override with the resolved palette', () => {
    const theme: Theme = createUiTheme({
      typography: palette => ({ h2: { color: palette.error.main } }),
    });

    expect(theme.typography.h2).toMatchObject({
      color: sharedPalette.error.main,
      fontSize: '2.875rem',
    });
  });

  it('ignores undefined overrides and replaces non-object values', () => {
    const theme: Theme = createUiTheme({ palette: undefined, spacing: 4 });

    expect(theme.palette.brandGray.main).toBe(sharedPalette.brandGray.main);
    expect(theme.spacing(2)).toBe('8px');
  });
});

describe('mergeOptions', () => {
  it('keeps base key order, overrides in place and appends new keys', () => {
    const merged = mergeOptions(
      { a: { x: 1, y: 2 }, b: 1, c: [1, 2] },
      { c: [3], a: { y: 3, z: 4 }, d: 5, b: undefined }
    );

    expect(merged).toEqual({ a: { x: 1, y: 3, z: 4 }, b: 1, c: [3], d: 5 });
    expect(Object.keys(merged)).toEqual(['a', 'b', 'c', 'd']);
    expect(Object.keys(merged.a as object)).toEqual(['x', 'y', 'z']);
  });

  it('replaces a plain object with a class instance instead of merging into it', () => {
    const date: Date = new Date(0);

    expect(mergeOptions({ a: { x: 1 } }, { a: date }).a).toBe(date);
    expect(mergeOptions({ a: date }, { a: { x: 1 } }).a).toEqual({ x: 1 });
    expect(mergeOptions({ a: null }, { a: { x: 1 } }).a).toEqual({ x: 1 });
  });
});

describe('isUiTheme and resolveUiTheme', () => {
  it('recognises a theme that carries the toolkit palette and typography', () => {
    expect(isUiTheme(uiTheme)).toBe(true);
    expect(isUiTheme(createUiTheme({ palette: { primary: { main: RED } } }))).toBe(true);
    expect(isUiTheme(createTheme(uiTheme, { palette: { primary: { main: RED } } }))).toBe(true);
  });

  it('rejects a stock theme, a palette-only theme and a theme missing one token', () => {
    const paletteOnly: Theme = createTheme({ palette: { ...sharedPalette } });
    const missingToken: Theme = createUiTheme();
    Reflect.deleteProperty(missingToken.palette, 'brandGray');
    const brokenToken: Theme = createUiTheme();
    Reflect.set(brokenToken.palette, 'grey400', { main: 7 });
    const missingVariant: Theme = createUiTheme();
    Reflect.deleteProperty(missingVariant.typography, 'bodyText16');

    expect(isUiTheme(createTheme())).toBe(false);
    expect(isUiTheme(paletteOnly)).toBe(false);
    expect(isUiTheme(missingToken)).toBe(false);
    expect(isUiTheme(brokenToken)).toBe(false);
    expect(isUiTheme(missingVariant)).toBe(false);
  });

  it('keeps a toolkit theme and falls back to uiTheme for anything else', () => {
    const custom: Theme = createUiTheme({ palette: { primary: { main: RED } } });

    expect(resolveUiTheme(custom)).toBe(custom);
    expect(resolveUiTheme(createTheme())).toBe(uiTheme);
  });
});

describe('useUiTheme', () => {
  it('returns uiTheme with no provider', () => {
    expect(themeFromHook()).toBe(uiTheme);
  });

  it('returns the surrounding toolkit theme', () => {
    const custom: Theme = createUiTheme({ variant: 'crm' });

    expect(themeFromHook(custom)).toBe(custom);
  });

  it('ignores a surrounding theme that is not a toolkit theme', () => {
    expect(themeFromHook(createTheme({ palette: { primary: { main: RED } } }))).toBe(uiTheme);
  });
});

describe('cacheByTheme', () => {
  it('builds once per theme and separately for each theme', () => {
    const build = jest.fn((theme: Theme) => ({ primary: theme.palette.primary.main }));
    const cached = cacheByTheme(build);
    const other: Theme = createUiTheme({ palette: { primary: { main: RED } } });

    const first = cached(uiTheme);

    expect(cached(uiTheme)).toBe(first);
    expect(cached(other)).toEqual({ primary: RED });
    expect(build).toHaveBeenCalledTimes(2);
  });
});
