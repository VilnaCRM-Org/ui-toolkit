import * as publicComponents from '../../src/components';
import type {
  ActionIconName,
  IntegrationLogo,
  UiActionIconBarAction,
  UiActionIconBarProps,
  UiFilterChipProps,
  UiIntegrationCardProps,
  UiNotificationBadgeProps,
  UiPaymentOptionCardProps,
  UiPinInputProps,
  UiStatusBadgeProps,
} from '../../src/components';

const expectedPublicExports: string[] = [
  'AuthSkeleton',
  'crmBreakpointValues',
  'crmBreakpointsTheme',
  'crmColorTheme',
  'heightBreakpoints',
  'sharedPalette',
  'UiActionIconBar',
  'UiBackToMain',
  'UiBreakpoints',
  'UiButton',
  'UiCalendarMultiSelect',
  'UiCardList',
  'UiCheckbox',
  'UiColorTheme',
  'UiContainer',
  'UiFileUploadInput',
  'UiFilterChip',
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
  'UiNotificationBadge',
  'UiPagination',
  'UiPaymentOptionCard',
  'UiPinInput',
  'UiProfileSelectCard',
  'UiRadioGroup',
  'UiSearchInput',
  'UiSelectWithSearch',
  'UiSkeletonBlock',
  'UiSkeletonButton',
  'UiSkeletonControlText',
  'UiSkeletonImage',
  'UiSkeletonInput',
  'UiSkeletonList',
  'UiSkeletonMenu',
  'UiSkeletonTabBar',
  'UiSkeletonTable',
  'UiSkeletonText',
  'UiSkeletonWidget',
  'UiStatusBadge',
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

  // The same drift guard for the Story 3.5 micro-components: eight type-only
  // exports the runtime key sweep above cannot see. Binding each one to a real
  // value is what makes dropping it from `src/components/index.ts` a type error
  // rather than a silent pass.
  it('exports the filter-chip, pin-input and payment-card prop types', () => {
    const chip: UiFilterChipProps = { label: 'Фільтр:', filterValue: 'клієнт' };
    const pin: UiPinInputProps = { label: 'Код підтвердження', length: 6 };
    const card: UiPaymentOptionCardProps = {
      name: 'LiqPay',
      logo: { src: '/liqpay.png', width: 116, height: 24 },
    };

    expect(chip.filterValue).toBe('клієнт');
    expect(pin.length).toBe(6);
    expect(card.logo.width).toBe(116);
  });

  it('exports the icon-bar, status-badge and notification-badge prop types', () => {
    const icon: ActionIconName = 'trash';
    const action: UiActionIconBarAction = { icon, label: 'Видалити' };
    const bar: UiActionIconBarProps = { label: 'Дії', actions: [action] };
    const status: UiStatusBadgeProps = { label: 'Виконано' };
    const notification: UiNotificationBadgeProps = { count: 3 };

    expect(bar.actions[0]).toBe(action);
    expect(action.icon).toBe('trash');
    expect(status.label).toBe('Виконано');
    expect(notification.count).toBe(3);
  });
});
