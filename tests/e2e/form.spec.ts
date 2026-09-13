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

  test('keeps submit aria-disabled with an in-button spinner while submitting', async ({
    page,
  }) => {
    await gotoStory(page, 'uicomponents-uiform--submitting');

    // UiButton's busy contract: `aria-disabled` rather than native `disabled`
    // (so focus is not dropped mid-fetch), a decorative arc inside the button,
    // and the busy state spoken from the polite status region once it has
    // lasted long enough to be worth announcing.
    const button = page.getByRole('button');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(button).toHaveJSProperty('disabled', false);
    await expect(button.getByRole('progressbar', { includeHidden: true })).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText('Завантаження');
  });

  test('disables submit when submission is explicitly disabled', async ({ page }) => {
    await gotoStory(page, 'uicomponents-uiform--submit-disabled');

    await expect(page.getByRole('button', { name: 'Sign in' })).toBeDisabled();
  });
});
