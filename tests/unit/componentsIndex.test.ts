import * as publicComponents from '../../src/components';

const expectedPublicExports: string[] = [
  'UiBreakpoints',
  'UiButton',
  'UiCheckbox',
  'UiColorTheme',
  'UiImage',
  'UiInput',
  'UiLink',
  'UiTextFieldForm',
  'UiToolbar',
  'UiTooltip',
  'UiTypography',
];

describe('components index', () => {
  it('exports the expected public surface', () => {
    expect(Object.keys(publicComponents).sort()).toEqual([...expectedPublicExports].sort());
  });

  it('re-exports the shared theme modules and components', () => {
    expect(publicComponents.UiBreakpoints.breakpoints.values.sm).toBe(640);
    expect(publicComponents.UiColorTheme.palette.primary.main).toBe('#1EAEFF');
    expect(publicComponents.UiButton).toBeDefined();
    expect(publicComponents.UiTooltip).toBeDefined();
  });
});
