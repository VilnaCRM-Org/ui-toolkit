import * as publicComponents from '../../src/components';

const expectedPublicExports: string[] = [
  'Layout',
  'UiBreakpoints',
  'UiButton',
  'UiCardList',
  'UiCheckbox',
  'UiColorTheme',
  'UiFooter',
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
    expect(publicComponents.UiButton).not.toBeNull();
    expect(
      typeof publicComponents.UiButton === 'function' ||
        typeof publicComponents.UiButton === 'object'
    ).toBe(true);
    expect(publicComponents.UiTooltip).not.toBeNull();
    expect(
      typeof publicComponents.UiTooltip === 'function' ||
        typeof publicComponents.UiTooltip === 'object'
    ).toBe(true);
  });
});
