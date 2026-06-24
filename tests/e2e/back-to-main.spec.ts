import { test, expect } from '@playwright/test';

import { gotoStory } from './utils';

test.describe('UiBackToMain navigation link', () => {
  test('renders an accessible back link to the default destination', async ({ page }) => {
    await gotoStory(page, 'uicomponents-uibacktomain--default');

    const link = page.getByRole('link', { name: 'Back to main' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/');
  });

  test('points at a custom destination', async ({ page }) => {
    await gotoStory(page, 'uicomponents-uibacktomain--custom-destination');

    await expect(page.getByRole('link', { name: 'Back to main' })).toHaveAttribute(
      'href',
      '/dashboard'
    );
  });

  test('uses a custom visible label as its accessible name', async ({ page }) => {
    await gotoStory(page, 'uicomponents-uibacktomain--custom-label');

    await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
  });
});
