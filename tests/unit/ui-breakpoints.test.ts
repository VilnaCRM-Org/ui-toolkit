import UiBreakpoints, {
  crmBreakpointValues,
  crmBreakpointsTheme,
  heightBreakpoints,
  websiteBreakpointValues,
  websiteBreakpointsTheme,
} from '../../src/components/ui-breakpoints';

describe('UiBreakpoints', () => {
  it('defines the shared breakpoint values', () => {
    expect(UiBreakpoints.breakpoints.values).toEqual(websiteBreakpointValues);
  });

  it('builds media queries from the custom breakpoint map', () => {
    expect(UiBreakpoints.breakpoints.up('sm')).toBe('@media (min-width:640px)');
    expect(UiBreakpoints.breakpoints.up('xl')).toBe('@media (min-width:1440px)');
  });

  it('exports CRM height breakpoints for shared consumers', () => {
    expect(heightBreakpoints).toEqual({
      compact: 550,
      medium: 700,
    });
  });

  it('exports explicit website and CRM breakpoint presets', () => {
    expect(websiteBreakpointsTheme.breakpoints.values).toEqual(websiteBreakpointValues);
    expect(crmBreakpointsTheme.breakpoints.values).toEqual(crmBreakpointValues);
    expect(crmBreakpointValues).toEqual({
      xs: 320,
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1440,
    });
  });
});
