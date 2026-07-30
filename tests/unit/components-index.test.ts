import * as publicComponents from '../../src/components';
import type { IntegrationLogo, UiIntegrationCardProps } from '../../src/components';

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
  'UiCalendarMultiSelect',
  'UiCardList',
  'UiCheckbox',
  'UiColorTheme',
  'UiContainer',
  'UiFileUploadInput',
  'UiFooter',
  'UiForm',
  'UiImage',
  'UiInput',
  'UiIntegrationCard',
  'UiItemRow',
  'UiItemsList',
  'Layout',
  'UiLink',
  'UiMultiSelect',
  'UiPagination',
  'UiProfileSelectCard',
  'UiRadioGroup',
  'UiSearchInput',
  'UiSelectWithSearch',
  'UiSkeletonBlock',
  'UiSkeletonButton',
  'UiSkeletonInput',
  'UiSkeletonText',
  'UiTaskCard',
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
    const byName: (a: string, b: string) => number = (a, b) => a.localeCompare(b);
    expect(Object.keys(publicComponents).sort(byName)).toEqual(
      [...expectedPublicExports].sort(byName)
    );
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
    expect(publicComponents.UiTaskCard).toBeDefined();
    expect(publicComponents.UiIntegrationCard).toBeDefined();
  });

  // `UiIntegrationCardProps` and `IntegrationLogo` are type-only exports, so the
  // runtime key sweep above cannot see them. Binding them here is what makes the
  // barrel's type surface part of the drift guard: dropping either from
  // `src/components/index.ts` fails the type-check rather than passing silently.
  it('exports the integration-card prop types from the barrel', () => {
    const logo: IntegrationLogo = { src: '/hubspot.png', width: 139, height: 40 };
    const props: UiIntegrationCardProps = { name: 'Hubspot', logo };

    expect(props.logo).toBe(logo);
    expect(props.name).toBe('Hubspot');
  });
});
