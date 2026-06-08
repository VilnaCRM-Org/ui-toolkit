import * as publicComponents from '../../src/components';

const expectedPublicExports: string[] = [
  'AuthSkeleton',
  'crmBreakpointValues',
  'crmBreakpointsTheme',
  'crmColorTheme',
  'heightBreakpoints',
  'sharedPalette',
  'UiBackToMain',
  'UiBreakpoints',
  'UiButton',
  'UiCardList',
  'UiCheckbox',
  'UiColorTheme',
  'UiContainer',
  'UiFooter',
  'UiForm',
  'UiImage',
  'UiInput',
  'Layout',
  'UiLink',
  'UiSkeletonBlock',
  'UiSkeletonButton',
  'UiSkeletonInput',
  'UiSkeletonText',
  'UiTextFieldForm',
  'UiToolbar',
  'UiTooltip',
  'UiTypography',
  'websiteBreakpointValues',
  'websiteBreakpointsTheme',
  'websiteColorTheme',
];

describe('components index', () => {
  it('exports the expected public surface', () => {
    expect(Object.keys(publicComponents).sort()).toEqual([...expectedPublicExports].sort());
  });

  it('re-exports the shared theme modules and components', () => {
    expect(publicComponents.AuthSkeleton).toBeDefined();
    expect(publicComponents.UiBreakpoints.breakpoints.values.sm).toBe(640);
    expect(publicComponents.heightBreakpoints.compact).toBe(550);
    expect(publicComponents.crmBreakpointsTheme.breakpoints.values.sm).toBe(480);
    expect(publicComponents.crmColorTheme.palette.primary.main).toBe('#1EAEFF');
    expect(publicComponents.Layout).toBeDefined();
    expect(publicComponents.UiCardList).toBeDefined();
    expect(publicComponents.UiFooter).toBeDefined();
    expect(publicComponents.UiBackToMain).toBeDefined();
    expect(publicComponents.UiColorTheme.palette.primary.main).toBe('#1EAEFF');
    expect(publicComponents.UiButton).toBeDefined();
    expect(publicComponents.UiSkeletonBlock).toBeDefined();
    expect(publicComponents.UiTooltip).toBeDefined();
  });
});
