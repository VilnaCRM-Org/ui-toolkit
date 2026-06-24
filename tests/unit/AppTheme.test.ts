import AppTheme from '../../src/components/app-theme';
import UiBreakpoints from '../../src/components/ui-breakpoints';
import UiColorTheme from '../../src/components/ui-color-theme';

describe('AppTheme', () => {
  it('reuses the shared breakpoints and palette', () => {
    expect(AppTheme.breakpoints.values).toEqual(UiBreakpoints.breakpoints.values);
    expect(AppTheme.palette.primary.main).toBe(UiColorTheme.palette.primary.main);
    expect(AppTheme.palette.textLinkHover.main).toBe(UiColorTheme.palette.textLinkHover.main);
  });

  it('configures responsive container spacing', () => {
    expect(AppTheme.components?.MuiContainer?.styleOverrides?.root).toMatchObject({
      '@media (min-width: 23.438rem)': {
        padding: '0 2rem',
      },
      '@media (max-width: 26.563rem)': {
        padding: '0 0.9375rem',
      },
      '@media (min-width: 64rem)': {
        width: '100%',
        maxWidth: '78.375rem',
        paddingLeft: '2rem',
        paddingRight: '2rem',
      },
    });
  });
});
