import UiBreakpoints from '../../src/components/UiBreakpoints';

describe('UiBreakpoints', () => {
  it('defines the shared breakpoint values', () => {
    expect(UiBreakpoints.breakpoints.values).toEqual({
      xs: 375,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1440,
    });
  });

  it('builds media queries from the custom breakpoint map', () => {
    expect(UiBreakpoints.breakpoints.up('sm')).toBe('@media (min-width:640px)');
    expect(UiBreakpoints.breakpoints.up('xl')).toBe('@media (min-width:1440px)');
  });
});
