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
    const actualExports: string[] = Object.keys(publicComponents).sort((left, right) =>
      left.localeCompare(right)
    );
    const sortedExpectedExports: string[] = [...expectedPublicExports].sort((left, right) =>
      left.localeCompare(right)
    );

    expect(actualExports).toEqual(sortedExpectedExports);
  });

  it('re-exports the shared theme modules and components', () => {
    expect(publicComponents.UiBreakpoints.breakpoints.values.sm).toBe(640);
    expect(publicComponents.UiColorTheme.palette.primary.main).toBe('#1EAEFF');
    expect(publicComponents.UiButton).toBeDefined();
    expect(publicComponents.UiTooltip).toBeDefined();
  });
});
