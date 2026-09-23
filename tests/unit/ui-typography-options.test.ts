import type { Palette } from '@mui/material';

import { fontFamilies } from '../../src/utils/font-tokens';
import {
  uiTypographyOptions,
  uiTypographyVariantMapping,
} from '../../src/utils/ui-typography-options';

function paletteOf(entries: Record<string, string>): Palette {
  return Object.fromEntries(
    Object.entries(entries).map(([token, main]) => [token, { main }])
  ) as unknown as Palette;
}

const palette: Palette = paletteOf({
  darkPrimary: '#000001',
  grey200: '#000002',
  grey250: '#000003',
  grey300: '#000004',
  white: '#000005',
});

describe('uiTypographyOptions', () => {
  const options = uiTypographyOptions(palette);

  it('sets the Golos base family', () => {
    expect(options.fontFamily).toBe(fontFamilies.golos);
  });

  it('paints the headings from darkPrimary except the fixed h4 ink', () => {
    expect(options.h1).toEqual({
      color: '#000001',
      fontWeight: '700',
      lineHeight: 'normal',
      fontFamily: fontFamilies.golos,
      letterSpacing: 'normal',
      fontSize: '3.5rem',
    });
    expect(options.h2).toMatchObject({ fontSize: '2.875rem', color: '#000001' });
    expect(options.h3).toMatchObject({ fontSize: '2.25rem', fontWeight: '600' });
    expect(options.h4).toMatchObject({ color: '#484848', fontSize: '1.875rem' });
    expect(options.h5).toMatchObject({ fontSize: '1.75rem', fontWeight: '700' });
    expect(options.h6).toMatchObject({ fontSize: '1.375rem', color: '#000001' });
  });

  it.each([
    ['medium16', '#000004', fontFamilies.inter, '1rem'],
    ['medium15', '#000003', fontFamilies.golos, '0.9375rem'],
    ['medium14', '#000002', fontFamilies.inter, '0.875rem'],
    ['regular16', '#000004', fontFamilies.golos, '1rem'],
    ['bodyText18', '#000001', fontFamilies.golos, '1.125rem'],
    ['bodyText16', '#000001', fontFamilies.golos, '1rem'],
    ['mobileText', '#000001', fontFamilies.golos, '0.9375rem'],
    ['bold22', '#000003', fontFamilies.golos, '1.375rem'],
    ['demi18', '#000001', fontFamilies.golos, '1.125rem'],
    ['button', '#000005', fontFamilies.golos, '1.125rem'],
  ] as const)('builds %s from the palette', (variant, color, fontFamily, fontSize) => {
    expect(options[variant]).toMatchObject({ color, fontFamily, fontSize });
  });

  it('maps every custom variant to a paragraph', () => {
    expect(Object.values(uiTypographyVariantMapping)).toEqual(Array(10).fill('p'));
    expect(Object.keys(uiTypographyVariantMapping)).toEqual([
      'medium16',
      'medium15',
      'medium14',
      'regular16',
      'bodyText18',
      'bodyText16',
      'bold22',
      'demi18',
      'button',
      'mobileText',
    ]);
  });
});
