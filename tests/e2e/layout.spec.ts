import { test, expect } from '@playwright/test';

import { gotoStory } from './utils';

test.describe('Layout landmarks and metadata', () => {
  test('exposes banner, main and contentinfo landmarks with a single h1', async ({ page }) => {
    await gotoStory(page, 'uicomponents-layout--default');

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Vilna Toolkit' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  });

  test('sets the document title and meta description from props', async ({ page }) => {
    await gotoStory(page, 'uicomponents-layout--default');

    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'The composed toolkit layout demo.'
    );
    await expect.poll(() => page.title()).toBe('Dashboard - VilnaCRM');
  });
});
