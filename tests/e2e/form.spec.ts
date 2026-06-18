import { test, expect } from '@playwright/test';

import { gotoStory } from './utils';

test.describe('UiForm accessibility states', () => {
  test('announces the error through a live alert region', async ({ page }) => {
    await gotoStory(page, 'uicomponents-uiform--with-error');

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(/Invalid email or password/);
  });

  test('renders no alert and an enabled submit when there is no error', async ({ page }) => {
    await gotoStory(page, 'uicomponents-uiform--default');

    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  test('disables submit and shows a progressbar while submitting', async ({ page }) => {
    await gotoStory(page, 'uicomponents-uiform--submitting');

    await expect(page.getByRole('button')).toBeDisabled();
    await expect(page.getByRole('progressbar')).toBeVisible();
  });

  test('disables submit when submission is explicitly disabled', async ({ page }) => {
    await gotoStory(page, 'uicomponents-uiform--submit-disabled');

    await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });
});
